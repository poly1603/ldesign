/**
 * 基础插件类
 * 
 * 所有插件的基础类，提供通用的插件功能
 */

import type { Plugin } from '../types'
import type { FlowchartEditor } from '../core/FlowchartEditor'

/**
 * 基础插件抽象类
 */
export abstract class BasePlugin implements Plugin {
  /**
   * 插件名称
   */
  abstract readonly name: string

  /**
   * 插件版本
   */
  readonly version: string = '1.0.0'

  /**
   * 插件描述
   */
  readonly description: string = ''

  /**
   * 编辑器实例
   */
  protected editor?: FlowchartEditor

  /**
   * 插件是否已安装
   */
  protected installed: boolean = false

  /**
   * 安装插件
   * @param editor 编辑器实例
   */
  install(editor: FlowchartEditor): void {
    if (this.installed) {
      console.warn(`插件 "${this.name}" 已安装`)
      return
    }

    this.editor = editor
    this.installed = true

    // 执行具体的安装逻辑
    this.onInstall()

    console.log(`插件 "${this.name}" v${this.version} 安装完成`)
  }

  /**
   * 卸载插件
   * @param editor 编辑器实例
   */
  uninstall(editor: FlowchartEditor): void {
    if (!this.installed) {
      console.warn(`插件 "${this.name}" 未安装`)
      return
    }

    // 执行具体的卸载逻辑
    this.onUninstall()

    this.installed = false
    this.editor = undefined

    console.log(`插件 "${this.name}" v${this.version} 卸载完成`)
  }

  /**
   * 检查插件是否已安装
   */
  isInstalled(): boolean {
    return this.installed
  }

  /**
   * 获取编辑器实例
   */
  protected getEditor(): FlowchartEditor {
    if (!this.editor) {
      throw new Error(`插件 "${this.name}" 未安装或编辑器实例不存在`)
    }
    return this.editor
  }

  /**
   * 获取 LogicFlow 实例
   */
  protected getLogicFlow() {
    return this.getEditor().getLogicFlow()
  }

  /**
   * 安装时的具体逻辑（子类实现）
   */
  protected abstract onInstall(): void

  /**
   * 卸载时的具体逻辑（子类实现）
   */
  protected abstract onUninstall(): void

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 事件处理函数
   */
  protected addEventListener(event: string, listener: Function): void {
    const lf = this.getLogicFlow()
    lf.on(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 事件处理函数
   */
  protected removeEventListener(event: string, listener: Function): void {
    const lf = this.getLogicFlow()
    lf.off(event, listener)
  }

  /**
   * 注册自定义节点
   * @param config 节点配置
   */
  protected registerNode(config: { type: string; view: any; model: any }): void {
    const lf = this.getLogicFlow()
    lf.register(config)
  }

  /**
   * 注册自定义边
   * @param config 边配置
   */
  protected registerEdge(config: { type: string; view: any; model: any }): void {
    const lf = this.getLogicFlow()
    lf.register(config)
  }

  /**
   * 添加工具栏按钮
   * @param config 按钮配置
   */
  protected addToolbarButton(config: {
    id: string
    text: string
    icon?: string
    onClick: () => void
  }): void {
    // 这里需要与工具栏组件集成
    console.log(`添加工具栏按钮: ${config.text}`)
  }

  /**
   * 添加右键菜单项
   * @param config 菜单项配置
   */
  protected addContextMenuItem(config: {
    text: string
    onClick: (data: any) => void
    target?: 'node' | 'edge' | 'canvas'
  }): void {
    // 这里需要与右键菜单组件集成
    console.log(`添加右键菜单项: ${config.text}`)
  }

  /**
   * 显示通知消息
   * @param message 消息内容
   * @param type 消息类型
   */
  protected showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    // 这里需要与通知组件集成
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  /**
   * 获取插件配置
   * @param key 配置键
   * @param defaultValue 默认值
   */
  protected getConfig<T>(key: string, defaultValue?: T): T {
    // 这里需要与配置系统集成
    return defaultValue as T
  }

  /**
   * 设置插件配置
   * @param key 配置键
   * @param value 配置值
   */
  protected setConfig(key: string, value: any): void {
    // 这里需要与配置系统集成
    console.log(`设置配置 ${key}:`, value)
  }
}
