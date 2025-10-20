/**
 * 路由类型自动生成器
 * @module RouteTypeGenerator
 */

import type { RouteRecordRaw } from '../types'
import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * 路由类型生成选项
 */
export interface RouteTypeGeneratorOptions {
  /** 路由配置文件路径 */
  routesPath?: string
  /** 输出目录 */
  outputDir?: string
  /** 输出文件名 */
  outputFileName?: string
  /** 是否生成路径参数类型 */
  generateParams?: boolean
  /** 是否生成查询参数类型 */
  generateQuery?: boolean
  /** 是否生成元信息类型 */
  generateMeta?: boolean
  /** 是否生成导航守卫类型 */
  generateGuards?: boolean
  /** 是否启用严格模式 */
  strictMode?: boolean
  /** 是否监听文件变化 */
  watch?: boolean
  /** 自定义类型转换器 */
  customTransformers?: TypeTransformer[]
  /** 模板配置 */
  templates?: TypeTemplates
  /** 是否生成联合类型 */
  generateUnions?: boolean
  /** 是否生成枚举 */
  generateEnums?: boolean
}

/**
 * 类型转换器
 */
export interface TypeTransformer {
  /** 转换器名称 */
  name: string
  /** 匹配模式 */
  pattern: RegExp | string
  /** 转换函数 */
  transform: (route: RouteRecordRaw) => string
}

/**
 * 类型模板配置
 */
export interface TypeTemplates {
  /** 文件头部模板 */
  header?: string
  /** 文件尾部模板 */
  footer?: string
  /** 路由类型模板 */
  route?: string
  /** 参数类型模板 */
  params?: string
  /** 查询类型模板 */
  query?: string
  /** 元信息类型模板 */
  meta?: string
}

/**
 * 路由信息
 */
interface RouteInfo {
  name: string
  path: string
  params: Record<string, string>
  query: Record<string, string>
  meta: Record<string, any>
  component?: string
  children?: RouteInfo[]
}

/**
 * 生成的类型定义
 */
interface GeneratedTypes {
  /** 路由名称类型 */
  routeNames: string
  /** 路由路径类型 */
  routePaths: string
  /** 路由参数类型 */
  routeParams: string
  /** 路由查询类型 */
  routeQuery: string
  /** 路由元信息类型 */
  routeMeta: string
  /** 路由映射类型 */
  routeMap: string
  /** 辅助类型 */
  helpers: string
}

/**
 * 路由类型生成器类
 */
export class RouteTypeGenerator {
  private options: Required<RouteTypeGeneratorOptions>
  private routes: RouteRecordRaw[] = []
  private routeInfos: RouteInfo[] = []
  private generatedTypes: GeneratedTypes = {
    routeNames: '',
    routePaths: '',
    routeParams: '',
    routeQuery: '',
    routeMeta: '',
    routeMap: '',
    helpers: ''
  }
  private fileWatcher: fs.FSWatcher | null = null

  constructor(options: RouteTypeGeneratorOptions = {}) {
    this.options = {
      routesPath: './src/routes.ts',
      outputDir: './src/types',
      outputFileName: 'route-types.ts',
      generateParams: true,
      generateQuery: true,
      generateMeta: true,
      generateGuards: true,
      strictMode: false,
      watch: false,
      generateUnions: true,
      generateEnums: true,
      customTransformers: [],
      templates: this.getDefaultTemplates(),
      ...options
    }
  }

  /**
   * 获取默认模板
   */
  private getDefaultTemplates(): TypeTemplates {
    return {
      header: `/**
 * 自动生成的路由类型定义
 * @generated
 * @description 此文件由路由类型生成器自动生成，请勿手动修改
 */

import type { RouteLocationNormalizedLoaded, RouteLocationRaw, RouteParams, LocationQuery } from 'vue-router'

`,
      footer: `
/**
 * 类型导出
 */
export type {
  RouteNames,
  RoutePaths,
  RouteParamsMap,
  RouteQueryMap,
  RouteMetaMap,
  RouteMap,
  TypedRoute,
  TypedRouteLocation,
  TypedRouteLocationRaw
}
`,
      route: '',
      params: '',
      query: '',
      meta: ''
    }
  }

  /**
   * 生成类型
   */
  public async generate(routes?: RouteRecordRaw[]): Promise<void> {
    try {
      // 加载路由
      if (routes) {
        this.routes = routes
      } else {
        this.routes = await this.loadRoutes()
      }

      // 解析路由信息
      this.routeInfos = this.parseRoutes(this.routes)

      // 生成类型定义
      this.generateRouteNames()
      this.generateRoutePaths()
      
      if (this.options.generateParams) {
        this.generateRouteParams()
      }
      
      if (this.options.generateQuery) {
        this.generateRouteQuery()
      }
      
      if (this.options.generateMeta) {
        this.generateRouteMeta()
      }

      this.generateRouteMap()
      this.generateHelperTypes()

      // 写入文件
      await this.writeTypes()

      // 启动监听
      if (this.options.watch) {
        this.startWatcher()
      }

      console.log('✅ 路由类型生成成功')
    } catch (error) {
      console.error('❌ 路由类型生成失败:', error)
      throw error
    }
  }

  /**
   * 加载路由配置
   */
  private async loadRoutes(): Promise<RouteRecordRaw[]> {
    const routesPath = path.resolve(this.options.routesPath)
    
    if (!fs.existsSync(routesPath)) {
      throw new Error(`路由文件不存在: ${routesPath}`)
    }

    // 动态导入路由文件
    const routeModule = await import(routesPath)
    return routeModule.default || routeModule.routes || []
  }

  /**
   * 解析路由信息
   */
  private parseRoutes(routes: RouteRecordRaw[], parentPath = ''): RouteInfo[] {
    const infos: RouteInfo[] = []

    for (const route of routes) {
      const fullPath = this.joinPath(parentPath, route.path)
      const params = this.extractParams(fullPath)
      const query = this.extractQuery(route)
      
      const info: RouteInfo = {
        name: String(route.name || ''),
        path: fullPath,
        params,
        query,
        meta: route.meta || {},
        component: route.component as string | undefined
      }

      if (route.children) {
        info.children = this.parseRoutes(route.children, fullPath)
      }

      infos.push(info)

      // 递归添加子路由
      if (info.children) {
        infos.push(...info.children)
      }
    }

    return infos
  }

  /**
   * 连接路径
   */
  private joinPath(parent: string, child: string): string {
    if (child.startsWith('/')) {
      return child
    }
    
    const separator = parent.endsWith('/') ? '' : '/'
    return parent + separator + child
  }

  /**
   * 提取路径参数
   */
  private extractParams(path: string): Record<string, string> {
    const params: Record<string, string> = {}
    const paramRegex = /:([^/]+)(\(.*?\))?(\?)?/g
    let match

    while ((match = paramRegex.exec(path)) !== null) {
      const paramName = match[1]
      const isOptional = match[3] === '?'
      params[paramName] = isOptional ? 'string | undefined' : 'string'
    }

    return params
  }

  /**
   * 提取查询参数
   */
  private extractQuery(route: RouteRecordRaw): Record<string, string> {
    // 从路由配置中提取查询参数信息
    // 这里可以根据实际项目的约定来解析
    const query: Record<string, string> = {}
    
    if (route.meta?.query) {
      Object.assign(query, route.meta.query)
    }

    return query
  }

  /**
   * 生成路由名称类型
   */
  private generateRouteNames() {
    const names = this.routeInfos
      .filter(info => info.name)
      .map(info => `'${info.name}'`)

    if (this.options.generateEnums) {
      // 生成枚举
      this.generatedTypes.routeNames = `
/**
 * 路由名称枚举
 */
export enum RouteNamesEnum {
${this.routeInfos
  .filter(info => info.name)
  .map(info => `  ${this.toUpperCase(info.name)} = '${info.name}'`)
  .join(',\n')}
}
`
    }

    if (this.options.generateUnions) {
      // 生成联合类型
      this.generatedTypes.routeNames += `
/**
 * 路由名称类型
 */
export type RouteNames = ${names.length > 0 ? names.join(' | ') : 'never'}
`
    }
  }

  /**
   * 生成路由路径类型
   */
  private generateRoutePaths() {
    const paths = this.routeInfos
      .map(info => `'${info.path}'`)

    if (this.options.generateEnums) {
      // 生成枚举
      this.generatedTypes.routePaths = `
/**
 * 路由路径枚举
 */
export enum RoutePathsEnum {
${this.routeInfos
  .map(info => `  ${this.toUpperCase(info.name || info.path)} = '${info.path}'`)
  .join(',\n')}
}
`
    }

    if (this.options.generateUnions) {
      // 生成联合类型
      this.generatedTypes.routePaths += `
/**
 * 路由路径类型
 */
export type RoutePaths = ${paths.length > 0 ? paths.join(' | ') : 'never'}
`
    }
  }

  /**
   * 生成路由参数类型
   */
  private generateRouteParams() {
    const paramsMap: string[] = []

    for (const info of this.routeInfos) {
      if (Object.keys(info.params).length > 0 && info.name) {
        const paramType = this.generateObjectType(info.params)
        paramsMap.push(`  '${info.name}': ${paramType}`)
      }
    }

    this.generatedTypes.routeParams = `
/**
 * 路由参数映射
 */
export interface RouteParamsMap {
${paramsMap.length > 0 ? paramsMap.join('\n') : '  [key: string]: never'}
}

/**
 * 获取路由参数类型
 */
export type GetRouteParams<T extends RouteNames> = T extends keyof RouteParamsMap 
  ? RouteParamsMap[T] 
  : Record<string, string | undefined>
`
  }

  /**
   * 生成路由查询类型
   */
  private generateRouteQuery() {
    const queryMap: string[] = []

    for (const info of this.routeInfos) {
      if (Object.keys(info.query).length > 0 && info.name) {
        const queryType = this.generateObjectType(info.query)
        queryMap.push(`  '${info.name}': ${queryType}`)
      }
    }

    this.generatedTypes.routeQuery = `
/**
 * 路由查询参数映射
 */
export interface RouteQueryMap {
${queryMap.length > 0 ? queryMap.join('\n') : '  [key: string]: never'}
}

/**
 * 获取路由查询参数类型
 */
export type GetRouteQuery<T extends RouteNames> = T extends keyof RouteQueryMap 
  ? RouteQueryMap[T] 
  : LocationQuery
`
  }

  /**
   * 生成路由元信息类型
   */
  private generateRouteMeta() {
    const metaMap: string[] = []

    for (const info of this.routeInfos) {
      if (Object.keys(info.meta).length > 0 && info.name) {
        const metaType = this.generateObjectType(info.meta)
        metaMap.push(`  '${info.name}': ${metaType}`)
      }
    }

    this.generatedTypes.routeMeta = `
/**
 * 路由元信息映射
 */
export interface RouteMetaMap {
${metaMap.length > 0 ? metaMap.join('\n') : '  [key: string]: never'}
}

/**
 * 获取路由元信息类型
 */
export type GetRouteMeta<T extends RouteNames> = T extends keyof RouteMetaMap 
  ? RouteMetaMap[T] 
  : Record<string, any>
`
  }

  /**
   * 生成路由映射类型
   */
  private generateRouteMap() {
    const routeMap: string[] = []

    for (const info of this.routeInfos) {
      if (info.name) {
        routeMap.push(`  '${info.name}': {
    name: '${info.name}'
    path: '${info.path}'
    params: ${this.generateObjectType(info.params)}
    query: ${this.generateObjectType(info.query)}
    meta: ${this.generateObjectType(info.meta)}
  }`)
      }
    }

    this.generatedTypes.routeMap = `
/**
 * 完整路由映射
 */
export interface RouteMap {
${routeMap.length > 0 ? routeMap.join('\n') : '  [key: string]: never'}
}
`
  }

  /**
   * 生成辅助类型
   */
  private generateHelperTypes() {
    this.generatedTypes.helpers = `
/**
 * 类型安全的路由对象
 */
export interface TypedRoute<T extends RouteNames = RouteNames> {
  name: T
  params?: T extends keyof RouteParamsMap ? RouteParamsMap[T] : never
  query?: T extends keyof RouteQueryMap ? RouteQueryMap[T] : never
  meta?: T extends keyof RouteMetaMap ? RouteMetaMap[T] : never
}

/**
 * 类型安全的路由位置
 */
export type TypedRouteLocation<T extends RouteNames = RouteNames> = 
  RouteLocationNormalizedLoaded & TypedRoute<T>

/**
 * 类型安全的路由跳转参数
 */
export type TypedRouteLocationRaw<T extends RouteNames = RouteNames> = 
  | T
  | TypedRoute<T>
  | { path: RoutePaths }

/**
 * 路由导航守卫类型
 */
export type TypedNavigationGuard<T extends RouteNames = RouteNames> = (
  to: TypedRouteLocation<T>,
  from: TypedRouteLocation<T>
) => void | Promise<void> | boolean | RouteLocationRaw

/**
 * 路由钩子类型
 */
export type TypedRouteHook<T extends RouteNames = RouteNames> = (
  route: TypedRouteLocation<T>
) => void | Promise<void>

/**
 * 严格模式路由类型
 */
${this.options.strictMode ? `
export type StrictRoute<T extends RouteNames> = {
  [K in keyof RouteMap[T]]: RouteMap[T][K]
}
` : ''}
`
  }

  /**
   * 生成对象类型字符串
   */
  private generateObjectType(obj: Record<string, any>): string {
    if (Object.keys(obj).length === 0) {
      return '{}'
    }

    const entries = Object.entries(obj).map(([key, value]) => {
      const type = this.inferType(value)
      return `    ${key}: ${type}`
    })

    return `{\n${entries.join('\n')}\n  }`
  }

  /**
   * 推断类型
   */
  private inferType(value: any): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') {
      // 检查是否是类型字符串
      if (value.includes('|') || value.includes('&')) {
        return value
      }
      return `'${value}'`
    }
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]'
      const types = value.map(v => this.inferType(v))
      const uniqueTypes = [...new Set(types)]
      return uniqueTypes.length === 1 
        ? `${uniqueTypes[0]}[]` 
        : `(${uniqueTypes.join(' | ')})[]`
    }
    if (typeof value === 'object') {
      return this.generateObjectType(value)
    }
    return 'any'
  }

  /**
   * 转换为大写下划线格式
   */
  private toUpperCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .replace(/[^a-z0-9]/gi, '_')
      .toUpperCase()
      .replace(/^_/, '')
  }

  /**
   * 写入类型文件
   */
  private async writeTypes(): Promise<void> {
    const outputPath = path.resolve(this.options.outputDir, this.options.outputFileName)
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 组合所有类型定义
    const content = [
      this.options.templates?.header || this.getDefaultTemplates().header,
      this.generatedTypes.routeNames,
      this.generatedTypes.routePaths,
      this.generatedTypes.routeParams,
      this.generatedTypes.routeQuery,
      this.generatedTypes.routeMeta,
      this.generatedTypes.routeMap,
      this.generatedTypes.helpers,
      this.options.templates?.footer || this.getDefaultTemplates().footer
    ].join('\n')

    // 写入文件
    fs.writeFileSync(outputPath, content, 'utf-8')
    
    console.log(`📝 类型文件已生成: ${outputPath}`)
  }

  /**
   * 启动文件监听
   */
  private startWatcher() {
    if (this.fileWatcher) {
      this.fileWatcher.close()
    }

    const watchPath = path.resolve(this.options.routesPath)
    
    this.fileWatcher = fs.watch(watchPath, async (eventType, filename) => {
      console.log(`🔄 检测到路由文件变化: ${filename}`)
      
      // 延迟重新生成，避免频繁触发
      setTimeout(async () => {
        try {
          await this.generate()
        } catch (error) {
          console.error('❌ 自动生成失败:', error)
        }
      }, 500)
    })

    console.log(`👀 正在监听路由文件: ${watchPath}`)
  }

  /**
   * 停止监听
   */
  public stopWatcher() {
    if (this.fileWatcher) {
      this.fileWatcher.close()
      this.fileWatcher = null
      console.log('🛑 已停止监听')
    }
  }

  /**
   * 应用自定义转换器
   */
  private applyTransformers(route: RouteRecordRaw): Record<string, string> {
    const results: Record<string, string> = {}

    for (const transformer of this.options.customTransformers) {
      const pattern = transformer.pattern
      const shouldTransform = typeof pattern === 'string' 
        ? route.path.includes(pattern)
        : pattern.test(route.path)

      if (shouldTransform) {
        const transformed = transformer.transform(route)
        results[transformer.name] = transformed
      }
    }

    return results
  }

  /**
   * 生成类型声明文件
   */
  public async generateDeclaration(): Promise<void> {
    const declarationContent = `
declare module 'vue-router' {
  import type { RouteNames, RouteParamsMap, RouteQueryMap, RouteMetaMap } from '${this.options.outputFileName.replace('.ts', '')}'

  export interface RouteMeta extends RouteMetaMap[keyof RouteMetaMap] {}
  
  export interface RouteLocationNormalizedLoaded {
    name: RouteNames
    params: RouteParamsMap[RouteNames]
    query: RouteQueryMap[RouteNames]
    meta: RouteMetaMap[RouteNames]
  }
}
`

    const declarationPath = path.resolve(
      this.options.outputDir, 
      'vue-router.d.ts'
    )

    fs.writeFileSync(declarationPath, declarationContent, 'utf-8')
    console.log(`📝 声明文件已生成: ${declarationPath}`)
  }

  /**
   * 清理生成的文件
   */
  public clean() {
    const outputPath = path.resolve(this.options.outputDir, this.options.outputFileName)
    const declarationPath = path.resolve(this.options.outputDir, 'vue-router.d.ts')

    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
      console.log(`🗑️  已删除: ${outputPath}`)
    }

    if (fs.existsSync(declarationPath)) {
      fs.unlinkSync(declarationPath)
      console.log(`🗑️  已删除: ${declarationPath}`)
    }

    this.stopWatcher()
  }
}

/**
 * 创建路由类型生成器
 */
export function createRouteTypeGenerator(
  options?: RouteTypeGeneratorOptions
): RouteTypeGenerator {
  return new RouteTypeGenerator(options)
}