import type { ILottieInstance, PoolStats } from '../types'

/**
 * 实例池 - 用于管理和复用 Lottie 实例
 */
export class InstancePool {
  private instances: Map<string, ILottieInstance> = new Map()
  private activeInstances: Set<string> = new Set()
  private idleInstances: Set<string> = new Set()
  private maxSize: number
  private peakSize: number = 0

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize
  }

  /**
   * 添加实例到池中
   */
  add(instance: ILottieInstance): boolean {
    if (this.instances.size >= this.maxSize) {
      console.warn('[InstancePool] Pool is full, cannot add more instances')
      return false
    }

    this.instances.set(instance.id, instance)
    this.idleInstances.add(instance.id)

    // 更新峰值
    if (this.instances.size > this.peakSize) {
      this.peakSize = this.instances.size
    }

    return true
  }

  /**
   * 从池中获取实例
   */
  get(id: string): ILottieInstance | undefined {
    return this.instances.get(id)
  }

  /**
   * 将实例标记为活跃
   */
  activate(id: string): boolean {
    if (!this.instances.has(id)) return false

    this.idleInstances.delete(id)
    this.activeInstances.add(id)
    return true
  }

  /**
   * 将实例标记为空闲
   */
  deactivate(id: string): boolean {
    if (!this.instances.has(id)) return false

    this.activeInstances.delete(id)
    this.idleInstances.add(id)
    return true
  }

  /**
   * 从池中移除实例
   */
  remove(id: string): boolean {
    const instance = this.instances.get(id)
    if (!instance) return false

    // 销毁实例
    try {
      instance.destroy()
    } catch (error) {
      console.error('[InstancePool] Error destroying instance:', error)
    }

    this.instances.delete(id)
    this.activeInstances.delete(id)
    this.idleInstances.delete(id)
    return true
  }

  /**
   * 清理空闲实例
   */
  cleanIdle(count?: number): number {
    const toClean = count ?? this.idleInstances.size
    let cleaned = 0

    const idleArray = Array.from(this.idleInstances)
    for (let i = 0; i < Math.min(toClean, idleArray.length); i++) {
      if (this.remove(idleArray[i])) {
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * 获取所有活跃实例
   */
  getActiveInstances(): ILottieInstance[] {
    return Array.from(this.activeInstances)
      .map(id => this.instances.get(id))
      .filter((instance): instance is ILottieInstance => instance !== undefined)
  }

  /**
   * 获取所有空闲实例
   */
  getIdleInstances(): ILottieInstance[] {
    return Array.from(this.idleInstances)
      .map(id => this.instances.get(id))
      .filter((instance): instance is ILottieInstance => instance !== undefined)
  }

  /**
   * 获取池统计信息
   */
  getStats(): PoolStats {
    return {
      total: this.instances.size,
      active: this.activeInstances.size,
      idle: this.idleInstances.size,
      peak: this.peakSize,
    }
  }

  /**
   * 检查是否已满
   */
  isFull(): boolean {
    return this.instances.size >= this.maxSize
  }

  /**
   * 清空池
   */
  clear(): void {
    // 销毁所有实例
    this.instances.forEach(instance => {
      try {
        instance.destroy()
      } catch (error) {
        console.error('[InstancePool] Error destroying instance:', error)
      }
    })

    this.instances.clear()
    this.activeInstances.clear()
    this.idleInstances.clear()
    this.peakSize = 0
  }

  /**
   * 销毁池
   */
  destroy(): void {
    this.clear()
  }
}
