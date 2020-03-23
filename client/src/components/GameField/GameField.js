import React, { useState } from "react";

import Card from "../Card/Card";
import useEventListener from "../../util/EventListener";

/* States
 *
 * IDLE: no further options so far
 * DEALT: needs [rowsPlayed]
 * GIVE: needs [rowsPlayed]
 */

const GameField = ({ faces, users, advance }) => {
  const [state, setState] = useState({ name: "idle" });

  const handleOnKeyPress = e => {
    if (e.key === " " && state.transition == null) {
      switch (state.name) {
        case "idle":
          setState({ name: "dealt", rowsPlayed: 0, previousState: state.name });
          break;
        case "dealt":
          setState({
            name: "give",
            rowsPlayed: state.rowsPlayed,
            previousState: state.name
          });
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
    </div>
  );
};

export default GameField;
