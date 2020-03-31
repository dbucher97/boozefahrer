import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import * as ui from '../../UIConstants';

import { compileDefaultStyle, centered, addPos } from '../../Render';

import './User.css';
import './../../App.css';

const Placeholder = ({ state, render, isMe, ridx, uidx, user }) => {
  const noShow = user.disconnected;
  const opacity = noShow ? 0 : 1;
  let scale;
  let pos;

  if (isMe) {
    pos = render.userMeCard(ridx, noShow);
    scale = ui.USER_ME_CARD_SCALE;
  } else {
    pos = render.userCard(uidx, ridx, noShow);
    scale = ui.USER_CARD_SCALE;
  }

  const style = compileDefaultStyle({
    pos: addPos(pos, { x: -4, y: -4 }),
    opacity,
    width: render.cardWidth,
    height: render.cardHeight,
    scale: scale,
  });

  return (
    <div className="placeholder" style={style}>
      <div className="placeholder-inner" />
    </div>
  );
};

Placeholder.propTypes = {
  state: PropTypes.object,
  render: PropTypes.object,
  user: PropTypes.object,
  isMe: PropTypes.bool,
  ridx: PropTypes.number,
  uidx: PropTypes.number,
};

const User = ({ state, settings, render, uidx, user, isMe, toggleReady }) => {
  const compileCheckboxStyle = (pos, size) => {
    return compileDefaultStyle({
      pos: pos,
      height: size,
      width: size,
      rotateX: user.ready ? 0 : 91,
      opacity: user.ready ? 1 : 0,
    });
  };

  const renderUser = () => {
    const noShow = user.disconnected;
    const pos = render.user(uidx, noShow);
    const size = 24;
    const checkboxPos = addPos(
      render.relative({
        x: -settings.playerCards * ui.USER_CARD_SCALE * ui.CARD_SHAPE_X_PAD,
        y: ui.USER_CARD_SCALE / 2,
      }),
      { x: -size - ui.UI_PAD / 2, y: -size / 2 },
    );
    return (
      <div
        className="box-container"
        style={compileDefaultStyle({
          pos,
          width: ui.USER_CARD_WIDTH,
          height: render.cardHeight * ui.USER_CARD_SCALE,
        })}
      >
        <div className="user-container" style={{ opacity: noShow ? 0 : 1 }}>
          <div className="box-inner-container">
            <div className="user-title">{user.name}</div>
          </div>
          <div className="checkbox" style={compileCheckboxStyle(checkboxPos, size)}>
            <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: `${size}px` }} />
          </div>
        </div>
      </div>
    );
  };

  const renderMe = () => {
    const size = 32;
    const noShow = user.disconnected;
    const pos = render.userMe(noShow);
    const checkboxPos = addPos(
      pos,
      render.relative({
        x: ui.CARD_SHAPE_X_PAD * ui.USER_ME_CARD_SCALE + 0.5 * ui.USER_ME_CARD_SCALE,
        y: ui.USER_ME_CARD_SCALE,
      }),
      { x: -size / 2, y: size / 2 + ui.UI_PAD },
    );

    let text;
    if (state.name === 'idle') {
      text = 'Bereit?';
    } else if (state.name === 'dealt' && state.previousState !== 'idle') {
      text = 'Getrunken?';
    } else if (state.name === 'give') {
      text = 'Fertig?';
    } else {
      return null;
    }
    return (
      <div className="user-container" style={{ opacity: noShow ? 0 : 1 }} onClick={toggleReady}>
        <div className="checkbox" style={{ ...compileCheckboxStyle(checkboxPos, size), clickable: true }}>
          <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: `${size}px` }} />
        </div>
        {render.centeredText(text, 200, {
          pos: { x: checkboxPos.x + size / 2, y: checkboxPos.y },
          rotateX: user.ready ? -91 : 0,
          opacity: user.ready ? 0 : 1,
          fontSize: size,
          clickable: true,
        })}
      </div>
    );
  };

  return (
    <div className="user-full-container">
      {[...Array(settings.playerCards).keys()].map((i) => (
        <Placeholder state={state} render={render} isMe={isMe} ridx={i} uidx={uidx} key={i} user={user} />
      ))}
      {isMe ? renderMe() : renderUser()}
    </div>
  );
};

User.propTypes = {
  state: PropTypes.object,
  render: PropTypes.object,
  user: PropTypes.object,
  uidx: PropTypes.number,
  isMe: PropTypes.bool,
  toggleReady: PropTypes.func,
  settings: PropTypes.object,
};

export default User;
