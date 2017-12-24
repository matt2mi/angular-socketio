var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app); // Server(app)
var io = require('socket.io')(server);

var usersSockets = new Map();
var firstQuestionSent = false;
var nbMaxPlayers = 2;
var playersLies = new Map();
var playersAnswers = new Map();
var players = [];

var addPlayer = function(pseudo) {
  players.push({pseudo: pseudo});
  console.log(players);
};
var deletePlayer = function(pseudo) {
  var id = -1;
  players.forEach(function(player, i) {
    if(player.pseudo === pseudo) id = i;
  });
  players.splice(id, 1);
  console.log(players);
};

io.on('connection', function (socket) {

  // Log whenever a client disconnects from our websocket server
  socket.on('disconnect', function () {
    var pseudo = usersSockets.get(socket);
    usersSockets.delete(socket);
    deletePlayer(pseudo);

    console.log('user disconnected: ' + pseudo);
    io.emit('user-out', {
      type: 'user-out',
      players: players
    });
  });

  socket.on('new-user', function (pseudo) {
    usersSockets.set(socket, pseudo);
    console.log('New user connected : ' + pseudo);
    addPlayer(pseudo);

    io.emit('new-user-detail', {
      type: 'new-user-detail',
      players: players,
      nbMaxPlayers: nbMaxPlayers
    });
  });

  // enough player to start party
  socket.on('users-ready', function () {
    if (!firstQuestionSent) {
      console.log('Users ready - send first question !');
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
    if (playersLies.size === nbMaxPlayers) {
      console.log(Array.from(playersLies.values()));
      io.emit('lies', {
        type: 'lies',
        playersLies: Array.from(playersLies.values())
      });
    }
  });

  // each player has choosen a good answer <=> sending back lists of player/lie/answer
  socket.on('answer', function (playerAnswer) {
    console.log('answer - ' + playerAnswer.pseudo + ' chooses answer : ' + playerAnswer.answer.value + ' from '
      + playerAnswer.answer.pseudo);

    // liste des réponses
    playersAnswers.set(socket, playerAnswer);

    if (playersAnswers.size === nbMaxPlayers) {
      console.log('playersLies: ', Array.from(playersLies.values()));
      console.log('playersAnswers: ', Array.from(playersAnswers.values()));
      io.emit('scores', {
        type: 'scores',
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
