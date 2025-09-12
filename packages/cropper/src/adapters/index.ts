/**
 * @file 适配器统一导出
 * @description 导出所有框架适配器
 */

// 导入所有适配器类以避免循环依赖
import { BaseAdapter } from './base-adapter'
import { VueAdapter } from './vue-adapter'
import { ReactAdapter } from './react-adapter'
import { AngularAdapter } from './angular-adapter'
import { VanillaAdapter } from './vanilla-adapter'

// 基础适配器
export { BaseAdapter, AdapterState } from './base-adapter'
export type { AdapterOptions } from './base-adapter'

// Vue 3 适配器
export { VueAdapter, useVueCropper, VueCropperPlugin } from './vue-adapter'
export type { VueAdapterOptions } from './vue-adapter'

// React 适配器
export { ReactAdapter, createUseCropper, createCropperComponent, createWithCropper, createCropperContext } from './react-adapter'
export type {
  ReactAdapterOptions,
  UseCropperOptions,
  UseCropperReturn,
  CropperComponentProps,
  WithCropperProps,
  CropperContextValue
} from './react-adapter'

// Angular 适配器
export { AngularAdapter, createCropperService, createCropperComponent as createAngularCropperComponent, createCropperDirective, createCropperModule } from './angular-adapter'
export type {
  AngularAdapterOptions,
  CropperDirectiveConfig,
  CropperService,
  CropperComponentInterface,
  CropperModuleConfig
} from './angular-adapter'

// 原生JavaScript适配器
export { VanillaAdapter } from './vanilla-adapter'
export type { VanillaAdapterOptions } from './vanilla-adapter'

/**
 * 适配器工厂函数
 */
export class AdapterFactory {
  /**
   * 创建适配器实例
   * @param framework 框架类型
   * @param container 容器元素或选择器
   * @param options 配置选项
   */
  static create(
    framework: 'vue' | 'react' | 'angular' | 'vanilla',
    container: HTMLElement | string,
    options: any = {}
  ): BaseAdapter {
    // 动态导入以避免循环依赖
    switch (framework) {
      case 'vue': {
        const adapter = new VueAdapter(container, options)
        return adapter
      }
      case 'react': {
        const adapter = new ReactAdapter(container, options)
        return adapter
      }
      case 'angular': {
        const adapter = new AngularAdapter(container, options)
        return adapter
      }
      case 'vanilla': {
        const adapter = new VanillaAdapter(container, options)
        return adapter
      }
      default:
        throw new Error(`Unsupported framework: ${framework}`)
    }
  }

  /**
   * 检测当前环境的框架
   */
  static detectFramework(): string | null {
    if (typeof window === 'undefined') return null

    // 检测 Vue
    if ((window as any).Vue || (window as any).__VUE__) {
      return 'vue'
    }

    // 检测 React
    if ((window as any).React || document.querySelector('[data-reactroot]')) {
      return 'react'
    }

    // 检测 Angular
    if ((window as any).ng || document.querySelector('[ng-version]')) {
      return 'angular'
    }

    // 默认为原生JavaScript
    return 'vanilla'
  }

  /**
   * 自动创建适配器（根据环境检测）
   * @param container 容器元素或选择器
   * @param options 配置选项
   */
  static auto(container: HTMLElement | string, options: any = {}): BaseAdapter {
    const framework = AdapterFactory.detectFramework() || 'vanilla'
    return AdapterFactory.create(framework as any, container, options)
  }
}

/**
 * 适配器注册表
 */
export class AdapterRegistry {
  private static adapters = new Map<string, typeof BaseAdapter>()

  /**
   * 注册适配器
   * @param name 适配器名称
   * @param adapter 适配器类
   */
  static register(name: string, adapter: typeof BaseAdapter): void {
    AdapterRegistry.adapters.set(name, adapter)
  }

  /**
   * 获取适配器
   * @param name 适配器名称
   */
  static get(name: string): typeof BaseAdapter | undefined {
    return AdapterRegistry.adapters.get(name)
  }

  /**
   * 获取所有适配器
   */
  static getAll(): Map<string, typeof BaseAdapter> {
    return new Map(AdapterRegistry.adapters)
  }

  /**
   * 移除适配器
   * @param name 适配器名称
   */
  static unregister(name: string): boolean {
    return AdapterRegistry.adapters.delete(name)
  }

  /**
   * 清空所有适配器
   */
  static clear(): void {
    AdapterRegistry.adapters.clear()
  }
}

/**
 * 初始化适配器注册表
 */
export function initializeAdapterRegistry(): void {
  // 延迟注册，避免循环依赖
  if (typeof VueAdapter !== 'undefined') {
    AdapterRegistry.register('vue', VueAdapter)
  }
  if (typeof ReactAdapter !== 'undefined') {
    AdapterRegistry.register('react', ReactAdapter)
  }
  if (typeof AngularAdapter !== 'undefined') {
    AdapterRegistry.register('angular', AngularAdapter)
  }
  if (typeof VanillaAdapter !== 'undefined') {
    AdapterRegistry.register('vanilla', VanillaAdapter)
  }
}

/**
 * 默认导出适配器工厂
 */
export default AdapterFactory
