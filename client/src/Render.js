import * as ui from './ui';

import Pyramid from './Fields/Pyramid';

const fractionalPos = (pos, window) => {
  return {
    x: window.width * pos.x,
    y: window.height * pos.y,
  };
};

const relativePos = (pos, window) => {
  const cardHeight = ui.CARD_REL_HEIGHT * window.height;
  const cardWidth = cardHeight / ui.CARD_ASPECT;
  return {
    x: pos.x * cardHeight,
    y: pos.y * cardWidth,
  };
};

const addPos = (...pos) =>
  pos.reduce(({ prevx, prevy }, { x, y }) => {
    return {
      x: x + prevx,
      y: y + prevy,
    };
  });

const centered = (pos, dimensions) => {
  return {
    x: pos.x - dimensions.width / 2,
    y: pos.y - dimensions.width / 2,
  };
};

const Render = class {
  constructor(window, settings) {
    this.window = window;
    this.settings = settings;
    this.shape = Pyramid;
    // TODO support other shapes.
  }

  shapeCard(idx) {
    return {
      x: 10,
      y: 10,
    };
  }
};

export { fractionalPos, relativePos, addPos, centered, Render };
