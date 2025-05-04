import { describe, expect, beforeAll, afterAll, test, vi } from "vitest"
import { build } from "../src/index"
import { type FastifyInstance } from "fastify"

describe("API", () => {
  let server: FastifyInstance

  beforeAll(async () => {
    server = await build()
    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  // TODO: Add tests
})
