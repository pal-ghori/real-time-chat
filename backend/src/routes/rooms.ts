import { FastifyInstance } from "fastify";
import Room from "../models/Room";
import Message from "../models/Message";

export default async function roomRoutes(app: FastifyInstance) {
  // create room
  app.post("/api/rooms", { preHandler: (req, reply, done) => done() }, async (req: any, reply) => {
    const { name, isPrivate } = req.body;
    const creatorId = req.user.id;
    const r = new Room({ name, isPrivate, members: [creatorId] });
    await r.save();
    reply.send(r);
  });

  app.get("/api/rooms", async (req: any, reply) => {
    // list all rooms (could filter by membership)
    const rooms = await Room.find().sort({ createdAt: -1 }).limit(200);
    reply.send(rooms);
  });

  // messages paging: last N messages for roomId
  app.get("/api/rooms/:id/messages", async (req: any, reply) => {
    const { id } = req.params;
    const { before, limit } = req.query; // before = timestamp or messageId
    const l = parseInt(limit) || 50;
    const query: any = { room: id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(l).populate("sender", "displayName avatarUrl");
    reply.send(messages);
  });
}
