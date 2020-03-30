import React from 'react';
import PropTypes from 'prop-types';

import User from '../User/User';
import * as ui from '../../UIConstants';

const UserInterface = ({ state, render, settings, users, me, toggleReady }) => {
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

  return (
    <div>
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
};

export default UserInterface;
