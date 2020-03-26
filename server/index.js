const express = require("express");
const http = require("http");
//const cors = require("cors");
const socketIo = require("socket.io");

const Game = require("./game");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
// app.use(cors());
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

const games = [];

const findGame = (room) => games.find((game) => game.room === room);

//Socket.IO
io.on("connection", (socket) => {
  console.log(">>\tclient connected");

  socket.on("join", ({ room, name }, callback) => {
    room = room.trim();

    let game = findGame(room);
    if (!game) {
      game = new Game(io, room);
    }

    res = game.join(socket, name);

    if (!res.error && game.users.length == 1) {
      games.push(game);
    }
    callback(res);
    console.log(`>> currently ${games.length} games.`);
  });

  socket.on("ready", ({ room }) => {
    const game = findGame(room);
    if (game) {
      game.toggleReady(socket.id);
    }
  });

  socket.on("play card", ({room, payload}) => {
    const game = findGame(room);
    if (game) {
      game.playCard(socket.id, payload);
    }
  });

  socket.on("disconnect", () => {
    const g = games.findIndex((game) => game.getUser(socket.id) !== null);
    if (games[g]) {
      games[g].disconnected(socket.id);
      if (games[g].users && games[g].users.length == 0) {
        games.splice(g, 1);
      }
    }
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
