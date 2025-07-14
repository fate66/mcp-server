import GetApiDefinitionFromDocUrl from '@/services/GetApiDefinitionFromDocUrl.js'
import logger from '@/utils/logger.js'
import * as z from 'zod'
// import swaggerService from '../services/index.js';

class GenerateApiTypes {
  static toolsName = 'generateApiTypes'
  // 工具定义对象
  static definitionConfig = {
    title: 'Swagger 类型生成工具',
    description: '输入接口地址和目标文件路径，自动生成 TypeScript 类型定义并保存到指定文件。',
    inputSchema: {
      url: z.string().describe('地址为字符串类型'),
      filePath: z
        .string()
        .describe('生成的 TypeScript 类型定义要保存到的文件路径（如 src/api/types.ts）'),
    },
  }

  static async handle(input: any) {
    logger.info('init GetApiDefinitionFromDocUrl')
    logger.info(`Query parameters: ${JSON.stringify(input)}`)

    try {
      // const swaggerDefinition = await swaggerService.getSwaggerDefinition(input);
      const getApiDefinitionFromDocUrl = new GetApiDefinitionFromDocUrl(input.url)
      const apiDefinition = await getApiDefinitionFromDocUrl.getApiDefinition()
      logger.info(`API definition retrieved successfully: ${JSON.stringify(apiDefinition)}`)
      if (!apiDefinition) {
        logger.info('Swagger definition response is null or undefined')
      }

      try {
        const jsonString = JSON.stringify(apiDefinition, null, 2)
        logger.info(`Successfully stringified swagger definition response`)
        return {
          content: [
            {
              type: 'text',
              text: `
              你是一名资深的 TypeScript工程师。  
              你的任务是：
              1. **解析以下 Swagger 片段**。  
              2. **生成**  
                a. 对应所有请求 DTO 和响应 VO 的 TypeScript "interface" 声明 ，注释要标明当前interface是请求还是响应 
                b. 如果返回数据是分页格式，则生成一个通用的 "PagedResponse<T>" 泛型类型。  
                c. 一个按照我们项目约定的、基于 "axios" 的类型化 HTTP 请求函数，
                d. 确保输出中包含 Swagger定义里的每一个字段，类型准确无误，并且将Swagger中的接口、类型和字段的注释添加到TS中。
                e.严格一一对应 Swagger 端点，不增不减
                f. 接口的header中的参数忽略
                g. 生成的样式如下：
                   // ================== 费用审核拍品详情接口类型定义 ==================
                   // 请求DTO
                   // 响应VO

              请将下面的 Swagger 接口，生成 TS 类型定义，然后添加到${input.filePath}文件中  \n${JSON.stringify(
                jsonString,
              )}`,
            },
          ],
        }
      } catch (jsonError: any) {
        logger.error(`JSON stringify error: ${jsonError.message}`)
        return {
          content: [
            {
              type: 'text',
              text: `Error converting response to JSON: ${jsonError.message}`,
            },
          ],
        }
      }
    } catch (error: any) {
      logger.error(`Error in getSwaggerDefinition handler: ${error.message}`)
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving swagger definition: ${error.message}`,
          },
        ],
      }
    }
  }
}

export default GenerateApiTypes
