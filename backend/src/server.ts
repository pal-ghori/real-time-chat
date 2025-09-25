import Fastify from "fastify";
import cors from "fastify-cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import roomRoutes from "./routes/rooms";
import userRoutes from "./routes/users"; // optional
import { registerAuth, verifyJWT } from "./utils/auth";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { setupSocket } from "./socket";

dotenv.config();
const app = Fastify({ logger: true });

app.register(cors, { origin: process.env.FRONTEND_URL || "*" });
registerAuth(app);

app.register(async function (fastify) {
  fastify.decorateRequest("user", null);
  // attach routes
  fastify.register(authRoutes);
  fastify.register(roomRoutes);
  // attach other routes...
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/chat-app");
    const port = Number(process.env.PORT || 4000);

    // Create http server and attach socket.io
    const httpServer = createServer(app.server);
    const io = new IOServer(httpServer, {
      cors: { origin: process.env.FRONTEND_URL || "*", methods: ["GET", "POST"] }
    });
    setupSocket(io);

    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on ${port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
