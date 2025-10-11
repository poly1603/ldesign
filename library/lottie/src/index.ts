export { LottieManager, lottieManager } from './core/LottieManager'
export { LottieInstance } from './core/LottieInstance'
export { InstancePool } from './core/InstancePool'
export { CacheManager } from './core/CacheManager'
export { PerformanceMonitor } from './core/PerformanceMonitor'

export type * from './types'

/**
 * 简化的 API
 */
import { lottieManager } from './core/LottieManager'
import type { LottieConfig, ILottieInstance } from './types'

/**
 * 创建 Lottie 实例的简化函数
 */
export function createLottie(config: LottieConfig): ILottieInstance {
  const instance = lottieManager.create(config)

  // 自动加载
  instance.load().catch(err => {
    console.error('[Lottie] Failed to load animation:', err)
  })

  return instance
}

/**
 * 从路径快速创建并播放
 */
export async function loadLottie(
  container: HTMLElement | string,
  path: string,
  options?: Partial<LottieConfig>
): Promise<ILottieInstance> {
  const instance = lottieManager.create({
    container,
    path,
    autoplay: true,
    ...options,
  })

  await instance.load()
  return instance
}

/**
 * 从数据快速创建并播放
 */
export function loadLottieFromData(
  container: HTMLElement | string,
  animationData: any,
  options?: Partial<LottieConfig>
): ILottieInstance {
  const instance = lottieManager.create({
    container,
    animationData,
    autoplay: true,
    ...options,
  })

  instance.load().catch(err => {
    console.error('[Lottie] Failed to load animation:', err)
  })

  return instance
}

/**
 * 默认导出
 */
export default {
  manager: lottieManager,
  create: createLottie,
  loadFromPath: loadLottie,
  loadFromData: loadLottieFromData,
}
