import "dotenv/config"

import { type FastifyReply, type FastifyRequest } from "fastify"

import { env } from "../env"

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const authHeader = request.headers["x-api-key"]
  if (!authHeader || authHeader !== env.API_KEY) {
    return reply.status(401).send({ message: "Unauthorized" })
  }
}
