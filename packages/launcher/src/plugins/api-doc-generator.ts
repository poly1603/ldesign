/**
 * API 文档生成插件
 * 
 * 自动生成 API 文档，支持多种格式和框架
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import { Logger } from '../utils/logger'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface APIDocOptions {
  /** API 源目录 */
  sourceDir?: string
  /** 输出目录 */
  outputDir?: string
  /** 文档格式 */
  format?: 'markdown' | 'html' | 'json' | 'openapi'
  /** 是否包含私有 API */
  includePrivate?: boolean
  /** 是否生成示例代码 */
  generateExamples?: boolean
  /** 支持的文件类型 */
  fileTypes?: string[]
  /** 文档模板 */
  template?: string
  /** 是否生成交互式文档 */
  interactive?: boolean
  /** API 基础路径 */
  basePath?: string
  /** 服务器信息 */
  servers?: Array<{
    url: string
    description: string
  }>
}

export interface APIEndpoint {
  /** 路径 */
  path: string
  /** HTTP 方法 */
  method: string
  /** 描述 */
  description: string
  /** 参数 */
  parameters: Array<{
    name: string
    type: string
    required: boolean
    description: string
    location: 'query' | 'path' | 'body' | 'header'
  }>
  /** 响应 */
  responses: Array<{
    status: number
    description: string
    schema?: any
  }>
  /** 标签 */
  tags: string[]
  /** 是否私有 */
  private: boolean
  /** 示例 */
  examples?: Array<{
    title: string
    request: any
    response: any
  }>
}

export class APIDocGenerator {
  private logger: Logger
  private options: Required<APIDocOptions>
  private endpoints: APIEndpoint[] = []

  constructor(options: APIDocOptions = {}) {
    this.logger = new Logger('APIDocGenerator')
    this.options = {
      sourceDir: './src/api',
      outputDir: './docs/api',
      format: 'markdown',
      includePrivate: false,
      generateExamples: true,
      fileTypes: ['.ts', '.js', '.vue', '.jsx', '.tsx'],
      template: '',
      interactive: true,
      basePath: '/api',
      servers: [
        { url: 'http://localhost:3000', description: 'Development server' },
        { url: 'https://api.example.com', description: 'Production server' }
      ],
      ...options
    }
  }

  /**
   * 生成 API 文档
   */
  async generateDocs(): Promise<void> {
    this.logger.info('开始生成 API 文档...')

    try {
      // 确保输出目录存在
      await fs.mkdir(this.options.outputDir, { recursive: true })

      // 扫描 API 文件
      const apiFiles = await this.scanAPIFiles()
      
      if (apiFiles.length === 0) {
        this.logger.warn('未找到 API 文件')
        return
      }

      this.logger.info(`找到 ${apiFiles.length} 个 API 文件`)

      // 解析 API 端点
      this.endpoints = []
      for (const file of apiFiles) {
        await this.parseAPIFile(file)
      }

      // 过滤私有 API
      if (!this.options.includePrivate) {
        this.endpoints = this.endpoints.filter(endpoint => !endpoint.private)
      }

      this.logger.info(`解析到 ${this.endpoints.length} 个 API 端点`)

      // 生成文档
      await this.generateDocumentation()

      // 生成交互式文档
      if (this.options.interactive) {
        await this.generateInteractiveDocs()
      }

      this.logger.success('API 文档生成完成')

    } catch (error) {
      this.logger.error('API 文档生成失败', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * 扫描 API 文件
   */
  private async scanAPIFiles(): Promise<string[]> {
    const files: string[] = []

    const scanDir = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          
          if (entry.isDirectory()) {
            await scanDir(fullPath)
          } else if (this.options.fileTypes.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath)
          }
        }
      } catch {
        // 忽略无法访问的目录
      }
    }

    await scanDir(this.options.sourceDir)
    return files
  }

  /**
   * 解析 API 文件
   */
  private async parseAPIFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      
      // 解析注释中的 API 文档
      const apiComments = this.extractAPIComments(content)
      
      for (const comment of apiComments) {
        const endpoint = this.parseAPIComment(comment, filePath)
        if (endpoint) {
          this.endpoints.push(endpoint)
        }
      }

      // 解析路由定义
      const routes = this.extractRoutes(content)
      
      for (const route of routes) {
        const endpoint = this.parseRoute(route, filePath)
        if (endpoint) {
          this.endpoints.push(endpoint)
        }
      }

    } catch (error) {
      this.logger.warn(`解析 API 文件失败: ${filePath}`, { error: (error as Error).message })
    }
  }

  /**
   * 提取 API 注释
   */
  private extractAPIComments(content: string): string[] {
    const comments: string[] = []
    const apiCommentRegex = /\/\*\*[\s\S]*?@api[\s\S]*?\*\//g
    
    let match
    while ((match = apiCommentRegex.exec(content)) !== null) {
      comments.push(match[0])
    }
    
    return comments
  }

  /**
   * 解析 API 注释
   */
  private parseAPIComment(comment: string, filePath: string): APIEndpoint | null {
    try {
      const lines = comment.split('\n').map(line => line.trim().replace(/^\*\s?/, ''))
      
      let endpoint: Partial<APIEndpoint> = {
        parameters: [],
        responses: [],
        tags: [],
        private: false,
        examples: []
      }

      for (const line of lines) {
        if (line.startsWith('@api')) {
          const apiMatch = line.match(/@api\s+(\w+)\s+(.+)/)
          if (apiMatch) {
            endpoint.method = apiMatch[1].toUpperCase()
            endpoint.path = apiMatch[2]
          }
        } else if (line.startsWith('@description')) {
          endpoint.description = line.replace('@description', '').trim()
        } else if (line.startsWith('@param')) {
          const paramMatch = line.match(/@param\s+\{(\w+)\}\s+(\w+)\s+(.+)/)
          if (paramMatch) {
            endpoint.parameters!.push({
              name: paramMatch[2],
              type: paramMatch[1],
              required: !line.includes('[optional]'),
              description: paramMatch[3],
              location: 'query' // 默认为 query 参数
            })
          }
        } else if (line.startsWith('@response')) {
          const responseMatch = line.match(/@response\s+(\d+)\s+(.+)/)
          if (responseMatch) {
            endpoint.responses!.push({
              status: parseInt(responseMatch[1]),
              description: responseMatch[2]
            })
          }
        } else if (line.startsWith('@tag')) {
          const tag = line.replace('@tag', '').trim()
          endpoint.tags!.push(tag)
        } else if (line.startsWith('@private')) {
          endpoint.private = true
        }
      }

      return endpoint as APIEndpoint
    } catch {
      return null
    }
  }

  /**
   * 提取路由定义
   */
  private extractRoutes(content: string): Array<{ method: string; path: string; handler: string }> {
    const routes: Array<{ method: string; path: string; handler: string }> = []
    
    // Express.js 风格路由
    const expressRouteRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\w+)/g
    
    let match
    while ((match = expressRouteRegex.exec(content)) !== null) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
        handler: match[3]
      })
    }
    
    return routes
  }

  /**
   * 解析路由
   */
  private parseRoute(route: { method: string; path: string; handler: string }, filePath: string): APIEndpoint | null {
    // 简化的路由解析，实际项目中需要更复杂的逻辑
    return {
      path: route.path,
      method: route.method,
      description: `${route.method} ${route.path}`,
      parameters: [],
      responses: [
        { status: 200, description: 'Success' }
      ],
      tags: [path.basename(filePath, path.extname(filePath))],
      private: false
    }
  }

  /**
   * 生成文档
   */
  private async generateDocumentation(): Promise<void> {
    switch (this.options.format) {
      case 'markdown':
        await this.generateMarkdownDocs()
        break
      case 'html':
        await this.generateHTMLDocs()
        break
      case 'json':
        await this.generateJSONDocs()
        break
      case 'openapi':
        await this.generateOpenAPIDocs()
        break
    }
  }

  /**
   * 生成 Markdown 文档
   */
  private async generateMarkdownDocs(): Promise<void> {
    let markdown = '# API Documentation\n\n'
    
    // 按标签分组
    const groupedEndpoints = this.groupEndpointsByTag()
    
    for (const [tag, endpoints] of Object.entries(groupedEndpoints)) {
      markdown += `## ${tag}\n\n`
      
      for (const endpoint of endpoints) {
        markdown += `### ${endpoint.method} ${endpoint.path}\n\n`
        markdown += `${endpoint.description}\n\n`
        
        // 参数
        if (endpoint.parameters.length > 0) {
          markdown += '#### Parameters\n\n'
          markdown += '| Name | Type | Required | Description |\n'
          markdown += '|------|------|----------|-------------|\n'
          
          for (const param of endpoint.parameters) {
            markdown += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`
          }
          markdown += '\n'
        }
        
        // 响应
        if (endpoint.responses.length > 0) {
          markdown += '#### Responses\n\n'
          
          for (const response of endpoint.responses) {
            markdown += `**${response.status}** - ${response.description}\n\n`
          }
        }
        
        // 示例
        if (this.options.generateExamples && endpoint.examples) {
          markdown += '#### Examples\n\n'
          
          for (const example of endpoint.examples) {
            markdown += `**${example.title}**\n\n`
            markdown += '```json\n'
            markdown += JSON.stringify(example.request, null, 2)
            markdown += '\n```\n\n'
          }
        }
        
        markdown += '---\n\n'
      }
    }
    
    const outputPath = path.join(this.options.outputDir, 'README.md')
    await fs.writeFile(outputPath, markdown)
    
    this.logger.info(`Markdown 文档已生成: ${outputPath}`)
  }

  /**
   * 生成 OpenAPI 文档
   */
  private async generateOpenAPIDocs(): Promise<void> {
    const openapi = {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Auto-generated API documentation'
      },
      servers: this.options.servers,
      paths: {} as any,
      components: {
        schemas: {}
      }
    }
    
    // 转换端点为 OpenAPI 格式
    for (const endpoint of this.endpoints) {
      if (!openapi.paths[endpoint.path]) {
        openapi.paths[endpoint.path] = {}
      }
      
      openapi.paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters.map(param => ({
          name: param.name,
          in: param.location,
          required: param.required,
          description: param.description,
          schema: {
            type: param.type
          }
        })),
        responses: endpoint.responses.reduce((acc, response) => {
          acc[response.status] = {
            description: response.description
          }
          return acc
        }, {} as any)
      }
    }
    
    const outputPath = path.join(this.options.outputDir, 'openapi.json')
    await fs.writeFile(outputPath, JSON.stringify(openapi, null, 2))
    
    this.logger.info(`OpenAPI 文档已生成: ${outputPath}`)
  }

  /**
   * 生成 JSON 文档
   */
  private async generateJSONDocs(): Promise<void> {
    const jsonDocs = {
      title: 'API Documentation',
      version: '1.0.0',
      basePath: this.options.basePath,
      endpoints: this.endpoints
    }
    
    const outputPath = path.join(this.options.outputDir, 'api-docs.json')
    await fs.writeFile(outputPath, JSON.stringify(jsonDocs, null, 2))
    
    this.logger.info(`JSON 文档已生成: ${outputPath}`)
  }

  /**
   * 生成 HTML 文档
   */
  private async generateHTMLDocs(): Promise<void> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .endpoint { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .method { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
        .get { background-color: #61affe; }
        .post { background-color: #49cc90; }
        .put { background-color: #fca130; }
        .delete { background-color: #f93e3e; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>API Documentation</h1>
    ${this.endpoints.map(endpoint => `
        <div class="endpoint">
            <h3><span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span> ${endpoint.path}</h3>
            <p>${endpoint.description}</p>
            ${endpoint.parameters.length > 0 ? `
                <h4>Parameters</h4>
                <table>
                    <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    ${endpoint.parameters.map(param => `
                        <tr>
                            <td>${param.name}</td>
                            <td>${param.type}</td>
                            <td>${param.required ? 'Yes' : 'No'}</td>
                            <td>${param.description}</td>
                        </tr>
                    `).join('')}
                </table>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>`
    
    const outputPath = path.join(this.options.outputDir, 'index.html')
    await fs.writeFile(outputPath, html)
    
    this.logger.info(`HTML 文档已生成: ${outputPath}`)
  }

  /**
   * 生成交互式文档
   */
  private async generateInteractiveDocs(): Promise<void> {
    // 生成 Swagger UI 或类似的交互式文档
    const swaggerHTML = `<!DOCTYPE html>
<html>
<head>
    <title>API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: './openapi.json',
            dom_id: '#swagger-ui',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ]
        });
    </script>
</body>
</html>`
    
    const outputPath = path.join(this.options.outputDir, 'interactive.html')
    await fs.writeFile(outputPath, swaggerHTML)
    
    this.logger.info(`交互式文档已生成: ${outputPath}`)
  }

  /**
   * 按标签分组端点
   */
  private groupEndpointsByTag(): Record<string, APIEndpoint[]> {
    const grouped: Record<string, APIEndpoint[]> = {}
    
    for (const endpoint of this.endpoints) {
      const tag = endpoint.tags[0] || 'Default'
      
      if (!grouped[tag]) {
        grouped[tag] = []
      }
      
      grouped[tag].push(endpoint)
    }
    
    return grouped
  }
}

/**
 * 创建 API 文档生成插件
 */
export function createAPIDocPlugin(options: APIDocOptions = {}): Plugin {
  const generator = new APIDocGenerator(options)
  
  return {
    name: 'api-doc-generator',
    
    async buildStart() {
      if (process.env.NODE_ENV === 'development' || process.env.GENERATE_API_DOCS === 'true') {
        await generator.generateDocs()
      }
    },
    
    configureServer(server) {
      // 在开发模式下监听 API 文件变化
      const apiDir = options.sourceDir || './src/api'
      
      server.watcher.add(apiDir)
      server.watcher.on('change', async (file) => {
        if (file.includes(apiDir)) {
          console.log('API 文件变更，重新生成文档...')
          await generator.generateDocs()
        }
      })
    }
  }
}
