import swagger from "@fastify/swagger"
import swaggerUI from "@fastify/swagger-ui"
import fastify from "fastify"
import path from "path"

import { categoryRoutes } from "./app/category-routes"
import { entryRoutes } from "./app/entry-routes"
import { userRoutes } from "./app/user-routes"
import { initAuth } from "./auth"

export async function build() {
  const server = fastify({
    logger: true,
    trustProxy: true, // Important for Cloud Run
  })

  await initAuth(server)

  const publicRoutes = [
    "/documentation",
    "/status",
    "/v1/auth/login",
    "/v1/auth/register",
  ]

  server.addHook("onRequest", async (request, reply) => {
    if (publicRoutes.includes(request.url)) {
      return
    }
    return server.verifyToken(request, reply)
  })

  server.register(swagger, {
    mode: "static",
    specification: {
      path: "./swagger.json",
      baseDir: path.resolve(__dirname),
    },
  })

  server.register(swaggerUI, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next()
      },
      preHandler: function (_request, _reply, next) {
        next()
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject
    },
    transformSpecificationClone: true,
  })

  server.get("/status", async (request, reply) => {
    return reply.status(200).send({ status: "OK" })
  })

  server.register(categoryRoutes)
  server.register(entryRoutes)
  server.register(userRoutes)

  return server
}

async function start() {
  const IS_GOOGLE_CLOUD_RUN = process.env.K_SERVICE !== undefined
  const port = parseInt(process.env.PORT ?? "3000", 10)
  const host = IS_GOOGLE_CLOUD_RUN ? "0.0.0.0" : undefined

  try {
    const server = await build()
    const address = await server.listen({ port, host })
    console.log(`Listening on ${address}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = build

if (require.main === module) {
  void start()
}
