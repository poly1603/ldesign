// 核心功能
export { LottieManager, lottieManager } from './core/LottieManager'
export { LottieInstance } from './core/LottieInstance'
export { InstancePool } from './core/InstancePool'
export { CacheManager } from './core/CacheManager'
export { PerformanceMonitor } from './core/PerformanceMonitor'
export { AnimationSequence } from './core/AnimationSequence'
export { InteractiveController } from './core/InteractiveController'

// 高级功能
export { AudioSync } from './core/AudioSync'
export { TransitionManager } from './core/TransitionManager'
export { ThemeManager } from './core/ThemeManager'
export { DataBinding } from './core/DataBinding'
export { AccessibilityManager } from './core/AccessibilityManager'
export { PreloadQueue } from './core/PreloadQueue'
export { GestureController } from './core/GestureController'

// 高级功能类型
export type { AudioSyncConfig, AudioMarker } from './core/AudioSync'
export type { TransitionConfig, TransitionType, TransitionDirection, EasingFunction } from './core/TransitionManager'
export type { ThemeConfig, ColorMap, ColorReplaceOptions } from './core/ThemeManager'
export type { DataBindingConfig } from './core/DataBinding'
export type { AccessibilityConfig } from './core/AccessibilityManager'
export type { PreloadItem, PreloadProgress, PreloadOptions } from './core/PreloadQueue'
export type { GestureConfig, GestureType, GestureEvent } from './core/GestureController'

// 性能优化功能
export { WorkerManager, workerManager } from './core/WorkerManager'
export { VirtualRenderer } from './core/VirtualRenderer'
export { MemoryManager, memoryManager } from './core/MemoryManager'
export { BatchRenderer, batchRenderer } from './core/BatchRenderer'
export { AdaptiveFrameRate } from './core/AdaptiveFrameRate'

// 性能优化类型
export type { WorkerManagerConfig, WorkerTask } from './core/WorkerManager'
export type { VirtualRendererConfig, VirtualStats } from './core/VirtualRenderer'
export type { MemoryManagerConfig, MemoryStats, MemoryPressureEvent } from './core/MemoryManager'
export type { BatchRendererConfig, RenderTask } from './core/BatchRenderer'
export type { AdaptiveFrameRateConfig, FrameRateStats } from './core/AdaptiveFrameRate'

// 导出设备检测工具
export {
  DeviceDetector,
  ResponsiveObserver,
  getDeviceInfo,
  getRecommendedConfig,
  type DeviceType,
  type PerformanceTier,
  type DeviceInfo,
} from './utils/device'

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
 * 从���据快速创建并播放
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
