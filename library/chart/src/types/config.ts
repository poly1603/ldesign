/**
 * 配置相关的详细类型定义
 */

/**
 * 加载器配置
 */
export interface LoaderConfig {
  /** 是否预加载常用图表类型 */
  preload?: string[];
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean;
  /** 缓存过期时间（毫秒） */
  ttl?: number;
  /** 最大缓存数量 */
  maxSize?: number;
}

/**
 * 性能配置
 */
export interface PerformanceConfig {
  /** 虚拟渲染配置 */
  virtual?: {
    /** 是否启用 */
    enabled?: boolean;
    /** 每次渲染的数据量 */
    chunkSize?: number;
  };
  /** Worker 配置 */
  worker?: {
    /** 是否启用 */
    enabled?: boolean;
    /** Worker 数量 */
    poolSize?: number;
  };
  /** 数据分片配置 */
  chunk?: {
    /** 是否启用 */
    enabled?: boolean;
    /** 分片大小 */
    size?: number;
  };
}

/**
 * 实例管理器配置
 */
export interface InstanceManagerConfig {
  /** 最大实例数 */
  maxInstances?: number;
  /** 是否自动清理 */
  autoCleanup?: boolean;
  /** 清理间隔（毫秒） */
  cleanupInterval?: number;
}

/**
 * 全局配置
 */
export interface GlobalConfig {
  /** 加载器配置 */
  loader?: LoaderConfig;
  /** 缓存配置 */
  cache?: CacheConfig;
  /** 性能配置 */
  performance?: PerformanceConfig;
  /** 实例管理配置 */
  instanceManager?: InstanceManagerConfig;
  /** 默认主题 */
  defaultTheme?: string;
  /** 默认字体大小 */
  defaultFontSize?: number;
  /** 是否启用调试模式 */
  debug?: boolean;
}

/**
 * 配置合并选项
 */
export interface MergeOptions {
  /** 合并策略 */
  strategy?: 'replace' | 'merge' | 'deep-merge';
  /** 是否覆盖数组 */
  overrideArrays?: boolean;
  /** 是否合并 undefined 值 */
  mergeUndefined?: boolean;
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 图片类型 */
  type?: 'png' | 'jpg' | 'svg';
  /** 像素比 */
  pixelRatio?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** 是否排除组件 */
  excludeComponents?: string[];
}

