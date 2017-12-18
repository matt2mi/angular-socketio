let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

io.on('connection', (socket) => {
    // Log whenever a client disconnects from our websocket server
    socket.on('disconnect', () => console.log('user disconnected'));

    // When we receive a 'message' event from our client, print out
    // the contents of that message and then echo it back to our client
    // using `io.emit()`
    socket.on('message', (message) => {
        console.log("Message Received from " + message.pseudo + " : " + message.message);
        io.emit('message', {type: 'new-message', value: message});
    });

    socket.on('new-user', (pseudo) => {
        console.log("New user connected : " + pseudo);
        io.emit('new-user', {type: 'new-user', pseudo: pseudo});
    });
});



// Create link to Angular build directory
app.use(express.static(__dirname + "/dist/"));

// Initialize our websocket server on port 5000
app.listen(5000, () => {
    console.log('started on port 5000');
});

// Generic error handler used by all endpoints.
//function handleError(res, reason, message, code) {
//    console.log("ERROR: " + reason);
//    res.status(code || 500).json({"error": message});
//}
