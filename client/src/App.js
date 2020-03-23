import React, { useState } from "react";

import "./App.css";
import GameField from "./components/GameField/GameField";

import Cards from "./components/Card/CardLoader";

import useEventListener from "./util/EventListener";

const cardTypes = [
  ...Object.keys(Cards).filter(val => val !== "RED_BACK" && val !== "BLUE_BACK")
];

const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const randomCards = lowest => {
  return shuffle(
    cardTypes.filter(val => {
      const v = parseInt(val.substr(0, 1));
      return v >= lowest || isNaN(v);
    })
  );
};

const App = () => {
  const [cards, setCards] = useState(randomCards(4));
  const [users, setUser] = useState([
    { name: "David" },
    { name: "Stefan" },
    { name: "Kai" }
  ]);

  const handleOnKeyPress = e => {
    if (e.key === "Enter") setCards(randomCards(4));
  };

  useEventListener("keypress", handleOnKeyPress);

  return (
    <div className="container">
      <GameField faces={cards} users={users} />
    </div>
  );
};

export default App;
