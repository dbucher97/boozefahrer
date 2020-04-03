import React from 'react';
import PropTypes from 'prop-types';

import User from '../User/User';
import BusControl, { BusDisplay } from '../BusControl/BusControl';
import * as ui from '../../UIConstants';

import { addPos } from '../../Render';

const UserInterface = ({ state, render, settings, users, me, toggleReady, busAction, room }) => {
  const midx = Math.max(
    users.findIndex((user) => user === me),
    0,
  );

  const usersCopy = [...users];
  usersCopy.splice(midx, 1);
  users = [users[midx], ...usersCopy];

  const mockUsers = [
    ...users,
    ...[...Array(ui.MAX_PLAYERS - users.length).keys()].map(() => {
      return { disconnected: true };
    }),
  ];

  const statusText = () => {
    let pos = addPos(render.fractional({ x: 0.5, y: 0 }), { x: 0, y: ui.UI_PAD });
    let text;
    let fontSize = 32;
    if (state.name === 'login') {
      fontSize = 48;
    } else if (state.name === 'idle') {
      fontSize = 48;
      pos = addPos(pos, render.fractional({ x: 0, y: 0.15 }));
      text = (
        <span>
          Willkommen in <b>{room}</b>!
        </span>
      );
    } else if (state.name === 'give') {
      text = (
        <span>
          Karten legen! Noch <b>{state.timeLeft}</b> Sekunden
        </span>
      );
    } else if (state.name === 'dealt' && state.previousState !== 'idle') {
      text = (
        <span>
          Schlücke trinken! Noch <b>{state.timeLeft}</b> Sekunden
        </span>
      );
    } else if (state.name === 'who') {
      text = (
        <span>
          Wer muss Busfahren?
          <br />
          {state.users
            .map((name) => <b key={name}>{name}</b>)
            .reduce((prev, curr) => [prev, ' oder ', curr])}
          ?
        </span>
      );
    } else if (state.name === 'bus') {
      fontSize = 48;
      if (state.busfahrer === me.name) {
        text = (
          <span>
            <b>Du</b> fährst Bus!
          </span>
        );
      } else {
        text = (
          <span>
            <b>{state.busfahrer}</b> fährt Bus!
          </span>
        );
      }
    } else {
      return null;
    }
    return render.centeredText(text, render.fractional({ x: 2 / 5, y: 0 }).x, { pos, fontSize: fontSize });
  };

  return (
    <div>
      {statusText()}
      {mockUsers.map((user, idx) => (
        <User
          state={state}
          user={user}
          isMe={user === me}
          settings={settings}
          render={render}
          key={idx}
          uidx={idx - 1}
          toggleReady={toggleReady}
        />
      ))}
      <BusControl
        state={state}
        render={render}
        higher={() => busAction('higher')}
        lower={() => busAction('lower')}
        equal={() => busAction('equal')}
        hide={!(state.name === 'bus' && state.busfahrer === me.name)}
      />
      {state.name === 'bus' && state.busfahrer !== me.name ? (
        <BusDisplay state={state} render={render} />
      ) : null}
    </div>
  );
};

UserInterface.propTypes = {
  state: PropTypes.object,
  users: PropTypes.array,
  render: PropTypes.object,
  settings: PropTypes.object,
  me: PropTypes.object,
  toggleReady: PropTypes.func,
  busAction: PropTypes.func,
  room: PropTypes.string,
};

export default UserInterface;
