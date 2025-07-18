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

// Socket.io setup
export const io = new Server(server, {
  cors: {
    origin: "https://chat-application-nu-five.vercel.app", // ✅ frontend origin
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Online user map
export const userSocketMap = {}; // { userId: [socketId1, socketId2, ...] }

// ✅ Middleware to extract userId from socket.auth
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error("userId missing in socket auth"));
  }
  socket.userId = userId;
  next();
});

// ✅ Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log("User Connected:", userId);

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = [];
  }
  userSocketMap[userId].push(socket.id);

  // Broadcast current online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);
    if (userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware
app.use(express.json({ limit: '4mb' }));
app.use(cors({
  origin: "https://chat-application-nu-five.vercel.app", // ✅ match frontend
  methods: ["GET", "POST"],
  credentials: true
}));

// Routes
app.use("/api/status", (req, res) => res.send("Server is live!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();

// Start server in dev only (Vercel will handle prod exports)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
}

// Export server for Vercel deployment
export default server;
