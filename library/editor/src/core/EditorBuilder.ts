/**
 * 编辑器构建器
 * 提供流式API，简化编辑器配置和初始化
 */

import { Editor } from './Editor'
import { getFeatureFlags, FeatureCategory } from './FeatureFlags'
import { getPluginRegistry } from './PluginRegistry'
import { getLazyLoader } from './LazyLoader'
import { getConfigManager } from '../config/ConfigManager'
import { ToolbarManager } from '../ui/ToolbarManager'
import type { EditorOptions } from '../types'
import type { IconSetType } from '../icons/types'

/**
 * 编辑器构建器类
 */
export class EditorBuilder {
  private options: Partial<EditorOptions> = {}
  private features = getFeatureFlags()
  private registry = getPluginRegistry()
  private loader = getLazyLoader()
  private config = getConfigManager()
  private toolbarConfig: any = {}
  
  /**
   * 设置容器元素
   */
  element(selector: string | HTMLElement): this {
    this.options.element = selector
    return this
  }
  
  /**
   * 设置初始内容
   */
  content(html: string): this {
    this.options.content = html
    return this
  }
  
  /**
   * 设置是否可编辑
   */
  editable(value: boolean = true): this {
    this.options.editable = value
    return this
  }
  
  /**
   * 启用功能
   */
  enableFeature(featureId: string): this {
    this.features.enable(featureId)
    return this
  }
  
  /**
   * 禁用功能
   */
  disableFeature(featureId: string): this {
    this.features.disable(featureId)
    return this
  }
  
  /**
   * 启用分类下所有功能
   */
  enableCategory(category: FeatureCategory): this {
    this.features.enableCategory(category)
    return this
  }
  
  /**
   * 禁用分类下所有功能
   */
  disableCategory(category: FeatureCategory): this {
    this.features.disableCategory(category)
    return this
  }
  
  /**
   * 只启用指定功能
   */
  onlyEnable(featureIds: string[]): this {
    // 先禁用所有
    this.features.getAllFeatures().forEach(f => {
      f.enabled = false
    })
    
    // 再启用指定的
    featureIds.forEach(id => {
      this.features.enable(id)
    })
    
    return this
  }
  
  /**
   * 设置图标集
   */
  icons(iconSet: IconSetType): this {
    this.config.setIconSet(iconSet)
    return this
  }
  
  /**
   * 设置主题
   */
  theme(themeName: string): this {
    this.config.setTheme(themeName)
    return this
  }
  
  /**
   * 设置语言
   */
  async locale(locale: string): Promise<this> {
    await this.config.setLocale(locale)
    return this
  }
  
  /**
   * 使用轻量级预设
   */
  lightweight(): this {
    // 只启用核心功能
    this.onlyEnable([
      'basic-editing',
      'selection',
      'history',
      'bold',
      'italic',
      'underline',
      'heading',
      'paragraph',
      'bullet-list',
      'ordered-list',
      'link'
    ])
    
    this.toolbarConfig = {
      compact: true,
      showLabels: false,
      lazyLoad: true
    }
    
    return this
  }
  
  /**
   * 使用功能完整预设
   */
  fullFeatured(): this {
    // 启用所有功能
    this.features.getAllFeatures().forEach(f => {
      f.enabled = true
    })
    
    this.toolbarConfig = {
      compact: false,
      showLabels: false,
      lazyLoad: true
    }
    
    return this
  }
  
  /**
   * 只启用格式化功能
   */
  formatOnly(): this {
    this.onlyEnable([
      'basic-editing',
      'selection',
      'history',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'heading',
      'paragraph',
      'bullet-list',
      'ordered-list'
    ])
    
    return this
  }
  
  /**
   * 启用所有媒体功能
   */
  withMedia(): this {
    this.enableCategory(FeatureCategory.MEDIA)
    return this
  }
  
  /**
   * 启用AI功能
   */
  withAI(apiKey?: string, provider: 'openai' | 'claude' | 'deepseek' = 'deepseek'): this {
    this.enableCategory(FeatureCategory.AI)
    
    if (apiKey) {
      const ai = require('../ai/AIService').getAIService()
      ai.updateApiKey(provider, apiKey)
      ai.setProvider(provider)
    }
    
    return this
  }
  
  /**
   * 启用表格功能
   */
  withTable(): this {
    this.enableCategory(FeatureCategory.TABLE)
    return this
  }
  
  /**
   * 配置工具栏
   */
  toolbar(config: any): this {
    this.toolbarConfig = { ...this.toolbarConfig, ...config }
    return this
  }
  
  /**
   * 紧凑模式
   */
  compact(value: boolean = true): this {
    this.toolbarConfig.compact = value
    return this
  }
  
  /**
   * 显示标签
   */
  showLabels(value: boolean = true): this {
    this.toolbarConfig.showLabels = value
    return this
  }
  
  /**
   * 构建编辑器
   */
  async build(): Promise<Editor> {
    // 创建编辑器实例
    const editor = new Editor(this.options)
    
    // 设置编辑器到注册中心
    this.registry.setEditor(editor)
    
    // 加载立即需要的功能
    const eagerFeatures = this.features.getEagerFeatures()
    const eagerIds = eagerFeatures.map(f => f.id)
    
    if (eagerIds.length > 0) {
      await this.loader.loadBatch(eagerIds)
    }
    
    // 预加载懒加载功能
    const lazyFeatures = this.features.getLazyFeatures()
    const lazyIds = lazyFeatures.map(f => f.id)
    
    if (lazyIds.length > 0) {
      // 后台预加载
      this.loader.preload(lazyIds)
    }
    
    // 创建工具栏
    if (this.toolbarConfig && Object.keys(this.toolbarConfig).length > 0) {
      const toolbar = new ToolbarManager(editor, this.toolbarConfig)
      const toolbarElement = toolbar.render()
      
      if (editor.element) {
        editor.element.insertBefore(toolbarElement, editor.contentElement)
      }
    }
    
    return editor
  }
}

/**
 * 创建编辑器构建器
 */
export function createEditor(): EditorBuilder {
  return new EditorBuilder()
}

/**
 * 便捷函数：快速创建轻量级编辑器
 */
export async function createLightweightEditor(element: string | HTMLElement): Promise<Editor> {
  return createEditor()
    .element(element)
    .lightweight()
    .build()
}

/**
 * 便捷函数：快速创建功能完整编辑器
 */
export async function createFullFeaturedEditor(element: string | HTMLElement): Promise<Editor> {
  return createEditor()
    .element(element)
    .fullFeatured()
    .build()
}

/**
 * 便捷函数：快速创建仅格式化编辑器
 */
export async function createFormatOnlyEditor(element: string | HTMLElement): Promise<Editor> {
  return createEditor()
    .element(element)
    .formatOnly()
    .build()
}




