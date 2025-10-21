/**
 * 数据源类型定义（补充）
 */

/**
 * 数据源状态
 */
export type DataSourceState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 数据源响应
 */
export interface DataSourceResponse<T = any> {
  /** 数据 */
  data: T;
  /** 状态码 */
  code?: number;
  /** 消息 */
  message?: string;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: Error;
}

/**
 * 数据源请求配置
 */
export interface DataSourceRequestConfig {
  /** 是否显示加载状态 */
  showLoading?: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 是否显示错误提示 */
  showError?: boolean;
  /** 超时时间 */
  timeout?: number;
  /** 重试次数 */
  retries?: number;
  /** 缓存配置 */
  cache?: CacheConfig;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean;
  /** 缓存时间（毫秒） */
  ttl: number;
  /** 缓存键 */
  key?: string;
}

/**
 * 数据源事件
 */
export interface DataSourceEvents {
  /** 请求开始 */
  onStart?: () => void;
  /** 请求成功 */
  onSuccess?: (data: any) => void;
  /** 请求失败 */
  onError?: (error: Error) => void;
  /** 请求完成（无论成功失败） */
  onComplete?: () => void;
}



