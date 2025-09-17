/**
 * 工具管理器
 * 
 * 处理简化的工具配置，自动创建和配置各种开发工具插件
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import type { ToolsConfig } from '../types/config'
import { createFontConverterPlugin } from '../plugins/font-converter'
import { createSVGComponentPlugin } from '../plugins/svg-component-generator'
import { createImageOptimizerPlugin } from '../plugins/image-optimizer'
import { createAPIDocPlugin } from '../plugins/api-doc-generator'
import { createPWASupportPlugin } from '../plugins/pwa-support'

/**
 * 工具管理器类
 * 根据简化配置自动创建和管理开发工具插件
 */
export class ToolsManager {
  private config: ToolsConfig
  private plugins: Plugin[] = []

  constructor(config: ToolsConfig = {}) {
    this.config = config
  }

  /**
   * 创建所有启用的工具插件
   * @returns Vite 插件数组
   */
  createPlugins(): Plugin[] {
    this.plugins = []

    // 字体转换工具
    if (this.config.font?.enabled) {
      const fontPlugin = createFontConverterPlugin({
        sourceDir: this.config.font.sourceDir || './src/assets/fonts',
        outputDir: this.config.font.outputDir || './public/fonts',
        formats: this.config.font.formats || ['woff2', 'woff'],
        subset: this.config.font.subset ?? true,
        generateCSS: this.config.font.generateCSS ?? true,
        fontDisplay: this.config.font.fontDisplay || 'swap'
      })
      this.plugins.push(fontPlugin)
    }

    // SVG 组件生成工具
    if (this.config.svg?.enabled) {
      const svgPlugin = createSVGComponentPlugin({
        sourceDir: this.config.svg.sourceDir || './src/assets/icons',
        outputDir: this.config.svg.outputDir || './src/components/icons',
        framework: this.config.svg.framework || 'vue',
        typescript: this.config.svg.typescript ?? true,
        optimize: this.config.svg.optimize ?? true,
        generateIndex: this.config.svg.generateIndex ?? true
      })
      this.plugins.push(svgPlugin)
    }

    // 图片优化工具
    if (this.config.image?.enabled) {
      const imagePlugin = createImageOptimizerPlugin({
        sourceDir: this.config.image.sourceDir || './src/assets/images',
        outputDir: this.config.image.outputDir || './public/images',
        outputFormats: this.config.image.formats || ['webp', 'jpeg'],
        quality: this.config.image.quality || { webp: 80, jpeg: 85 },
        responsive: this.config.image.responsive ?? true,
        responsiveSizes: this.config.image.responsiveSizes || [320, 640, 768, 1024, 1280, 1920],
        generateManifest: this.config.image.generateManifest ?? true
      })
      this.plugins.push(imagePlugin)
    }



    // API 文档生成工具
    if (this.config.apiDocs?.enabled) {
      const apiDocPlugin = createAPIDocPlugin({
        sourceDir: this.config.apiDocs.sourceDir || './src/api',
        outputDir: this.config.apiDocs.outputDir || './docs/api',
        format: this.config.apiDocs.format || 'openapi',
        interactive: this.config.apiDocs.interactive ?? true,
        generateExamples: this.config.apiDocs.generateExamples ?? true,
        includePrivate: this.config.apiDocs.includePrivate ?? false
      })
      this.plugins.push(apiDocPlugin)
    }



    // PWA 支持工具
    if (this.config.pwa?.enabled) {
      const pwaPlugin = createPWASupportPlugin({
        appName: this.config.pwa.appName || 'LDesign App',
        shortName: this.config.pwa.shortName || 'LDesign',
        description: this.config.pwa.description || 'LDesign 应用程序',
        themeColor: this.config.pwa.themeColor || '#722ED1',
        backgroundColor: this.config.pwa.backgroundColor || '#ffffff',
        generateSW: this.config.pwa.generateSW ?? true,
        cacheStrategy: this.config.pwa.cacheStrategy || 'staleWhileRevalidate',
        offlinePage: this.config.pwa.offlinePage || 'offline.html'
      })
      this.plugins.push(pwaPlugin)
    }

    return this.plugins
  }

  /**
   * 获取已创建的插件列表
   * @returns 插件数组
   */
  getPlugins(): Plugin[] {
    return this.plugins
  }

  /**
   * 获取工具配置
   * @returns 工具配置对象
   */
  getConfig(): ToolsConfig {
    return this.config
  }

  /**
   * 更新工具配置
   * @param config 新的配置
   */
  updateConfig(config: ToolsConfig): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 检查工具是否启用
   * @param toolName 工具名称
   * @returns 是否启用
   */
  isToolEnabled(toolName: keyof ToolsConfig): boolean {
    return this.config[toolName]?.enabled ?? false
  }

  /**
   * 启用工具
   * @param toolName 工具名称
   */
  enableTool(toolName: keyof ToolsConfig): void {
    if (!this.config[toolName]) {
      this.config[toolName] = {}
    }
    this.config[toolName]!.enabled = true
  }

  /**
   * 禁用工具
   * @param toolName 工具名称
   */
  disableTool(toolName: keyof ToolsConfig): void {
    if (this.config[toolName]) {
      this.config[toolName]!.enabled = false
    }
  }

  /**
   * 获取启用的工具列表
   * @returns 启用的工具名称数组
   */
  getEnabledTools(): string[] {
    return Object.keys(this.config).filter(toolName =>
      this.isToolEnabled(toolName as keyof ToolsConfig)
    )
  }

  /**
   * 获取工具统计信息
   * @returns 统计信息
   */
  getStats() {
    const enabledTools = this.getEnabledTools()
    return {
      total: Object.keys(this.config).length,
      enabled: enabledTools.length,
      disabled: Object.keys(this.config).length - enabledTools.length,
      enabledTools,
      pluginsCreated: this.plugins.length
    }
  }
}

/**
 * 创建工具管理器实例
 * @param config 工具配置
 * @returns 工具管理器实例
 */
export function createToolsManager(config: ToolsConfig = {}): ToolsManager {
  return new ToolsManager(config)
}

/**
 * 根据工具配置创建 Vite 插件
 * @param config 工具配置
 * @returns Vite 插件数组
 */
export function createToolsPlugins(config: ToolsConfig = {}): Plugin[] {
  const manager = createToolsManager(config)
  return manager.createPlugins()
}
