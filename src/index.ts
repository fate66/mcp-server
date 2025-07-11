import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import logger from './utils/logger.js';
import { auctionItemsUsingPOST } from './a.js';

logger.info('服务启动中...');

// Create an MCP server
const server = new McpServer({
  name: 'demo-server',
  version: '1.0.0',
});
logger.info('MCP Server 已创建');

// Add an addition tool
server.registerTool(
  'generateTypesFromSwagger',
  {
    title: 'Swagger 类型生成工具',
    description: '输入接口地址和目标文件路径，自动生成 TypeScript 类型定义并保存到指定文件。',
    inputSchema: {
      url: z.string().describe('地址为字符串类型'),
      filePath: z
        .string()
        .describe('生成的 TypeScript 类型定义要保存到的文件路径（如 src/api/types.ts）'),
    },
  },
  async ({ url, filePath }) => {
    return {
      content: [
        {
          type: 'text',
          text: `请将下面的 OpenAPI 接口，生成 TS 类型定义，然后添加到${filePath}文件中  \n${JSON.stringify(
            auctionItemsUsingPOST,
            null,
            2,
          )}`,
        },
      ],
    };
  },
);

/**
 * 主函数：启动服务器
 * 使用标准输入输出流作为传输方式
 * 这允许服务器通过标准输入输出流与客户端通信
 */
async function main() {
  // 创建标准输入输出流传输实例
  const transport = new StdioServerTransport();
  // 连接服务器到传输实例
  await server.connect(transport);
}

// 启动主函数，如果发生错误则记录错误信息并退出程序
// process.exit(1)表示程序异常退出，退出码为1
main().catch((error) => {
  logger.error('Server error:', error);
  process.exit(1);
});
