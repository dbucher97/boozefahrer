import React from "react";

import "./App.css";
import GameField from "./components/GameField/GameField";

const App = () => {
  return (
    <div className="container" tabIndex={0}>
      <GameField />
    </div>
  );
};

export default App;
