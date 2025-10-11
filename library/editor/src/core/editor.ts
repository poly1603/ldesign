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

  // 选项
  private options: EditorOptions
  private editable: boolean = true

  // DOM
  private element: HTMLElement | null = null
  private contentElement: HTMLElement | null = null

  // 状态
  private destroyed: boolean = false

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

    // 注册插件
    if (options.plugins) {
      options.plugins.forEach(plugin => {
        if (typeof plugin === 'string') {
          // TODO: 从内置插件加载
        } else {
          this.plugins.register(plugin)
        }
      })
    }

    // 初始化事件监听
    this.setupEventListeners()
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
    console.log('🎬 [Editor] Setting up event listeners')
    if (!this.contentElement) {
      console.log('❌ [Editor] No contentElement for event listeners')
      return
    }

    // 键盘事件
    this.contentElement.addEventListener('keydown', (e) => {
      if (this.keymap.handleKeyDown(e)) {
        e.preventDefault()
      }
    })

    // 输入事件
    console.log('🎬 [Editor] Adding input event listener to contentElement')
    this.contentElement.addEventListener('input', (e) => {
      console.log('🔔 [Editor] Input event fired on contentElement', e)
      this.handleInput()
    })

    // 选区变化
    document.addEventListener('selectionchange', () => {
      if (this.contentElement && this.contentElement.contains(window.getSelection()?.anchorNode || null)) {
        this.selectionManager.syncFromDOM()
        this.emit('selectionUpdate', this.getSelection())
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
    console.log('📝 [Editor] handleInput called')
    if (!this.contentElement) {
      console.log('❌ [Editor] No contentElement')
      return
    }

    // 更新文档
    const html = this.contentElement.innerHTML
    console.log('📝 [Editor] Current HTML length:', html.length)
    this.document = new Document(html, this.schema)

    // 触发更新事件
    console.log('📝 [Editor] Emitting update event')
    this.emit('update', this.getState())
    this.options.onUpdate?.(this.getState())
    this.options.onChange?.(this.getHTML())
    console.log('✅ [Editor] handleInput completed')
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
