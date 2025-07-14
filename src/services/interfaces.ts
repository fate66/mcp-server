import { ParameterInEnum } from '@/utils/enum.js'

export { ParameterInEnum }

export interface DefinitionModel {
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
        /** 数组项类型 */
        originalRef?: string
        /** 数组项引用的模型 */
        $ref?: string
      }
    }
  }
  /** 模型标题 */
  title?: string
  /** 必需字段列表 */
  required?: string[]
}

export interface Schema {
  originalRef?: string // 原始引用
  $ref?: string // 引用
  type?: string // 类型
}

export interface Definitions {
  [key: string]: DefinitionModel
}

export interface Parameter {
  /** 参数名称 */
  name: string
  /** 参数位置（path, query, header, body, formData） */
  in: ParameterInEnum
  /** 参数描述 */
  description?: string
  /** 是否必需 */
  required?: boolean
  /** 参数类型 */
  type?: string
  /** 参数模式定义 */
  schema?: Schema
  /** 默认值 */
  default?: any
}

export interface Response {
  description: string
  schema?: Schema
}

export interface methodDefinition {
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
  parameters?: Array<Parameter>
  /** 响应定义 */
  responses: {
    [code: string]: Response
  }
}
export interface ApiDefinition extends Omit<methodDefinition, 'responses'> {
  fullPath: string
  method: string
  response: Response
}

export interface Path {
  [path: string]: {
    [method: string]: methodDefinition
  }
}

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
  definitions: Definitions

  /** API 路径定义 */
  paths: Path
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
