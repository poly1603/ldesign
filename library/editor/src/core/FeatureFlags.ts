/**
 * 功能开关系统
 * 细粒度控制每个功能的启用/禁用
 */

import { EventEmitter } from './EventEmitter'

/**
 * 功能定义
 */
export interface Feature {
  id: string
  name: string
  description?: string
  category: FeatureCategory
  enabled: boolean
  lazy?: boolean
  dependencies?: string[]
  config?: Record<string, any>
}

/**
 * 功能分类
 */
export enum FeatureCategory {
  CORE = 'core',           // 核心功能
  FORMAT = 'format',       // 格式化
  INSERT = 'insert',       // 插入
  MEDIA = 'media',         // 媒体
  TABLE = 'table',         // 表格
  AI = 'ai',               // AI
  TOOL = 'tool',           // 工具
  ADVANCED = 'advanced'    // 高级
}

/**
 * 功能开关管理器
 */
export class FeatureFlags extends EventEmitter {
  private features: Map<string, Feature> = new Map()
  private loadedFeatures: Set<string> = new Set()
  
  constructor() {
    super()
    this.initializeDefaultFeatures()
  }
  
  /**
   * 初始化默认功能列表
   */
  private initializeDefaultFeatures(): void {
    const defaultFeatures: Feature[] = [
      // 核心功能（始终启用，立即加载）
      { id: 'basic-editing', name: '基础编辑', category: FeatureCategory.CORE, enabled: true, lazy: false },
      { id: 'selection', name: '选区管理', category: FeatureCategory.CORE, enabled: true, lazy: false },
      { id: 'history', name: '撤销重做', category: FeatureCategory.CORE, enabled: true, lazy: false },
      
      // 格式化功能（可配置）
      { id: 'bold', name: '加粗', category: FeatureCategory.FORMAT, enabled: true, lazy: false },
      { id: 'italic', name: '斜体', category: FeatureCategory.FORMAT, enabled: true, lazy: false },
      { id: 'underline', name: '下划线', category: FeatureCategory.FORMAT, enabled: true, lazy: false },
      { id: 'strikethrough', name: '删除线', category: FeatureCategory.FORMAT, enabled: true, lazy: true },
      { id: 'code', name: '行内代码', category: FeatureCategory.FORMAT, enabled: true, lazy: true },
      { id: 'subscript', name: '下标', category: FeatureCategory.FORMAT, enabled: true, lazy: true },
      { id: 'superscript', name: '上标', category: FeatureCategory.FORMAT, enabled: true, lazy: true },
      { id: 'text-color', name: '文字颜色', category: FeatureCategory.FORMAT, enabled: true, lazy: true },
      { id: 'background-color', name: '背景颜色', category: FeatureCategory.FORMAT, enabled: true, lazy: true },
      { id: 'font-size', name: '字号', category: FeatureCategory.FORMAT, enabled: true, lazy: true },
      { id: 'font-family', name: '字体', category: FeatureCategory.FORMAT, enabled: true, lazy: true },
      { id: 'line-height', name: '行高', category: FeatureCategory.FORMAT, enabled: true, lazy: true },
      
      // 插入功能（可配置，懒加载）
      { id: 'heading', name: '标题', category: FeatureCategory.INSERT, enabled: true, lazy: false },
      { id: 'paragraph', name: '段落', category: FeatureCategory.INSERT, enabled: true, lazy: false },
      { id: 'blockquote', name: '引用块', category: FeatureCategory.INSERT, enabled: true, lazy: true },
      { id: 'codeblock', name: '代码块', category: FeatureCategory.INSERT, enabled: true, lazy: true },
      { id: 'bullet-list', name: '无序列表', category: FeatureCategory.INSERT, enabled: true, lazy: false },
      { id: 'ordered-list', name: '有序列表', category: FeatureCategory.INSERT, enabled: true, lazy: false },
      { id: 'task-list', name: '任务列表', category: FeatureCategory.INSERT, enabled: true, lazy: true },
      { id: 'horizontal-rule', name: '分隔线', category: FeatureCategory.INSERT, enabled: true, lazy: true },
      
      // 媒体功能（懒加载）
      { id: 'link', name: '链接', category: FeatureCategory.MEDIA, enabled: true, lazy: false },
      { id: 'image', name: '图片', category: FeatureCategory.MEDIA, enabled: true, lazy: true },
      { id: 'video', name: '视频', category: FeatureCategory.MEDIA, enabled: true, lazy: true },
      { id: 'audio', name: '音频', category: FeatureCategory.MEDIA, enabled: true, lazy: true },
      { id: 'file', name: '文件', category: FeatureCategory.MEDIA, enabled: true, lazy: true },
      
      // 表格功能（懒加载）
      { id: 'table', name: '表格', category: FeatureCategory.TABLE, enabled: true, lazy: true },
      { id: 'table-row', name: '表格行操作', category: FeatureCategory.TABLE, enabled: true, lazy: true, dependencies: ['table'] },
      { id: 'table-column', name: '表格列操作', category: FeatureCategory.TABLE, enabled: true, lazy: true, dependencies: ['table'] },
      { id: 'table-cell', name: '单元格操作', category: FeatureCategory.TABLE, enabled: true, lazy: true, dependencies: ['table'] },
      
      // 工具功能（懒加载）
      { id: 'find-replace', name: '查找替换', category: FeatureCategory.TOOL, enabled: true, lazy: true },
      { id: 'word-count', name: '字数统计', category: FeatureCategory.TOOL, enabled: true, lazy: true },
      { id: 'fullscreen', name: '全屏', category: FeatureCategory.TOOL, enabled: true, lazy: false },
      { id: 'export', name: '导出', category: FeatureCategory.TOOL, enabled: true, lazy: true },
      { id: 'template', name: '模板', category: FeatureCategory.TOOL, enabled: true, lazy: true },
      { id: 'emoji', name: '表情', category: FeatureCategory.TOOL, enabled: true, lazy: true },
      
      // AI功能（默认禁用，懒加载）
      { id: 'ai-correct', name: 'AI纠错', category: FeatureCategory.AI, enabled: false, lazy: true, dependencies: ['ai-service'] },
      { id: 'ai-complete', name: 'AI补全', category: FeatureCategory.AI, enabled: false, lazy: true, dependencies: ['ai-service'] },
      { id: 'ai-rewrite', name: 'AI重写', category: FeatureCategory.AI, enabled: false, lazy: true, dependencies: ['ai-service'] },
      { id: 'ai-translate', name: 'AI翻译', category: FeatureCategory.AI, enabled: false, lazy: true, dependencies: ['ai-service'] },
      { id: 'ai-service', name: 'AI服务', category: FeatureCategory.AI, enabled: false, lazy: true },
      
      // 高级功能（懒加载）
      { id: 'collaboration', name: '协作编辑', category: FeatureCategory.ADVANCED, enabled: false, lazy: true },
      { id: 'version-control', name: '版本控制', category: FeatureCategory.ADVANCED, enabled: false, lazy: true },
      { id: 'comments', name: '评论批注', category: FeatureCategory.ADVANCED, enabled: false, lazy: true }
    ]
    
    defaultFeatures.forEach(feature => {
      this.features.set(feature.id, feature)
    })
  }
  
  /**
   * 注册功能
   */
  register(feature: Feature): void {
    if (this.features.has(feature.id)) {
      console.warn(`Feature "${feature.id}" is already registered`)
      return
    }
    
    this.features.set(feature.id, feature)
    this.emit('feature:registered', feature)
  }
  
  /**
   * 启用功能
   */
  enable(featureId: string): void {
    const feature = this.features.get(featureId)
    if (!feature) {
      console.error(`Feature "${featureId}" not found`)
      return
    }
    
    feature.enabled = true
    this.emit('feature:enabled', feature)
  }
  
  /**
   * 禁用功能
   */
  disable(featureId: string): void {
    const feature = this.features.get(featureId)
    if (!feature) {
      console.error(`Feature "${featureId}" not found`)
      return
    }
    
    feature.enabled = false
    this.emit('feature:disabled', feature)
  }
  
  /**
   * 切换功能
   */
  toggle(featureId: string): boolean {
    const feature = this.features.get(featureId)
    if (!feature) {
      console.error(`Feature "${featureId}" not found`)
      return false
    }
    
    feature.enabled = !feature.enabled
    this.emit(feature.enabled ? 'feature:enabled' : 'feature:disabled', feature)
    
    return feature.enabled
  }
  
  /**
   * 检查功能是否启用
   */
  isEnabled(featureId: string): boolean {
    return this.features.get(featureId)?.enabled || false
  }
  
  /**
   * 检查功能是否已加载
   */
  isLoaded(featureId: string): boolean {
    return this.loadedFeatures.has(featureId)
  }
  
  /**
   * 标记功能为已加载
   */
  markAsLoaded(featureId: string): void {
    this.loadedFeatures.add(featureId)
    this.emit('feature:loaded', { id: featureId })
  }
  
  /**
   * 获取功能配置
   */
  getFeature(featureId: string): Feature | null {
    return this.features.get(featureId) || null
  }
  
  /**
   * 获取所有功能
   */
  getAllFeatures(): Feature[] {
    return Array.from(this.features.values())
  }
  
  /**
   * 按分类获取功能
   */
  getByCategory(category: FeatureCategory): Feature[] {
    return this.getAllFeatures().filter(f => f.category === category)
  }
  
  /**
   * 获取已启用的功能
   */
  getEnabled(): Feature[] {
    return this.getAllFeatures().filter(f => f.enabled)
  }
  
  /**
   * 获取需要懒加载的功能
   */
  getLazyFeatures(): Feature[] {
    return this.getAllFeatures().filter(f => f.lazy && f.enabled)
  }
  
  /**
   * 获取立即加载的功能
   */
  getEagerFeatures(): Feature[] {
    return this.getAllFeatures().filter(f => !f.lazy && f.enabled)
  }
  
  /**
   * 批量启用
   */
  enableBatch(featureIds: string[]): void {
    featureIds.forEach(id => this.enable(id))
  }
  
  /**
   * 批量禁用
   */
  disableBatch(featureIds: string[]): void {
    featureIds.forEach(id => this.disable(id))
  }
  
  /**
   * 启用分类下所有功能
   */
  enableCategory(category: FeatureCategory): void {
    this.getByCategory(category).forEach(f => {
      f.enabled = true
    })
    this.emit('category:enabled', { category })
  }
  
  /**
   * 禁用分类下所有功能
   */
  disableCategory(category: FeatureCategory): void {
    this.getByCategory(category).forEach(f => {
      f.enabled = false
    })
    this.emit('category:disabled', { category })
  }
  
  /**
   * 导出配置
   */
  exportConfig(): Record<string, boolean | any> {
    const config: Record<string, any> = {}
    
    this.features.forEach((feature, id) => {
      config[id] = {
        enabled: feature.enabled,
        config: feature.config
      }
    })
    
    return config
  }
  
  /**
   * 导入配置
   */
  importConfig(config: Record<string, any>): void {
    Object.entries(config).forEach(([id, value]) => {
      const feature = this.features.get(id)
      if (feature) {
        if (typeof value === 'boolean') {
          feature.enabled = value
        } else if (typeof value === 'object') {
          feature.enabled = value.enabled !== false
          if (value.config) {
            feature.config = { ...feature.config, ...value.config }
          }
        }
      }
    })
    
    this.emit('config:imported')
  }
  
  /**
   * 重置为默认配置
   */
  reset(): void {
    this.features.clear()
    this.loadedFeatures.clear()
    this.initializeDefaultFeatures()
    this.emit('config:reset')
  }
  
  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    enabled: number
    disabled: number
    loaded: number
    lazy: number
  } {
    const all = this.getAllFeatures()
    
    return {
      total: all.length,
      enabled: all.filter(f => f.enabled).length,
      disabled: all.filter(f => !f.enabled).length,
      loaded: this.loadedFeatures.size,
      lazy: all.filter(f => f.lazy).length
    }
  }
}

// 全局单例
let globalFeatureFlags: FeatureFlags | null = null

/**
 * 获取全局功能开关实例
 */
export function getFeatureFlags(): FeatureFlags {
  if (!globalFeatureFlags) {
    globalFeatureFlags = new FeatureFlags()
  }
  return globalFeatureFlags
}

/**
 * 重置全局功能开关
 */
export function resetFeatureFlags(): void {
  if (globalFeatureFlags) {
    globalFeatureFlags.reset()
    globalFeatureFlags = null
  }
}




