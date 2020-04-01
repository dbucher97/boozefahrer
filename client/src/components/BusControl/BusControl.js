import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { addPos, centered, compileDefaultStyle } from './../../Render';
import * as ui from './../../UIConstants';

import './BusControl.css';

const thumbsup = require('./emojis/thumbsup.svg');
const thumbsdown = require('./emojis/thumbsdown.svg');
const fistbump = require('./emojis/fistbump.svg');

const EmojiButton = ({ emoji, pos, onClick, size, render, hide, opacity, clickable }) => {
  const [hover, setHover] = useState(false);
  const style = { clickable: clickable, elevation: 10, zIndex: 100, hover: hover, opacity: opacity };
  if (hide) {
    pos = addPos(pos, render.fractional({ x: 0.5, y: 0 }));
  }
  return (
    <img
      className="emoji"
      draggable={false}
      src={emoji}
      onMouseEnter={clickable ? () => setHover(true) : null}
      onMouseLeave={() => setHover(false)}
      alt=""
      style={compileDefaultStyle({ ...style, width: size, height: size, pos: pos })}
      onClick={() => {
        if (clickable) {
          setHover(false);
          onClick();
        }
      }}
    />
  );
};

EmojiButton.propTypes = {
  onClick: PropTypes.func,
  emoji: PropTypes.string,
  pos: PropTypes.object,
  size: PropTypes.number,
  hide: PropTypes.bool,
  render: PropTypes.object,
  opacity: PropTypes.number,
  clickable: PropTypes.bool,
};

const BusControl = ({ state, higher, lower, equal, render, hide }) => {
  const size = render.cardHeight;
  const pos = addPos(
    centered(render.fractional({ x: 0.5, y: 0.5 }), { x: size, y: size }),
    render.relative({ x: 2 * ui.BUS_CARD_SCALE * ui.CARD_SHAPE_X_PAD, y: 0 }),
  );
  let clickableUp = false;
  let clickableBump = false;
  let clickableDown = false;
  let opacityUp = 0;
  let opacityBump = 0;
  let opacityDown = 0;
  let shiftUp = -size * ui.CARD_SHAPE_Y_PAD - ui.UI_PAD;
  let shiftDown = +size * ui.CARD_SHAPE_Y_PAD + ui.UI_PAD;
  if (state.name === 'bus') {
    opacityDown = 1;
    opacityUp = 1;
    opacityBump = 1;
    if (state.busstate.includes('pause')) {
      switch (state.action) {
        case 'higher':
          opacityDown = 0;
          opacityBump = 0;
          shiftUp = 0;
          break;
        case 'lower':
          opacityUp = 0;
          opacityBump = 0;
          shiftDown = 0;
          break;
        case 'equal':
          opacityUp = 0;
          opacityDown = 0;
          break;
        default:
          opacityBump = 0;
          opacityUp = 0;
          opacityDown = 0;
      }
    } else {
      clickableDown = true;
      clickableBump = true;
      clickableUp = true;
    }
  }
  return (
    <div>
      <EmojiButton
        emoji={fistbump}
        size={size}
        onClick={equal}
        pos={pos}
        hide={hide}
        render={render}
        opacity={opacityBump}
        clickable={clickableBump}
      />
      <EmojiButton
        emoji={thumbsup}
        size={size}
        onClick={higher}
        pos={addPos(pos, { x: 0, y: shiftUp })}
        hide={hide}
        opacity={opacityUp}
        clickable={clickableUp}
        render={render}
      />
      <EmojiButton
        emoji={thumbsdown}
        size={size}
        onClick={lower}
        pos={addPos(pos, { x: 0, y: shiftDown })}
        hide={hide}
        opacity={opacityDown}
        clickable={clickableDown}
        render={render}
      />
    </div>
  );
};

BusControl.propTypes = {
  state: PropTypes.object,
  higher: PropTypes.func,
  lower: PropTypes.func,
  equal: PropTypes.func,
  render: PropTypes.object,
  hide: PropTypes.bool,
};

const BusDisplay = ({ state, render }) => {
  const size = render.cardWidth;
  let emoji;
  let rotation = state.busstate.includes('pause') ? 0 : 91;
  const opactity = state.busstate.includes('pause');
  switch (state.action) {
    case 'higher':
      emoji = thumbsup;
      break;
    case 'lower':
      emoji = thumbsdown;
      break;
    case 'equal':
    default:
      emoji = fistbump;
  }
  const pos = addPos(
    centered(render.fractional({ x: 0.5, y: 0.5 }), { x: size, y: size }),
    render.relative({ x: 0, y: -ui.BUS_CARD_SCALE }),
  );
  return (
    <img
      className="display"
      draggable={false}
      src={emoji}
      style={compileDefaultStyle({ pos, width: size, height: size, rotateX: rotation, opactity: opactity })}
      alt=""
    />
  );
};

BusDisplay.propTypes = {
  state: PropTypes.object,
  render: PropTypes.object,
};

export default BusControl;
export { BusDisplay };
