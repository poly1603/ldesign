/**
 * 动画引擎
 */

import type {
  WatermarkInstance,
  AnimationConfig,
  AnimationType
} from '../types'

import { WatermarkError, WatermarkErrorCode, ErrorSeverity } from '../types/error'
import { generateId } from '../utils/id-generator'

/**
 * 动画引擎
 * 负责水印的动画效果和过渡管理
 */
export class AnimationEngine implements IAnimationEngine {
  private animations = new Map<string, Animation>()
  private timelines = new Map<string, AnimationTimeline>()
  private states = new Map<string, AnimationState>()
  private callbacks = new Map<string, ((event: AnimationEvent) => void)[]>()
  private rafId?: number
  private isRunning = false
  private startTime = 0
  private pausedTime = 0
  private config: AnimationConfig

  constructor(config: AnimationConfig = {}) {
    this.config = {
      enabled: true,
      duration: 1000,
      easing: 'ease-in-out',
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'forwards',
      ...config
    }
  }

  /**
   * 初始化动画引擎
   */
  async init(): Promise<void> {
    // 检查浏览器支持
    if (!this.checkSupport()) {
      throw new WatermarkError(
        WatermarkErrorCode.BROWSER_NOT_SUPPORTED,
        'Animation not supported in this browser',
        ErrorSeverity.HIGH
      )
    }
  }

  /**
   * 创建动画
   */
  async createAnimation(
    instanceId: string,
    type: AnimationType,
    config: Partial<AnimationConfig> = {}
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
      iterations: animationConfig.iterations || 1,
      currentIteration: 0,
      direction: animationConfig.direction || 'normal',
      startTime: 0,
      endTime: 0
    }

    this.states.set(animationId, state)

    // 创建关键帧
    const keyframes = this.createKeyframes(type, animationConfig)

    // 创建Web Animation API动画
    const elements = this.getInstanceElements(instanceId)
    if (elements.length === 0) {
      throw new WatermarkError(
        WatermarkErrorCode.ANIMATION_FAILED,
        'No elements found for animation',
        ErrorSeverity.MEDIUM
      )
    }

    const animation = elements[0].animate(keyframes, {
      duration: animationConfig.duration,
      easing: this.convertEasing(animationConfig.easing),
      delay: animationConfig.delay,
      iterations: animationConfig.iterations,
      direction: animationConfig.direction,
      fill: animationConfig.fillMode
    })

    // 设置事件监听
    this.setupAnimationListeners(animation, animationId)

    this.animations.set(animationId, animation)

    return animationId
  }

  /**
   * 播放动画
   */
  async playAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    const state = this.states.get(animationId)

    if (!animation || !state) {
      throw new WatermarkError(
        WatermarkErrorCode.ANIMATION_NOT_FOUND,
        `Animation ${animationId} not found`,
        ErrorSeverity.MEDIUM
      )
    }

    state.status = 'running'
    state.startTime = Date.now()

    animation.play()

    this.emitEvent(animationId, 'start', { state })
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
    this.pausedTime = Date.now()

    animation.pause()

    this.emitEvent(animationId, 'pause', { state })
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

    state.status = 'stopped'
    state.progress = 0
    state.currentTime = 0

    animation.cancel()

    this.emitEvent(animationId, 'stop', { state })
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

    state.status = 'finished'
    state.progress = 1
    state.endTime = Date.now()

    animation.finish()

    this.emitEvent(animationId, 'finish', { state })
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
    }>
  ): Promise<string> {
    const timelineId = generateId('timeline')

    const timeline: AnimationTimeline = {
      id: timelineId,
      instanceId,
      animations: [],
      duration: 0,
      status: 'idle',
      progress: 0,
      currentTime: 0
    }

    // 创建时间线中的动画
    let totalDelay = 0
    for (const animConfig of animations) {
      const animationId = await this.createAnimation(
        instanceId,
        animConfig.type,
        {
          ...animConfig.config,
          delay: totalDelay + (animConfig.delay || 0)
        }
      )

      timeline.animations.push(animationId)
      totalDelay += (animConfig.config.duration || 1000) + (animConfig.delay || 0)
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
        WatermarkErrorCode.ANIMATION_NOT_FOUND,
        `Timeline ${timelineId} not found`,
        ErrorSeverity.MEDIUM
      )
    }

    timeline.status = 'running'

    // 播放时间线中的所有动画
    for (const animationId of timeline.animations) {
      await this.playAnimation(animationId)
    }
  }

  /**
   * 应用过渡效果
   */
  async applyTransition(
    instanceId: string,
    fromState: Record<string, any>,
    toState: Record<string, any>,
    config: TransitionConfig
  ): Promise<string> {
    const transitionId = generateId('transition')

    // 创建过渡关键帧
    const keyframes = this.createTransitionKeyframes(fromState, toState)

    const elements = this.getInstanceElements(instanceId)
    if (elements.length === 0) {
      throw new WatermarkError(
        WatermarkErrorCode.ANIMATION_FAILED,
        'No elements found for transition',
        ErrorSeverity.MEDIUM
      )
    }

    const animation = elements[0].animate(keyframes, {
      duration: config.duration || 300,
      easing: this.convertEasing(config.easing || 'ease'),
      fill: 'forwards'
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
    config: EffectConfig
  ): Promise<string> {
    const effectId = generateId('effect')

    switch (effectType) {
      case 'fade':
        return this.createAnimation(instanceId, 'fade', config)
      case 'slide':
        return this.createAnimation(instanceId, 'slide', config)
      case 'scale':
        return this.createAnimation(instanceId, 'scale', config)
      case 'rotate':
        return this.createAnimation(instanceId, 'rotate', config)
      case 'bounce':
        return this.createAnimation(instanceId, 'bounce', config)
      case 'pulse':
        return this.createAnimation(instanceId, 'pulse', config)
      default:
        throw new WatermarkError(
          WatermarkErrorCode.ANIMATION_FAILED,
          `Unknown effect type: ${effectType}`,
          ErrorSeverity.MEDIUM
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
    callback: (event: AnimationEvent) => void
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
    callback: (event: AnimationEvent) => void
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
   * 销毁动画
   */
  async destroyAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    if (animation) {
      animation.cancel()
      this.animations.delete(animationId)
    }

    this.states.delete(animationId)
    this.callbacks.delete(animationId)
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
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }

    // 清理数据
    this.animations.clear()
    this.timelines.clear()
    this.states.clear()
    this.callbacks.clear()

    this.isRunning = false
  }

  // 私有方法

  private checkSupport(): boolean {
    return !!(window.Element && Element.prototype.animate)
  }

  private getInstanceElements(instanceId: string): Element[] {
    // 这里需要从实例管理器获取元素
    // 暂时返回空数组，实际实现时需要注入实例管理器
    return Array.from(document.querySelectorAll(`[data-watermark-instance="${instanceId}"]`))
  }

  private createKeyframes(type: AnimationType, config: AnimationConfig): Keyframe[] {
    switch (type) {
      case 'fade':
        return this.createFadeKeyframes(config)
      case 'slide':
        return this.createSlideKeyframes(config)
      case 'scale':
        return this.createScaleKeyframes(config)
      case 'rotate':
        return this.createRotateKeyframes(config)
      case 'bounce':
        return this.createBounceKeyframes(config)
      case 'pulse':
        return this.createPulseKeyframes(config)
      case 'shake':
        return this.createShakeKeyframes(config)
      case 'flip':
        return this.createFlipKeyframes(config)
      case 'zoom':
        return this.createZoomKeyframes(config)
      case 'custom':
        return config.keyframes || []
      default:
        return []
    }
  }

  private createFadeKeyframes(config: AnimationConfig): Keyframe[] {
    const direction = config.direction || 'in'

    if (direction === 'in') {
      return [
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: 1 }
      ]
    } else {
      return [
        { opacity: 1, offset: 0 },
        { opacity: 0, offset: 1 }
      ]
    }
  }

  private createSlideKeyframes(config: AnimationConfig): Keyframe[] {
    const direction = config.slideDirection || 'left'
    const distance = config.slideDistance || '100px'

    const transforms: Record<string, string> = {
      left: `translateX(-${distance})`,
      right: `translateX(${distance})`,
      up: `translateY(-${distance})`,
      down: `translateY(${distance})`
    }

    return [
      { transform: transforms[direction], offset: 0 },
      { transform: 'translate(0, 0)', offset: 1 }
    ]
  }

  private createScaleKeyframes(config: AnimationConfig): Keyframe[] {
    const fromScale = config.fromScale || 0
    const toScale = config.toScale || 1

    return [
      { transform: `scale(${fromScale})`, offset: 0 },
      { transform: `scale(${toScale})`, offset: 1 }
    ]
  }

  private createRotateKeyframes(config: AnimationConfig): Keyframe[] {
    const fromAngle = config.fromAngle || 0
    const toAngle = config.toAngle || 360

    return [
      { transform: `rotate(${fromAngle}deg)`, offset: 0 },
      { transform: `rotate(${toAngle}deg)`, offset: 1 }
    ]
  }

  private createBounceKeyframes(config: AnimationConfig): Keyframe[] {
    return [
      { transform: 'translateY(0)', offset: 0 },
      { transform: 'translateY(-30px)', offset: 0.25 },
      { transform: 'translateY(0)', offset: 0.5 },
      { transform: 'translateY(-15px)', offset: 0.75 },
      { transform: 'translateY(0)', offset: 1 }
    ]
  }

  private createPulseKeyframes(config: AnimationConfig): Keyframe[] {
    const scale = config.pulseScale || 1.1

    return [
      { transform: 'scale(1)', offset: 0 },
      { transform: `scale(${scale})`, offset: 0.5 },
      { transform: 'scale(1)', offset: 1 }
    ]
  }

  private createShakeKeyframes(config: AnimationConfig): Keyframe[] {
    const intensity = config.shakeIntensity || 10

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
      { transform: 'translateX(0)', offset: 1 }
    ]
  }

  private createFlipKeyframes(config: AnimationConfig): Keyframe[] {
    const axis = config.flipAxis || 'x'

    if (axis === 'x') {
      return [
        { transform: 'rotateX(0deg)', offset: 0 },
        { transform: 'rotateX(180deg)', offset: 1 }
      ]
    } else {
      return [
        { transform: 'rotateY(0deg)', offset: 0 },
        { transform: 'rotateY(180deg)', offset: 1 }
      ]
    }
  }

  private createZoomKeyframes(config: AnimationConfig): Keyframe[] {
    const direction = config.zoomDirection || 'in'

    if (direction === 'in') {
      return [
        { transform: 'scale(0)', offset: 0 },
        { transform: 'scale(1)', offset: 1 }
      ]
    } else {
      return [
        { transform: 'scale(1)', offset: 0 },
        { transform: 'scale(0)', offset: 1 }
      ]
    }
  }

  private createTransitionKeyframes(
    fromState: Record<string, any>,
    toState: Record<string, any>
  ): Keyframe[] {
    return [fromState, toState]
  }

  private convertEasing(easing: AnimationEasing | string): string {
    if (typeof easing === 'string') {
      return easing
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

  private setupAnimationListeners(animation: Animation, animationId: string): void {
    const state = this.states.get(animationId)
    if (!state) {
      return
    }

    animation.addEventListener('finish', () => {
      state.status = 'finished'
      state.progress = 1
      state.endTime = Date.now()
      this.emitEvent(animationId, 'finish', { state })
    })

    animation.addEventListener('cancel', () => {
      state.status = 'cancelled'
      this.emitEvent(animationId, 'cancel', { state })
    })

    // 监听进度更新
    const updateProgress = () => {
      if (animation.currentTime !== null && state.duration > 0) {
        state.progress = Math.min(animation.currentTime / state.duration, 1)
        state.currentTime = animation.currentTime
        this.emitEvent(animationId, 'progress', { state })
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
    data: Partial<AnimationEvent>
  ): void {
    const event: AnimationEvent = {
      type,
      animationId,
      timestamp: Date.now(),
      ...data
    }

    const callbacks = this.callbacks.get(animationId) || []
    callbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Animation event callback error:', error)
      }
    })
  }
}