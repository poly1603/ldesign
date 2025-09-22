/**
 * LDesign Video Player
 * 现代化的 Web 视频播放器库
 * 
 * 基于 xgplayer 的设计理念，提供现代化的视频播放器功能
 * 支持插件系统、主题系统、跨框架适配等特性
 */

// 核心模块
export { Player, createPlayer } from './core/Player';
export { EventManager } from './core/EventManager';
export { StateManager } from './core/StateManager';
export { BasePlugin } from './core/BasePlugin';
export { Plugin } from './core/Plugin';
export { PluginManager, createPluginManager } from './core/PluginManager';
export { ThemeManager, createThemeManager } from './core/ThemeManager';

// 类型定义
export * from './types';

// 插件
export * from './plugins';

// 主题
export { defaultTheme, darkTheme, lightTheme } from './themes/default';

// 框架适配器
export * from './adapters';

// 工具函数
export * from './utils/eventUtils';
export * from './utils/performance';
export * from './utils/accessibility';

// 版本信息
export const VERSION = '1.0.0';

/**
 * 快速创建播放器实例
 */
export async function createVideoPlayer(
  container: string | HTMLElement,
  config: Partial<import('./types').PlayerConfig> = {}
): Promise<Player> {
  const { setupBasicPlayer } = await import('./plugins');

  const player = new Player({
    container,
    ...config
  } as import('./types').PlayerConfig);

  // 设置基础插件
  if (config.controls !== false) {
    await setupBasicPlayer(player);
  }

  return player;
}

/**
 * 播放器工厂类
 */
export class VideoPlayerFactory {
  private static instance: VideoPlayerFactory;

  static getInstance(): VideoPlayerFactory {
    if (!VideoPlayerFactory.instance) {
      VideoPlayerFactory.instance = new VideoPlayerFactory();
    }
    return VideoPlayerFactory.instance;
  }

  /**
   * 创建播放器
   */
  async create(
    container: string | HTMLElement,
    config: Partial<import('./types').PlayerConfig> = {}
  ): Promise<Player> {
    return createVideoPlayer(container, config);
  }

  /**
   * 批量创建播放器
   */
  async createBatch(
    configs: Array<{
      container: string | HTMLElement;
      config?: Partial<import('./types').PlayerConfig>;
    }>
  ): Promise<Player[]> {
    const promises = configs.map(({ container, config }) =>
      this.create(container, config)
    );

    return Promise.all(promises);
  }
}

/**
 * 默认导出
 */
export default {
  Player,
  createPlayer,
  createVideoPlayer,
  VideoPlayerFactory,
  VERSION
};

/**
 * 全局注册（用于 CDN 引入）
 */
if (typeof window !== 'undefined') {
  (window as any).LDesignVideo = {
    Player,
    createPlayer,
    createVideoPlayer,
    VideoPlayerFactory,
    VERSION
  };
}
