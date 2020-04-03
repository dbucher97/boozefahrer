import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import * as ui from '../../UIConstants';
import { centered, addPos, compileDefaultStyle } from './../../Render';

import './LoginPage.css';
import './../../App.css';

const card3D = require('./../Card/cards/3D.svg');

const LoginPage = ({ state, render, onSubmit, error, disabled }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const [cardVisible, setCardVisible] = useState(false);
  useEffect(() => setTimeout(() => setCardVisible(true), 100), []);

  const visible = state.name === 'login';

  const titleClass = 'login-title' + (visible ? '' : ' login-title-invisible');
  const cardClass = 'login-card' + (visible && cardVisible ? '' : ' login-card-invisible');
  const containerClass = 'login-container' + (visible ? '' : ' login-container-invisible');

  return (
    <div>
      <div className={titleClass}>Boozefahrer</div>
      <img src={card3D} className={cardClass} alt="" />
      <div className={'box-container ' + containerClass}>
        <form
          className="input-container"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(name, room);
          }}
        >
          <input
            type="text"
            placeholder="Raum"
            disabled={disabled}
            onChange={(e) => setRoom(e.target.value.trim())}
          />
          <div className="spacer" />
          <input
            type="text"
            placeholder="Name"
            disabled={disabled}
            onChange={(e) => setName(e.target.value.trim())}
            onKeyPress={(e) => (e.key === 'Enter' ? onSubmit(name, room) : null)}
          />
          <div className="errormsg">{error}</div>
          <input type="submit" value="Go" disabled={disabled} />
        </form>
      </div>
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
