import React, { useState } from "react";

import "./User.css";
import useWindowDimensions from "../../util/WindowDimensions";
import Cards from "../Card/CardLoader";

const User = ({ idx, user, gamestate, total }) => {
  const { width, height } = useWindowDimensions();
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);

  const clickable = gamestate.name == "give" && idx != 0;

  const compileStyle = () => {
    const p = 20;
    const scale = hover ? 1.0 : 1.0;
    let w = 450;
    let h = 150;
    let y = 2 * p + 200 + (h + p) * (idx - 1);
    if (idx == 0) {
      w = 600;
      h = 200;
      y = p;
    }
    let x = width - p - w * scale;
    if (gamestate.name == "idle") {
      x = 20 + width;
    }
    const el = hover ? 20 : 0;
    return {
      width: w,
      height: h,
      transform: `translate3d(${x}px, ${y}px, ${el}px) scale(${scale})`,
      cursor: hover ? "pointer" : "default",
      background: !clicked ? "#344f5a" : "#ffd840",
      color: !clicked ? "#fff" : "#264653",
      opacity: gamestate.name == "idle" ? 0.0 : 1.0
    };
  };

  return (
    <div
      className="user-container"
      style={compileStyle()}
      onMouseEnter={() => (clickable ? setHover(true) : null)}
      onMouseLeave={() => (clickable ? setHover(false) : null)}
      onClick={() => {
        if (clickable) {
          setClicked(!clicked);
        }
      }}
    >
      <div className="user-info-container">
        <div className="user-info-inner-container">
          <p className="user-title">{user.name}</p>
          <p className="user-info">Test</p>
        </div>
      </div>
    </div>
  );
};

export default User;
