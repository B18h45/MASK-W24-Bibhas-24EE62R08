const express = require('express');
const http = require('http');
const socketio = require('socket.io')();
const path = require('path');

const app = express();

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/chat/:room?', (req, res) => res.sendFile(path.join(__dirname, 'chat.html')));

const server = http.createServer(app);
const io = socketio.listen(server);

io.on('connection', socket => {
  const roomId = socket.request.headers.referer.split('/').pop();
  socket.roomId = roomId;
  socket.join(roomId);

  socket.on('join', (ctx) => {
    socket.username = ctx.username || 'Anonymous';
    socket.to(socket.roomId).emit('join-member', ctx);
    socket.emit('join-member', ctx);
  });

  socket.on('message', (ctx) => {
    socket.to(socket.roomId).emit('message', ctx);
    socket.emit('message', ctx);
  });

  socket.on('disconnect', () => socket.to(roomId).emit('left-member', { username: socket.username }));
});

io.on('disconnect', socket => console.log('left') || socket.to(socket.roomId).emit('left-member', ctx));

server.listen(80, () => console.log('Running on http://localhost/'));
