import logger from '@/utils/logger.js'
import { SwaggerInfo, SimpleSwaggerInfo } from '@/types/swagger.js'

/**
 * 从 URL 获取 Swagger JSON 并解析为类型化对象
 */
export async function fetchSwaggerInfo(swaggerJsonUrl: string): Promise<SwaggerInfo> {
  try {
    logger.info(`正在获取 Swagger JSON: ${swaggerJsonUrl}`)
    const response = await fetch(swaggerJsonUrl)

    if (!response.ok) {
      logger.error(`获取 Swagger JSON 失败: ${response.status} ${response.statusText}`)
      throw new Error(`获取 Swagger JSON 失败: ${response.status} ${response.statusText}`)
    }

    const swaggerData = await response.json()
    logger.info(`成功获取 Swagger JSON，标题: ${swaggerData.info?.title}`)

    return swaggerData as SwaggerInfo
  } catch (error) {
    logger.error('解析 Swagger JSON 时发生错误:', error)
    throw error
  }
}

/**
 * 根据 operationId 查找对应的 API 路径和方法
 */
export function findApiByOperationId(
  swaggerInfo: SwaggerInfo,
  operationId: string,
): { path: string; method: string; operation: any } | null {
  logger.info(`正在查找 operationId: ${operationId}`)

  for (const [path, methods] of Object.entries(swaggerInfo.paths || {})) {
    for (const [method, operation] of Object.entries(methods)) {
      if (operation.operationId === operationId) {
        logger.info(`找到匹配的接口: ${method.toUpperCase()} ${path}`)
        return { path, method, operation }
      }
    }
  }

  logger.error(`未找到 operationId: "${operationId}"`)
  return null
}

/**
 * 获取 Swagger 基本信息
 */
export function getSwaggerBasicInfo(swaggerInfo: SwaggerInfo): {
  title: string
  version: string
  description: string
  host: string
  basePath: string
  tags: string[]
} {
  return {
    title: swaggerInfo.info.title,
    version: swaggerInfo.info.version,
    description: swaggerInfo.info.description,
    host: swaggerInfo.host,
    basePath: swaggerInfo.basePath,
    tags: swaggerInfo.tags.map(tag => tag.name),
  }
}
