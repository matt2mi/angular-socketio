var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app); // Server(app)
var io = require('socket.io')(server);

var usersSockets = new Map();
var startPartySockets = new Map();
var firstQuestionSent = false;
var secondQuestionSent = false;
var nbMaxPlayers = 4;
var playersLies = new Map();
var playersAnswers = new Map();
var restartSocket = new Map();
var players = [];

var questions = require('../bdd/questions');

function getNewId() {
  const id = Math.floor(Math.random() * questions.length);
  return id;
}

function getQuestion() {
  return questions[getNewId()];
}

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
  console.log('sendQuestion');
  const question = getQuestion();
  io.emit('question', {
    type: 'question',
    question: question.text,
    answers: question.answers
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

function allWantStart() {
  initState();
  io.emit('all-want-start', {
    type: 'all-want-start',
    players: players
  });
}

function initState() {
  firstQuestionSent = false;
  secondQuestionSent = false;
  playersLies = new Map();
  playersAnswers = new Map();
  restartSocket = new Map();
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
      allWantStart();
    }
  });
  socket.on('stop-start-party', function () {
    startPartySockets.delete(socket);
  });

  // enough player to start party
  socket.on('users-ready', function () {
    if (!firstQuestionSent) {
      sendQuestion();
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

  socket.on('restart', function (pseudo) {
    console.log(pseudo + ' veut recommencer');
    restartSocket.set(socket, pseudo);
    if (restartSocket.size === players.length) {
      console.log('all restart');
      allWantStart();
    }
  });
  socket.on('unrestart', function (pseudo) {
    console.log(pseudo + ' ne veut plus recommencer');
    restartSocket.delete(socket);
  });
});

// Initialize our websocket server on port 5000
server.listen(5000, function () {
  console.log('io listening on port 5000');
});

module.exports = router;
