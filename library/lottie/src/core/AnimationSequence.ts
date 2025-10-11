import type { ILottieInstance, LottieConfig } from '../types'
import { lottieManager } from './LottieManager'

/**
 * 动画序列项
 */
export interface SequenceItem {
  /** 动画配置 */
  config: LottieConfig
  /** 延迟时间 (ms) */
  delay?: number
  /** 持续时间 (ms)，不设置则播放完整动画 */
  duration?: number
  /** 完成回调 */
  onComplete?: () => void
}

/**
 * 动画序列播放器
 * 用于按顺序播放多个动画
 */
export class AnimationSequence {
  private items: SequenceItem[] = []
  private instances: Map<number, ILottieInstance> = new Map()
  private currentIndex: number = -1
  private isPlaying: boolean = false
  private isPaused: boolean = false
  private timeouts: number[] = []

  constructor(items?: SequenceItem[]) {
    if (items) {
      this.items = items
    }
  }

  /**
   * 添加动画到序列
   */
  add(item: SequenceItem): this {
    this.items.push(item)
    return this
  }

  /**
   * 批量添加动画
   */
  addMultiple(items: SequenceItem[]): this {
    this.items.push(...items)
    return this
  }

  /**
   * 播放序列
   */
  async play(): Promise<void> {
    if (this.isPlaying) {
      console.warn('[AnimationSequence] Already playing')
      return
    }

    this.isPlaying = true
    this.isPaused = false
    this.currentIndex = 0

    await this.playNext()
  }

  /**
   * 暂停序列
   */
  pause(): void {
    if (!this.isPlaying || this.isPaused) return

    this.isPaused = true
    const currentInstance = this.instances.get(this.currentIndex)
    if (currentInstance) {
      currentInstance.pause()
    }

    // 清除所有定时器
    this.timeouts.forEach(id => clearTimeout(id))
    this.timeouts = []
  }

  /**
   * 恢复播放
   */
  resume(): void {
    if (!this.isPlaying || !this.isPaused) return

    this.isPaused = false
    const currentInstance = this.instances.get(this.currentIndex)
    if (currentInstance) {
      currentInstance.play()
    }
  }

  /**
   * 停止序列
   */
  stop(): void {
    this.isPlaying = false
    this.isPaused = false
    this.currentIndex = -1

    // 停止所有动画
    this.instances.forEach(instance => {
      try {
        instance.stop()
      } catch (error) {
        console.error('[AnimationSequence] Error stopping instance:', error)
      }
    })

    // 清除所有定时器
    this.timeouts.forEach(id => clearTimeout(id))
    this.timeouts = []
  }

  /**
   * 跳转到指定序列
   */
  async goTo(index: number): Promise<void> {
    if (index < 0 || index >= this.items.length) {
      throw new Error(`Index ${index} out of bounds`)
    }

    this.stop()
    this.currentIndex = index
    this.isPlaying = true
    await this.playNext()
  }

  /**
   * 播放下一个动画
   */
  private async playNext(): Promise<void> {
    if (!this.isPlaying || this.isPaused) return

    if (this.currentIndex >= this.items.length) {
      this.isPlaying = false
      return
    }

    const item = this.items[this.currentIndex]

    // 延迟
    if (item.delay && item.delay > 0) {
      await new Promise(resolve => {
        const timeoutId = window.setTimeout(resolve, item.delay)
        this.timeouts.push(timeoutId)
      })
    }

    if (!this.isPlaying || this.isPaused) return

    // 创建并播放动画
    const instance = lottieManager.create({
      ...item.config,
      autoplay: false,
      events: {
        ...item.config.events,
        complete: () => {
          item.config.events?.complete?.()
          item.onComplete?.()
        }
      }
    })

    this.instances.set(this.currentIndex, instance)

    try {
      await instance.load()
      instance.play()

      // 如果设置了持续时间，则在指定时间后停止
      if (item.duration) {
        await new Promise(resolve => {
          const timeoutId = window.setTimeout(() => {
            instance.stop()
            resolve(void 0)
          }, item.duration)
          this.timeouts.push(timeoutId)
        })
      } else {
        // 等待动画完成
        await new Promise<void>(resolve => {
          instance.on('complete', () => resolve())
        })
      }

      // 播放下一个
      this.currentIndex++
      await this.playNext()
    } catch (error) {
      console.error('[AnimationSequence] Error playing animation:', error)
      this.currentIndex++
      await this.playNext()
    }
  }

  /**
   * 销毁序列
   */
  destroy(): void {
    this.stop()

    // 销毁所有实例
    this.instances.forEach((instance, index) => {
      try {
        lottieManager.destroy(instance.id)
      } catch (error) {
        console.error(`[AnimationSequence] Error destroying instance ${index}:`, error)
      }
    })

    this.instances.clear()
    this.items = []
  }

  /**
   * 获取当前序列索引
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * 获取序列总数
   */
  getLength(): number {
    return this.items.length
  }

  /**
   * 是否正在播放
   */
  getIsPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * 是否已暂停
   */
  getIsPaused(): boolean {
    return this.isPaused
  }
}
