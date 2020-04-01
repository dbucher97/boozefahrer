import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Cards from './CardLoader';

import './Card.css';
import { getRow, getIdx0, getRowLength } from './../../shapes/Pyramid';
import * as ui from './../../UIConstants';
import { addPos, compileDefaultStyle } from './../../Render';

let render;
let state;
let idx;
let users;
let me;
let settings;
let cardsToUsers;
let cardsToStack;
let cardsInStack;

const renderStack = (pos, idx, startIdx, cardsInStack) => {
  const stackIdx = cardsInStack - (idx - startIdx + 1);
  return {
    elevation: Math.floor(stackIdx / 5) * 10,
    zIndex: stackIdx,
    pos: render.stackCard(pos),
  };
};

const renderShape = () => {
  const row = getRow(idx);
  const idx0 = getIdx0(row);
  let transition;
  if (state.previousState === 'idle') {
    transition = (i) => i * ui.TRANSITION_TIME_DRAW;
  } else {
    transition = (i) => (row - 1 + idx0 - i) * ui.TRANSITION_TIME_FLIP;
  }
  const pos = render.shapeCard(idx);
  return {
    pos: pos,
    flipped: row > state.rowsPlayed,
    delay: transition(idx),
  };
};

const renderUser = () => {
  const i = idx - settings.shape.total;
  const midx = users.findIndex((user) => user === me);
  const uidx = i % users.length;
  const ridx = Math.floor(i / users.length);
  const delay = state.previousState === 'idle' ? 0.05 * idx : 0;
  if (users[uidx].disconnected) {
    return renderStack({ x: ui.STACK_X, y: ui.STACK_Y }, 0, 0, 1);
  } else if (uidx === midx) {
    // Render me
    return {
      scale: ui.USER_ME_CARD_SCALE,
      flipped: false,
      delay: delay,
      clickable: state.name === 'give',
      pos: render.userMeCard(ridx),
    };
  } else {
    // Render others
    const aidx = uidx < midx ? uidx : uidx - 1;
    return {
      scale: ui.USER_CARD_SCALE,
      delay: delay,
      pos: render.userCard(aidx, ridx),
    };
  }
};

const renderDealt = () => {
  if (state.cardsPlayed[idx]) {
    const zIndex = state.cardsPlayed[idx].zIndex + 1;
    idx = state.cardsPlayed[idx].onIdx;
    const style = renderShape();
    return {
      ...style,
      elevation: 20 * zIndex,
      zIndex: zIndex,
      pos: addPos(style.pos, render.relative({ x: 0, y: 0.05 * zIndex })),
    };
  }
  if (idx < cardsToUsers) {
    return renderShape();
  } else if (idx < cardsToStack) {
    return renderUser();
  } else {
    return renderStack({ x: ui.STACK_X, y: ui.STACK_Y }, idx, cardsToStack, cardsInStack - cardsToStack);
  }
};

const renderLogin = () => {
  return {
    ...renderStack({ x: ui.STACK_X, y: ui.STACK_Y }, idx, 0, cardsInStack),
    scale: ui.CARD_LOGIN_SCALE,
  };
};

const renderIdle = () => {
  return {
    ...renderStack({ x: ui.STACK_X, y: ui.STACK_Y }, idx, 0, cardsInStack),
    delay: state.previousState
      ? (3 * users.length + ui.PYRAMID_CARDS - 1 - idx) * ui.TRANSITION_TIME_STACK +
        ui.TRANSITION_RANDOMNESS * Math.random()
      : 0,
  };
};

const renderGive = () => {
  let zIndex = 0;
  if (state.playedThisRow[idx]) {
    zIndex = state.playedThisRow[idx].zIndex + 1;
    idx = state.playedThisRow[idx].onIdx;
  }
  const row = getRow(idx);
  const idx0 = getIdx0(row);
  const rowLength = getRowLength(row);
  if (row === state.rowsPlayed + 1 && idx < 15) {
    return {
      pos: render.giveCard(idx - idx0, rowLength, zIndex),
      flipped: false,
      scale: ui.CARD_VIEW_SCALE,
      zIndex: 10 + 10 * zIndex,
      delay: (idx - idx0) * ui.TRANSITION_TIME_FLIP_UP,
      customElevation: 100,
    };
  } else {
    const style = renderDealt();
    let opacity = idx < cardsToUsers ? ui.BACKGROUND_OPACITY : 1;
    return { ...style, opacity: opacity };
  }
};

const renderWho = () => {
  if (state.cardsDealt.length > idx) {
    const name = state.cardsDealt[idx].name;
    const round = state.cardsDealt[idx].round;
    const ridx = round % settings.playerCards;
    const zIndex = Math.floor(round / settings.playerCards);
    let delay = 0;
    const sidx = state.cardsDealt.findIndex(({ round }) => round === state.round);
    if (sidx < idx) {
      delay = 0.1 * (idx - sidx);
    }
    const user = users.find((user) => user.name === name);
    const disconnected = user && user.disconnected;
    if (state.users.findIndex((user) => user === name) === -1 || disconnected) {
      return renderStack(render.fractional({ x: 0.5, y: 0.5 }), 0, 0, 1);
    }
    if (name === me.name) {
      return {
        scale: ui.USER_ME_CARD_SCALE,
        flipped: false,
        zIndex: zIndex,
        customElevation: 5 * zIndex,
        delay: delay,
        pos: addPos(render.userMeCard(ridx), render.relative({ x: 0, y: 0.1 * zIndex })),
      };
    } else {
      const uidx = users.findIndex((user) => name === user.name);
      const midx = users.findIndex((user) => user === me);
      const aidx = uidx < midx ? uidx : uidx - 1;
      return {
        scale: ui.USER_CARD_SCALE,
        flipped: false,
        customElevation: 5 * zIndex,
        zIndex: zIndex,
        delay: delay,
        pos: addPos(render.userCard(aidx, ridx), render.relative({ x: 0, y: 0.1 * zIndex })),
      };
    }
  }
  return renderStack(render.fractional({ x: 0.5, y: 0.5 }), idx, cardsToStack, cardsInStack - cardsToStack);
};

const renderLayout = () => {
  switch (state.name) {
    case 'login':
      return renderLogin();
    case 'idle':
      return renderIdle();
    case 'dealt':
      return renderDealt();
    case 'give':
      return renderGive();
    case 'who':
      return renderWho();
    default:
      return renderStack(render.fractional({ x: 0.5, y: 0.5 }), idx, 0, cardsInStack);
  }
};

const Card = (props) => {
  render = props.render;
  state = props.state;
  users = props.users;
  idx = props.idx;
  me = props.me;
  settings = props.settings;
  cardsToUsers = settings.shape.total;
  cardsToStack = cardsToUsers + users.length * settings.playerCards;
  cardsInStack = ui.FULL_STACK - (settings.lowest - 2) * 4;
  if (state.name === 'who') {
    cardsToStack = Object.keys(state.cardsDealt).length;
  }
  const [hover, setHover] = useState(false);

  const style = {
    flipped: true,
    ...renderLayout(idx, state, users, me),
    width: render.cardWidth,
    height: render.cardHeight,
    hover: hover,
  };
  const compiledStyle = compileDefaultStyle({ ...style, opacity: 1 });

  return (
    <div
      className="card-container"
      style={compiledStyle}
      onMouseEnter={() => (style.clickable ? setHover(true) : null)}
      onMouseLeave={() => setHover(false)}
      onClick={
        style.clickable
          ? () => {
              setHover(false);
              props.onClick();
            }
          : null
      }
    >
      {state.cardsPlayed && state.cardsPlayed[props.idx] ? (
        <div className="card-inner-background" style={{ borderRadius: `${render.cardWidth / 20}px` }} />
      ) : null}
      <img
        style={style.flipped ? {} : { opacity: style.opacity }}
        className="card"
        src={Cards[props.face]}
        alt=""
      />
      <img
        style={style.flipped ? { opacity: style.opacity } : {}}
        className="card card-back"
        src={Cards.RED_BACK}
        alt=""
      />
    </div>
  );
};

Card.propTypes = {
  face: PropTypes.string,
  idx: PropTypes.number,
  me: PropTypes.object,
  onClick: PropTypes.func,
  render: PropTypes.object,
  state: PropTypes.object,
  users: PropTypes.array,
  settings: PropTypes.object,
};

export default Card;
