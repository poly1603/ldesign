/**
 * 表单相关类型定义
 */

import type { Ref, VNode, Component } from 'vue'
import type { 
  AnyObject, 
  ModeType, 
  ThemeType, 
  SizeType,
  ConditionalFunction,
  LanguageCode,
  StorageType,
  ExportFormat,
  ImportFormat,
  UserInfo,
  VersionInfo,
  PerformanceMetrics,
  StatisticsInfo
} from './common'
import type { FormFieldItem, FormFieldConfig } from './field'
import type { LayoutConfig } from './layout'
import type { ValidationConfig, FormValidationResult } from './validation'
import type { EventBus, EventType, EventListener } from './events'

// 表单状态
export interface FormState {
  // 基础状态
  isDirty: boolean              // 是否有未保存的更改
  isValid: boolean              // 是否验证通过
  isSubmitting: boolean         // 是否正在提交
  isLoading: boolean            // 是否正在加载
  
  // 扩展状态
  isAutoSaving: boolean         // 是否正在自动保存
  hasUnsavedChanges: boolean    // 是否有未保存更改
  lastSaved: Date | null        // 最后保存时间
  lastValidated: Date | null    // 最后验证时间
  
  // 操作历史
  canUndo: boolean              // 是否可以撤销
  canRedo: boolean              // 是否可以重做
  historyIndex: number          // 历史记录索引
  historySize: number           // 历史记录大小
  
  // 模式状态
  mode: ModeType                // 表单模式
  theme: ThemeType              // 主题模式
  size: SizeType                // 表单大小
  
  // 布局状态
  collapsed: boolean            // 是否收起
  expanded: boolean             // 是否展开
  fullscreen: boolean           // 是否全屏
  
  // 网络状态
  online: boolean               // 是否在线
  synced: boolean               // 是否已同步
  
  // 错误状态
  hasErrors: boolean            // 是否有错误
  errorCount: number            // 错误数量
  warningCount: number          // 警告数量
  
  // 统计信息
  fieldCount: number            // 字段总数
  visibleFieldCount: number     // 可见字段数
  requiredFieldCount: number    // 必填字段数
  completedFieldCount: number   // 已完成字段数
}

// 表单配置
export interface FormConfig {
  // 基础配置
  name?: string                 // 表单名称
  title?: string                // 表单标题
  description?: string          // 表单描述
  version?: string              // 表单版本
  
  // 字段配置
  fields: FormFieldItem[]       // 字段列表
  
  // 布局配置
  layout?: LayoutConfig         // 布局配置
  
  // 验证配置
  validation?: ValidationConfig // 验证配置
  
  // 主题配置
  theme?: ThemeConfig           // 主题配置
  
  // 国际化配置
  i18n?: I18nConfig            // 国际化配置
  
  // 持久化配置
  persistence?: PersistenceConfig // 持久化配置
  
  // 导入导出配置
  importExport?: ImportExportConfig // 导入导出配置
  
  // 快捷键配置
  shortcuts?: ShortcutConfig    // 快捷键配置
  
  // 无障碍配置
  accessibility?: AccessibilityConfig // 无障碍配置
  
  // 性能配置
  performance?: PerformanceConfig // 性能配置
  
  // 调试配置
  debug?: DebugConfig          // 调试配置
  
  // 分析配置
  analytics?: AnalyticsConfig   // 分析配置
  
  // 协作配置
  collaboration?: CollaborationConfig // 协作配置
  
  // 安全配置
  security?: SecurityConfig     // 安全配置
  
  // 插件配置
  plugins?: PluginConfig[]      // 插件配置
  
  // 自定义配置
  custom?: AnyObject           // 自定义配置
}

// 主题配置
export interface ThemeConfig {
  // 主题名称
  name?: string
  
  // 主题类型
  type?: ThemeType
  
  // 主题变量
  variables?: Record<string, string | number>
  
  // 自定义样式
  styles?: AnyObject
  
  // 样式类名
  className?: string
  
  // 暗色模式
  darkMode?: boolean | 'auto'
  
  // 高对比度
  highContrast?: boolean
  
  // 紧凑模式
  compact?: boolean
  
  // 自定义主题
  custom?: {
    colors?: Record<string, string>
    fonts?: Record<string, string>
    sizes?: Record<string, string | number>
    spacing?: Record<string, string | number>
    borders?: Record<string, string>
    shadows?: Record<string, string>
    animations?: Record<string, string>
  }
}

// 国际化配置
export interface I18nConfig {
  // 是否启用
  enabled?: boolean
  
  // 默认语言
  locale?: LanguageCode
  
  // 支持的语言
  locales?: LanguageCode[]
  
  // 回退语言
  fallback?: LanguageCode
  
  // 消息字典
  messages?: Record<LanguageCode, Record<string, string>>
  
  // 自动检测语言
  autoDetect?: boolean
  
  // 自动翻译
  autoTranslate?: {
    enabled?: boolean
    provider?: 'google' | 'baidu' | 'youdao' | 'custom'
    apiKey?: string
    cache?: boolean
  }
  
  // 本地化配置
  localization?: {
    dateFormat?: boolean
    numberFormat?: boolean
    currencyFormat?: boolean
    timeFormat?: boolean
    rtl?: boolean
  }
  
  // 语言切换
  switcher?: {
    enabled?: boolean
    position?: 'header' | 'footer' | 'floating'
    showFlag?: boolean
    showName?: boolean
  }
}

// 持久化配置
export interface PersistenceConfig {
  // 是否启用
  enabled?: boolean
  
  // 存储类型
  storage?: StorageType
  
  // 存储键
  key?: string
  
  // 自动保存
  autoSave?: {
    enabled?: boolean
    interval?: number           // 自动保存间隔（毫秒）
    debounce?: number          // 防抖延迟（毫秒）
  }
  
  // 版本控制
  versioning?: {
    enabled?: boolean
    maxVersions?: number
    autoVersion?: boolean
    versionInterval?: number
  }
  
  // 数据压缩
  compression?: {
    enabled?: boolean
    algorithm?: 'gzip' | 'lz4' | 'brotli'
  }
  
  // 数据加密
  encryption?: {
    enabled?: boolean
    algorithm?: 'AES-256' | 'RSA'
    key?: string
  }
  
  // 同步配置
  sync?: {
    enabled?: boolean
    url?: string
    method?: 'POST' | 'PUT' | 'PATCH'
    headers?: Record<string, string>
    interval?: number
  }
  
  // 冲突解决
  conflictResolution?: 'client' | 'server' | 'manual' | 'merge'
}

// 导入导出配置
export interface ImportExportConfig {
  // 支持的格式
  formats?: (ExportFormat | ImportFormat)[]
  
  // 导出配置
  export?: {
    filename?: string
    includeEmpty?: boolean
    includeMetadata?: boolean
    includeValidation?: boolean
    template?: boolean
  }
  
  // 导入配置
  import?: {
    validateOnImport?: boolean
    mergeMode?: 'replace' | 'merge' | 'append'
    fieldMapping?: Record<string, string>
    dataTransform?: (data: AnyObject) => AnyObject
  }
  
  // 模板配置
  template?: {
    enabled?: boolean
    customTemplates?: Record<string, AnyObject>
  }
}

// 快捷键配置
export interface ShortcutConfig {
  // 是否启用
  enabled?: boolean
  
  // 快捷键映射
  shortcuts?: Record<string, string | string[]>
  
  // 全局快捷键
  global?: boolean
  
  // 快捷键提示
  showHints?: boolean
  
  // 自定义快捷键
  custom?: Record<string, {
    keys: string[]
    description?: string
    handler: () => void
  }>
}

// 无障碍配置
export interface AccessibilityConfig {
  // 是否启用
  enabled?: boolean
  
  // 键盘导航
  keyboardNavigation?: boolean
  
  // 屏幕阅读器
  screenReader?: {
    enabled?: boolean
    announceChanges?: boolean
    announceErrors?: boolean
    customAnnouncements?: Record<string, string>
  }
  
  // 高对比度
  highContrast?: boolean
  
  // 字体大小
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large'
  
  // 焦点指示器
  focusIndicator?: {
    enabled?: boolean
    style?: AnyObject
  }
  
  // 跳转链接
  skipLinks?: {
    enabled?: boolean
    links?: Array<{ text: string; target: string }>
  }
}

// 性能配置
export interface PerformanceConfig {
  // 虚拟滚动
  virtualScroll?: {
    enabled?: boolean
    itemHeight?: number
    threshold?: number
  }
  
  // 懒加载
  lazyLoad?: {
    enabled?: boolean
    threshold?: number
    placeholder?: string
  }
  
  // 防抖配置
  debounce?: {
    validation?: number
    onChange?: number
    autoSave?: number
  }
  
  // 节流配置
  throttle?: {
    scroll?: number
    resize?: number
    input?: number
  }
  
  // 缓存配置
  cache?: {
    enabled?: boolean
    maxSize?: number
    ttl?: number
  }
  
  // 预加载
  preload?: {
    enabled?: boolean
    fields?: string[]
    data?: boolean
  }
}

// 调试配置
export interface DebugConfig {
  // 是否启用
  enabled?: boolean
  
  // 调试级别
  level?: 'debug' | 'info' | 'warn' | 'error'
  
  // 显示字段信息
  showFieldInfo?: boolean
  
  // 显示验证信息
  showValidationInfo?: boolean
  
  // 显示性能信息
  showPerformanceInfo?: boolean
  
  // 记录变更
  logChanges?: boolean
  
  // 记录事件
  logEvents?: boolean
  
  // 控制台输出
  console?: boolean
  
  // 可视化调试
  visualDebug?: boolean
}

// 分析配置
export interface AnalyticsConfig {
  // 是否启用
  enabled?: boolean
  
  // 跟踪事件
  trackEvents?: EventType[]
  
  // 自定义事件
  customEvents?: Record<string, (data: AnyObject) => void>
  
  // 数据收集
  dataCollection?: {
    userBehavior?: boolean
    performance?: boolean
    errors?: boolean
    usage?: boolean
  }
  
  // 数据上报
  reporting?: {
    enabled?: boolean
    url?: string
    interval?: number
    batchSize?: number
  }
  
  // 隐私保护
  privacy?: {
    anonymize?: boolean
    excludeFields?: string[]
    dataRetention?: number
  }
}

// 协作配置
export interface CollaborationConfig {
  // 是否启用
  enabled?: boolean
  
  // 实时协作
  realtime?: {
    enabled?: boolean
    url?: string
    showCursors?: boolean
    showEditing?: boolean
    conflictResolution?: 'last-write-wins' | 'merge' | 'manual'
  }
  
  // 评论系统
  comments?: {
    enabled?: boolean
    allowFieldComments?: boolean
    allowFormComments?: boolean
  }
  
  // 审批流程
  approval?: {
    enabled?: boolean
    workflow?: Array<{
      role: string
      action: 'review' | 'approve' | 'reject'
      required?: boolean
    }>
    notifications?: boolean
  }
  
  // 权限控制
  permissions?: {
    enabled?: boolean
    roles?: Record<string, string[]>
    fieldPermissions?: Record<string, string[]>
  }
}

// 安全配置
export interface SecurityConfig {
  // 数据加密
  encryption?: {
    enabled?: boolean
    algorithm?: 'AES-256' | 'RSA'
    fields?: string[]
  }
  
  // 访问控制
  accessControl?: {
    enabled?: boolean
    permissions?: Record<string, string[]>
    roles?: string[]
  }
  
  // 审计日志
  audit?: {
    enabled?: boolean
    logLevel?: 'basic' | 'detailed' | 'full'
    retention?: number
  }
  
  // 防护措施
  protection?: {
    xss?: boolean
    csrf?: boolean
    sqlInjection?: boolean
    rateLimiting?: boolean
    captcha?: boolean
  }
  
  // 数据脱敏
  dataMasking?: {
    enabled?: boolean
    fields?: string[]
    maskChar?: string
    preserveLength?: boolean
  }
}

// 插件配置
export interface PluginConfig {
  // 插件名称
  name: string
  
  // 插件版本
  version?: string
  
  // 是否启用
  enabled?: boolean
  
  // 插件选项
  options?: AnyObject
  
  // 插件依赖
  dependencies?: string[]
  
  // 加载优先级
  priority?: number
}

// 表单实例接口
export interface FormInstance {
  // 基础属性
  id: string
  config: FormConfig
  state: Ref<FormState>
  
  // 数据操作
  setFormData(data: AnyObject): void
  getFormData(): AnyObject
  setFieldValue(path: string, value: any): void
  getFieldValue(path: string): any
  
  // 验证操作
  validate(): Promise<FormValidationResult>
  validateField(path: string): Promise<boolean>
  clearValidation(path?: string): void
  
  // 表单操作
  reset(): void
  clear(): void
  submit(): Promise<{ data: AnyObject; valid: boolean }>
  
  // 状态操作
  setMode(mode: ModeType): void
  setTheme(theme: ThemeType): void
  setSize(size: SizeType): void
  
  // 布局操作
  expand(): void
  collapse(): void
  toggleExpand(): void
  
  // 历史操作
  undo(): boolean
  redo(): boolean
  saveSnapshot(description?: string): void
  
  // 持久化操作
  save(): Promise<void>
  load(): Promise<void>
  autoSave(enabled?: boolean): void
  
  // 导入导出
  exportData(format: ExportFormat, options?: AnyObject): Promise<string | Blob>
  importData(data: string | File, format: ImportFormat, options?: AnyObject): Promise<void>
  
  // 事件系统
  on(type: EventType, listener: EventListener): () => void
  off(type: EventType, listener?: EventListener): void
  emit(type: EventType, data?: AnyObject): void
  
  // 插件系统
  use(plugin: any, options?: AnyObject): void
  unuse(pluginName: string): void
  
  // 工具方法
  clone(): FormInstance
  destroy(): void
  
  // 调试方法
  getDebugInfo(): AnyObject
  getPerformanceMetrics(): PerformanceMetrics
  getStatistics(): StatisticsInfo
}

// 表单工厂函数类型
export type FormFactory = (config: FormConfig) => FormInstance

// 表单构建器接口
export interface FormBuilder {
  // 基础方法
  field(name: string): FieldBuilder
  group(name: string, title?: string): GroupBuilder
  actions(): ActionBuilder
  
  // 配置方法
  layout(config: Partial<LayoutConfig>): FormBuilder
  validation(config: Partial<ValidationConfig>): FormBuilder
  theme(config: Partial<ThemeConfig>): FormBuilder
  
  // 构建方法
  build(): FormConfig
  create(): FormInstance
}

// 字段构建器接口
export interface FieldBuilder {
  title(title: string): FieldBuilder
  component(component: string): FieldBuilder
  props(props: AnyObject): FieldBuilder
  required(required?: boolean): FieldBuilder
  disabled(disabled?: boolean): FieldBuilder
  hidden(hidden?: boolean): FieldBuilder
  span(span: number | string): FieldBuilder
  rules(rules: any[]): FieldBuilder
  defaultValue(value: any): FieldBuilder
  
  // 类型方法
  input(type?: string): FieldBuilder
  textarea(rows?: number): FieldBuilder
  select(options: any[]): FieldBuilder
  radio(options: any[]): FieldBuilder
  checkbox(options: any[]): FieldBuilder
  switch(): FieldBuilder
  slider(min?: number, max?: number): FieldBuilder
  rate(max?: number): FieldBuilder
  datePicker(format?: string): FieldBuilder
  timePicker(format?: string): FieldBuilder
  
  // 验证方法
  email(): FieldBuilder
  phone(): FieldBuilder
  url(): FieldBuilder
  number(min?: number, max?: number): FieldBuilder
  minLength(length: number): FieldBuilder
  maxLength(length: number): FieldBuilder
  pattern(pattern: RegExp): FieldBuilder
  
  // 完成方法
  end(): FormBuilder
}

// 分组构建器接口
export interface GroupBuilder {
  title(title: string): GroupBuilder
  description(description: string): GroupBuilder
  collapsible(collapsible?: boolean): GroupBuilder
  collapsed(collapsed?: boolean): GroupBuilder
  field(name: string): FieldBuilder
  
  // 完成方法
  endGroup(): FormBuilder
}

// 按钮组构建器接口
export interface ActionBuilder {
  button(type: string, text?: string): ActionBuilder
  submit(text?: string): ActionBuilder
  reset(text?: string): ActionBuilder
  custom(text: string, handler: () => void): ActionBuilder
  position(position: string): ActionBuilder
  align(align: string): ActionBuilder
  
  // 完成方法
  endActions(): FormBuilder
}

// Vue组合式函数返回类型
export interface UseFormReturn {
  // 响应式数据
  formData: Ref<AnyObject>
  formState: Ref<FormState>
  errors: Ref<Record<string, string>>
  
  // 表单实例
  formInstance: Ref<FormInstance | null>
  
  // 操作方法
  setFormData: (data: AnyObject) => void
  getFormData: () => AnyObject
  setFieldValue: (path: string, value: any) => void
  getFieldValue: (path: string) => any
  validate: () => Promise<FormValidationResult>
  validateField: (path: string) => Promise<boolean>
  reset: () => void
  submit: () => Promise<{ data: AnyObject; valid: boolean }>
  
  // 渲染方法
  renderForm: () => VNode
  
  // 工具方法
  undo: () => boolean
  redo: () => boolean
  save: () => Promise<void>
  load: () => Promise<void>
}

// 表单组件属性类型
export interface FormComponentProps {
  modelValue?: AnyObject
  config?: FormConfig
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  size?: SizeType
  mode?: ModeType
  theme?: ThemeType
}

// 表单组件事件类型
export interface FormComponentEmits {
  'update:modelValue': [value: AnyObject]
  'submit': [data: AnyObject, valid: boolean]
  'change': [data: AnyObject, field: string, value: any]
  'validate': [valid: boolean, errors: Record<string, string>]
  'reset': [data: AnyObject]
  'error': [error: Error]
  'ready': [instance: FormInstance]
}
