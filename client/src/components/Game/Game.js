import React, { useState, useEffect } from 'react';

import Card from '../Card/Card';
import UserInterface from '../UserInterface/UserInterface';
import LoginPage from '../LoginPage/LoginPage';
import useEventListener from '../../util/EventListener';
import { getMe } from '../../util/User';

import { Render } from '../../Render';
import useWindowDimensions from '../../util/WindowDimensions';
import { useCardAudio } from '../../util/Sound';

import { getShape } from '../../common/shape';

const ENDPOINT = window.location.href.includes('localhost')
  ? 'http://localhost:4001/'
  : window.location.href.includes('10.21.254')
  ? 'http://10.21.254.18:4001/'
  : window.location.href;

const io = require('socket.io-client');

const fullStack = require('./fullstack');

/* States
 *
 * IDLE: no further options so far
 * DEALT: needs [rowsPlayed]
 * GIVE: needs [rowsPlayed]
 */

const loginState = { name: 'login', previousState: '' };
// const dealtState = {
//   name: 'dealt',
//   previousState: 'idle',
//   rowsPlayed: 0,
//   cardsPlayed: {},
// };
// const idleState = {
//   name: 'idle',
//   previousState: 'login',
// };

let socket;
let render;
let loginTimer;

let me = { name: 'me', disconnected: true };

let timeout;

const Game = () => {
  const win = useWindowDimensions();
  const [state, setState] = useState(loginState);
  const [users, setUsers] = useState([me]);
  const [stack, setStack] = useState(fullStack);
  const [login, setLogin] = useState({
    room: 'Test',
    // name: '',
    name: Math.random().toString(36).substring(6),
    error: null,
    waitingForCallback: false,
  });
  const [settings, setSettings] = useState({
    shape: { name: 'Pyramid', rows: 5, total: getShape('Pyramid').getTotal(5) },
    playerCards: 3,
    lowest: 4,
  });
  const [muted, setMuted] = useState(true);
  const playCardAudio = useCardAudio();

  if (state.name !== 'login') {
    me = getMe(users, login.name);
    if (!me) me = users[0];
  }
  render = new Render(win, settings, users, me);

  const emit = (msg, payload) => {
    socket.emit(msg, { room: login.room, payload });
  };

  useEffect(() => {
    const leave = () => socket.emit('leave');
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, []);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.on('update state', (state) => {
      // console.log(state);
      setState(state);
    });
    socket.on('update users', (users) => setUsers(users));
    socket.on('update stack', (stack) => setStack(stack));
    socket.on('update settings', (settings) => setSettings(settings));
    socket.on('message', (msg) => console.log(msg));
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
        setLogin({ ...login, error: null });
      }
    });
    socket.on('connect_error', () => {
      if (!timeout)
        timeout = setTimeout(() => {
          setState(loginState);
          setLogin({ ...login, error: 'Verbindung unterbrochen!' });
        }, 25000);
    });
    socket.on('reconnect', () => {
      if (state.name !== 'login') {
        socket.emit('rejoin', { room: login.room, name: login.name }, (success) => {
          if (!success) {
            setState(loginState);
            setLogin({ ...login, error: 'Verbindung unterbrochen!' });
          }
        });
      }
    });
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('reconnect');
    };
    // debug;
    // socket.emit(
    //   'join',
    //   {
    //     room: login.room,
    //     name: login.name,
    //   },
    //   () => null,
    // );
    //
  }, [login, state.name]);

  useEffect(() => {
    socket.on('card audio', (i) => (!muted ? playCardAudio(i) : null));
  }, [playCardAudio, muted]);

  const toggleReady = () => {
    if (
      me &&
      !(state.name === 'dealt' && state.previousState === 'idle') &&
      !(state.name === 'who' || state.name === 'bus')
    ) {
      const users_copy = [...users];
      const idx = users_copy.findIndex((user) => user.name === login.name);
      if (idx !== -1) {
        users_copy[idx] = { ...users[idx], ready: !users[idx].ready };
      }
      setUsers(users_copy);
      emit('ready');
    }
  };

  const busAction = (event) => {
    if (me && state.name === 'bus' && me.name === state.busfahrer) {
      setState({ ...state, busstate: 'pause_deal', action: event });
      emit('busaction', event);
    }
  };

  // useEffect(() => {
  //   if (state.name === "idle") {
  //     setTimeout(toggleReady, 4000);
  //   }
  // }, [state.name]);
  //

  const handleOnKeyPress = (e) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        toggleReady();
        break;
      case 'ArrowUp':
      case 'w':
      case 'k':
        busAction('higher');
        break;
      case 'ArrowDown':
      case 's':
      case 'j':
        busAction('lower');
        break;
      case 'ArrowRight':
      case 'd':
      case 'l':
        busAction('equal');
        break;
      default:
        break;
    }
  };
  useEventListener('keydown', handleOnKeyPress);

  const validatePlay = (idx) => {
    const rowFaces = getShape(settings.shape.name).getRowFaces(state.rowsPlayed + 1, stack);
    const myFace = stack[idx];
    return rowFaces.filter(({ face }) => face[0] === myFace[0]);
  };

  const handleOnCardClick = (idx) => {
    if (me && me.ready) {
      return;
    }
    const match = validatePlay(idx);
    if (match.length > 0) {
      if (!muted) playCardAudio();
      let onIdx = match[0].idx;
      let zIndex = 0;
      if (match.length > 1) {
        const detail = match.map(({ idx }) => {
          return {
            idx,
            stacksize: Object.keys(state.playedThisRow).filter(
              (key) => state.playedThisRow[key].onIdx === idx,
            ).length,
          };
        });
        const min = Math.min(...detail.map(({ stacksize }) => stacksize));
        const possibles = detail.filter(({ stacksize }) => stacksize === min);
        onIdx = possibles[Math.floor(Math.random() * possibles.length)].idx;
        zIndex = min + 1;
      }
      const playedThisRow = { ...state.playedThisRow };
      playedThisRow[idx] = { onIdx: onIdx, by: login.name, zIndex };
      emit('play card', { onIdx: onIdx, idx });
      setState({
        ...state,
        playedThisRow: playedThisRow,
      });
    }
  };

  const handleOnLoginSubmit = (name, room) => {
    if (!name || !room) {
      const s = !name && !room ? 'Raum und Name' : !name ? 'Name' : 'Raum';
      setLogin({ ...login, error: `Bitte ${s} ausfüllen!` });
    } else {
      loginTimer = setTimeout(() => {
        setLogin({
          ...login,
          waitingForCallback: false,
          error: 'Server antwortet nicht!',
        });
      }, 5000);
      socket.emit('join', { name, room }, ({ error }) => {
        setLogin({ ...login, name, room, error, waitingForCallback: false });
        if (loginTimer) {
          clearTimeout(loginTimer);
        }
      });
      setLogin({ ...login, name, room, waitingForCallback: true });
    }
  };

  const setAndUpdateSettings = (settings) => {
    setSettings(settings);
    updateSettings(settings);
  };

  const updateSettings = (settings) => {
    if (state.name === 'idle' && !users.map(({ ready }) => ready).reduce((prev, curr) => prev || curr)) {
      emit('settings', settings);
    }
  };

  return (
    <div>
      <LoginPage
        state={state}
        onSubmit={handleOnLoginSubmit}
        error={login.error}
        disabled={login.waitingForCallback || state.name !== 'login'}
      />
      <UserInterface
        users={users}
        render={render}
        state={state}
        myName={me.name}
        settings={settings}
        room={login.room}
        toggleReady={toggleReady}
        busAction={busAction}
        setSettings={setAndUpdateSettings}
      />
      {stack.map((item, idx) => {
        return (
          <Card
            face={item}
            idx={idx}
            key={idx}
            me={me}
            onClick={() => handleOnCardClick(idx)}
            render={render}
            settings={settings}
            state={state}
            users={users}
          />
        );
      })}
    </div>
  );
};

export default Game;
