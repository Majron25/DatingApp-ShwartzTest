import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
  }
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.emit('message', 'Connected to the server!');

  socket.on('initialize', (data) => {
    socket.customUserId = data.userId;
    socket.customChatId = data.chatId;
    console.log(`User ${socket.id} initialized with userId ${socket.customUserId} and chatId ${socket.customChatId}`);
  });

  socket.on('joinRoom', (data) => {
    socket.join(data.chatId);
  });
  socket.on('sendMessage', (data) => {
    socket.to(data.chatID).emit('receiveMessage', {message: data.messageText, sender: data.userID, sentAt: new Date()});
  }); 

  socket.on('isTyping', (data) => {
    socket.to(data.chatID).emit('isTyping', {status: data.isTyping, userID: data.userID});
  }); 

  socket.on('clientMessage', (message) => {
    console.log(`Message from client ${socket.id}:`, message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Message server running on http://localhost:${PORT}`);
});
