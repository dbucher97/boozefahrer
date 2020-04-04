import React from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faMinus } from '@fortawesome/free-solid-svg-icons';

import './Settings.css';

const NumberPicker = ({ number, setNumber, min, max, disabled }) => {
  const changeNumber = (inc) => {
    const newNum = Math.max(Math.min(number + inc, max), min);
    setNumber(newNum);
  };
  const plusDisabled = disabled || number === max;
  const minusDisabled = disabled || number === min;
  return (
    <div className="settings-number-picker">
      <button
        className="settings-number-picker-button"
        onClick={() => changeNumber(-1)}
        disabled={minusDisabled}
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <div>{number}</div>
      <button
        className="settings-number-picker-button"
        onClick={() => changeNumber(+1)}
        disabled={plusDisabled}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
};

NumberPicker.propTypes = {
  number: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  setNumber: PropTypes.func,
  disabled: PropTypes.bool,
};

const Settings = ({ state, users, settings, setSettings }) => {
  const active = !users.map(({ ready }) => ready).reduce((prev, curr) => prev || curr);

  const containerClass =
    'settings-container' +
    (state.name === 'idle'
      ? active
        ? ''
        : ' settings-container-deactivated'
      : ' settings-container-invisible');
  return (
    <div className={containerClass}>
      <div className="settings-title">Einstellungen</div>
      <div className="settings-item">
        <div className="settings-item-left">Niedrigste Karte</div>
        <NumberPicker
          number={settings.lowest}
          setNumber={(lowest) => setSettings({ ...settings, lowest })}
          disabled={!active}
          min={2}
          max={9}
        />
      </div>
      <div className="settings-item">
        <div className="settings-item-left">Spieler Karten</div>
        <NumberPicker
          number={settings.playerCards}
          setNumber={(playerCards) => setSettings({ ...settings, playerCards })}
          disabled={!active}
          min={1}
          max={5}
        />
      </div>
    </div>
  );
};

Settings.propTypes = {
  state: PropTypes.object,
  users: PropTypes.array,
  settings: PropTypes.object,
  setSettings: PropTypes.func,
};

export default Settings;
