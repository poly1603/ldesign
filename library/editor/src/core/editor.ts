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
    const pluginsToLoad = options.plugins || this.getAllDefaultPlugins()
    
    console.log('[Editor] Loading plugins, total:', pluginsToLoad.length)
    
    pluginsToLoad.forEach((plugin, index) => {
      if (typeof plugin === 'string') {
        console.log(`[Editor] Loading builtin plugin [${index}]: "${plugin}"`)
        // 从内置插件加载
        this.loadBuiltinPlugin(plugin)
      } else {
        console.log(`[Editor] Loading plugin [${index}]: "${plugin.name || 'unnamed'}"`)
        this.plugins.register(plugin)
      }
    })
    
    console.log('[Editor] All plugins loaded')
    console.log('[Editor] Registered commands:', this.commands.getCommands())

    // 初始化事件监听
    this.setupEventListeners()
  }

  /**
   * 获取所有默认插件
   */
  private getAllDefaultPlugins(): PluginType[] {
    console.log('[Editor] Checking EmojiPlugin:', AllPlugins.EmojiPlugin)
    console.log('[Editor] All available plugins:', Object.keys(AllPlugins))
    
    return [
      // 基础格式化
      AllPlugins.BoldPlugin,
      AllPlugins.ItalicPlugin,
      AllPlugins.UnderlinePlugin,
      AllPlugins.StrikePlugin,
      AllPlugins.InlineCodePlugin,  // 行内代码
      AllPlugins.SuperscriptPlugin,  // 上标
      AllPlugins.SubscriptPlugin,    // 下标
      AllPlugins.ClearFormatPlugin,
      
      // 标题和块级元素
      AllPlugins.HeadingPlugin,
      AllPlugins.BlockquotePlugin,
      AllPlugins.CodeBlockPlugin,
      
      // 列表
      AllPlugins.BulletListPlugin,
      AllPlugins.OrderedListPlugin,
      AllPlugins.TaskListPlugin,
      
      // 节点插件
      AllPlugins.LinkPlugin,
      AllPlugins.ImagePlugin,
      AllPlugins.TablePlugin,
      AllPlugins.HorizontalRulePlugin,
      
      // 文本样式
      AllPlugins.AlignPlugin,
      AllPlugins.TextColorPlugin,
      AllPlugins.BackgroundColorPlugin,
      AllPlugins.FontSizePlugin,
      AllPlugins.FontFamilyPlugin,
      AllPlugins.IndentPlugin,
      AllPlugins.LineHeightPlugin,
      AllPlugins.TextTransformPlugin,
      
      // 功能插件
      AllPlugins.HistoryPlugin,
      AllPlugins.FullscreenPlugin,
      AllPlugins.FindReplacePlugin,
      AllPlugins.WordCountPlugin,
      AllPlugins.ExportMarkdownPlugin,
      AllPlugins.EmojiPlugin,        // 表情插件
      AllPlugins.MediaDialogPlugin,  // 媒体插入对话框（图片、视频、音频）
      AllPlugins.ContextMenuPlugin,
      
      // 图片编辑功能插件 - 创建实例
      new AllPlugins.MediaContextMenuPlugin(),  // 媒体右键菜单（滤镜、环绕、边框等）
      new AllPlugins.ImageResizePlugin({  // 图片调整大小功能
        minWidth: 50,
        minHeight: 50,
        preserveAspectRatio: true,
        showDimensions: true
      })
    ]
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
        console.warn(`未知插件: ${name}`)
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
        console.log('[Editor] DOM selection saved')
      } catch (e) {
        console.warn('[Editor] Failed to save selection:', e)
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
      console.log('[Editor] DOM selection restored')
      return true
    } catch (e) {
      console.warn('[Editor] Failed to restore selection:', e)
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
    console.log('[Editor.insertHTML] Called. Before length:', beforeLen)
    console.log('[Editor.insertHTML] html length:', html?.length)
    
    // 获取当前选区
    let selection = window.getSelection()
    console.log('[Editor.insertHTML] Initial selection:', selection)
    if (!selection || selection.rangeCount === 0) {
      // 尝试恢复之前保存的选区
      const restored = this.restoreSelection()
      selection = window.getSelection()
      if (!restored || !selection || selection.rangeCount === 0) {
        // 如果没有选区，退化到在编辑器末尾插入
        console.warn('[Editor.insertHTML] No selection, creating range at end of editor')
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
    console.log('[Editor.insertHTML] Range obtained. Collapsed:', range.collapsed)
    
    // 确保选区在编辑器内
    if (!this.contentElement.contains(range.commonAncestorContainer)) {
      console.warn('[Editor.insertHTML] Selection is not in editor; attempting to restore saved selection')
      const restored = this.restoreSelection()
      selection = window.getSelection()
      if (restored && selection && selection.rangeCount > 0 && this.contentElement.contains(selection.getRangeAt(0).commonAncestorContainer)) {
        range = selection.getRangeAt(0)
      } else {
        console.warn('[Editor.insertHTML] Saved selection unavailable; moving caret to end')
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
      console.log('[Editor.insertHTML] execCommand("insertHTML") returned:', success)
    } catch (err) {
      console.warn('[Editor.insertHTML] execCommand threw error, will use manual insertion:', err)
      success = false
    }

    // 检测 execCommand 是否无效果（内容长度未变化）
    let afterLenCandidate = this.contentElement.innerHTML.length
    const noChange = afterLenCandidate === beforeLen
    if (!success || noChange) {
      if (success && noChange) {
        console.warn('[Editor.insertHTML] execCommand reported success but content did not change, falling back to manual insertion')
      } else {
        console.log('[Editor.insertHTML] Falling back to manual insertion')
      }

      // 手动插入 HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html

      // 删除选中的内容
      try {
        range.deleteContents()
      } catch (err) {
        console.warn('[Editor.insertHTML] deleteContents error:', err)
      }

      // 插入新内容
      const fragment = document.createDocumentFragment()
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild)
      }
      try {
        range.insertNode(fragment)
      } catch (err) {
        console.error('[Editor.insertHTML] insertNode error:', err)
      }

      // 移动光标到插入内容之后
      try {
        range.collapse(false)
        selection!.removeAllRanges()
        selection!.addRange(range)
      } catch (err) {
        console.warn('[Editor.insertHTML] Reselection error:', err)
      }
    }

    const afterLen = this.contentElement.innerHTML.length
    console.log('[Editor.insertHTML] After length:', afterLen, 'Delta:', afterLen - beforeLen)

    // 简要诊断：统计媒体标签数量
    try {
      const snapshot = this.contentElement.innerHTML
      const imgCount = (snapshot.match(/<img\b/gi) || []).length
      const videoCount = (snapshot.match(/<video\b/gi) || []).length
      const audioCount = (snapshot.match(/<audio\b/gi) || []).length
      console.log('[Editor.insertHTML] Media counts -> img:', imgCount, 'video:', videoCount, 'audio:', audioCount)
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
      console.warn('[Editor.insertHTML] scrollIntoView failed:', err)
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
