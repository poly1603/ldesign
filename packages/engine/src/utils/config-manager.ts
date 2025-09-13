import { 
  isValidObject, 
  isString, 
  isNumber, 
  isBoolean, 
  isFunction,
  safeGet,
  safeGetNested,
  ErrorUtil 
} from './type-safety'

// 配置项类型定义
export type ConfigValue = string | number | boolean | null | undefined | ConfigObject | ConfigValue[]
export interface ConfigObject {
  [key: string]: ConfigValue
}

// 配置验证器类型
export interface ConfigValidator<T = any> {
  validate: (value: any) => value is T
  message?: string
  transform?: (value: any) => T
}

// 配置模式定义
export interface ConfigSchema {
  [key: string]: {
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any'
    required?: boolean
    default?: ConfigValue
    validator?: ConfigValidator
    description?: string
    deprecated?: boolean
    deprecationMessage?: string
    children?: ConfigSchema // 用于嵌套对象验证
  }
}

// 配置变更事件
export interface ConfigChangeEvent {
  key: string
  oldValue: ConfigValue
  newValue: ConfigValue
  timestamp: number
}

// 配置加载器接口
export interface ConfigLoader {
  load(): Promise<ConfigObject> | ConfigObject
  watch?: (callback: (config: ConfigObject) => void) => (() => void) | void
}

// 环境变量配置加载器
export class EnvironmentConfigLoader implements ConfigLoader {
  constructor(private prefix: string = 'VUE_APP_') {}

  load(): ConfigObject {
    const config: ConfigObject = {}
    
    // 在浏览器环境中，只能访问通过 Vite 或 webpack 注入的环境变量
    if (typeof process !== 'undefined' && process.env) {
      Object.keys(process.env).forEach(key => {
        if (key.startsWith(this.prefix)) {
          const configKey = key.substring(this.prefix.length).toLowerCase()
          const value = process.env[key]
          
          // 尝试解析为合适的类型
          config[configKey] = this.parseValue(value)
        }
      })
    }
    
    return config
  }

  private parseValue(value: string | undefined): ConfigValue {
    if (value === undefined) return undefined
    
    // 尝试解析为布尔值
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
    
    // 尝试解析为数字
    const numValue = Number(value)
    if (!isNaN(numValue) && isFinite(numValue)) return numValue
    
    // 尝试解析为 JSON
    try {
      return JSON.parse(value)
    } catch {
      return value // 返回原始字符串
    }
  }
}

// JSON 文件配置加载器
export class JsonConfigLoader implements ConfigLoader {
  constructor(private configPath: string) {}

  async load(): Promise<ConfigObject> {
    try {
      // 在实际项目中，这里应该使用 fetch 或其他方式加载配置文件
      const response = await fetch(this.configPath)
      if (!response.ok) {
        throw new Error(`Failed to load config from ${this.configPath}`)
      }
      return await response.json()
    } catch (error) {
      console.warn(`Failed to load config from ${this.configPath}:`, error)
      return {}
    }
  }

  watch(callback: (config: ConfigObject) => void): (() => void) | void {
    // 在生产环境中，可以实现文件监听逻辑
    // 这里提供一个简单的轮询实现
    const interval = setInterval(async () => {
      try {
        const newConfig = await this.load()
        callback(newConfig)
      } catch (error) {
        console.error('Config watch error:', error)
      }
    }, 5000) // 每5秒检查一次

    return () => clearInterval(interval)
  }
}

// 内存配置加载器
export class MemoryConfigLoader implements ConfigLoader {
  constructor(private config: ConfigObject) {}

  load(): ConfigObject {
    return { ...this.config }
  }

  updateConfig(updates: Partial<ConfigObject>) {
    Object.assign(this.config, updates)
  }
}

// 配置管理器
export class EnhancedConfigManager {
  private config: ConfigObject = {}
  private schema: ConfigSchema = {}
  private loaders: ConfigLoader[] = []
  private listeners: Array<(event: ConfigChangeEvent) => void> = []
  private watchers: Array<() => void> = []
  private validationErrors: string[] = []

  constructor(initialConfig: ConfigObject = {}) {
    this.config = { ...initialConfig }
  }

  // 添加配置加载器
  addLoader(loader: ConfigLoader): this {
    this.loaders.push(loader)
    return this
  }

  // 设置配置模式
  setSchema(schema: ConfigSchema): this {
    this.schema = schema
    return this
  }

  // 加载配置
  async loadConfig(): Promise<void> {
    for (const loader of this.loaders) {
      try {
        const loadedConfig = await loader.load()
        this.mergeConfig(loadedConfig)
        
        // 如果加载器支持监听，启用热重载
        if (loader.watch) {
          const unwatcher = loader.watch((newConfig) => {
            this.hotReload(newConfig)
          })
          if (unwatcher) {
            this.watchers.push(unwatcher)
          }
        }
      } catch (error) {
        console.error('Failed to load config:', error)
      }
    }

    // 验证配置
    this.validateConfig()
    
    // 应用默认值和转换
    this.applyDefaults()
  }

  // 合并配置
  private mergeConfig(newConfig: ConfigObject): void {
    this.deepMerge(this.config, newConfig)
  }

  // 深度合并对象
  private deepMerge(target: ConfigObject, source: ConfigObject): void {
    Object.keys(source).forEach(key => {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (isValidObject(sourceValue) && isValidObject(targetValue)) {
        this.deepMerge(targetValue as ConfigObject, sourceValue as ConfigObject)
      } else {
        target[key] = sourceValue
      }
    })
  }

  // 验证配置
  private validateConfig(): void {
    this.validationErrors = []
    this.validateObject(this.config, this.schema, '')
    
    if (this.validationErrors.length > 0) {
      console.warn('配置验证警告:', this.validationErrors)
    }
  }

  // 递归验证对象
  private validateObject(obj: ConfigObject, schema: ConfigSchema, path: string): void {
    Object.keys(schema).forEach(key => {
      const fullPath = path ? `${path}.${key}` : key
      const schemaItem = schema[key]
      const value = obj[key]

      // 检查必填项
      if (schemaItem.required && (value === undefined || value === null)) {
        this.validationErrors.push(`Required config missing: ${fullPath}`)
        return
      }

      // 检查弃用配置
      if (schemaItem.deprecated && value !== undefined) {
        const message = schemaItem.deprecationMessage || `Config ${fullPath} is deprecated`
        console.warn(message)
      }

      if (value === undefined || value === null) return

      // 类型验证
      if (schemaItem.type && !this.validateType(value, schemaItem.type)) {
        this.validationErrors.push(
          `Invalid type for ${fullPath}: expected ${schemaItem.type}, got ${typeof value}`
        )
      }

      // 自定义验证器
      if (schemaItem.validator && !schemaItem.validator.validate(value)) {
        const message = schemaItem.validator.message || `Validation failed for ${fullPath}`
        this.validationErrors.push(message)
      }

      // 嵌套对象验证
      if (schemaItem.children && isValidObject(value)) {
        this.validateObject(value as ConfigObject, schemaItem.children, fullPath)
      }
    })
  }

  // 类型验证
  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string': return isString(value)
      case 'number': return isNumber(value)
      case 'boolean': return isBoolean(value)
      case 'object': return isValidObject(value)
      case 'array': return Array.isArray(value)
      case 'any': return true
      default: return false
    }
  }

  // 应用默认值和转换
  private applyDefaults(): void {
    this.applyDefaultsToObject(this.config, this.schema, '')
  }

  // 递归应用默认值
  private applyDefaultsToObject(obj: ConfigObject, schema: ConfigSchema, path: string): void {
    Object.keys(schema).forEach(key => {
      const fullPath = path ? `${path}.${key}` : key
      const schemaItem = schema[key]
      
      if (obj[key] === undefined && schemaItem.default !== undefined) {
        obj[key] = schemaItem.default
      }

      // 应用转换器
      if (obj[key] !== undefined && schemaItem.validator?.transform) {
        try {
          obj[key] = schemaItem.validator.transform(obj[key])
        } catch (error) {
          console.warn(`Failed to transform config ${fullPath}:`, error)
        }
      }

      // 处理嵌套对象
      if (schemaItem.children && isValidObject(obj[key])) {
        this.applyDefaultsToObject(obj[key] as ConfigObject, schemaItem.children, fullPath)
      }
    })
  }

  // 热重载配置
  private hotReload(newConfig: ConfigObject): void {
    const oldConfig = { ...this.config }
    this.mergeConfig(newConfig)
    this.validateConfig()
    this.applyDefaults()

    // 触发变更事件
    this.detectChanges(oldConfig, this.config, '')
  }

  // 检测配置变更
  private detectChanges(oldConfig: ConfigObject, newConfig: ConfigObject, path: string): void {
    const allKeys = new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])
    
    allKeys.forEach(key => {
      const fullPath = path ? `${path}.${key}` : key
      const oldValue = oldConfig[key]
      const newValue = newConfig[key]

      if (oldValue !== newValue) {
        this.emitChangeEvent({
          key: fullPath,
          oldValue,
          newValue,
          timestamp: Date.now()
        })
      }

      // 递归检查嵌套对象
      if (isValidObject(oldValue) && isValidObject(newValue)) {
        this.detectChanges(oldValue as ConfigObject, newValue as ConfigObject, fullPath)
      }
    })
  }

  // 触发变更事件
  private emitChangeEvent(event: ConfigChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Config change listener error:', error)
      }
    })
  }

  // 获取配置值
  get<T = any>(key: string, defaultValue?: T): T {
    const value = safeGetNested(this.config, key, defaultValue)
    return value as T
  }

  // 设置配置值
  set<T = any>(key: string, value: T): void {
    const oldValue = this.get(key)
    this.setNestedValue(this.config, key, value)
    
    // 验证新值
    this.validateSingleKey(key, value)
    
    // 触发变更事件
    this.emitChangeEvent({
      key,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    })
  }

  // 设置嵌套值
  private setNestedValue(obj: ConfigObject, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!isValidObject(current[key])) {
        current[key] = {}
      }
      current = current[key] as ConfigObject
    }

    current[keys[keys.length - 1]] = value
  }

  // 验证单个键
  private validateSingleKey(key: string, value: any): void {
    const schemaItem = this.getSchemaForKey(key)
    if (!schemaItem) return

    const errors: string[] = []

    if (schemaItem.type && !this.validateType(value, schemaItem.type)) {
      errors.push(`Invalid type for ${key}: expected ${schemaItem.type}, got ${typeof value}`)
    }

    if (schemaItem.validator && !schemaItem.validator.validate(value)) {
      const message = schemaItem.validator.message || `Validation failed for ${key}`
      errors.push(message)
    }

    if (errors.length > 0) {
      console.warn('Config validation errors:', errors)
    }
  }

  // 根据键路径获取模式项
  private getSchemaForKey(key: string): ConfigSchema[string] | undefined {
    const keys = key.split('.')
    let current = this.schema

    for (const k of keys) {
      if (!current[k]) return undefined
      if (keys.indexOf(k) === keys.length - 1) {
        return current[k]
      }
      current = current[k].children || {}
    }

    return undefined
  }

  // 监听配置变更
  onChange(listener: (event: ConfigChangeEvent) => void): () => void {
    this.listeners.push(listener)
    
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 获取所有配置
  getAllConfig(): ConfigObject {
    return { ...this.config }
  }

  // 获取验证错误
  getValidationErrors(): string[] {
    return [...this.validationErrors]
  }

  // 获取配置模式文档
  getSchemaDocumentation(): Record<string, any> {
    return this.generateDocumentation(this.schema, '')
  }

  // 生成模式文档
  private generateDocumentation(schema: ConfigSchema, path: string): Record<string, any> {
    const docs: Record<string, any> = {}

    Object.keys(schema).forEach(key => {
      const fullPath = path ? `${path}.${key}` : key
      const item = schema[key]
      
      docs[fullPath] = {
        type: item.type || 'any',
        required: item.required || false,
        default: item.default,
        description: item.description,
        deprecated: item.deprecated || false,
        deprecationMessage: item.deprecationMessage
      }

      // 处理嵌套对象
      if (item.children) {
        Object.assign(docs, this.generateDocumentation(item.children, fullPath))
      }
    })

    return docs
  }

  // 重置配置
  reset(): void {
    this.config = {}
    this.validationErrors = []
    this.applyDefaults()
  }

  // 导出配置
  export(): string {
    return JSON.stringify(this.config, null, 2)
  }

  // 从JSON导入配置
  import(jsonString: string): void {
    try {
      const importedConfig = JSON.parse(jsonString)
      if (isValidObject(importedConfig)) {
        this.config = importedConfig
        this.validateConfig()
        this.applyDefaults()
      }
    } catch (error) {
      throw ErrorUtil.createTypedError(
        'CONFIG_IMPORT_ERROR',
        'Failed to import configuration',
        { error: ErrorUtil.safeErrorMessage(error) }
      )
    }
  }

  // 销毁管理器
  destroy(): void {
    // 清理监听器
    this.watchers.forEach(unwatcher => unwatcher())
    this.watchers = []
    this.listeners = []
  }
}

// 预定义的常用验证器
export const ConfigValidators = {
  url: {
    validate: (value: any): value is string => {
      if (!isString(value)) return false
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message: 'Must be a valid URL'
  },

  port: {
    validate: (value: any): value is number => {
      return isNumber(value) && value >= 1 && value <= 65535 && Number.isInteger(value)
    },
    message: 'Must be a valid port number (1-65535)'
  },

  email: {
    validate: (value: any): value is string => {
      if (!isString(value)) return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message: 'Must be a valid email address'
  },

  positiveNumber: {
    validate: (value: any): value is number => {
      return isNumber(value) && value > 0
    },
    message: 'Must be a positive number'
  },

  nonEmptyString: {
    validate: (value: any): value is string => {
      return isString(value) && value.trim().length > 0
    },
    message: 'Must be a non-empty string'
  },

  oneOf: <T>(...options: T[]) => ({
    validate: (value: any): value is T => {
      return options.includes(value)
    },
    message: `Must be one of: ${options.join(', ')}`
  }),

  arrayOf: <T>(itemValidator: ConfigValidator<T>) => ({
    validate: (value: any): value is T[] => {
      if (!Array.isArray(value)) return false
      return value.every(item => itemValidator.validate(item))
    },
    message: `Must be an array of valid items`
  })
}

// 工厂函数：创建增强配置管理器
export function createEnhancedConfigManager(options: {
  initialConfig?: ConfigObject
  schema?: ConfigSchema
  loaders?: ConfigLoader[]
} = {}): EnhancedConfigManager {
  const manager = new EnhancedConfigManager(options.initialConfig)
  
  if (options.schema) {
    manager.setSchema(options.schema)
  }
  
  if (options.loaders) {
    options.loaders.forEach(loader => manager.addLoader(loader))
  }
  
  return manager
}
