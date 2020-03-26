import React from "react";
import PropTypes from "prop-types";

import User from "../User/User";
import * as ui from "../ui";

const UserInterface = ({ state, users, me, toggleReady }) => {
  const mockUsers = [
    ...users,
    ...[...Array(ui.MAX_PLAYERS - users.length).keys()].map(() => {
      return {};
    }),
  ];

  return (
    <div>
      {mockUsers.map((user, idx) => (
        <User
          state={state}
          users={mockUsers}
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
