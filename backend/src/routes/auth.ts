import { FastifyInstance } from "fastify";
import User from "../models/User";
import bcrypt from "bcryptjs";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/register", async (req: any, reply) => {
    const { email, password, displayName, avatarUrl } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return reply.code(400).send({ error: "Email in use" });
    const hash = bcrypt.hashSync(password, 10);
    const u = new User({ email, passwordHash: hash, displayName, avatarUrl });
    await u.save();
    const token = app.jwt.sign({ id: u._id, email: u.email, displayName: u.displayName });
    reply.send({ token, user: { id: u._id, email: u.email, displayName: u.displayName, avatarUrl } });
  });

  app.post("/api/auth/login", async (req: any, reply) => {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return reply.code(401).send({ error: "Invalid credentials" });
    const ok = bcrypt.compareSync(password, u.passwordHash);
    if (!ok) return reply.code(401).send({ error: "Invalid credentials" });
    const token = app.jwt.sign({ id: u._id, email: u.email, displayName: u.displayName });
    reply.send({ token, user: { id: u._id, email: u.email, displayName: u.displayName, avatarUrl: u.avatarUrl } });
  });

  app.get("/api/auth/me", { preHandler: (req, reply, done) => { /* verifyJWT later registered */ done(); } }, async (req: any, reply) => {
    const userId = req.user?.id;
    if (!userId) return reply.code(401).send({ error: "Not authenticated" });
    const u = await User.findById(userId).select("-passwordHash");
    reply.send({ user: u });
  });
}
