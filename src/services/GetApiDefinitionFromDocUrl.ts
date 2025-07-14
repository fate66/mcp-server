/**
 * 获取 Swagger 定义服务
 */
import SwaggerParser from '@apidevtools/swagger-parser'

import logger from '@/utils/logger.js'
import axios from 'axios'
import {
  ApiDefinition,
  SwaggerInfo,
  Parameter,
  Response,
  ParameterInEnum,
  Path,
} from '@/services/interfaces.js'
import { resolveRefs } from '@/utils/utils.js'

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

  private filterPath(swaggerInfo: SwaggerInfo, operationId: string) {
    let paths: Path = {}
    for (const path in swaggerInfo.paths) {
      // path 示例： /micro/contract/manager/v2/auctionItems
      if (Object.prototype.hasOwnProperty.call(swaggerInfo.paths, path)) {
        // methods 示例： { get: { operationId: 'getAuctionItems', ... }, post: { operationId: 'postAuctionItems', ... } }
        const methods = swaggerInfo.paths[path]
        for (const method in methods) {
          if (Object.prototype.hasOwnProperty.call(methods, method)) {
            const methodDefinition = methods[method]
            if (methodDefinition.operationId === operationId) {
              logger.info(`找到匹配的接口: ${method.toUpperCase()} ${path}`)
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
  // private checkParamIsSchema(param: Parameter): boolean {
  //   return !!(param.schema && param.schema.$ref)
  // }

  async getApiDefinition() {
    const response = await axios.get(this.swaggerJsonUrl)
    if (!response.data.openapi && !response.data.swagger) {
      logger.error(`Invalid DocUrl: ${this.docUrl}`)
      throw new Error('Invalid DocUrl')
    }
    let swaggerInfo = (response.data || {}) as SwaggerInfo
    swaggerInfo = resolveRefs(swaggerInfo)
    this.swaggerInfo = swaggerInfo
    const paths = this.filterPath(swaggerInfo, this.operationId)
    swaggerInfo.paths = paths
    // @ts-ignore
    const dereferenced = (await SwaggerParser.dereference(swaggerInfo, {
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
    })) as any

    logger.info(`找到匹配的接口: ${dereferenced.paths}`)
    return dereferenced.paths
  }

  async getApiDefinition2(): Promise<ApiDefinition> {
    const response = await axios.get(this.swaggerJsonUrl)
    if (!response.data.openapi && !response.data.swagger) {
      logger.error(`Invalid DocUrl: ${this.docUrl}`)
      throw new Error('Invalid DocUrl')
    }
    const swaggerInfo = response.data as SwaggerInfo
    this.swaggerInfo = swaggerInfo
    logger.info(`正在查找 operationId: ${this.operationId}`)
    for (const path in swaggerInfo.paths) {
      if (Object.prototype.hasOwnProperty.call(swaggerInfo.paths, path)) {
        const methods = swaggerInfo.paths[path]
        for (const method in methods) {
          if (Object.prototype.hasOwnProperty.call(methods, method)) {
            const methodDefinition = methods[method]
            if (methodDefinition.operationId === this.operationId) {
              logger.info(`找到匹配的接口: ${method.toUpperCase()} ${path}`)
              // 处理参数
              let parameters: Parameter[] = []
              for (const param of methodDefinition.parameters || []) {
                if (param.in === ParameterInEnum.body) {
                  logger.info(`接口参数: ${param.name} (${param.in})`)
                }
                if (param.in === ParameterInEnum.query) {
                  logger.info(`接口参数: ${param.name} (${param.in})`)
                }
              }
              // 处理响应
              let response: Response | undefined = undefined
              const resp200 = methodDefinition.responses['200']
              if (resp200 && resp200.schema) {
                logger.info(`响应类型: ${JSON.stringify(resp200.schema)}`)
                response = {
                  ...resp200,
                }
              } else if (resp200) {
                response = resp200
              }
              // 构造 ApiDefinition
              const apiDef: ApiDefinition = {
                fullPath: swaggerInfo.basePath + path,
                method: method.toUpperCase(),
                ...methodDefinition,
                response: response!,
              }
              this.apiDefinition = apiDef
              this.apiPath = path
              this.fullApiPath = swaggerInfo.basePath + path
              return apiDef
            }
          }
        }
      }
    }
    logger.error(`未找到匹配的接口 operationId: ${this.operationId}`)
    throw new Error(`未找到匹配的接口: ${this.operationId}`)
  }
}
