/**
 * 模板路由解析器
 *
 * 集成 @ldesign/template 包，支持路由直接配置模板
 * 兼容新版 @ldesign/template API
 */

import type { DeviceType } from '@ldesign/device'
// 导入新版 template 包的类型
import type {
  TemplateSystemConfig,
} from '@ldesign/template'
import type { Component } from 'vue'
import type { TemplateRouteConfig } from '../types'

import { h } from 'vue'

/**
 * 模板路由解析器类
 * 负责集成新版 @ldesign/template 包，提供路由级别的模板解析功能
 */
export class TemplateRouteResolver {
  private config: TemplateRouteConfig
  private templateManager: any = null

  constructor(config: TemplateRouteConfig = {}) {
    this.config = {
      defaultCategory: 'pages',
      templateRoot: 'src/templates',
      enableCache: true,
      timeout: 10000,
      ...config,
    }
  }

  /**
   * 初始化模板管理器
   * 使用新版 @ldesign/template API
   */
  private async initTemplateManager(): Promise<any> {
    if (this.templateManager) {
      return this.templateManager
    }

    try {
      // 动态导入模板管理器
      const templateModule = await import('@ldesign/template')

      // 使用新版配置结构
      const config: Partial<TemplateSystemConfig> = {
        templatesDir: this.config.templateRoot || 'src/templates',
        autoScan: true,
        enableHMR: false,
        defaultDevice: 'desktop',
        enablePerformanceMonitor: false,
        debug: false,

        // 缓存配置
        cache: {
          enabled: this.config.enableCache ?? true,
          strategy: 'lru',
          maxSize: 50,
          ttl: 30 * 60 * 1000, // 30分钟
          enableCompression: false,
          enablePersistence: false,
          checkPeriod: 5 * 60 * 1000, // 5分钟检查一次
          persistenceKey: 'ldesign-router-template-cache',
        },

        // 设备检测配置
        deviceDetection: {
          breakpoints: {
            mobile: 768,
            tablet: 992,
            desktop: 1200,
          },
          debounceDelay: 300,
          enableResize: true,
          enableOrientation: true,
        },

        // 预加载策略配置
        preloadStrategy: {
          enabled: false, // 路由级别不需要预加载
          mode: 'lazy',
          limit: 5,
          priority: [],
          intersection: {
            rootMargin: '50px',
            threshold: 0.1,
          },
          delay: 1000,
        },
      }

      // 创建模板管理器实例
      // 使用简化的方法，直接使用 TemplateScanner
      if (templateModule.TemplateScanner) {
        this.templateManager = new templateModule.TemplateScanner({
          templatesDir: config.templatesDir || 'src/templates',
          enableCache: config.cache?.enabled ?? true,
          enableHMR: config.enableHMR ?? false,
        })
      }
      else {
        // 回退方案：创建一个简单的模拟管理器
        this.templateManager = {
          scanTemplates: async () => ({ count: 0, templates: [], duration: 0 }),
          render: async () => null,
          hasTemplate: () => false,
          getTemplates: () => [],
          destroy: () => { },
        }
      }

      // 初始化管理器（如果有此方法）
      if (this.templateManager.initialize) {
        await this.templateManager.initialize()
      }

      // 扫描模板
      if (this.templateManager.scanTemplates) {
        await this.templateManager.scanTemplates()
      }

      return this.templateManager
    }
    catch (error) {
      console.error('Failed to initialize template manager:', error)
      throw new Error('Template system not available')
    }
  }

  /**
   * 解析模板组件
   * 使用新版 @ldesign/template API 的 render 方法
   */
  async resolveTemplate(
    category: string,
    templateName: string,
    deviceType: DeviceType,
  ): Promise<Component> {
    const manager = await this.initTemplateManager()

    try {
      let result: any = null

      // 尝试使用不同的 API 方法
      if (manager.render) {
        // 新版 API 的 render 方法
        result = await manager.render(category, deviceType, templateName)
      }
      else if (manager.loadTemplate) {
        // 旧版 API 的 loadTemplate 方法
        result = await manager.loadTemplate(templateName, deviceType, category)
      }
      else {
        throw new Error('Template manager does not support loading templates')
      }

      // 检查结果并提取组件
      let component = null
      if (result && result.component) {
        component = result.component
      }
      else if (result && typeof result === 'function') {
        component = result
      }
      else if (result && result.success && result.component) {
        component = result.component
      }

      if (component) {
        return component
      }
      else {
        throw new Error('Failed to load template: component not found')
      }
    }
    catch (error) {
      console.error(
        `Failed to resolve template: ${category}/${templateName} for ${deviceType}`,
        error,
      )

      // 尝试回退到默认设备
      if (deviceType !== 'desktop') {
        try {
          let fallbackResult: any = null

          if (manager.render) {
            fallbackResult = await manager.render(category, 'desktop', templateName)
          }
          else if (manager.loadTemplate) {
            fallbackResult = await manager.loadTemplate(templateName, 'desktop', category)
          }

          let fallbackComponent = null
          if (fallbackResult && fallbackResult.component) {
            fallbackComponent = fallbackResult.component
          }
          else if (fallbackResult && typeof fallbackResult === 'function') {
            fallbackComponent = fallbackResult
          }
          else if (fallbackResult && fallbackResult.success && fallbackResult.component) {
            fallbackComponent = fallbackResult.component
          }

          if (fallbackComponent) {
            console.warn(`Using desktop template as fallback for ${deviceType}`)
            return fallbackComponent
          }
        }
        catch (fallbackError) {
          console.error('Fallback template also failed:', fallbackError)
        }
      }

      // 返回错误组件
      return this.createTemplateErrorComponent(
        category,
        templateName,
        error as Error,
      )
    }
  }

  /**
   * 检查模板是否存在
   * 使用新版 API 的 hasTemplate 方法
   */
  async hasTemplate(
    category: string,
    templateName: string,
    deviceType: DeviceType,
  ): Promise<boolean> {
    try {
      const manager = await this.initTemplateManager()
      return manager.hasTemplate(category, deviceType, templateName)
    }
    catch {
      return false
    }
  }

  /**
   * 获取可用的模板列表
   * 使用新版 API 的 getTemplates 方法
   */
  async getAvailableTemplates(
    category: string,
    deviceType: DeviceType,
  ): Promise<string[]> {
    try {
      const manager = await this.initTemplateManager()

      let templates: any[] = []
      if (manager.getTemplates) {
        templates = manager.getTemplates(category, deviceType)
      }
      else if (manager.getScanner && manager.getScanner().getTemplatesByCategory) {
        const scanner = manager.getScanner()
        const allTemplates = scanner.getTemplatesByCategory(category)
        templates = allTemplates.filter((template: any) => template.deviceType === deviceType || template.device === deviceType)
      }

      return templates.map((template: any) => template.name || template.templateName || template.id)
    }
    catch {
      return []
    }
  }

  /**
   * 创建模板错误组件
   */
  private createTemplateErrorComponent(
    category: string,
    templateName: string,
    error: Error,
  ): Component {
    return {
      name: 'TemplateError',
      setup() {
        return () => {
          return h('div', { class: 'template-error' }, [
            h('div', { class: 'template-error__header' }, [
              h('h3', '模板加载失败'),
            ]),
            h('div', { class: 'template-error__content' }, [
              h('p', [h('strong', '模板: '), `${category}/${templateName}`]),
              h('p', [h('strong', '错误: '), error.message]),
            ]),
            h('div', { class: 'template-error__actions' }, [
              h(
                'button',
                {
                  class: 'template-error__retry',
                  onClick: () => window.location.reload(),
                },
                '重试',
              ),
            ]),
          ])
        }
      },
    }
  }

  /**
   * 清理资源
   * 使用新版 API 的 destroy 方法
   */
  destroy(): void {
    if (this.templateManager) {
      // 新版 API 确保有 destroy 方法
      this.templateManager.destroy()
      this.templateManager = null
    }
  }
}

/**
 * 创建模板路由解析器的便捷函数
 */
export function createTemplateRouteResolver(
  config?: TemplateRouteConfig,
): TemplateRouteResolver {
  return new TemplateRouteResolver(config)
}
