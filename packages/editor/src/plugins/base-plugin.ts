/**
 * 基础插件类
 * 提供插件的基础实现和通用功能
 */

import type { 
  IPlugin, 
  IEditor, 
  Command, 
  ToolbarItem 
} from '../types'

/**
 * 抽象基础插件类
 * 所有插件都应该继承此类
 */
export abstract class BasePlugin implements IPlugin {
  /** 插件名称 */
  public abstract readonly name: string

  /** 插件版本 */
  public abstract readonly version: string

  /** 插件描述 */
  public readonly description?: string

  /** 插件依赖 */
  public readonly dependencies?: string[]

  /** 编辑器实例 */
  protected editor!: IEditor

  /** 插件是否已初始化 */
  protected initialized = false

  /** 插件是否已销毁 */
  protected destroyed = false

  /**
   * 初始化插件
   * @param editor 编辑器实例
   */
  init(editor: IEditor): void {
    if (this.initialized) {
      console.warn(`Plugin "${this.name}" is already initialized`)
      return
    }

    this.editor = editor
    this.initialized = true

    try {
      // 调用子类的初始化方法
      this.onInit()
      
      // 注册事件监听器
      this.registerEventListeners()
      
      console.log(`Plugin "${this.name}" initialized successfully`)
    } catch (error) {
      this.initialized = false
      console.error(`Failed to initialize plugin "${this.name}":`, error)
      throw error
    }
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    if (this.destroyed) {
      console.warn(`Plugin "${this.name}" is already destroyed`)
      return
    }

    if (!this.initialized) {
      console.warn(`Plugin "${this.name}" is not initialized`)
      return
    }

    try {
      // 移除事件监听器
      this.unregisterEventListeners()
      
      // 调用子类的销毁方法
      this.onDestroy()
      
      this.destroyed = true
      this.initialized = false
      
      console.log(`Plugin "${this.name}" destroyed successfully`)
    } catch (error) {
      console.error(`Failed to destroy plugin "${this.name}":`, error)
    }
  }

  /**
   * 获取插件命令
   * @returns 命令数组
   */
  getCommands?(): Command[]

  /**
   * 获取工具栏项目
   * @returns 工具栏项目数组
   */
  getToolbarItems?(): ToolbarItem[]

  /**
   * 子类初始化方法
   * 子类可以重写此方法来实现自定义初始化逻辑
   */
  protected onInit(): void {
    // 默认空实现
  }

  /**
   * 子类销毁方法
   * 子类可以重写此方法来实现自定义销毁逻辑
   */
  protected onDestroy(): void {
    // 默认空实现
  }

  /**
   * 注册事件监听器
   * 子类可以重写此方法来注册自定义事件监听器
   */
  protected registerEventListeners(): void {
    // 默认空实现
  }

  /**
   * 移除事件监听器
   * 子类可以重写此方法来移除自定义事件监听器
   */
  protected unregisterEventListeners(): void {
    // 默认空实现
  }

  /**
   * 检查插件是否已初始化
   * @returns 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 检查插件是否已销毁
   * @returns 是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed
  }

  /**
   * 获取编辑器实例
   * @returns 编辑器实例
   */
  protected getEditor(): IEditor {
    if (!this.initialized) {
      throw new Error(`Plugin "${this.name}" is not initialized`)
    }
    return this.editor
  }

  /**
   * 执行命令
   * @param name 命令名称
   * @param args 命令参数
   * @returns 命令执行结果
   */
  protected executeCommand(name: string, ...args: any[]): boolean {
    const result = this.editor.commands.execute(name, ...args)
    return result.success
  }

  /**
   * 检查命令是否可执行
   * @param name 命令名称
   * @param args 命令参数
   * @returns 是否可执行
   */
  protected canExecuteCommand(name: string, ...args: any[]): boolean {
    return this.editor.commands.canExecute(name, ...args)
  }

  /**
   * 检查命令是否激活
   * @param name 命令名称
   * @returns 是否激活
   */
  protected isCommandActive(name: string): boolean {
    return this.editor.commands.isActive(name)
  }

  /**
   * 获取当前选区
   * @returns 选区对象或null
   */
  protected getSelection() {
    return this.editor.selection.getSelection()
  }

  /**
   * 设置选区
   * @param selection 选区对象
   */
  protected setSelection(selection: any): void {
    this.editor.selection.setSelection(selection)
  }

  /**
   * 获取编辑器内容
   * @returns 编辑器内容
   */
  protected getContent(): string {
    return this.editor.getContent()
  }

  /**
   * 设置编辑器内容
   * @param content 内容
   */
  protected setContent(content: string): void {
    this.editor.setContent(content)
  }

  /**
   * 插入内容
   * @param content 要插入的内容
   */
  protected insertContent(content: string): void {
    this.editor.insertContent(content)
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param data 事件数据
   */
  protected emit(type: any, data: any): void {
    this.editor.events.emit(type, data)
  }

  /**
   * 监听事件
   * @param type 事件类型
   * @param listener 事件监听器
   */
  protected on(type: any, listener: any): void {
    this.editor.events.on(type, listener)
  }

  /**
   * 移除事件监听
   * @param type 事件类型
   * @param listener 事件监听器
   */
  protected off(type: any, listener: any): void {
    this.editor.events.off(type, listener)
  }

  /**
   * 获取插件状态
   * @returns 插件状态
   */
  protected getPluginState() {
    return this.editor.state.plugins[this.name]
  }

  /**
   * 设置插件数据
   * @param data 插件数据
   */
  protected setPluginData(data: any): void {
    const currentState = this.getPluginState()
    if (currentState) {
      currentState.data = data
    }
  }

  /**
   * 获取插件数据
   * @returns 插件数据
   */
  protected getPluginData(): any {
    const state = this.getPluginState()
    return state ? state.data : undefined
  }

  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   * @param args 额外参数
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    const prefix = `[${this.name}]`
    switch (level) {
      case 'info':
        console.log(prefix, message, ...args)
        break
      case 'warn':
        console.warn(prefix, message, ...args)
        break
      case 'error':
        console.error(prefix, message, ...args)
        break
    }
  }
}
