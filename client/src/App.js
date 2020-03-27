import React from 'react';

import './App.css';
import Game from './components/Game/Game';

const App = () => {
  return (
    <div className="container" tabIndex={0}>
      <Game />
    </div>
  );
};

export default App;
