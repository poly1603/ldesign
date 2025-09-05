# 字符串处理示例

本示例展示如何使用 @ldesign/kit 的 StringUtils 进行各种字符串处理操作。

## 基础字符串转换

### 命名格式转换

```typescript
import { StringUtils } from '@ldesign/kit'

// API 字段名转换
function convertApiFields(apiData: any) {
  const convertedData = {}

  Object.entries(apiData).forEach(([key, value]) => {
    // 将 snake_case 转换为 camelCase
    const camelKey = StringUtils.camelCase(key)
    convertedData[camelKey] = value
  })

  return convertedData
}

// 使用示例
const apiResponse = {
  user_id: 123,
  first_name: 'John',
  last_name: 'Doe',
  email_address: 'john@example.com',
  created_at: '2024-01-01T00:00:00Z',
}

const frontendData = convertApiFields(apiResponse)
console.log(frontendData)
// {
//   userId: 123,
//   firstName: 'John',
//   lastName: 'Doe',
//   emailAddress: 'john@example.com',
//   createdAt: '2024-01-01T00:00:00Z'
// }
```

### 文件名处理

```typescript
import { StringUtils } from '@ldesign/kit'

class FileNameProcessor {
  // 生成安全的文件名
  static generateSafeFileName(originalName: string): string {
    // 移除特殊字符，转换为 kebab-case
    const safeName = StringUtils.kebabCase(originalName)

    // 添加时间戳避免冲突
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')

    return `${safeName}-${timestamp}`
  }

  // 批量重命名文件
  static batchRename(fileNames: string[]): Record<string, string> {
    const renameMap = {}

    fileNames.forEach(fileName => {
      const baseName = fileName.split('.')[0]
      const extension = fileName.split('.').pop()

      const newBaseName = StringUtils.kebabCase(baseName)
      const newFileName = `${newBaseName}.${extension}`

      renameMap[fileName] = newFileName
    })

    return renameMap
  }
}

// 使用示例
const originalFiles = [
  'My Important Document.pdf',
  'Project Screenshots (Final).zip',
  'Meeting Notes - 2024.docx',
]

const renameMap = FileNameProcessor.batchRename(originalFiles)
console.log(renameMap)
// {
//   'My Important Document.pdf': 'my-important-document.pdf',
//   'Project Screenshots (Final).zip': 'project-screenshots-final.zip',
//   'Meeting Notes - 2024.docx': 'meeting-notes-2024.docx'
// }
```

## URL 和 SEO 优化

### URL Slug 生成

```typescript
import { StringUtils } from '@ldesign/kit'

class SEOHelper {
  // 生成 SEO 友好的 URL slug
  static generateSlug(
    title: string,
    options?: {
      maxLength?: number
      separator?: string
    }
  ): string {
    const { maxLength = 60, separator = '-' } = options || {}

    let slug = StringUtils.slugify(title, { separator })

    // 限制长度
    if (slug.length > maxLength) {
      slug = StringUtils.truncate(slug, maxLength, '')
      // 确保不在单词中间截断
      const lastSeparator = slug.lastIndexOf(separator)
      if (lastSeparator > maxLength * 0.8) {
        slug = slug.substring(0, lastSeparator)
      }
    }

    return slug
  }

  // 生成面包屑导航
  static generateBreadcrumbs(path: string): Array<{ name: string; slug: string }> {
    const segments = path.split('/').filter(Boolean)
    const breadcrumbs = []

    segments.forEach((segment, index) => {
      const name = StringUtils.capitalize(segment.replace(/-/g, ' '))
      const slug = segments.slice(0, index + 1).join('/')

      breadcrumbs.push({ name, slug })
    })

    return breadcrumbs
  }
}

// 使用示例
const blogTitle = '如何使用 TypeScript 构建现代化的 Node.js 应用程序'
const slug = SEOHelper.generateSlug(blogTitle)
console.log(slug)
// 'ru-he-shi-yong-typescript-gou-jian-xian-dai-hua-de-node-js'

const breadcrumbs = SEOHelper.generateBreadcrumbs('blog/web-development/typescript-guide')
console.log(breadcrumbs)
// [
//   { name: 'Blog', slug: 'blog' },
//   { name: 'Web Development', slug: 'blog/web-development' },
//   { name: 'Typescript Guide', slug: 'blog/web-development/typescript-guide' }
// ]
```

## 模板和内容生成

### 邮件模板处理

```typescript
import { StringUtils } from '@ldesign/kit'

class EmailTemplateEngine {
  private templates = new Map<string, string>()

  // 注册模板
  registerTemplate(name: string, template: string): void {
    this.templates.set(name, template)
  }

  // 渲染模板
  render(templateName: string, data: Record<string, any>): string {
    const template = this.templates.get(templateName)
    if (!template) {
      throw new Error(`模板 ${templateName} 不存在`)
    }

    return StringUtils.template(template, data)
  }

  // 批量发送邮件
  async batchRender(
    templateName: string,
    recipients: Array<Record<string, any>>
  ): Promise<string[]> {
    return recipients.map(recipient => this.render(templateName, recipient))
  }
}

// 使用示例
const emailEngine = new EmailTemplateEngine()

// 注册欢迎邮件模板
emailEngine.registerTemplate(
  'welcome',
  `
亲爱的 {{user.name}}，

欢迎加入 {{app.name}}！

您的账户信息：
- 用户名：{{user.username}}
- 邮箱：{{user.email}}
- 注册时间：{{user.createdAt}}

请点击以下链接激活您的账户：
{{app.baseUrl}}/activate?token={{user.activationToken}}

祝您使用愉快！

{{app.name}} 团队
`
)

// 渲染邮件
const welcomeEmail = emailEngine.render('welcome', {
  user: {
    name: '张三',
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    createdAt: '2024-01-01 10:00:00',
    activationToken: 'abc123xyz',
  },
  app: {
    name: 'MyApp',
    baseUrl: 'https://myapp.com',
  },
})

console.log(welcomeEmail)
```

### 代码生成器

```typescript
import { StringUtils } from '@ldesign/kit'

class CodeGenerator {
  // 生成 TypeScript 接口
  static generateInterface(
    name: string,
    fields: Array<{
      name: string
      type: string
      optional?: boolean
      description?: string
    }>
  ): string {
    const interfaceName = StringUtils.pascalCase(name)

    let code = `interface ${interfaceName} {\n`

    fields.forEach(field => {
      if (field.description) {
        code += `  /** ${field.description} */\n`
      }

      const fieldName = StringUtils.camelCase(field.name)
      const optional = field.optional ? '?' : ''
      code += `  ${fieldName}${optional}: ${field.type}\n`
    })

    code += '}'

    return code
  }

  // 生成 API 客户端方法
  static generateApiMethod(endpoint: string, method: string, params?: string[]): string {
    const methodName = StringUtils.camelCase(`${method}_${endpoint.replace(/[\/{}]/g, '_')}`)
    const paramList = params ? params.join(', ') : ''

    return StringUtils.template(
      `
async {{methodName}}({{paramList}}) {
  const response = await this.request('{{method}}', '{{endpoint}}', {
    {{#if params}}params: { {{paramList}} }{{/if}}
  })
  return response.data
}`,
      {
        methodName,
        method: method.toUpperCase(),
        endpoint,
        paramList,
        params: params && params.length > 0,
      }
    )
  }
}

// 使用示例
const userInterface = CodeGenerator.generateInterface('user', [
  { name: 'id', type: 'number', description: '用户ID' },
  { name: 'username', type: 'string', description: '用户名' },
  { name: 'email', type: 'string', description: '邮箱地址' },
  { name: 'avatar', type: 'string', optional: true, description: '头像URL' },
  { name: 'created_at', type: 'Date', description: '创建时间' },
])

console.log(userInterface)
// interface User {
//   /** 用户ID */
//   id: number
//   /** 用户名 */
//   username: string
//   /** 邮箱地址 */
//   email: string
//   /** 头像URL */
//   avatar?: string
//   /** 创建时间 */
//   createdAt: Date
// }
```

## 文本处理和分析

### 内容摘要生成

```typescript
import { StringUtils } from '@ldesign/kit'

class ContentProcessor {
  // 生成文章摘要
  static generateSummary(content: string, maxLength: number = 200): string {
    // 移除 HTML 标签
    const plainText = content.replace(/<[^>]*>/g, '')

    // 生成摘要
    const summary = StringUtils.truncate(plainText, maxLength)

    return summary
  }

  // 提取关键词
  static extractKeywords(content: string, count: number = 10): string[] {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)

    // 统计词频
    const wordCount = new Map<string, number>()
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })

    // 按频率排序并返回前 N 个
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => word)
  }

  // 生成阅读时间估算
  static estimateReadingTime(content: string, wordsPerMinute: number = 200): string {
    const wordCount = content.split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)

    if (minutes < 1) {
      return '不到 1 分钟'
    } else if (minutes === 1) {
      return '1 分钟'
    } else {
      return `${minutes} 分钟`
    }
  }
}

// 使用示例
const article = `
<h1>TypeScript 最佳实践</h1>
<p>TypeScript 是一种由微软开发的编程语言，它是 JavaScript 的超集...</p>
<p>在本文中，我们将探讨 TypeScript 开发的最佳实践，包括类型定义、接口设计...</p>
`

const summary = ContentProcessor.generateSummary(article, 100)
const keywords = ContentProcessor.extractKeywords(article, 5)
const readingTime = ContentProcessor.estimateReadingTime(article)

console.log('摘要:', summary)
console.log('关键词:', keywords)
console.log('阅读时间:', readingTime)
```

## 实用工具函数

### 字符串验证和清理

```typescript
import { StringUtils } from '@ldesign/kit'

class StringValidator {
  // 清理用户输入
  static sanitizeInput(input: string): string {
    return StringUtils.escape(input.trim())
  }

  // 验证和格式化手机号
  static formatPhoneNumber(phone: string, countryCode: string = 'CN'): string | null {
    const cleaned = phone.replace(/\D/g, '')

    if (countryCode === 'CN' && cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
    }

    return null
  }

  // 生成随机字符串
  static generateRandomString(length: number, charset?: string): string {
    const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const chars = charset || defaultCharset

    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result
  }

  // 检查字符串相似度
  static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }
}

// 使用示例
const userInput = '<script>alert("xss")</script>Hello World!'
const sanitized = StringValidator.sanitizeInput(userInput)
console.log(sanitized) // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Hello World!'

const phone = StringValidator.formatPhoneNumber('13800138000')
console.log(phone) // '138-0013-8000'

const randomId = StringValidator.generateRandomString(8)
console.log(randomId) // 'aB3xY9mN'

const similarity = StringValidator.calculateSimilarity('hello world', 'hello word')
console.log(similarity) // 0.9090909090909091
```

## 总结

StringUtils 提供了丰富的字符串处理功能，适用于：

1. **数据转换**: API 字段名转换、格式标准化
2. **内容生成**: 模板渲染、代码生成
3. **SEO 优化**: URL slug 生成、内容摘要
4. **用户输入**: 验证、清理、格式化
5. **文本分析**: 关键词提取、相似度计算

这些示例展示了如何在实际项目中有效使用字符串处理功能，提高开发效率和代码质量。
