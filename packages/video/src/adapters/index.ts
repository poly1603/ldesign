/**
 * 框架适配器导出文件
 * 统一导出所有框架适配器
 */

// Vue 适配器
export * from './vue';

// React 适配器
export * from './react';

// Angular 适配器
export * from './angular';

// 通用适配器工厂
import type { PlayerConfig } from '../types';

/**
 * 适配器类型
 */
export type AdapterType = 'vue' | 'react' | 'angular' | 'vanilla';

/**
 * 适配器配置
 */
export interface AdapterConfig {
  type: AdapterType;
  playerConfig: PlayerConfig;
  [key: string]: any;
}

/**
 * 适配器工厂
 */
export class AdapterFactory {
  /**
   * 检测当前环境的框架
   */
  static detectFramework(): AdapterType {
    // 检测 Vue
    if (typeof window !== 'undefined' && (window as any).Vue) {
      return 'vue';
    }

    // 检测 React
    if (typeof window !== 'undefined' && (window as any).React) {
      return 'react';
    }

    // 检测 Angular
    if (typeof window !== 'undefined' && (window as any).ng) {
      return 'angular';
    }

    // 默认为原生
    return 'vanilla';
  }

  /**
   * 创建适配器
   */
  static async createAdapter(config: AdapterConfig) {
    const { type, playerConfig } = config;

    switch (type) {
      case 'vue':
        const { VideoPlayer: VuePlayer } = await import('./vue');
        return VuePlayer;

      case 'react':
        const { VideoPlayer: ReactPlayer } = await import('./react');
        return ReactPlayer;

      case 'angular':
        const { VideoPlayerComponent } = await import('./angular');
        return VideoPlayerComponent;

      case 'vanilla':
      default:
        const { Player } = await import('../core/Player');
        return new Player(playerConfig);
    }
  }

  /**
   * 获取适配器信息
   */
  static getAdapterInfo(type: AdapterType) {
    const info = {
      vue: {
        name: 'Vue 3',
        version: '^3.0.0',
        description: 'Vue 3 组件和组合式 API',
        features: ['组件', 'Composition API', '响应式数据', 'TypeScript 支持']
      },
      react: {
        name: 'React',
        version: '^16.8.0 || ^17.0.0 || ^18.0.0',
        description: 'React 组件和 Hooks',
        features: ['函数组件', 'Hooks', 'TypeScript 支持', 'forwardRef']
      },
      angular: {
        name: 'Angular',
        version: '^12.0.0',
        description: 'Angular 组件和服务',
        features: ['组件', '服务', 'TypeScript 支持', '依赖注入']
      },
      vanilla: {
        name: 'Vanilla JavaScript',
        version: 'ES2015+',
        description: '原生 JavaScript 实现',
        features: ['无框架依赖', 'TypeScript 支持', '轻量级', '高性能']
      }
    };

    return info[type];
  }
}

/**
 * 快速创建播放器
 */
export async function createVideoPlayer(
  container: string | HTMLElement,
  config: PlayerConfig,
  adapterType?: AdapterType
) {
  const type = adapterType || AdapterFactory.detectFramework();
  
  if (type === 'vanilla') {
    const { Player } = await import('../core/Player');
    return new Player({ container, ...config });
  }

  return AdapterFactory.createAdapter({
    type,
    playerConfig: { container, ...config }
  });
}

export default {
  AdapterFactory,
  createVideoPlayer
};
