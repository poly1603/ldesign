/**
 * 共享类型定义
 * 跨框架共享的类型
 */

/**
 * 可能为空的类型
 */
export type Nullable<T> = T | null

/**
 * 可选的类型
 */
export type Optional<T> = T | undefined

/**
 * 深度只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度部分
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 提取Promise类型
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

/**
 * 提取数组类型
 */
export type UnwrapArray<T> = T extends Array<infer U> ? U : T

/**
 * 函数类型
 */
export type AnyFunction = (...args: any[]) => any

/**
 * 异步函数类型
 */
export type AsyncFunction = (...args: any[]) => Promise<any>

/**
 * 构造函数类型
 */
export type Constructor<T = {}> = new (...args: any[]) => T

/**
 * 键值对
 */
export type KeyValue<T = any> = Record<string, T>

/**
 * 样式对象
 */
export interface StyleObject {
  [key: string]: string | number | StyleObject
}

/**
 * 尺寸
 */
export interface Size {
  width: number
  height: number
}

/**
 * 位置
 */
export interface Position {
  x: number
  y: number
}

/**
 * 矩形
 */
export interface Rectangle extends Size, Position { }

/**
 * 边距
 */
export interface Padding {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

/**
 * 响应式断点
 */
export interface Breakpoints {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  xxl?: number
}

/**
 * 数据状态
 */
export type DataState<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * 分页信息
 */
export interface Pagination {
  current: number
  pageSize: number
  total: number
  totalPages?: number
}

/**
 * 排序信息
 */
export interface SortInfo {
  field: string
  order: 'asc' | 'desc'
}

/**
 * 过滤条件
 */
export interface FilterCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex'
  value: any
}

/**
 * 树节点
 */
export interface TreeNode<T = any> {
  id: string | number
  parentId?: string | number | null
  children?: TreeNode<T>[]
  data?: T
  expanded?: boolean
  selected?: boolean
  disabled?: boolean
}

/**
 * 菜单项
 */
export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
  visible?: boolean
  badge?: string | number
  meta?: Record<string, any>
}

/**
 * 表单字段
 */
export interface FormField {
  name: string
  label?: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'textarea' | 'custom'
  value?: any
  defaultValue?: any
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  rules?: ValidationRule[]
  options?: SelectOption[]
  meta?: Record<string, any>
}

/**
 * 选择项
 */
export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  children?: SelectOption[]
}

/**
 * 验证规则
 */
export interface ValidationRule {
  type?: 'required' | 'email' | 'url' | 'number' | 'min' | 'max' | 'pattern' | 'custom'
  message?: string
  value?: any
  validator?: (value: any, field: FormField) => boolean | string | Promise<boolean | string>
}

/**
 * 颜色
 */
export interface Color {
  hex?: string
  rgb?: { r: number; g: number; b: number }
  hsl?: { h: number; s: number; l: number }
  alpha?: number
}

/**
 * 渐变
 */
export interface Gradient {
  type: 'linear' | 'radial' | 'conic'
  angle?: number
  stops: Array<{
    color: string
    position: number
  }>
}

/**
 * 阴影
 */
export interface Shadow {
  x: number
  y: number
  blur: number
  spread?: number
  color: string
  inset?: boolean
}

/**
 * 动画关键帧
 */
export interface Keyframe {
  offset: number
  [property: string]: any
}

/**
 * 文件信息
 */
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  url?: string
  path?: string
}

/**
 * 响应结果
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: number
    requestId: string
    [key: string]: any
  }
}

/**
 * 事件处理器
 */
export type EventHandler<T = Event> = (event: T) => void | Promise<void>

/**
 * 清理函数
 */
export type CleanupFunction = () => void

/**
 * 取消令牌
 */
export interface CancelToken {
  promise: Promise<void>
  cancel: (reason?: any) => void
  cancelled: boolean
}

export default {}
