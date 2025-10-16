/**
 * 模板扫描器 - 使用 import.meta.glob 动态扫描模板
 */

import type { Component } from 'vue'
import type { TemplateConfig, TemplateMetadata, TemplateRegistryItem, TemplateScanResult } from '../types'

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
 * 解析模板路径
 * 路径格式：../templates/{category}/{device}/{name}/config.ts
 */
function parseTemplatePath(path: string): PathInfo | null {
  // 匹配路径：templates/{category}/{device}/{name}/config
  const match = path.match(/templates\/([^/]+)\/([^/]+)\/([^/]+)\/config\.(ts|js)$/)
  
  if (!match) {
    return null
  }

  const [, category, device, name] = match

  return {
    category,
    device,
    name,
    fullPath: path,
  }
}

/**
 * 获取组件路径（从配置路径推导）
 */
function getComponentPath(configPath: string): string {
  // 将 config.ts 替换为 index.vue
  return configPath.replace(/config\.(ts|js)$/, 'index.vue')
}

/**
 * 获取打包后的组件路径
 */
function getBuiltComponentPath(configPath: string): string {
  // 将 config.ts/js 替换为 index.vue.js（打包后的格式）
  return configPath.replace(/config\.(ts|js)$/, 'index.vue.js')
}

/**
 * 模板扫描器类
 */
export class TemplateScanner {
  private configModules: Record<string, any> = {}
  private componentModules: Record<string, any> = {}
  private registry: Map<string, TemplateRegistryItem> = new Map()

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

    // 3. 解析并注册所有模板
    const templates: TemplateMetadata[] = []
    const byCategory: Record<string, number> = {}
    const byDevice: Record<string, number> = {}

    for (const [path, module] of Object.entries(this.configModules)) {
      const pathInfo = parseTemplatePath(path)
      
      if (!pathInfo) {
        console.warn(`[TemplateScanner] 无法解析路径: ${path}`)
        continue
      }

      // 获取配置（支持 default export 和直接 export）
      const config: TemplateConfig = (module as any).default || module

      // 构建完整的元数据
      const metadata: TemplateMetadata = {
        ...config,
        category: pathInfo.category,
        device: pathInfo.device as any,
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
          const mod = await componentLoader()
          return (mod as any).default || mod
        },
        configPath: path,
        componentPath: actualComponentPath,
      }

      // 生成唯一键：category/device/name
      const key = `${metadata.category}/${metadata.device}/${metadata.name}`
      this.registry.set(key, registryItem)

      // 统计
      templates.push(metadata)
      byCategory[metadata.category] = (byCategory[metadata.category] || 0) + 1
      byDevice[metadata.device] = (byDevice[metadata.device] || 0) + 1
    }

    const scanTime = performance.now() - startTime

    return {
      total: templates.length,
      byCategory,
      byDevice,
      scanTime,
      templates,
    }
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
