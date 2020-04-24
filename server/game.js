const { randomStack } = require('./stack');
const { getShape } = require('./common/shape');

const defaultSettings = {
  shape: { name: 'Pyramid', rows: 5, total: getShape('Pyramid').getTotal(5) },
  playerCards: 3,
  lowest: 4,
  bussize: 5,
  maxPlayers: 9,
};

const idleState = { name: 'idle', previousState: '' };
const dealtState = {
  name: 'dealt',
  previousState: 'idle',
  rowsPlayed: 0,
  cardsPlayed: {},
  timeLeft: 60,
};
const giveState = {
  ...dealtState,
  name: 'give',
  previousState: 'dealt',
  playedThisRow: {},
  timeLeft: 20,
};
const whoState = {
  name: 'who',
  previousState: 'dealt',
  round: 0,
  cardsDealt: [],
  users: [],
};
const busState = {
  name: 'bus',
  previousState: 'dealt',
  currentStack: 0,
  busfahrer: '',
  busstate: '',
  cardsDealt: [],
};

const number = (a) => {
  switch (a) {
    case 'A':
      return 14;
    case 'K':
      return 13;
    case 'Q':
      return 12;
    case 'J':
      return 11;
    case 'T':
      return 10;
    default:
      return parseInt(a);
  }
};

const higher = (a, b) => {
  return number(a[0]) > number(b[0]);
};

const eq = (a, b) => {
  return number(a[0]) === number(b[0]);
};

class Game {
  constructor(io, room) {
    room = room.trim();
    this.io = io;
    this.room = room;
    this.users = [];
    this.netTimeouts = {};
    this.state = idleState;
    this.settings = defaultSettings;
    this.stack = randomStack(this.settings.lowest);
    //  this.stateToken = true;
  }

  join(socket, name) {
    if (this.users.length >= this.settings.maxPlayers) {
      return { error: `"${this.room}" ist bereits voll!` };
    }
    name = name.trim();
    const existing = this.users.find((user) => user.name === name);

    if (existing) {
      return { error: `"${name}" ist bereits in "${this.room}"!` };
    } else if (this.state.name !== 'idle') {
      return { error: `"${this.room}" befindet sich momentan im Spiel!` };
    }

    this.users.push({ id: socket.id, name, ready: false, disconnected: false, netTimeout: null });

    socket.join(this.room);
    this.updateUsers();
    this.updateStack();
    this.updateSettings();

    this.updateStateOf(socket.id);

    this.messageAll(`${name} ist beigetreten.`);

    this.print(`${name} joined.`);

    //DEBUG
    // if (this.users.length == 2) {
    // this.state = { ...busState, busfahrer: this.users[0].name };
    // this.updateState();
    // if (this.state.previousState !== 'bus') {
    //   setTimeout(() => this.advanceState(), 1000);
    // }
    // }

    return { error: '' };
  }

  disconnected(id) {
    const idx = this.users.findIndex((user) => user.id === id);
    if (idx !== -1) {
      this.print(`${this.users[idx].name} left.`);
      this.users[idx]['disconnected'] = true;
      if (this.state.name === 'who') {
        const sidx = this.state.users.findIndex((name) => name === this.users[idx].name);
        if (sidx >= 0) {
          this.state.users.splice(sidx, 1);
          if (this.state.users.length === 1) {
            this.advanceState();
          }
        }
      } else if (this.state.name === 'bus' && this.state.busfahrer === this.users[idx].name) {
        this.state = idleState;
        this.advanceState();
      }
      this.updateUsers();
    }
    if (this.state.name === 'idle') {
      this.handleDisconnects();
    }
  }

  netIssue(id, callback) {
    const idx = this.users.findIndex((user) => user.id === id);
    if (idx !== -1) {
      this.print(`${this.users[idx].name} triggered net problem.`);
      this.users[idx].netTimeout = setTimeout(() => {
        this.disconnected(id);
        callback();
      }, 15000);
    }
  }

  handleDisconnects() {
    const users_copy = [...this.users];
    this.users.map((user, idx) => {
      if (user.disconnected) {
        this.print(`${user.name} removed.`);
        users_copy.splice(idx, 1);
      }
    });
    this.users = users_copy;
    this.updateUsers();
  }

  advanceState() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    switch (this.state.name) {
      case 'idle':
        if (
          getShape(this.settings.shape.name).getTotal(this.settings.shape.rows) +
            this.users.length * this.settings.playerCards <
          this.stack.length
        ) {
          this.state = dealtState;
          // this.playCardAudio(
          //   getShape(this.settings.shape.name).getTotal(this.settings.shape.rows) +
          //     this.settings.playerCards * this.users.length,
          // );
          this.timeout = setTimeout(() => {
            this.users.map((user) => (user.ready = false));
            this.print(`New game started with ${this.users.map(({ name }) => name).join(', ')}.`);
            this.updateUsers();
            this.advanceState();
          }, 1000);
        } else {
          // TODO send error
          this.print('Not enough cards');
        }
        break;
      case 'dealt':
        if (this.state.rowsPlayed === this.settings.shape.rows) {
          const cardsPlayed = this.users
            .filter(({ disconnected }) => !disconnected)
            .map(
              (user) =>
                this.settings.playerCards -
                Object.values(this.state.cardsPlayed).filter(({ by }) => by === user.name).length,
            );
          const maxCards = Math.max(...cardsPlayed);
          const users = this.users
            .filter(({ disconnected }) => !disconnected)
            .filter((_, idx) => cardsPlayed[idx] === maxCards);
          this.state = { ...whoState };
          this.state.users = users.map(({ name }) => name);
          if (users.length > 1) {
            this.chooseBusfahrer();
          } else {
            this.advanceState();
            return;
          }
        } else {
          this.state = {
            ...giveState,
            rowsPlayed: this.state.rowsPlayed,
            cardsPlayed: this.state.cardsPlayed,
          };
          this.countdown();
        }
        break;
      case 'give':
        this.state = {
          ...dealtState,
          previousState: 'give',
          rowsPlayed: this.state.rowsPlayed + 1,
          cardsPlayed: {
            ...this.state.cardsPlayed,
            ...this.state.playedThisRow,
          },
        };
        this.countdown();
        break;
      case 'who':
        this.state = { ...busState, busfahrer: this.state.users[0] };
        this.timeout = setTimeout(() => this.advanceState(), 800);
        break;
      case 'bus':
        if (this.advanceBus()) {
          this.state = idleState;
        }
        break;
      default:
        this.state = idleState;
    }
    this.updateState();
    if (this.state.name === 'idle') {
      this.handleDisconnects();
    }
    if (
      this.state.name === 'idle' ||
      this.state.name === 'who' ||
      (this.state.name === 'bus' && this.state.previousState !== 'bus')
    ) {
      this.shuffle();
    }
  }

  advanceBus() {
    let cardsDealt = this.state.cardsDealt;
    let busstate = 'wait';
    let previousState = 'bus';
    let currentStack = this.state.currentStack;
    if (this.state.busstate === '') {
      cardsDealt = [];
      [...Array(this.settings.bussize).keys()].map((idx) => cardsDealt.push({ stack: idx, zIndex: 0 }));
      previousState = this.state.previousState;
    } else if (this.state.busstate === 'pause_deal') {
      const zIndex = this.state.cardsDealt.reduce(
        (prev, curr) => (curr.stack === this.state.currentStack ? prev + 1 : prev),
        0,
      );
      cardsDealt = [...this.state.cardsDealt, { stack: this.state.currentStack, zIndex: zIndex }];
      busstate = 'pause_next';
      this.timeout = setTimeout(() => this.advanceState(), 500);
    } else if (this.state.busstate === 'pause_next') {
      const zIndex = cardsDealt[cardsDealt.length - 1].zIndex;
      const upper = this.stack[cardsDealt.length - 1];
      const lower = this.stack[
        cardsDealt.findIndex((card) => card.stack === currentStack && card.zIndex === zIndex - 1)
      ];
      if (
        (this.state.action === 'higher' && higher(upper, lower)) ||
        (this.state.action === 'equal' && eq(upper, lower)) ||
        (this.state.action === 'lower' && higher(lower, upper))
      ) {
        currentStack += 1;
        if (this.state.action === 'equal' && currentStack >= 2) {
          return true;
        }
      } else {
        currentStack = 0;
      }
      if (currentStack >= this.settings.bussize || this.stack.length === cardsDealt.length) {
        return true;
      }
    }
    this.state = {
      ...this.state,
      cardsDealt: cardsDealt,
      currentStack: currentStack,
      previousState: previousState,
      busstate: busstate,
    };
    return false;
  }

  chooseBusfahrerLogic() {
    this.state.cardsDealt = this.state.cardsDealt.concat(
      this.state.users.map((name) => ({ name, round: this.state.round })),
    );
    this.updateState();
    this.timeout = setTimeout(() => {
      const size = this.state.users.length;
      const total = this.state.cardsDealt.length;
      const faces = this.state.users.map((_, idx) => this.stack[total - size + idx]);
      const lowest = faces.reduce((lowestFace, currentFace) => {
        return higher(currentFace, lowestFace) ? lowestFace : currentFace;
      });
      const usersLeft = this.state.users.filter((_, idx) => eq(faces[idx], lowest));
      this.state.users = usersLeft;
      if (usersLeft.length === 1) {
        this.advanceState();
      } else {
        this.updateState();
        this.state.round += 1;
      }
    }, 2000);
  }

  chooseBusfahrer() {
    this.timeout = setTimeout(() => {
      this.chooseBusfahrerLogic();
      this.timer = setInterval(() => {
        this.chooseBusfahrerLogic();
      }, 3000);
    }, 1000);
  }

  shuffle() {
    this.stack = randomStack(this.settings.lowest);
    this.updateStack();
  }

  countdown() {
    this.timer = setInterval(() => {
      this.state.timeLeft -= 1;
      if (this.state.timeLeft == 0) {
        this.users.map((user) => (user.ready = false));
        this.updateUsers();
        this.advanceState();
      } else {
        this.updateState();
      }
    }, 1000);
  }

  updateStateOf(id) {
    this.io.to(id).emit('update state', this.state);
  }

  updateState() {
    this.io.to(this.room).emit('update state', this.state);
  }

  updateUsers() {
    this.io.to(this.room).emit(
      'update users',
      this.users.map(({ name, ready, disconnected }) => ({
        name,
        ready,
        disconnected,
      })),
    );
  }

  updateStack() {
    this.io.to(this.room).emit('update stack', this.stack);
  }

  updateSettings() {
    this.io.to(this.room).emit('update settings', this.settings);
  }

  messageAll(msg) {
    this.io.to(this.room).emit('message', msg);
  }

  broadcastCardAudio(id) {
    this.users.filter((user) => user.id !== id).map((user) => this.io.to(user.id).emit('card audio', 1));
  }

  playCardAudio(n) {
    this.io.to(this.room).emit('card audio', n);
  }

  getUser(id) {
    return this.users.find((user) => user.id === id);
  }

  toggleReady(id) {
    if (this.state.name !== 'who' && this.state.name !== 'bus') {
      const user = this.getUser(id);
      if (user) {
        user.ready = !user.ready;
      }
      if (
        this.users.reduce(({ ready, disconnected }, user) => {
          return {
            ready: (ready || disconnected) & (user.ready || user.disconnected),
            disconnected: false,
          };
        }).ready
      ) {
        this.users.map((user) => (user.ready = false));
        this.advanceState();
      }
      this.updateUsers();
    }
  }

  playCard(id, { idx, onIdx }) {
    const user = this.getUser(id);
    if (this.state.name === 'give' && user) {
      const cardPlayed = {};
      cardPlayed[idx] = { onIdx, by: user.name, zIndex: 0 };
      // evaluate stacking idx
      const sameOnIdx = Object.keys(this.state.playedThisRow).filter(
        (key) => this.state.playedThisRow[key].onIdx === onIdx,
      );
      if (sameOnIdx) {
        cardPlayed[idx].zIndex = sameOnIdx.length;
      }
      this.state.playedThisRow = { ...this.state.playedThisRow, ...cardPlayed };
      this.broadcastCardAudio(id);
      this.updateState();
    }
  }

  busAction(id, text) {
    if (this.state.name === 'bus' && this.state.busstate === 'wait') {
      const user = this.getUser(id);
      if (user && user.name === this.state.busfahrer) {
        this.state = { ...this.state, busstate: 'pause_deal', action: text, previousState: 'bus' };
        this.updateState();
        this.timeout = setTimeout(() => this.advanceState(), 50);
      }
    }
  }

  newSettings(settings) {
    if (
      this.state.name === 'idle' &&
      !this.users.map(({ ready }) => ready).reduce((prev, curr) => prev || curr)
    ) {
      this.settings = settings;
      this.shuffle();
      this.updateStack();
    }
    this.updateSettings();
  }

  print(...msg) {
    console.log(`[${this.room}:${this.users.length}]\t`, ...msg);
  }
}

module.exports = Game;
