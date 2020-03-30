import * as ui from './UIConstants';
import Pyramid from './shapes/Pyramid';

const defaultStyle = {
  width: 0,
  height: 0,
  clickable: false,
  zIndex: 0,
  pos: { x: 0, y: 0 },
  scale: 1,
  elevation: 0,
  transitionDelay: 0,
  delay: 0,
  rotateZ: 0,
  flipped: true,
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
    width: style.width,
    height: style.height,
    cursor: style.clickable ? 'pointer' : 'default',
    zIndex: style.zIndex,
    transitionDelay: `${style.delay}s`,
    transform: `translateX(${style.pos.x}px)
                translateY(${style.pos.y}px)
                scale(${style.scale})
                translateZ(${style.elevation + (style.clickable && style.hover ? ui.HOVER_ELEVATION : 0)}px)
                rotateY(${style.flipped ? 180 : 0}deg)
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
        this.relative({ x: ridx * ui.CARD_VIEW_SCALE * ui.CARD_SHAPE_X_PAD, y: 0 }),
        this.relative({
          x: ((rowLength - 1) * ui.CARD_SHAPE_X_PAD + 1) * ui.CARD_VIEW_SCALE,
          y: ui.CARD_VIEW_SCALE,
        }),
      ),
    );
  }

  userMe(outside) {
    return addPos(
      {
        x: !outside ? ui.UI_PAD : 0,
        y: ui.UI_PAD,
      },
      this.relative({
        x: -(outside ? this.playerCards * ui.USER_ME_CARD_SCALE * ui.CARD_SHAPE_X_PAD : 0),
        y: 0,
      }),
    );
  }

  userMeCard(idx, outside) {
    return addPos(
      this.compensate(ui.USER_ME_CARD_SCALE),
      this.relative({ x: ui.USER_ME_CARD_SCALE * ui.CARD_SHAPE_X_PAD * idx, y: 0 }),
      this.userMe(outside),
    );
  }

  user(uidx, outside) {
    return addPos(
      this.fractional({ x: 1, y: 0 }),
      {
        x: !outside ? -ui.UI_PAD - ui.USER_CARD_WIDTH - ui.UI_PAD * 0.5 : 0,
        y: ui.UI_PAD + ui.UI_PAD * uidx,
      },
      this.relative({
        x: outside ? this.playerCards * ui.USER_CARD_SCALE * ui.CARD_SHAPE_X_PAD : 0,
        y: uidx * ui.USER_CARD_SCALE,
      }),
    );
  }

  userCard(uidx, idx, outside) {
    return addPos(
      this.compensate(ui.USER_CARD_SCALE),
      this.relative({ x: -idx * ui.USER_CARD_SCALE * ui.CARD_SHAPE_X_PAD, y: 0 }),
      this.user(uidx, outside),
    );
  }
};

export { Render, addPos, centered, compileDefaultStyle };