import React, { useState } from "react";

import Card from "../Card/Card";
import useEventListener from "../../util/EventListener";

const GameField = ({ faces, users, advance }) => {
  const [state, setState] = useState({ name: "idle" });

  const initTransitionToDealt = () => {
    const tc = 100;
    for (let i = 0; i < 16; i++) {
      setTimeout(() => {
        setState({
          name: "dealt",
          rowsPlayed: 0,
          transition: { name: "draw", to: i }
        });
      }, i * tc);
    }
    setTimeout(() => {
      setState({ name: "dealt", rowsPlayed: 0 });
    }, 16 * tc);
  };

  const initTransitionFlip = rowsPlayed => {
    const tc = 50;
    for (let i = 0; i < rowsPlayed; i++) {
      setTimeout(() => {
        setState({
          name: "dealt",
          rowsPlayed: rowsPlayed,
          transition: { name: "flip", to: i }
        });
      }, i * tc);
    }
    setTimeout(() => {
      setState({ name: "dealt", rowsPlayed: rowsPlayed });
    }, rowsPlayed * tc);
  };

  const handleOnKeyPress = e => {
    if (e.key === " " && state.transition == null) {
      if (state.name === "idle") {
        initTransitionToDealt();
      } else if (state.name === "dealt") {
        initTransitionFlip(state.rowsPlayed + 1);
        // setState({ name: "dealt", rowsPlayed: state.rowsPlayed + 1 });
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
