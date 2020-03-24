import React, { useState } from "react";
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
  stacked: false
};

const layoutProps = state => {
  return {
    ...defaultLayoutProps,
    ...state
  };
};

const renderStack = (idx, pos) => {
  return layoutProps({
    customElevation: Math.min((54 - idx) * 5, ui.FULL_STACK_HEIGHT),
    zIndex: ui.FULL_STACK - idx, //TODO numCards
    pos: pos,
    stacked: idx !== 0
  });
};

const renderPyramid = (idx, state) => {
  const row = getRow(idx);
  const idx0 = getIdx0(row);
  const pos = {
    x: ui.PYRAMID_X_ANCHOR,
    y:
      ui.PYRAMID_Y_ANCHOR -
      ((ui.ROWS - 1) / 2.0) * ui.CARD_REL_HEIGHT * ui.CARD_PYRAMID_Y_PAD
  };
  const rPos = {
    x: ui.CARD_PYRAMID_X_PAD * (idx - idx0 - (row - 1) / 2),
    y: ui.CARD_PYRAMID_Y_PAD * (row - 1)
  };
  let transition;
  if (state.previousState === "idle") {
    transition = i => i * ui.TRANSITION_TIME_DRAW;
  } else {
    transition = i => (row - 1 + idx0 - i) * ui.TRANSITION_TIME_FLIP;
  }
  return layoutProps({
    zIndex: 0,
    rPos,
    pos,
    flipped: row > state.rowsPlayed,
    delay: transition(idx)
  });
};

const renderUser = (idx, state) => {
  const i = idx - ui.PYRAMID_CARDS;
  const uidx = i % state.numUsers;
  const ridx = Math.floor(i / state.numUsers);
  const layout = layoutProps({
    pos: { x: 1, y: 0 },
    absPos: { x: -30, y: 30 },
    rPos: {
      x: -1 / 2 - ridx * 1.1,
      y: 1 / 2 + uidx * 1.2 + (uidx ? 1.1 / 0.7 - 1 + 0.2 : 0)
    },
    zIndex: 1,
    opacity: 1.0,
    delay: state.previousState === "idle" ? 0.05 * idx : 0
  });
  if (uidx === 0) {
    return {
      ...layout,
      scale: ui.USER_ME_CARD_SCALE,
      flipped: false,
      clickable: state.name === "give"
    };
  } else {
    return { ...layout, scale: ui.USER_CARD_SCALE };
  }
};

const renderDealt = (idx, state) => {
  if (state.cardsPlayed[idx]) {
    return {
      ...renderPyramid(state.cardsPlayed[idx].onIdx, state),
      customElevation: 20
    };
  }
  if (idx < ui.PYRAMID_CARDS) {
    return renderPyramid(idx, state);
  } else if (idx < ui.PYRAMID_CARDS + 3 * state.numUsers) {
    return renderUser(idx, state);
  } else {
    return renderStack(
      idx - ui.PYRAMID_CARDS - 3 * state.numUsers,
      { x: ui.STACK_X, y: ui.STACK_Y },
      ui.FULL_STACK - ui.PYRAMID_CARDS - 3 * state.numUsers
    );
  }
};

const renderIdle = (idx, state) => {
  return {
    ...renderStack(idx, { x: ui.STACK_X, y: ui.STACK_Y }),
    delay: state.previousState
      ? (3 * state.numUsers + ui.PYRAMID_CARDS - 1 - idx) *
          ui.TRANSITION_TIME_STACK +
        ui.TRANSITION_RANDOMNESS * Math.random()
      : 0
  };
};

const renderGive = (idx, state) => {
  let iPlayedThisRow = false;
  if (state.iPlayedThisRow[idx]) {
    idx = state.iPlayedThisRow[idx].onIdx;
    iPlayedThisRow = true;
  }
  const row = getRow(idx);
  const idx0 = getIdx0(row);
  const layout = renderDealt(idx, state);
  if (row === state.rowsPlayed + 1 && idx < 15) {
    return {
      ...layout,
      pos: { x: ui.CARD_VIEW_X, y: ui.CARD_VIEW_Y },
      flipped: false,
      scale: ui.CARD_VIEW_SCALE,
      zIndex: 100,
      delay: (idx - idx0) * ui.TRANSITION_TIME_FLIP_UP,
      customElevation: 100,
      rPos: { x: layout.rPos.x, y: iPlayedThisRow ? -ui.CARD_PYRAMID_Y_PAD : 0 }
    };
  } else {
    let opacity = ui.BACKGROUND_OPACITY;
    if (layout.stacked) opacity = 0;
    if (
      state.cardsPlayed[idx] == null &&
      idx >= ui.PYRAMID_CARDS &&
      idx < ui.PYRAMID_CARDS + 3 * state.numUsers
    )
      opacity = 1;
    return { ...layout, opacity: opacity };
  }
};

const renderLayout = (state, idx) => {
  switch (state.name) {
    case "idle":
      return renderIdle(idx, state);
    case "dealt":
      return renderDealt(idx, state);
    case "give":
      return renderGive(idx, state);
    default:
      return layoutProps();
  }
};

const Card = ({ idx, face, gamestate, onClick }) => {
  const { width, height } = useWindowDimensions();
  const [elevation, setElevation] = useState(0);
  const layout = renderLayout(gamestate, idx);

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
      zIndex: layout.zIndex,
      transitionDelay: `${layout.delay}s`
    };
    return style;
  };

  return (
    <div
      className="card-container"
      style={compileStyle()}
      onMouseEnter={() => (layout.clickable ? setElevation(10) : null)}
      onMouseLeave={() => (setElevation(0): null)}
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

export default Card;
