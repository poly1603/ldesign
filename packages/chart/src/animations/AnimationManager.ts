/**
 * 动画管理器
 * 
 * 提供图表的动画和过渡效果，包括：
 * - 入场动画
 * - 数据更新动画
 * - 交互动画
 * - 自定义动画序列
 * - 性能优化的动画控制
 */

import type { ECharts, EChartsOption } from 'echarts'
import type { ChartConfig } from '../core/types'

/**
 * 动画类型
 */
export enum AnimationType {
  /** 入场动画 */
  ENTER = 'enter',
  /** 退场动画 */
  EXIT = 'exit',
  /** 数据更新动画 */
  UPDATE = 'update',
  /** 交互动画 */
  INTERACTION = 'interaction',
  /** 自定义动画 */
  CUSTOM = 'custom'
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 是否启用动画 */
  enabled?: boolean
  /** 动画持续时间 */
  duration?: number
  /** 动画缓动函数 */
  easing?: string
  /** 动画延迟 */
  delay?: number
  /** 是否循环播放 */
  loop?: boolean
  /** 动画方向 */
  direction?: 'normal' | 'reverse' | 'alternate'
  /** 入场动画配置 */
  enter?: {
    type?: 'fade' | 'slide' | 'scale' | 'bounce' | 'elastic'
    duration?: number
    delay?: number
    stagger?: number // 错开时间
  }
  /** 更新动画配置 */
  update?: {
    duration?: number
    easing?: string
    morphing?: boolean // 形变动画
  }
  /** 交互动画配置 */
  interaction?: {
    hover?: {
      scale?: number
      duration?: number
    }
    click?: {
      ripple?: boolean
      duration?: number
    }
  }
}

/**
 * 动画序列步骤
 */
export interface AnimationStep {
  /** 步骤名称 */
  name: string
  /** 动画类型 */
  type: AnimationType
  /** 目标元素选择器 */
  target?: string
  /** 动画属性 */
  properties: Record<string, any>
  /** 持续时间 */
  duration: number
  /** 延迟时间 */
  delay?: number
  /** 缓动函数 */
  easing?: string
  /** 完成回调 */
  onComplete?: () => void
}

/**
 * 动画序列
 */
export interface AnimationSequence {
  /** 序列名称 */
  name: string
  /** 动画步骤 */
  steps: AnimationStep[]
  /** 是否并行执行 */
  parallel?: boolean
  /** 序列完成回调 */
  onComplete?: () => void
}

/**
 * 动画管理器类
 */
export class AnimationManager {
  /** ECharts 实例 */
  private _echarts: ECharts | null = null
  
  /** 图表配置 */
  private _config: ChartConfig | null = null
  
  /** 动画配置 */
  private _animationConfig: AnimationConfig
  
  /** 当前运行的动画 */
  private _runningAnimations: Map<string, any> = new Map()
  
  /** 动画序列队列 */
  private _animationQueue: AnimationSequence[] = []
  
  /** 是否正在播放动画 */
  private _isPlaying = false
  
  /** 性能监控 */
  private _performanceMode = false

  /**
   * 构造函数
   * @param config - 动画配置
   */
  constructor(config: AnimationConfig = {}) {
    this._animationConfig = {
      enabled: true,
      duration: 1000,
      easing: 'cubicOut',
      delay: 0,
      loop: false,
      direction: 'normal',
      enter: {
        type: 'fade',
        duration: 800,
        delay: 0,
        stagger: 100
      },
      update: {
        duration: 600,
        easing: 'cubicOut',
        morphing: true
      },
      interaction: {
        hover: {
          scale: 1.1,
          duration: 200
        },
        click: {
          ripple: true,
          duration: 300
        }
      },
      ...config
    }
  }

  /**
   * 初始化动画管理器
   * @param echarts - ECharts 实例
   * @param config - 图表配置
   */
  initialize(echarts: ECharts, config: ChartConfig): void {
    this._echarts = echarts
    this._config = config
    
    // 设置 ECharts 动画配置
    this._setupEChartsAnimation()
    
    // 设置交互动画
    this._setupInteractionAnimations()
  }

  /**
   * 播放入场动画
   * @param type - 动画类型
   * @param options - 动画选项
   */
  playEnterAnimation(type?: string, options?: Partial<AnimationConfig['enter']>): Promise<void> {
    if (!this._animationConfig.enabled || !this._echarts) {
      return Promise.resolve()
    }

    const enterConfig = { ...this._animationConfig.enter, ...options }
    const animationType = type || enterConfig.type || 'fade'

    return new Promise((resolve) => {
      const animationOption = this._createEnterAnimation(animationType, enterConfig)
      
      this._echarts!.setOption(animationOption, true)
      
      // 动画完成后的回调
      setTimeout(() => {
        resolve()
      }, enterConfig.duration || 800)
    })
  }

  /**
   * 播放数据更新动画
   * @param newData - 新数据
   * @param options - 动画选项
   */
  playUpdateAnimation(newData: any, options?: Partial<AnimationConfig['update']>): Promise<void> {
    if (!this._animationConfig.enabled || !this._echarts) {
      return Promise.resolve()
    }

    const updateConfig = { ...this._animationConfig.update, ...options }

    return new Promise((resolve) => {
      const animationOption = this._createUpdateAnimation(newData, updateConfig)
      
      this._echarts!.setOption(animationOption, false)
      
      setTimeout(() => {
        resolve()
      }, updateConfig.duration || 600)
    })
  }

  /**
   * 播放自定义动画序列
   * @param sequence - 动画序列
   */
  playSequence(sequence: AnimationSequence): Promise<void> {
    if (!this._animationConfig.enabled) {
      return Promise.resolve()
    }

    this._animationQueue.push(sequence)
    
    if (!this._isPlaying) {
      return this._processAnimationQueue()
    }
    
    return Promise.resolve()
  }

  /**
   * 停止所有动画
   */
  stopAllAnimations(): void {
    this._runningAnimations.clear()
    this._animationQueue = []
    this._isPlaying = false
  }

  /**
   * 暂停动画
   */
  pauseAnimations(): void {
    // ECharts 没有直接的暂停 API，这里可以记录状态
    this._isPlaying = false
  }

  /**
   * 恢复动画
   */
  resumeAnimations(): void {
    this._isPlaying = true
    this._processAnimationQueue()
  }

  /**
   * 设置性能模式
   * @param enabled - 是否启用性能模式
   */
  setPerformanceMode(enabled: boolean): void {
    this._performanceMode = enabled
    
    if (enabled) {
      // 性能模式下禁用复杂动画
      this._animationConfig.enabled = false
    }
  }

  /**
   * 获取动画配置
   */
  getConfig(): AnimationConfig {
    return { ...this._animationConfig }
  }

  /**
   * 更新动画配置
   * @param config - 新的动画配置
   */
  updateConfig(config: Partial<AnimationConfig>): void {
    this._animationConfig = { ...this._animationConfig, ...config }
    
    if (this._echarts) {
      this._setupEChartsAnimation()
    }
  }

  /**
   * 销毁动画管理器
   */
  dispose(): void {
    this.stopAllAnimations()
    this._echarts = null
    this._config = null
    this._runningAnimations.clear()
    this._animationQueue = []
  }

  /**
   * 设置 ECharts 动画配置
   */
  private _setupEChartsAnimation(): void {
    if (!this._echarts) return

    const animationOption: EChartsOption = {
      animation: this._animationConfig.enabled,
      animationDuration: this._animationConfig.duration,
      animationEasing: this._animationConfig.easing as any,
      animationDelay: this._animationConfig.delay,
      animationDurationUpdate: this._animationConfig.update?.duration,
      animationEasingUpdate: this._animationConfig.update?.easing as any
    }

    this._echarts.setOption(animationOption, false)
  }

  /**
   * 设置交互动画
   */
  private _setupInteractionAnimations(): void {
    if (!this._echarts || !this._animationConfig.interaction) return

    // 悬停动画
    if (this._animationConfig.interaction.hover) {
      this._echarts.on('mouseover', (params: any) => {
        this._playHoverAnimation(params, true)
      })

      this._echarts.on('mouseout', (params: any) => {
        this._playHoverAnimation(params, false)
      })
    }

    // 点击动画
    if (this._animationConfig.interaction.click) {
      this._echarts.on('click', (params: any) => {
        this._playClickAnimation(params)
      })
    }
  }

  /**
   * 创建入场动画配置
   */
  private _createEnterAnimation(type: string, config: any): EChartsOption {
    const baseOption: EChartsOption = {
      animation: true,
      animationDuration: config.duration,
      animationDelay: config.delay
    }

    switch (type) {
      case 'fade':
        return {
          ...baseOption,
          animationEasing: 'cubicOut'
        }
      case 'slide':
        return {
          ...baseOption,
          animationEasing: 'backOut'
        }
      case 'scale':
        return {
          ...baseOption,
          animationEasing: 'elasticOut'
        }
      case 'bounce':
        return {
          ...baseOption,
          animationEasing: 'bounceOut'
        }
      default:
        return baseOption
    }
  }

  /**
   * 创建更新动画配置
   */
  private _createUpdateAnimation(newData: any, config: any): EChartsOption {
    return {
      animation: true,
      animationDuration: config.duration,
      animationEasing: config.easing,
      // 这里需要根据具体的数据结构来设置
      series: newData
    }
  }

  /**
   * 播放悬停动画
   */
  private _playHoverAnimation(params: any, isHover: boolean): void {
    if (!this._echarts || !this._animationConfig.interaction?.hover) return

    const hoverConfig = this._animationConfig.interaction.hover
    const scale = isHover ? hoverConfig.scale || 1.1 : 1

    // 这里可以实现具体的悬停动画逻辑
    // 由于 ECharts 的限制，可能需要通过 graphic 组件来实现
  }

  /**
   * 播放点击动画
   */
  private _playClickAnimation(params: any): void {
    if (!this._echarts || !this._animationConfig.interaction?.click) return

    // 实现点击波纹效果或其他点击动画
  }

  /**
   * 处理动画队列
   */
  private async _processAnimationQueue(): Promise<void> {
    if (this._animationQueue.length === 0) {
      this._isPlaying = false
      return
    }

    this._isPlaying = true
    const sequence = this._animationQueue.shift()!

    if (sequence.parallel) {
      // 并行执行所有步骤
      const promises = sequence.steps.map(step => this._executeAnimationStep(step))
      await Promise.all(promises)
    } else {
      // 顺序执行步骤
      for (const step of sequence.steps) {
        await this._executeAnimationStep(step)
      }
    }

    sequence.onComplete?.()
    
    // 继续处理队列中的下一个序列
    this._processAnimationQueue()
  }

  /**
   * 执行动画步骤
   */
  private _executeAnimationStep(step: AnimationStep): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 这里实现具体的动画步骤执行逻辑
        step.onComplete?.()
        resolve()
      }, step.duration + (step.delay || 0))
    })
  }
}
