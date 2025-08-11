import type { DeviceType, TemplateConfig, TemplateMetadata } from '../types'
import { type Component, defineAsyncComponent } from 'vue'

/**
 * 模板加载器
 *
 * 负责动态加载模板组件和配置文件，支持：
 * - 基于 import.meta.glob 的动态导入
 * - 模板配置和组件的分离加载
 * - 环境自适应（开发/生产环境）
 * - 缓存机制优化性能
 */
export class TemplateLoader {
  /** 配置文件模块映射 */
  private configModules: Record<string, () => Promise<unknown>> = {}

  /** 组件文件模块映射 */
  private componentModules: Record<string, () => Promise<unknown>> = {}

  /** 已加载的模板元数据缓存 */
  private templates = new Map<string, TemplateMetadata>()

  /** 当前模板基础路径 */
  private currentBasePath: string = '../templates'

  /** 是否为 ES 模块环境 */
  private isESEnvironment: boolean = false

  constructor() {
    this.detectBasePath()
    this.initializeModules()
  }

  /**
   * 检测当前的基础路径和环境
   */
  private detectBasePath() {
    // 通过检查当前模块的路径来判断是在 src 还是 es 环境
    try {
      const currentPath = import.meta.url || ''
      if (currentPath.includes('/es/') || currentPath.includes('\\es\\')) {
        this.currentBasePath = '../templates'
        this.isESEnvironment = true
        console.log('🔍 检测到 ES 环境，使用路径: ../templates')
      } else if (
        currentPath.includes('/src/') ||
        currentPath.includes('\\src\\')
      ) {
        this.currentBasePath = '../templates'
        this.isESEnvironment = false
        console.log('🔍 检测到 SRC 环境，使用路径: ../templates')
      } else {
        // 默认使用相对路径
        this.currentBasePath = '../templates'
        this.isESEnvironment = false
        console.log('🔍 使用默认路径: ../templates')
      }
    } catch {
      this.currentBasePath = '../templates'
      this.isESEnvironment = false
      console.log('🔍 路径检测失败，使用默认路径: ../templates')
    }
  }

  /**
   * 初始化模块映射 - 简化版本
   */
  private initializeModules() {
    console.log(`🔍 扫描模板，基础路径: ${this.currentBasePath}`)

    try {
      // 尝试主要路径
      const configModules = import.meta.glob('../templates/**/config.{ts,js}', {
        eager: false,
      })
      const componentModules = import.meta.glob(
        '../templates/**/index.{ts,tsx,vue,js}',
        { eager: false }
      )

      if (Object.keys(configModules).length > 0) {
        this.configModules = configModules
        this.componentModules = componentModules
        console.log(`✅ 找到 ${Object.keys(configModules).length} 个模板配置`)
        return
      }

      // 如果没有找到模板，使用预定义的模板列表
      console.warn('⚠️ 未找到模板文件，使用预定义模板列表')
      this.initializeFallbackModules()
    } catch (error) {
      console.warn('模板扫描失败，使用预定义模板列表:', error)
      this.initializeFallbackModules()
    }
  }

  /**
   * 初始化回退模块 - 简化版本
   */
  private initializeFallbackModules() {
    const templatePaths = [
      'login/desktop/default',
      'login/desktop/classic',
      'login/desktop/modern',
      'login/mobile/simple',
      'login/mobile/card',
      'login/tablet/adaptive',
      'login/tablet/split',
      'dashboard/desktop/admin',
    ]

    this.configModules = {}
    this.componentModules = {}

    templatePaths.forEach(templatePath => {
      const configKey = `../templates/${templatePath}/config.ts`
      const componentKey = `../templates/${templatePath}/index.tsx`

      // 简化的配置模块加载器
      this.configModules[configKey] = async () => {
        const basePath = this.isESEnvironment ? './templates' : '../templates'
        try {
          const module = await import(
            /* @vite-ignore */ `${basePath}/${templatePath}/config${
              this.isESEnvironment ? '.js' : ''
            }`
          )
          return module
        } catch {
          console.warn(`无法加载配置: ${templatePath}`)
          throw new Error(`无法加载配置: ${templatePath}`)
        }
      }

      // 简化的组件模块加载器
      this.componentModules[componentKey] = async () => {
        const basePath = this.isESEnvironment ? './templates' : '../templates'
        try {
          const module = await import(
            /* @vite-ignore */ `${basePath}/${templatePath}/index${
              this.isESEnvironment ? '.js' : ''
            }`
          )
          return module
        } catch {
          console.warn(`无法加载组件: ${templatePath}`)
          throw new Error(`无法加载组件: ${templatePath}`)
        }
      }
    })

    console.log(`✅ 预定义模板初始化完成，共 ${templatePaths.length} 个模板`)
  }

  /**
   * 扫描并注册所有模板
   */
  async scanAndRegisterTemplates(): Promise<TemplateMetadata[]> {
    const templates: TemplateMetadata[] = []

    for (const [configPath, configLoader] of Object.entries(
      this.configModules
    )) {
      try {
        const metadata = await this.parseTemplateFromPath(
          configPath,
          configLoader
        )
        if (metadata) {
          templates.push(metadata)
          this.templates.set(this.getTemplateKey(metadata), metadata)
        }
      } catch (error) {
        console.warn(
          `Failed to load template config from ${configPath}:`,
          error
        )
      }
    }

    return templates
  }

  /**
   * 从路径解析模板元数据
   */
  private async parseTemplateFromPath(
    configPath: string,
    configLoader: () => Promise<unknown>
  ): Promise<TemplateMetadata | null> {
    try {
      // 解析路径: ../templates/category/device/template/config.*
      const pathParts = configPath.split('/')
      const configIndex = pathParts.findIndex(part =>
        part.startsWith('config.')
      )

      if (configIndex < 3) return null

      const template = pathParts[configIndex - 1]
      const device = pathParts[configIndex - 2] as DeviceType
      const category = pathParts[configIndex - 3]

      // 加载配置
      const configModule = await configLoader()
      const config: TemplateConfig =
        (configModule as any).default || (configModule as TemplateConfig)

      // 查找实际的组件路径
      const basePath = pathParts.slice(0, configIndex).join('/')
      let componentPath = `${basePath}/index.tsx` // 默认值

      // 从 componentModules 中查找匹配的组件路径
      for (const [path] of Object.entries(this.componentModules)) {
        if (path.includes(basePath) && path.includes('/index.')) {
          componentPath = path
          break
        }
      }

      return {
        category,
        device,
        template,
        config: {
          ...config,
          id: config.id || `${category}-${device}-${template}`,
        },
        componentPath,
        stylePath: `${basePath}/index.less`,
      }
    } catch (error) {
      console.warn(`Failed to parse template from ${configPath}:`, error)
      return null
    }
  }

  /**
   * 动态加载模板组件
   */
  async loadTemplateComponent(metadata: TemplateMetadata): Promise<Component> {
    const componentLoader = this.componentModules[metadata.componentPath]

    if (!componentLoader) {
      throw new Error(
        `Component not found for template: ${metadata.componentPath}`
      )
    }

    return defineAsyncComponent({
      loader: async () => {
        const module = await componentLoader()
        return (module as any).default || module
      },
      loadingComponent: undefined,
      errorComponent: undefined,
      delay: 0,
      timeout: 10000,
    })
  }

  /**
   * 生成模板唯一键
   */
  private getTemplateKey(metadata: TemplateMetadata): string {
    return `${metadata.category}:${metadata.device}:${metadata.template}`
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): TemplateMetadata[] {
    return Array.from(this.templates.values())
  }

  /**
   * 根据分类获取模板
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    return this.getAllTemplates().filter(t => t.category === category)
  }

  /**
   * 根据设备类型获取模板
   */
  getTemplatesByDevice(device: DeviceType): TemplateMetadata[] {
    return this.getAllTemplates().filter(t => t.device === device)
  }

  /**
   * 根据分类和设备获取模板
   */
  getTemplatesByCategoryAndDevice(
    category: string,
    device: DeviceType
  ): TemplateMetadata[] {
    return this.getAllTemplates().filter(
      t => t.category === category && t.device === device
    )
  }

  /**
   * 查找特定模板
   */
  findTemplate(
    category: string,
    device: DeviceType,
    template: string
  ): TemplateMetadata | undefined {
    const key = `${category}:${device}:${template}`
    return this.templates.get(key)
  }

  /**
   * 获取可用分类
   */
  getAvailableCategories(): string[] {
    const categories = new Set<string>()
    this.getAllTemplates().forEach(t => categories.add(t.category))
    return Array.from(categories)
  }

  /**
   * 获取可用设备类型
   */
  getAvailableDevices(category?: string): DeviceType[] {
    const devices = new Set<DeviceType>()
    this.getAllTemplates()
      .filter(t => !category || t.category === category)
      .forEach(t => devices.add(t.device))
    return Array.from(devices)
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.templates.clear()
  }
}

// 全局模板加载器实例
export const templateLoader = new TemplateLoader()
