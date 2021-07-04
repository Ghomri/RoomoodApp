const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Roomood Bot';

// Run when client connects

io.on('connection', socket => {
    console.log('New WS Connection...'); // Not required

    socket.on('joinRoom', ({ username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(botName, `Welcome to Roomood ${username}! You have joined the room "${room}".`));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username } has joined the chat`));

        // Send user and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        // Runs when client disconnects
        socket.on('disconnect', () => {
            const user = userLeave(socket.id);

            if(user) {
                io.to(user.room).emit('message', formatMessage(botName, `${user.username } has left the chat`));

                // Send user and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });
    });

    // Listen for chatMessage form Main.js
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

});

const hostname = '0.0.0.0';
const port = 3000; //|| process.env.PORT;

server.listen(port, () => console.log(`Server running on post ${port}`));

// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Zeet Node');
// });

// server.listen(port, hostname, () => {
//     console.log(`Server running at http:://${hostname}:${$port}/`);
// }); 