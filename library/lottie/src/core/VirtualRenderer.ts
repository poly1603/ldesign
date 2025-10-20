/**
 * 虚拟化渲染器
 * 只渲染可视区域内的动画，大幅减少内存和CPU占用
 */

import type { ILottieInstance } from '../types'

export interface VirtualRendererConfig {
  /** 根元素（默认为 viewport） */
  root?: HTMLElement | null
  /** 根边距（提前加载距离） */
  rootMargin?: string
  /** 可见性阈值 */
  threshold?: number | number[]
  /** 是否自动暂停不可见动画 */
  autoPause?: boolean
  /** 是否在不可见时停止而非暂停 */
  stopOnInvisible?: boolean
}

export interface VirtualStats {
  totalInstances: number
  visibleInstances: number
  hiddenInstances: number
  memorySaved: number // MB
}

/**
 * 虚拟化渲染器
 * 使用 Intersection Observer 管理可见性
 */
export class VirtualRenderer {
  private observer: IntersectionObserver | null = null
  private instances = new Map<string, ILottieInstance>()
  private visibleInstances = new Set<string>()
  private config: Required<VirtualRendererConfig>
  private isEnabled = true

  constructor(config?: VirtualRendererConfig) {
    this.config = {
      root: config?.root ?? null,
      rootMargin: config?.rootMargin ?? '50px',
      threshold: config?.threshold ?? 0.1,
      autoPause: config?.autoPause ?? true,
      stopOnInvisible: config?.stopOnInvisible ?? false
    }

    this.init()
  }

  /**
   * 初始化 Intersection Observer
   */
  private init(): void {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('[VirtualRenderer] IntersectionObserver not supported')
      this.isEnabled = false
      return
    }

    try {
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          root: this.config.root,
          rootMargin: this.config.rootMargin,
          threshold: this.config.threshold
        }
      )
    } catch (error) {
      console.error('[VirtualRenderer] Failed to create IntersectionObserver:', error)
      this.isEnabled = false
    }
  }

  /**
   * 处理可见性变化
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      const element = entry.target as HTMLElement
      const instanceId = element.dataset.lottieInstanceId
      
      if (!instanceId) return

      const instance = this.instances.get(instanceId)
      if (!instance) return

      if (entry.isIntersecting) {
        // 进入视口
        this.onVisible(instance)
      } else {
        // 离开视口
        this.onHidden(instance)
      }
    })
  }

  /**
   * 动画进入视口
   */
  private onVisible(instance: ILottieInstance): void {
    if (this.visibleInstances.has(instance.id)) {
      return // 已经可见
    }

    console.log(`[VirtualRenderer] Instance ${instance.id} became visible`)
    
    this.visibleInstances.add(instance.id)

    // 恢复播放
    if (this.config.autoPause) {
      if (instance.state === 'paused' || instance.state === 'stopped') {
        // 检查是否应该自动播放
        if (instance.config.autoplay !== false) {
          instance.play()
        }
      }
    }
  }

  /**
   * 动画离开视口
   */
  private onHidden(instance: ILottieInstance): void {
    if (!this.visibleInstances.has(instance.id)) {
      return // 已经隐藏
    }

    console.log(`[VirtualRenderer] Instance ${instance.id} became hidden`)
    
    this.visibleInstances.delete(instance.id)

    // 暂停或停止
    if (this.config.autoPause && instance.state === 'playing') {
      if (this.config.stopOnInvisible) {
        instance.stop()
      } else {
        instance.pause()
      }
    }
  }

  /**
   * 注册实例
   */
  register(instance: ILottieInstance): void {
    if (!this.isEnabled || !this.observer) {
      return
    }

    if (!instance.container) {
      console.warn('[VirtualRenderer] Cannot register instance without container')
      return
    }

    // 添加标识
    instance.container.dataset.lottieInstanceId = instance.id

    // 开始观察
    this.observer.observe(instance.container)
    this.instances.set(instance.id, instance)

    console.log(`[VirtualRenderer] Registered instance ${instance.id}`)
  }

  /**
   * 取消注册实例
   */
  unregister(instanceId: string): void {
    if (!this.isEnabled || !this.observer) {
      return
    }

    const instance = this.instances.get(instanceId)
    if (!instance) {
      return
    }

    // 停止观察
    if (instance.container) {
      this.observer.unobserve(instance.container)
      delete instance.container.dataset.lottieInstanceId
    }

    // 移除记录
    this.instances.delete(instanceId)
    this.visibleInstances.delete(instanceId)

    console.log(`[VirtualRenderer] Unregistered instance ${instanceId}`)
  }

  /**
   * 批量注册实例
   */
  registerAll(instances: ILottieInstance[]): void {
    instances.forEach(instance => this.register(instance))
  }

  /**
   * 批量取消注册
   */
  unregisterAll(): void {
    const instanceIds = Array.from(this.instances.keys())
    instanceIds.forEach(id => this.unregister(id))
  }

  /**
   * 检查实例是否可见
   */
  isVisible(instanceId: string): boolean {
    return this.visibleInstances.has(instanceId)
  }

  /**
   * 获取可见实例列表
   */
  getVisibleInstances(): ILottieInstance[] {
    return Array.from(this.visibleInstances)
      .map(id => this.instances.get(id))
      .filter((instance): instance is ILottieInstance => instance !== undefined)
  }

  /**
   * 获取隐藏实例列表
   */
  getHiddenInstances(): ILottieInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => !this.visibleInstances.has(instance.id))
  }

  /**
   * 获取统计信息
   */
  getStats(): VirtualStats {
    const hidden = this.instances.size - this.visibleInstances.size
    
    // 估算节省的内存（每个隐藏实例约节省 5-10MB）
    const memorySaved = hidden * 7.5

    return {
      totalInstances: this.instances.size,
      visibleInstances: this.visibleInstances.size,
      hiddenInstances: hidden,
      memorySaved: Math.round(memorySaved * 100) / 100
    }
  }

  /**
   * 启用虚拟化
   */
  enable(): void {
    if (!this.observer) {
      this.init()
    }
    this.isEnabled = true
  }

  /**
   * 禁用虚拟化
   */
  disable(): void {
    this.isEnabled = false
    
    // 恢复所有暂停的动画
    for (const instance of this.instances.values()) {
      if (instance.state === 'paused' && instance.config.autoplay) {
        instance.play()
      }
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<VirtualRendererConfig>): void {
    Object.assign(this.config, config)

    // 如果修改了 Observer 配置，需要重新初始化
    if (
      config.root !== undefined ||
      config.rootMargin !== undefined ||
      config.threshold !== undefined
    ) {
      this.destroy()
      this.init()
      
      // 重新注册所有实例
      const instances = Array.from(this.instances.values())
      this.instances.clear()
      this.visibleInstances.clear()
      instances.forEach(instance => this.register(instance))
    }
  }

  /**
   * 手动触发可见性检查
   */
  refresh(): void {
    if (!this.observer) return

    // 断开并重新连接所有实例
    for (const instance of this.instances.values()) {
      if (instance.container) {
        this.observer.unobserve(instance.container)
        this.observer.observe(instance.container)
      }
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }

    this.instances.clear()
    this.visibleInstances.clear()
    this.isEnabled = false

    console.log('[VirtualRenderer] Destroyed')
  }
}


