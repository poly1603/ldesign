/**
 * 事件系统类型定义
 * 提供完整的事件类型支持和类型安全的事件处理
 */

// 基础事件接口
export interface BaseEvent {
  type: string;
  target: any;
  timestamp: number;
  preventDefault?: () => void;
  stopPropagation?: () => void;
}

// 播放器事件详细定义
export interface PlayerEventMap {
  // 生命周期事件
  'player:ready': { player: any };
  'player:destroy': { player: any };
  
  // 播放状态事件
  'media:play': { currentTime: number };
  'media:pause': { currentTime: number };
  'media:ended': { duration: number };
  'media:timeupdate': { currentTime: number; duration: number };
  'media:durationchange': { duration: number };
  'media:progress': { buffered: TimeRanges; loaded: number };
  'media:seeking': { currentTime: number; targetTime: number };
  'media:seeked': { currentTime: number };
  'media:waiting': { currentTime: number };
  'media:canplay': { readyState: number };
  'media:canplaythrough': { readyState: number };
  'media:loadstart': {};
  'media:loadeddata': {};
  'media:loadedmetadata': { duration: number; videoWidth: number; videoHeight: number };
  
  // 音频事件
  'audio:volumechange': { volume: number; muted: boolean };
  'audio:ratechange': { playbackRate: number };
  
  // 视频质量事件
  'quality:change': { from: string | null; to: string; quality: any };
  'quality:list': { qualities: any[] };
  
  // 全屏事件
  'fullscreen:enter': { element: HTMLElement };
  'fullscreen:exit': { element: HTMLElement };
  'fullscreen:change': { isFullscreen: boolean; element: HTMLElement };
  'fullscreen:error': { error: Error };
  
  // 画中画事件
  'pip:enter': { element: HTMLVideoElement };
  'pip:exit': { element: HTMLVideoElement };
  'pip:change': { isPictureInPicture: boolean };
  'pip:error': { error: Error };
  
  // 错误事件
  'error:media': { error: MediaError; code: number; message: string };
  'error:network': { error: Error; url: string };
  'error:plugin': { pluginName: string; error: Error };
  'error:fatal': { error: Error; recoverable: boolean };
  
  // 插件事件
  'plugin:register': { pluginName: string; plugin: any };
  'plugin:unregister': { pluginName: string };
  'plugin:ready': { pluginName: string; plugin: any };
  'plugin:error': { pluginName: string; error: Error };
  'plugin:enable': { pluginName: string };
  'plugin:disable': { pluginName: string };
  
  // 主题事件
  'theme:change': { from: string | null; to: string };
  'theme:load': { themeName: string };
  'theme:error': { themeName: string; error: Error };
  
  // 用户交互事件
  'user:click': { target: HTMLElement; position: { x: number; y: number } };
  'user:dblclick': { target: HTMLElement; position: { x: number; y: number } };
  'user:keydown': { key: string; code: string; target: HTMLElement };
  'user:keyup': { key: string; code: string; target: HTMLElement };
  'user:mousemove': { position: { x: number; y: number }; target: HTMLElement };
  'user:mouseenter': { target: HTMLElement };
  'user:mouseleave': { target: HTMLElement };
  'user:focus': { target: HTMLElement };
  'user:blur': { target: HTMLElement };
  'user:resize': { width: number; height: number };
  
  // 控制栏事件
  'controls:show': {};
  'controls:hide': {};
  'controls:toggle': { visible: boolean };
  'controls:lock': {};
  'controls:unlock': {};
  
  // 弹幕事件
  'danmaku:send': { text: string; time: number; style: any };
  'danmaku:receive': { text: string; time: number; style: any };
  'danmaku:clear': {};
  'danmaku:toggle': { enabled: boolean };
  
  // 字幕事件
  'subtitle:load': { url: string; language: string };
  'subtitle:change': { from: string | null; to: string };
  'subtitle:toggle': { enabled: boolean };
  'subtitle:error': { error: Error; url: string };
  
  // 截图事件
  'screenshot:capture': { dataUrl: string; blob: Blob };
  'screenshot:error': { error: Error };
}

// 事件监听器类型
export type EventListener<T = any> = (event: T) => void | Promise<void>;

// 事件发射器接口
export interface EventEmitter {
  on<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void;
  
  off<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void;
  
  once<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void;
  
  emit<K extends keyof PlayerEventMap>(
    event: K,
    data: PlayerEventMap[K]
  ): void;
  
  removeAllListeners(event?: keyof PlayerEventMap): void;
  
  listenerCount(event: keyof PlayerEventMap): number;
  
  listeners<K extends keyof PlayerEventMap>(
    event: K
  ): EventListener<PlayerEventMap[K]>[];
}

// 事件中间件类型
export type EventMiddleware<T = any> = (
  event: string,
  data: T,
  next: () => void
) => void | Promise<void>;

// 事件过滤器类型
export type EventFilter<T = any> = (event: string, data: T) => boolean;

// 事件转换器类型
export type EventTransformer<T = any, R = any> = (event: string, data: T) => R;

// 事件配置接口
export interface EventConfig {
  // 是否启用事件冒泡
  bubbles?: boolean;
  // 是否可以取消
  cancelable?: boolean;
  // 事件优先级
  priority?: number;
  // 是否只触发一次
  once?: boolean;
  // 事件中间件
  middleware?: EventMiddleware[];
  // 事件过滤器
  filter?: EventFilter;
  // 事件转换器
  transformer?: EventTransformer;
}

// 事件管理器接口
export interface EventManager extends EventEmitter {
  // 添加事件中间件
  use(middleware: EventMiddleware): void;
  
  // 设置事件过滤器
  filter(filter: EventFilter): void;
  
  // 设置事件转换器
  transform(transformer: EventTransformer): void;
  
  // 获取事件统计信息
  getStats(): {
    totalEvents: number;
    eventCounts: Record<string, number>;
    listenerCounts: Record<string, number>;
  };
  
  // 清除所有事件和监听器
  clear(): void;
  
  // 启用/禁用事件系统
  enable(): void;
  disable(): void;
  
  // 检查是否启用
  isEnabled(): boolean;
}

// 自定义事件类
export class CustomEvent<T = any> implements BaseEvent {
  public readonly type: string;
  public readonly target: any;
  public readonly timestamp: number;
  public readonly data: T;
  
  private _defaultPrevented = false;
  private _propagationStopped = false;
  
  constructor(type: string, data: T, target?: any) {
    this.type = type;
    this.data = data;
    this.target = target;
    this.timestamp = Date.now();
  }
  
  preventDefault(): void {
    this._defaultPrevented = true;
  }
  
  stopPropagation(): void {
    this._propagationStopped = true;
  }
  
  get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }
  
  get propagationStopped(): boolean {
    return this._propagationStopped;
  }
}

// 事件工具函数类型
export interface EventUtils {
  // 创建自定义事件
  createEvent<T>(type: string, data: T, target?: any): CustomEvent<T>;
  
  // 事件防抖
  debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void;
  
  // 事件节流
  throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void;
  
  // 事件委托
  delegate(
    container: HTMLElement,
    selector: string,
    event: string,
    handler: EventListener
  ): () => void;
  
  // 一次性事件监听
  once(
    target: EventTarget,
    event: string,
    handler: EventListener
  ): () => void;
}
