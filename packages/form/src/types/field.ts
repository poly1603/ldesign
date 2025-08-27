/**
 * 字段相关类型定义
 */

import type {
  ComponentType,
  AnyObject,
  ConditionalFunction,
  DynamicPropsFunction,
  OptionItem,
  OptionsLoader,
  ResponsiveValue,
  SizeType,
  StatusType
} from './common'
import type { ValidationRule } from './validation'

// 字段类型
export type FieldType = 'field' | 'group' | 'actions'

// 内置组件类型
export type BuiltinComponentType =
  | 'FormInput'
  | 'FormTextarea'
  | 'FormSelect'
  | 'FormRadio'
  | 'FormCheckbox'
  | 'FormSwitch'
  | 'FormSlider'
  | 'FormRate'
  | 'FormDatePicker'
  | 'FormTimePicker'
  | 'FormDateTimePicker'
  | 'FormUpload'
  | 'FormColorPicker'
  | 'FormCascader'
  | 'FormTreeSelect'
  | 'FormTransfer'
  | 'FormAutoComplete'
  | 'FormMention'
  | 'FormInputNumber'
  | 'FormPassword'
  | 'FormSearch'
  | 'FormUrl'
  | 'FormEmail'
  | 'FormTel'
  | 'FormRange'
  | 'FormMonth'
  | 'FormWeek'
  | 'FormQuarter'
  | 'FormYear'

// 输入类型
export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'search'
  | 'hidden'
  | 'file'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'time'
  | 'week'
  | 'range'

// 字段状态
export type FieldStatus = 'normal' | 'success' | 'warning' | 'error' | 'validating'

// 字段模式
export type FieldMode = 'edit' | 'view' | 'disabled'

// 条件渲染配置
export interface ConditionalRenderConfig {
  // 依赖字段
  dependsOn: string | string[]

  // 显示条件
  show?: ConditionalFunction

  // 隐藏条件
  hide?: ConditionalFunction

  // 禁用条件
  disabled?: ConditionalFunction

  // 启用条件
  enabled?: ConditionalFunction

  // 必填条件
  required?: ConditionalFunction

  // 可选条件
  optional?: ConditionalFunction

  // 动态属性
  props?: DynamicPropsFunction

  // 动态验证规则
  rules?: (formData: AnyObject, fieldValue?: any) => ValidationRule[]

  // 动态选项
  options?: (formData: AnyObject, fieldValue?: any) => OptionItem[] | Promise<OptionItem[]>

  // 值变化回调
  onChange?: (newValue: any, formData: AnyObject, oldValue?: any) => void | Promise<void>

  // 防抖延迟（毫秒）
  debounce?: number

  // 节流间隔（毫秒）
  throttle?: number
}

// 选项配置
export interface OptionsConfig {
  // 静态选项
  options?: OptionItem[]

  // 动态选项加载器
  optionsLoader?: OptionsLoader

  // 依赖字段（当这些字段变化时重新加载选项）
  dependsOn?: string[]

  // 缓存配置
  cache?: {
    enabled?: boolean
    ttl?: number // 缓存时间（毫秒）
    key?: string | ((formData: AnyObject) => string) // 缓存键
  }

  // 加载配置
  loading?: {
    text?: string
    delay?: number // 延迟显示加载状态（毫秒）
  }

  // 错误处理
  error?: {
    retry?: boolean
    retryCount?: number
    retryDelay?: number
    fallback?: OptionItem[]
  }

  // 搜索配置
  search?: {
    enabled?: boolean
    placeholder?: string
    caseSensitive?: boolean
    highlightMatch?: boolean
    minLength?: number
    debounce?: number
  }

  // 分页配置
  pagination?: {
    enabled?: boolean
    pageSize?: number
    loadMore?: boolean
  }
}

// 基础字段配置
export interface BaseFieldConfig {
  // 字段名称（必需）
  name: string

  // 字段标题
  title?: string

  // 字段描述
  description?: string

  // 字段提示
  placeholder?: string

  // 字段帮助文本
  help?: string

  // 字段标签
  label?: string

  // 字段类型
  type?: FieldType

  // 组件类型
  component?: BuiltinComponentType | ComponentType

  // 默认值
  defaultValue?: any

  // 是否必填
  required?: boolean

  // 是否禁用
  disabled?: boolean | ConditionalFunction

  // 是否隐藏
  hidden?: boolean | ConditionalFunction

  // 是否只读
  readonly?: boolean | ConditionalFunction

  // 字段状态
  status?: FieldStatus

  // 字段模式
  mode?: FieldMode

  // 字段大小
  size?: SizeType

  // 字段样式类名
  className?: string

  // 字段样式
  style?: AnyObject

  // 字段属性
  attrs?: AnyObject

  // 组件属性（静态）
  props?: AnyObject

  // 动态组件属性
  dynamicProps?: DynamicPropsFunction

  // 验证规则
  rules?: ValidationRule[]

  // 条件渲染
  conditionalRender?: ConditionalRenderConfig

  // 选项配置
  optionsConfig?: OptionsConfig

  // 工具提示
  tooltip?: string | {
    content: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    trigger?: 'hover' | 'focus' | 'click'
  }

  // 前缀图标
  prefixIcon?: string

  // 后缀图标
  suffixIcon?: string

  // 前缀文本
  prefix?: string

  // 后缀文本
  suffix?: string

  // 前缀插槽
  prefixSlot?: string

  // 后缀插槽
  suffixSlot?: string

  // 自定义渲染函数
  render?: (value: any, formData: AnyObject, field: FormFieldConfig) => any

  // 自定义编辑渲染函数
  renderEdit?: (value: any, formData: AnyObject, field: FormFieldConfig) => any

  // 自定义查看渲染函数
  renderView?: (value: any, formData: AnyObject, field: FormFieldConfig) => any

  // 值格式化函数
  formatter?: (value: any) => any

  // 值解析函数
  parser?: (value: any) => any

  // 值变化回调
  onChange?: (value: any, formData: AnyObject, oldValue?: any) => void

  // 获得焦点回调
  onFocus?: (event: Event, formData: AnyObject) => void

  // 失去焦点回调
  onBlur?: (event: Event, formData: AnyObject) => void

  // 按键回调
  onKeydown?: (event: KeyboardEvent, formData: AnyObject) => void

  // 按键抬起回调
  onKeyup?: (event: KeyboardEvent, formData: AnyObject) => void

  // 输入回调
  onInput?: (event: Event, formData: AnyObject) => void

  // 点击回调
  onClick?: (event: Event, formData: AnyObject) => void

  // 双击回调
  onDoubleClick?: (event: Event, formData: AnyObject) => void

  // 右键回调
  onContextMenu?: (event: Event, formData: AnyObject) => void

  // 鼠标进入回调
  onMouseEnter?: (event: Event, formData: AnyObject) => void

  // 鼠标离开回调
  onMouseLeave?: (event: Event, formData: AnyObject) => void

  // 自定义事件监听器
  listeners?: Record<string, (event: Event, formData: AnyObject) => void>

  // 字段权限
  permissions?: string[]

  // 字段角色
  roles?: string[]

  // 字段标签
  tags?: string[]

  // 字段分类
  category?: string

  // 字段优先级
  priority?: number

  // 字段权重
  weight?: number

  // 字段版本
  version?: string

  // 字段作者
  author?: string

  // 字段创建时间
  createdAt?: Date

  // 字段更新时间
  updatedAt?: Date

  // 字段元数据
  metadata?: AnyObject

  // 字段扩展数据
  extra?: AnyObject
}

// 布局相关配置
export interface FieldLayoutConfig {
  // 占用列数
  span?: ResponsiveValue<number | string>

  // Grid列位置
  gridColumn?: ResponsiveValue<string | number>

  // Grid行位置
  gridRow?: ResponsiveValue<string | number>

  // Grid区域
  gridArea?: ResponsiveValue<string>

  // 偏移列数
  offset?: ResponsiveValue<number>

  // 推拉列数
  push?: ResponsiveValue<number>
  pull?: ResponsiveValue<number>

  // 排序
  order?: ResponsiveValue<number>

  // 对齐方式
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>

  // 垂直对齐
  valign?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>

  // 是否换行
  wrap?: ResponsiveValue<boolean>

  // 是否填充
  fill?: ResponsiveValue<boolean>

  // 最小宽度
  minWidth?: ResponsiveValue<string | number>

  // 最大宽度
  maxWidth?: ResponsiveValue<string | number>

  // 最小高度
  minHeight?: ResponsiveValue<string | number>

  // 最大高度
  maxHeight?: ResponsiveValue<string | number>

  // 内边距
  padding?: ResponsiveValue<string | number>

  // 外边距
  margin?: ResponsiveValue<string | number>

  // 边框
  border?: ResponsiveValue<string>

  // 圆角
  borderRadius?: ResponsiveValue<string | number>

  // 背景色
  backgroundColor?: ResponsiveValue<string>

  // 文字颜色
  color?: ResponsiveValue<string>

  // 字体大小
  fontSize?: ResponsiveValue<string | number>

  // 字体粗细
  fontWeight?: ResponsiveValue<string | number>

  // 行高
  lineHeight?: ResponsiveValue<string | number>

  // 文字对齐
  textAlign?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>

  // 垂直对齐
  verticalAlign?: ResponsiveValue<'top' | 'middle' | 'bottom' | 'baseline'>

  // 显示方式
  display?: ResponsiveValue<'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none'>

  // 定位方式
  position?: ResponsiveValue<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>

  // 层级
  zIndex?: ResponsiveValue<number>

  // 透明度
  opacity?: ResponsiveValue<number>

  // 变换
  transform?: ResponsiveValue<string>

  // 过渡
  transition?: ResponsiveValue<string>

  // 动画
  animation?: ResponsiveValue<string>

  // 阴影
  boxShadow?: ResponsiveValue<string>

  // 滤镜
  filter?: ResponsiveValue<string>

  // 混合模式
  mixBlendMode?: ResponsiveValue<string>

  // 自定义CSS
  css?: ResponsiveValue<AnyObject>
}

// 完整字段配置
export interface FormFieldConfig extends BaseFieldConfig, FieldLayoutConfig {
  // 字段ID（自动生成）
  id?: string

  // 字段路径（自动计算）
  path?: string

  // 父字段
  parent?: string

  // 子字段
  children?: FormFieldConfig[]

  // 字段深度（自动计算）
  depth?: number

  // 字段索引（自动计算）
  index?: number

  // 是否为叶子节点（自动计算）
  isLeaf?: boolean

  // 是否为根节点（自动计算）
  isRoot?: boolean

  // 字段状态（运行时）
  _status?: {
    mounted: boolean
    visible: boolean
    enabled: boolean
    valid: boolean
    dirty: boolean
    touched: boolean
    focused: boolean
    loading: boolean
    error?: string
    warning?: string
  }

  // 字段实例（运行时）
  _instance?: any

  // 字段元素（运行时）
  _element?: HTMLElement

  // 字段值（运行时）
  _value?: any

  // 字段原始值（运行时）
  _originalValue?: any

  // 字段缓存（运行时）
  _cache?: Map<string, any>

  // 字段监听器（运行时）
  _listeners?: Map<string, Function[]>

  // 字段订阅（运行时）
  _subscriptions?: Set<() => void>
}

// 字段组配置
export interface FormGroupConfig {
  type: 'group'
  name: string
  title?: string
  description?: string

  // 分组样式
  bordered?: boolean
  collapsible?: boolean
  collapsed?: boolean
  className?: string
  style?: AnyObject

  // 分组图标
  icon?: string

  // 分组布局
  layout?: Partial<FieldLayoutConfig>

  // 分组字段
  fields: (FormFieldConfig | FormGroupConfig | FormActionConfig)[]

  // 条件渲染
  conditionalRender?: ConditionalRenderConfig

  // 分组权限
  permissions?: string[]
  roles?: string[]

  // 分组元数据
  metadata?: AnyObject
}

// 按钮配置
export interface ButtonConfig {
  // 按钮类型
  type: 'submit' | 'reset' | 'button' | 'expand' | 'collapse' | 'custom'

  // 按钮文本
  text?: string

  // 按钮图标
  icon?: string

  // 按钮样式
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark' | 'link'

  // 按钮大小
  size?: SizeType

  // 是否禁用
  disabled?: boolean | ConditionalFunction

  // 是否隐藏
  hidden?: boolean | ConditionalFunction

  // 是否加载中
  loading?: boolean

  // 按钮形状
  shape?: 'default' | 'circle' | 'round'

  // 是否块级按钮
  block?: boolean

  // 是否幽灵按钮
  ghost?: boolean

  // 按钮HTML类型
  htmlType?: 'button' | 'submit' | 'reset'

  // 按钮链接
  href?: string

  // 链接目标
  target?: '_blank' | '_self' | '_parent' | '_top'

  // 按钮权限
  permissions?: string[]
  roles?: string[]

  // 点击回调
  onClick?: (event: Event, formData: AnyObject) => void | Promise<void>

  // 自定义属性
  props?: AnyObject

  // 工具提示
  tooltip?: string

  // 快捷键
  shortcut?: string

  // 确认配置
  confirm?: {
    title?: string
    content?: string
    okText?: string
    cancelText?: string
  }

  // 条件显示
  show?: ConditionalFunction

  // 自定义渲染
  render?: (button: ButtonConfig, formData: AnyObject) => any
}

// 按钮组配置
export interface FormActionConfig {
  type: 'actions'
  name?: string

  // 按钮组位置
  position?: 'inline' | 'newline' | 'fixed' | 'floating'

  // 占用列数
  span?: ResponsiveValue<number | 'auto' | 'fill'>

  // 对齐方式
  align?: ResponsiveValue<'left' | 'center' | 'right'>

  // 垂直对齐
  valign?: ResponsiveValue<'top' | 'middle' | 'bottom'>

  // 按钮间距
  gap?: ResponsiveValue<number | string>

  // 按钮组样式
  className?: string
  style?: AnyObject

  // 按钮列表
  buttons: (ButtonConfig | string)[]

  // 展开配置
  expandConfig?: {
    enabled?: boolean
    target?: string // 目标分组或字段
    mode?: 'toggle' | 'dropdown' | 'modal'
    expandText?: string
    collapseText?: string
    showInCollapsed?: boolean
  }

  // 条件渲染
  conditionalRender?: ConditionalRenderConfig

  // 按钮组权限
  permissions?: string[]
  roles?: string[]

  // 按钮组元数据
  metadata?: AnyObject
}

// 字段项联合类型
export type FormFieldItem = FormFieldConfig | FormGroupConfig | FormActionConfig

// 字段工厂函数类型
export type FieldFactory = (config: Partial<FormFieldConfig>) => FormFieldConfig

// 字段注册信息
export interface FieldRegistration {
  // 字段类型名称
  name: string

  // 字段组件
  component: ComponentType

  // 默认配置
  defaultConfig?: Partial<FormFieldConfig>

  // 字段描述
  description?: string

  // 字段分类
  category?: string

  // 字段标签
  tags?: string[]

  // 字段图标
  icon?: string

  // 字段预览
  preview?: string

  // 字段版本
  version?: string

  // 字段作者
  author?: string

  // 配置模式
  configSchema?: AnyObject

  // 工厂函数
  factory?: FieldFactory
}

// 字段管理器接口
export interface FieldManager {
  // 注册字段类型
  register(registration: FieldRegistration): void

  // 注销字段类型
  unregister(name: string): void

  // 获取字段类型
  get(name: string): FieldRegistration | undefined

  // 获取所有字段类型
  getAll(): FieldRegistration[]

  // 创建字段实例
  create(type: string, config: Partial<FormFieldConfig>): FormFieldConfig

  // 克隆字段配置
  clone(field: FormFieldConfig): FormFieldConfig

  // 合并字段配置
  merge(target: FormFieldConfig, source: Partial<FormFieldConfig>): FormFieldConfig

  // 验证字段配置
  validate(field: FormFieldConfig): boolean

  // 标准化字段配置
  normalize(field: FormFieldConfig): FormFieldConfig
}

// 字段状态管理器接口
export interface FieldStateManager {
  // 设置字段值
  setValue(path: string, value: any): void

  // 获取字段值
  getValue(path: string): any

  // 设置字段状态
  setStatus(path: string, status: Partial<FormFieldConfig['_status']>): void

  // 获取字段状态
  getStatus(path: string): FormFieldConfig['_status'] | undefined

  // 设置字段属性
  setProperty(path: string, property: string, value: any): void

  // 获取字段属性
  getProperty(path: string, property: string): any

  // 监听字段变化
  watch(path: string, callback: (newValue: any, oldValue: any) => void): () => void

  // 批量更新
  batch(updates: Array<{ path: string; value: any }>): void

  // 重置字段
  reset(path?: string): void

  // 清除字段
  clear(path?: string): void
}
