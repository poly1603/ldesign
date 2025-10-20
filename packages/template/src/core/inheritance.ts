/**
 * 模板继承与组合系统
 */

import type { Component, VNode } from 'vue';
import type { Template, TemplateConfig } from '../types'
import { defineComponent, h } from 'vue'
import { deepMerge } from '../utils'

/**
 * 模板继承配置
 */
export interface TemplateInheritanceConfig {
  /**
   * 父模板
   */
  extends?: Template | string
  
  /**
   * 混入模板列表
   */
  mixins?: (Template | string)[]
  
  /**
   * 合并策略
   */
  mergeStrategy?: MergeStrategy
  
  /**
   * 是否允许覆盖
   */
  allowOverride?: boolean
  
  /**
   * 继承深度限制
   */
  maxDepth?: number
}

/**
 * 合并策略
 */
export interface MergeStrategy {
  /**
   * 数据合并策略
   */
  data?: 'merge' | 'replace' | 'concat' | ((parent: any, child: any) => any)
  
  /**
   * 样式合并策略
   */
  styles?: 'merge' | 'replace' | 'append' | ((parent: any, child: any) => any)
  
  /**
   * 组件合并策略
   */
  components?: 'merge' | 'replace' | ((parent: any, child: any) => any)
  
  /**
   * 插槽合并策略
   */
  slots?: 'merge' | 'replace' | 'prepend' | 'append' | ((parent: any, child: any) => any)
  
  /**
   * 事件合并策略
   */
  events?: 'merge' | 'replace' | 'chain' | ((parent: any, child: any) => any)
  
  /**
   * 属性合并策略
   */
  props?: 'merge' | 'replace' | ((parent: any, child: any) => any)
}

/**
 * 模板块定义
 */
export interface TemplateBlock {
  /**
   * 块名称
   */
  name: string
  
  /**
   * 块内容
   */
  content: VNode | Component | string
  
  /**
   * 是否可覆盖
   */
  overridable?: boolean
  
  /**
   * 优先级
   */
  priority?: number
}

/**
 * 模板继承管理器
 */
export class TemplateInheritanceManager {
  private templates: Map<string, Template> = new Map()
  // 使用WeakMap缓存继承结果，允许垃圾回收
  private inheritanceCache: WeakMap<object, Template> = new WeakMap()
  private mixinCache: Map<string, any> = new Map()
  private cacheKeyMap: Map<string, object> = new Map()
  private readonly MAX_TEMPLATES = 500
  private readonly MAX_MIXINS = 100
  private readonly MAX_CACHE_KEYS = 1000
  private cleanupTimer: ReturnType<typeof setTimeout> | null = null
  
  /**
   * 注册模板
   */
  registerTemplate(id: string, template: Template): void {
    this.templates.set(id, template)
    // 清除相关缓存
    this.clearCache(id)
    
    // 限制模板数量
    if (this.templates.size > this.MAX_TEMPLATES) {
      const oldestKeys = Array.from(this.templates.keys()).slice(0, this.templates.size - this.MAX_TEMPLATES)
      oldestKeys.forEach(key => {
        this.templates.delete(key)
        this.clearCache(key)
      })
    }
  }
  
  /**
   * 获取模板
   */
  getTemplate(id: string): Template | undefined {
    return this.templates.get(id)
  }
  
  /**
   * 扩展模板
   */
  extendTemplate(
    child: Template,
    config: TemplateInheritanceConfig
  ): Template {
    const cacheKeyStr = this.getCacheKey(child, config)
    let cacheKeyObj = this.cacheKeyMap.get(cacheKeyStr)
    
    // 检查缓存
    if (cacheKeyObj && this.inheritanceCache.has(cacheKeyObj)) {
      const cached = this.inheritanceCache.get(cacheKeyObj)
      if (cached) return cached
    }
    
    // 创建新的缓存键对象
    if (!cacheKeyObj) {
      cacheKeyObj = { key: cacheKeyStr }
      this.cacheKeyMap.set(cacheKeyStr, cacheKeyObj)
      
      // 限制缓存键数量
      if (this.cacheKeyMap.size > this.MAX_CACHE_KEYS) {
        const oldestKeys = Array.from(this.cacheKeyMap.keys()).slice(0, this.cacheKeyMap.size - this.MAX_CACHE_KEYS)
        oldestKeys.forEach(key => {
          const obj = this.cacheKeyMap.get(key)
          if (obj) this.inheritanceCache.delete(obj)
          this.cacheKeyMap.delete(key)
        })
      }
    }
    
    // 应用继承
    let result = { ...child }
    
    // 处理继承
    if (config.extends) {
      const parent = this.resolveTemplate(config.extends)
      if (parent) {
        result = this.mergeTemplates(parent, result, config.mergeStrategy, 1, config.maxDepth)
      }
    }
    
    // 处理混入
    if (config.mixins?.length) {
      for (const mixin of config.mixins) {
        const mixinTemplate = this.resolveTemplate(mixin)
        if (mixinTemplate) {
          result = this.mergeTemplates(mixinTemplate, result, config.mergeStrategy)
        }
      }
    }
    
    // 缓存结果
    this.inheritanceCache.set(cacheKeyObj, result)
    
    return result
  }
  
  /**
   * 创建混入
   */
  createMixin(id: string, mixin: Partial<Template>): void {
    this.mixinCache.set(id, mixin)
    
    // 限制混入数量
    if (this.mixinCache.size > this.MAX_MIXINS) {
      const oldestKeys = Array.from(this.mixinCache.keys()).slice(0, this.mixinCache.size - this.MAX_MIXINS)
      oldestKeys.forEach(key => this.mixinCache.delete(key))
    }
  }
  
  /**
   * 获取混入
   */
  getMixin(id: string): Partial<Template> | undefined {
    return this.mixinCache.get(id)
  }
  
  /**
   * 合并模板
   */
  private mergeTemplates(
    parent: Template,
    child: Template,
    strategy?: MergeStrategy,
    depth: number = 1,
    maxDepth: number = 10
  ): Template {
    // 检查深度限制
    if (depth > maxDepth) {
      console.warn(`Template inheritance depth exceeded (${maxDepth})`)
      return child
    }
    
    const mergedTemplate: Template = { ...child }
    
    // 合并配置
    if (parent.config || child.config) {
      mergedTemplate.config = this.mergeConfig(
        parent.config as any || {},
        child.config as any || {},
        strategy
      )
    }
    
    // 合并组件
    if (parent.component || child.component) {
      mergedTemplate.component = this.mergeComponents(
        parent.component,
        child.component,
        strategy?.components
      )
    }
    
    // 合并样式
    if ((parent as any).styles || (child as any).styles) {
      (mergedTemplate as any).styles = this.mergeStyles(
        (parent as any).styles,
        (child as any).styles,
        strategy?.styles
      )
    }
    
    // 合并数据
    if ((parent as any).data || (child as any).data) {
      (mergedTemplate as any).data = this.mergeData(
        (parent as any).data,
        (child as any).data,
        strategy?.data
      )
    }
    
    return mergedTemplate
  }
  
  /**
   * 合并配置
   */
  private mergeConfig(
    parentConfig: TemplateConfig,
    childConfig: TemplateConfig,
    strategy?: MergeStrategy
  ): TemplateConfig {
    if (strategy?.props === 'replace') {
      return childConfig
    }
    
    if (typeof strategy?.props === 'function') {
      return strategy.props(parentConfig, childConfig)
    }
    
    return deepMerge(parentConfig, childConfig)
  }
  
  /**
   * 合并组件
   */
  private mergeComponents(
    parentComponent?: Component,
    childComponent?: Component,
    strategy?: MergeStrategy['components']
  ): Component {
    if (!parentComponent) return childComponent!
    if (!childComponent) return parentComponent
    
    if (strategy === 'replace') {
      return childComponent
    }
    
    if (typeof strategy === 'function') {
      return strategy(parentComponent, childComponent)
    }
    
    // 创建合并组件
    return defineComponent({
      name: 'MergedComponent',
      setup(props, ctx) {
        // 渲染子组件，同时保留父组件的某些特性
        return () => h(childComponent, props, ctx.slots)
      }
    })
  }
  
  /**
   * 合并样式
   */
  private mergeStyles(
    parentStyles?: any,
    childStyles?: any,
    strategy?: MergeStrategy['styles']
  ): any {
    if (!parentStyles) return childStyles
    if (!childStyles) return parentStyles
    
    if (strategy === 'replace') {
      return childStyles
    }
    
    if (strategy === 'append') {
      return `${parentStyles}\n${childStyles}`
    }
    
    if (typeof strategy === 'function') {
      return strategy(parentStyles, childStyles)
    }
    
    // 默认合并策略
    if (typeof parentStyles === 'object' && typeof childStyles === 'object') {
      return { ...parentStyles, ...childStyles }
    }
    
    return childStyles
  }
  
  /**
   * 合并数据
   */
  private mergeData(
    parentData: any,
    childData: any,
    strategy?: MergeStrategy['data']
  ): any {
    if (!parentData) return childData
    if (!childData) return parentData
    
    if (strategy === 'replace') {
      return childData
    }
    
    if (strategy === 'concat' && Array.isArray(parentData) && Array.isArray(childData)) {
      return [...parentData, ...childData]
    }
    
    if (typeof strategy === 'function') {
      return strategy(parentData, childData)
    }
    
    // 默认深度合并
    return deepMerge(parentData, childData)
  }
  
  /**
   * 解析模板
   */
  private resolveTemplate(templateOrId: Template | string): Template | undefined {
    if (typeof templateOrId === 'string') {
      // 先检查是否是混入
      const mixin = this.getMixin(templateOrId)
      if (mixin) {
        return mixin as Template
      }
      // 再检查模板
      return this.templates.get(templateOrId)
    }
    return templateOrId
  }
  
  /**
   * 获取缓存键
   */
  private getCacheKey(template: Template, config: TemplateInheritanceConfig): string {
    const parts = [
      template.id || 'anonymous',
      config.extends ? (typeof config.extends === 'string' ? config.extends : config.extends.id) : '',
      ...(config.mixins || []).map(m => typeof m === 'string' ? m : m.id)
    ]
    return parts.filter(Boolean).join(':')
  }
  
  /**
   * 清除缓存
   */
  private clearCache(templateId?: string): void {
    if (templateId) {
      // 清除特定模板的缓存
      const keysToDelete: string[] = []
      for (const [key, obj] of this.cacheKeyMap) {
        if (key.includes(templateId)) {
          this.inheritanceCache.delete(obj)
          keysToDelete.push(key)
        }
      }
      keysToDelete.forEach(key => this.cacheKeyMap.delete(key))
    } else {
      // 清除所有缓存 - WeakMap会自动处理
      this.cacheKeyMap.clear()
    }
    
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
  
  /**
   * 清理所有数据
   */
  dispose(): void {
    this.templates.clear()
    this.mixinCache.clear()
    this.cacheKeyMap.clear()
    // WeakMap会自动垃圾回收
    
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
}

/**
 * 模板块管理器
 */
export class TemplateBlockManager {
  private blocks: Map<string, TemplateBlock[]> = new Map()
  
  /**
   * 定义块
   */
  defineBlock(templateId: string, block: TemplateBlock): void {
    const blocks = this.blocks.get(templateId) || []
    
    // 按优先级插入
    const index = blocks.findIndex(b => (b.priority || 0) < (block.priority || 0))
    if (index === -1) {
      blocks.push(block)
    } else {
      blocks.splice(index, 0, block)
    }
    
    this.blocks.set(templateId, blocks)
  }
  
  /**
   * 获取块
   */
  getBlock(templateId: string, blockName: string): TemplateBlock | undefined {
    const blocks = this.blocks.get(templateId)
    return blocks?.find(b => b.name === blockName)
  }
  
  /**
   * 覆盖块
   */
  overrideBlock(
    templateId: string,
    blockName: string,
    content: VNode | Component | string
  ): boolean {
    const block = this.getBlock(templateId, blockName)
    if (block && block.overridable !== false) {
      block.content = content
      return true
    }
    return false
  }
  
  /**
   * 渲染块
   */
  renderBlock(templateId: string, blockName: string): VNode | null {
    const block = this.getBlock(templateId, blockName)
    if (!block) return null
    
    if (typeof block.content === 'string') {
      return h('div', { innerHTML: block.content })
    }
    
    if (block.content && typeof block.content === 'object' && 'render' in block.content) {
      return h(block.content as Component)
    }
    
    return block.content as VNode
  }
  
  /**
   * 获取所有块
   */
  getBlocks(templateId: string): TemplateBlock[] {
    return this.blocks.get(templateId) || []
  }
  
  /**
   * 清除块
   */
  clearBlocks(templateId?: string): void {
    if (templateId) {
      this.blocks.delete(templateId)
    } else {
      this.blocks.clear()
    }
  }
}

// 创建全局实例
export const inheritanceManager = new TemplateInheritanceManager()
export const blockManager = new TemplateBlockManager()

/**
 * 创建可继承模板
 */
export function createInheritableTemplate(
  template: Template,
  config?: TemplateInheritanceConfig
): Template {
  if (!config?.extends && !config?.mixins?.length) {
    return template
  }
  
  return inheritanceManager.extendTemplate(template, config)
}

/**
 * 创建模板混入
 */
export function createTemplateMixin(
  id: string,
  mixin: Partial<Template>
): void {
  inheritanceManager.createMixin(id, mixin)
}

/**
 * 注册基础模板
 */
export function registerBaseTemplate(
  id: string,
  template: Template
): void {
  inheritanceManager.registerTemplate(id, template)
}