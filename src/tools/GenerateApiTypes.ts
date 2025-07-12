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
              text: `请将下面的 OpenAPI 接口，生成 TS 类型定义，然后添加到${input.filePath}文件中  \n${JSON.stringify(
                jsonString,
                null,
                2,
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
