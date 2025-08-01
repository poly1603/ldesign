import type { ErrorInterceptor, InterceptorManager } from '@/types'

/**
 * 拦截器项
 */
interface InterceptorItem<T> {
  fulfilled: T
  rejected?: ErrorInterceptor
}

/**
 * 拦截器管理器实现
 */
export class InterceptorManagerImpl<T> implements InterceptorManager<T> {
  private interceptors: Array<InterceptorItem<T> | null> = []

  /**
   * 添加拦截器
   * @param fulfilled 成功处理函数
   * @param rejected 错误处理函数
   * @returns 拦截器 ID
   */
  use(fulfilled: T, rejected?: ErrorInterceptor): number {
    this.interceptors.push({
      fulfilled,
      rejected,
    })
    return this.interceptors.length - 1
  }

  /**
   * 移除拦截器
   * @param id 拦截器 ID
   */
  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }

  /**
   * 清空所有拦截器
   */
  clear(): void {
    this.interceptors = []
  }

  /**
   * 遍历拦截器
   * @param fn 遍历函数
   */
  forEach(fn: (interceptor: InterceptorItem<T>) => void): void {
    this.interceptors.forEach((interceptor) => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }

  /**
   * 获取所有有效的拦截器
   */
  getInterceptors(): Array<InterceptorItem<T>> {
    return this.interceptors.filter((interceptor): interceptor is InterceptorItem<T> =>
      interceptor !== null,
    )
  }
}
