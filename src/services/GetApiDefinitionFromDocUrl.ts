/**
 * 获取 Swagger 定义服务
 */

import logger from '@/utils/logger.js'
import axios from 'axios'
import { ApiDefinition, SwaggerInfo } from '@/services/interfaces'

// 获取 Swagger 定义
export default class GetApiDefinitionFromDocUrl {
  swaggerInfo: SwaggerInfo | null = null
  swaggerJsonUrl: string
  docUrl: string
  operationId: string
  apiPath: string = ''
  fullApiPath: string = ''
  apiDefinition: ApiDefinition | null = null

  constructor(docUrl: string) {
    this.docUrl = docUrl

    const { swaggerJsonUrl, operationId } = this.parseSwaggerDocUrl()
    logger.info(`Parsed Swagger JSON URL: ${swaggerJsonUrl}, Operation ID: ${operationId}`)
    this.swaggerJsonUrl = swaggerJsonUrl
    this.operationId = operationId
  }

  parseSwaggerDocUrl(): {
    swaggerJsonUrl: string
    operationId: string
  } {
    const parsed = new URL(this.docUrl)

    // 1. 从 hash 中取出组名（group）和 operationId
    //    hash 示例： "#/2.X版本/费用审核相关接口/auctionItemsUsingPOST"
    const hashSegments = parsed.hash.split('/').filter(Boolean)
    if (hashSegments.length < 4) {
      logger.error(`Invalid Swagger UI URL hash format: ${parsed.hash}`)
      throw new Error(`Invalid Swagger UI URL hash format: ${parsed.hash}`)
    }
    const group = hashSegments[1]
    const operationId = hashSegments[3]
    // 2. 构造 swagger JSON 地址
    const basePath = parsed.pathname.replace(/\/doc\.html$/, '')
    const swaggerJsonUrl =
      `${parsed.origin}${basePath}/v2/api-docs?group=` + decodeURIComponent(group)

    return {
      swaggerJsonUrl,
      operationId,
    }
  }

  async getApiDefinition() {
    const response = await axios.get(this.swaggerJsonUrl)
    // 验证响应是否为有效的 Swagger 定义
    // 检查是否包含 openapi 或 swagger 字段
    if (!response.data.openapi && !response.data.swagger) {
      logger.error(`Invalid DocUrl: ${this.docUrl}`)
      throw new Error('Invalid DocUrl') // 无效的 DocUrl
    }

    const swaggerInfo = response.data as SwaggerInfo

    this.swaggerInfo = swaggerInfo
    logger.info(`正在查找 operationId: ${this.operationId}`)
    if (swaggerInfo) {
      for (const path in swaggerInfo.paths) {
        // path  /tradition/cost/auctionItems
        if (Object.prototype.hasOwnProperty.call(swaggerInfo.paths, path)) {
          const methods = swaggerInfo.paths[path]
          // methods  { post: { operationId: 'auctionItemsUsingPOST', ... } }
          for (const method in methods) {
            if (Object.prototype.hasOwnProperty.call(methods, method)) {
              // method  post
              // methodDefinition  { operationId: 'auctionItemsUsingPOST', ... }
              const methodDefinition = methods[method]
              if (methodDefinition.operationId === this.operationId) {
                logger.info(`找到匹配的接口: ${method.toUpperCase()} ${path}`)
                let paramsRes = {}
                for (const params of methodDefinition.parameters || []) {
                  if (params.in === 'body') {
                    logger.info(`接口参数: ${params.name} (${params.in})`)
                    if (params.schema && params.schema.$ref) {
                      logger.info(`参数类型引用: ${params.schema.$ref}`)
                      // 这里可以根据需要进一步处理引用的类型
                      // #/definitions/CostAuctionItemsDTO
                      const refParts = params.schema.$ref.split('/')
                      if (refParts.length === 3) {
                        const typeName = refParts[refParts.length - 1]
                        logger.info(`参数类型名称: ${typeName}`)
                        paramsRes = swaggerInfo.definitions[typeName] || {}
                      }
                    }
                  }
                }
                let responsesRes = {}
                const ref = methodDefinition.responses['200'].schema!.$ref
                if (ref) {
                  logger.info(`响应类型引用: ${ref}`)
                  // 这里可以根据需要进一步处理引用的类型
                  // #/definitions/CostAuctionItemsDTO
                  const refParts = ref.split('/')
                  const typeName = refParts[refParts.length - 1]
                  logger.info(`参数类型名称: ${typeName}`)
                  responsesRes = (swaggerInfo.definitions[typeName] || {}) as any
                }

                this.apiDefinition = {
                  fullPath: swaggerInfo.basePath + path,
                  method: method.toUpperCase(),
                  ...methodDefinition,
                  responses: responsesRes as any,
                  parameters: paramsRes as any,
                }
                this.apiPath = path
                this.fullApiPath = swaggerInfo.basePath + path
                return this.apiDefinition
              }
            }
          }
        }
      }
    } else {
      logger.error(`未找到匹配的接口 operationId: ${this.operationId}`)
      throw new Error(`未找到匹配的接口: ${this.operationId}`)
    }
    return null
  }
}
