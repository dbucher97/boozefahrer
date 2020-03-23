import React, { useState } from "react";

import Card from "../Card/Card";
import User from "../User/User";
import useEventListener from "../../util/EventListener";

/* States
 *
 * IDLE: no further options so far
 * DEALT: needs [rowsPlayed]
 * GIVE: needs [rowsPlayed]
 */

const GameField = ({ faces, users }) => {
  const [state, setState] = useState({ name: "idle" });

  const handleOnKeyPress = e => {
    if (e.key === " " && state.transition == null) {
      switch (state.name) {
        case "idle":
          setState({ name: "dealt", rowsPlayed: 0, previousState: state.name });
          break;
        case "dealt":
          if (state.rowsPlayed == 5) {
            setState({ name: "idle", previousState: state.name });
          } else {
            setState({
              name: "give",
              rowsPlayed: state.rowsPlayed,
              previousState: state.name
            });
          }
          break;
        case "give":
          setState({
            name: "dealt",
            rowsPlayed: state.rowsPlayed + 1,
            previousState: state.name
          });
          break;
      }
    }
  };

  useEventListener("keypress", handleOnKeyPress);

  return (
    <div>
      {faces.map((item, idx) => {
        return (
          <Card
            face={item}
            key={idx}
            idx={idx}
            gamestate={state}
            numCards={faces.length}
          />
        );
      })}
      {users.map((item, idx) => {
        return (
          <User
            idx={idx}
            key={idx}
            user={item}
            total={users.length}
            gamestate={state}
          />
        );
      })}
    </div>
  );
};

export default GameField;
