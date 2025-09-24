/**
 * 通用类型定义
 * 
 * 定义项目中使用的通用类型和接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 文件路径类型
 */
export type FilePath = string

/**
 * 配置文件类型
 */
export type ConfigFileType = 'launcher' | 'app' | 'package'

/**
 * 配置文件格式
 */
export type ConfigFileFormat = 'ts' | 'js' | 'json' | 'yaml' | 'yml'

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * 操作结果接口
 */
export interface OperationResult<T = any> {
  /** 操作是否成功 */
  success: boolean
  /** 返回数据 */
  data?: T
  /** 错误信息 */
  error?: string
  /** 错误详情 */
  details?: any
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  /** 文件路径 */
  path: FilePath
  /** 文件名 */
  name: string
  /** 文件扩展名 */
  extension: string
  /** 文件大小（字节） */
  size: number
  /** 最后修改时间 */
  lastModified: Date
  /** 是否为目录 */
  isDirectory: boolean
  /** 是否存在 */
  exists: boolean
}

/**
 * 配置字段类型
 */
export type ConfigFieldType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'array' 
  | 'object' 
  | 'select' 
  | 'multiSelect'
  | 'color'
  | 'url'
  | 'email'
  | 'password'

/**
 * 配置字段定义
 */
export interface ConfigFieldDefinition {
  /** 字段键名 */
  key: string
  /** 字段标签 */
  label: string
  /** 字段类型 */
  type: ConfigFieldType
  /** 字段描述 */
  description?: string
  /** 默认值 */
  defaultValue?: any
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  validation?: ValidationRule[]
  /** 选项列表（用于 select 和 multiSelect 类型） */
  options?: SelectOption[]
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 最小值（用于 number 类型） */
  min?: number
  /** 最大值（用于 number 类型） */
  max?: number
  /** 步长（用于 number 类型） */
  step?: number
}

/**
 * 选择选项接口
 */
export interface SelectOption {
  /** 选项值 */
  value: any
  /** 选项标签 */
  label: string
  /** 选项描述 */
  description?: string
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  /** 规则类型 */
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  /** 规则值 */
  value?: any
  /** 错误消息 */
  message: string
  /** 自定义验证函数 */
  validator?: (value: any) => boolean
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误消息列表 */
  errors: string[]
}

/**
 * 事件类型
 */
export type EventType = 'change' | 'save' | 'load' | 'error' | 'validate'

/**
 * 事件监听器接口
 */
export interface EventListener<T = any> {
  (event: T): void | Promise<void>
}

/**
 * 配置更改事件
 */
export interface ConfigChangeEvent {
  /** 配置文件类型 */
  type: ConfigFileType
  /** 更改的字段路径 */
  path: string
  /** 旧值 */
  oldValue: any
  /** 新值 */
  newValue: any
  /** 时间戳 */
  timestamp: number
}
