import type { ErrorInterceptor, InterceptorManager } from '../types'

/**
 * 拦截器项
 */
interface InterceptorItem<T> {
  fulfilled: T
  rejected?: ErrorInterceptor
}

/**
 * 拦截器管理器实现（优化版）
 *
 * 优化点：
 * 1. 使用紧凑数组替代稀疏数组，减少内存占用
 * 2. 使用 Map 存储 ID 映射，提高查找效率
 * 3. 删除时真正移除元素，避免内存泄漏
 * 4. 优化遍历性能，无需检查 null 值
 */
export class InterceptorManagerImpl<T> implements InterceptorManager<T> {
  // 使用紧凑数组存储拦截器
  private interceptors: Array<InterceptorItem<T>> = []
  // ID 到数组索引的映射
  private idMap = new Map<number, number>()
  // 下一个可用的 ID
  private nextId = 0

  /**
   * 添加拦截器
   * @param fulfilled 成功处理函数
   * @param rejected 错误处理函数
   * @returns 拦截器 ID
   */
  use(fulfilled: T, rejected?: ErrorInterceptor): number {
    const id = this.nextId++
    const index = this.interceptors.length

    this.interceptors.push({
      fulfilled,
      rejected,
    })

    this.idMap.set(id, index)
    return id
  }

  /**
   * 移除拦截器（优化版）
   * @param id 拦截器 ID
   */
  eject(id: number): void {
    const index = this.idMap.get(id)
    if (index === undefined) {
      return
    }

    // 移除元素（使用 splice 真正删除，而不是设为 null）
    this.interceptors.splice(index, 1)
    this.idMap.delete(id)

    // 更新后续元素的索引映射
    for (const [mappedId, mappedIndex] of this.idMap.entries()) {
      if (mappedIndex > index) {
        this.idMap.set(mappedId, mappedIndex - 1)
      }
    }
  }

  /**
   * 清空所有拦截器
   */
  clear(): void {
    this.interceptors = []
    this.idMap.clear()
  }

  /**
   * 遍历拦截器（优化版 - 无需检查 null）
   * @param fn 遍历函数
   */
  forEach(fn: (interceptor: InterceptorItem<T>) => void): void {
    // 直接遍历，无需检查 null
    for (const interceptor of this.interceptors) {
      fn(interceptor)
    }
  }

  /**
   * 获取所有有效的拦截器（优化版）
   */
  getInterceptors(): Array<InterceptorItem<T>> {
    // 直接返回数组副本，无需过滤
    return [...this.interceptors]
  }

  /**
   * 获取拦截器数量
   */
  size(): number {
    return this.interceptors.length
  }

  /**
   * 检查是否有拦截器
   */
  isEmpty(): boolean {
    return this.interceptors.length === 0
  }
}
