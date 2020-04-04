import React from 'react';
import * as ui from './UIConstants';
import { getShape } from './common/shape';

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
  fontWeight: 'normal',
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
    fontWeight: style.fontWeight,
    width: style.width,
    height: style.height,
    cursor: style.clickable ? 'pointer' : null,
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
    if (window.width / window.height < 1.6) {
      this.cardHeight = (ui.CARD_REL_HEIGHT * window.width) / 1.6;
    }
    this.cardWidth = this.cardHeight / ui.CARD_ASPECT;
    this.uiPad = (ui.UI_PAD * this.cardHeight) / 100;
    this.users = users;
    this.me = me;
    this.totalRows = settings.shape.rows;
    this.playerCards = settings.playerCards;
    this.shape = getShape(settings.shape.name);
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
        { x: 0, y: this.uiPad },
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
        x: !noShow ? this.uiPad : -this.uiPad,
        y: this.uiPad,
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
        x: !noShow ? -this.uiPad : 2 * this.uiPad,
        y: this.uiPad + this.uiPad * uidx * 0.8,
      },
      this.relative({
        x: noShow
          ? this.playerCards * ui.USER_CARD_SCALE * ui.CARD_SHAPE_X_PAD
          : -ui.USER_CARD_WIDTH * ui.USER_CARD_SCALE,
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

  busCard(shift) {
    return addPos(
      this.compensate(ui.BUS_CARD_SCALE),
      centered(this.fractional({ x: 0.5, y: 0.5 }), {
        x: this.cardWidth * ui.BUS_CARD_SCALE,
        y: this.cardHeight * ui.BUS_CARD_SCALE,
      }),
      this.relative({ x: shift * ui.BUS_CARD_SCALE * ui.CARD_SHAPE_X_PAD, y: 0 }),
    );
  }

  centeredText(text, maxWidth, style) {
    style.pos = centered(style.pos, { x: maxWidth, y: 0 });
    const compiledStyle = compileDefaultStyle(style);
    compiledStyle.fontSize = this.scaled(compiledStyle.fontSize);
    return (
      <div className="centered-text" style={{ ...compiledStyle, width: maxWidth }}>
        {text}
      </div>
    );
  }

  scaled(val) {
    return (val * this.cardHeight) / 100;
  }
};

export { Render, addPos, centered, compileDefaultStyle };
