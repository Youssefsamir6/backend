require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.join('logs'); // Room for logs/alerts

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for services
global.io = io;

// Test Route
app.get("/", (req, res) => {
  res.send("Smart Access Backend w/ Socket.io");
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/logs', require('./routes/log.routes'));
app.use('/api/alerts', require('./routes/alert.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/access-event', require('./routes/accessEvent.routes'));

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server + Socket.io on port ${PORT}`);
});

