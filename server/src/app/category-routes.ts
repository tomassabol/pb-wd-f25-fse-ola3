import { createId } from "@paralleldrive/cuid2"
import { and, desc, eq } from "drizzle-orm"
import { type FastifyInstance } from "fastify"
import { z } from "zod"

import { db } from "../db"
import { category as categoryTable } from "../db/schema"
import { getId } from "../lib/get-id"

export const categorySchema = z
  .object({
    name: z.string().min(1),
  })
  .strict()

export async function categoryRoutes(fastify: FastifyInstance) {
  // Get all categories (viewer access)
  fastify.get("/v1/categories", {
    preHandler: fastify.auth([fastify.verifyToken, fastify.requireViewer]),
    handler: async (request, reply) => {
      try {
        const categories = await db.query.category.findMany({
          where: eq(categoryTable.active, true),
        })

        return reply.status(200).send(categories)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  // Create category (editor access)
  fastify.post("/v1/categories", {
    preHandler: fastify.auth([fastify.verifyToken, fastify.requireEditor]),
    handler: async (request, reply) => {
      const { success, data } = categorySchema.safeParse(request.body)

      if (!success) {
        return reply.status(400).send({ error: "Invalid request body" })
      }

      try {
        const [category] = await db
          .insert(categoryTable)
          .values({ id: createId(), ...data })
          .returning()

        return reply.status(201).send(category)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  // Get category by ID (viewer access)
  fastify.get("/v1/categories/:id", {
    preHandler: fastify.auth([fastify.verifyToken, fastify.requireViewer]),
    handler: async (request, reply) => {
      const id = getId(request)

      if (!id) {
        return reply.status(400).send({ error: "Invalid path parameter ID" })
      }

      try {
        const category = await db.query.category.findFirst({
          where: and(eq(categoryTable.id, id), eq(categoryTable.active, true)),
        })

        if (!category) {
          return reply.status(404).send({ error: "Category not found" })
        }

        return reply.status(200).send(category)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  // Update category (editor access)
  fastify.put("/v1/categories/:id", {
    preHandler: fastify.auth([fastify.verifyToken, fastify.requireEditor]),
    handler: async (request, reply) => {
      const id = getId(request)

      if (!id) {
        return reply.status(400).send({ error: "Invalid path parameter ID" })
      }

      const { success, data } = categorySchema.partial().safeParse(request.body)

      if (!success) {
        return reply.status(400).send({ error: "Invalid request body" })
      }

      if (Object.keys(data).length === 0) {
        return reply.status(400).send({ error: "No valid fields to update" })
      }

      try {
        const [category] = await db
          .update(categoryTable)
          .set(data)
          .where(eq(categoryTable.id, id))
          .returning()

        return reply.status(200).send(category)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  // Delete category (editor access)
  fastify.delete("/v1/categories/:id", {
    preHandler: [fastify.verifyToken, fastify.requireEditor],
    handler: async (request, reply) => {
      const id = getId(request)

      if (!id) {
        return reply.status(400).send({ error: "Invalid path parameter ID" })
      }

      try {
        const [category] = await db
          .update(categoryTable)
          .set({ active: false })
          .where(eq(categoryTable.id, id))
          .returning()

        if (!category) {
          return reply.status(404).send({ error: "Category not found" })
        }

        return reply.status(200).send(category)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })
}
