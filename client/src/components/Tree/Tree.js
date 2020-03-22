import React from "react";

import Card from "../Card/Card";
import Cards from "../Card/CardLoader";

const keys = [...Object.keys(Cards)];
const getCard = () => {
  return keys[Math.floor(Math.random() * keys.length)];
};

const Tree = () => {
  return [...Array(5).keys()].map(idx => {
    let x;
    let y = 10 + 150 * idx;
    return [...Array(idx + 1).keys()].map(idx2 => {
      x = 10 + idx2 * 100 + (4 - idx) * 50;
      return <Card key={`${idx}-${idx2}`} type={getCard()} x={x} y={y} />;
    });
  });
};

export default Tree;
