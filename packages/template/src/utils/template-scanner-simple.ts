/**
 * 简化版模板扫描器（Web）
 *
 * 直接使用 import.meta.glob 扫描模板
 * 打包时会自动将匹配的文件打包进去
 * 专门为 Web 环境设计，不依赖 Node.js API
 */

import { defineAsyncComponent, markRaw, type Component } from 'vue'
import type { DeviceType, TemplateConfig, TemplateMetadata } from '../types/template'

/**
 * 检测当前运行环境
 */
function isWebEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * 简化版模板扫描器
 */
class SimpleTemplateScanner {
  private static instance: SimpleTemplateScanner | null = null

  // 使用 import.meta.glob 获取所有模板配置和组件
  // 这些会在构建时被静态分析和打包
  // 注意：路径是相对于当前文件的位置 (src/utils/)，所以需要 ../templates/
  // 开发环境使用 .vue 文件，打包后使用 .js 文件
  private configModules = import.meta.glob('../templates/**/config.{js,ts}')
  private componentModules = import.meta.glob('../templates/**/index.{vue,vue.js}')
  // 只在打包后的环境中扫描 CSS 文件，开发环境中 CSS 内联在 Vue 文件中
  private cssModules = import.meta.glob('../templates/**/index.vue.css', { query: '?url', import: 'default', eager: false })

  // 添加调试信息
  private debugPaths() {
    console.log('[SimpleTemplateScanner] Config paths:', Object.keys(this.configModules))
    console.log('[SimpleTemplateScanner] Component paths:', Object.keys(this.componentModules))
    console.log('[SimpleTemplateScanner] CSS paths:', Object.keys(this.cssModules))
  }

  // 加载组件对应的 CSS 文件
  private async loadComponentCSS(category: string, device: string, name: string): Promise<void> {
    const cssPath = `../templates/${category}/${device}/${name}/index.vue.css`
    const cssLoader = this.cssModules[cssPath]

    // 在开发环境下，CSS 内联在 Vue 文件中，不需要单独加载
    if (!cssLoader) {
      console.log(`[SimpleTemplateScanner] CSS not found (likely dev environment): ${cssPath}`)
      return
    }

    try {
      const cssUrl = await cssLoader()
      console.log(`[SimpleTemplateScanner] Loading CSS: ${cssUrl}`)

      // 检查是否已经加载过这个 CSS
      const existingLink = document.querySelector(`link[href="${cssUrl}"]`)
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = cssUrl as string
        link.setAttribute('data-template', `${category}-${device}-${name}`)
        document.head.appendChild(link)
        console.log(`[SimpleTemplateScanner] CSS loaded: ${cssUrl}`)
      }
    } catch (error) {
      console.warn(`[SimpleTemplateScanner] Failed to load CSS: ${cssPath}`, error)
    }
  }

  // 配置缓存
  private configCache = new Map<string, TemplateConfig>()

  // 组件缓存
  private componentCache = new Map<string, Component>()

  private constructor() {
    console.log(`[SimpleTemplateScanner] 🎯 实时热更新验证成功！发现 ${Object.keys(this.configModules).length} 个配置文件`)
    console.log(`[SimpleTemplateScanner] ⚡ 源码修改立即生效！发现 ${Object.keys(this.componentModules).length} 个组件`)
    this.debugPaths()

    // 在开发环境下，注册 HMR 处理，确保模板变更能即时反映
    if (import.meta.hot && isWebEnvironment()) {
      // 监听 Vite 的通用 HMR 更新事件，命中 templates 目录则清理缓存
      import.meta.hot.on('vite:beforeUpdate', (payload: any) => {
        try {
          const updates = Array.isArray(payload?.updates) ? payload.updates : []
          const hit = updates.some((u: any) => typeof u?.path === 'string' && /\/templates\//.test(u.path))
          if (hit) {
            this.clearCache()
            console.log('[SimpleTemplateScanner] 🔥 HMR: cleared caches for template update')
          }
        } catch (e) {
          // 忽略 HMR 事件解析错误
        }
      })

      // 容错：当某个具体模块热更新时直接清缓存
      const acceptPaths = [
        ...Object.keys(this.configModules),
        ...Object.keys(this.componentModules)
      ]
      if (acceptPaths.length > 0) {
        try {
          import.meta.hot.accept(acceptPaths, () => {
            this.clearCache()
            console.log('[SimpleTemplateScanner] 🔥 HMR: accepted module updates and cleared caches')
          })
        } catch {
          // 某些环境不支持一次性批量 accept，忽略
        }
      }
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(): SimpleTemplateScanner {
    if (!SimpleTemplateScanner.instance) {
      SimpleTemplateScanner.instance = new SimpleTemplateScanner()
    }
    return SimpleTemplateScanner.instance
  }

  /**
   * 解析模板路径
   */
  private parsePath(path: string): { category: string; device: DeviceType; name: string } | null {
    // 匹配模式: ../templates/{category}/{device}/{name}/config.{js,ts}
    // 注意：import.meta.glob 返回的路径使用正斜杠 /
    const match = path.match(/templates\/([^\/]+)\/([^\/]+)\/([^\/]+)\/config\.(js|ts)$/)

    if (!match) {
      console.warn(`[SimpleTemplateScanner] Failed to parse path: ${path}`)
      return null
    }

    const [, category, device, name] = match

    // 验证设备类型
    if (!['desktop', 'tablet', 'mobile'].includes(device)) {
      console.warn(`[SimpleTemplateScanner] Invalid device type: ${device} in path: ${path}`)
      return null
    }

    return {
      category,
      device: device as DeviceType,
      name
    }
  }

  /**
   * 生成模板键
   */
  private generateKey(category: string, device: DeviceType, name: string): string {
    return `${category}:${device}:${name}`
  }

  /**
   * 获取异步组件
   */
  getAsyncComponent(category: string, device: DeviceType, name: string): Component | null {
    const key = this.generateKey(category, device, name)

    // 缓存命中
    const cached = this.componentCache.get(key)
    if (cached) {
      return cached
    }

    // 构建组件路径，支持开发环境(.vue)和打包后(.vue.js)
    // 在生产环境中，优先使用 .vue.js 路径
    const componentPathJs = `../templates/${category}/${device}/${name}/index.vue.js`
    const componentPathVue = `../templates/${category}/${device}/${name}/index.vue`

    // 优先检查 .vue.js 路径（生产环境），然后检查 .vue 路径（开发环境）
    let componentLoader = this.componentModules[componentPathJs] || this.componentModules[componentPathVue]

    if (!componentLoader) {
      console.warn(`[SimpleTemplateScanner] Component not found: ${componentPathVue} or ${componentPathJs}`)
      return null
    }

    // 创建异步组件
    const asyncComponent = markRaw(defineAsyncComponent({
      loader: async () => {
        try {
          const module = await componentLoader()
          console.log(`[SimpleTemplateScanner] Raw module for ${key}:`, module)

          // 处理不同的模块格式
          let component = null

          // 情况1: 直接的组件对象
          if (module && (typeof module === 'function' || (typeof module === 'object' && (module.render || module.setup || module.template)))) {
            component = module
          }
          // 情况2: 有 default 导出
          else if (module && module.default) {
            component = module.default
            // 如果 default 还是一个模块包装，继续提取
            if (component && typeof component === 'object' && component.default && !component.render && !component.setup && !component.template) {
              component = component.default
            }
          }
          // 情况3: Module 对象格式 (打包后的格式)
          else if (module && typeof module === 'object') {
            // 查找可能的组件导出
            const possibleExports = ['default', 'script', 'component']
            for (const exportName of possibleExports) {
              if (module[exportName] && (typeof module[exportName] === 'function' ||
                (typeof module[exportName] === 'object' && (module[exportName].render || module[exportName].setup || module[exportName].template)))) {
                component = module[exportName]
                break
              }
            }
          }

          console.log(`[SimpleTemplateScanner] Extracted component for ${key}:`, component)

          // 尝试加载对应的 CSS 文件
          await this.loadComponentCSS(category, device, name)

          // 验证组件是否有效
          if (!component) {
            throw new Error(`No valid component found in module`)
          }

          if (typeof component !== 'function' && typeof component !== 'object') {
            throw new Error(`Invalid component type: ${typeof component}`)
          }

          // 对于对象类型的组件，确保它有必要的 Vue 组件属性
          if (typeof component === 'object' && !component.render && !component.setup && !component.template && !component.__vccOpts) {
            throw new Error(`Component object missing required Vue properties`)
          }

          return component
        } catch (error) {
          console.error(`[SimpleTemplateScanner] Failed to load component: ${key}`, error)
          throw error
        }
      },
      delay: 200,
      timeout: 30000,
      suspensible: false,
      onError(error, retry, fail, attempts) {
        if (attempts <= 3) {
          console.log(`[SimpleTemplateScanner] Retrying component load (${attempts}/3): ${key}`)
          retry()
        } else {
          console.error(`[SimpleTemplateScanner] Component load failed after 3 attempts: ${key}`)
          fail()
        }
      }
    }))

    // 缓存组件
    this.componentCache.set(key, asyncComponent)

    return asyncComponent
  }

  /**
   * 获取模板配置
   */
  async getConfig(category: string, device: DeviceType, name: string): Promise<TemplateConfig | null> {
    const key = this.generateKey(category, device, name)

    // 缓存命中
    const cached = this.configCache.get(key)
    if (cached) {
      return cached
    }

    // 构建配置路径
    const configPath = `../templates/${category}/${device}/${name}/config.ts`
    const configLoader = this.configModules[configPath]

    // 如果 .ts 不存在，尝试 .js
    const configLoaderJs = !configLoader ? this.configModules[configPath.replace('.ts', '.js')] : null
    const finalLoader = configLoader || configLoaderJs

    if (!finalLoader) {
      console.warn(`[SimpleTemplateScanner] Config not found: ${configPath}`)
      return null
    }

    try {
      const module = await finalLoader()
      const config = module.default || module

      // 缓存配置
      this.configCache.set(key, config)

      return config
    } catch (error) {
      console.error(`[SimpleTemplateScanner] Failed to load config: ${key}`, error)
      return null
    }
  }

  /**
   * 获取模板元数据
   */
  async getMetadata(category: string, device: DeviceType, name: string): Promise<TemplateMetadata | null> {
    const config = await this.getConfig(category, device, name)
    if (!config) {
      return null
    }

    // 构建组件路径，支持开发环境(.vue)和打包后(.vue.js)
    const componentPathJs = `../templates/${category}/${device}/${name}/index.vue.js`
    const componentPathVue = `../templates/${category}/${device}/${name}/index.vue`
    const configPath = `../templates/${category}/${device}/${name}/config.ts`

    // 优先使用 .vue.js 路径（生产环境），然后使用 .vue 路径（开发环境）
    const componentLoader = this.componentModules[componentPathJs] || this.componentModules[componentPathVue]
    const componentPath = this.componentModules[componentPathJs] ? componentPathJs : componentPathVue

    return {
      ...config,
      category,
      device,
      componentPath,
      configPath,
      componentLoader,
      lastModified: Date.now(),
      isBuiltIn: true
    }
  }

  /**
   * 获取所有可用的模板
   */
  async getAllTemplates(): Promise<TemplateMetadata[]> {
    const templates: TemplateMetadata[] = []

    for (const configPath of Object.keys(this.configModules)) {
      const parsed = this.parsePath(configPath)
      if (!parsed) continue

      const { category, device, name } = parsed
      const metadata = await this.getMetadata(category, device, name)

      if (metadata) {
        templates.push(metadata)
      }
    }

    return templates
  }

  /**
   * 获取指定分类和设备的模板列表
   */
  async getTemplates(category: string, device: DeviceType): Promise<TemplateMetadata[]> {
    const templates: TemplateMetadata[] = []

    for (const configPath of Object.keys(this.configModules)) {
      const parsed = this.parsePath(configPath)
      if (!parsed) continue

      if (parsed.category === category && parsed.device === device) {
        const metadata = await this.getMetadata(parsed.category, parsed.device, parsed.name)
        if (metadata) {
          templates.push(metadata)
        }
      }
    }

    return templates
  }

  /**
   * 检查模板是否存在
   */
  hasTemplate(category: string, device: DeviceType, name: string): boolean {
    const configPath = `../templates/${category}/${device}/${name}/config.ts`
    const configPathJs = `../templates/${category}/${device}/${name}/config.js`
    return !!(this.configModules[configPath] || this.configModules[configPathJs])
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.configCache.clear()
    this.componentCache.clear()
  }
}

// 导出单例实例
export const simpleTemplateScanner = SimpleTemplateScanner.getInstance()

// 开发环境兜底：当 HMR 触发时清理单例缓存，避免需要手动刷新
if (typeof import.meta !== 'undefined' && (import.meta as any).hot) {
  try {
    ;(import.meta as any).hot.on('vite:beforeUpdate', (payload: any) => {
      const updates = Array.isArray(payload?.updates) ? payload.updates : []
      const hit = updates.some((u: any) => typeof u?.path === 'string' && /\/templates\//.test(u.path))
      if (hit) {
        simpleTemplateScanner.clearCache()
      }
    })
  } catch {
    // ignore
  }
}
