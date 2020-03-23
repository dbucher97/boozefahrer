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
  height: 0.15
};

const layoutProps = state => {
  return {
    ...defaultLayoutProps,
    ...state
  };
};

const renderStack = (idx, pos, numCards) => {
  const height = FULL_STACK_HEIGHT / (VISIBLE_IN_STACK - 1);
  const num = Math.floor((VISIBLE_IN_STACK - 1) * (numCards / 54));
  return layoutProps({
    customElevation: Math.max((num - idx) * height, 0),
    zIndex: Math.max(num - idx, 0),
    pos: pos
  });
};

const renderPyramid = (idx, rowsPlayed, { transition }) => {
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
  let flipped = false;
  if (row < rowsPlayed) {
    flipped = true;
  } else if (row === rowsPlayed) {
    if (transition && transition.name === "flip") {
      flipped = idx - idx0 <= transition.to;
    } else {
      flipped = true;
    }
  }
  return layoutProps({ rPos, pos, flipped: !flipped });
};

const renderDealt = (idx, rowsPlayed, numCards, { transition }) => {
  let to = 15;
  let zI = 0;
  if (transition && transition.name === "draw") {
    to = transition.to;
    if (idx < to && idx > to - 3) zI = numCards + 1 + (3 - idx + to);
  }
  if (idx < to) {
    return {
      ...renderPyramid(idx, rowsPlayed, { transition }),
      zIndex: zI,
      customElevation: zI
    };
  } else {
    return renderStack(idx - to, { x: 0.1, y: 0.15 }, numCards - 15);
  }
};

const renderIdle = (idx, numCards) => {
  return renderStack(idx, { x: 0.1, y: 0.15 }, numCards);
};

const renderLayout = (state, idx, numCards) => {
  if (state.name === "idle") {
    return renderIdle(idx, numCards);
  } else if (state.name === "dealt") {
    return renderDealt(idx, state.rowsPlayed, numCards, {
      transition: state.transition
    });
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
    let scale = 1 + elevation / 200;
    const style = {
      width: w,
      height: h,
      transform: `translate3D(${x}px, ${y}px, ${elev}px) scale(${scale}) rotateY(${rotate}deg)`,
      cursor: layout.clickable ? "pointer" : "default",
      display: layout.display ? "block" : "none",
      zIndex: layout.zIndex
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
      <img className="card" src={Cards[face]} alt="" />
      <img className="card card-back" src={Cards.RED_BACK} alt="" />
    </div>
  );
};

export default Card;
