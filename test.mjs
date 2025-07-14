import SwaggerParser from '@apidevtools/swagger-parser'
import axios from 'axios'

function findOperation(spec, operationId) {
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (operation.operationId === operationId) {
        return {
          path,
          method: method.toUpperCase(),
          operation,
        }
      }
    }
  }
  throw new Error(`operationId "${operationId}" not found`)
}

// 仅解析某个对象的 $ref
async function dereferencePartial(obj, fullSpec) {
  // 用一个新的对象作为 fake spec，注入 fullSpec 的 definitions/schemas 环境
  const fakeSpec = {
    components: fullSpec.components, // OpenAPI 3
    definitions: fullSpec.definitions, // Swagger 2
    ...obj,
  }

  console.log({ fakeSpec })
  // 只会解引用 obj 中涉及到的 $ref
  const dereferenced = await SwaggerParser.dereference(fakeSpec)
  return dereferenced
}

// Preprocess Swagger JSON to handle missing $ref
function resolveRefs(swagger) {
  const definitions = swagger.definitions || {}

  // Helper function to resolve $ref path and check if the target exists
  function resolveRef(ref) {
    const path = ref.split('/').slice(1) // Remove leading '#/'
    let current = swagger
    for (const token of path) {
      if (current[token]) {
        current = current[token]
      } else {
        return null // Target does not exist
      }
    }
    return current
  }

  // Traverse the Swagger JSON and replace missing $ref
  function traverse(obj) {
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

function filterPath(swaggerInfo, operationId) {
  let paths = {}
  for (const path in swaggerInfo.paths) {
    // path 示例： /micro/contract/manager/v2/auctionItems
    if (Object.prototype.hasOwnProperty.call(swaggerInfo.paths, path)) {
      // methods 示例： { get: { operationId: 'getAuctionItems', ... }, post: { operationId: 'postAuctionItems', ... } }
      const methods = swaggerInfo.paths[path]
      for (const method in methods) {
        if (Object.prototype.hasOwnProperty.call(methods, method)) {
          const methodDefinition = methods[method]
          if (methodDefinition.operationId === operationId) {
            paths[path] = {
              [method]: methodDefinition,
            }
          }
        }
      }
    }
  }
  return paths
}

async function main() {
  const response = await axios.get('')
  let swagger = response.data

  const operationId = 'contractListUsingPOST' // 你的目标 operationId
  swagger = resolveRefs(swagger)

  const paths = filterPath(swagger, operationId)
  console.log(paths)
  swagger.paths = paths
  //   const bundledOp = await SwaggerParser.bundle(swagger)
  //   console.log(JSON.stringify(bundledOp, null, 2))
  SwaggerParser.dereference(swagger, {
    continueOnError: true,
    resolve: {
      file: false,
      http: false,
      external: false, // 允许任何外部 $ref
    },
    // or 你也可以只在 debug 模式下跳过
    // dereference: { circular: 'ignore' }
    dereference: {
      internal: true,
      external: false, // ← 和 resolve.external 保持一致
      circular: 'ignore',
    },
  })
    .then(dereferenced => {
      console.log('dereferenced')
      console.log(JSON.stringify(dereferenced, null, 2))
    })
    .catch(err => {
      console.log('err')
      console.error(err)
    })
}

main()
