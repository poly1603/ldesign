/**
 * 通用类型定义
 */

// 基础类型
export type Primitive = string | number | boolean | null | undefined

// 深度可选类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 深度必需类型
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

// 函数类型
export type AnyFunction = (...args: any[]) => any

// 对象类型
export type AnyObject = Record<string, any>

// 组件类型
export type ComponentType = string | any

// 尺寸类型
export type SizeType = 'small' | 'medium' | 'large'

// 位置类型
export type PositionType = 'left' | 'center' | 'right' | 'top' | 'bottom'

// 对齐方式
export type AlignType = 'left' | 'center' | 'right'

// 主题类型
export type ThemeType = 'light' | 'dark' | 'auto'

// 状态类型
export type StatusType = 'success' | 'warning' | 'error' | 'info'

// 模式类型
export type ModeType = 'edit' | 'view' | 'disabled' | 'print' | 'demo'

// 响应式断点
export type BreakpointType = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// 响应式配置
export type ResponsiveValue<T> = T | Partial<Record<BreakpointType, T>>

// 条件函数类型
export type ConditionalFunction<T = boolean> = (formData: AnyObject, fieldValue?: any) => T

// 异步条件函数类型
export type AsyncConditionalFunction<T = boolean> = (formData: AnyObject, fieldValue?: any) => Promise<T>

// 动态属性函数类型
export type DynamicPropsFunction = (formData: AnyObject, fieldValue?: any) => AnyObject

// 选项类型
export interface OptionItem {
  label: string
  value: any
  disabled?: boolean
  children?: OptionItem[]
  [key: string]: any
}

// 选项加载器类型
export type OptionsLoader = (formData: AnyObject, fieldValue?: any) => Promise<OptionItem[]>

// 键值对类型
export type KeyValuePair<T = any> = Record<string, T>

// 错误信息类型
export interface ErrorInfo {
  message: string
  code?: string | number
  field?: string
  type?: string
}

// 版本信息类型
export interface VersionInfo {
  id: string
  timestamp: Date
  description?: string
  data: AnyObject
  metadata?: AnyObject
}

// 用户信息类型
export interface UserInfo {
  id: string
  name: string
  avatar?: string
  role?: string
  permissions?: string[]
}

// 文件信息类型
export interface FileInfo {
  name: string
  size: number
  type: string
  url?: string
  data?: ArrayBuffer | string
}

// 坐标类型
export interface Position {
  x: number
  y: number
}

// 尺寸类型
export interface Size {
  width: number
  height: number
}

// 矩形区域类型
export interface Rect extends Position, Size {}

// 时间范围类型
export interface TimeRange {
  start: Date
  end: Date
}

// 分页信息类型
export interface PaginationInfo {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
}

// 排序信息类型
export interface SortInfo {
  field: string
  order: 'asc' | 'desc'
}

// 筛选信息类型
export interface FilterInfo {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex'
  value: any
}

// 搜索信息类型
export interface SearchInfo {
  keyword: string
  fields?: string[]
  caseSensitive?: boolean
  wholeWord?: boolean
  regex?: boolean
}

// 导出格式类型
export type ExportFormat = 'json' | 'csv' | 'excel' | 'xml' | 'pdf'

// 导入格式类型
export type ImportFormat = 'json' | 'csv' | 'excel' | 'xml'

// 存储类型
export type StorageType = 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory'

// 网络状态类型
export type NetworkStatus = 'online' | 'offline' | 'slow'

// 设备类型
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

// 浏览器类型
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie' | 'other'

// 操作系统类型
export type OSType = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'other'

// 语言代码类型
export type LanguageCode = 'zh-CN' | 'zh-TW' | 'en-US' | 'en-GB' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'de-DE' | 'es-ES' | 'pt-BR' | 'ru-RU' | 'ar-SA'

// 货币代码类型
export type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'KRW' | 'HKD' | 'TWD'

// 时区类型
export type TimezoneType = string // 'Asia/Shanghai', 'America/New_York', etc.

// 日期格式类型
export type DateFormatType = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY年MM月DD日'

// 时间格式类型
export type TimeFormatType = 'HH:mm:ss' | 'HH:mm' | 'hh:mm:ss A' | 'hh:mm A'

// 数字格式类型
export interface NumberFormatOptions {
  locale?: string
  style?: 'decimal' | 'currency' | 'percent'
  currency?: CurrencyCode
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
}

// 颜色类型
export type ColorType = string // hex, rgb, rgba, hsl, hsla, named colors

// CSS单位类型
export type CSSUnit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw' | 'vmin' | 'vmax'

// CSS值类型
export type CSSValue = string | number

// 动画类型
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'flip' | 'bounce' | 'none'

// 缓动函数类型
export type EasingType = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier'

// 触发器类型
export type TriggerType = 'click' | 'hover' | 'focus' | 'manual'

// 放置位置类型
export type PlacementType = 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'

// 工具提示类型
export interface TooltipConfig {
  content: string
  placement?: PlacementType
  trigger?: TriggerType
  delay?: number
  disabled?: boolean
}

// 快捷键配置类型
export interface ShortcutConfig {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

// 拖拽配置类型
export interface DragConfig {
  enabled: boolean
  handle?: string
  cancel?: string
  axis?: 'x' | 'y' | 'both'
  grid?: [number, number]
  bounds?: string | Rect
}

// 调试信息类型
export interface DebugInfo {
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: any
  stack?: string
}

// 性能指标类型
export interface PerformanceMetrics {
  renderTime: number
  validationTime: number
  submitTime: number
  memoryUsage: string
  componentCount: number
  updateCount: number
}

// 统计信息类型
export interface StatisticsInfo {
  fieldChanges: number
  validationErrors: number
  submitAttempts: number
  successfulSubmits: number
  abandonedForms: number
  averageCompletionTime: number
  mostUsedFields: string[]
  errorProneFields: string[]
}

// 环境信息类型
export interface EnvironmentInfo {
  userAgent: string
  platform: string
  language: string
  timezone: string
  screenResolution: Size
  viewportSize: Size
  deviceType: DeviceType
  browserType: BrowserType
  osType: OSType
  networkStatus: NetworkStatus
  cookieEnabled: boolean
  localStorageEnabled: boolean
  sessionStorageEnabled: boolean
}
