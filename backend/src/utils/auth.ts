import Fastify from "fastify";
import fastifyJwt from "fastify-jwt";
import { FastifyRequest } from "fastify";

export function registerAuth(app: ReturnType<typeof Fastify>) {
  app.register(fastifyJwt, { secret: process.env.JWT_SECRET || "secret" });
}

export interface AuthRequest extends FastifyRequest {
  user: any;
}

export function verifyJWT(request: any, reply: any, done: any) {
  try {
    const auth = request.headers.authorization as string;
    if (!auth) return reply.code(401).send({ error: "Missing token" });
    const token = auth.split(" ")[1];
    request.user = request.server.jwt.verify(token);
    done();
  } catch (err) {
    reply.code(401).send({ error: "Invalid token" });
  }
}
