/**
 * 智能TypeScript类型生成器
 * 
 * 自动从翻译文件生成类型定义，提供完整的类型安全支持
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import * as fs from 'fs'
import * as path from 'path'

/**
 * 类型生成配置
 */
export interface TypeGeneratorConfig {
  /** 输入目录 */
  inputDir: string
  /** 输出文件路径 */
  outputPath: string
  /** 是否生成严格类型 */
  strict?: boolean
  /** 是否包含注释 */
  includeComments?: boolean
  /** 自定义类型映射 */
  customTypes?: Record<string, string>
  /** 忽略的文件模式 */
  ignorePatterns?: string[]
  /** 是否生成联合类型 */
  generateUnions?: boolean
  /** 是否生成枚举 */
  generateEnums?: boolean
  /** 是否监听文件变化 */
  watch?: boolean
}

/**
 * 翻译键路径类型
 */
export type TranslationPath = string

/**
 * 翻译值类型
 */
export type TranslationValue = string | number | boolean | Record<string, any>

/**
 * 智能类型生成器类
 */
export class TypeScriptGenerator {
  private config: Required<TypeGeneratorConfig>
  private translations = new Map<string, any>()
  private keyPaths = new Set<TranslationPath>()
  private parameterTypes = new Map<string, Set<string>>()
  private watchHandlers: Map<string, fs.FSWatcher> = new Map()

  constructor(config: TypeGeneratorConfig) {
    this.config = {
      strict: true,
      includeComments: true,
      customTypes: {},
      ignorePatterns: [],
      generateUnions: true,
      generateEnums: false,
      watch: false,
      ...config,
    }

    if (this.config.watch) {
      this.startWatching()
    }
  }

  /**
   * 生成类型定义
   */
  async generate(): Promise<string> {
    // 1. 扫描翻译文件
    await this.scanTranslations()

    // 2. 分析类型信息
    this.analyzeTypes()

    // 3. 生成TypeScript代码
    const code = this.generateTypeScript()

    // 4. 写入文件
    await this.writeOutput(code)

    return code
  }

  /**
   * 扫描翻译文件
   */
  private async scanTranslations(): Promise<void> {
    const files = await this.getTranslationFiles()

    for (const file of files) {
      const locale = path.basename(file, path.extname(file))
      const content = await this.readTranslationFile(file)
      this.translations.set(locale, content)

      // 收集所有键路径
      this.collectKeyPaths(content)
    }
  }

  /**
   * 获取翻译文件列表
   */
  private async getTranslationFiles(): Promise<string[]> {
    const files: string[] = []
    
    const scanDir = async (dir: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          await scanDir(fullPath)
        } else if (entry.isFile() && this.isTranslationFile(fullPath)) {
          files.push(fullPath)
        }
      }
    }

    await scanDir(this.config.inputDir)
    return files
  }

  /**
   * 判断是否是翻译文件
   */
  private isTranslationFile(filePath: string): boolean {
    const ext = path.extname(filePath)
    if (!['.json', '.js', '.ts'].includes(ext)) {
      return false
    }

    // 检查忽略模式
    for (const pattern of this.config.ignorePatterns) {
      if (filePath.includes(pattern)) {
        return false
      }
    }

    return true
  }

  /**
   * 读取翻译文件
   */
  private async readTranslationFile(filePath: string): Promise<any> {
    const ext = path.extname(filePath)
    const content = await fs.promises.readFile(filePath, 'utf-8')

    if (ext === '.json') {
      return JSON.parse(content)
    } else {
      // 动态导入JS/TS文件
      const module = await import(filePath)
      return module.default || module
    }
  }

  /**
   * 收集键路径
   */
  private collectKeyPaths(obj: any, prefix = ''): void {
    for (const key in obj) {
      const fullPath = prefix ? `${prefix}.${key}` : key
      this.keyPaths.add(fullPath)

      const value = obj[key]
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.collectKeyPaths(value, fullPath)
      } else if (typeof value === 'string') {
        // 分析参数
        this.analyzeParameters(fullPath, value)
      }
    }
  }

  /**
   * 分析参数
   */
  private analyzeParameters(path: string, value: string): void {
    const paramRegex = /\{\{([^}]+)\}\}/g
    let match: RegExpExecArray | null

    const params = new Set<string>()
    while ((match = paramRegex.exec(value)) !== null) {
      params.add(match[1].trim())
    }

    if (params.size > 0) {
      this.parameterTypes.set(path, params)
    }
  }

  /**
   * 分析类型信息
   */
  private analyzeTypes(): void {
    // 分析每个翻译值的类型
    for (const [locale, translations] of this.translations) {
      this.analyzeValueTypes(translations)
    }
  }

  /**
   * 分析值类型
   */
  private analyzeValueTypes(obj: any, path = ''): void {
    for (const key in obj) {
      const fullPath = path ? `${path}.${key}` : key
      const value = obj[key]

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.analyzeValueTypes(value, fullPath)
      }
    }
  }

  /**
   * 生成TypeScript代码
   */
  private generateTypeScript(): string {
    const lines: string[] = []

    // 文件头
    lines.push(this.generateHeader())

    // 生成基础类型
    lines.push(this.generateBaseTypes())

    // 生成翻译键类型
    lines.push(this.generateTranslationKeys())

    // 生成参数类型
    lines.push(this.generateParameterTypes())

    // 生成翻译函数类型
    lines.push(this.generateTranslationFunctions())

    // 生成语言类型
    lines.push(this.generateLocaleTypes())

    // 生成导出
    lines.push(this.generateExports())

    return lines.join('\n\n')
  }

  /**
   * 生成文件头
   */
  private generateHeader(): string {
    const lines: string[] = []

    if (this.config.includeComments) {
      lines.push('/**')
      lines.push(' * Auto-generated TypeScript definitions for i18n')
      lines.push(' * Generated at: ' + new Date().toISOString())
      lines.push(' * DO NOT EDIT THIS FILE DIRECTLY')
      lines.push(' */')
    }

    lines.push("/* eslint-disable */")
    lines.push("/* tslint:disable */")

    return lines.join('\n')
  }

  /**
   * 生成基础类型
   */
  private generateBaseTypes(): string {
    const lines: string[] = []

    lines.push('// Base Types')
    lines.push('export type Locale = ' + this.generateLocaleUnion() + ';')
    lines.push('export type TranslationKey = ' + this.generateKeyUnion() + ';')
    
    if (this.config.strict) {
      lines.push('export type StrictTranslationKey = TranslationKey;')
    } else {
      lines.push('export type StrictTranslationKey = TranslationKey | string;')
    }

    return lines.join('\n')
  }

  /**
   * 生成语言联合类型
   */
  private generateLocaleUnion(): string {
    const locales = Array.from(this.translations.keys())
    return locales.map(l => `'${l}'`).join(' | ')
  }

  /**
   * 生成键联合类型
   */
  private generateKeyUnion(): string {
    const keys = Array.from(this.keyPaths).sort()
    
    if (keys.length > 100 && !this.config.generateUnions) {
      // 太多键时使用字符串类型
      return 'string'
    }

    return keys.map(k => `'${k}'`).join(' | ')
  }

  /**
   * 生成翻译键类型
   */
  private generateTranslationKeys(): string {
    const lines: string[] = []

    lines.push('// Translation Keys')
    lines.push('export interface TranslationKeys {')

    // 构建嵌套结构
    const structure = this.buildNestedStructure()
    lines.push(this.formatNestedStructure(structure, 1))

    lines.push('}')

    return lines.join('\n')
  }

  /**
   * 构建嵌套结构
   */
  private buildNestedStructure(): any {
    const structure: any = {}

    for (const path of this.keyPaths) {
      const parts = path.split('.')
      let current = structure

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        
        if (i === parts.length - 1) {
          // 叶子节点
          current[part] = this.getTypeForPath(path)
        } else {
          // 中间节点
          if (!current[part]) {
            current[part] = {}
          }
          current = current[part]
        }
      }
    }

    return structure
  }

  /**
   * 获取路径的类型
   */
  private getTypeForPath(path: string): string {
    // 检查自定义类型
    if (this.config.customTypes[path]) {
      return this.config.customTypes[path]
    }

    // 检查是否有参数
    if (this.parameterTypes.has(path)) {
      return 'TranslationFunction'
    }

    // 分析实际值类型
    const values = new Set<string>()
    for (const [_, translations] of this.translations) {
      const value = this.getValueByPath(translations, path)
      if (value !== undefined) {
        values.add(typeof value)
      }
    }

    if (values.size === 0) {
      return 'string'
    } else if (values.size === 1) {
      return Array.from(values)[0]
    } else {
      return Array.from(values).join(' | ')
    }
  }

  /**
   * 根据路径获取值
   */
  private getValueByPath(obj: any, path: string): any {
    const parts = path.split('.')
    let current = obj

    for (const part of parts) {
      if (current?.[part] === undefined) {
        return undefined
      }
      current = current[part]
    }

    return current
  }

  /**
   * 格式化嵌套结构
   */
  private formatNestedStructure(structure: any, indent: number): string {
    const lines: string[] = []
    const spaces = '  '.repeat(indent)

    for (const key in structure) {
      const value = structure[key]
      const safeKey = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key) ? key : `'${key}'`

      if (typeof value === 'string') {
        // 叶子节点
        lines.push(`${spaces}${safeKey}: ${value};`)
      } else {
        // 嵌套对象
        lines.push(`${spaces}${safeKey}: {`)
        lines.push(this.formatNestedStructure(value, indent + 1))
        lines.push(`${spaces}};`)
      }
    }

    return lines.join('\n')
  }

  /**
   * 生成参数类型
   */
  private generateParameterTypes(): string {
    const lines: string[] = []

    lines.push('// Parameter Types')
    
    if (this.parameterTypes.size > 0) {
      lines.push('export interface TranslationParams {')
      
      for (const [path, params] of this.parameterTypes) {
        const interfaceName = this.pathToInterfaceName(path)
        lines.push(`  '${path}': ${interfaceName}Params;`)
      }
      
      lines.push('}')
      lines.push('')

      // 生成每个参数接口
      for (const [path, params] of this.parameterTypes) {
        const interfaceName = this.pathToInterfaceName(path)
        lines.push(`export interface ${interfaceName}Params {`)
        
        for (const param of params) {
          lines.push(`  ${param}: string | number;`)
        }
        
        lines.push('}')
      }
    } else {
      lines.push('export type TranslationParams = Record<string, never>;')
    }

    return lines.join('\n')
  }

  /**
   * 路径转接口名
   */
  private pathToInterfaceName(path: string): string {
    return path
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  /**
   * 生成翻译函数类型
   */
  private generateTranslationFunctions(): string {
    const lines: string[] = []

    lines.push('// Translation Function Types')
    lines.push('export type TranslationFunction<P = any> = (params: P) => string;')
    lines.push('')
    lines.push('export interface TypedTranslate {')
    lines.push('  <K extends TranslationKey>(key: K): K extends keyof TranslationParams')
    lines.push('    ? (params: TranslationParams[K]) => string')
    lines.push('    : string;')
    lines.push('  (key: string, params?: Record<string, any>): string;')
    lines.push('}')

    return lines.join('\n')
  }

  /**
   * 生成语言类型
   */
  private generateLocaleTypes(): string {
    const lines: string[] = []

    lines.push('// Locale Types')
    
    if (this.config.generateEnums) {
      lines.push('export enum Locales {')
      for (const locale of this.translations.keys()) {
        const enumKey = locale.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()
        lines.push(`  ${enumKey} = '${locale}',`)
      }
      lines.push('}')
    }

    // 生成每个语言的翻译接口
    for (const [locale, translations] of this.translations) {
      const interfaceName = `${locale.replace(/[^a-zA-Z0-9]/g, '')}Translations`
      lines.push(``)
      lines.push(`export interface ${interfaceName} {`)
      lines.push(this.generateTranslationInterface(translations, 1))
      lines.push('}')
    }

    return lines.join('\n')
  }

  /**
   * 生成翻译接口
   */
  private generateTranslationInterface(obj: any, indent: number): string {
    const lines: string[] = []
    const spaces = '  '.repeat(indent)

    for (const key in obj) {
      const value = obj[key]
      const safeKey = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key) ? key : `'${key}'`

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        lines.push(`${spaces}${safeKey}: {`)
        lines.push(this.generateTranslationInterface(value, indent + 1))
        lines.push(`${spaces}};`)
      } else if (Array.isArray(value)) {
        const itemType = value.length > 0 ? typeof value[0] : 'any'
        lines.push(`${spaces}${safeKey}: ${itemType}[];`)
      } else {
        lines.push(`${spaces}${safeKey}: ${typeof value};`)
      }
    }

    return lines.join('\n')
  }

  /**
   * 生成导出
   */
  private generateExports(): string {
    const lines: string[] = []

    lines.push('// Main Exports')
    lines.push('export interface I18nTypes {')
    lines.push('  locale: Locale;')
    lines.push('  t: TypedTranslate;')
    lines.push('  keys: TranslationKeys;')
    lines.push('  params: TranslationParams;')
    lines.push('}')
    lines.push('')
    lines.push('// Type Guards')
    lines.push('export function isValidLocale(locale: string): locale is Locale {')
    lines.push('  return [' + Array.from(this.translations.keys()).map(l => `'${l}'`).join(', ') + '].includes(locale);')
    lines.push('}')
    lines.push('')
    lines.push('export function isValidTranslationKey(key: string): key is TranslationKey {')
    
    if (this.keyPaths.size < 1000) {
      lines.push('  return [')
      const keys = Array.from(this.keyPaths).sort()
      for (let i = 0; i < keys.length; i += 10) {
        const chunk = keys.slice(i, i + 10).map(k => `'${k}'`).join(', ')
        lines.push(`    ${chunk}${i + 10 < keys.length ? ',' : ''}`)
      }
      lines.push('  ].includes(key);')
    } else {
      // 太多键时使用正则或其他策略
      lines.push('  return typeof key === "string" && key.length > 0;')
    }
    
    lines.push('}')

    return lines.join('\n')
  }

  /**
   * 写入输出文件
   */
  private async writeOutput(code: string): Promise<void> {
    const dir = path.dirname(this.config.outputPath)
    await fs.promises.mkdir(dir, { recursive: true })
    await fs.promises.writeFile(this.config.outputPath, code, 'utf-8')
    console.log(`✅ TypeScript definitions generated: ${this.config.outputPath}`)
  }

  /**
   * 开始监听文件变化
   */
  private startWatching(): void {
    console.log('👀 Watching for translation file changes...')
    
    const watchDir = (dir: string) => {
      const watcher = fs.watch(dir, { recursive: true }, async (eventType, filename) => {
        if (filename && this.isTranslationFile(path.join(dir, filename))) {
          console.log(`📝 Translation file changed: ${filename}`)
          await this.generate()
        }
      })
      
      this.watchHandlers.set(dir, watcher)
    }

    watchDir(this.config.inputDir)
  }

  /**
   * 停止监听
   */
  stopWatching(): void {
    for (const [_, watcher] of this.watchHandlers) {
      watcher.close()
    }
    this.watchHandlers.clear()
    console.log('👋 Stopped watching translation files')
  }
}

/**
 * CLI工具
 */
export class TypeGeneratorCLI {
  static async run(args: string[]): Promise<void> {
    const config = this.parseArgs(args)
    const generator = new TypeScriptGenerator(config)
    
    if (config.watch) {
      await generator.generate()
      console.log('👀 Watching for changes... Press Ctrl+C to stop.')
      
      // Keep process alive
      process.on('SIGINT', () => {
        generator.stopWatching()
        process.exit(0)
      })
    } else {
      await generator.generate()
    }
  }

  private static parseArgs(args: string[]): TypeGeneratorConfig {
    const config: TypeGeneratorConfig = {
      inputDir: './src/locales',
      outputPath: './src/types/i18n.d.ts',
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      switch (arg) {
        case '--input':
        case '-i':
          config.inputDir = args[++i]
          break
        case '--output':
        case '-o':
          config.outputPath = args[++i]
          break
        case '--watch':
        case '-w':
          config.watch = true
          break
        case '--strict':
          config.strict = true
          break
        case '--no-comments':
          config.includeComments = false
          break
        case '--enums':
          config.generateEnums = true
          break
        case '--help':
        case '-h':
          this.showHelp()
          process.exit(0)
      }
    }

    return config
  }

  private static showHelp(): void {
    console.log(`
i18n Type Generator

Usage: i18n-types [options]

Options:
  -i, --input <dir>      Input directory containing translation files (default: ./src/locales)
  -o, --output <file>    Output TypeScript definition file (default: ./src/types/i18n.d.ts)
  -w, --watch           Watch for file changes and regenerate types
  --strict              Generate strict types (no string fallback)
  --no-comments         Exclude comments from generated file
  --enums               Generate enum types for locales
  -h, --help           Show this help message

Examples:
  i18n-types --input ./translations --output ./types/i18n.d.ts
  i18n-types --watch --strict
    `)
  }
}

/**
 * 创建类型生成器
 */
export function createTypeGenerator(config: TypeGeneratorConfig): TypeScriptGenerator {
  return new TypeScriptGenerator(config)
}

// CLI入口
if (require.main === module) {
  TypeGeneratorCLI.run(process.argv.slice(2)).catch(console.error)
}