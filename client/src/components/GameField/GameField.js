import React, { useState } from "react";

import Card from "../Card/Card";
import User from "../User/User";
import useEventListener from "../../util/EventListener";
import { getRowFaces } from "../../util/Pyramid";

/* States
 *
 * IDLE: no further options so far
 * DEALT: needs [rowsPlayed]
 * GIVE: needs [rowsPlayed]
 */

const idleState = { name: "idle", previousState: "" };
const dealtState = {
  name: "dealt",
  previousState: "idle",
  rowsPlayed: 0,
  cardsPlayed: {}
};
const giveState = {
  ...dealtState,
  name: "give",
  previousState: "dealt",
  iPlayedThisRow: {}
};

const GameField = ({ faces, users }) => {
  const [state, setState] = useState({ name: "idle" });

  const handleOnKeyPress = e => {
    if (e.key === " " && state.transition == null) {
      switch (state.name) {
        case "idle":
          setState({
            ...dealtState,
            numUsers: users.length
          });
          break;
        case "dealt":
          if (state.rowsPlayed === 5) {
            setState({
              ...idleState,
              users: users.length
            });
          } else {
            setState({
              ...giveState,
              numUsers: users.length,
              rowsPlayed: state.rowsPlayed,
              previousState: state.name,
              cardsPlayed: state.cardsPlayed
            });
          }
          break;
        case "give":
          // TODO should be done by server
          setState({
            ...dealtState,
            numUsers: users.length,
            rowsPlayed: state.rowsPlayed + 1,
            previousState: state.name,
            cardsPlayed: { ...state.cardsPlayed, ...state.iPlayedThisRow }
          });
          break;
        default:
          setState(idleState);
      }
    }
  };
  useEventListener("keypress", handleOnKeyPress);

  const validatePlay = idx => {
    const rowFaces = getRowFaces(state.rowsPlayed + 1, faces);
    const myFace = faces[idx];
    return rowFaces.filter(({ face }) => face[0] === myFace[0]);
  };

  const handleOnCardClick = idx => {
    const match = validatePlay(idx);
    if (match.length > 0) {
      const iPlayedThisRow = { ...state.iPlayedThisRow };
      iPlayedThisRow[idx] = { onIdx: match[0].idx };
      setState({
        ...state,
        iPlayedThisRow: iPlayedThisRow
      });
    }
  };

  return (
    <div>
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
      {faces.map((item, idx) => {
        return (
          <Card
            face={item}
            key={idx}
            idx={idx}
            gamestate={state}
            onClick={() => handleOnCardClick(idx)}
          />
        );
      })}
    </div>
  );
};

export default GameField;
