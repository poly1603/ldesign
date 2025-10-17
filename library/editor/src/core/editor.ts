/**
 * Editor - 编辑器核心类
 * 管理编辑器的所有功能
 */

import type { EditorOptions, EditorState, Transaction, Plugin as PluginType, SchemaSpec } from '../types'
import { EventEmitter } from './EventEmitter'
import { Schema, defaultSchema } from './Schema'
import { Document } from './Document'
import { Selection, SelectionManager } from './Selection'
import { CommandManager, KeymapManager } from './Command'
import { PluginManager } from './Plugin'
import { Toolbar } from '../ui/Toolbar'
import { DEFAULT_TOOLBAR_ITEMS } from '../ui/defaultToolbar'
import * as AllPlugins from '../plugins'
import { createLogger } from '../utils/logger'

const logger = createLogger('Editor')

export class Editor {
  // 核心组件
  private eventEmitter: EventEmitter
  private schema: Schema
  private document: Document
  private selectionManager: SelectionManager

  // 管理器
  public commands: CommandManager
  public keymap: KeymapManager
  public plugins: PluginManager
  public contextMenuManager?: any // 右键菜单管理器
  public toolbar?: Toolbar // 工具栏

  // 选项
  public options: EditorOptions
  private editable: boolean = true

  // DOM
  private element: HTMLElement | null = null
  public contentElement: HTMLElement | null = null
  private toolbarElement: HTMLElement | null = null

  // 状态
  private destroyed: boolean = false

  // DOM 选区快照（用于在弹窗交互后恢复插入位置）
  private savedRange: Range | null = null

  constructor(options: EditorOptions = {}) {
    this.options = options
    this.editable = options.editable !== false

    // 初始化核心组件
    this.eventEmitter = new EventEmitter()
    this.schema = defaultSchema
    this.document = new Document(options.content, this.schema)
    this.selectionManager = new SelectionManager(this)

    // 初始化管理器
    this.commands = new CommandManager(this)
    this.keymap = new KeymapManager(this)
    this.plugins = new PluginManager(this)

    // 初始化 DOM
    if (options.element) {
      this.mount(options.element)
    }

    // 注册插件 - 如果没有指定插件，默认加载所有插件
    logger.debug('options.plugins provided?', !!options.plugins)
    if (options.plugins) {
      logger.debug('Using provided plugins:', options.plugins.length)
    } else {
      logger.debug('Using default plugins from getAllDefaultPlugins()')
    }
    
    const pluginsToLoad = options.plugins || this.getAllDefaultPlugins()
    
    logger.debug('Loading plugins, total:', pluginsToLoad.length)
    logger.debug('Plugin list:', pluginsToLoad.map(p => typeof p === 'string' ? p : p?.name || 'unnamed'))
    logger.debug('HeadingPlugin exists in AllPlugins:', !!AllPlugins.HeadingPlugin)
    if (AllPlugins.HeadingPlugin) {
      logger.debug('HeadingPlugin name:', AllPlugins.HeadingPlugin.name)
      logger.debug('HeadingPlugin config:', AllPlugins.HeadingPlugin.config)
      logger.debug('Is HeadingPlugin in pluginsToLoad?', pluginsToLoad.includes(AllPlugins.HeadingPlugin))
    }
    
    pluginsToLoad.forEach((plugin, index) => {
      if (typeof plugin === 'string') {
        logger.debug(`Loading builtin plugin [${index}]: "${plugin}"`)
        // 从内置插件加载
        this.loadBuiltinPlugin(plugin)
      } else {
        logger.debug(`Loading plugin [${index}]: "${plugin.name || 'unnamed'}"`)
        if (plugin.name === 'heading') {
          logger.debug('HeadingPlugin found in plugins list!')
          logger.debug('HeadingPlugin config:', plugin.config)
        }
        this.plugins.register(plugin)
      }
    })
    
    logger.debug('All plugins loaded')
    logger.debug('Registered commands:', this.commands.getCommands())

    // 初始化事件监听
    this.setupEventListeners()
    
    // 将编辑器实例保存到全局，以便工具栏访问
    if (typeof window !== 'undefined') {
      (window as any).editor = this
    }
  }

  /**
   * 获取所有默认插件
   */
  private getAllDefaultPlugins(): PluginType[] {
    logger.debug('Getting default plugins...')
    logger.debug('AllPlugins keys:', Object.keys(AllPlugins))
    
    // 检查 HeadingPlugin 是否存在
    logger.debug('HeadingPlugin check:', {
      exists: !!AllPlugins.HeadingPlugin,
      type: typeof AllPlugins.HeadingPlugin,
      value: AllPlugins.HeadingPlugin
    })
    
    const plugins: PluginType[] = []
    
    // 最重要！首先加载 HeadingPlugin
    if (AllPlugins.HeadingPlugin) {
      logger.debug('✅ Adding HeadingPlugin to default plugins')
      plugins.push(AllPlugins.HeadingPlugin)
    } else {
      logger.error('❌ HeadingPlugin is undefined! This is critical!')
    }
    
    // 首先加入基础插件（命令插件）
    if (AllPlugins.MediaCommandsPlugin) {
      logger.debug('Adding MediaCommandsPlugin')
      plugins.push(AllPlugins.MediaCommandsPlugin)
    }
    if (AllPlugins.FormattingCommandsPlugin) {
      logger.debug('Adding FormattingCommandsPlugin')
      plugins.push(AllPlugins.FormattingCommandsPlugin)
    }
    
    // AI 功能 - 最重要，默认启用
    if (AllPlugins.AIPlugin) {
      logger.debug('Adding AIPlugin to default plugins')
      plugins.push(AllPlugins.AIPlugin)
    }
    
    // 基础格式化
    if (AllPlugins.BoldPlugin) plugins.push(AllPlugins.BoldPlugin)
    if (AllPlugins.ItalicPlugin) plugins.push(AllPlugins.ItalicPlugin)
    if (AllPlugins.UnderlinePlugin) plugins.push(AllPlugins.UnderlinePlugin)
    if (AllPlugins.StrikePlugin) plugins.push(AllPlugins.StrikePlugin)
    if (AllPlugins.InlineCodePlugin) plugins.push(AllPlugins.InlineCodePlugin)
    if (AllPlugins.SuperscriptPlugin) plugins.push(AllPlugins.SuperscriptPlugin)
    if (AllPlugins.SubscriptPlugin) plugins.push(AllPlugins.SubscriptPlugin)
    if (AllPlugins.ClearFormatPlugin) plugins.push(AllPlugins.ClearFormatPlugin)
    
    // 标题和块级元素 - 特别检查 HeadingPlugin
    if (AllPlugins.HeadingPlugin) {
      console.log('[Editor] Adding HeadingPlugin to list')
      plugins.push(AllPlugins.HeadingPlugin)
    } else {
      console.error('[Editor] HeadingPlugin is undefined!')
    }
    if (AllPlugins.BlockquotePlugin) plugins.push(AllPlugins.BlockquotePlugin)
    if (AllPlugins.CodeBlockPlugin) plugins.push(AllPlugins.CodeBlockPlugin)
    
    // 列表
    if (AllPlugins.BulletListPlugin) plugins.push(AllPlugins.BulletListPlugin)
    if (AllPlugins.OrderedListPlugin) plugins.push(AllPlugins.OrderedListPlugin)
    if (AllPlugins.TaskListPlugin) plugins.push(AllPlugins.TaskListPlugin)
    
    // 节点插件
    if (AllPlugins.LinkPlugin) plugins.push(AllPlugins.LinkPlugin)
    if (AllPlugins.ImagePlugin) plugins.push(AllPlugins.ImagePlugin)
    if (AllPlugins.TablePlugin) plugins.push(AllPlugins.TablePlugin)
    if (AllPlugins.HorizontalRulePlugin) plugins.push(AllPlugins.HorizontalRulePlugin)
    
    // 文本样式
    if (AllPlugins.AlignPlugin) plugins.push(AllPlugins.AlignPlugin)
    if (AllPlugins.TextColorPlugin) plugins.push(AllPlugins.TextColorPlugin)
    if (AllPlugins.BackgroundColorPlugin) plugins.push(AllPlugins.BackgroundColorPlugin)
    if (AllPlugins.FontSizePlugin) plugins.push(AllPlugins.FontSizePlugin)
    if (AllPlugins.FontFamilyPlugin) plugins.push(AllPlugins.FontFamilyPlugin)
    if (AllPlugins.IndentPlugin) plugins.push(AllPlugins.IndentPlugin)
    if (AllPlugins.LineHeightPlugin) plugins.push(AllPlugins.LineHeightPlugin)
    if (AllPlugins.TextTransformPlugin) plugins.push(AllPlugins.TextTransformPlugin)
    
    // 功能插件
    if (AllPlugins.HistoryPlugin) plugins.push(AllPlugins.HistoryPlugin)
    if (AllPlugins.FullscreenPlugin) plugins.push(AllPlugins.FullscreenPlugin)
    if (AllPlugins.FindReplacePlugin) plugins.push(AllPlugins.FindReplacePlugin)
    if (AllPlugins.WordCountPlugin) plugins.push(AllPlugins.WordCountPlugin)
    if (AllPlugins.ExportMarkdownPlugin) plugins.push(AllPlugins.ExportMarkdownPlugin)
    if (AllPlugins.MediaDialogPlugin) plugins.push(AllPlugins.MediaDialogPlugin)
    if (AllPlugins.ContextMenuPlugin) plugins.push(AllPlugins.ContextMenuPlugin)
    
    // 图片编辑功能插件 - 创建实例
    if (AllPlugins.MediaContextMenuPlugin) {
      plugins.push(new AllPlugins.MediaContextMenuPlugin())
    }
    if (AllPlugins.ImageResizePlugin) {
      plugins.push(new AllPlugins.ImageResizePlugin({
        minWidth: 50,
        minHeight: 50,
        preserveAspectRatio: true,
        showDimensions: true
      }))
    }
    
    logger.debug(`Total plugins to load: ${plugins.length}`)
    logger.debug('Plugin names:', plugins.map(p => p.name).join(', '))
    
    // 添加 EmojiPlugin（确保它被加载）
    if (AllPlugins.EmojiPlugin) {
      logger.debug('✅ EmojiPlugin found, adding to plugins list')
      plugins.push(AllPlugins.EmojiPlugin)
    } else {
      logger.warn('⚠️ EmojiPlugin not found in AllPlugins!')
      logger.debug('Available plugins:', Object.keys(AllPlugins).filter(k => k.includes('Plugin')))
    }
    
    return plugins
  }

  /**
   * 挂载编辑器
   */
  mount(element: HTMLElement | string): void {
    if (typeof element === 'string') {
      const el = document.querySelector(element)
      if (!el) {
        throw new Error(`Element "${element}" not found`)
      }
      this.element = el as HTMLElement
    } else {
      this.element = element
    }

    // 创建编辑器 DOM 结构
    this.element.classList.add('ldesign-editor')
    this.element.classList.add('ldesign-editor-wrapper')

    // 创建工具栏容器 (默认创建)
    if (this.options.toolbar !== false) {
      this.toolbarElement = document.createElement('div')
      this.toolbarElement.classList.add('ldesign-toolbar')
      this.element.appendChild(this.toolbarElement)
      
      // 创建工具栏实例
      this.toolbar = new Toolbar(this, {
        container: this.toolbarElement,
        items: this.options.toolbarItems || DEFAULT_TOOLBAR_ITEMS
      })
    }

    // 创建编辑器内容区域
    this.contentElement = document.createElement('div')
    this.contentElement.classList.add('ldesign-editor-content')
    this.contentElement.contentEditable = String(this.editable)

    // 设置占位符
    if (this.options.placeholder) {
      this.contentElement.dataset.placeholder = this.options.placeholder
    }

    this.element.appendChild(this.contentElement)

    // 渲染内容
    this.render()

    // 自动聚焦
    if (this.options.autofocus) {
      this.focus()
    }
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    if (!this.contentElement) {
      return
    }

    // 键盘事件
    this.contentElement.addEventListener('keydown', (e) => {
      if (this.keymap.handleKeyDown(e)) {
        e.preventDefault()
      }
    })

    // 输入事件
    this.contentElement.addEventListener('input', (e) => {
      this.handleInput()
    })

    // 选区变化
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection()
      if (this.contentElement && this.contentElement.contains(sel?.anchorNode || null)) {
        // 同步到内部 Selection 模型
        this.selectionManager.syncFromDOM()
        this.emit('selectionUpdate', this.getSelection())
        // 保存 DOM 级别的 Range 以便弹窗关闭后恢复
        if (sel && sel.rangeCount > 0) {
          try {
            this.savedRange = sel.getRangeAt(0).cloneRange()
          } catch {}
        }
      }
    })

    // 聚焦和失焦
    this.contentElement.addEventListener('focus', () => {
      this.emit('focus')
      this.options.onFocus?.()
    })

    this.contentElement.addEventListener('blur', () => {
      this.emit('blur')
      this.options.onBlur?.()
    })
  }

  /**
   * 处理输入
   */
  private handleInput(): void {
    if (!this.contentElement) {
      return
    }

    // 更新文档
    const html = this.contentElement.innerHTML
    this.document = new Document(html, this.schema)

    // 触发更新事件
    this.emit('update', this.getState())
    this.options.onUpdate?.(this.getState())
    this.options.onChange?.(this.getHTML())
  }

  /**
   * 渲染内容
   */
  private render(): void {
    if (!this.contentElement) return

    const html = this.document.toHTML()

    // 保存当前选区
    const selection = this.getSelection()

    // 更新内容
    this.contentElement.innerHTML = html

    // 恢复选区
    if (selection) {
      this.setSelection(selection)
    }
  }

  /**
   * 加载内置插件
   */
  private loadBuiltinPlugin(name: string): void {
    // 动态导入插件
    switch(name) {
      case 'image':
        import('../plugins/media/image').then(module => {
          this.plugins.register(module.ImagePlugin)
        })
        break
      case 'formatting':
        import('../plugins/formatting').then(module => {
          if (module.BoldPlugin) this.plugins.register(module.BoldPlugin)
          if (module.ItalicPlugin) this.plugins.register(module.ItalicPlugin)
          if (module.UnderlinePlugin) this.plugins.register(module.UnderlinePlugin)
        })
        break
      // 其他插件可以在这里添加
      default:
        logger.warn(`未知插件: ${name}`)
    }
  }
  
  /**
   * 获取编辑器状态
   */
  getState(): EditorState {
    return {
      doc: this.document.toJSON(),
      selection: this.getSelection().toJSON()
    }
  }

  /**
   * 分发事务
   */
  dispatch(tr: Transaction): void {
    // 更新文档
    this.document = new Document(tr.doc, this.schema)

    // 更新选区
    if (tr.selection) {
      this.setSelection(Selection.fromJSON(tr.selection))
    }

    // 重新渲染
    this.render()

    // 触发更新事件
    this.emit('update', this.getState())
    this.options.onUpdate?.(this.getState())
    this.options.onChange?.(this.getHTML())
  }

  /**
   * 获取选区
   */
  getSelection(): Selection {
    return this.selectionManager.getSelection()
  }

  /**
   * 设置选区
   */
  setSelection(selection: Selection): void {
    this.selectionManager.setSelection(selection)
  }

  /**
   * 保存当前 DOM 选区（仅当选区在编辑器内部时）
   */
  saveSelection(): void {
    if (!this.contentElement) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (this.contentElement.contains(range.commonAncestorContainer)) {
      try {
        this.savedRange = range.cloneRange()
        logger.debug('DOM selection saved')
      } catch (e) {
        logger.warn('Failed to save selection:', e)
      }
    }
  }

  /**
   * 恢复先前保存的 DOM 选区
   * 返回是否恢复成功
   */
  restoreSelection(): boolean {
    if (!this.contentElement || !this.savedRange) return false
    try {
      if (!this.contentElement.contains(this.savedRange.commonAncestorContainer)) {
        return false
      }
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(this.savedRange)
      logger.debug('DOM selection restored')
      return true
    } catch (e) {
      logger.warn('Failed to restore selection:', e)
      return false
    }
  }

  /**
   * 获取 HTML 内容
   */
  getHTML(): string {
    return this.document.toHTML()
  }
  
  /**
   * 获取选中的纯文本
   */
  getSelectedText(): string {
    if (!this.contentElement) return ''
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return ''
    
    const range = selection.getRangeAt(0)
    if (!this.contentElement.contains(range.commonAncestorContainer)) {
      return ''
    }
    
    // 获取选中的纯文本
    return selection.toString()
  }

  /**
   * 设置 HTML 内容
   */
  setHTML(html: string): void {
    this.document = new Document(html, this.schema)
    this.render()
  }

  /**
   * 获取 JSON 内容
   */
  getJSON(): any {
    return this.document.toJSON()
  }

  /**
   * 设置 JSON 内容
   */
  setJSON(json: any): void {
    this.document = Document.fromJSON(json, this.schema)
    this.render()
  }

  /**
   * 插入 HTML 内容到当前光标位置
   */
  insertHTML(html: string): void {
    if (!this.contentElement) return

    const beforeLen = this.contentElement.innerHTML.length
    logger.debug('insertHTML called. Before length:', beforeLen)
    logger.debug('html length:', html?.length)
    
    // 获取当前选区
    let selection = window.getSelection()
    logger.debug('Initial selection:', selection)
    if (!selection || selection.rangeCount === 0) {
      // 尝试恢复之前保存的选区
      const restored = this.restoreSelection()
      selection = window.getSelection()
      if (!restored || !selection || selection.rangeCount === 0) {
        // 如果没有选区，退化到在编辑器末尾插入
        logger.warn('No selection, creating range at end of editor')
        this.contentElement.focus()
        const range = document.createRange()
        range.selectNodeContents(this.contentElement)
        range.collapse(false)
        selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
    
    let range = selection!.getRangeAt(0)
    logger.debug('Range obtained. Collapsed:', range.collapsed)
    
    // 确保选区在编辑器内
    if (!this.contentElement.contains(range.commonAncestorContainer)) {
      logger.warn('Selection is not in editor; attempting to restore saved selection')
      const restored = this.restoreSelection()
      selection = window.getSelection()
      if (restored && selection && selection.rangeCount > 0 && this.contentElement.contains(selection.getRangeAt(0).commonAncestorContainer)) {
        range = selection.getRangeAt(0)
      } else {
        logger.warn('Saved selection unavailable; moving caret to end')
        this.contentElement.focus()
        const newRange = document.createRange()
        newRange.selectNodeContents(this.contentElement)
        newRange.collapse(false)
        selection!.removeAllRanges()
        selection!.addRange(newRange)
        range = newRange
      }
    }
    
    // 再次确保焦点在编辑器
    this.contentElement.focus()

    // 尝试使用 execCommand，如果失败或无效果则使用手动插入
    let success = false
    try {
      success = document.execCommand('insertHTML', false, html)
      logger.debug('execCommand("insertHTML") returned:', success)
    } catch (err) {
      logger.warn('execCommand threw error, will use manual insertion:', err)
      success = false
    }

    // 检测 execCommand 是否无效果（内容长度未变化）
    let afterLenCandidate = this.contentElement.innerHTML.length
    const noChange = afterLenCandidate === beforeLen
    if (!success || noChange) {
      if (success && noChange) {
        logger.warn('execCommand reported success but content did not change, falling back to manual insertion')
      } else {
        logger.debug('Falling back to manual insertion')
      }

      // 手动插入 HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html

      // 删除选中的内容
      try {
        range.deleteContents()
      } catch (err) {
        logger.warn('deleteContents error:', err)
      }

      // 插入新内容
      const fragment = document.createDocumentFragment()
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild)
      }
      try {
        range.insertNode(fragment)
      } catch (err) {
        logger.error('insertNode error:', err)
      }

      // 移动光标到插入内容之后
      try {
        range.collapse(false)
        selection!.removeAllRanges()
        selection!.addRange(range)
      } catch (err) {
        logger.warn('Reselection error:', err)
      }
    }

    const afterLen = this.contentElement.innerHTML.length
    logger.debug('After length:', afterLen, 'Delta:', afterLen - beforeLen)

    // 简要诊断：统计媒体标签数量
    try {
      const snapshot = this.contentElement.innerHTML
      const imgCount = (snapshot.match(/<img\b/gi) || []).length
      const videoCount = (snapshot.match(/<video\b/gi) || []).length
      const audioCount = (snapshot.match(/<audio\b/gi) || []).length
      logger.debug('Media counts -> img:', imgCount, 'video:', videoCount, 'audio:', audioCount)
    } catch {}

    // 将插入位置滚动到可见区域
    try {
      const selNow = window.getSelection()
      const anchor = selNow?.anchorNode as (Node | null)
      let targetEl: HTMLElement | null = null
      if (anchor) {
        if ((anchor as any).nodeType === 3) {
          targetEl = (anchor as any).parentElement || null
        } else if ((anchor as any).nodeType === 1) {
          targetEl = anchor as any as HTMLElement
        } else {
          targetEl = (anchor as any).parentElement || null
        }
      }
      // 优先滚动选区附近的元素，其次滚动到底部
      if (targetEl && this.contentElement?.contains(targetEl)) {
        targetEl.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
      } else if (this.contentElement) {
        this.contentElement.scrollTop = this.contentElement.scrollHeight
      }
    } catch (err) {
      logger.warn('scrollIntoView failed:', err)
    }

    // 触发更新事件
    this.handleInput()
  }
  
  /**
   * 清空内容
   */
  clear(): void {
    this.setHTML('<p></p>')
  }

  /**
   * 聚焦编辑器
   */
  focus(): void {
    this.contentElement?.focus()
  }

  /**
   * 失焦编辑器
   */
  blur(): void {
    this.contentElement?.blur()
  }

  /**
   * 设置是否可编辑
   */
  setEditable(editable: boolean): void {
    this.editable = editable
    if (this.contentElement) {
      this.contentElement.contentEditable = String(editable)
    }
  }

  /**
   * 检查是否可编辑
   */
  isEditable(): boolean {
    return this.editable
  }

  /**
   * 扩展 Schema
   */
  extendSchema(spec: SchemaSpec): void {
    // 合并节点
    if (spec.nodes) {
      Object.entries(spec.nodes).forEach(([name, nodeSpec]) => {
        this.schema.nodes.set(name, nodeSpec)
      })
    }

    // 合并标记
    if (spec.marks) {
      Object.entries(spec.marks).forEach(([name, markSpec]) => {
        this.schema.marks.set(name, markSpec)
      })
    }
  }

  /**
   * 事件系统
   */
  on(event: string, handler: (...args: any[]) => void): () => void {
    return this.eventEmitter.on(event, handler)
  }

  once(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.once(event, handler)
  }

  off(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.off(event, handler)
  }

  emit(event: string, ...args: any[]): void {
    this.eventEmitter.emit(event, ...args)
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    if (this.destroyed) return

    // 清理插件
    this.plugins.clear()

    // 清理命令和快捷键
    this.commands.clear()
    this.keymap.clear()

    // 清理事件
    this.eventEmitter.clear()

    // 清理 DOM
    if (this.element) {
      this.element.innerHTML = ''
    }

    this.destroyed = true
  }

  /**
   * 检查是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed
  }
}
