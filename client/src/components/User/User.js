import React from 'react';
import PropTypes from 'prop-types';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import * as ui from '../../UIConstants';

import { compileDefaultStyle, addPos } from '../../Render';

import './User.css';

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
  return (
    <div className="user-full-container">
      {[...Array(settings.playerCards).keys()].map((i) => (
        <Placeholder state={state} render={render} isMe={isMe} ridx={i} uidx={uidx} key={i} user={user} />
      ))}
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
