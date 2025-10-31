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
              text: `你是一名资深的 TypeScript 工程师。

## 任务目标
解析以下 Swagger 定义，生成符合项目规范的 TypeScript 类型定义和请求函数。

## 第一步：了解项目规范（必须先完成）
在生成代码之前，你需要先查找并理解项目中的以下内容：

1. **查找 HTTP 请求实例**：
   - 搜索项目中的 axios 封装实例（可能叫 \`http\`、\`request\` 或其他名称）
   - 找到该实例的导入路径
   
2. **查找返回值类型定义**：
   - 查找项目中定义的通用返回值类型（如 \`HttpApiResponse\`、\`ApiResponse\` 等）
   - 理解其泛型参数结构
   
3. **参考现有接口定义**：
   - 在 ${input.filePath} 或同目录下查找已有的接口定义
   - 学习其代码风格、注释格式、命名规范
   - 如果和我给你的规范冲突，以我的为准

## 第二步：生成代码

### 1. 命名规范
- **请求 DTO**：\`{接口功能名}RequestDTO\`（如：\`GetUserInfoRequestDTO\`）
- **响应 VO**：\`{接口功能名}ResponseVO\`（如：\`GetUserInfoResponseVO\`）
- **请求函数**：根据接口路径和功能自动生成驼峰命名，**必须以 Api 结尾**（如：\`/user/info\` → \`getUserInfoApi\`）

### 2. 类型映射规则
- Swagger \`integer\` → TypeScript \`number\`
- Swagger \`string\` → TypeScript \`string\`
- Swagger \`boolean\` → TypeScript \`boolean\`
- Swagger \`array\` → TypeScript \`Array<T>\` 或 \`T[]\`
- Swagger \`object\` → TypeScript \`interface\`
- Swagger \`enum\` → TypeScript \`enum\`（如：\`enum Gender { Male = 1, Female = 2 }\`）
- Swagger \`date-time\` → TypeScript \`string\`
- Swagger \`required\` 数组中未包含的字段 → 添加 \`?\` 可选标记

### 3. 参数处理规则
- **忽略 header 参数**
- **路径参数**（path）：作为函数的独立参数
- **查询参数**（query）：合并到 RequestDTO 中
- **请求体**（body）：作为 RequestDTO
- **HTTP 方法映射**：
  - GET 请求：参数通过 RequestDTO 传递
  - POST/PUT/DELETE 请求：参数通过 RequestDTO 作为 data 传递

### 4. 代码生成格式

参照以下示例格式生成代码：

\`\`\`typescript
// ================== {接口功能名称}接口类型定义 ==================
// 接口文档地址：{完整URL路径}
// HTTP方法：{GET/POST/PUT/DELETE}

/**
 * 【请求】{接口功能描述} - 请求参数
 * @description {详细描述}
 */
export interface {功能名}RequestDTO {
  /** {字段描述} */
  fieldName: string;
  /** {字段描述}（可选） */
  optionalField?: number;
}

/**
 * 【响应】{接口功能描述} - 响应数据
 * @description {详细描述}
 */
export interface {功能名}ResponseVO {
  /** {字段描述} */
  fieldName: string;
  /** {嵌套对象描述} */
  nestedObject: {
    /** {子字段描述} */
    subField: number;
  };
}

/**
 * {接口功能描述}
 *
 * @description {详细描述}
 * @param {类型} paramName - 参数描述
 * @param {{功能名}RequestDTO} data - 请求参数
 * @returns {Promise<{返回类型}<{功能名}ResponseVO>>} 响应数据
 * @async
 */
export function {functionName}Api(
  参数列表
): Promise<{项目返回类型}<{功能名}ResponseVO>> {
  return {http实例}.{method}<{功能名}ResponseVO>(
    \`{接口路径}\`,
    data或params
  );
}

// ================== {接口功能名称}接口类型定义 END ==================
\`\`\`

### 5. 重要要求
- ✅ **请求函数命名必须以 Api 结尾**（如：\`getUserInfoApi\`、\`fetchContractListApi\`）
- ✅ **必须包含所有 Swagger 定义的字段**，不得遗漏
- ✅ **保留所有 Swagger 注释**，使用中文 JSDoc 注释
- ✅ **每个 interface 的注释必须标注是【请求】还是【响应】**，格式：\`/** 【请求】接口描述 */\` 或 \`/** 【响应】接口描述 */\`
- ✅ **类型必须准确无误**，严格按照 Swagger 定义映射
- ✅ **严格一一对应 Swagger 端点**，不增不删
- ✅ **每个字段都要有详细注释**
- ✅ **如果 Swagger 中有枚举值，要在注释中标明可选值**
- ✅ **嵌套对象要完整展开定义**
- ✅ **数组类型要明确元素类型**
- ❌ **不要自己创造返回值类型**，必须使用项目中已有的
- ❌ **不要忽略任何字段**

### 6. 接口路径处理（重要）
⚠️ **Swagger 定义中有 \`basePath\` 和 \`paths\` 两部分**：
- \`basePath\`：如 \`/gdmall/basics\`
- \`paths\`：如 \`/micro/contract/manager/v2/list\`
- **完整路径 = basePath + path**
- **生成的接口函数中必须使用完整路径**

例如：
\`\`\`json
{
  "basePath": "/gdmall/basics",
  "paths": {
    "/micro/contract/list": { ... }
  }
}
\`\`\`
生成的函数应该使用：\`/gdmall/basics/micro/contract/list\`

### 7. 特殊情况处理
- 如果接口有路径参数（如 \`/user/{id}\`），将其作为函数的独立参数
- 如果接口有分页参数（如 \`pageNo\`、\`size\`），也作为独立参数
- 如果枚举值是数字，使用 \`enum Name { Value1 = 1, Value2 = 2 }\`
- 如果字段是数组的数组，正确嵌套类型 \`Array<Array<string>>\`
- 如果响应是简单类型（非对象），VO 也要定义为 interface

## 第三步：添加到目标文件
将生成的完整代码添加到 ${input.filePath} 文件中。

---

## 以下是需要解析的 Swagger 定义：

${jsonString}`,
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
