/**
 * 模板扫描器 - 使用 import.meta.glob 动态扫描模板
 */

import type { Component } from 'vue'
import type { DeviceType, TemplateConfig, TemplateMetadata, TemplateRegistryItem, TemplateScanResult } from '../types'

/**
 * 模板路径解析结果
 */
interface PathInfo {
  category: string
  device: string
  name: string
  fullPath: string
}

/**
 * 解析模板路径 - 内存优化版本
 * 路径格式：../templates/{category}/{device}/{name}/config.ts
 */
function parseTemplatePath(path: string): PathInfo | null {
  // 使用正则，避免每次调用创建新正则
  const match = path.match(/templates\/([^/]+)\/([^/]+)\/([^/]+)\/config\.(ts|js)$/)
  
  if (!match) {
    return null
  }

  const [, category, device, name] = match

  // 直接返回对象字面量，避免中间变量
  return {
    category,
    device,
    name,
    fullPath: path,
  }
}

/**
 * 获取组件路径（从配置路径推导）- 内存优化
 */
function getComponentPath(configPath: string): string {
  // 使用正则，避免重复创建
  return configPath.replace(/config\.(ts|js)$/, 'index.vue')
}

/**
 * 获取打包后的组件路径 - 内存优化
 */
function getBuiltComponentPath(configPath: string): string {
  // 使用正则，避免重复创建
  return configPath.replace(/config\.(ts|js)$/, 'index.vue.js')
}

/**
 * 模板扫描器类 - 内存优化版本
 */
export class TemplateScanner {
  // 使用 null 初始化，扫描后立即清理，减少内存占用
  private configModules: Record<string, unknown> | null = null
  private componentModules: Record<string, unknown> | null = null
  // 使用 Map 存储注册表，支持高效查找
  private registry: Map<string, TemplateRegistryItem> = new Map()
  // WeakMap 缓存扫描结果，允许垃圾回收
  private scanCache: WeakMap<object, TemplateScanResult> = new WeakMap()
  // 复用正则表达式，避免重复创建
  static readonly PATH_REGEX = /templates\/([^/]+)\/([^/]+)\/([^/]+)\/config\.(ts|js)$/
  static readonly CONFIG_REPLACE_REGEX = /config\.(ts|js)$/

  /**
   * 扫描所有模板
   * 
   * 关键点：
   * 1. 使用 import.meta.glob 的 eager 模式同步加载所有配置
   * 2. 使用普通模式（懒加载）加载组件
   * 3. 支持 .ts 和 .js 配置文件（开发和生产环境）
   * 4. 支持 .vue 文件（开发环境）和 .vue.js 文件（打包后）
   */
  async scan(): Promise<TemplateScanResult> {
    const startTime = performance.now()

    // 使用缓存键检查是否已扫描
    const cacheKey = { _scanner: true }
    const cached = this.scanCache.get(cacheKey)
    if (cached) return cached

    // 1. 扫描所有 config.ts/js 文件（eager 模式，同步加载）
    this.configModules = import.meta.glob(
      '../templates/**/config.{ts,js}',
      { eager: true }
    )

    // 2. 扫描所有 index.vue 和 index.vue.js 文件（懒加载模式）
    // 开发环境使用 .vue，生产环境使用 .vue.js
    this.componentModules = {
      ...import.meta.glob('../templates/**/index.vue'),
      ...import.meta.glob('../templates/**/index.vue.js'),
    }

    // 3. 解析并注册所有模板 - 预分配数组大小以减少扩容
    const moduleEntries = Object.entries(this.configModules)
    const templates: TemplateMetadata[] = Array.from({length: moduleEntries.length})
    let templateIndex = 0
    const byCategory: Record<string, number> = Object.create(null) // 使用 Object.create(null) 节省原型链内存
    const byDevice: Record<string, number> = Object.create(null)

    for (const [path, module] of moduleEntries) {
      const pathInfo = parseTemplatePath(path)
      
      if (!pathInfo) {
        console.warn(`[TemplateScanner] 无法解析路径: ${path}`)
        continue
      }

      // 获取配置（支持 default export 和直接 export）
      const mod = module as unknown as { default?: TemplateConfig } | TemplateConfig
      const config: TemplateConfig = (mod && typeof mod === 'object' && 'default' in mod)
        ? (mod.default as TemplateConfig)
        : (mod as TemplateConfig)

      // 构建完整的元数据
      const metadata: TemplateMetadata = {
        ...config,
        category: pathInfo.category,
        device: pathInfo.device as DeviceType,
        name: config.name || pathInfo.name,
      }

      // 获取组件路径（尝试 .vue 和 .vue.js）
      const componentPath = getComponentPath(path)
      const builtComponentPath = getBuiltComponentPath(path)
      
      // 优先使用 .vue 文件（开发环境），如果不存在则使用 .vue.js（生产环境）
      const componentLoader = this.componentModules[componentPath] || 
                             this.componentModules[builtComponentPath]
      
      const actualComponentPath = this.componentModules[componentPath] ? 
                                  componentPath : builtComponentPath

      if (!componentLoader) {
        console.warn(
          `[TemplateScanner] 未找到组件: ${componentPath} 或 ${builtComponentPath} (配置: ${path})`
        )
        continue
      }

      // 创建注册表项
      const registryItem: TemplateRegistryItem = {
        metadata,
        loader: async () => {
          const mod = await (componentLoader as () => Promise<unknown>)()
          const m = mod as { default?: Component }
          return (m.default ?? (mod as Component))
        },
        configPath: path,
        componentPath: actualComponentPath,
      }

      // 生成唯一键：category/device/name
      const key = `${metadata.category}/${metadata.device}/${metadata.name}`
      this.registry.set(key, registryItem)

      // 统计 - 使用预分配的数组位置
      templates[templateIndex++] = metadata
      byCategory[metadata.category] = (byCategory[metadata.category] || 0) + 1
      byDevice[metadata.device] = (byDevice[metadata.device] || 0) + 1
    }

    // 调整数组大小到实际使用的长度
    templates.length = templateIndex

    const scanTime = performance.now() - startTime

    const result = {
      total: templates.length,
      byCategory,
      byDevice,
      scanTime,
      templates,
    }

    // 缓存扫描结果
    this.scanCache.set(cacheKey, result)

    // 清理不再需要的模块引用，释放内存
    this.configModules = null
    this.componentModules = null

    return result
  }

  /**
   * 获取注册表
   */
  getRegistry(): Map<string, TemplateRegistryItem> {
    return this.registry
  }

  /**
   * 根据键获取模板
   */
  getTemplate(category: string, device: string, name: string): TemplateRegistryItem | undefined {
    const key = `${category}/${device}/${name}`
    return this.registry.get(key)
  }

  /**
   * 获取所有模板元数据
   */
  getAllMetadata(): TemplateMetadata[] {
    return Array.from(this.registry.values()).map(item => item.metadata)
  }
}

/**
 * 全局扫描器实例
 */
let globalScanner: TemplateScanner | null = null

/**
 * 获取全局扫描器实例
 */
export function getScanner(): TemplateScanner {
  if (!globalScanner) {
    globalScanner = new TemplateScanner()
  }
  return globalScanner
}

/**
 * 扫描所有模板（便捷方法）
 */
export async function scanTemplates(): Promise<TemplateScanResult> {
  const scanner = getScanner()
  return scanner.scan()
}
