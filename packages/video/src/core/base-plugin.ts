/**
 * 插件基类
 * 提供插件的基础实现和通用功能
 */

import { EventEmitter } from '../utils/events'
import { generateId, deepMerge } from '../utils/common'
import { PluginStatus, PluginHook } from '../types/plugin'
import type {
  IPlugin,
  PluginMetadata,
  PluginOptions,
  PluginContext,
  PluginError
} from '../types/plugin'

/**
 * 插件基类实现
 */
export abstract class BasePlugin extends EventEmitter implements IPlugin {
  protected _metadata: PluginMetadata
  protected _options: PluginOptions
  protected _status: PluginStatus = PluginStatus.UNINSTALLED
  protected _context?: PluginContext

  /** 插件是否启用 */
  public enabled: boolean = false
  protected _id: string

  constructor(metadata: PluginMetadata, options: PluginOptions = {}) {
    super()

    this._id = generateId('plugin')
    this._metadata = {
      ...metadata,
      id: this._id
    }
    this._options = this.normalizeOptions(options)
  }

  /**
   * 插件元数据
   */
  get metadata(): PluginMetadata {
    return { ...this._metadata }
  }

  /**
   * 插件配置选项
   */
  get options(): PluginOptions {
    return { ...this._options }
  }

  /**
   * 插件唯一ID
   */
  get id(): string {
    return this._id
  }

  /**
   * 插件名称
   */
  get name(): string {
    return this._metadata.name
  }

  /**
   * 获取插件状态
   */
  getStatus(): PluginStatus {
    return this._status
  }



  /**
   * 安装插件
   */
  async install(context: PluginContext): Promise<void> {
    if (this._status !== PluginStatus.UNINSTALLED) {
      throw new Error(`Plugin "${this._metadata.name}" is already installed`)
    }

    this._context = context
    this._status = PluginStatus.INSTALLED

    try {
      await this.onInstall(context)
      this.emit('installed', { plugin: this, context })
    } catch (error) {
      this._status = PluginStatus.ERROR
      throw error
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(context: PluginContext): Promise<void> {
    if (this._status === PluginStatus.UNINSTALLED) {
      return
    }

    // 如果插件已启用，先禁用
    if (this._status === PluginStatus.ENABLED) {
      await this.disable(context)
    }

    try {
      await this.onUninstall(context)
      this._status = PluginStatus.UNINSTALLED
      this._context = undefined
      this.emit('uninstalled', { plugin: this, context })
    } catch (error) {
      this._status = PluginStatus.ERROR
      throw error
    }
  }

  /**
   * 启用插件
   */
  async enable(context: PluginContext): Promise<void> {
    if (this._status === PluginStatus.ENABLED) {
      return
    }

    if (this._status !== PluginStatus.INSTALLED) {
      throw new Error(`Plugin "${this._metadata.name}" must be installed before enabling`)
    }

    try {
      await this.onEnable(context)
      this._status = PluginStatus.ENABLED
      this.enabled = true
      this.emit('enabled', { plugin: this, context })
    } catch (error) {
      this._status = PluginStatus.ERROR
      this.enabled = false
      throw error
    }
  }

  /**
   * 禁用插件
   */
  async disable(context: PluginContext): Promise<void> {
    if (this._status !== PluginStatus.ENABLED) {
      return
    }

    try {
      await this.onDisable(context)
      this._status = PluginStatus.INSTALLED
      this.enabled = false
      this.emit('disabled', { plugin: this, context })
    } catch (error) {
      this._status = PluginStatus.ERROR
      this.enabled = false
      throw error
    }
  }

  /**
   * 更新插件配置
   */
  updateOptions(options: Partial<PluginOptions>): void {
    const oldOptions = { ...this._options }
    this._options = deepMerge(this._options, options)

    this.onOptionsUpdate(oldOptions, this._options)
    this.emit('optionsUpdated', { plugin: this, oldOptions, newOptions: this._options })
  }

  /**
   * 处理插件钩子
   */
  async onHook(hook: PluginHook, context: PluginContext): Promise<void> {
    // 子类可以重写此方法来处理特定的钩子
    switch (hook) {
      case PluginHook.BEFORE_INSTALL:
        await this.onBeforeInstall(context)
        break
      case PluginHook.AFTER_INSTALL:
        await this.onAfterInstall(context)
        break
      case PluginHook.BEFORE_UNINSTALL:
        await this.onBeforeUninstall(context)
        break
      case PluginHook.AFTER_UNINSTALL:
        await this.onAfterUninstall(context)
        break
      case PluginHook.BEFORE_ENABLE:
        await this.onBeforeEnable(context)
        break
      case PluginHook.AFTER_ENABLE:
        await this.onAfterEnable(context)
        break
      case PluginHook.BEFORE_DISABLE:
        await this.onBeforeDisable(context)
        break
      case PluginHook.AFTER_DISABLE:
        await this.onAfterDisable(context)
        break
    }
  }

  /**
   * 获取插件上下文
   */
  protected getContext(): PluginContext {
    if (!this._context) {
      throw new Error(`Plugin "${this._metadata.name}" is not installed`)
    }
    return this._context
  }

  /**
   * 标准化配置选项
   */
  protected normalizeOptions(options: PluginOptions): PluginOptions {
    return {
      enabled: true,
      ...options
    }
  }

  // 抽象方法 - 子类必须实现
  protected abstract onInstall(context: PluginContext): Promise<void>
  protected abstract onUninstall(context: PluginContext): Promise<void>
  protected abstract onEnable(context: PluginContext): Promise<void>
  protected abstract onDisable(context: PluginContext): Promise<void>

  // 可选的生命周期钩子 - 子类可以重写
  protected async onBeforeInstall(context: PluginContext): Promise<void> { }
  protected async onAfterInstall(context: PluginContext): Promise<void> { }
  protected async onBeforeUninstall(context: PluginContext): Promise<void> { }
  protected async onAfterUninstall(context: PluginContext): Promise<void> { }
  protected async onBeforeEnable(context: PluginContext): Promise<void> { }
  protected async onAfterEnable(context: PluginContext): Promise<void> { }
  protected async onBeforeDisable(context: PluginContext): Promise<void> { }
  protected async onAfterDisable(context: PluginContext): Promise<void> { }

  // 配置更新钩子 - 子类可以重写
  protected onOptionsUpdate(oldOptions: PluginOptions, newOptions: PluginOptions): void { }
}

/**
 * UI插件基类
 * 为需要创建UI元素的插件提供基础功能
 */
export abstract class UIPlugin extends BasePlugin {
  protected _element?: HTMLElement
  protected _container?: HTMLElement

  /**
   * 获取插件UI元素
   */
  get element(): HTMLElement | undefined {
    return this._element
  }

  /**
   * 获取插件容器
   */
  get container(): HTMLElement | undefined {
    return this._container
  }

  /**
   * 创建UI元素
   */
  protected abstract createElement(): HTMLElement

  /**
   * 销毁UI元素
   */
  protected destroyElement(): void {
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element)
    }
    this._element = undefined
  }

  /**
   * 显示UI元素
   */
  show(): void {
    if (this._element) {
      this._element.style.display = ''
    }
  }

  /**
   * 隐藏UI元素
   */
  hide(): void {
    if (this._element) {
      this._element.style.display = 'none'
    }
  }

  protected async onInstall(context: PluginContext): Promise<void> {
    this._container = context.player.container
    this._element = this.createElement()

    if (this._container && this._element) {
      this._container.appendChild(this._element)
    }
  }

  protected async onUninstall(context: PluginContext): Promise<void> {
    this.destroyElement()
    this._container = undefined
  }

  protected async onEnable(context: PluginContext): Promise<void> {
    this.show()
  }

  protected async onDisable(context: PluginContext): Promise<void> {
    this.hide()
  }
}

/**
 * 控制插件基类
 * 为需要添加控制按钮的插件提供基础功能
 */
export abstract class ControlPlugin extends UIPlugin {
  protected _button?: HTMLElement

  /**
   * 获取控制按钮
   */
  get button(): HTMLElement | undefined {
    return this._button
  }

  /**
   * 创建控制按钮
   */
  protected abstract createButton(): HTMLElement

  protected async onInstall(context: PluginContext): Promise<void> {
    await super.onInstall(context)

    this._button = this.createButton()

    // 将按钮添加到控制栏
    const controlsElement = this._container?.querySelector('.lv-controls__buttons-right')
    if (controlsElement && this._button) {
      controlsElement.appendChild(this._button)
    }
  }

  protected async onUninstall(context: PluginContext): Promise<void> {
    if (this._button && this._button.parentNode) {
      this._button.parentNode.removeChild(this._button)
    }
    this._button = undefined

    await super.onUninstall(context)
  }
}

/**
 * 覆盖层插件基类
 * 为需要在视频上方显示内容的插件提供基础功能
 */
export abstract class OverlayPlugin extends UIPlugin {
  protected _overlay?: HTMLElement

  /**
   * 获取覆盖层元素
   */
  get overlay(): HTMLElement | undefined {
    return this._overlay
  }

  /**
   * 创建覆盖层元素
   */
  protected abstract createOverlay(): HTMLElement

  /**
   * 实现 UIPlugin 的抽象方法
   */
  protected createElement(): HTMLElement {
    return this.createOverlay()
  }

  protected async onInstall(context: PluginContext): Promise<void> {
    await super.onInstall(context)

    this._overlay = this.createOverlay()

    // 将覆盖层添加到播放器容器
    if (this._container && this._overlay) {
      this._container.appendChild(this._overlay)
    }
  }

  protected async onUninstall(context: PluginContext): Promise<void> {
    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay)
    }
    this._overlay = undefined

    await super.onUninstall(context)
  }
}
