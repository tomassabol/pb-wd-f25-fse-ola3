import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import { type FastifyInstance } from "fastify"
import { z } from "zod"

import { db } from "../db"
import { user as userTable } from "../db/schema"
import { Role } from "../auth"
import { hashPassword, verifyPassword } from "../utils/password"

const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.nativeEnum(Role).default(Role.USER),
  })
  .strict()

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict()

export async function userRoutes(fastify: FastifyInstance) {
  fastify.post("/v1/auth/register", {
    handler: async (request, reply) => {
      const { success, data } = createUserSchema.safeParse(request.body)
      if (!success) {
        return reply.status(400).send({ error: "Invalid request body" })
      }

      try {
        const hashedPassword = await hashPassword(data.password)
        const [user] = await db
          .insert(userTable)
          .values({
            id: createId(),
            email: data.email,
            password: hashedPassword,
            role: data.role,
          })
          .returning()

        return reply.status(201).send({
          id: user.id,
          email: user.email,
          role: user.role,
        })
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  fastify.post("/v1/auth/login", {
    handler: async (request, reply) => {
      const { success, data } = loginSchema.safeParse(request.body)
      if (!success) {
        return reply.status(400).send({ error: "Invalid request body" })
      }

      try {
        const user = await db.query.user.findFirst({
          where: eq(userTable.email, data.email),
        })

        if (!user) {
          return reply.status(401).send({ error: "Invalid credentials" })
        }

        const isValidPassword = await verifyPassword(
          data.password,
          user.password,
        )
        if (!isValidPassword) {
          return reply.status(401).send({ error: "Invalid credentials" })
        }

        const token = fastify.jwt.sign({
          id: user.id,
          role: user.role,
        })

        return reply.status(200).send({
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        })
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  fastify.get("/v1/auth/me", {
    preHandler: [fastify.verifyToken],
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ error: "Unauthorized" })
      }

      try {
        const user = await db.query.user.findFirst({
          where: eq(userTable.id, request.user.id),
        })

        if (!user) {
          return reply.status(404).send({ error: "User not found" })
        }

        return reply.status(200).send({
          id: user.id,
          email: user.email,
          role: user.role,
        })
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })
}
