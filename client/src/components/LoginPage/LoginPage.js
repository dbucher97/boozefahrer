import React, { useState } from 'react';
import PropTypes from 'prop-types';

import getWindowDimensions from '../../util/WindowDimensions';
import * as ui from '../../UIConstants';

import './LoginPage.css';

const LoginPage = ({ state, render, onSubmit, error, disabled }) => {
  const { width, height } = getWindowDimensions();
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const compileTitle = () => {
    let y = height * 0.2;
    let opacity = 1.0;
    if (state.name !== 'login') {
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
    if (state.name !== 'login') {
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
          onSubmit(name, room);
        }}
      >
        <input
          className="login-item"
          placeholder="Raum"
          type="text"
          name="room"
          onChange={(e) => setRoom(e.target.value.trim())}
          disabled={disabled}
          onKeyPress={(e) => (e.key === 'Enter' ? onSubmit(name, room) : null)}
        />
        <input
          className="login-item"
          placeholder="Name"
          type="text"
          name="name"
          disabled={disabled}
          onChange={(e) => setName(e.target.value.trim())}
          onKeyPress={(e) => (e.key === 'Enter' ? onSubmit(name, room) : null)}
        />
        {error ? <div className="login-item login-item-errormsg">{error}</div> : null}
        <input type="submit" value="Go" className="login-item login-button" disabled={disabled} />
      </form>
    </div>
  );
};

LoginPage.propTypes = {
  state: PropTypes.object,
  render: PropTypes.object,
  onSubmit: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

export default LoginPage;
