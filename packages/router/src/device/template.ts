/**
 * 模板路由解析器
 *
 * 集成 @ldesign/template 包，支持路由直接配置模板
 */

import type { DeviceType } from '@ldesign/device'
import type { Component } from 'vue'
import type { TemplateRouteConfig } from '../types'
import { h } from 'vue'

/**
 * 模板路由解析器类
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
   */
  private async initTemplateManager() {
    if (this.templateManager) {
      return this.templateManager
    }

    try {
      // 动态导入模板管理器
      const { TemplateManager } = await import('@ldesign/template')

      this.templateManager = new TemplateManager({
        enableCache: this.config.enableCache,
        templateRoot: this.config.templateRoot,
      } as any)

      // 扫描模板
      await this.templateManager.scanTemplates()

      return this.templateManager
    }
    catch (error) {
      console.error('Failed to initialize template manager:', error)
      throw new Error('Template system not available')
    }
  }

  /**
   * 解析模板组件
   */
  async resolveTemplate(
    category: string,
    templateName: string,
    deviceType: DeviceType,
  ): Promise<Component> {
    const manager = await this.initTemplateManager()

    try {
      // 使用模板管理器渲染组件
      const component = await manager.render({
        category,
        template: templateName,
        device: deviceType,
        timeout: this.config.timeout,
      })

      return component
    }
    catch (error) {
      console.error(
        `Failed to resolve template: ${category}/${templateName}`,
        error,
      )

      // 尝试回退到默认设备
      if (deviceType !== 'desktop') {
        try {
          const fallbackComponent = await manager.render({
            category,
            template: templateName,
            device: 'desktop',
            timeout: this.config.timeout,
          })

          console.warn(`Using desktop template as fallback for ${deviceType}`)
          return fallbackComponent
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
   */
  async getAvailableTemplates(
    category: string,
    deviceType: DeviceType,
  ): Promise<string[]> {
    try {
      const manager = await this.initTemplateManager()
      const templates = await manager.getTemplates(category, deviceType)
      return templates.map((t: any) => t.name)
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
   */
  destroy() {
    if (this.templateManager) {
      // 如果模板管理器有销毁方法，调用它
      if (typeof this.templateManager.destroy === 'function') {
        this.templateManager.destroy()
      }
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
