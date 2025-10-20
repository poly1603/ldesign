/**
 * 高级类型定义
 * 提供泛型和高级类型支持
 */

/**
 * 通用回调类型
 */
export type Callback<T = void> = (data: T) => void;

/**
 * 异步回调类型
 */
export type AsyncCallback<T = void> = (data: T) => Promise<void>;

/**
 * 可选类型
 */
export type Optional<T> = T | undefined;

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 坐标点元组
 */
export type Point = [x: number, y: number];

/**
 * 矩形边界
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 变换矩阵
 */
export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation?: number;
}

/**
 * 事件处理器映射
 */
export interface EventHandlers<T extends Record<string, any>> {
  [K: string]: Callback<T[K]>;
}

/**
 * 插件接口
 */
export interface Plugin<T = any> {
  name: string;
  version: string;
  install(context: T): void;
  uninstall?(context: T): void;
}

/**
 * 序列化接口
 */
export interface Serializable<T> {
  serialize(): string;
  deserialize(data: string): T;
}

/**
 * 可取消的操作
 */
export interface Cancellable {
  cancel(): void;
  isCancelled(): boolean;
}

/**
 * 带元数据的节点
 */
export interface NodeWithMetadata<T = any> {
  id: string;
  metadata?: T;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 操作结果
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * 布局算法类型
 */
export type LayoutAlgorithm = 
  | 'dagre'
  | 'force'
  | 'circular'
  | 'grid'
  | 'tree'
  | 'custom';

/**
 * 渲染器类型
 */
export type RendererType = 
  | 'svg'
  | 'canvas'
  | 'webgl';

/**
 * 动画配置
 */
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;
  delay?: number;
  iterations?: number;
}

/**
 * 虚拟化配置
 */
export interface VirtualizationConfig {
  enabled: boolean;
  bufferSize: number;
  viewportPadding: number;
  minNodeSize: number;
}

/**
 * 主题变量
 */
export interface ThemeVariables {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
  fontSize: number;
  borderRadius: number;
}

/**
 * 历史记录条目
 */
export interface HistoryEntry<T = any> {
  id: string;
  timestamp: number;
  action: string;
  data: T;
  previousState?: T;
}

/**
 * 验证规则
 */
export interface ValidationRule<T = any> {
  name: string;
  validator: (value: T) => boolean;
  message?: string;
}

/**
 * 过滤器配置
 */
export interface FilterConfig<T> {
  field: keyof T;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  page: number;
  pageSize: number;
  total?: number;
}

/**
 * 导出配置
 */
export interface ExportConfig {
  format: 'json' | 'svg' | 'png' | 'pdf';
  scale?: number;
  quality?: number;
  backgroundColor?: string;
  padding?: number;
}

/**
 * 拖拽数据
 */
export interface DragData<T = any> {
  type: string;
  payload: T;
  offset?: { x: number; y: number };
}

/**
 * 命令模式接口
 */
export interface Command<T = any> {
  id: string;
  execute(): T;
  undo(): void;
  redo?(): void;
  canExecute?(): boolean;
}

/**
 * 观察者接口
 */
export interface Observer<T> {
  update(data: T): void;
}

/**
 * 可观察对象接口
 */
export interface Observable<T> {
  subscribe(observer: Observer<T>): void;
  unsubscribe(observer: Observer<T>): void;
  notify(data: T): void;
}

/**
 * 键值对映射
 */
export type Dictionary<T> = Record<string, T>;

/**
 * 类型保护
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * 提取Promise类型
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * 提取数组元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * 排除类型中的函数
 */
export type ExcludeFunctions<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

/**
 * 必须包含某些属性
 */
export type RequiredKeys<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

/**
 * 类型安全的Omit
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;