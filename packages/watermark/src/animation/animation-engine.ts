/**
 * 动画引擎
 */

import type { AnimationConfig, AnimationType } from '../types'

import {
  ErrorSeverity,
  WatermarkError,
  WatermarkErrorCode,
} from '../types/error'
import { generateId } from '../utils/id-generator'

/**
 * 动画状态接口
 */
export interface AnimationState {
  id: string
  instanceId: string
  type: AnimationType
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled'
  progress: number
  currentTime: number
  duration: number
  iterations: number
  currentIteration: number
  direction: string
  startTime: number
  endTime: number
}

/**
 * 动画时间轴接口
 */
export interface AnimationTimeline {
  id: string
  animations: string[]
  duration: number
  status: 'idle' | 'running' | 'paused' | 'completed'
}

/**
 * 动画事件接口
 */
export interface AnimationEvent {
  animationId: string
  type: 'start' | 'pause' | 'resume' | 'stop' | 'finish' | 'cancel' | 'progress'
  timestamp: number
}

/**
 * 过渡配置接口
 */
export interface TransitionConfig {
  duration?: number
  easing?: string
  delay?: number
}

/**
 * 特效配置接口
 */
export interface EffectConfig {
  type: string
  duration?: number
  intensity?: number
  // eslint-disable-next-line ts/no-explicit-any
  params?: Record<string, any>
}

/**
 * 动画引擎接口
 */
export interface IAnimationEngine {
  createAnimation: (
    instanceId: string,
    type: AnimationType,
    config: Partial<AnimationConfig>
  ) => Promise<string>
  startAnimation: (animationId: string) => Promise<void>
  pauseAnimation: (animationId: string) => Promise<void>
  stopAnimation: (animationId: string) => Promise<void>
  destroyAnimation: (animationId: string) => Promise<void>
}

/**
 * 动画引擎
 * 负责水印的动画效果和过渡管理
 */
export class AnimationEngine implements IAnimationEngine {
  private animations = new Map<string, Animation>()
  private timelines = new Map<string, AnimationTimeline>()
  private states = new Map<string, AnimationState>()
  private callbacks = new Map<string, ((event: AnimationEvent) => void)[]>()
  private config: AnimationConfig

  constructor(config: Partial<AnimationConfig> = {}) {
    this.config = {
      type: 'none',
      duration: 1000,
      easing: 'ease-in-out',
      delay: 0,
      iteration: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
      params: {},
      ...config,
    }
  }

  /**
   * 初始化动画引擎
   */
  async init(): Promise<void> {
    // 检查浏览器支持
    if (!this.checkSupport()) {
      throw new WatermarkError(
        'Animation not supported in this browser',
        WatermarkErrorCode.BROWSER_NOT_SUPPORTED,
        ErrorSeverity.HIGH,
      )
    }
  }

  /**
   * 创建动画
   */
  async createAnimation(
    instanceId: string,
    type: AnimationType,
    config: Partial<AnimationConfig> = {},
  ): Promise<string> {
    const animationId = generateId('animation')
    const animationConfig = { ...this.config, ...config }

    // 创建动画状态
    const state: AnimationState = {
      id: animationId,
      instanceId,
      type,
      status: 'idle',
      progress: 0,
      currentTime: 0,
      duration: animationConfig.duration || 1000,
      iterations:
        typeof animationConfig.iteration === 'number'
          ? animationConfig.iteration
          : 1,
      currentIteration: 0,
      direction: animationConfig.direction || 'normal',
      startTime: 0,
      endTime: 0,
    }

    this.states.set(animationId, state)

    // 创建关键帧
    const keyframes = this.createKeyframes(type, animationConfig)

    // 创建Web Animation API动画
    const elements = this.getInstanceElements(instanceId)
    if (elements.length === 0) {
      throw new WatermarkError(
        'No elements found for animation',
        WatermarkErrorCode.ANIMATION_FAILED,
        ErrorSeverity.MEDIUM,
      )
    }

    const animation = elements[0].animate(keyframes, {
      duration: animationConfig.duration,
      easing: this.convertEasing(animationConfig.easing),
      delay: animationConfig.delay,
      iterations:
        typeof animationConfig.iteration === 'number'
          ? animationConfig.iteration
          : animationConfig.iteration === 'infinite'
            ? Infinity
            : 1,
      direction: animationConfig.direction,
      fill: animationConfig.fillMode,
    })

    // 设置事件监听
    this.setupAnimationListeners(animation, animationId)

    this.animations.set(animationId, animation)

    return animationId
  }

  /**
   * 开始动画
   */
  async startAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    const state = this.states.get(animationId)

    if (!animation || !state) {
      throw new WatermarkError(
        `Animation ${animationId} not found`,
        WatermarkErrorCode.ANIMATION_NOT_FOUND,
      )
    }

    state.status = 'running'
    state.startTime = Date.now()

    animation.play()

    this.emitEvent(animationId, 'start', {})
  }

  /**
   * 暂停动画
   */
  async pauseAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    const state = this.states.get(animationId)

    if (!animation || !state) {
      return
    }

    state.status = 'paused'
    // this.pausedTime = Date.now()

    animation.pause()

    this.emitEvent(animationId, 'pause', {})
  }

  /**
   * 恢复动画
   */
  async resumeAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    const state = this.states.get(animationId)

    if (!animation || !state) {
      return
    }

    if (state.status === 'paused') {
      state.status = 'running'
      animation.play()
      this.emitEvent(animationId, 'resume', {})
    }
  }

  /**
   * 停止动画
   */
  async stopAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    const state = this.states.get(animationId)

    if (!animation || !state) {
      return
    }

    state.status = 'cancelled'
    state.progress = 0
    state.currentTime = 0

    animation.cancel()

    this.emitEvent(animationId, 'stop', {})
  }

  /**
   * 完成动画
   */
  async finishAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    const state = this.states.get(animationId)

    if (!animation || !state) {
      return
    }

    state.status = 'completed'
    state.progress = 1
    state.endTime = Date.now()

    animation.finish()

    this.emitEvent(animationId, 'finish', {})
  }

  /**
   * 销毁动画
   */
  async destroyAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    const state = this.states.get(animationId)

    if (animation) {
      animation.cancel()
      this.animations.delete(animationId)
    }

    if (state) {
      this.states.delete(animationId)
    }

    this.callbacks.delete(animationId)
  }

  /**
   * 创建时间线
   */
  async createTimeline(
    instanceId: string,
    animations: Array<{
      type: AnimationType
      config: Partial<AnimationConfig>
      delay?: number
    }>,
  ): Promise<string> {
    const timelineId = generateId('timeline')

    const timeline: AnimationTimeline = {
      id: timelineId,
      animations: [],
      duration: 0,
      status: 'idle',
    }

    // 创建时间线中的动画
    let totalDelay = 0
    for (const animConfig of animations) {
      const animationId = await this.createAnimation(
        instanceId,
        animConfig.type,
        {
          ...animConfig.config,
          delay: totalDelay + (animConfig.delay || 0),
        },
      )

      timeline.animations.push(animationId)
      totalDelay
        += (animConfig.config.duration || 1000) + (animConfig.delay || 0)
    }

    timeline.duration = totalDelay
    this.timelines.set(timelineId, timeline)

    return timelineId
  }

  /**
   * 播放时间线
   */
  async playTimeline(timelineId: string): Promise<void> {
    const timeline = this.timelines.get(timelineId)
    if (!timeline) {
      throw new WatermarkError(
        `Timeline ${timelineId} not found`,
        WatermarkErrorCode.ANIMATION_NOT_FOUND,
      )
    }

    timeline.status = 'running'

    // 播放时间线中的所有动画
    for (const animationId of timeline.animations) {
      await this.startAnimation(animationId)
    }
  }

  /**
   * 应用过渡效果
   */
  async applyTransition(
    instanceId: string,
    // eslint-disable-next-line ts/no-explicit-any
    fromState: Record<string, any>,
    // eslint-disable-next-line ts/no-explicit-any
    toState: Record<string, any>,
    config: TransitionConfig,
  ): Promise<string> {
    const transitionId = generateId('transition')

    // 创建过渡关键帧
    const keyframes = this.createTransitionKeyframes(fromState, toState)

    const elements = this.getInstanceElements(instanceId)
    if (elements.length === 0) {
      throw new WatermarkError(
        'No elements found for transition',
        WatermarkErrorCode.ANIMATION_FAILED,
      )
    }

    const animation = elements[0].animate(keyframes, {
      duration: config.duration || 300,
      easing: this.convertEasing(config.easing || 'ease'),
      fill: 'forwards',
    })

    this.animations.set(transitionId, animation)

    return transitionId
  }

  /**
   * 应用特效
   */
  async applyEffect(
    instanceId: string,
    effectType: string,
    config: EffectConfig,
  ): Promise<string> {
    const animationConfig: Partial<AnimationConfig> = {
      type: effectType as AnimationType,
      duration: config.duration,
      params: config.params,
    }

    switch (effectType) {
      case 'fade':
        return this.createAnimation(instanceId, 'fade', animationConfig)
      case 'slide':
        return this.createAnimation(instanceId, 'move', animationConfig)
      case 'scale':
        return this.createAnimation(instanceId, 'scale', animationConfig)
      case 'rotate':
        return this.createAnimation(instanceId, 'rotate', animationConfig)
      case 'bounce':
        return this.createAnimation(instanceId, 'bounce', animationConfig)
      case 'pulse':
        return this.createAnimation(instanceId, 'pulse', animationConfig)
      default:
        throw new WatermarkError(
          `Unknown effect type: ${effectType}`,
          WatermarkErrorCode.ANIMATION_FAILED,
        )
    }
  }

  /**
   * 获取动画状态
   */
  getAnimationState(animationId: string): AnimationState | null {
    return this.states.get(animationId) || null
  }

  /**
   * 获取时间线状态
   */
  getTimelineState(timelineId: string): AnimationTimeline | null {
    return this.timelines.get(timelineId) || null
  }

  /**
   * 添加事件监听器
   */
  addEventListener(
    animationId: string,
    callback: (event: AnimationEvent) => void,
  ): void {
    if (!this.callbacks.has(animationId)) {
      this.callbacks.set(animationId, [])
    }
    this.callbacks.get(animationId)!.push(callback)
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(
    animationId: string,
    callback: (event: AnimationEvent) => void,
  ): boolean {
    const callbacks = this.callbacks.get(animationId)
    if (!callbacks) {
      return false
    }

    const index = callbacks.indexOf(callback)
    if (index === -1) {
      return false
    }

    callbacks.splice(index, 1)
    if (callbacks.length === 0) {
      this.callbacks.delete(animationId)
    }

    return true
  }

  /**
   * 销毁时间线
   */
  async destroyTimeline(timelineId: string): Promise<void> {
    const timeline = this.timelines.get(timelineId)
    if (!timeline) {
      return
    }

    // 销毁时间线中的所有动画
    for (const animationId of timeline.animations) {
      await this.destroyAnimation(animationId)
    }

    this.timelines.delete(timelineId)
  }

  /**
   * 销毁引擎
   */
  async dispose(): Promise<void> {
    // 停止所有动画
    for (const animationId of this.animations.keys()) {
      await this.destroyAnimation(animationId)
    }

    // 销毁所有时间线
    for (const timelineId of this.timelines.keys()) {
      await this.destroyTimeline(timelineId)
    }

    // 取消RAF
    // if (this.rafId) {
    //   cancelAnimationFrame(this.rafId)
    // }

    // 清理数据
    this.animations.clear()
    this.timelines.clear()
    this.states.clear()
    this.callbacks.clear()

    // this.isRunning = false
  }

  // 私有方法

  private checkSupport(): boolean {
    return !!(window.Element && Element.prototype.animate)
  }

  private getInstanceElements(instanceId: string): Element[] {
    // 这里需要从实例管理器获取元素
    // 暂时返回空数组，实际实现时需要注入实例管理器
    return Array.from(
      document.querySelectorAll(`[data-watermark-instance="${instanceId}"]`),
    )
  }

  private createKeyframes(
    type: AnimationType,
    config: AnimationConfig,
  ): Keyframe[] {
    switch (type) {
      case 'fade':
        return this.createFadeKeyframes(config)
      case 'move':
        return this.createSlideKeyframes(config)
      case 'scale':
        return this.createScaleKeyframes(config)
      case 'rotate':
        return this.createRotateKeyframes(config)
      case 'bounce':
        return this.createBounceKeyframes(config)
      case 'pulse':
        return this.createPulseKeyframes(config)
      case 'swing':
        return this.createShakeKeyframes(config)
      default:
        return []
    }
  }

  private createFadeKeyframes(config: AnimationConfig): Keyframe[] {
    const direction = config.direction || 'in'

    if (direction === 'in') {
      return [
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: 1 },
      ]
    }
    else {
      return [
        { opacity: 1, offset: 0 },
        { opacity: 0, offset: 1 },
      ]
    }
  }

  private createSlideKeyframes(config: AnimationConfig): Keyframe[] {
    const moveParams = config.params?.move
    const direction = moveParams?.path || 'linear'
    const distance = moveParams?.x || 100

    const transforms: Record<string, string> = {
      linear: `translateX(${distance}px)`,
      left: `translateX(-${distance}px)`,
      right: `translateX(${distance}px)`,
      up: `translateY(-${distance}px)`,
      down: `translateY(${distance}px)`,
    }

    return [
      { transform: transforms[direction] || transforms.linear, offset: 0 },
      { transform: 'translate(0, 0)', offset: 1 },
    ]
  }

  private createScaleKeyframes(config: AnimationConfig): Keyframe[] {
    const scaleParams = config.params?.scale
    const fromScale = scaleParams?.from || 0
    const toScale = scaleParams?.to || 1

    return [
      { transform: `scale(${fromScale})`, offset: 0 },
      { transform: `scale(${toScale})`, offset: 1 },
    ]
  }

  private createRotateKeyframes(config: AnimationConfig): Keyframe[] {
    const rotateParams = config.params?.rotate
    const fromAngle = rotateParams?.from || 0
    const toAngle = rotateParams?.to || 360

    return [
      { transform: `rotate(${fromAngle}deg)`, offset: 0 },
      { transform: `rotate(${toAngle}deg)`, offset: 1 },
    ]
  }

  private createBounceKeyframes(_config: AnimationConfig): Keyframe[] {
    return [
      { transform: 'translateY(0)', offset: 0 },
      { transform: 'translateY(-30px)', offset: 0.25 },
      { transform: 'translateY(0)', offset: 0.5 },
      { transform: 'translateY(-15px)', offset: 0.75 },
      { transform: 'translateY(0)', offset: 1 },
    ]
  }

  private createPulseKeyframes(config: AnimationConfig): Keyframe[] {
    const pulseParams = config.params?.pulse
    const scale = pulseParams?.maxScale || 1.1

    return [
      { transform: 'scale(1)', offset: 0 },
      { transform: `scale(${scale})`, offset: 0.5 },
      { transform: 'scale(1)', offset: 1 },
    ]
  }

  private createShakeKeyframes(config: AnimationConfig): Keyframe[] {
    const swingParams = config.params?.swing
    const intensity = swingParams?.angle || 10

    return [
      { transform: 'translateX(0)', offset: 0 },
      { transform: `translateX(-${intensity}px)`, offset: 0.1 },
      { transform: `translateX(${intensity}px)`, offset: 0.2 },
      { transform: `translateX(-${intensity}px)`, offset: 0.3 },
      { transform: `translateX(${intensity}px)`, offset: 0.4 },
      { transform: `translateX(-${intensity}px)`, offset: 0.5 },
      { transform: `translateX(${intensity}px)`, offset: 0.6 },
      { transform: `translateX(-${intensity}px)`, offset: 0.7 },
      { transform: `translateX(${intensity}px)`, offset: 0.8 },
      { transform: `translateX(-${intensity}px)`, offset: 0.9 },
      { transform: 'translateX(0)', offset: 1 },
    ]
  }

  private createTransitionKeyframes(
    // eslint-disable-next-line ts/no-explicit-any
    fromState: Record<string, any>,
    // eslint-disable-next-line ts/no-explicit-any
    toState: Record<string, any>,
  ): Keyframe[] {
    return [fromState, toState]
  }

  // eslint-disable-next-line ts/no-explicit-any
  private convertEasing(easing: any): string {
    if (typeof easing === 'string') {
      return easing
    }

    if (typeof easing === 'function') {
      return 'ease'
    }

    // 转换自定义缓动函数
    switch (easing) {
      case 'ease-in-out':
        return 'cubic-bezier(0.4, 0, 0.2, 1)'
      case 'ease-in':
        return 'cubic-bezier(0.4, 0, 1, 1)'
      case 'ease-out':
        return 'cubic-bezier(0, 0, 0.2, 1)'
      default:
        return 'ease'
    }
  }

  private setupAnimationListeners(
    animation: Animation,
    animationId: string,
  ): void {
    const state = this.states.get(animationId)
    if (!state) {
      return
    }

    animation.addEventListener('finish', () => {
      state.status = 'completed'
      state.progress = 1
      state.endTime = Date.now()
      this.emitEvent(animationId, 'finish', {})
    })

    animation.addEventListener('cancel', () => {
      state.status = 'cancelled'
      this.emitEvent(animationId, 'cancel', {})
    })

    // 监听进度更新
    const updateProgress = () => {
      if (animation.currentTime !== null && state.duration > 0) {
        state.progress = Math.min(
          (animation.currentTime as number) / state.duration,
          1,
        )
        state.currentTime = animation.currentTime as number
        this.emitEvent(animationId, 'progress', {})
      }

      if (state.status === 'running') {
        requestAnimationFrame(updateProgress)
      }
    }

    if (state.status === 'running') {
      requestAnimationFrame(updateProgress)
    }
  }

  private emitEvent(
    animationId: string,
    type: AnimationEvent['type'],
    data: Partial<AnimationEvent>,
  ): void {
    const event: AnimationEvent = {
      type,
      animationId,
      timestamp: Date.now(),
      ...data,
    }

    const callbacks = this.callbacks.get(animationId) || []
    callbacks.forEach((callback) => {
      try {
        callback(event)
      }
      catch (error) {
        console.error('Animation event callback error:', error)
      }
    })
  }
}
