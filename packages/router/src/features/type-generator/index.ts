/**
 * @ldesign/router TypeScript 类型自动生成工具
 * 
 * 根据路由配置自动生成类型定义，提升开发效率
 */

import type { RouteRecordRaw } from '../../types'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

// ==================== 类型定义 ====================

export interface TypeGeneratorOptions {
  /**
   * 输出目录
   */
  outputDir?: string
  
  /**
   * 输出文件名
   */
  filename?: string
  
  /**
   * 是否生成枚举
   */
  generateEnums?: boolean
  
  /**
   * 是否生成路径辅助函数
   */
  generateHelpers?: boolean
  
  /**
   * 是否监听变化
   */
  watch?: boolean
  
  /**
   * 自定义类型前缀
   */
  typePrefix?: string
  
  /**
   * 自定义类型后缀
   */
  typeSuffix?: string
  
  /**
   * 格式化选项
   */
  prettier?: boolean | object
}

export interface RouteTypeInfo {
  name: string
  path: string
  params?: string[]
  query?: string[]
  meta?: Record<string, any>
}

// ==================== 类型生成器 ====================

export class RouteTypeGenerator {
  private routes: RouteRecordRaw[]
  private options: Required<TypeGeneratorOptions>
  private routeInfos: RouteTypeInfo[] = []
  
  constructor(routes: RouteRecordRaw[], options: TypeGeneratorOptions = {}) {
    this.routes = routes
    this.options = {
      outputDir: './src/types',
      filename: 'routes.generated.ts',
      generateEnums: true,
      generateHelpers: true,
      watch: false,
      typePrefix: '',
      typeSuffix: '',
      prettier: true,
      ...options,
    }
    
    // 解析路由信息
    this.parseRoutes()
  }
  
  /**
   * 解析路由信息
   */
  private parseRoutes(): void {
    this.routeInfos = []
    this.traverseRoutes(this.routes)
  }
  
  /**
   * 遍历路由树
   */
  private traverseRoutes(routes: RouteRecordRaw[], parentPath = ''): void {
    for (const route of routes) {
      const fullPath = this.normalizePath(parentPath, route.path)
      
      if (route.name) {
        const info: RouteTypeInfo = {
          name: String(route.name),
          path: fullPath,
          params: this.extractParams(fullPath),
          query: this.extractQuery(route),
          meta: route.meta,
        }
        
        this.routeInfos.push(info)
      }
      
      // 递归处理子路由
      if (route.children) {
        this.traverseRoutes(route.children, fullPath)
      }
    }
  }
  
  /**
   * 标准化路径
   */
  private normalizePath(parent: string, path: string): string {
    if (path.startsWith('/')) {
      return path
    }
    
    const base = parent.endsWith('/') ? parent.slice(0, -1) : parent
    return `${base}/${path}`
  }
  
  /**
   * 提取路径参数
   */
  private extractParams(path: string): string[] {
    const params: string[] = []
    const regex = /:([^/?]+)/g
    let match: RegExpExecArray | null
    
    while ((match = regex.exec(path)) !== null) {
      params.push(match[1].replace(/\?$/, ''))
    }
    
    return params
  }
  
  /**
   * 提取查询参数
   */
  private extractQuery(route: RouteRecordRaw): string[] {
    // 从 meta 或其他配置中提取预定义的查询参数
    if (route.meta?.query && Array.isArray(route.meta.query)) {
      return route.meta.query
    }
    return []
  }
  
  /**
   * 生成类型定义
   */
  generate(): string {
    const lines: string[] = []
    
    // 文件头
    lines.push('/**')
    lines.push(' * 自动生成的路由类型定义')
    lines.push(' * 请勿手动修改此文件')
    lines.push(` * 生成时间: ${new Date().toISOString()}`)
    lines.push(' */')
    lines.push('')
    
    // 导入类型
    lines.push("import type { RouteLocationRaw, RouteParams, RouteQuery } from '@ldesign/router'")
    lines.push('')
    
    // 生成路由名称类型
    if (this.options.generateEnums) {
      lines.push(...this.generateRouteNamesEnum())
      lines.push('')
    } else {
      lines.push(...this.generateRouteNamesType())
      lines.push('')
    }
    
    // 生成路由参数类型
    lines.push(...this.generateRouteParamsTypes())
    lines.push('')
    
    // 生成路由查询类型
    lines.push(...this.generateRouteQueryTypes())
    lines.push('')
    
    // 生成路由元信息类型
    lines.push(...this.generateRouteMetaTypes())
    lines.push('')
    
    // 生成路由映射类型
    lines.push(...this.generateRouteMap())
    lines.push('')
    
    // 生成辅助函数
    if (this.options.generateHelpers) {
      lines.push(...this.generateHelperFunctions())
      lines.push('')
    }
    
    // 生成类型守卫
    lines.push(...this.generateTypeGuards())
    
    return lines.join('\n')
  }
  
  /**
   * 生成路由名称枚举
   */
  private generateRouteNamesEnum(): string[] {
    const lines: string[] = []
    
    lines.push(`export enum ${this.options.typePrefix}RouteNames${this.options.typeSuffix} {`)
    
    for (const info of this.routeInfos) {
      const enumKey = this.toConstantCase(info.name)
      lines.push(`  ${enumKey} = '${info.name}',`)
    }
    
    lines.push('}')
    
    return lines
  }
  
  /**
   * 生成路由名称类型
   */
  private generateRouteNamesType(): string[] {
    const lines: string[] = []
    
    const names = this.routeInfos.map(info => `'${info.name}'`).join(' | ')
    lines.push(`export type ${this.options.typePrefix}RouteNames${this.options.typeSuffix} = ${names}`)
    
    return lines
  }
  
  /**
   * 生成路由参数类型
   */
  private generateRouteParamsTypes(): string[] {
    const lines: string[] = []
    
    lines.push(`export interface ${this.options.typePrefix}RouteParams${this.options.typeSuffix} {`)
    
    for (const info of this.routeInfos) {
      if (info.params && info.params.length > 0) {
        const paramType = info.params.map(p => `${p}: string`).join('; ')
        lines.push(`  '${info.name}': { ${paramType} }`)
      } else {
        lines.push(`  '${info.name}': Record<string, never>`)
      }
    }
    
    lines.push('}')
    
    return lines
  }
  
  /**
   * 生成路由查询类型
   */
  private generateRouteQueryTypes(): string[] {
    const lines: string[] = []
    
    lines.push(`export interface ${this.options.typePrefix}RouteQueryParams${this.options.typeSuffix} {`)
    
    for (const info of this.routeInfos) {
      if (info.query && info.query.length > 0) {
        const queryType = info.query.map(q => `${q}?: string`).join('; ')
        lines.push(`  '${info.name}': { ${queryType} }`)
      } else {
        lines.push(`  '${info.name}': Record<string, string | undefined>`)
      }
    }
    
    lines.push('}')
    
    return lines
  }
  
  /**
   * 生成路由元信息类型
   */
  private generateRouteMetaTypes(): string[] {
    const lines: string[] = []
    
    lines.push(`export interface ${this.options.typePrefix}RouteMeta${this.options.typeSuffix} {`)
    
    // 收集所有的 meta 字段
    const metaFields = new Set<string>()
    for (const info of this.routeInfos) {
      if (info.meta) {
        Object.keys(info.meta).forEach(key => metaFields.add(key))
      }
    }
    
    // 生成 meta 类型
    for (const field of metaFields) {
      const fieldType = this.inferMetaFieldType(field)
      lines.push(`  ${field}?: ${fieldType}`)
    }
    
    lines.push('}')
    
    return lines
  }
  
  /**
   * 推断 meta 字段类型
   */
  private inferMetaFieldType(field: string): string {
    // 根据字段名推断类型
    const typeMap: Record<string, string> = {
      title: 'string',
      icon: 'string',
      requiresAuth: 'boolean',
      permissions: 'string[]',
      roles: 'string[]',
      keepAlive: 'boolean',
      hidden: 'boolean',
      order: 'number',
    }
    
    return typeMap[field] || 'any'
  }
  
  /**
   * 生成路由映射
   */
  private generateRouteMap(): string[] {
    const lines: string[] = []
    
    lines.push(`export interface ${this.options.typePrefix}RouteMap${this.options.typeSuffix} {`)
    
    for (const info of this.routeInfos) {
      lines.push(`  '${info.name}': {`)
      lines.push(`    path: '${info.path}'`)
      
      if (info.params && info.params.length > 0) {
        lines.push(`    params: ${this.options.typePrefix}RouteParams${this.options.typeSuffix}['${info.name}']`)
      }
      
      if (info.query && info.query.length > 0) {
        lines.push(`    query: ${this.options.typePrefix}RouteQueryParams${this.options.typeSuffix}['${info.name}']`)
      }
      
      lines.push(`  }`)
    }
    
    lines.push('}')
    
    return lines
  }
  
  /**
   * 生成辅助函数
   */
  private generateHelperFunctions(): string[] {
    const lines: string[] = []
    
    // 生成类型安全的路由导航函数
    lines.push('/**')
    lines.push(' * 类型安全的路由导航')
    lines.push(' */')
    lines.push(`export function typedRoute<T extends ${this.options.typePrefix}RouteNames${this.options.typeSuffix}>(`)
    lines.push('  name: T,')
    lines.push(`  params?: ${this.options.typePrefix}RouteParams${this.options.typeSuffix}[T],`)
    lines.push(`  query?: ${this.options.typePrefix}RouteQueryParams${this.options.typeSuffix}[T]`)
    lines.push('): RouteLocationRaw {')
    lines.push('  return {')
    lines.push('    name,')
    lines.push('    params: params as RouteParams,')
    lines.push('    query: query as RouteQuery,')
    lines.push('  }')
    lines.push('}')
    lines.push('')
    
    // 生成路径构建函数
    lines.push('/**')
    lines.push(' * 构建路由路径')
    lines.push(' */')
    lines.push(`export function buildPath<T extends ${this.options.typePrefix}RouteNames${this.options.typeSuffix}>(`)
    lines.push('  name: T,')
    lines.push(`  params?: ${this.options.typePrefix}RouteParams${this.options.typeSuffix}[T]`)
    lines.push('): string {')
    lines.push(`  const routes: Record<${this.options.typePrefix}RouteNames${this.options.typeSuffix}, string> = {`)
    
    for (const info of this.routeInfos) {
      lines.push(`    '${info.name}': '${info.path}',`)
    }
    
    lines.push('  }')
    lines.push('')
    lines.push('  let path = routes[name]')
    lines.push('  if (params) {')
    lines.push('    Object.entries(params).forEach(([key, value]) => {')
    lines.push('      path = path.replace(`:${key}`, String(value))')
    lines.push('    })')
    lines.push('  }')
    lines.push('  return path')
    lines.push('}')
    
    return lines
  }
  
  /**
   * 生成类型守卫
   */
  private generateTypeGuards(): string[] {
    const lines: string[] = []
    
    lines.push('/**')
    lines.push(' * 检查是否为有效的路由名称')
    lines.push(' */')
    lines.push(`export function isValidRouteName(name: any): name is ${this.options.typePrefix}RouteNames${this.options.typeSuffix} {`)
    lines.push(`  const validNames: ${this.options.typePrefix}RouteNames${this.options.typeSuffix}[] = [`)
    
    for (const info of this.routeInfos) {
      lines.push(`    '${info.name}',`)
    }
    
    lines.push('  ]')
    lines.push('  return validNames.includes(name)')
    lines.push('}')
    
    return lines
  }
  
  /**
   * 转换为常量命名
   */
  private toConstantCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toUpperCase()
  }
  
  /**
   * 写入文件
   */
  async write(): Promise<void> {
    const content = this.generate()
    const outputPath = join(this.options.outputDir, this.options.filename)
    
    // 确保目录存在
    const dir = dirname(outputPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    
    // 格式化内容（如果启用）
    let formattedContent = content
    if (this.options.prettier) {
      try {
        const prettier = await import('prettier')
        formattedContent = await prettier.format(content, {
          parser: 'typescript',
          ...(typeof this.options.prettier === 'object' ? this.options.prettier : {}),
        })
      } catch {
        // Prettier 不可用，使用原始内容
      }
    }
    
    // 写入文件
    writeFileSync(outputPath, formattedContent, 'utf-8')
    
    console.log(`✨ 路由类型已生成: ${outputPath}`)
  }
  
  /**
   * 监听路由变化并重新生成
   */
  watch(routes: RouteRecordRaw[]): void {
    if (!this.options.watch) return
    
    // 简单的轮询实现，实际项目中可以使用 chokidar 等库
    setInterval(() => {
      const newContent = this.generate()
      const outputPath = join(this.options.outputDir, this.options.filename)
      
      try {
        const existingContent = require('node:fs').readFileSync(outputPath, 'utf-8')
        if (existingContent !== newContent) {
          this.write()
        }
      } catch {
        // 文件不存在，写入
        this.write()
      }
    }, 5000)
  }
}

// ==================== 工厂函数 ====================

/**
 * 生成路由类型
 */
export function generateRouteTypes(
  routes: RouteRecordRaw[],
  options?: TypeGeneratorOptions
): RouteTypeGenerator {
  const generator = new RouteTypeGenerator(routes, options)
  generator.write()
  return generator
}

// ==================== Vite 插件 ====================

export function vitePluginRouteTypes(options?: TypeGeneratorOptions) {
  const routes: RouteRecordRaw[] = []
  
  return {
    name: 'vite-plugin-route-types',
    
    configResolved() {
      // 延迟执行，确保路由已加载
      setTimeout(() => {
        if (routes.length > 0) {
          generateRouteTypes(routes, options)
        }
      }, 100)
    },
    
    handleHotUpdate({ file }: any) {
      // 监听路由文件变化
      if (file.includes('routes') || file.includes('router')) {
        generateRouteTypes(routes, options)
      }
    },
  }
}

// ==================== Webpack 插件 ====================

export class WebpackPluginRouteTypes {
  private options: TypeGeneratorOptions
  
  constructor(options?: TypeGeneratorOptions) {
    this.options = options || {}
  }
  
  apply(compiler: any) {
    compiler.hooks.afterEmit.tap('WebpackPluginRouteTypes', () => {
      // 这里需要从项目中获取路由配置
      // 实际使用时需要根据项目结构调整
    })
  }
}