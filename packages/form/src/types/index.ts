// 表单项类型
export type FormItemType = 
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'number'
  | 'password'
  | 'email'
  | 'url'
  | 'tel'
  | 'file'
  | 'range'
  | 'color'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'

// 选项接口
export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
}

// 验证规则接口
export interface ValidationRule {
  type: 'required' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength' | 'custom'
  value?: any
  message: string
  validator?: (value: any) => boolean | Promise<boolean>
}

// 表单项配置接口
export interface FormItemConfig {
  key: string
  label: string
  type: FormItemType
  value?: any
  span?: number // 占用列数
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  validation?: ValidationRule[]
  placeholder?: string
  options?: SelectOption[] // 用于select、radio、checkbox类型
  group?: string // 分组标识
  order?: number // 排序权重
  visible?: boolean // 是否可见
  className?: string // 自定义CSS类名
  style?: Record<string, any> // 自定义样式
  attrs?: Record<string, any> // 自定义属性
}

// 响应式配置接口
export interface ResponsiveConfig {
  xs?: number // <576px
  sm?: number // ≥576px
  md?: number // ≥768px
  lg?: number // ≥992px
  xl?: number // ≥1200px
  xxl?: number // ≥1400px
}

// 布局配置接口
export interface LayoutConfig {
  defaultRows?: number // 默认显示行数
  minColumns?: number // 最小列数
  maxColumns?: number // 最大列数
  columnWidth?: number // 列宽度
  gap?: {
    horizontal: number
    vertical: number
  }
  responsive?: ResponsiveConfig
}

// 弹窗配置接口
export interface ModalConfig {
  title?: string
  width?: number | string
  height?: number | string
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  zIndex?: number
}

// 显示配置接口
export interface DisplayConfig {
  labelPosition: 'left' | 'right' | 'top'
  labelWidth?: number
  showExpandButton?: boolean
  expandMode: 'inline' | 'modal'
  modalConfig?: ModalConfig
}

// 验证配置接口
export interface ValidationConfig {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  showErrorMessage?: boolean
  stopOnFirstError?: boolean
}

// 行为配置接口
export interface BehaviorConfig {
  readonly?: boolean
  disabled?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
}

// 表单配置接口
export interface FormConfig {
  items: FormItemConfig[]
  layout: LayoutConfig
  validation: ValidationConfig
  display: DisplayConfig
  behavior: BehaviorConfig
}

// 表单项位置信息
export interface ItemPosition {
  key: string
  row: number
  column: number
  span: number
  width: number
  height: number
  visible: boolean
  x?: number
  y?: number
}

// 表单状态
export interface FormState {
  values: Record<string, any>
  errors: Record<string, string[]>
  touched: Record<string, boolean>
  expanded: boolean
  modalVisible: boolean
  loading: boolean
  readonly: boolean
  disabled: boolean
}

// 表单分组
export interface FormGroup {
  key: string
  title: string
  items: string[] // 表单项key列表
  expanded?: boolean
  collapsible?: boolean
  order?: number
}

// 事件类型
export type FormEventType = 
  | 'change'
  | 'blur'
  | 'focus'
  | 'submit'
  | 'reset'
  | 'expand'
  | 'collapse'
  | 'modalOpen'
  | 'modalClose'
  | 'validate'
  | 'error'

// 事件数据
export interface FormEventData {
  type: FormEventType
  key?: string
  value?: any
  oldValue?: any
  errors?: string[]
  timestamp: number
}

// 表单管理器选项
export interface FormManagerOptions {
  container: HTMLElement | string
  config: FormConfig
  initialValues?: Record<string, any>
  onEvent?: (event: FormEventData) => void
}

// Vue组件Props
export interface AdaptiveFormProps {
  config: FormConfig
  modelValue?: Record<string, any>
  readonly?: boolean
  disabled?: boolean
}

// Vue组件Emits
export interface AdaptiveFormEmits {
  'update:modelValue': [value: Record<string, any>]
  'change': [key: string, value: any, oldValue: any]
  'submit': [values: Record<string, any>]
  'reset': []
  'expand': []
  'collapse': []
  'modalOpen': []
  'modalClose': []
  'validate': [key: string, errors: string[]]
  'error': [errors: Record<string, string[]>]
}

// Hook返回值
export interface UseAdaptiveFormReturn {
  formRef: Ref<HTMLElement | null>
  values: Ref<Record<string, any>>
  errors: Ref<Record<string, string[]>>
  state: Ref<FormState>
  setValue: (key: string, value: any) => void
  getValue: (key: string) => any
  setValues: (values: Record<string, any>) => void
  getValues: () => Record<string, any>
  validate: (key?: string) => Promise<boolean>
  reset: () => void
  expand: () => void
  collapse: () => void
  openModal: () => void
  closeModal: () => void
  destroy: () => void
}

// Provider状态
export interface FormProviderState {
  globalConfig: Partial<FormConfig>
  instances: Map<string, any>
}

// Plugin选项
export interface FormPluginOptions {
  globalConfig?: Partial<FormConfig>
  components?: Record<string, any>
}

// 导入Ref类型（如果在Vue环境中）
interface Ref<T> {
  value: T
}