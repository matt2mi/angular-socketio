var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app); // Server(app)
var io = require('socket.io')(server);

var usersSockets = new Map();
var startPartySockets = new Map();
var firstQuestionSent = false;
var nbMaxPlayers = 4;
var playersLies = new Map();
var playersAnswers = new Map();
var players = [];

var questions = [
  {
    text: 'El colacho est un festival espagnol où les gens s\'habille en diables et sautent au dessus de...',
    answers: ['bébé', 'bebe', 'bébés', 'bebes'],
    lies: ['voitures', 'piscines']
  }, {
    text: 'Dans la ville d\'Alliance au Nebraska, on peut voir une réplique du Stonehenge faite de...',
    answers: ['voiture', 'voitures'],
    lies: ['crottes', 'patates']
  }
];

function addPlayer(pseudo) {
  players.push({pseudo: pseudo});
}

function deletePlayer(pseudo) {
  var id = -1;
  players.forEach(function (player, i) {
    if (player.pseudo === pseudo) id = i;
  });
  players.splice(id, 1);
}

function sendQuestion() {
  io.emit('question', {
    type: 'question',
    question: questions[0].text,
    answers: questions[0].answers
  });
  firstQuestionSent = true;
}

function getPlayersLies() {
  return Array.from(playersLies.values());
}

function getPcLies() {
  return [
    {pseudo: 'pc', value: questions[0].lies[0]}
  ];
}

function getGoodAnswer() {
  return {pseudo: 'truth', value: questions[0].answers[0]};
}

io.on('connection', function (socket) {

  // Log whenever a client disconnects from our websocket server
  socket.on('disconnect', function () {
    var pseudo = usersSockets.get(socket);
    usersSockets.delete(socket);
    deletePlayer(pseudo);
    io.emit('user-out', {
      type: 'user-out',
      players: players
    });
  });

  socket.on('new-user', function (pseudo) {
    usersSockets.set(socket, pseudo);
    addPlayer(pseudo);

    io.emit('new-user-detail', {
      type: 'new-user-detail',
      players: players,
      nbMaxPlayers: nbMaxPlayers
    });
  });

  socket.on('start-party', function (pseudo) {
    startPartySockets.set(socket, pseudo);
    if (startPartySockets.size === usersSockets.size) {
      io.emit('all-wants-start', {
        type: 'all-wants-start',
        players: players
      });
    }
  });
  socket.on('stop-start-party', function (pseudo) {
    startPartySockets.delete(socket);
  });

  // enough player to start party
  socket.on('users-ready', function () {
    if (!firstQuestionSent) {
      sendQuestion(io);
    }
  });

  // each player send his written lie <=> sending back all lies
  socket.on('lying', function (lie) {
    playersLies.set(socket, lie);
    if (playersLies.size === players.length) {
      io.emit('lies', {
        type: 'lies',
        playersLies: getPlayersLies(),
        pcLies: getPcLies(),
        goodAnswers: getGoodAnswer()
      });
    }
  });

  // each player has choosen a good answer <=> sending back lists of player/lie/answer
  socket.on('answer', function (playerAnswer) {
    // liste des réponses
    playersAnswers.set(socket, playerAnswer);

    if (playersAnswers.size === players.length) {
      io.emit('scores', {
        type: 'scores',
        playersAnswers: Array.from(playersAnswers.values()),
        goodAnswer: getGoodAnswer()
      });
    }
  });
});

// Initialize our websocket server on port 5000
server.listen(5000, function () {
  console.log('io listening on port 5000');
});

module.exports = router;
