/**
 * @ldesign/cropper 多框架适配器入口
 * 
 * 导出所有框架适配器和相关工具
 */

// ============================================================================
// 适配器导出
// ============================================================================

// Vue 3 适配器
export {
  Vue3Adapter,
  createVue3Adapter,
  vueAdapter,
  useCropper as useVueCropper
} from './vue';

// React 适配器
export {
  ReactCropperAdapter,
  createReactAdapter,
  reactAdapter,
  useCropper as useReactCropper,
  LCropper as ReactLCropper
} from './react';

// Angular 适配器
export {
  AngularCropperAdapter,
  createAngularAdapter,
  angularAdapter,
  LCropperModule,
  LCropperComponent,
  LCropperDirective,
  LCropperService,
  CropDataPipe
} from './angular';

// ============================================================================
// 类型导出
// ============================================================================

export type {
  // 通用适配器类型
  FrameworkType,
  BaseAdapter,
  ComponentAdapter,
  AdapterConfig,
  AdapterFactory,
  AdapterEvent,
  AdapterEventType,
  AdapterEventHandler,
  FrameworkDetection,
  AdapterRegistration,

  // Vue 适配器类型
  VueCropperProps,
  VueCropperEvents,
  VueCropperComposable,
  VueAdapter,

  // React 适配器类型
  ReactCropperProps,
  ReactCropperHook,
  ReactAdapter,

  // Angular 适配器类型
  AngularCropperInputs,
  AngularCropperOutputs,
  AngularCropperService,
  AngularAdapter
} from '../types/adapters';

// ============================================================================
// 适配器工厂
// ============================================================================

import { Vue3Adapter } from './vue';
import { ReactCropperAdapter } from './react';
import { AngularCropperAdapter } from './angular';
import type { AdapterFactory, AdapterConfig, FrameworkType, FrameworkDetection } from '../types/adapters';

/**
 * 适配器工厂实现
 */
export class CropperAdapterFactory implements AdapterFactory {
  /**
   * 创建Vue适配器
   */
  createVueAdapter(config?: AdapterConfig): Vue3Adapter {
    return new Vue3Adapter(config);
  }

  /**
   * 创建React适配器
   */
  createReactAdapter(config?: AdapterConfig): ReactCropperAdapter {
    return new ReactCropperAdapter(config);
  }

  /**
   * 创建Angular适配器
   */
  createAngularAdapter(config?: AdapterConfig): AngularCropperAdapter {
    return new AngularCropperAdapter(config);
  }

  /**
   * 根据框架类型创建适配器
   */
  createAdapter(framework: FrameworkType, config?: AdapterConfig): any {
    switch (framework) {
      case 'vue':
        return this.createVueAdapter(config);
      case 'react':
        return this.createReactAdapter(config);
      case 'angular':
        return this.createAngularAdapter(config);
      case 'vanilla':
        return { framework: 'vanilla', version: '1.0.0', supported: true }; // 原生JS返回简单对象
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }
}

/**
 * 默认适配器工厂实例
 */
export const adapterFactory = new CropperAdapterFactory();

// ============================================================================
// 框架检测工具
// ============================================================================

/**
 * 检测当前运行环境的框架
 */
export function detectFramework(): FrameworkDetection {
  // 检测Vue
  if (typeof window !== 'undefined') {
    // Vue 3
    if ((window as any).Vue && (window as any).Vue.version?.startsWith('3.')) {
      return {
        framework: 'vue',
        version: (window as any).Vue.version,
        supported: true,
        confidence: 0.9
      };
    }

    // Vue 2 (不支持)
    if ((window as any).Vue && (window as any).Vue.version?.startsWith('2.')) {
      return {
        framework: 'vue',
        version: (window as any).Vue.version,
        supported: false,
        confidence: 0.9
      };
    }
  }

  // 检测React
  if (typeof window !== 'undefined' && (window as any).React) {
    return {
      framework: 'react',
      version: (window as any).React.version || 'unknown',
      supported: true,
      confidence: 0.9
    };
  }

  // 检测Angular
  if (typeof window !== 'undefined') {
    // Angular通过ng全局对象检测
    if ((window as any).ng || (window as any).getAllAngularRootElements) {
      return {
        framework: 'angular',
        version: 'unknown',
        supported: true,
        confidence: 0.8
      };
    }
  }

  // 检测模块环境（仅在非测试环境下）
  if (typeof module !== 'undefined' && module.exports && typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
      // 尝试检测Vue
      require.resolve('vue');
      return {
        framework: 'vue',
        version: 'unknown',
        supported: true,
        confidence: 0.7
      };
    } catch { }

    try {
      // 尝试检测React
      require.resolve('react');
      return {
        framework: 'react',
        version: 'unknown',
        supported: true,
        confidence: 0.7
      };
    } catch { }

    try {
      // 尝试检测Angular
      require.resolve('@angular/core');
      return {
        framework: 'angular',
        version: 'unknown',
        supported: true,
        confidence: 0.7
      };
    } catch { }
  }

  // 默认为原生JS
  return {
    framework: 'vanilla',
    version: null,
    supported: true,
    confidence: 0.5
  };
}

/**
 * 自动创建适配器
 */
export function createAutoAdapter(config?: AdapterConfig): any {
  const detection = detectFramework();

  if (!detection.framework || !detection.supported) {
    throw new Error(`Unsupported or undetected framework: ${detection.framework}`);
  }

  return adapterFactory.createAdapter(detection.framework, {
    ...config,
    framework: detection.framework
  });
}

// ============================================================================
// 适配器注册管理
// ============================================================================

/**
 * 适配器注册管理器
 */
export class AdapterRegistry {
  private adapters: Map<string, any> = new Map();
  private registrations: Map<string, any> = new Map();

  /**
   * 注册适配器
   */
  register(name: string, adapter: any): void {
    this.adapters.set(name, adapter);
    this.registrations.set(name, {
      name,
      framework: adapter.framework,
      version: adapter.version,
      adapter,
      registeredAt: new Date()
    });
  }

  /**
   * 获取适配器
   */
  get(name: string): any {
    return this.adapters.get(name);
  }

  /**
   * 注销适配器
   */
  unregister(name: string): boolean {
    const adapter = this.adapters.get(name);
    if (adapter && typeof adapter.destroy === 'function') {
      adapter.destroy();
    }

    this.registrations.delete(name);
    return this.adapters.delete(name);
  }

  /**
   * 获取所有注册信息
   */
  getRegistrations(): any[] {
    return Array.from(this.registrations.values());
  }

  /**
   * 清空所有适配器
   */
  clear(): void {
    for (const adapter of this.adapters.values()) {
      if (typeof adapter.destroy === 'function') {
        adapter.destroy();
      }
    }

    this.adapters.clear();
    this.registrations.clear();
  }

  /**
   * 根据框架类型获取适配器
   */
  getByFramework(framework: FrameworkType): any[] {
    return Array.from(this.adapters.values()).filter(
      adapter => adapter.framework === framework
    );
  }
}

/**
 * 全局适配器注册表
 */
export const globalAdapterRegistry = new AdapterRegistry();

// 注册默认适配器
globalAdapterRegistry.register('vue3', new Vue3Adapter());
globalAdapterRegistry.register('react', new ReactCropperAdapter());
globalAdapterRegistry.register('angular', new AngularCropperAdapter());

// ============================================================================
// 便捷函数
// ============================================================================

/**
 * 获取适配器
 */
export function getAdapter(name: string): any {
  return globalAdapterRegistry.get(name);
}

/**
 * 注册自定义适配器
 */
export function registerAdapter(name: string, adapter: any): void {
  globalAdapterRegistry.register(name, adapter);
}

/**
 * 根据框架创建组件
 */
export function createFrameworkComponent(framework: FrameworkType, config?: any): any {
  const adapter = adapterFactory.createAdapter(framework, config);
  return adapter?.createComponent(config);
}

/**
 * 检查框架支持
 */
export function isFrameworkSupported(framework: FrameworkType): boolean {
  try {
    const adapter = adapterFactory.createAdapter(framework);
    return adapter !== null && adapter !== undefined;
  } catch {
    return false;
  }
}

/**
 * 获取支持的框架列表
 */
export function getSupportedFrameworks(): FrameworkType[] {
  const frameworks: FrameworkType[] = ['vue', 'react', 'angular', 'vanilla'];
  return frameworks.filter(framework => isFrameworkSupported(framework));
}

// ============================================================================
// 默认导出
// ============================================================================

export default {
  // 工厂
  adapterFactory,
  createAutoAdapter,

  // 注册表
  globalAdapterRegistry,
  getAdapter,
  registerAdapter,

  // 检测
  detectFramework,
  isFrameworkSupported,
  getSupportedFrameworks,

  // 便捷函数
  createFrameworkComponent
};
