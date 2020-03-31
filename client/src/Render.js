import React from 'react';
import * as ui from './UIConstants';
import Pyramid from './shapes/Pyramid';

import './App.css';

const defaultStyle = {
  width: null,
  height: null,
  clickable: false,
  zIndex: 0,
  pos: { x: 0, y: 0 },
  scale: 1,
  elevation: 0,
  transitionDelay: 0,
  delay: 0,
  rotateZ: 0,
  rotateX: 0,
  flipped: false,
  opacity: 1,
  fontSize: 18,
};

const compileDefaultStyle = (customStyle) => {
  const style = { ...defaultStyle, ...customStyle };
  const elevationScale =
    1 + (style.clickable && style.hover ? ui.HOVER_ELEVATION : 0) * ui.ELEVATION_SCALE_COEFF;
  return {
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: style.fontSize,
    width: style.width,
    height: style.height,
    cursor: style.clickable ? 'pointer' : 'default',
    zIndex: style.zIndex,
    opacity: style.opacity,
    transitionDelay: `${style.delay}s`,
    transform: `translateX(${style.pos.x}px)
                translateY(${style.pos.y}px)
                scale(${style.scale})
                translateZ(${style.elevation + (style.clickable && style.hover ? ui.HOVER_ELEVATION : 0)}px)
                rotateY(${style.flipped ? 180 : 0}deg)
                rotateX(${style.rotateX}deg)
                rotateZ(${style.rotateZ}deg)
                scale(${elevationScale})`,
  };
};

const addPos = (...pos) =>
  pos.reduce((prev, cur) => ({
    x: prev.x + cur.x,
    y: prev.y + cur.y,
  }));

const centered = (pos, dimensions) => ({
  x: pos.x - dimensions.x / 2,
  y: pos.y - dimensions.y / 2,
});

const Render = class {
  constructor(window, settings, users, me) {
    this.window = window;
    this.settings = settings;
    this.cardHeight = ui.CARD_REL_HEIGHT * window.height;
    this.cardWidth = this.cardHeight / ui.CARD_ASPECT;
    this.users = users;
    this.me = me;
    this.totalRows = settings.shape.rows;
    this.playerCards = settings.playerCards;
    switch (this.settings.name) {
      case 'Pyramid':
        this.shape = Pyramid;
        break;
      default:
        this.shape = Pyramid;
        break;
    }
    // TODO support other shapes.
  }

  // relative to screen
  fractional({ x, y }) {
    return {
      x: this.window.width * x,
      y: this.window.height * y,
    };
  }

  // relative to card dimensions
  relative({ x, y }) {
    return {
      x: x * this.cardWidth,
      y: y * this.cardHeight,
    };
  }

  // compensate position shift due to scale from origin center
  compensate(scale) {
    return this.relative({ x: (scale - 1) / 2, y: (scale - 1) / 2 });
  }

  // render the pyramid
  shapeCard(idx) {
    const row = this.shape.getRow(idx);
    const ridx = idx - this.shape.getIdx0(row);
    const rowLength = this.shape.getRowLength(row);
    return centered(
      addPos(
        this.fractional({ x: 0.5, y: 0.5 }),
        this.relative({ x: ridx * ui.CARD_SHAPE_X_PAD, y: (row - 1) * ui.CARD_SHAPE_Y_PAD }),
        { x: 0, y: 2 * ui.UI_PAD },
      ),
      this.relative({
        x: (rowLength - 1) * ui.CARD_SHAPE_X_PAD + 1,
        y: (this.totalRows - 1) * ui.CARD_SHAPE_Y_PAD + 1,
      }),
    );
  }

  // render the stack
  stackCard(pos, nocenter) {
    if (!nocenter) {
      return centered(pos, { x: this.cardWidth, y: this.cardHeight });
    } else {
      return pos;
    }
  }

  giveCard(ridx, rowLength, zIndex) {
    return addPos(
      this.compensate(ui.CARD_VIEW_SCALE),
      this.fractional({ x: 0.5, y: 0.5 }),
      centered(
        this.relative({ x: ridx * ui.CARD_VIEW_SCALE * ui.CARD_SHAPE_X_PAD, y: 0.2 * zIndex }),
        this.relative({
          x: ((rowLength - 1) * ui.CARD_SHAPE_X_PAD + 1) * ui.CARD_VIEW_SCALE,
          y: ui.CARD_VIEW_SCALE,
        }),
      ),
    );
  }

  userMe(noShow) {
    return addPos(
      {
        x: !noShow ? ui.UI_PAD : -ui.UI_PAD,
        y: ui.UI_PAD,
      },
      this.relative({
        x: -(noShow ? this.playerCards * ui.USER_ME_CARD_SCALE * ui.CARD_SHAPE_X_PAD : 0),
        y: 0,
      }),
    );
  }

  userMeCard(idx, noShow) {
    return addPos(
      this.compensate(ui.USER_ME_CARD_SCALE),
      this.relative({ x: ui.USER_ME_CARD_SCALE * ui.CARD_SHAPE_X_PAD * idx, y: 0 }),
      this.userMe(noShow),
    );
  }

  user(uidx, noShow) {
    return addPos(
      this.fractional({ x: 1, y: 0 }),
      {
        x: !noShow ? -ui.UI_PAD - ui.USER_CARD_WIDTH : 2 * ui.UI_PAD,
        y: ui.UI_PAD + ui.UI_PAD * uidx,
      },
      this.relative({
        x: noShow ? this.playerCards * ui.USER_CARD_SCALE * ui.CARD_SHAPE_X_PAD : 0,
        y: uidx * ui.USER_CARD_SCALE,
      }),
    );
  }

  userCard(uidx, idx, noShow) {
    return addPos(
      this.compensate(ui.USER_CARD_SCALE),
      this.relative({ x: -(idx + 1) * ui.USER_CARD_SCALE * ui.CARD_SHAPE_X_PAD, y: 0 }),
      this.user(uidx, noShow),
    );
  }

  centeredText(text, maxWidth, style) {
    style.pos = centered(style.pos, { x: maxWidth, y: 0 });
    return (
      <div className="centered-text" style={{ ...compileDefaultStyle(style), width: maxWidth }}>
        {text}
      </div>
    );
  }
};

export { Render, addPos, centered, compileDefaultStyle };
