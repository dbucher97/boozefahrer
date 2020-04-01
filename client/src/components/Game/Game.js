import React, { useState, useEffect } from 'react';

import Card from '../Card/Card';
import UserInterface from '../UserInterface/UserInterface';
import LoginPage from '../LoginPage/LoginPage';
import useEventListener from '../../util/EventListener';
import { getRowFaces } from '../../shapes/Pyramid';
import { getMe } from '../../util/User';

import { Render } from '../../Render';
import useWindowDimensions from '../../util/WindowDimensions';

import Pyramid from '../../shapes/Pyramid';

const ENDPOINT = window.location.href.includes('localhost')
  ? 'http://localhost:4001/'
  : window.location.href.includes('10.21.254.18')
  ? 'http://10.21.254.18:4001'
  : 'window.location.href';
const io = require('socket.io-client');

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
const orderedStack = [
  'AS',
  'AC',
  'AD',
  'AH',
  'KS',
  'KC',
  'KD',
  'KH',
  'QS',
  'QC',
  'QD',
  'QH',
  'JS',
  'JC',
  'JD',
  'JH',
  'TS',
  'TC',
  'TD',
  'TH',
  '9S',
  '9C',
  '9D',
  '9H',
  '8S',
  '8C',
  '8D',
  '8H',
  '7S',
  '7C',
  '7D',
  '7H',
  '6S',
  '6C',
  '6D',
  '6H',
  '5S',
  '5C',
  '5D',
  '5H',
  '4S',
  '4C',
  '4D',
  '4H',
  '3S',
  '3C',
  '3D',
  '3H',
  '2S',
  '2C',
  '2D',
  '2H',
];

let socket;
let render;

let me = { name: 'me', disconnected: true };

const Game = () => {
  const window = useWindowDimensions();
  const [state, setState] = useState(loginState);
  const [users, setUsers] = useState([me]);
  const [stack, setStack] = useState(orderedStack);
  const [login, setLogin] = useState({
    room: '',
    name: '',
    // name: Math.random().toString(36).substring(6),
    error: null,
    waitingForCallback: false,
  });
  const [settings, setSettings] = useState({
    shape: { name: 'Pyramid', rows: 5, total: Pyramid.getTotal(5) },
    playerCards: 3,
    lowest: 2,
  });

  if (state.name !== 'login') {
    me = getMe(users, login.name);
    if (!me) me = users[0];
  }
  render = new Render(window, settings, users, me);

  const emit = (msg, payload) => {
    socket.emit(msg, { room: login.room, payload });
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.on('update state', (state) => {
      // console.log(state);
      setState(state);
    });
    socket.on('update users', (users) => setUsers(users));
    socket.on('update stack', (stack) => setStack(stack));
    socket.on('message', (msg) => console.log(msg));
    // debug;
    // socket.emit(
    //   'join',
    //   {
    //     room: login.room,
    //     name: login.name,
    //   },
    //   () => null,
    // );
  }, []);

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
      case 'Enter':
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
    const rowFaces = getRowFaces(state.rowsPlayed + 1, stack);
    const myFace = stack[idx];
    return rowFaces.filter(({ face }) => face[0] === myFace[0]);
  };

  const handleOnCardClick = (idx) => {
    if (me && me.ready) {
      return;
    }
    const match = validatePlay(idx);
    if (match.length > 0) {
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

  const handleOnLoginSubmit = () => {
    if (!login.name || !login.room) {
      const s = !login.name && !login.room ? 'Raum und Name' : !login.name ? 'Name' : 'Raum';
      setLogin({ ...login, error: `Bitte ${s} ausfüllen!` });
    } else {
      socket.emit('join', { name: login.name, room: login.room }, ({ error }) => {
        setLogin({ ...login, error, waitingForCallback: false });
      });
      setLogin({ ...login, waitingForCallback: true });
      setTimeout(() => {
        setLogin({
          ...login,
          waitingForCallback: false,
          error: 'Server antwortet nicht!',
        });
      }, 5000);
    }
  };

  return (
    <div>
      <LoginPage gamestate={state} onSubmit={handleOnLoginSubmit} login={login} setLogin={setLogin} />
      <UserInterface
        users={users}
        render={render}
        state={state}
        me={me}
        settings={settings}
        room={login.room}
        toggleReady={toggleReady}
        busAction={busAction}
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
