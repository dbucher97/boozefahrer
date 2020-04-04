const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const path = require('path');
//const cors = require("cors");
const socketIo = require('socket.io');

const Game = require('./server/game');

const port = process.env.PORT || 4001;

const app = express();

// Serve React app
app.use(favicon(path.join(__dirname, './client/public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, './client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + './client/build/index.html'));
});

const server = http.createServer(app);

const io = socketIo(server);

let games = [];

const findGame = (room) => games.find((game) => game.room === room);

const cleanGame = (g) => {
  if (
    games[g] &&
    (!games[g].users ||
      games[g].users.length === 0 ||
      games[g].users.map(({ disconnected }) => disconnected).reduce((prev, curr) => prev && curr))
  ) {
    console.log(`>>\tClosed room ${games[g].room}`);
    if (games[g].timer) clearInterval(games[g].timer);
    if (games[g].timout) clearTimeout(games[g].timeout);
    games.splice(g, 1);
  }
};

//Socket.IO
io.on('connection', (socket) => {
  console.log('>>\tclient connected');

  socket.on('join', ({ room, name }, callback) => {
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
    console.log(`>>\tcurrently ${games.length} games.`);
  });

  socket.on('ready', ({ room }) => {
    const game = findGame(room);
    if (game) {
      game.toggleReady(socket.id);
    }
  });

  socket.on('play card', ({ room, payload }) => {
    const game = findGame(room);
    if (game) {
      game.playCard(socket.id, payload);
    }
  });

  socket.on('busaction', ({ room, payload }) => {
    const game = findGame(room);
    if (game) {
      game.busAction(socket.id, payload);
    }
  });

  socket.on('settings', ({ room, payload }) => {
    const game = findGame(room);
    if (game) {
      game.newSettings(payload);
    }
  });

  socket.on('disconnect', () => {
    const g = games.findIndex((game) => {
      return game.getUser(socket.id) !== undefined;
    });
    if (g >= 0) {
      games[g].disconnected(socket.id);
      if (games[g].users && games[g].users.length == 0) {
        games.splice(g, 1);
      }
      cleanGame(g);
    }
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
