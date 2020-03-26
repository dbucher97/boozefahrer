import React, { useState } from "react";
import PropTypes from "prop-types";
import useWindowDimensions from "../../util/WindowDimensions";
import Cards from "./CardLoader";

import "./Card.css";
import { getRow, getIdx0 } from "../../util/Pyramid";
import * as ui from "../ui";

const defaultLayoutProps = {
  flipped: true,
  clickable: false,
  display: true,
  customElevation: 0,
  pos: { x: 0.0, y: 0.0 },
  absPos: { x: 0, y: 0 },
  rPos: { x: 0, y: 0 },
  width: null,
  height: ui.CARD_REL_HEIGHT,
  zIndex: 0,
  opacity: 1.0,
  delay: 0,
  scale: 1.0,
  stacked: false,
};

const layoutProps = (state) => {
  return {
    ...defaultLayoutProps,
    ...state,
  };
};

const renderStack = (
  idx,
  { pos, rPos, absPos, cardsInStack = ui.FULL_STACK }
) => {
  return layoutProps({
    customElevation: Math.floor((cardsInStack - idx) / 5) * 10,
    zIndex: cardsInStack - idx, //TODO numCards
    pos: pos || defaultLayoutProps.pos,
    rPos: rPos || defaultLayoutProps.rPos,
    absPos: absPos || defaultLayoutProps.absPos,
    stacked: idx !== 0,
  });
};

const renderPyramid = (idx, state, users) => {
  const row = getRow(idx);
  const idx0 = getIdx0(row);
  const pos = {
    x: ui.PYRAMID_X_ANCHOR,
    y:
      ui.PYRAMID_Y_ANCHOR -
      ((ui.ROWS - 1) / 2.0) * ui.CARD_REL_HEIGHT * ui.CARD_PYRAMID_Y_PAD,
  };
  const rPos = {
    x: ui.CARD_PYRAMID_X_PAD * (idx - idx0 - (row - 1) / 2),
    y: ui.CARD_PYRAMID_Y_PAD * (row - 1),
  };
  let transition;
  if (state.previousState === "idle") {
    transition = (i) => i * ui.TRANSITION_TIME_DRAW;
  } else {
    transition = (i) => (row - 1 + idx0 - i) * ui.TRANSITION_TIME_FLIP;
  }
  return layoutProps({
    zIndex: 0,
    rPos,
    pos,
    flipped: row > state.rowsPlayed,
    delay: transition(idx),
  });
};

const renderUser = (idx, state, users, me) => {
  const i = idx - ui.PYRAMID_CARDS;
  const midx = users.findIndex((user) => user === me);
  const uidx = i % users.length;
  const ridx = Math.floor(i / users.length);
  const layout = layoutProps({
    zIndex: 1,
    delay: state.previousState === "idle" ? 0.05 * idx : 0,
  });
  if (uidx === midx) {
    // Render me
    return {
      ...layout,
      flipped: false,
      absPos: { x: 30, y: 30 },
      rPos: { x: 0.5 + ridx * ui.CARD_PYRAMID_X_PAD, y: 0.5 },
      clickable: state.name === "give",
      scale: ui.USER_ME_CARD_SCALE,
    };
  } else {
    // Render others
    const aidx = uidx < midx ? uidx : uidx - 1;
    return {
      ...layout,
      scale: ui.USER_CARD_SCALE,
      pos: { x: 1, y: 0 },
      absPos: {
        x: (-3 * ui.UI_PAD) / 2 - ui.USER_CARD_WIDTH,
        y: ui.UI_PAD + aidx * ui.UI_PAD,
      },
      rPos: {
        x: -0.5 - ridx * ui.CARD_PYRAMID_X_PAD,
        y: 0.5 + aidx,
      },
    };
  }
  // const layout = layoutProps({
  //   pos: { x: 1, y: 0 },
  //   absPos: { x: -30, y: 30 },
  //   rPos: {
  //     x: -1 / 2 - ridx * 1.1,
  //     y: 1 / 2 + uidx * 1.2 + (uidx ? 1.1 / 0.7 - 1 + 0.2 : 0),
  //   },
  //   zIndex: 1,
  //   opacity: 1.0,
  //   delay: state.previousState === "idle" ? 0.05 * idx : 0,
  // });
  // if (uidx === midx) {
  //   return {
  //     ...layout,
  //     scale: ui.USER_ME_CARD_SCALE,
  //     flipped: false,
  //     clickable: state.name === "give",
  //   };
  // } else {
  //   return { ...layout, scale: ui.USER_CARD_SCALE };
  // }
};

const renderDealt = (idx, state, users, me) => {
  if (state.cardsPlayed[idx]) {
    const layout = renderPyramid(state.cardsPlayed[idx].onIdx, state, users)
    return {
      ...layout,
      customElevation: 20+state.cardsPlayed[idx].zIdx*20,
      zIndex: state.cardsPlayed[idx].zIdx+1,
      rPos: {x: layout.rPos.x, y: layout.rPos.y+0.05+0.05*state.cardsPlayed[idx].zIdx}
    };
  }
  if (idx < ui.PYRAMID_CARDS) {
    return renderPyramid(idx, state, users);
  } else if (idx < ui.PYRAMID_CARDS + 3 * users.length) {
    return renderUser(idx, state, users, me);
  } else {
    return renderStack(idx - ui.PYRAMID_CARDS - 3 * users.length, {
      pos: { x: ui.STACK_X, y: ui.STACK_Y },
      cardsInStack: ui.FULL_STACK - ui.PYRAMID_CARDS - 3 * users.length,
    });
  }
};

const renderLogin = (idx, state, users) => {
  const layout = {
    ...renderStack(idx, {
      pos: { x: 0.5, y: ui.LOGIN_ANCHOR },
      rPos: { x: -ui.CARD_LOGIN_RPOS, y: 0 },
    }),
    scale: ui.CARD_LOGIN_SCALE,
  };
  return layout;
};

const renderIdle = (idx, state, users) => {
  return {
    ...renderStack(idx, { pos: { x: ui.STACK_X, y: ui.STACK_Y } }),
    delay: state.previousState
      ? (3 * users.length + ui.PYRAMID_CARDS - 1 - idx) *
          ui.TRANSITION_TIME_STACK +
        ui.TRANSITION_RANDOMNESS * Math.random()
      : 0,
  };
};

const renderGive = (idx, state, users, me) => {
  let zIdx = 0;
  if (state.playedThisRow[idx]) {
    zIdx = state.playedThisRow[idx].zIdx+1;
    idx = state.playedThisRow[idx].onIdx;
  }
  const row = getRow(idx);
  const idx0 = getIdx0(row);
  const layout = renderDealt(idx, state, users, me);
  console.log(zIdx);
  if (row === state.rowsPlayed + 1 && idx < 15) {
    return {
      ...layout,
      pos: { x: ui.CARD_VIEW_X, y: ui.CARD_VIEW_Y },
      flipped: false,
      scale: ui.CARD_VIEW_SCALE,
      zIndex: 10+10*zIdx,
      delay: (idx - idx0) * ui.TRANSITION_TIME_FLIP_UP,
      customElevation: 100,
      rPos: {
        x: layout.rPos.x,
        y: 0.2*zIdx,
      },
    };
  } else {
    let opacity = ui.BACKGROUND_OPACITY;
    if (
      state.cardsPlayed[idx] == null &&
      idx >= ui.PYRAMID_CARDS &&
      idx < ui.PYRAMID_CARDS + 3 * users.length
    )
      opacity = 1;
    return { ...layout, opacity: opacity };
  }
};

const renderLayout = (idx, state, users, me) => {
  switch (state.name) {
    case "login":
      return renderLogin(idx, state, users);
    case "idle":
      return renderIdle(idx, state, users);
    case "dealt":
      return renderDealt(idx, state, users, me);
    case "give":
      return renderGive(idx, state, users, me);
    default:
      return layoutProps();
  }
};

const Card = ({ idx, face, gamestate, users, onClick, me }) => {
  const { width, height } = useWindowDimensions();
  const [elevation, setElevation] = useState(0);
  const layout = renderLayout(idx, gamestate, users, me);

  const compileStyle = () => {
    let rotate = layout.flipped ? 180 : 0;
    let w, h;
    if (layout.width) {
      w = layout.width * width;
      h = ui.CARD_ASPECT * w;
    } else {
      h = layout.height * height;
      w = h / ui.CARD_ASPECT;
    }
    const scale = layout.scale;
    let x =
      layout.pos.x * width +
      layout.absPos.x +
      w * scale * layout.rPos.x -
      w / 2;
    let y =
      layout.pos.y * height +
      layout.absPos.y +
      h * scale * layout.rPos.y -
      h / 2;
    let elevation1 = layout.clickable ? elevation : 0;
    let elev = elevation1 + layout.customElevation;

    let style = {
      width: w,
      height: h,
      transform: `translateX(${x}px) translateY(${y}px) scale(${scale}) translateZ(${elev}px) rotateY(${rotate}deg) scale(${
        1 + elevation1 * ui.ELEVATION_SCALE_COEFF
      })`,
      cursor: layout.clickable ? "pointer" : "default",
      display: layout.display ? "block" : "none",
      zIndex: layout.zIndex + elevation,
      transitionDelay: `${layout.delay}s`,
    };
    return style;
  };

  return (
    <div
      className="card-container"
      style={compileStyle()}
      onMouseEnter={() => (layout.clickable ? setElevation(10) : null)}
      onMouseLeave={() => setElevation(0)}
      onClick={
        layout.clickable
          ? () => {
              setElevation(0);
              onClick();
            }
          : null
      }
    >
      <img
        style={layout.flipped ? {} : { opacity: layout.opacity }}
        className="card"
        src={Cards[face]}
        alt=""
      />
      <img
        style={layout.flipped ? { opacity: layout.opacity } : {}}
        className="card card-back"
        src={Cards.RED_BACK}
        alt=""
      />
    </div>
  );
};

Card.propTypes = {
  idx: PropTypes.number,
  face: PropTypes.string,
  onClick: PropTypes.func,
  gamestate: PropTypes.object,
};

export default Card;
export { renderUser };
