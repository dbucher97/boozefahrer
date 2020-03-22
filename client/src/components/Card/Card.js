import React, { useState } from "react";
import useWindowDimensions from "../../util/WindowDimensions";
import Cards from "./CardLoader";

import "./Card.css";

const Card = ({ type, x = 0, y = 0 }) => {
  const { width } = useWindowDimensions();
  const [flipped, setFlipped] = useState(true);
  const [elevation, setElevation] = useState(0);
  const [pos, setPos] = useState({ x: x, y: y });

  const compileStyle = () => {
    let rotate = flipped ? 180 : 0;
    let w = 0.05 * width;
    let h = 1.397 * w;
    let scale = 1 + elevation / 200;
    return {
      width: w,
      height: h,
      transform: `translate3D(${pos.x}px, ${pos.y}px, ${elevation}px) scale(${scale}) rotateY(${rotate}deg)`,
      cursor: elevation > 0 ? "pointer" : "default"
    };
  };

  const handleOnClick = () => {
    setFlipped(!flipped);
  };

  return (
    <div
      className="card-container"
      style={compileStyle()}
      onMouseEnter={() => setElevation(10)}
      onMouseLeave={() => setElevation(0)}
    >
      <img className="card" src={Cards[type]} onClick={handleOnClick} alt="" />
      <img
        className="card card-back"
        src={Cards.RED_BACK}
        onClick={handleOnClick}
        alt=""
      />
    </div>
  );
};

export default Card;
