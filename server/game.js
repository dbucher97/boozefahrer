const { randomStack, shuffle } = require("./stack");

const idleState = { name: "idle", previousState: "" };
const dealtState = {
  name: "dealt",
  previousState: "idle",
  rowsPlayed: 0,
  cardsPlayed: {},
};
const giveState = {
  ...dealtState,
  name: "give",
  previousState: "dealt",
  playedThisRow: {},
};

class Game {
  constructor(io, room) {
    room = room.trim();
    this.io = io;
    this.room = room;
    this.users = [];
    this.state = idleState;
    this.settings = { lowest: 9 };
    this.stack = randomStack(this.settings.lowest);
    //  this.stateToken = true;
  }

  join(socket, name) {
    name = name.trim();
    const existing = this.users.find((user) => user.name === name);

    if (existing) {
      return { error: `"${name}" ist bereits in "${this.room}"!` };
    } else if (this.state.name !== "idle") {
      return { error: `"${this.room}" befindet sich momentan im Spiel!` };
    }

    this.users.push({ id: socket.id, name, ready: false });

    socket.join(this.room);
    this.updateUsers();
    this.updateStack();
    this.updateStateOf(socket.id);

    this.messageAll(`${name} ist beigetreten.`);

    this.print(`${name} joined.`);

    return { error: "" };
  }

  disconnected(id) {
    // TODO more complex user left handling.
    const idx = this.users.findIndex((user) => user.id === id);
    if (idx !== -1) {
      this.print(`${this.users[idx].name} left.`);
      this.users.splice(idx, 1);
      this.updateUsers();
    }
  }

  advanceState() {
    switch (this.state.name) {
      case "idle":
        if (15 + this.users.length * 3 < this.stack.length) {
          this.state = dealtState;
          setTimeout(() => this.advanceState(), 2000);
        } else {
          // TODO send error
        }
        break;
      case "dealt":
        if (this.state.rowsPlayed === 5) {
          this.state = idleState;
        } else {
          this.state = {
            ...giveState,
            rowsPlayed: this.state.rowsPlayed,
            cardsPlayed: this.state.cardsPlayed,
          };
        }

        break;
      case "give":
        console;
        this.state = {
          ...dealtState,
          previousState: "give",
          rowsPlayed: this.state.rowsPlayed + 1,
          cardsPlayed: {
            ...this.state.cardsPlayed,
            ...this.state.playedThisRow,
          },
        };
        break;
      default:
        this.state = idleState;
    }
    this.updateState();
  }

  updateStateOf(id) {
    this.io.to(id).emit("update state", this.state);
  }

  updateState() {
    this.io.to(this.room).emit("update state", this.state);
  }

  updateUsers() {
    this.io.to(this.room).emit("update users", this.users);
  }

  updateStack() {
    this.io.to(this.room).emit("update stack", this.stack);
  }

  messageAll(msg) {
    this.io.to(this.room).emit("message", msg);
  }

  getUser(id) {
    return this.users.find((user) => user.id === id);
  }

  toggleReady(id) {
    const user = this.getUser(id);
    if (user) {
      user.ready = !user.ready;
    }
    if (
      this.users.reduce(({ ready }, user) => {
        return { ready: ready & user.ready };
      }).ready
    ) {
      this.users.map((user) => (user.ready = false));
      this.advanceState();
    }
    this.updateUsers();
  }

  playCard(id, { idx, onIdx }) {
    const user = this.getUser(id);
    if (this.state.name === "give" && user) {
      const cardPlayed = {};
      cardPlayed[idx] = { onIdx, by: user.name, zIdx: 0 };
      // evaluate stacking idx
      const sameOnIdx = Object.keys(this.state.playedThisRow).filter(
        (key) => this.state.playedThisRow[key].onIdx === onIdx
      );
      console.log(sameOnIdx);
      if (sameOnIdx) {
        cardPlayed[idx].zIdx = sameOnIdx.length;
      }
      this.state.playedThisRow = { ...this.state.playedThisRow, ...cardPlayed };
      this.updateState();
    }
  }

  print(msg) {
    console.log(`[${this.room}]\t`, msg);
  }
}

module.exports = Game;
