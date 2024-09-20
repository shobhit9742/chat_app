const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./config/config");
// const authenticateToken = require("./middleware/authMiddelware");
const authRoutes = require("./routes/auth");

// Initialize Express
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_1,
];

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);

// Simple user storage for online users
let onlineUsers = {};

// Socket.io middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = user;
    next();
  });
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.username}`);

  // Add to online users
  onlineUsers[socket.user.username] = socket.id;

  // Broadcast that a user has joined
  io.emit("message", {
    user: "System",
    text: `${socket.user.username} has joined the chat`,
  });

  // Listen for chat messages
  socket.on("chatMessage", (msg) => {
    io.emit("message", { user: socket.user.username, text: msg });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.username}`);
    delete onlineUsers[socket.user.username];
    io.emit("message", {
      user: "System",
      text: `${socket.user.username} has left the chat`,
    });
  });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
