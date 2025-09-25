import { Server as IOServer } from "socket.io";
import Message from "./models/Message";
import Room from "./models/Room";
import jwt from "jsonwebtoken";

export function setupSocket(io: IOServer) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error("Authentication error"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
      (socket as any).user = payload;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log("socket connected", user.email);

    // join a room
    socket.on("joinRoom", async (roomId) => {
      socket.join(roomId);
      // broadcast presence
      io.to(roomId).emit("presence", { userId: user.id, status: "online" });
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      io.to(roomId).emit("presence", { userId: user.id, status: "offline" });
    });

    socket.on("sendMessage", async (payload) => {
      // payload: { roomId, text }
      const { roomId, text } = payload;
      const m = new Message({ room: roomId, sender: user.id, text, createdAt: new Date() });
      await m.save();
      const full = await m.populate("sender", "displayName avatarUrl");
      io.to(roomId).emit("message", full);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnect", user.email);
    });
  });
}
