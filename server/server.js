import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with CORS settings
export const io = new Server(server, {
  cors: {
    origin: "*", // Or restrict to your frontend domain
    methods: ["GET", "POST"]
  }
});

// Store multiple sockets per user
export const userSocketMap = {}; // { userId: [socketId1, socketId2, ...] }

// Validate query param before connection is allowed
io.use((socket, next) => {
  const userId = socket.handshake.query.userId;
  if (!userId) {
    return next(new Error("userId is required in query"));
  }
  next();
});

// Handle socket connections
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    userSocketMap[userId].push(socket.id);
  }

  // Notify all clients of the current online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setup
app.use(express.json({ limit: '4mb' }));
app.use(cors());

// Route Setup
app.use("/api/status", (req, res) => res.send("Server is live!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();

// Always start the server (in all environments)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));

// Export for Vercel (although Vercel is not recommended for sockets)
export default server;
