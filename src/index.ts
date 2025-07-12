import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import logger from '@/utils/logger.js'
import GenerateApiTypes from './tools/GenerateApiTypes.js'

logger.info('服务启动中...')

// Create an MCP server
const server = new McpServer({
  name: 'demo-server',
  version: '1.0.0',
})
logger.info('MCP Server 已创建')

// Add an addition tool
server.registerTool(
  GenerateApiTypes.toolsName,
  GenerateApiTypes.definitionConfig,
  GenerateApiTypes.handle as any,
)

/**
 * 主函数：启动服务器
 * 使用标准输入输出流作为传输方式
 * 这允许服务器通过标准输入输出流与客户端通信
 */
async function main() {
  // 创建标准输入输出流传输实例
  const transport = new StdioServerTransport()
  // 连接服务器到传输实例
  await server.connect(transport)
}

// 启动主函数，如果发生错误则记录错误信息并退出程序
// process.exit(1)表示程序异常退出，退出码为1
main().catch(error => {
  logger.error('Server error:', error)
  process.exit(1)
})
