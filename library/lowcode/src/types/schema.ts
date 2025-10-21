/**
 * Schema 类型定义
 * 低代码平台的核心数据结构
 */

import type { DataBinding } from './databinding';
import type { LayoutConfig } from './layout';

/**
 * 低代码 Schema
 */
export interface LowcodeSchema {
  /** Schema 版本 */
  version: string;
  /** 根组件列表 */
  components: ComponentNode[];
  /** 数据源配置 */
  datasources: DataSource[];
  /** 全局变量 */
  variables: Record<string, any>;
  /** 方法定义 */
  methods: Method[];
  /** 生命周期钩子 */
  lifecycle?: LifecycleHooks;
  /** 全局配置 */
  config?: GlobalConfig;
}

/**
 * 组件节点
 */
export interface ComponentNode {
  /** 唯一标识 */
  id: string;
  /** 组件类型 */
  type: string;
  /** 组件属性 */
  props: Record<string, any>;
  /** 事件绑定 */
  events: Record<string, EventHandler>;
  /** 子组件 */
  children: ComponentNode[];
  /** 布局配置 */
  layout: LayoutConfig;
  /** 数据绑定 */
  dataBinding?: Record<string, DataBinding>;
  /** 样式 */
  styles?: Record<string, any>;
  /** 条件渲染 */
  condition?: string;
  /** 循环渲染 */
  loop?: LoopConfig;
  /** 插槽内容 */
  slots?: Record<string, ComponentNode[]>;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 是否锁定（不可编辑） */
  locked?: boolean;
}

/**
 * 数据源定义
 */
export interface DataSource {
  /** 唯一标识 */
  id: string;
  /** 数据源名称 */
  name: string;
  /** 数据源类型 */
  type: 'rest' | 'graphql' | 'websocket' | 'mock';
  /** 配置 */
  config: RestConfig | GraphQLConfig | WebSocketConfig | MockConfig;
  /** 是否自动加载 */
  autoLoad?: boolean;
  /** 数据转换器 */
  transformer?: string;
}

/**
 * REST API 配置
 */
export interface RestConfig {
  /** API 地址 */
  url: string;
  /** 请求方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 请求头 */
  headers?: Record<string, string>;
  /** URL 参数 */
  params?: Record<string, any>;
  /** 请求体 */
  body?: any;
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * GraphQL 配置
 */
export interface GraphQLConfig {
  /** GraphQL 端点 */
  endpoint: string;
  /** 查询语句 */
  query: string;
  /** 变量 */
  variables?: Record<string, any>;
  /** 请求头 */
  headers?: Record<string, string>;
}

/**
 * WebSocket 配置
 */
export interface WebSocketConfig {
  /** WebSocket 地址 */
  url: string;
  /** 协议 */
  protocols?: string | string[];
  /** 心跳间隔（毫秒） */
  heartbeat?: number;
  /** 重连配置 */
  reconnect?: {
    enabled: boolean;
    maxRetries: number;
    delay: number;
  };
}

/**
 * Mock 数据配置
 */
export interface MockConfig {
  /** Mock 数据 */
  data: any;
  /** 延迟时间（毫秒） */
  delay?: number;
}

/**
 * 方法定义
 */
export interface Method {
  /** 方法名 */
  name: string;
  /** 方法体（字符串形式） */
  body: string;
  /** 参数列表 */
  params?: string[];
  /** 是否异步 */
  async?: boolean;
}

/**
 * 事件处理器
 */
export interface EventHandler {
  /** 处理器类型 */
  type: 'method' | 'code' | 'datasource';
  /** 方法名或代码 */
  value: string;
  /** 参数 */
  params?: any[];
}

/**
 * 循环配置
 */
export interface LoopConfig {
  /** 数据源 */
  data: string;
  /** 循环变量名 */
  item: string;
  /** 索引变量名 */
  index?: string;
  /** 唯一键 */
  key?: string;
}

/**
 * 生命周期钩子
 */
export interface LifecycleHooks {
  /** 创建前 */
  beforeCreate?: string;
  /** 创建后 */
  created?: string;
  /** 挂载前 */
  beforeMount?: string;
  /** 挂载后 */
  mounted?: string;
  /** 更新前 */
  beforeUpdate?: string;
  /** 更新后 */
  updated?: string;
  /** 销毁前 */
  beforeUnmount?: string;
  /** 销毁后 */
  unmounted?: string;
}

/**
 * 全局配置
 */
export interface GlobalConfig {
  /** 页面标题 */
  title?: string;
  /** 页面描述 */
  description?: string;
  /** 主题配置 */
  theme?: ThemeConfig;
  /** 响应式断点 */
  breakpoints?: Record<string, number>;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主色 */
  primaryColor?: string;
  /** 成功色 */
  successColor?: string;
  /** 警告色 */
  warningColor?: string;
  /** 错误色 */
  errorColor?: string;
  /** 字体 */
  fontFamily?: string;
  /** 圆角 */
  borderRadius?: string;
}

/**
 * Schema 验证结果
 */
export interface SchemaValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors?: SchemaValidationError[];
}

/**
 * Schema 验证错误
 */
export interface SchemaValidationError {
  /** 错误路径 */
  path: string;
  /** 错误消息 */
  message: string;
  /** 错误类型 */
  type: string;
}



