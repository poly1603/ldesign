/**
 * 核心播放器类实现
 * 基于 xgplayer 的设计理念，提供现代化的视频播放器功能
 */

import type {
  IPlayer,
  PlayerConfig,
  PlayerState,
  VideoQuality,
  VideoSource,
  PluginConfig,
  IPlugin,
  PlayerEvents,
  EventListener
} from '../types';

import { EventManager } from './EventManager';
import { StateManager } from './StateManager';
import { PlayerState as State } from '../types';
import { VideoLoader, VideoSource as LoaderVideoSource } from '../utils/videoLoader';

/**
 * 默认播放器配置
 */
const DEFAULT_CONFIG: Partial<PlayerConfig> = {
  autoplay: false,
  muted: false,
  loop: false,
  controls: true,
  preload: 'metadata',
  volume: 1,
  playbackRate: 1,
  responsive: true,
  crossOrigin: 'anonymous',
  playsinline: true,
  disablePictureInPicture: false,
  errorRetryCount: 3,
  errorRetryDelay: 1000,
  lazyLoad: false,
  preloadPlugins: true,
  language: 'en'
};

/**
 * 核心播放器类
 * 提供完整的视频播放功能和插件系统支持
 */
export class Player implements IPlayer {
  private readonly _config: PlayerConfig;
  private readonly _eventManager: EventManager;
  private readonly _stateManager: StateManager;
  private readonly _plugins: Map<string, IPlugin>;
  private readonly _container: HTMLElement;
  private readonly _element: HTMLVideoElement;
  private readonly _videoLoader: VideoLoader;
  private _currentQuality: VideoQuality | null = null;
  private _qualities: VideoQuality[] = [];
  private _isFullscreen = false;
  private _retryCount = 0;
  private _destroyed = false;

  constructor(config: PlayerConfig) {
    // 合并配置
    this._config = { ...DEFAULT_CONFIG, ...config } as PlayerConfig;

    // 初始化核心组件
    this._eventManager = new EventManager();
    this._stateManager = new StateManager(this._eventManager);
    this._plugins = new Map();

    // 初始化视频加载器
    this._videoLoader = new VideoLoader({
      enableCache: true,
      enablePreload: this._config.preload !== 'none',
      enableProgressiveLoad: this._config.lazyLoad || false,
      chunkSize: 1024 * 1024, // 1MB
      preloadSize: 5 * 1024 * 1024 // 5MB
    });

    // 初始化 DOM 元素
    this._container = this.resolveContainer(this._config.container);
    this._element = this.createVideoElement();

    // 初始化播放器
    this.initialize();
  }

  // ==================== 基础属性 ====================

  get state(): PlayerState {
    return this._stateManager.state;
  }

  get config(): PlayerConfig {
    return { ...this._config };
  }

  get element(): HTMLVideoElement {
    return this._element;
  }

  get container(): HTMLElement {
    return this._container;
  }

  get plugins(): Map<string, IPlugin> {
    return new Map(this._plugins);
  }

  // ==================== 播放控制 ====================

  async play(): Promise<void> {
    if (this._destroyed) {
      throw new Error('Player has been destroyed');
    }

    try {
      this._stateManager.setState(State.PLAYING, 'user_action');
      await this._element.play();
      this._eventManager.emit('media:play', { currentTime: this.currentTime });
    } catch (error) {
      this._stateManager.setState(State.ERROR, 'play_failed');
      this.handleError(error as Error);
      throw error;
    }
  }

  pause(): void {
    if (this._destroyed) return;

    this._stateManager.setState(State.PAUSED, 'user_action');
    this._element.pause();
    this._eventManager.emit('media:pause', { currentTime: this.currentTime });
  }

  seek(time: number): void {
    if (this._destroyed) return;

    const clampedTime = Math.max(0, Math.min(time, this.duration));
    this._stateManager.setState(State.SEEKING, 'user_action');
    this._element.currentTime = clampedTime;
  }

  stop(): void {
    if (this._destroyed) return;

    this.pause();
    this.seek(0);
  }

  // ==================== 属性访问 ====================

  get currentTime(): number {
    return this._element.currentTime || 0;
  }

  get duration(): number {
    return this._element.duration || 0;
  }

  get buffered(): TimeRanges {
    return this._element.buffered;
  }

  get volume(): number {
    return this._element.volume;
  }

  set volume(value: number) {
    const clampedValue = Math.max(0, Math.min(1, value));
    this._element.volume = clampedValue;
    this._config.volume = clampedValue;
  }

  get muted(): boolean {
    return this._element.muted;
  }

  set muted(value: boolean) {
    this._element.muted = value;
    this._config.muted = value;
  }

  get playbackRate(): number {
    return this._element.playbackRate;
  }

  set playbackRate(value: number) {
    const clampedValue = Math.max(0.25, Math.min(4, value));
    this._element.playbackRate = clampedValue;
    this._config.playbackRate = clampedValue;
  }

  get paused(): boolean {
    return this._element.paused;
  }

  get ended(): boolean {
    return this._element.ended;
  }

  // ==================== 质量控制 ====================

  get qualities(): VideoQuality[] {
    return [...this._qualities];
  }

  get currentQuality(): VideoQuality | null {
    return this._currentQuality;
  }

  setQuality(qualityId: string): void {
    const quality = this._qualities.find(q => q.id === qualityId);
    if (!quality) {
      throw new Error(`Quality ${qualityId} not found`);
    }

    const previousQuality = this._currentQuality;
    this._currentQuality = quality;

    // 切换视频源
    this.setSrc(quality.url).catch(error => {
      console.error('切换视频质量失败:', error);
    });

    this._eventManager.emit('quality:change', {
      from: previousQuality?.id || null,
      to: qualityId,
      quality
    });
  }

  // ==================== 全屏控制 ====================

  get isFullscreen(): boolean {
    return this._isFullscreen;
  }

  async enterFullscreen(): Promise<void> {
    try {
      if (this._container.requestFullscreen) {
        await this._container.requestFullscreen();
      } else if ((this._container as any).webkitRequestFullscreen) {
        await (this._container as any).webkitRequestFullscreen();
      } else if ((this._container as any).msRequestFullscreen) {
        await (this._container as any).msRequestFullscreen();
      }
      this._isFullscreen = true;
      this._eventManager.emit('fullscreen:enter', { element: this._container });
    } catch (error) {
      this._eventManager.emit('fullscreen:error', { error: error as Error });
      throw error;
    }
  }

  async exitFullscreen(): Promise<void> {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      this._isFullscreen = false;
      this._eventManager.emit('fullscreen:exit', { element: this._container });
    } catch (error) {
      this._eventManager.emit('fullscreen:error', { error: error as Error });
      throw error;
    }
  }

  // ==================== 插件管理 ====================

  use(pluginConfig: PluginConfig): void {
    // 插件系统将在后续实现
    console.warn('Plugin system not yet implemented');
  }

  getPlugin<T extends IPlugin = IPlugin>(name: string): T | null {
    return (this._plugins.get(name) as T) || null;
  }

  // ==================== 事件系统 ====================

  on<K extends keyof PlayerEvents>(event: K, handler: PlayerEvents[K]): void {
    this._eventManager.on(event as any, handler as any);
  }

  off<K extends keyof PlayerEvents>(event: K, handler: PlayerEvents[K]): void {
    this._eventManager.off(event as any, handler as any);
  }

  emit<K extends keyof PlayerEvents>(event: K, ...args: Parameters<PlayerEvents[K]>): void {
    this._eventManager.emit(event as any, args[0] as any);
  }

  // ==================== 生命周期 ====================

  destroy(): void {
    if (this._destroyed) return;

    this._destroyed = true;
    this._stateManager.setState(State.DESTROYED, 'user_action');

    // 销毁所有插件
    for (const plugin of this._plugins.values()) {
      try {
        plugin.destroy();
      } catch (error) {
        console.error('Error destroying plugin:', error);
      }
    }
    this._plugins.clear();

    // 清理视频加载器
    this._videoLoader.cleanup();

    // 清理事件监听器
    this.unbindEvents();
    this._eventManager.clear();

    // 清理 DOM
    if (this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }

    this._eventManager.emit('player:destroy', { player: this });
  }

  // ==================== 私有方法 ====================

  private initialize(): void {
    this.setupContainer();
    this.setupVideoElement();
    this.bindEvents();
    this.loadQualities();

    this._stateManager.setState(State.READY, 'initialized');
    this._eventManager.emit('player:ready', { player: this });
  }

  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container element not found: ${container}`);
      }
      return element as HTMLElement;
    }
    return container;
  }

  private createVideoElement(): HTMLVideoElement {
    const video = document.createElement('video');

    // 设置基础属性
    video.controls = this._config.controls || false;
    video.autoplay = this._config.autoplay || false;
    video.muted = this._config.muted || false;
    video.loop = this._config.loop || false;
    video.preload = this._config.preload || 'metadata';
    video.crossOrigin = this._config.crossOrigin || null;
    video.playsInline = this._config.playsinline || false;
    video.disablePictureInPicture = this._config.disablePictureInPicture || false;

    if (this._config.poster) {
      video.poster = this._config.poster;
    }

    return video;
  }

  private setupContainer(): void {
    this._container.classList.add('ldesign-video-player');

    // 设置尺寸
    if (this._config.width) {
      this._container.style.width = typeof this._config.width === 'number'
        ? `${this._config.width}px`
        : this._config.width;
    }

    if (this._config.height) {
      this._container.style.height = typeof this._config.height === 'number'
        ? `${this._config.height}px`
        : this._config.height;
    }

    // 响应式设置
    if (this._config.responsive) {
      this._container.style.position = 'relative';
      this._container.style.width = '100%';
      this._container.style.height = 'auto';
    }
  }

  private setupVideoElement(): void {
    this._element.style.width = '100%';
    this._element.style.height = '100%';
    this._element.style.display = 'block';

    this._container.appendChild(this._element);

    // 设置视频源
    if (this._config.src) {
      this.setSrc(this._config.src).catch(error => {
        console.error('初始化视频源失败:', error);
      });
    }
  }

  private async setSrc(src: string | VideoSource[]): Promise<void> {
    try {
      // 重置错误重试计数
      this._retryCount = 0;

      // 转换为加载器格式
      const source: LoaderVideoSource = typeof src === 'string'
        ? { url: src, quality: 'auto' }
        : { url: src[0].src, quality: src[0].quality || 'auto', type: src[0].type };

      // 使用视频加载器加载
      const blob = await this._videoLoader.loadVideo(source, (progress) => {
        this._eventManager.emit('loading:progress', progress);
      });

      // 设置视频源
      const blobUrl = URL.createObjectURL(blob);
      this._element.src = blobUrl;

      this._eventManager.emit('media:sourcechange', { source });

    } catch (error) {
      this.handleLoadError(error as Error);
    }
  }

  /**
   * 处理加载错误
   */
  private async handleLoadError(error: Error): Promise<void> {
    this._retryCount++;

    const maxRetries = this._config.errorRetryCount || 3;
    const retryDelay = this._config.errorRetryDelay || 1000;

    this._eventManager.emit('player:error', {
      error: error.message,
      retryCount: this._retryCount,
      maxRetries
    });

    if (this._retryCount < maxRetries) {
      // 延迟后重试
      setTimeout(() => {
        if (!this._destroyed) {
          this._element.load();
        }
      }, retryDelay * this._retryCount);
    } else {
      // 达到最大重试次数，设置错误状态
      this._stateManager.setState(State.ERROR, 'max_retries_exceeded');
    }
  }

  private loadQualities(): void {
    if (this._config.qualities) {
      this._qualities = [...this._config.qualities];

      // 设置默认质量
      if (this._config.defaultQuality) {
        const defaultQuality = this._qualities.find(q => q.id === this._config.defaultQuality);
        if (defaultQuality) {
          this._currentQuality = defaultQuality;
        }
      } else if (this._qualities.length > 0) {
        this._currentQuality = this._qualities[0];
      }

      this._eventManager.emit('quality:list', { qualities: this._qualities });
    }
  }

  private bindEvents(): void {
    // 媒体事件
    this._element.addEventListener('loadstart', () => {
      this._stateManager.setState(State.LOADING, 'media_event');
      this._eventManager.emit('media:loadstart', {});
    });

    this._element.addEventListener('loadedmetadata', () => {
      this._eventManager.emit('media:loadedmetadata', {
        duration: this.duration,
        videoWidth: this._element.videoWidth,
        videoHeight: this._element.videoHeight
      });
    });

    this._element.addEventListener('canplay', () => {
      this._stateManager.setState(State.READY, 'media_event');
      this._eventManager.emit('media:canplay', { readyState: this._element.readyState });
    });

    this._element.addEventListener('play', () => {
      this._stateManager.setState(State.PLAYING, 'media_event');
      this._eventManager.emit('media:play', { currentTime: this.currentTime });
    });

    this._element.addEventListener('pause', () => {
      this._stateManager.setState(State.PAUSED, 'media_event');
      this._eventManager.emit('media:pause', { currentTime: this.currentTime });
    });

    this._element.addEventListener('ended', () => {
      this._stateManager.setState(State.ENDED, 'media_event');
      this._eventManager.emit('media:ended', { duration: this.duration });
    });

    this._element.addEventListener('timeupdate', () => {
      this._eventManager.emit('media:timeupdate', {
        currentTime: this.currentTime,
        duration: this.duration
      });
    });

    this._element.addEventListener('seeking', () => {
      this._stateManager.setState(State.SEEKING, 'media_event');
      this._eventManager.emit('media:seeking', {
        currentTime: this.currentTime,
        targetTime: this._element.currentTime
      });
    });

    this._element.addEventListener('seeked', () => {
      this._stateManager.setState(State.PLAYING, 'media_event');
      this._eventManager.emit('media:seeked', { currentTime: this.currentTime });
    });

    this._element.addEventListener('waiting', () => {
      this._stateManager.setState(State.BUFFERING, 'media_event');
      this._eventManager.emit('media:waiting', { currentTime: this.currentTime });
    });

    this._element.addEventListener('error', () => {
      this._stateManager.setState(State.ERROR, 'media_event');
      const error = this._element.error;
      const errorMessage = error ? `Media error: ${error.message} (code: ${error.code})` : 'Unknown media error';
      this.handleLoadError(new Error(errorMessage));
    });

    // 全屏事件
    document.addEventListener('fullscreenchange', () => {
      this._isFullscreen = !!document.fullscreenElement;
      this._eventManager.emit('fullscreen:change', {
        isFullscreen: this._isFullscreen,
        element: this._container
      });
    });
  }

  private unbindEvents(): void {
    // 移除所有事件监听器
    this._element.removeEventListener('loadstart', () => { });
    // ... 其他事件监听器
  }

  private handleError(error: Error): void {
    console.error('Player error:', error);

    // 尝试重试
    if (this._retryCount < (this._config.errorRetryCount || 0)) {
      this._retryCount++;
      setTimeout(() => {
        this._element.load();
      }, this._config.errorRetryDelay || 1000);
    } else {
      this._eventManager.emit('error:media', {
        error: error as any,
        code: 0,
        message: error.message
      });
    }
  }
}

/**
 * 创建播放器实例
 */
export function createPlayer(config: PlayerConfig): Player {
  return new Player(config);
}
