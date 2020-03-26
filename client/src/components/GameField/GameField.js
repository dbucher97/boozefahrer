import React, { useState, useEffect } from "react";

import Card from "../Card/Card";
import UserInterface from "../UserInterface/UserInterface";
import LoginPage from "../LoginPage/LoginPage";
import useEventListener from "../../util/EventListener";
import { getRowFaces } from "../../util/Pyramid";
import { getMe } from "../../util/User";

const ENDPOINT = "http://10.21.254.18:4001";

const io = require("socket.io-client");

/* States
 *
 * IDLE: no further options so far
 * DEALT: needs [rowsPlayed]
 * GIVE: needs [rowsPlayed]
 */

const loginState = { name: "login", previousState: "" };

let socket;

const GameField = () => {
  const [state, setState] = useState(loginState);
  const [users, setUsers] = useState([{ name: "Me", ready: false }]);
  const [stack, setStack] = useState(["AS"]);
  const [login, setLogin] = useState({
    room: "",
    name: "",
    // name: Math.random().toString(36).substring(6),
    error: null,
    waitingForCallback: false,
  });

  const me = getMe(users, login.name);

  const emit = (msg, payload) => {
    socket.emit(msg, { room: login.room, payload });
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.on("update state", (state) => {
      console.log(state);
      setState(state);
    });
    socket.on("update users", (users) => setUsers(users));
    socket.on("update stack", (stack) => setStack(stack));
    socket.on("message", (msg) => console.log(msg));
    //debug
    // socket.emit(
    //   "join",
    //   {
    //     room: login.room,
    //     name: login.name,
    //   },
    //   () => null
    // );
  }, []);

  const toggleReady = () => {
    if (me && !(state.name === "dealt" && state.previousState === "idle")) {
      me.ready = !me.ready;
      emit("ready");
    }
  };

  // useEffect(() => {
  //   if (state.name === "idle") {
  //     setTimeout(toggleReady, 4000);
  //   }
  // }, [state.name]);
  //

  const handleOnKeyPress = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      toggleReady();
    }
  };
  useEventListener("keypress", handleOnKeyPress);

  const validatePlay = (idx) => {
    const rowFaces = getRowFaces(state.rowsPlayed + 1, stack);
    const myFace = stack[idx];
    return rowFaces.filter(({ face }) => face[0] === myFace[0]);
  };

  const handleOnCardClick = (idx) => {
    const match = validatePlay(idx);
    if (match.length > 0) {
      // if (match.length > 1) {
      //
      // }
      const playedThisRow = { ...state.playedThisRow };
      playedThisRow[idx] = { onIdx: match[0].idx, by: login.name, zIdx: 0 };
      emit("play card", { onIdx: match[0].idx, idx });
      setState({
        ...state,
        playedThisRow: playedThisRow,
      });
    }
  };

  const handleOnLoginSubmit = () => {
    if (!login.name || !login.room) {
      const s =
        !login.name && !login.room
          ? "Raum und Name"
          : !login.name
          ? "Name"
          : "Raum";
      setLogin({ ...login, error: `Bitte ${s} ausfüllen!` });
    } else {
      socket.emit(
        "join",
        { name: login.name, room: login.room },
        ({ error }) => {
          setLogin({ ...login, error, waitingForCallback: false });
        }
      );
      setLogin({ ...login, waitingForCallback: true });
      setTimeout(() => {
        setLogin({
          ...login,
          waitingForCallback: false,
          error: "Server antwortet nicht!",
        });
      }, 5000);
    }
  };

  return (
    <div>
      <LoginPage
        gamestate={state}
        onSubmit={handleOnLoginSubmit}
        login={login}
        setLogin={setLogin}
      />
      <UserInterface
        users={users}
        state={state}
        me={me}
        toggleReady={toggleReady}
      />
      {stack.map((item, idx) => {
        return (
          <Card
            face={item}
            key={idx}
            idx={idx}
            gamestate={state}
            users={users}
            me={me}
            onClick={() => handleOnCardClick(idx)}
          />
        );
      })}
    </div>
  );
};

export default GameField;
