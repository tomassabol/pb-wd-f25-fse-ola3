import { createId } from "@paralleldrive/cuid2"
import { and, count, desc, eq } from "drizzle-orm"
import { type FastifyInstance } from "fastify"
import { z } from "zod"

import { db } from "../db"
import { entry as entryTable } from "../db/schema"
import { getId } from "../lib/get-id"

export const entrySchema = z
  .object({
    name: z.string().min(1),
    categoryId: z.string().min(1),
    description: z.string().min(1).nullable(),
  })
  .strict()

export async function entryRoutes(fastify: FastifyInstance) {
  // Get all entries (viewer access)
  fastify.get("/v1/entries", {
    preHandler: [fastify.verifyToken],
    handler: async (request, reply) => {
      const sort =
        (request.query as { sortByCategory?: string })?.sortByCategory ===
        "true"
      const categoryId = (request.query as { categoryId?: string })?.categoryId

      try {
        if (categoryId) {
          const entries = await db.query.entry.findMany({
            with: { category: true },
            where: and(
              eq(entryTable.categoryId, categoryId),
              eq(entryTable.active, true),
              eq(entryTable.createdBy, request.user.id),
            ),
          })

          return reply.status(200).send({ total: entries.length, entries })
        }

        const entries = await db.query.entry.findMany({
          with: { category: true },
          where: and(
            eq(entryTable.active, true),
            eq(entryTable.createdBy, request.user.id),
          ),
        })

        const [{ count: total }] = await db
          .select({ count: count() })
          .from(entryTable)
          .where(eq(entryTable.active, true))

        if (sort) {
          const sortByCategory = entries.reduce(
            (acc, entry) => {
              const categoryName = entry.category?.name ?? "Uncategorized"
              if (!acc[categoryName]) {
                acc[categoryName] = []
              }
              acc[categoryName].push(entry)
              return acc
            },
            {} as Record<string, typeof entries>,
          )

          return reply.status(200).send({ total, entries: sortByCategory })
        }

        return reply.status(200).send({ total, entries })
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  // Create entry (editor access)
  fastify.post("/v1/entries", {
    preHandler: [fastify.verifyToken],
    handler: async (request, reply) => {
      const { success, data } = entrySchema.safeParse(request.body)

      if (!success) {
        return reply.status(400).send({ error: "Invalid request body" })
      }

      try {
        const [entry] = await db
          .insert(entryTable)
          .values({
            id: createId(),
            ...data,
            createdBy: request.user.id,
          })
          .returning()

        return reply.status(201).send(entry)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  // Get entry by ID (viewer access)
  fastify.get("/v1/entries/:id", {
    preHandler: [fastify.verifyToken],
    handler: async (request, reply) => {
      const id = getId(request)

      if (!id) {
        return reply.status(400).send({ error: "Invalid path parameter ID" })
      }

      try {
        const entry = await db.query.entry.findFirst({
          where: and(
            eq(entryTable.id, id),
            eq(entryTable.active, true),
            eq(entryTable.createdBy, request.user.id),
          ),
          with: { category: true },
        })

        if (!entry) {
          return reply.status(404).send({ error: "Entry not found" })
        }

        return reply.status(200).send(entry)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  // Update entry (editor access)
  fastify.put("/v1/entries/:id", {
    preHandler: [fastify.verifyToken],
    handler: async (request, reply) => {
      const id = getId(request)

      if (!id) {
        return reply.status(400).send({ error: "Invalid path parameter ID" })
      }

      const { success, data } = entrySchema.safeParse(request.body)

      if (!success) {
        return reply.status(400).send({ error: "Invalid request body" })
      }

      try {
        const [entry] = await db
          .update(entryTable)
          .set(data)
          .where(eq(entryTable.id, id))
          .returning()

        return reply.status(200).send(entry)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })

  // Delete entry (editor access)
  fastify.delete("/v1/entries/:id", {
    preHandler: [fastify.verifyToken],
    handler: async (request, reply) => {
      const id = getId(request)

      if (!id) {
        return reply.status(400).send({ error: "Invalid path parameter ID" })
      }

      try {
        const [entry] = await db
          .update(entryTable)
          .set({ active: false })
          .where(eq(entryTable.id, id))
          .returning()

        if (!entry) {
          return reply.status(404).send({ error: "Entry not found" })
        }

        return reply.status(200).send(entry)
      } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Internal server error" })
      }
    },
  })
}
