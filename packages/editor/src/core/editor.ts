/**
 * 主编辑器类
 * 编辑器的核心实现，整合所有功能模块
 */

import type {
  IEditor,
  IPluginManager,
  ICommandManager,
  IEventManager,
  ISelectionManager,
  EditorOptions,
  EditorState,
  CommandResult
} from '../types'
import { EventType } from '../types'
import { EventManager } from './event-manager'
import { SelectionManager } from './selection-manager'
import { CommandManager } from './command-manager'
import { EditorStateManager } from './editor-state'
import { PluginManager } from './plugin-manager'
import { getPlugin } from '../plugins/plugin-registry'
import { StyleManager, ToolbarRenderer } from '../renderers'
import { ThemeManager } from '../themes'
import { ResponsiveManager } from '../utils'
import { MediaManager } from './media-manager'
import { ShortcutManager } from './shortcut-manager'
import { HistoryManager } from './history-manager'
import {
  getElement,
  addClass,
  removeClass,
  addEventListener,
  removeEventListener,
  getDeviceType,
  debounce
} from '../utils'

/**
 * LDesign 编辑器主类
 * 提供完整的富文本编辑功能
 */
export class LDesignEditor implements IEditor {
  /** 编辑器容器元素 */
  private container: HTMLElement

  /** 编辑器内容区域 */
  private contentElement: HTMLElement

  /** 编辑器配置 */
  private options: Required<EditorOptions>

  /** 状态管理器 */
  private stateManager: EditorStateManager

  /** 事件管理器 */
  public readonly events: IEventManager

  /** 选区管理器 */
  public readonly selection: ISelectionManager

  /** 命令管理器 */
  public readonly commands: ICommandManager

  /** 插件管理器 */
  public readonly plugins: IPluginManager

  /** 样式管理器 */
  public readonly styles: StyleManager

  /** 主题管理器 */
  public readonly themes: ThemeManager

  /** 响应式管理器 */
  public readonly responsive: ResponsiveManager

  /** 媒体管理器 */
  public readonly mediaManager: MediaManager

  /** 工具栏渲染器 */
  private toolbarRenderer: ToolbarRenderer | null = null

  /** 快捷键管理器 */
  public readonly shortcuts: ShortcutManager

  /** 历史记录管理器 */
  public readonly history: HistoryManager

  /** 是否已初始化 */
  public initialized = false

  /** 是否已销毁 */
  public destroyed = false

  /** 事件监听器清理函数 */
  private eventCleanupFunctions: Array<() => void> = []

  constructor(options: EditorOptions) {
    // 获取容器元素
    const container = getElement(options.container)
    if (!container) {
      throw new Error('Container element not found')
    }
    this.container = container

    // 设置默认配置
    this.options = this.mergeDefaultOptions(options)

    // 初始化状态管理器
    this.stateManager = new EditorStateManager(
      this.options.content,
      this.options.breakpoints
    )

    // 初始化管理器
    this.events = new EventManager()
    this.selection = new SelectionManager(this.container)
    this.commands = new CommandManager(this)
    this.plugins = new PluginManager(this)

    // 初始化样式和主题管理器
    this.styles = new StyleManager(this.container)
    this.themes = new ThemeManager(this.styles)

    // 初始化响应式管理器
    this.responsive = new ResponsiveManager(this.container, this.options.breakpoints)

    // 初始化媒体管理器
    this.mediaManager = new MediaManager(this.events)

    // 初始化快捷键管理器
    this.shortcuts = new ShortcutManager(this)

    // 初始化历史记录管理器
    this.history = new HistoryManager(this)

    // 创建内容元素
    this.contentElement = this.createContentElement()
  }

  /**
   * 获取编辑器状态
   */
  get state(): EditorState {
    return this.stateManager.getState()
  }

  /**
   * 初始化编辑器
   */
  init(): void {
    if (this.initialized) {
      console.warn('Editor is already initialized')
      return
    }

    try {
      // 设置容器样式
      this.setupContainer()

      // 设置内容元素
      this.setupContentElement()

      // 绑定事件
      this.bindEvents()

      // 加载插件
      this.loadPlugins()

      // 创建工具栏
      this.createToolbar()

      // 设置默认主题
      const theme = typeof this.options.theme === 'string' ? this.options.theme : 'default'
      this.themes.setTheme(theme)

      // 设置初始内容
      this.setContent(this.options.content)

      // 启动快捷键系统
      this.shortcuts.init()

      // 启动历史记录系统
      this.history.init()

      // 标记为已初始化
      this.initialized = true

      // 触发初始化事件
      this.events.emit(EventType.Init, { editor: this })

      console.log('LDesign Editor initialized successfully')
    } catch (error) {
      console.error('Failed to initialize editor:', error)
      throw error
    }
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    if (this.destroyed) {
      console.warn('Editor is already destroyed')
      return
    }

    try {
      // 触发销毁事件
      this.events.emit(EventType.Destroy, { editor: this })

      // 清理事件监听器
      this.unbindEvents()

      // 销毁插件
      this.plugins.destroy()

      // 销毁管理器
      this.commands.destroy()
      this.selection.destroy()
      this.events.destroy()
      this.stateManager.destroy()

      // 销毁样式和主题管理器
      this.themes.destroy()
      this.styles.destroy()

      // 销毁响应式管理器
      this.responsive.destroy()

      // 销毁媒体管理器
      this.mediaManager.destroy()

      // 销毁工具栏渲染器
      if (this.toolbarRenderer) {
        this.toolbarRenderer.destroy()
        this.toolbarRenderer = null
      }

      // 销毁快捷键管理器
      this.shortcuts.destroy()

      // 销毁历史记录管理器
      this.history.destroy()

      // 清理DOM
      this.cleanupDOM()

      // 标记为已销毁
      this.destroyed = true
      this.initialized = false

      console.log('LDesign Editor destroyed successfully')
    } catch (error) {
      console.error('Failed to destroy editor:', error)
    }
  }

  /**
   * 获取内容
   */
  getContent(): string {
    return this.contentElement.innerHTML
  }

  /**
   * 设置内容
   */
  setContent(content: string): void {
    this.contentElement.innerHTML = content
    this.stateManager.setContent(content, true)

    // 触发内容变更事件
    this.events.emit(EventType.ContentChange, { content })

    // 调用配置的回调
    if (this.options.onChange) {
      this.options.onChange(content)
    }
  }

  /**
   * 插入内容
   */
  insertContent(content: string): void {
    const selection = this.selection.getSelection()
    if (selection) {
      // 在选区位置插入内容
      const range = this.selection.getRange()
      if (range) {
        ; (range as any).deleteContents()
        const fragment = document.createRange().createContextualFragment(content)
          ; (range as any).insertNode(fragment)
          ; (range as any).collapse(false)
        this.selection.setRange(range)
      }
    } else {
      // 在末尾插入内容
      this.contentElement.insertAdjacentHTML('beforeend', content)
    }

    // 更新状态
    const newContent = this.getContent()
    this.stateManager.setContent(newContent, true)

    // 触发内容变更事件
    this.events.emit(EventType.ContentChange, { content: newContent })

    // 调用配置的回调
    if (this.options.onChange) {
      this.options.onChange(newContent)
    }
  }

  /**
   * 执行命令
   */
  executeCommand(name: string, ...args: any[]): CommandResult {
    return this.commands.execute(name, ...args)
  }

  /**
   * 聚焦编辑器
   */
  focus(): void {
    this.contentElement.focus()
  }

  /**
   * 失焦编辑器
   */
  blur(): void {
    this.contentElement.blur()
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): void {
    if (this.options.toolbar && this.options.toolbar.visible !== false) {
      this.toolbarRenderer = new ToolbarRenderer(this, this.options.toolbar)
      this.toolbarRenderer.render(this.container)
    }
  }

  /**
   * 合并默认配置
   */
  private mergeDefaultOptions(options: EditorOptions): Required<EditorOptions> {
    return {
      container: options.container,
      content: options.content || '',
      plugins: options.plugins || [],
      theme: options.theme || 'default',
      breakpoints: options.breakpoints || { mobile: 768, tablet: 1024 },
      toolbar: options.toolbar || {
        position: 'top',
        sticky: true,
        visible: true,
        items: [
          // 操作按钮
          'undo', 'redo',
          { type: 'separator' },
          
          // 格式化按钮
          'bold', 'italic', 'underline', 'strikethrough',
          { type: 'separator' },
          
          // 上下标
          'superscript', 'subscript',
          { type: 'separator' },
          
          // 对齐按钮
          'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
          { type: 'separator' },
          
          // 列表按钮
          'bulletList', 'numberedList',
          { type: 'separator' },
          
          // 媒体按钮
          'link', 'image',
          { type: 'separator' },
          
          // 其他
          'code', 'blockquote'
        ]
      },
      readonly: options.readonly || false,
      spellcheck: options.spellcheck !== false,
      placeholder: options.placeholder || '',
      onChange: options.onChange || (() => { }),
      onSelectionChange: options.onSelectionChange || (() => { }),
      onFocus: options.onFocus || (() => { }),
      onBlur: options.onBlur || (() => { })
    }
  }

  /**
   * 创建内容元素
   */
  private createContentElement(): HTMLElement {
    const element = document.createElement('div')
    element.className = 'ldesign-editor-content'
    element.contentEditable = 'true'
    element.spellcheck = this.options.spellcheck

    if (this.options.placeholder) {
      element.setAttribute('data-placeholder', this.options.placeholder)
    }

    return element
  }

  /**
   * 设置容器
   */
  private setupContainer(): void {
    addClass(this.container, 'ldesign-editor')
    addClass(this.container, `ldesign-editor-theme-${this.options.theme}`)

    // 设置设备类型样式
    const deviceType = getDeviceType(this.options.breakpoints)
    addClass(this.container, `ldesign-editor-${deviceType}`)
  }

  /**
   * 设置内容元素
   */
  private setupContentElement(): void {
    this.container.appendChild(this.contentElement)

    if (this.options.readonly) {
      this.contentElement.contentEditable = 'false'
      addClass(this.container, 'ldesign-editor-readonly')
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 内容变更事件（防抖处理）
    const handleInput = debounce(() => {
      const content = this.getContent()
      this.stateManager.setContent(content, true)
      this.events.emit(EventType.ContentChange, { content })
      if (this.options.onChange) {
        this.options.onChange(content)
      }
    }, 300)

    // 选区变更事件
    const handleSelectionChange = () => {
      const selection = this.selection.getSelection()
      this.stateManager.setSelection(selection)
      this.events.emit(EventType.SelectionChange, { selection })
      if (this.options.onSelectionChange && selection) {
        this.options.onSelectionChange(selection)
      }
    }

    // 焦点事件
    const handleFocus = () => {
      this.stateManager.setFocused(true)
      this.events.emit(EventType.Focus, {})
      if (this.options.onFocus) {
        this.options.onFocus()
      }
    }

    const handleBlur = () => {
      this.stateManager.setFocused(false)
      this.events.emit(EventType.Blur, {})
      if (this.options.onBlur) {
        this.options.onBlur()
      }
    }

    // 绑定事件监听器
    addEventListener(this.contentElement, 'input', handleInput)
    addEventListener(this.contentElement, 'focus', handleFocus)
    addEventListener(this.contentElement, 'blur', handleBlur)
    addEventListener(document, 'selectionchange', handleSelectionChange)

    // 保存清理函数
    this.eventCleanupFunctions.push(
      () => removeEventListener(this.contentElement, 'input', handleInput),
      () => removeEventListener(this.contentElement, 'focus', handleFocus),
      () => removeEventListener(this.contentElement, 'blur', handleBlur),
      () => removeEventListener(document, 'selectionchange', handleSelectionChange)
    )
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    this.eventCleanupFunctions.forEach(cleanup => cleanup())
    this.eventCleanupFunctions = []
  }

  /**
   * 加载插件
   */
  private loadPlugins(): void {
    this.options.plugins.forEach(pluginName => {
      try {
        // 从插件注册表获取插件实例
        const plugin = getPlugin(pluginName)
        if (plugin) {
          // 注册插件到插件管理器
          this.plugins.register(plugin)
          // 启用插件
          this.plugins.enable(pluginName)
        } else {
          console.warn(`Plugin "${pluginName}" is not available in the registry`)
        }
      } catch (error) {
        console.error(`Failed to load plugin "${pluginName}":`, error)
      }
    })
  }

  /**
   * 清空内容
   */
  clear(): void {
    this.setContent('')
  }

  /**
   * 设置只读模式
   * @param readonly 是否只读
   */
  setReadonly(readonly: boolean): void {
    this.stateManager.setReadonly(readonly)
    if (this.contentElement) {
      this.contentElement.contentEditable = readonly ? 'false' : 'true'
    }
  }

  /**
   * 清理DOM
   */
  private cleanupDOM(): void {
    removeClass(this.container, 'ldesign-editor')
    removeClass(this.container, `ldesign-editor-theme-${this.options.theme}`)

    if (this.contentElement.parentNode) {
      this.contentElement.parentNode.removeChild(this.contentElement)
    }
  }
}
