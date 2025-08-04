import type { DeviceType, TemplateConfig, TemplateMetadata } from '../types'
import { defineAsyncComponent, type Component } from 'vue'

/**
 * 模板加载器 - 使用 import.meta.glob 实现动态模板加载
 */
export class TemplateLoader {
  private configModules: Record<string, () => Promise<any>> = {}
  private componentModules: Record<string, () => Promise<any>> = {}
  private templates = new Map<string, TemplateMetadata>()
  private currentBasePath: string = '../templates'
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
      } else if (currentPath.includes('/src/') || currentPath.includes('\\src\\')) {
        this.currentBasePath = '../templates'
        this.isESEnvironment = false
        console.log('🔍 检测到 SRC 环境，使用路径: ../templates')
      } else {
        // 默认使用相对路径
        this.currentBasePath = '../templates'
        this.isESEnvironment = false
        console.log('🔍 使用默认路径: ../templates')
      }
    } catch (error) {
      this.currentBasePath = '../templates'
      this.isESEnvironment = false
      console.log('🔍 路径检测失败，使用默认路径: ../templates')
    }
  }

  /**
   * 初始化模块映射
   */
  private initializeModules() {
    console.log(`🔍 尝试扫描模板，基础路径: ${this.currentBasePath}`)

    try {
      // 由于 import.meta.glob 需要静态字符串，直接尝试正确的路径
      let configFound = false

      // 首先尝试主要路径 ../templates
      try {
        const configModules = import.meta.glob('../templates/**/config.{ts,js}', { eager: false })
        const componentModules = import.meta.glob('../templates/**/index.{ts,tsx,vue,js}', { eager: false })

        if (Object.keys(configModules).length > 0) {
          this.configModules = configModules
          this.componentModules = componentModules
          console.log(`✅ 成功使用路径: ../templates`)
          console.log('Found config modules:', Object.keys(this.configModules))
          configFound = true
        }
      } catch (err) {
        console.warn('路径 ../templates 失败:', err)
      }

      // 如果主要路径失败，尝试其他可能的路径
      if (!configFound) {
        const patterns = [
          { config: './templates/**/config.{ts,js}', component: './templates/**/index.{ts,tsx,vue,js}', name: './templates' },
          { config: '../src/templates/**/config.{ts,js}', component: '../src/templates/**/index.{ts,tsx,vue,js}', name: '../src/templates' }
        ]

        for (const pattern of patterns) {
          try {
            let configModules: Record<string, () => Promise<any>> = {}
            let componentModules: Record<string, () => Promise<any>> = {}

            // 使用静态字符串调用 import.meta.glob
            if (pattern.name === './templates') {
              configModules = import.meta.glob('./templates/**/config.{ts,js}', { eager: false })
              componentModules = import.meta.glob('./templates/**/index.{ts,tsx,vue,js}', { eager: false })
            } else if (pattern.name === '../src/templates') {
              configModules = import.meta.glob('../src/templates/**/config.{ts,js}', { eager: false })
              componentModules = import.meta.glob('../src/templates/**/index.{ts,tsx,vue,js}', { eager: false })
            }

            console.log({
              configModules,
              componentModules
            })

            if (Object.keys(configModules).length > 0) {
              this.configModules = configModules
              this.componentModules = componentModules
              console.log(`✅ 回退到路径: ${pattern.name}`)
              console.log('Found config modules:', Object.keys(this.configModules))
              configFound = true
              break
            }
          } catch (err) {
            console.warn(`回退路径 ${pattern.name} 失败:`, err)
          }
        }
      }

      // 如果所有模式都失败，使用手动回退方案
      if (!configFound) {
        console.warn('🚨 所有 import.meta.glob 路径都失败，使用手动回退方案')
        this.initializeFallbackModules()
      }
    } catch (error) {
      console.warn('import.meta.glob not available, using fallback:', error)
      this.initializeFallbackModules()
    }
  }

  /**
   * 初始化回退模块（用于不支持 import.meta.glob 的环境）
   */
  private initializeFallbackModules() {
    // 尝试动态检测可用的导入路径
    const templatePaths = [
      // 登录模板
      'login/desktop/default',
      'login/desktop/classic',
      'login/desktop/modern',
      'login/mobile/simple',
      'login/mobile/card',
      'login/tablet/adaptive',
      'login/tablet/split',
      // 仪表盘模板
      'dashboard/desktop/admin'
    ]

    // 生成配置模块映射
    this.configModules = {}
    this.componentModules = {}

    templatePaths.forEach(templatePath => {
      const configKey = `../templates/${templatePath}/config.ts`
      const componentKey = `../templates/${templatePath}/index.tsx`

      // 配置模块 - 基于检测到的路径
      this.configModules[configKey] = async () => {
        // 根据当前环境构建正确的导入路径
        const importPaths = this.isESEnvironment
          ? [
            `./templates/${templatePath}/config.js`,  // ES 环境，使用 .js 扩展名
            `./templates/${templatePath}/config`,
            `../templates/${templatePath}/config.js`,
            `../templates/${templatePath}/config`,
          ]
          : [
            `../templates/${templatePath}/config`,
            `./templates/${templatePath}/config`,
            `../templates/${templatePath}/config.js`,
            `./templates/${templatePath}/config.js`,
          ]

        for (const importPath of importPaths) {
          try {
            const module = await import(importPath)
            return module
          } catch (error) {
            continue
          }
        }

        console.warn(`❌ 无法加载配置: ${templatePath}`)
        throw new Error(`无法加载配置: ${templatePath}`)
      }

      // 组件模块 - 基于检测到的路径
      this.componentModules[componentKey] = async () => {
        // 根据当前环境构建正确的导入路径
        const importPaths = this.isESEnvironment
          ? [
            `./templates/${templatePath}/index.js`,  // ES 环境，使用 .js 扩展名
            `./templates/${templatePath}`,
            `../templates/${templatePath}/index.js`,
            `../templates/${templatePath}`,
          ]
          : [
            `../templates/${templatePath}`,
            `./templates/${templatePath}`,
            `../templates/${templatePath}/index.js`,
            `./templates/${templatePath}/index.js`,
          ]

        for (const importPath of importPaths) {
          try {
            const module = await import(importPath)
            return module
          } catch (error) {
            continue
          }
        }

        console.warn(`❌ 无法加载组件: ${templatePath}`)
        throw new Error(`无法加载组件: ${templatePath}`)
      }
    })

    console.log('✅ 回退模块初始化完成，支持的模板:', templatePaths.length)
  }

  /**
   * 扫描并注册所有模板
   */
  async scanAndRegisterTemplates(): Promise<TemplateMetadata[]> {
    const templates: TemplateMetadata[] = []

    for (const [configPath, configLoader] of Object.entries(this.configModules)) {
      try {
        const metadata = await this.parseTemplateFromPath(configPath, configLoader)
        if (metadata) {
          templates.push(metadata)
          this.templates.set(this.getTemplateKey(metadata), metadata)
        }
      } catch (error) {
        console.warn(`Failed to load template config from ${configPath}:`, error)
      }
    }

    return templates
  }

  /**
   * 从路径解析模板元数据
   */
  private async parseTemplateFromPath(
    configPath: string,
    configLoader: () => Promise<any>
  ): Promise<TemplateMetadata | null> {
    try {
      // 解析路径: ../templates/category/device/template/config.*
      const pathParts = configPath.split('/')
      const configIndex = pathParts.findIndex(part => part.startsWith('config.'))

      if (configIndex < 3) return null

      const template = pathParts[configIndex - 1]
      const device = pathParts[configIndex - 2] as DeviceType
      const category = pathParts[configIndex - 3]

      // 加载配置
      const configModule = await configLoader()
      const config: TemplateConfig = configModule.default || configModule

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
      throw new Error(`Component not found for template: ${metadata.componentPath}`)
    }

    return defineAsyncComponent({
      loader: async () => {
        const module = await componentLoader()
        return module.default || module
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
  getTemplatesByCategoryAndDevice(category: string, device: DeviceType): TemplateMetadata[] {
    return this.getAllTemplates().filter(t => t.category === category && t.device === device)
  }

  /**
   * 查找特定模板
   */
  findTemplate(category: string, device: DeviceType, template: string): TemplateMetadata | undefined {
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
