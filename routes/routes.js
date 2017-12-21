var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app); // Server(app)
var io = require('socket.io')(server);

var usersSockets = new Map();
var firstQuestionSent = false;
var nbMaxUsers = 0;
var answersSockets = new Map();

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

  socket.on('users-ready', function () {
    if (!firstQuestionSent) {
      console.log('Users ready, send first question !');
      nbMaxUsers = usersSockets.size;
      io.emit('question', {
        type: 'question',
        value: {
          pseudo: 'Jeu',
          question: 'Question de merde ?'
        }
      });
      firstQuestionSent = true;
    }
  });

  socket.on('answer', function (answer) {
    console.log('Answer Received from ' + answer.pseudo + ' : ' + answer.value);
    answersSockets.set(socket, answer);
    if(answersSockets.size === nbMaxUsers) {
      console.log(Array.from(answersSockets.values()));
      io.emit('answers', {
        type: 'answers',
        value: {
          pseudo: 'Jeu',
          answers: Array.from(answersSockets.values())
        }
      });
    }
  });

  socket.on('lie-choosen', function (lie) {
    console.log('Lie choosen by ' + lie.pseudo + ' : ' + lie.value);
    /*answersSockets.set(socket, answer);
    if(answersSockets.size === nbMaxUsers) {
      console.log(Array.from(answersSockets.values()));
      io.emit('answers', {
        type: 'answers',
        value: {
          pseudo: 'Jeu',
          answers: Array.from(answersSockets.values())
        }
      });
    }*/
  });
});

// Initialize our websocket server on port 5000
server.listen(5000, function () {
  console.log('io listening on port 5000');
});

module.exports = router;
