import React from 'react';
import PropTypes from 'prop-types';

import User from '../User/User';
import * as ui from '../../UIConstants';

let render;

const UserInterface = ({ state, renderObject, users, me, toggleReady }) => {
  render = renderObject;
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
          users={mockUsers}
          renderObject={render}
          me={me}
          key={idx}
          idx={idx}
          toggleReady={toggleReady}
        />
      ))}
    </div>
  );
};

UserInterface.propTypes = {
  state: PropTypes.object,
  users: PropTypes.array,
  me: PropTypes.object,
  toggleReady: PropTypes.func,
};

export default UserInterface;
