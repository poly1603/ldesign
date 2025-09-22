/**
 * 核心类型定义
 * 基于 xgplayer 的设计理念，提供现代化的 TypeScript 类型支持
 */

// 播放器状态枚举
export enum PlayerState {
  INITIAL = 'initial',
  LOADING = 'loading',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  SEEKING = 'seeking',
  BUFFERING = 'buffering',
  ENDED = 'ended',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

// 插件位置枚举
export enum PluginPosition {
  ROOT = 'root',
  ROOT_LEFT = 'rootLeft',
  ROOT_RIGHT = 'rootRight',
  ROOT_TOP = 'rootTop',
  ROOT_BOTTOM = 'rootBottom',
  CONTROLS = 'controls',
  CONTROLS_LEFT = 'controlsLeft',
  CONTROLS_RIGHT = 'controlsRight',
  CONTROLS_CENTER = 'controlsCenter',
  OVERLAY = 'overlay'
}

// 事件类型
export interface PlayerEvents {
  // 播放器生命周期事件
  ready: () => void;
  play: () => void;
  pause: () => void;
  ended: () => void;
  error: (error: PlayerError) => void;
  destroy: () => void;
  
  // 播放状态事件
  timeupdate: (currentTime: number) => void;
  durationchange: (duration: number) => void;
  progress: (buffered: TimeRanges) => void;
  seeking: () => void;
  seeked: () => void;
  volumechange: (volume: number, muted: boolean) => void;
  ratechange: (playbackRate: number) => void;
  
  // 视频质量事件
  qualitychange: (quality: VideoQuality) => void;
  
  // 全屏事件
  fullscreenchange: (isFullscreen: boolean) => void;
  
  // 插件事件
  pluginready: (pluginName: string) => void;
  pluginerror: (pluginName: string, error: Error) => void;
  
  // 用户交互事件
  useraction: (action: UserAction) => void;
}

// 播放器错误类型
export interface PlayerError {
  code: number;
  message: string;
  details?: any;
  recoverable?: boolean;
}

// 视频质量定义
export interface VideoQuality {
  id: string;
  label: string;
  width: number;
  height: number;
  bitrate?: number;
  url: string;
  isDefault?: boolean;
}

// 用户行为定义
export interface UserAction {
  type: string;
  target: string;
  data?: any;
  timestamp: number;
}

// 播放器配置接口
export interface PlayerConfig {
  // 基础配置
  container: string | HTMLElement;
  src?: string | VideoSource[];
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  
  // 尺寸配置
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  responsive?: boolean;
  
  // 播放配置
  volume?: number;
  playbackRate?: number;
  qualities?: VideoQuality[];
  defaultQuality?: string;
  
  // 插件配置
  plugins?: PluginConfig[];
  
  // 主题配置
  theme?: string | ThemeConfig;
  
  // 国际化配置
  language?: string;
  i18n?: Record<string, any>;
  
  // 高级配置
  crossOrigin?: 'anonymous' | 'use-credentials';
  playsinline?: boolean;
  disablePictureInPicture?: boolean;
  
  // 错误处理
  errorRetryCount?: number;
  errorRetryDelay?: number;
  
  // 性能配置
  lazyLoad?: boolean;
  preloadPlugins?: boolean;
}

// 视频源定义
export interface VideoSource {
  src: string;
  type?: string;
  quality?: string;
  label?: string;
}

// 插件配置接口
export interface PluginConfig {
  name: string;
  plugin: PluginConstructor;
  options?: Record<string, any>;
  position?: PluginPosition;
  order?: number;
  lazy?: boolean;
  enabled?: boolean;
}

// 主题配置接口
export interface ThemeConfig {
  name: string;
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  sizes?: Record<string, string>;
  customCSS?: string;
}

// 插件基础接口
export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly player: IPlayer;
  readonly config: Record<string, any>;
  readonly element?: HTMLElement;
  
  init(): void | Promise<void>;
  destroy(): void;
  enable(): void;
  disable(): void;
  show(): void;
  hide(): void;
  
  on<K extends keyof PlayerEvents>(event: K, handler: PlayerEvents[K]): void;
  off<K extends keyof PlayerEvents>(event: K, handler: PlayerEvents[K]): void;
  emit<K extends keyof PlayerEvents>(event: K, ...args: Parameters<PlayerEvents[K]>): void;
}

// 播放器接口
export interface IPlayer {
  readonly state: PlayerState;
  readonly config: PlayerConfig;
  readonly element: HTMLVideoElement;
  readonly container: HTMLElement;
  readonly plugins: Map<string, IPlugin>;
  
  // 播放控制
  play(): Promise<void>;
  pause(): void;
  seek(time: number): void;
  stop(): void;
  
  // 属性访问
  readonly currentTime: number;
  readonly duration: number;
  readonly buffered: TimeRanges;
  readonly volume: number;
  readonly muted: boolean;
  readonly playbackRate: number;
  readonly paused: boolean;
  readonly ended: boolean;
  
  // 质量控制
  readonly qualities: VideoQuality[];
  readonly currentQuality: VideoQuality | null;
  setQuality(qualityId: string): void;
  
  // 全屏控制
  readonly isFullscreen: boolean;
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  
  // 插件管理
  use(plugin: PluginConfig): void;
  getPlugin<T extends IPlugin = IPlugin>(name: string): T | null;
  
  // 事件系统
  on<K extends keyof PlayerEvents>(event: K, handler: PlayerEvents[K]): void;
  off<K extends keyof PlayerEvents>(event: K, handler: PlayerEvents[K]): void;
  emit<K extends keyof PlayerEvents>(event: K, ...args: Parameters<PlayerEvents[K]>): void;
  
  // 生命周期
  destroy(): void;
}

// 插件构造函数类型
export type PluginConstructor = new (player: IPlayer, config: Record<string, any>) => IPlugin;

// 事件处理器类型
export type EventHandler<T = any> = (...args: T[]) => void;

// 工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 导出所有类型
export * from './events';
export * from './plugins';
export * from './themes';
