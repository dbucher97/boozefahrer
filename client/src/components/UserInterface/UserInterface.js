import React from 'react';
import PropTypes from 'prop-types';

import User from '../User/User';
import * as ui from '../../UIConstants';

import { addPos } from '../../Render';

const UserInterface = ({ state, render, settings, users, me, toggleReady, room }) => {
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
    const pos = addPos(render.fractional({ x: 0.5, y: state.name === 'idle' ? 0.2 : 0 }), {
      x: 0,
      y: ui.UI_PAD,
    });
    let text;
    if (state.name === 'idle') {
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
    } else {
      return null;
    }
    return render.centeredText(text, 600, { pos, fontSize: state.name === 'idle' ? 48 : 32 });
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
  room: PropTypes.string,
};

export default UserInterface;
