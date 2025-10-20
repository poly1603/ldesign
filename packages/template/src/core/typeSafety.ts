/**
 * 模板类型安全系统
 */

import type { ComputedRef, Ref} from 'vue';
import type { Template, TemplateEvents, TemplateProps } from '../types'
import { computed, ref } from 'vue'

/**
 * 类型定义模板
 */
export interface TypedTemplate<
  P extends Record<string, any> = TemplateProps,
  E extends Record<string, any> = TemplateEvents,
  S extends Record<string, any> = Record<string, any>
> extends Template {
  props?: P
  events?: E
  slots?: S
}

/**
 * 严格类型的模板属性
 */
export interface StrictTemplateProps {
  [key: string]: {
    type: PropType<any>
    required?: boolean
    default?: any
    validator?: (value: any) => boolean
  }
}

/**
 * 属性类型
 */
export type PropType<T> = 
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor
  | DateConstructor
  | FunctionConstructor
  | SymbolConstructor
  | { new(...args: any[]): T }
  | T[]

/**
 * 推断属性类型
 */
export type InferPropType<T> = T extends PropType<infer U> ? U : any

/**
 * 推断模板属性类型
 */
export type InferTemplateProps<T extends StrictTemplateProps> = {
  [K in keyof T]: InferPropType<T[K]['type']>
}

/**
 * 类型验证器
 */
export class TypeValidator {
  private validators: Map<string, (value: any) => boolean> = new Map()
  
  /**
   * 注册验证器
   */
  register(type: string, validator: (value: any) => boolean) {
    this.validators.set(type, validator)
  }
  
  /**
   * 验证值
   */
  validate(value: any, type: string | PropType<any>): boolean {
    if (typeof type === 'string') {
      const validator = this.validators.get(type)
      return validator ? validator(value) : true
    }
    
    if (Array.isArray(type)) {
      return type.some(t => this.validateConstructor(value, t))
    }
    
    return this.validateConstructor(value, type as any)
  }
  
  /**
   * 验证构造函数类型
   */
  private validateConstructor(value: any, constructor: any): boolean {
    if (constructor === String) return typeof value === 'string'
    if (constructor === Number) return typeof value === 'number'
    if (constructor === Boolean) return typeof value === 'boolean'
    if (constructor === Array) return Array.isArray(value)
    if (constructor === Object) return typeof value === 'object' && value !== null
    if (constructor === Date) return value instanceof Date
    if (constructor === Function) return typeof value === 'function'
    if (constructor === Symbol) return typeof value === 'symbol'
    
    return value instanceof constructor
  }
}

/**
 * 类型生成器
 */
export class TypeGenerator {
  /**
   * 从模板生成类型定义
   */
  generateFromTemplate(template: Template): string {
    const lines: string[] = []
    
    // 生成接口名称
    const interfaceName = `${this.toPascalCase(template.name)}Template`
    
    lines.push(`export interface ${interfaceName} {`)
    
    // 生成属性类型
    if ((template as any).props) {
      lines.push('  props: {')
      for (const [key, prop] of Object.entries((template as any).props)) {
        const type = this.inferType(prop)
        lines.push(`    ${key}: ${type};`)
      }
      lines.push('  };')
    }
    
    // 生成事件类型
    if ((template as any).events) {
      lines.push('  events: {')
      for (const [key, event] of Object.entries((template as any).events)) {
        const type = this.inferEventType(event)
        lines.push(`    ${key}: ${type};`)
      }
      lines.push('  };')
    }
    
    // 生成插槽类型
    if ((template as any).slots) {
      lines.push('  slots: {')
      for (const key of Object.keys((template as any).slots)) {
        lines.push(`    ${key}: any;`)
      }
      lines.push('  };')
    }
    
    lines.push('}')
    
    return lines.join('\n')
  }
  
  /**
   * 批量生成类型定义
   */
  generateTypes(templates: Template[]): string {
    const types = templates.map(t => this.generateFromTemplate(t))
    
    // 添加导入语句
    const imports = [
      "import type { Template } from './types'",
      ''
    ]
    
    // 添加索引类型
    const indexType = [
      '',
      'export interface TemplateMap {',
      ...templates.map(t => `  '${t.name}': ${this.toPascalCase(t.name)}Template;`),
      '}'
    ]
    
    return [...imports, ...types, ...indexType].join('\n')
  }
  
  /**
   * 推断类型
   */
  private inferType(value: any): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    
    const type = typeof value
    
    switch (type) {
      case 'string':
        return 'string'
      case 'number':
        return 'number'
      case 'boolean':
        return 'boolean'
      case 'function':
        return this.inferFunctionType(value)
      case 'object':
        if (Array.isArray(value)) {
          return this.inferArrayType(value)
        }
        return this.inferObjectType(value)
      default:
        return 'any'
    }
  }
  
  /**
   * 推断函数类型
   */
  private inferFunctionType(fn: (...args: any[]) => any): string {
    const params = fn.length
    const paramTypes = Array.from({ length: params }, () => 'any').join(', ')
    return `(${paramTypes}) => any`
  }
  
  /**
   * 推断数组类型
   */
  private inferArrayType(arr: any[]): string {
    if (arr.length === 0) return 'any[]'
    
    const types = new Set(arr.map(item => this.inferType(item)))
    
    if (types.size === 1) {
      return `${Array.from(types)[0]}[]`
    }
    
    return `(${Array.from(types).join(' | ')})[]`
  }
  
  /**
   * 推断对象类型
   */
  private inferObjectType(obj: Record<string, any>): string {
    const props = Object.entries(obj)
      .map(([key, value]) => `${key}: ${this.inferType(value)}`)
      .join('; ')
    
    return `{ ${props} }`
  }
  
  /**
   * 推断事件类型
   */
  private inferEventType(event: any): string {
    if (typeof event === 'function') {
      return this.inferFunctionType(event)
    }
    return '(...args: any[]) => void'
  }
  
  /**
   * 转换为帕斯卡命名
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
      .replace(/^\w/, c => c.toUpperCase())
  }
}

/**
 * 类型守卫
 */
export class TypeGuard {
  /**
   * 是否为特定模板类型
   */
  static isTemplate<T extends Template>(
    template: any,
    type: { new(...args: any[]): T }
  ): template is T {
    return template instanceof type
  }
  
  /**
   * 是否有必需属性
   */
  static hasRequiredProps<T extends Record<string, any>>(
    obj: any,
    props: (keyof T)[]
  ): obj is T {
    return props.every(prop => prop in obj)
  }
  
  /**
   * 是否为有效的模板属性
   */
  static isValidTemplateProps<T extends TemplateProps>(
    props: any,
    schema: StrictTemplateProps
  ): props is T {
    const validator = new TypeValidator()
    
    for (const [key, config] of Object.entries(schema)) {
      if (config.required && !(key in props)) {
        return false
      }
      
      if (key in props) {
        const value = props[key]
        
        if (!validator.validate(value, config.type)) {
          return false
        }
        
        if (config.validator && !config.validator(value)) {
          return false
        }
      }
    }
    
    return true
  }
}

/**
 * 创建类型安全的模板
 */
export function createTypedTemplate<
  P extends StrictTemplateProps,
  E extends Record<string, (...args: any[]) => void> = Record<string, never>,
  S extends Record<string, any> = Record<string, never>
>(config: {
  name: string
  props?: P
  events?: E
  slots?: S
  setup?: (props: InferTemplateProps<P>) => any
  render?: (ctx: any) => any
}): TypedTemplate<InferTemplateProps<P>, E, S> {
  const template: TypedTemplate<InferTemplateProps<P>, E, S> = {
    id: `typed-${config.name}`,
    name: config.name,
    category: 'typed',
    props: config.props as any,
    events: config.events,
    slots: config.slots
  } as any
  
  // 添加类型验证
  if (config.setup) {
    const originalSetup = config.setup
    ;(template as any).setup = (props: any) => {
      // 运行时类型检查
      if (config.props && !TypeGuard.isValidTemplateProps(props, config.props)) {
        console.error(`Invalid props for template ${config.name}`)
      }
      
      return originalSetup(props as InferTemplateProps<P>)
    }
  }
  
  return template
}

/**
 * 使用类型安全的模板
 */
export function useTypedTemplate<T extends TypedTemplate>(
  template: T | Ref<T>
): {
  template: ComputedRef<T>
  props: ComputedRef<T['props']>
  events: ComputedRef<T['events']>
  slots: ComputedRef<T['slots']>
  validate: (props: any) => boolean
} {
  const templateRef = ref(template) as Ref<T>
  
  const computedTemplate = computed<T>(() => 
    'value' in templateRef.value ? (templateRef.value as any).value : templateRef.value
  )
  
  const props = computed(() => (computedTemplate.value as any).props)
  const events = computed(() => (computedTemplate.value as any).events)
  const slots = computed(() => (computedTemplate.value as any).slots)
  
  const validate = (inputProps: any): boolean => {
    const schema = (computedTemplate.value as any).props
    if (!schema) return true
    
    return TypeGuard.isValidTemplateProps(inputProps, schema as any)
  }
  
  return {
    template: computedTemplate as any,
    props,
    events,
    slots,
    validate
  }
}

/**
 * 类型映射工具
 */
export class TypeMapper {
  private mappings: Map<string, string> = new Map([
    ['String', 'string'],
    ['Number', 'number'],
    ['Boolean', 'boolean'],
    ['Array', 'any[]'],
    ['Object', 'Record<string, any>'],
    ['Date', 'Date'],
    ['Function', 'Function'],
    ['Symbol', 'symbol']
  ])
  
  /**
   * 添加自定义映射
   */
  addMapping(from: string, to: string) {
    this.mappings.set(from, to)
  }
  
  /**
   * 映射类型
   */
  map(type: string): string {
    return this.mappings.get(type) || 'any'
  }
  
  /**
   * 批量映射
   */
  mapBatch(types: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(types)) {
      result[key] = this.map(value)
    }
    
    return result
  }
}

/**
 * 模板类型注册表
 */
export class TemplateTypeRegistry {
  private static instance: TemplateTypeRegistry
  private registry: Map<string, TypedTemplate> = new Map()
  private schemas: Map<string, StrictTemplateProps> = new Map()
  
  private constructor() {}
  
  static getInstance(): TemplateTypeRegistry {
    if (!this.instance) {
      this.instance = new TemplateTypeRegistry()
    }
    return this.instance
  }
  
  /**
   * 注册模板类型
   */
  register<T extends TypedTemplate>(template: T, schema?: StrictTemplateProps) {
    this.registry.set(template.name, template)
    
    if (schema) {
      this.schemas.set(template.name, schema)
    }
  }
  
  /**
   * 获取模板类型
   */
  get<T extends TypedTemplate>(name: string): T | undefined {
    return this.registry.get(name) as T
  }
  
  /**
   * 获取模板schema
   */
  getSchema(name: string): StrictTemplateProps | undefined {
    return this.schemas.get(name)
  }
  
  /**
   * 获取所有模板类型
   */
  getAll(): TypedTemplate[] {
    return Array.from(this.registry.values())
  }
  
  /**
   * 生成类型定义文件
   */
  generateTypeDefinitions(): string {
    const generator = new TypeGenerator()
    const templates = this.getAll()
    return generator.generateTypes(templates as Template[])
  }
}

// 导出单例
export const typeValidator = new TypeValidator()
export const typeGenerator = new TypeGenerator()
export const typeMapper = new TypeMapper()
export const typeRegistry = TemplateTypeRegistry.getInstance()