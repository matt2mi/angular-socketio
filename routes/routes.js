var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app); // Server(app)
var io = require('socket.io')(server);

var usersSockets = new Map();
var firstQuestionSent = false;
var nbMaxUsers = 0;
var playersLies = new Map();
var playersAnswers = new Map();

io.on('connection', function (socket) {
  // Log whenever a client disconnects from our websocket server
  socket.on('disconnect', function () {
    var pseudo = usersSockets.get(socket);
    usersSockets.delete(socket);
    console.log('user disconnected: ' + pseudo);
    io.emit('user-out', {
      type: 'user-out',
      value: {pseudo: '', message: 'Bye bye ' + pseudo},
      nbUsers: usersSockets.size
    });
  });

  socket.on('new-user', function (pseudo) {
    usersSockets.set(socket, pseudo);
    console.log('New user connected : ' + pseudo);
    io.emit('new-user', {
      type: 'new-user',
      value: {pseudo: '', message: 'New user connected : ' + pseudo},
      nbUsers: usersSockets.size
    });
  });

  // enough player to start party
  socket.on('users-ready', function () {
    if (!firstQuestionSent) {
      console.log('Users ready - send first question !');
      nbMaxUsers = usersSockets.size;
      io.emit('question', {
        type: 'question',
        question: 'Question de merde ?'
      });
      firstQuestionSent = true;
    }
  });

  // each player send his written lie <=> sending back all lies
  socket.on('lying', function (lie) {
    console.log('lying - ' + lie.pseudo + ' lies with : ' + lie.value);
    playersLies.set(socket, lie);
    if (playersLies.size === nbMaxUsers) {
      console.log(Array.from(playersLies.values()));
      io.emit('lies', {
        type: 'lies',
        playersLies: Array.from(playersLies.values())
      });
    }
  });

  // each player has choosen a good answer <=> sending back lists of player/lie/answer
  socket.on('answer', function (answer) {
    console.log('answer - ' + answer.pseudo + ' chooses answer : ' + answer.value);
    playersAnswers.set(socket, answer); // réponse de chaque joueur

    if (playersAnswers.size === nbMaxUsers) {
      console.log('playersLies: ', Array.from(playersLies.values()));
      console.log('playersAnswers: ', Array.from(playersAnswers.values()));
      io.emit('scores', {
        type: 'scores',
        // liste des mensonges
        playersLies: Array.from(playersLies.values()),
        // liste des réponses
        playersAnswers: Array.from(playersAnswers.values())
      });
    }
  });
});

// Initialize our websocket server on port 5000
server.listen(5000, function () {
  console.log('io listening on port 5000');
});

module.exports = router;
