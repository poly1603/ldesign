/**
 * FileProcessor - 文件处理器
 * 
 * 处理各类源文件：
 * - Vue SFC (.vue)
 * - React/Vue JSX/TSX (.jsx, .tsx)
 * - TypeScript (.ts)
 * - JavaScript (.js)
 * - 样式文件 (.less, .scss, .sass, .styl, .css)
 * - 资源文件 (images, fonts, etc.)
 * 
 * 提供文件预处理、转换、优化等功能
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname, extname, relative } from 'path'
import fg from 'fast-glob'

export class FileProcessor {
  private readonly root: string

  /**
   * 构造函数
   * @param root - 项目根目录
   */
  constructor(root: string) {
    this.root = root
  }

  /**
   * 处理源文件
   * 根据文件类型进行相应处理
   * 
   * @param filePath - 文件路径
   * @returns 处理后的文件内容
   */
  async processFile(filePath: string): Promise<{ content: string; type: string }> {
    const ext = extname(filePath).toLowerCase()
    let content = readFileSync(filePath, 'utf-8')
    let type = 'unknown'

    switch (ext) {
      case '.vue':
        // Vue 单文件组件
        type = 'vue'
        content = this.processVueFile(content, filePath)
        break
      
      case '.tsx':
      case '.jsx':
        // React/Vue JSX 文件
        type = ext === '.tsx' ? 'tsx' : 'jsx'
        content = this.processJsxFile(content, filePath)
        break
      
      case '.ts':
        // TypeScript 文件
        type = 'typescript'
        content = this.processTypeScriptFile(content, filePath)
        break
      
      case '.js':
      case '.mjs':
      case '.cjs':
        // JavaScript 文件
        type = 'javascript'
        content = this.processJavaScriptFile(content, filePath)
        break
      
      case '.less':
      case '.scss':
      case '.sass':
      case '.styl':
      case '.css':
        // 样式文件
        type = 'style'
        content = this.processStyleFile(content, filePath, ext)
        break
      
      case '.json':
        // JSON 文件
        type = 'json'
        content = this.processJsonFile(content, filePath)
        break
      
      default:
        // 其他文件类型（资源文件等）
        type = 'asset'
        // 资源文件通常不需要处理内容
    }

    return { content, type }
  }

  /**
   * 批量处理文件
   * 
   * @param pattern - glob 模式
   * @param outputDir - 输出目录
   * @returns 处理结果
   */
  async processFiles(
    pattern: string | string[],
    outputDir?: string
  ): Promise<{ processed: number; errors: string[] }> {
    const files = await fg(pattern, { 
      cwd: this.root, 
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    })

    let processed = 0
    const errors: string[] = []

    for (const file of files) {
      try {
        const result = await this.processFile(file)
        
        if (outputDir) {
          // 如果指定了输出目录，写入处理后的文件
          const relativePath = relative(this.root, file)
          const outputPath = join(outputDir, relativePath)
          
          // 确保输出目录存在
          const dir = dirname(outputPath)
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true })
          }
          
          // 写入文件
          writeFileSync(outputPath, result.content)
        }
        
        processed++
      } catch (error) {
        errors.push(`处理文件 ${file} 失败: ${error}`)
      }
    }

    return { processed, errors }
  }

  /**
   * 处理 Vue 文件
   * 添加必要的优化和转换
   */
  private processVueFile(content: string, _filePath: string): string {
    // Vue 文件的处理逻辑
    // 这里可以添加自定义的预处理逻辑
    // 例如：自动导入组合式 API、优化模板等
    
    // 检查是否需要自动导入
    if (content.includes('<script setup>') && !content.includes('import { ref')) {
      // 可以自动添加常用的 Vue 3 组合式 API 导入
      // 但这通常由 unplugin-auto-import 等插件处理
    }

    return content
  }

  /**
   * 处理 JSX/TSX 文件
   */
  private processJsxFile(content: string, _filePath: string): string {
    // JSX/TSX 文件的处理逻辑
    // 例如：自动导入 React、优化组件等
    
    // 检查是否需要自动导入 React（React 17+ 不需要）
    if (!content.includes('import React') && !content.includes('React.')) {
      // 可以根据项目配置决定是否自动导入
    }

    return content
  }

  /**
   * 处理 TypeScript 文件
   */
  private processTypeScriptFile(content: string, _filePath: string): string {
    // TypeScript 文件的处理逻辑
    // 例如：路径别名转换、类型优化等
    
    // 将路径别名转换为相对路径（如果需要）
    // content = this.resolvePathAliases(content)

    return content
  }

  /**
   * 处理 JavaScript 文件
   */
  private processJavaScriptFile(content: string, _filePath: string): string {
    // JavaScript 文件的处理逻辑
    // 例如：ES6+ 语法转换、polyfill 注入等

    return content
  }

  /**
   * 处理样式文件
   */
  private processStyleFile(content: string, _filePath: string, _ext: string): string {
    // 样式文件的处理逻辑
    // 例如：自动添加浏览器前缀、优化选择器等
    
    // 这些通常由 PostCSS 插件处理
    // 这里可以添加自定义的预处理逻辑

    return content
  }

  /**
   * 处理 JSON 文件
   */
  private processJsonFile(content: string, filePath: string): string {
    try {
      // 验证 JSON 格式
      const json = JSON.parse(content)
      // 格式化输出
      return JSON.stringify(json, null, 2)
    } catch (error) {
      console.warn(`JSON 文件格式错误: ${filePath}`)
      return content
    }
  }

  /**
   * 获取文件依赖
   * 分析文件的导入依赖
   * 
   * @param filePath - 文件路径
   * @returns 依赖列表
   */
  async getFileDependencies(filePath: string): Promise<string[]> {
    const content = readFileSync(filePath, 'utf-8')
    const dependencies: string[] = []

    // 匹配各种导入语句
    const importPatterns = [
      // ES6 import
      /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g,
      // CommonJS require
      /require\s*\(['"]([^'"]+)['"]\)/g,
      // Dynamic import
      /import\s*\(['"]([^'"]+)['"]\)/g,
      // CSS @import
      /@import\s+['"]([^'"]+)['"]/g
    ]

    for (const pattern of importPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        dependencies.push(match[1])
      }
    }

    return [...new Set(dependencies)] // 去重
  }

  /**
   * 分析项目文件结构
   * 
   * @param srcDir - 源代码目录
   * @returns 文件结构信息
   */
  async analyzeFileStructure(srcDir: string): Promise<{
    total: number
    byType: Record<string, number>
    byDirectory: Record<string, number>
  }> {
    const files = await fg('**/*', { 
      cwd: srcDir, 
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    })

    const byType: Record<string, number> = {}
    const byDirectory: Record<string, number> = {}

    for (const file of files) {
      // 按类型统计
      const ext = extname(file).toLowerCase() || 'no-ext'
      byType[ext] = (byType[ext] || 0) + 1

      // 按目录统计
      const dir = dirname(relative(srcDir, file)).split('/')[0] || 'root'
      byDirectory[dir] = (byDirectory[dir] || 0) + 1
    }

    return {
      total: files.length,
      byType,
      byDirectory
    }
  }

  /**
   * 优化导入语句
   * 将绝对路径转换为相对路径
   * 
   * @param content - 文件内容
   * @param filePath - 当前文件路径
   * @returns 优化后的内容
   */
  private optimizeImports(content: string, _filePath: string): string {
    // 这里可以实现导入路径的优化逻辑
    // 例如：将绝对路径转换为相对路径
    // 将路径别名解析为实际路径等

    return content
  }
}
