import { SwaggerInfo } from '@/services/interfaces.js'

export function resolveRefs(swagger: SwaggerInfo) {
  const definitions = swagger.definitions || {}

  // Helper function to resolve $ref path and check if the target exists
  function resolveRef(ref: string) {
    const path = ref.split('/').slice(1) // Remove leading '#/'
    let current: SwaggerInfo = swagger
    for (const token of path) {
      // @ts-ignore
      if (current[token]) {
        // @ts-ignore
        current = current[token]
      } else {
        return null // Target does not exist
      }
    }
    return current
  }

  // Traverse the Swagger JSON and replace missing $ref
  function traverse(obj: any) {
    if (typeof obj !== 'object' || obj === null) return
    for (const key in obj) {
      if (key === '$ref') {
        const refTarget = resolveRef(obj[key])
        if (!refTarget) {
          //   console.warn(`Missing $ref: ${obj[key]}, replacing with empty object.`)
          obj[key] = { type: 'object' } // Replace with default schema
        }
      } else {
        traverse(obj[key])
      }
    }
  }

  traverse(swagger)
  return swagger
}
