/**
 * 图标管理器
 * 负责管理、渲染和切换图标集
 */

import { EventEmitter } from '../core/EventEmitter'
import type {
  IconDefinition,
  IconSet,
  IconSetType,
  IconStyle,
  IconRenderOptions,
  IconManagerConfig,
  IIconManager,
  IconCategory,
  EditorIconMap
} from './types'
import { LucideIconSet } from './sets/lucide'
import { FeatherIconSet } from './sets/feather'
import { MaterialIconSet } from './sets/material'

export class IconManager extends EventEmitter implements IIconManager {
  private iconSets: Map<IconSetType, IconSet> = new Map()
  private currentSet: IconSetType = 'lucide'
  private defaultStyle: IconStyle = {
    size: 20,
    strokeWidth: 2,
    color: 'currentColor'
  }
  private iconCache: Map<string, string> = new Map()
  private config: IconManagerConfig
  private editorIconMap?: EditorIconMap

  constructor(config: IconManagerConfig = {}) {
    super()
    this.config = {
      defaultSet: 'lucide',
      enableCache: true,
      ...config
    }

    // 设置默认样式
    if (config.defaultStyle) {
      this.defaultStyle = { ...this.defaultStyle, ...config.defaultStyle }
    }

    // 初始化内置图标集
    this.initializeBuiltinSets()

    // 注册自定义图标集
    if (config.customSets) {
      config.customSets.forEach((set, name) => {
        this.registerIconSet(set)
      })
    }

    // 设置默认图标集
    this.currentSet = config.defaultSet || 'lucide'
  }

  /**
   * 初始化内置图标集
   */
  private initializeBuiltinSets(): void {
    // 注册Lucide图标集
    this.registerIconSet(new LucideIconSet())
    
    // 注册Feather图标集
    this.registerIconSet(new FeatherIconSet())
    
    // 注册Material图标集
    this.registerIconSet(new MaterialIconSet())
  }

  /**
   * 获取图标定义
   */
  getIcon(name: string, set?: IconSetType): IconDefinition | null {
    const targetSet = set || this.currentSet
    const iconSet = this.iconSets.get(targetSet)
    
    if (!iconSet) {
      console.warn(`Icon set "${targetSet}" not found`)
      return null
    }

    // 首先尝试从编辑器映射中获取图标名
    const mappedName = this.getMappedIconName(name, targetSet)
    
    // 尝试获取图标
    let icon = iconSet.getIcon(mappedName)
    
    // 如果没找到，尝试原始名称
    if (!icon && mappedName !== name) {
      icon = iconSet.getIcon(name)
    }

    // 如果还没找到，尝试fallback图标
    if (!icon && this.config.fallbackIcon) {
      icon = iconSet.getIcon(this.config.fallbackIcon)
    }

    return icon
  }

  /**
   * 渲染图标为HTML字符串
   */
  renderIcon(name: string, options: IconRenderOptions = {}): string {
    // 检查缓存
    const cacheKey = this.getCacheKey(name, options)
    if (this.config.enableCache && this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey)!
    }

    const icon = this.getIcon(name)
    if (!icon) {
      console.warn(`Icon "${name}" not found in set "${this.currentSet}"`)
      return this.renderFallbackIcon(name, options)
    }

    // 合并样式选项
    const style = { ...this.defaultStyle, ...options }
    
    // 构建SVG
    const svg = this.buildSvg(icon, style)
    
    // 缓存结果
    if (this.config.enableCache) {
      this.iconCache.set(cacheKey, svg)
    }

    return svg
  }

  /**
   * 创建图标DOM元素
   */
  createIconElement(name: string, options: IconRenderOptions = {}): HTMLElement {
    const wrapper = document.createElement('span')
    wrapper.className = `icon icon-${name}`
    
    if (options.className) {
      wrapper.className += ` ${options.className}`
    }

    if (options.inline) {
      wrapper.style.display = 'inline-block'
      wrapper.style.verticalAlign = 'middle'
    }

    wrapper.innerHTML = this.renderIcon(name, options)

    // 添加旋转动画
    if (options.spinning) {
      wrapper.classList.add('icon-spinning')
      this.addSpinningStyles()
    }

    return wrapper
  }

  /**
   * 设置默认图标集
   */
  setDefaultIconSet(set: IconSetType): void {
    if (!this.iconSets.has(set)) {
      throw new Error(`Icon set "${set}" is not registered`)
    }

    const oldSet = this.currentSet
    this.currentSet = set
    
    // 清空缓存
    this.iconCache.clear()
    
    // 触发事件
    this.emit('iconset:changed', {
      oldSet,
      newSet: set
    })

    // 批量替换页面上的图标
    if (typeof window !== 'undefined') {
      this.replaceAllIcons(set)
    }
  }

  /**
   * 获取当前图标集
   */
  getCurrentIconSet(): IconSetType {
    return this.currentSet
  }

  /**
   * 注册自定义图标
   */
  registerIcon(name: string, svg: string, set: IconSetType = 'custom'): void {
    let iconSet = this.iconSets.get(set)
    
    // 如果是custom集且不存在，创建一个
    if (!iconSet && set === 'custom') {
      iconSet = this.createCustomIconSet()
      this.registerIconSet(iconSet)
    }

    if (!iconSet) {
      throw new Error(`Icon set "${set}" not found`)
    }

    // 添加图标到集合
    const icon: IconDefinition = {
      name,
      svg,
      viewBox: '0 0 24 24'
    }
    
    iconSet.icons.set(name, icon)
    
    // 清空缓存
    this.clearIconCache(name)
    
    this.emit('icon:registered', { name, set })
  }

  /**
   * 注册图标集
   */
  registerIconSet(set: IconSet): void {
    this.iconSets.set(set.name, set)
    this.emit('iconset:registered', set.name)
  }

  /**
   * 获取所有可用的图标集
   */
  getAvailableIconSets(): IconSetType[] {
    return Array.from(this.iconSets.keys())
  }

  /**
   * 搜索图标
   */
  searchIcons(query: string, set?: IconSetType): IconDefinition[] {
    const targetSet = set || this.currentSet
    const iconSet = this.iconSets.get(targetSet)
    
    if (!iconSet) {
      return []
    }

    return iconSet.searchIcons(query)
  }

  /**
   * 按分类获取图标
   */
  getIconsByCategory(category: IconCategory, set?: IconSetType): IconDefinition[] {
    const targetSet = set || this.currentSet
    const iconSet = this.iconSets.get(targetSet)
    
    if (!iconSet) {
      return []
    }

    return iconSet.getIconsByCategory(category)
  }

  /**
   * 批量替换所有图标
   */
  replaceAllIcons(set: IconSetType): void {
    if (!this.iconSets.has(set)) {
      console.warn(`Icon set "${set}" not found`)
      return
    }

    // 查找所有图标元素
    const iconElements = document.querySelectorAll('.icon[data-icon-name]')
    
    iconElements.forEach(element => {
      const iconName = element.getAttribute('data-icon-name')
      if (!iconName) return

      // 获取原有选项
      const options = this.extractOptionsFromElement(element as HTMLElement)
      
      // 重新渲染图标
      const newIcon = this.renderIcon(iconName, options)
      element.innerHTML = newIcon
    })

    this.emit('icons:replaced', { set, count: iconElements.length })
  }

  /**
   * 设置编辑器图标映射
   */
  setEditorIconMap(map: Partial<EditorIconMap>): void {
    this.editorIconMap = { ...this.getDefaultEditorIconMap(), ...map }
    this.emit('iconmap:updated', this.editorIconMap)
  }

  /**
   * 构建SVG字符串
   */
  private buildSvg(icon: IconDefinition, style: IconStyle): string {
    const size = typeof style.size === 'number' ? `${style.size}px` : style.size || '20px'
    const viewBox = icon.viewBox || '0 0 24 24'
    
    // 提取路径内容
    let pathContent = icon.svg
    
    // 如果svg是完整的SVG标签，提取内部内容
    if (icon.svg.includes('<svg')) {
      const match = icon.svg.match(/<svg[^>]*>(.*)<\/svg>/s)
      if (match) {
        pathContent = match[1]
      }
    }

    return `
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="${size}" 
        height="${size}" 
        viewBox="${viewBox}"
        fill="${style.fill || 'none'}"
        stroke="${style.color || 'currentColor'}"
        stroke-width="${style.strokeWidth || 2}"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon-svg"
        data-icon-name="${icon.name}"
      >
        ${pathContent}
      </svg>
    `.trim()
  }

  /**
   * 渲染后备图标
   */
  private renderFallbackIcon(name: string, options: IconRenderOptions): string {
    const size = typeof options.size === 'number' ? `${options.size}px` : options.size || '20px'
    
    return `
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="${size}" 
        height="${size}" 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="icon-svg icon-fallback"
      >
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor" stroke="none">?</text>
      </svg>
    `.trim()
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(name: string, options: IconRenderOptions): string {
    return `${this.currentSet}:${name}:${JSON.stringify(options)}`
  }

  /**
   * 清空特定图标的缓存
   */
  private clearIconCache(name: string): void {
    const keysToDelete: string[] = []
    this.iconCache.forEach((_, key) => {
      if (key.includes(`:${name}:`)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.iconCache.delete(key))
  }

  /**
   * 从元素提取选项
   */
  private extractOptionsFromElement(element: HTMLElement): IconRenderOptions {
    const svg = element.querySelector('svg')
    if (!svg) return {}

    return {
      size: svg.getAttribute('width') || undefined,
      color: svg.getAttribute('stroke') || undefined,
      strokeWidth: svg.getAttribute('stroke-width') ? 
        parseFloat(svg.getAttribute('stroke-width')!) : undefined,
      fill: svg.getAttribute('fill') || undefined
    }
  }

  /**
   * 创建自定义图标集
   */
  private createCustomIconSet(): IconSet {
    return {
      name: 'custom',
      displayName: 'Custom Icons',
      icons: new Map(),
      getIcon: function(name: string) {
        return this.icons.get(name) || null
      },
      getAllIcons: function() {
        return Array.from(this.icons.values())
      },
      getIconsByCategory: function(category: IconCategory) {
        return Array.from(this.icons.values()).filter(icon => icon.category === category)
      },
      searchIcons: function(query: string) {
        const lowerQuery = query.toLowerCase()
        return Array.from(this.icons.values()).filter(icon => 
          icon.name.toLowerCase().includes(lowerQuery) ||
          icon.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        )
      }
    }
  }

  /**
   * 添加旋转样式
   */
  private addSpinningStyles(): void {
    if (document.getElementById('icon-spinning-styles')) return

    const style = document.createElement('style')
    style.id = 'icon-spinning-styles'
    style.textContent = `
      @keyframes icon-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .icon-spinning svg {
        animation: icon-spin 1s linear infinite;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 获取映射的图标名称
   */
  private getMappedIconName(name: string, set: IconSetType): string {
    if (!this.editorIconMap) {
      this.editorIconMap = this.getDefaultEditorIconMap()
    }

    // 如果存在映射，返回映射的名称
    const mappedName = (this.editorIconMap as any)[name]
    if (mappedName) {
      return mappedName
    }

    return name
  }

  /**
   * 获取默认的编辑器图标映射
   */
  private getDefaultEditorIconMap(): EditorIconMap {
    // 这里返回每个图标集的默认映射
    // 实际映射会在各个图标集中定义
    return {
      bold: 'bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'strikethrough',
      code: 'code',
      subscript: 'subscript',
      superscript: 'superscript',
      clearFormat: 'remove-formatting',
      heading: 'heading',
      heading1: 'heading-1',
      heading2: 'heading-2',
      heading3: 'heading-3',
      paragraph: 'pilcrow',
      blockquote: 'quote',
      bulletList: 'list',
      orderedList: 'list-ordered',
      taskList: 'list-checks',
      indent: 'indent',
      outdent: 'outdent',
      alignLeft: 'align-left',
      alignCenter: 'align-center',
      alignRight: 'align-right',
      alignJustify: 'align-justify',
      link: 'link',
      unlink: 'unlink',
      image: 'image',
      video: 'video',
      table: 'table',
      horizontalRule: 'separator-horizontal',
      emoji: 'smile',
      template: 'file-text',
      undo: 'undo',
      redo: 'redo',
      copy: 'copy',
      cut: 'scissors',
      paste: 'clipboard',
      delete: 'trash',
      selectAll: 'select-all',
      search: 'search',
      replace: 'replace',
      fullscreen: 'maximize',
      exitFullscreen: 'minimize',
      preview: 'eye',
      sourceCode: 'code-2',
      save: 'save',
      open: 'folder-open',
      'export': 'download',
      'import': 'upload',
      print: 'printer',
      settings: 'settings',
      help: 'help-circle',
      info: 'info',
      more: 'more-horizontal',
      ai: 'sparkles',
      aiSuggest: 'lightbulb',
      aiTranslate: 'languages',
      aiImprove: 'wand',
      textColor: 'palette',
      backgroundColor: 'paint-bucket',
      colorPicker: 'pipette',
      insertRowAbove: 'row-insert-top',
      insertRowBelow: 'row-insert-bottom',
      insertColumnLeft: 'column-insert-left',
      insertColumnRight: 'column-insert-right',
      deleteRow: 'row-delete',
      deleteColumn: 'column-delete',
      deleteTable: 'table-delete',
      mergeCells: 'cells-merge',
      splitCell: 'cells-split',
      arrowUp: 'arrow-up',
      arrowDown: 'arrow-down',
      arrowLeft: 'arrow-left',
      arrowRight: 'arrow-right',
      chevronUp: 'chevron-up',
      chevronDown: 'chevron-down',
      chevronLeft: 'chevron-left',
      chevronRight: 'chevron-right',
      close: 'x',
      check: 'check',
      plus: 'plus',
      minus: 'minus',
      refresh: 'refresh-cw',
      download: 'download',
      upload: 'upload',
      share: 'share',
      lock: 'lock',
      unlock: 'unlock',
      user: 'user',
      calendar: 'calendar',
      clock: 'clock',
      folder: 'folder',
      file: 'file',
      tag: 'tag',
      bookmark: 'bookmark',
      star: 'star',
      heart: 'heart',
      comment: 'message-circle',
      bell: 'bell',
      warning: 'alert-triangle',
      error: 'alert-circle',
      success: 'check-circle'
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.iconCache.clear()
    this.iconSets.clear()
    this.removeAllListeners()
  }
}

// 全局单例
let globalIconManager: IconManager | null = null

/**
 * 获取全局图标管理器实例
 */
export function getIconManager(config?: IconManagerConfig): IconManager {
  if (!globalIconManager) {
    globalIconManager = new IconManager(config)
  }
  return globalIconManager
}

/**
 * 重置全局图标管理器
 */
export function resetIconManager(): void {
  if (globalIconManager) {
    globalIconManager.destroy()
    globalIconManager = null
  }
}