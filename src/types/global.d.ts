/**
 * 全局类型声明文件
 */

// 声明全局变量
declare global {
  // 可以在这里添加全局变量声明
  // 例如：declare const API_BASE_URL: string;
}

// 模块声明
declare module '*.json' {
  const value: any
  export default value
}

// 环境变量类型声明
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    PORT?: string
    // 可以添加更多环境变量类型
  }
}
export {}
