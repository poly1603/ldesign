/**
 * 验证码管理器
 * 负责管理多个验证码实例，提供统一的创建、销毁和管理接口
 */

import {
  CaptchaType,
  type ICaptcha,
  type BaseCaptchaConfig,
  type SlidePuzzleConfig,
  type ClickTextConfig,
  type RotateSliderConfig,
  type ClickConfig
} from '../types'

// 验证码构造函数类型
type CaptchaConstructor<T extends BaseCaptchaConfig = BaseCaptchaConfig> = new (config: T) => ICaptcha

// 验证码工厂映射
const captchaFactories = new Map<CaptchaType, CaptchaConstructor>()

export class CaptchaManager {
  /** 验证码实例映射 */
  private instances = new Map<string, ICaptcha>()

  /** 实例计数器 */
  private instanceCounter = 0

  /** 是否启用调试模式 */
  private debug = false

  constructor(debug: boolean = false) {
    this.debug = debug
  }

  /**
   * 注册验证码类型
   * @param type 验证码类型
   * @param constructor 构造函数
   */
  static register<T extends BaseCaptchaConfig>(
    type: CaptchaType,
    constructor: CaptchaConstructor<T>
  ): void {
    captchaFactories.set(type, constructor as CaptchaConstructor)
  }

  /**
   * 创建验证码实例
   * @param type 验证码类型
   * @param config 配置信息
   * @returns 验证码实例ID
   */
  create(type: CaptchaType, config: BaseCaptchaConfig): string {
    const Constructor = captchaFactories.get(type)
    if (!Constructor) {
      throw new Error(`未注册的验证码类型: ${type}`)
    }

    const instanceId = this.generateInstanceId()
    const instance = new Constructor(config)

    // 添加销毁监听器，自动清理实例
    instance.on('destroy', () => {
      this.instances.delete(instanceId)
      if (this.debug) {
        console.log(`[CaptchaManager] 实例已自动清理: ${instanceId}`)
      }
    })

    this.instances.set(instanceId, instance)

    if (this.debug) {
      console.log(`[CaptchaManager] 创建实例: ${instanceId} (${type})`)
    }

    return instanceId
  }

  /**
   * 创建滑动拼图验证码
   * @param config 配置信息
   * @returns 验证码实例ID
   */
  createSlidePuzzle(config: SlidePuzzleConfig): string {
    return this.create(CaptchaType.SLIDE_PUZZLE, config)
  }

  /**
   * 创建点击文字验证码
   * @param config 配置信息
   * @returns 验证码实例ID
   */
  createClickText(config: ClickTextConfig): string {
    return this.create(CaptchaType.CLICK_TEXT, config)
  }

  /**
   * 创建旋转滑块验证码
   * @param config 配置信息
   * @returns 验证码实例ID
   */
  createRotateSlider(config: RotateSliderConfig): string {
    return this.create(CaptchaType.ROTATE_SLIDER, config)
  }

  /**
   * 创建点击验证码
   * @param config 配置信息
   * @returns 验证码实例ID
   */
  createClick(config: ClickConfig): string {
    return this.create(CaptchaType.CLICK, config)
  }

  /**
   * 获取验证码实例
   * @param instanceId 实例ID
   * @returns 验证码实例
   */
  getInstance(instanceId: string): ICaptcha | null {
    return this.instances.get(instanceId) || null
  }

  /**
   * 销毁验证码实例
   * @param instanceId 实例ID
   */
  destroy(instanceId: string): void {
    const instance = this.instances.get(instanceId)
    if (instance) {
      instance.destroy()
      this.instances.delete(instanceId)

      if (this.debug) {
        console.log(`[CaptchaManager] 销毁实例: ${instanceId}`)
      }
    }
  }

  /**
   * 销毁所有验证码实例
   */
  destroyAll(): void {
    const instanceIds = Array.from(this.instances.keys())
    instanceIds.forEach(id => this.destroy(id))

    if (this.debug) {
      console.log(`[CaptchaManager] 销毁所有实例: ${instanceIds.length}个`)
    }
  }

  /**
   * 获取所有实例ID
   * @returns 实例ID数组
   */
  getAllInstanceIds(): string[] {
    return Array.from(this.instances.keys())
  }

  /**
   * 获取实例数量
   * @returns 实例数量
   */
  getInstanceCount(): number {
    return this.instances.size
  }

  /**
   * 检查实例是否存在
   * @param instanceId 实例ID
   * @returns 是否存在
   */
  hasInstance(instanceId: string): boolean {
    return this.instances.has(instanceId)
  }

  /**
   * 获取指定类型的所有实例
   * @param type 验证码类型
   * @returns 实例数组
   */
  getInstancesByType(type: CaptchaType): ICaptcha[] {
    return Array.from(this.instances.values()).filter(instance => instance.type === type)
  }

  /**
   * 重置所有实例
   */
  resetAll(): void {
    this.instances.forEach(instance => {
      try {
        instance.reset()
      } catch (error) {
        console.error('[CaptchaManager] 重置实例失败:', error)
      }
    })

    if (this.debug) {
      console.log(`[CaptchaManager] 重置所有实例: ${this.instances.size}个`)
    }
  }

  /**
   * 生成实例ID
   * @returns 实例ID
   */
  private generateInstanceId(): string {
    return `captcha_${++this.instanceCounter}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  /**
   * 设置调试模式
   * @param debug 是否启用调试
   */
  setDebug(debug: boolean): void {
    this.debug = debug
  }

  /**
   * 获取统计信息
   * @returns 统计信息
   */
  getStats(): {
    totalInstances: number
    instancesByType: Record<CaptchaType, number>
    instanceIds: string[]
  } {
    const instancesByType = {} as Record<CaptchaType, number>

    // 初始化计数器
    Object.values(CaptchaType).forEach(type => {
      instancesByType[type] = 0
    })

    // 统计各类型实例数量
    this.instances.forEach(instance => {
      instancesByType[instance.type]++
    })

    return {
      totalInstances: this.instances.size,
      instancesByType,
      instanceIds: this.getAllInstanceIds()
    }
  }
}

// 创建默认管理器实例
export const defaultCaptchaManager = new CaptchaManager()
