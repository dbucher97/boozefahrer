import React from "react";
import PropTypes from "prop-types";

import getWindowDimensions from "../../util/WindowDimensions";
import * as ui from "../ui";

import "./LoginPage.css";

const LoginPage = ({ gamestate, onSubmit, login, setLogin }) => {
  const { width, height } = getWindowDimensions();

  const compileTitle = () => {
    let y = height * 0.2;
    let opacity = 1.0;
    if (gamestate.name !== "login") {
      y = -0.5 * height;
      opacity = 0.0;
    }
    return {
      transform: `translateY(${y}px)`,
      opacity: opacity,
    };
  };

  const compileLoginBox = () => {
    let w = 300;
    const h = height * ui.CARD_REL_HEIGHT * ui.CARD_LOGIN_SCALE;
    const cardW = h / ui.CARD_ASPECT;
    const padding = 40;
    const totalWidth = w + padding + cardW;
    let x = 0.5 * width - totalWidth / 2 + cardW + padding;
    let y = 0.6 * height - h / 2;
    let opacity = 1;
    if (gamestate.name !== "login") {
      y = 1.5 * height;
      opacity = 0.0;
    }
    return {
      transform: `translateX(${x}px) translateY(${y}px)`,
      width: w,
      height: h,
      opacity: opacity,
    };
  };

  return (
    <div>
      <div className="login-title" style={compileTitle()}>
        Boozefahrer
      </div>
      <form
        className="login-container"
        style={compileLoginBox()}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <input
          className="login-item"
          placeholder="Raum"
          type="text"
          name="room"
          onChange={(e) => setLogin({ ...login, room: e.target.value.trim() })}
          disabled={login.waitingForCallback || gamestate.name !== "login"}
          onKeyPress={(e) => (e.key === "Enter" ? onSubmit() : null)}
        />
        <input
          className="login-item"
          placeholder="Name"
          type="text"
          name="name"
          disabled={login.waitingForCallback || gamestate.name !== "login"}
          onChange={(e) => setLogin({ ...login, name: e.target.value.trim() })}
          onKeyPress={(e) => (e.key === "Enter" ? onSubmit() : null)}
        />
        {login.error ? (
          <div className="login-item login-item-errormsg">{login.error}</div>
        ) : null}
        <input
          type="submit"
          value="Go"
          className="login-item login-button"
          disabled={login.waitingForCallback || gamestate.name !== "login"}
        />
      </form>
    </div>
  );
};

LoginPage.propTypes = {
  gamestate: PropTypes.object,
  onSubmit: PropTypes.func,
  login: PropTypes.object,
  setLogin: PropTypes.func,
};

export default LoginPage;
