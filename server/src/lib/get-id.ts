import { type FastifyRequest } from "fastify"

export function getId(request: FastifyRequest) {
  const id = (request.params as { id: string })?.id
  if (!id) {
    return undefined
  }
  return id
}
