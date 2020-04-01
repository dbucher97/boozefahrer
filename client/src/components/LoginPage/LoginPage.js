import React, { useState } from 'react';
import PropTypes from 'prop-types';

import * as ui from '../../UIConstants';
import { centered, addPos, compileDefaultStyle } from './../../Render';

import './LoginPage.css';
import './../../App.css';

const LoginPage = ({ state, render, onSubmit, error, disabled }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const width = render.cardWidth * 2 * ui.CARD_LOGIN_SCALE;
  const height = render.cardHeight * ui.CARD_LOGIN_SCALE;

  return (
    <div className="login-title" style={{ opacity: state.name === 'login' ? 1 : 0 }}>
      {render.centeredText('Boozefahrer', 1000, {
        pos: addPos(
          render.relative({ x: 0, y: -ui.CARD_LOGIN_SCALE }),
          centered(render.fractional({ x: 0.5, y: 0.5 }), { x: 0, y: 1.328 * 72 }),
          render.fractional({ x: 0, y: state.name === 'login' ? 0 : -1 }),
        ),
        fontSize: 72,
        fontWeight: '700',
      })}
      <div
        className="box-container"
        style={compileDefaultStyle({
          pos: addPos(
            centered(render.fractional({ x: 0.5, y: 0.5 }), {
              x: render.cardWidth * ui.CARD_LOGIN_SCALE,
              y: render.cardHeight * ui.CARD_LOGIN_SCALE,
            }),
            render.fractional({ x: 0, y: state.name === 'login' ? 0 : +1 }),
          ),
          width: width,
          height: height,
          opacity: state.name === 'login' ? 1 : 0,
        })}
      >
        <form
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
            style={compileDefaultStyle({
              pos: { x: ui.UI_PAD / 2, y: ui.UI_PAD / 2 },
              width: width - 10 - ui.UI_PAD,
              height: 30,
            })}
          />
          <input
            type="text"
            placeholder="Name"
            disabled={disabled}
            onChange={(e) => setName(e.target.value.trim())}
            onKeyPress={(e) => (e.key === 'Enter' ? onSubmit(name, room) : null)}
            style={compileDefaultStyle({
              pos: { x: ui.UI_PAD / 2, y: ui.UI_PAD + 30 },
              width: width - 10 - ui.UI_PAD,
              height: 30,
            })}
          />
          <input
            type="submit"
            value="Go"
            disabled={disabled}
            style={compileDefaultStyle({
              pos: { x: ui.UI_PAD / 2, y: height - 30 - ui.UI_PAD / 2 },
              width: width - ui.UI_PAD,
              height: 30,
            })}
          />
          {render.centeredText(error, width - ui.UI_PAD, {
            pos: { x: width / 2, y: height - 50 - ui.UI_PAD },
            fontSize: 10,
          })}
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
