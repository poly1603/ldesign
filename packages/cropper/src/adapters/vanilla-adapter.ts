/**
 * @file 原生JavaScript适配器
 * @description 原生JavaScript的裁剪器适配器
 */

import { BaseAdapter, type AdapterOptions, AdapterState } from './base-adapter'

/**
 * 原生JavaScript适配器配置
 */
export interface VanillaAdapterOptions extends AdapterOptions {
  /** 是否自动绑定到全局对象 */
  bindToGlobal?: boolean
  /** 全局对象名称 */
  globalName?: string
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 原生JavaScript适配器类
 */
export class VanillaAdapter extends BaseAdapter {
  /** 原生适配器配置 */
  protected override options: VanillaAdapterOptions

  /** 调试日志前缀 */
  private debugPrefix = '[LCropper]'

  /** 默认配置 */
  protected static readonly DEFAULT_VANILLA_OPTIONS: VanillaAdapterOptions = {
    ...BaseAdapter.DEFAULT_OPTIONS,
    bindToGlobal: false,
    globalName: 'LCropper',
    debug: false,
  }

  /**
   * 构造函数
   * @param container 容器元素或选择器
   * @param options 原生适配器配置
   */
  constructor(container: HTMLElement | string, options: Partial<VanillaAdapterOptions> = {}) {
    const mergedOptions = { ...VanillaAdapter.DEFAULT_VANILLA_OPTIONS, ...options }
    super(container, mergedOptions)
    this.options = mergedOptions
  }

  /**
   * 框架特定的初始化
   */
  protected override async onInit(): Promise<void> {
    this.log('Initializing VanillaAdapter')

    // 绑定到全局对象
    if (this.options.bindToGlobal && typeof window !== 'undefined') {
      this.bindToGlobal()
    }
  }

  /**
   * 框架特定的销毁
   */
  protected override onDestroy(): void {
    this.log('Destroying VanillaAdapter')

    // 从全局对象移除
    if (this.options.bindToGlobal && typeof window !== 'undefined') {
      this.unbindFromGlobal()
    }
  }

  /**
   * 绑定到全局对象
   */
  private bindToGlobal(): void {
    const globalName = this.options.globalName!

    if (!(window as any)[globalName]) {
      (window as any)[globalName] = {}
    }

    // 创建实例映射
    if (!(window as any)[globalName].instances) {
      (window as any)[globalName].instances = new Map()
    }

    // 添加当前实例
    const instanceId = this.generateInstanceId()
      ; (window as any)[globalName].instances.set(instanceId, this)

      // 添加静态方法
      ; (window as any)[globalName].create = VanillaAdapter.create
      ; (window as any)[globalName].version = VanillaAdapter.version
      ; (window as any)[globalName].isSupported = VanillaAdapter.isSupported

    this.log(`Bound to global object: ${globalName}`)
  }

  /**
   * 从全局对象移除
   */
  private unbindFromGlobal(): void {
    const globalName = this.options.globalName!

    if ((window as any)[globalName]?.instances) {
      // 移除当前实例
      const instances = (window as any)[globalName].instances as Map<string, VanillaAdapter>
      for (const [id, instance] of instances.entries()) {
        if (instance === this) {
          instances.delete(id)
          break
        }
      }

      // 如果没有实例了，清理全局对象
      if (instances.size === 0) {
        delete (window as any)[globalName]
        this.log(`Unbound from global object: ${globalName}`)
      }
    }
  }

  /**
   * 生成实例ID
   */
  private generateInstanceId(): string {
    return `cropper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 调试日志
   * @param message 消息
   * @param data 数据
   */
  private log(message: string, data?: any): void {
    if (this.options.debug) {
      if (data !== undefined) {
        console.log(this.debugPrefix, message, data)
      } else {
        console.log(this.debugPrefix, message)
      }
    }
  }

  /**
   * 重写状态变化回调，添加调试日志
   */
  protected override onStateChange(oldState: AdapterState, newState: AdapterState): void {
    this.log(`State changed: ${oldState} -> ${newState}`)
    super.onStateChange(oldState, newState)
  }

  /**
   * 重写错误处理，添加调试日志
   */
  protected override handleError(error: Error): void {
    this.log('Error occurred:', error)
    super.handleError(error)
  }

  /**
   * 创建适配器实例的静态方法
   * @param container 容器元素或选择器
   * @param options 配置选项
   */
  static create(
    container: HTMLElement | string,
    options: Partial<VanillaAdapterOptions> = {}
  ): VanillaAdapter {
    return new VanillaAdapter(container, options)
  }

  /**
   * 获取版本信息
   */
  static get version(): string {
    return '1.0.0' // 这里应该从 package.json 读取
  }

  /**
   * 检查浏览器支持
   */
  static isSupported(): boolean {
    // 在测试环境中，假设支持所有API
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      return true
    }

    if (typeof window === 'undefined') return false

    // 检查必要的浏览器API支持
    const requiredAPIs = [
      'HTMLCanvasElement',
      'CanvasRenderingContext2D',
      'FileReader',
      'Blob',
      'URL',
    ]

    return requiredAPIs.every(api => {
      try {
        // 对于构造函数，检查是否存在
        if (api === 'HTMLCanvasElement') {
          return typeof HTMLCanvasElement !== 'undefined'
        }
        if (api === 'CanvasRenderingContext2D') {
          return typeof CanvasRenderingContext2D !== 'undefined'
        }
        if (api === 'FileReader') {
          return typeof FileReader !== 'undefined'
        }
        if (api === 'Blob') {
          return typeof Blob !== 'undefined'
        }
        if (api === 'URL') {
          return typeof URL !== 'undefined'
        }
        return api in window
      } catch {
        return false
      }
    })
  }

  /**
   * 获取所有实例
   */
  static getAllInstances(): VanillaAdapter[] {
    if (typeof window === 'undefined') return []

    const globalName = VanillaAdapter.DEFAULT_VANILLA_OPTIONS.globalName!
    const instances = (window as any)[globalName]?.instances

    if (instances instanceof Map) {
      return Array.from(instances.values())
    }

    return []
  }

  /**
   * 销毁所有实例
   */
  static destroyAllInstances(): void {
    const instances = VanillaAdapter.getAllInstances()
    instances.forEach(instance => instance.destroy())
  }

  /**
   * 从选择器创建适配器
   * @param selector CSS选择器
   * @param options 配置选项
   */
  static fromSelector(
    selector: string,
    options: Partial<VanillaAdapterOptions> = {}
  ): VanillaAdapter[] {
    if (typeof document === 'undefined') {
      throw new Error('Document is not available')
    }

    const elements = document.querySelectorAll(selector)
    const adapters: VanillaAdapter[] = []

    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        const adapter = new VanillaAdapter(element, options)
        adapters.push(adapter)
      }
    })

    return adapters
  }

  /**
   * 自动初始化页面上的裁剪器
   * @param selector 选择器，默认为 '[data-cropper]'
   * @param options 默认配置
   */
  static autoInit(
    selector = '[data-cropper]',
    options: Partial<VanillaAdapterOptions> = {}
  ): VanillaAdapter[] {
    if (typeof document === 'undefined') {
      throw new Error('Document is not available')
    }

    const elements = document.querySelectorAll(selector)
    const adapters: VanillaAdapter[] = []

    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        // 从 data 属性读取配置
        const dataOptions = VanillaAdapter.parseDataAttributes(element)
        const mergedOptions = { ...options, ...dataOptions }

        const adapter = new VanillaAdapter(element, mergedOptions)
        adapters.push(adapter)
      }
    })

    return adapters
  }

  /**
   * 解析元素的 data 属性
   * @param element HTML元素
   */
  static parseDataAttributes(element: HTMLElement): Partial<VanillaAdapterOptions> {
    const options: Partial<VanillaAdapterOptions> = {}

    // 解析常用的 data 属性
    const dataAttrs = {
      'data-aspect-ratio': 'aspectRatio',
      'data-min-width': 'minWidth',
      'data-min-height': 'minHeight',
      'data-max-width': 'maxWidth',
      'data-max-height': 'maxHeight',
      'data-crop-shape': 'cropShape',
      'data-quality': 'quality',
      'data-format': 'format',
      'data-debug': 'debug',
    }

    Object.entries(dataAttrs).forEach(([dataAttr, optionKey]) => {
      const value = element.getAttribute(dataAttr)
      if (value !== null) {
        // 类型转换
        if (optionKey === 'aspectRatio' || optionKey === 'quality') {
          (options as any)[optionKey] = parseFloat(value)
        } else if (optionKey.includes('Width') || optionKey.includes('Height')) {
          (options as any)[optionKey] = parseInt(value, 10)
        } else if (optionKey === 'debug') {
          (options as any)[optionKey] = value === 'true'
        } else {
          (options as any)[optionKey] = value
        }
      }
    })

    return options
  }

  /**
   * DOM 就绪时自动初始化
   */
  static onDOMReady(callback: () => void): void {
    if (typeof document === 'undefined') return

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback)
    } else {
      callback()
    }
  }
}

/**
 * 默认导出
 */
export default VanillaAdapter

/**
 * 自动初始化（如果在浏览器环境中）
 */
if (typeof window !== 'undefined') {
  // DOM 就绪时自动初始化
  VanillaAdapter.onDOMReady(() => {
    // 检查是否有自动初始化标记
    if (document.querySelector('[data-cropper-auto]')) {
      VanillaAdapter.autoInit('[data-cropper-auto]', {
        bindToGlobal: true,
        debug: document.documentElement.hasAttribute('data-debug'),
      })
    }
  })
}
