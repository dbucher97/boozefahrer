const { randomStack, shuffle } = require('./stack');

const idleState = { name: 'idle', previousState: '' };
const dealtState = {
  name: 'dealt',
  previousState: 'idle',
  rowsPlayed: 0,
  cardsPlayed: {},
  timeLeft: 10,
};
const giveState = {
  ...dealtState,
  name: 'give',
  previousState: 'dealt',
  playedThisRow: {},
  timeLeft: 10,
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

const highereq = (a, b) => {
  return number(a[0]) >= number(b[0]);
};

class Game {
  constructor(io, room) {
    room = room.trim();
    this.io = io;
    this.room = room;
    this.users = [];
    this.state = idleState;
    this.settings = { lowest: 4, playerCards: 3 };
    this.stack = randomStack(this.settings.lowest);
    //  this.stateToken = true;
  }

  join(socket, name) {
    name = name.trim();
    const existing = this.users.find((user) => user.name === name);

    if (existing) {
      return { error: `"${name}" ist bereits in "${this.room}"!` };
    } else if (this.state.name !== 'idle') {
      return { error: `"${this.room}" befindet sich momentan im Spiel!` };
    }

    this.users.push({ id: socket.id, name, ready: false, disconnected: false });

    socket.join(this.room);
    this.updateStateOf(socket.id);
    this.updateUsers();
    this.updateStack();

    this.messageAll(`${name} ist beigetreten.`);

    this.print(`${name} joined.`);

    return { error: '' };
  }

  disconnected(id) {
    const idx = this.users.findIndex((user) => user.id === id);
    if (idx !== -1) {
      this.print(`${this.users[idx].name} left.`);
      this.users[idx]['disconnected'] = true;
      if (
        this.users.reduce(({ disconnected }, user) => {
          return { disconnected: disconnected && user.disconnected };
        }).disconnected
      ) {
        this.users = [];
      }
      if (this.state.name === 'who') {
        const sidx = this.state.users.findIndex((name) => name === this.users[idx].name);
        if (sidx >= 0) {
          this.state.users.splice(sidx, 1);
          if (this.state.users.length === 1) {
            this.advanceState();
          } else {
            this.updateState();
          }
        }
      } else if (this.state.name === 'bus' && this.state.busfahrer === this.users[idx].name) {
        this.state = idleState;
        this.shuffle();
        this.updateState();
      }
      this.updateUsers();
    }
    if (this.state.name === 'idle') {
      this.handleDisconnects();
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
    switch (this.state.name) {
      case 'idle':
        if (15 + this.users.length * this.settings.playerCards < this.stack.length) {
          this.state = dealtState;
          setTimeout(() => {
            this.users.map((user) => (user.ready = false));
            this.updateUsers();
            this.advanceState();
          }, 1000);
        } else {
          // TODO send error
          this.print('Not enough cards');
        }
        break;
      case 'dealt':
        if (this.state.rowsPlayed === 1) {
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
          if (users.length > 1) {
            this.state.users = users.map(({ name }) => name);
            this.chooseBusfahrer();
          } else {
            this.advanceState();
            return;
          }
          this.shuffle();
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
        setTimeout(() => this.advanceState(), 2000);
        break;
      default:
        this.state = idleState;
    }
    this.updateState();
    if (this.state.name === 'idle') {
      this.handleDisconnects();
      this.shuffle();
    }
  }

  chooseBusfahrerLogic() {
    this.state.cardsDealt = this.state.cardsDealt.concat(
      this.state.users.map((name) => ({ name, round: this.state.round })),
    );
    this.updateState();
    setTimeout(() => {
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
    }, 3000);
  }

  chooseBusfahrer() {
    setTimeout(() => {
      this.chooseBusfahrerLogic();
      this.timer = setInterval(() => {
        this.chooseBusfahrerLogic();
      }, 4000);
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
    this.io.to(this.room).emit('update users', this.users);
  }

  updateStack() {
    this.io.to(this.room).emit('update stack', this.stack);
  }

  messageAll(msg) {
    this.io.to(this.room).emit('message', msg);
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
      this.updateState();
    }
  }

  print(...msg) {
    console.log(`[${this.room}]\t`, ...msg);
  }
}

module.exports = Game;
