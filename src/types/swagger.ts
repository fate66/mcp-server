/**
 * Swagger 2.0 规范的类型定义
 */

export interface SwaggerInfo {
  /** Swagger 版本号，通常为 "2.0" */
  swagger: string

  /** API 基本信息 */
  info: {
    /** API 描述信息 */
    description: string
    /** API 版本号 */
    version: string
    /** API 标题 */
    title: string
  }

  /** API 服务器主机地址（包含端口） */
  host: string

  /** API 基础路径 */
  basePath: string

  /** API 标签分组信息 */
  tags: Array<{
    /** 标签名称 */
    name: string
    /** 标签描述 */
    description: string
  }>

  /** 数据模型定义 */
  definitions: {
    [key: string]: {
      /** 数据类型 */
      type: string
      /** 属性定义 */
      properties: {
        [key: string]: {
          /** 属性类型 */
          type?: string
          /** 属性描述 */
          description?: string
          /** 引用其他模型 */
          $ref?: string
          /** 数组项定义 */
          items?: {
            /** 数组项引用的模型 */
            $ref?: string
            /** 数组项类型 */
            type?: string
          }
        }
      }
      /** 模型标题 */
      title?: string
      /** 必需字段列表 */
      required?: string[]
    }
  }

  /** API 路径定义 */
  paths: {
    [path: string]: {
      [method: string]: {
        /** 接口标签 */
        tags?: string[]
        /** 接口摘要 */
        summary?: string
        /** 接口详细描述 */
        description?: string
        /** 操作唯一标识符 */
        operationId?: string
        /** 请求内容类型 */
        consumes?: string[]
        /** 响应内容类型 */
        produces?: string[]
        /** 请求参数定义 */
        parameters?: Array<{
          /** 参数名称 */
          name: string
          /** 参数位置（path, query, header, body, formData） */
          in: string
          /** 参数描述 */
          description?: string
          /** 是否必需 */
          required?: boolean
          /** 参数类型 */
          type?: string
          /** 参数模式定义 */
          schema?: {
            /** 引用的模型 */
            $ref?: string
            /** 参数类型 */
            type?: string
          }
        }>
        /** 响应定义 */
        responses: {
          [code: string]: {
            /** 响应描述 */
            description: string
            /** 响应数据模式 */
            schema?: {
              /** 引用的响应模型 */
              $ref?: string
              /** 响应数据类型 */
              type?: string
              /** 数组响应项定义 */
              items?: {
                /** 数组项引用的模型 */
                $ref?: string
              }
            }
          }
        }
      }
    }
  }
}

/**
 * 简化的 Swagger 信息接口
 * 用于快速访问，不包含详细的类型定义
 */
export interface SimpleSwaggerInfo {
  /** Swagger 版本号 */
  swagger: string

  /** API 基本信息 */
  info: {
    /** API 描述信息 */
    description: string
    /** API 版本号 */
    version: string
    /** API 标题 */
    title: string
  }

  /** API 服务器主机地址 */
  host: string

  /** API 基础路径 */
  basePath: string

  /** API 标签分组信息 */
  tags: Array<{
    /** 标签名称 */
    name: string
    /** 标签描述 */
    description: string
  }>

  /** 数据模型定义（简化版本） */
  definitions: Record<string, any>

  /** API 路径定义（简化版本） */
  paths: Record<string, any>
}
