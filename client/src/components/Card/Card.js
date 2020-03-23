import React, { useState } from "react";
import useWindowDimensions from "../../util/WindowDimensions";
import Cards from "./CardLoader";

import "./Card.css";

const VISIBLE_IN_STACK = 5;
const FULL_STACK_HEIGHT = 40.0;

const defaultLayoutProps = {
  flipped: true,
  clickable: false,
  display: true,
  customElevation: 0,
  pos: { x: 0.0, y: 0.0 },
  absPos: { x: 0, y: 0 },
  rPos: { x: 0, y: 0 },
  width: null,
  zIndex: 0,
  height: 0.15,
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

const renderStack = (idx, pos, numCards) => {
  return layoutProps({
    customElevation: Math.min((numCards - idx) * 5, FULL_STACK_HEIGHT),
    zIndex: numCards - idx,
    pos: pos,
    stacked: idx !== 0
  });
};

const renderPyramid = (idx, state) => {
  const row = Math.floor(0.5 + 0.5 * Math.sqrt(1 + 8 * idx));
  const idx0 = (row * (row - 1)) / 2;
  const pos = {
    x: 0.3,
    y: 0.15
  };
  const rPos = {
    x: 1.15 * (idx - idx0 - row / 2),
    y: 1.1 * (row - 1)
  };
  let transition;
  if (state.previousState === "idle") {
    transition = i => i * 0.05;
  } else {
    transition = i => (row - 1 + idx0 - i) * 0.03;
  }
  return layoutProps({
    zIndex: 0,
    rPos,
    pos,
    flipped: row > state.rowsPlayed,
    delay: transition(idx)
  });
};

const renderDealt = (idx, state, numCards) => {
  if (idx < 15) {
    return renderPyramid(idx, state);
  } else {
    return renderStack(idx - 15, { x: 0.1, y: 0.15 }, numCards - 15);
  }
};

const renderIdle = (idx, state, numCards) => {
  return {
    ...renderStack(idx, { x: 0.1, y: 0.15 }, numCards),
    delay: state.previousState ? (14 - idx) * 0.01 + 0.02 * Math.random() : 0
  };
};

const renderGive = (idx, state, numCards) => {
  const row = Math.floor(0.5 + 0.5 * Math.sqrt(1 + 8 * idx));
  const idx0 = (row * (row - 1)) / 2;
  const layout = renderDealt(idx, state, numCards);
  if (row === state.rowsPlayed + 1) {
    return {
      ...layout,
      pos: { x: 0.35, y: 0.5 },
      flipped: false,
      scale: 1.5,
      zIndex: 3,
      delay: (idx - idx0) * 0.05,
      customElevation: 100,
      rPos: { x: layout.rPos.x * 1.5, y: 0 }
    };
  } else {
    let opacity = 0.1;
    if (layout.stacked) opacity = 0;
    return { ...layout, opacity: opacity };
  }
};

const renderLayout = (state, idx, numCards) => {
  switch (state.name) {
    case "idle":
      return renderIdle(idx, state, numCards);
    case "dealt":
      return renderDealt(idx, state, numCards);
    case "give":
      return renderGive(idx, state, numCards);
  }
};

const Card = ({ idx, face, gamestate, onClick, numCards }) => {
  const { width, height } = useWindowDimensions();
  const [elevation, setElevation] = useState(0);
  const layout = renderLayout(gamestate, idx, numCards);

  const compileStyle = () => {
    let rotate = layout.flipped ? 180 : 0;
    let w, h;
    if (layout.width) {
      w = layout.width * width;
      h = 1.397 * w;
    } else {
      h = layout.height * height;
      w = h / 1.397;
    }
    let x = layout.pos.x * width + layout.absPos.x + w * layout.rPos.x - w / 2;
    let y = layout.pos.y * height + layout.absPos.y + h * layout.rPos.y - h / 2;
    let elev = elevation + layout.customElevation;
    let scale = (1 + elevation / 200) * layout.scale;

    let style = {
      width: w,
      height: h,
      transform: `translate3D(${x}px, ${y}px, ${elev}px) scale(${scale}) rotateY(${rotate}deg)`,
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
      onMouseLeave={() => (layout.clickable ? setElevation(0) : null)}
      onClick={layout.clickable ? onClick : null}
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
