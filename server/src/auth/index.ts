import { type FastifyInstance } from "fastify"
import { type FastifyRequest, type FastifyReply } from "fastify"
import { type JWT } from "@fastify/jwt"
import auth from "@fastify/auth"
import jwt from "@fastify/jwt"
import { env } from "../env"

export enum Role {
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
  USER = "user",
}

export type User = {
  id: string
  role: Role
}

// Extend FastifyRequest to include our user and JWT
declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: User
  }
}

// Extend FastifyInstance to include our auth methods
declare module "fastify" {
  interface FastifyInstance {
    verifyToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireAdmin: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>
    requireEditor: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>
    requireViewer: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>
    requireUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export async function verifyToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "")
    if (!token) {
      return reply.status(401).send({ error: "No token provided" })
    }

    const decoded = request.server.jwt.verify<User>(token)
    request.user = decoded
  } catch (err) {
    console.error("Token verification error:", err)
    return reply.status(401).send({ error: "Invalid token" })
  }
}

export function requireRole(role: Role) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send({ error: "Unauthorized" })
    }

    const userRole = request.user.role
    if (userRole !== Role.ADMIN && userRole !== role) {
      return reply.status(403).send({ error: "Insufficient permissions" })
    }
  }
}

export async function initAuth(fastify: FastifyInstance) {
  // Register JWT plugin
  await fastify.register(jwt, {
    secret: env.JWT_SECRET || "your-secret-key",
  })

  // Register auth plugin
  await fastify.register(auth)

  // Add verifyToken to the auth decorator
  fastify.decorate("verifyToken", verifyToken)

  // Add role-based auth decorators
  fastify.decorate("requireAdmin", requireRole(Role.ADMIN))
  fastify.decorate("requireEditor", requireRole(Role.EDITOR))
  fastify.decorate("requireViewer", requireRole(Role.VIEWER))
  fastify.decorate("requireUser", requireRole(Role.USER))

  // Register auth strategies
  fastify.auth([fastify.verifyToken])
}
