import type { Component } from 'vue'
import type { TemplateMetadata } from '../types'

/**
 * 模板类型定义
 */
export interface TemplateTypeDefinition {
  name: string
  props?: Record<string, PropTypeDefinition>
  emits?: Record<string, EmitTypeDefinition>
  slots?: Record<string, SlotTypeDefinition>
  metadata?: TemplateMetadata
}

/**
 * 属性类型定义
 */
export interface PropTypeDefinition {
  type: string | string[] // 类型名称
  required?: boolean
  default?: any
  validator?: string // 验证器函数的字符串表示
  description?: string
}

/**
 * 事件类型定义
 */
export interface EmitTypeDefinition {
  payload?: string // 载荷类型
  description?: string
}

/**
 * 插槽类型定义
 */
export interface SlotTypeDefinition {
  props?: Record<string, string> // 插槽属性类型
  description?: string
}

/**
 * 类型生成选项
 */
export interface TypeGeneratorOptions {
  outputPath?: string // 输出路径
  moduleFormat?: 'es' | 'cjs' // 模块格式
  includeComments?: boolean // 包含注释
  generateDTS?: boolean // 生成 .d.ts 文件
  strict?: boolean // 严格模式
}

/**
 * 从组件推断类型
 */
export function inferTypeFromComponent(component: Component): TemplateTypeDefinition {
  const definition: TemplateTypeDefinition = {
    name: component.name || 'UnnamedTemplate',
    props: {},
    emits: {},
    slots: {},
  }

  // 推断 props
  const componentProps = (component as any).props
  if (componentProps) {
    if (Array.isArray(componentProps)) {
      // 数组形式的 props
      componentProps.forEach((prop: any) => {
        definition.props![prop] = {
          type: 'any',
          required: false,
        }
      })
    } else {
      // 对象形式的 props
      Object.entries(componentProps).forEach(([key, value]) => {
        if (typeof value === 'function') {
          // 构造函数
          definition.props![key] = {
            type: value.name.toLowerCase(),
            required: false,
          }
        } else if (typeof value === 'object' && value !== null) {
          const propDef = value as any
          let type = 'any'
          
          if (propDef.type) {
            if (Array.isArray(propDef.type)) {
              type = propDef.type.map((t: any) => t.name.toLowerCase()).join(' | ')
            } else {
              type = propDef.type.name.toLowerCase()
            }
          }

          definition.props![key] = {
            type,
            required: propDef.required ?? false,
            default: propDef.default,
            description: propDef.description,
          }
        }
      })
    }
  }

  // 推断 emits
  const componentEmits = (component as any).emits
  if (componentEmits) {
    if (Array.isArray(componentEmits)) {
      componentEmits.forEach((emit: any) => {
        definition.emits![emit] = {
          payload: 'any',
        }
      })
    } else {
      Object.entries(componentEmits).forEach(([key, value]) => {
        definition.emits![key] = {
          payload: 'any',
          description: typeof value === 'object' ? (value as any).description : undefined,
        }
      })
    }
  }

  return definition
}

/**
 * 生成 TypeScript 接口
 */
export function generateTypeScriptInterface(
  definition: TemplateTypeDefinition,
  options: TypeGeneratorOptions = {}
): string {
const { includeComments = true } = options
  const lines: string[] = []

  // 添加注释
  if (includeComments && definition.metadata) {
    lines.push('/**')
    lines.push(` * ${definition.metadata.displayName || definition.name}`)
    if (definition.metadata.description) {
      lines.push(` * ${definition.metadata.description}`)
    }
    lines.push(' */')
  }

  // 生成 Props 接口
  if (definition.props && Object.keys(definition.props).length > 0) {
    lines.push(`export interface ${definition.name}Props {`)
    
    Object.entries(definition.props).forEach(([key, prop]) => {
      if (includeComments && prop.description) {
        lines.push(`  /** ${prop.description} */`)
      }
      
      const optional = !prop.required || prop.default !== undefined ? '?' : ''
      const types = Array.isArray(prop.type) ? prop.type.join(' | ') : prop.type
      
      lines.push(`  ${key}${optional}: ${types}`)
    })
    
    lines.push('}')
    lines.push('')
  }

  // 生成 Emits 接口
  if (definition.emits && Object.keys(definition.emits).length > 0) {
    lines.push(`export interface ${definition.name}Emits {`)
    
    Object.entries(definition.emits).forEach(([key, emit]) => {
      if (includeComments && emit.description) {
        lines.push(`  /** ${emit.description} */`)
      }
      
      const payload = emit.payload || 'void'
      lines.push(`  (e: '${key}', payload: ${payload}): void`)
    })
    
    lines.push('}')
    lines.push('')
  }

  // 生成 Slots 接口
  if (definition.slots && Object.keys(definition.slots).length > 0) {
    lines.push(`export interface ${definition.name}Slots {`)
    
    Object.entries(definition.slots).forEach(([key, slot]) => {
      if (includeComments && slot.description) {
        lines.push(`  /** ${slot.description} */`)
      }
      
      if (slot.props && Object.keys(slot.props).length > 0) {
        const slotProps = Object.entries(slot.props)
          .map(([propKey, propType]) => `${propKey}: ${propType}`)
          .join(', ')
        lines.push(`  ${key}(props: { ${slotProps} }): any`)
      } else {
        lines.push(`  ${key}(): any`)
      }
    })
    
    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * 生成完整的类型声明文件
 */
export function generateTypeDeclarationFile(
  definitions: TemplateTypeDefinition[],
  options: TypeGeneratorOptions = {}
): string {
  const lines: string[] = []
  
  // 添加文件头注释
  lines.push('/**')
  lines.push(' * Auto-generated template type definitions')
  lines.push(` * Generated at: ${new Date().toISOString()}`)
  lines.push(' * Do not edit this file manually')
  lines.push(' */')
  lines.push('')
  
  // 添加通用导入
  lines.push("import type { Component } from 'vue'")
  lines.push('')
  
  // 生成每个模板的类型定义
  definitions.forEach((definition) => {
    lines.push(generateTypeScriptInterface(definition, options))
  })
  
  // 生成模板映射类型
  lines.push('/**')
  lines.push(' * Template name to props mapping')
  lines.push(' */')
  lines.push('export interface TemplatePropsMap {')
  definitions.forEach((definition) => {
    if (definition.props && Object.keys(definition.props).length > 0) {
      lines.push(`  '${definition.name}': ${definition.name}Props`)
    }
  })
  lines.push('}')
  lines.push('')
  
  // 生成模板类型联合
  lines.push('/**')
  lines.push(' * All available template names')
  lines.push(' */')
  const templateNames = definitions.map((d) => `'${d.name}'`).join(' | ')
  lines.push(`export type TemplateNames = ${templateNames}`)
  lines.push('')
  
  return lines.join('\n')
}

/**
 * 验证组件属性类型
 */
export function validateComponentProps<T extends Record<string, any>>(
  props: T,
  definition: TemplateTypeDefinition,
  strict = true
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!definition.props) {
    return { valid: true, errors: [] }
  }

  // 检查必需属性
  Object.entries(definition.props).forEach(([key, propDef]) => {
    if (propDef.required && !(key in props)) {
      errors.push(`Missing required prop: ${key}`)
    }
  })

  // 检查属性类型
  Object.entries(props).forEach(([key, value]) => {
    const propDef = definition.props![key]
    
    if (!propDef) {
      if (strict) {
        errors.push(`Unknown prop: ${key}`)
      }
      return
    }

    const types = Array.isArray(propDef.type) ? propDef.type : [propDef.type]
    const actualType = typeof value
    
    const isValidType = types.some((type) => {
      if (type === 'any') return true
      if (type === actualType) return true
      if (type === 'array' && Array.isArray(value)) return true
      if (type === 'object' && value !== null && actualType === 'object') return true
      return false
    })

    if (!isValidType) {
      errors.push(`Invalid type for prop ${key}: expected ${types.join(' | ')}, got ${actualType}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 生成运行时类型守卫
 */
export function generateTypeGuard(definition: TemplateTypeDefinition): string {
  const lines: string[] = []
  
  lines.push(`export function is${definition.name}Props(props: any): props is ${definition.name}Props {`)
  lines.push('  if (!props || typeof props !== \'object\') return false')
  
  if (definition.props) {
    Object.entries(definition.props).forEach(([key, prop]) => {
      if (prop.required) {
        lines.push(`  if (!('${key}' in props)) return false`)
      }
      
      const types = Array.isArray(prop.type) ? prop.type : [prop.type]
      const typeChecks = types.map((type) => {
        switch (type) {
          case 'string':
          case 'number':
          case 'boolean':
            return `typeof props.${key} === '${type}'`
          case 'array':
            return `Array.isArray(props.${key})`
          case 'object':
            return `typeof props.${key} === 'object' && props.${key} !== null`
          default:
            return 'true' // any type
        }
      })
      
      if (prop.required) {
        lines.push(`  if (!(${typeChecks.join(' || ')})) return false`)
      } else {
        lines.push(`  if ('${key}' in props && !(${typeChecks.join(' || ')})) return false`)
      }
    })
  }
  
  lines.push('  return true')
  lines.push('}')
  
  return lines.join('\n')
}

/**
 * 从模板定义生成 JSON Schema
 */
export function generateJSONSchema(definition: TemplateTypeDefinition): object {
  const schema: any = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    title: definition.name,
    properties: {},
    required: [],
  }

  if (definition.metadata?.description) {
    schema.description = definition.metadata.description
  }

  if (definition.props) {
    Object.entries(definition.props).forEach(([key, prop]) => {
      const propSchema: any = {
        description: prop.description,
      }

      const types = Array.isArray(prop.type) ? prop.type : [prop.type]
      if (types.length === 1) {
        propSchema.type = types[0]
      } else {
        propSchema.oneOf = types.map((type) => ({ type }))
      }

      if (prop.default !== undefined) {
        propSchema.default = prop.default
      }

      schema.properties[key] = propSchema

      if (prop.required) {
        schema.required.push(key)
      }
    })
  }

  return schema
}

/**
 * 类型生成器类
 */
export class TemplateTypeGenerator {
  private definitions: Map<string, TemplateTypeDefinition> = new Map()
  private maxDefinitions = 1000 // 防止无限增长

  /**
   * 注册模板定义
   */
  register(definition: TemplateTypeDefinition) {
    // 限制定义数量，防止内存泄漏
    if (this.definitions.size >= this.maxDefinitions) {
      // 删除最早的定义
      const firstKey = this.definitions.keys().next().value
      if (firstKey) {
        this.definitions.delete(firstKey)
      }
    }
    this.definitions.set(definition.name, definition)
  }

  /**
   * 从组件注册
   */
  registerComponent(component: Component) {
    const definition = inferTypeFromComponent(component)
    this.register(definition)
  }

  /**
   * 获取定义
   */
  getDefinition(name: string): TemplateTypeDefinition | undefined {
    return this.definitions.get(name)
  }

  /**
   * 获取所有定义
   */
  getAllDefinitions(): TemplateTypeDefinition[] {
    return Array.from(this.definitions.values())
  }

  /**
   * 生成类型文件
   */
  generateTypes(options?: TypeGeneratorOptions): string {
    return generateTypeDeclarationFile(this.getAllDefinitions(), options)
  }

  /**
   * 生成类型守卫文件
   */
  generateGuards(): string {
    return this.getAllDefinitions()
      .map((definition) => generateTypeGuard(definition))
      .join('\n\n')
  }

  /**
   * 生成 JSON Schema
   */
  generateSchemas(): Record<string, object> {
    const schemas: Record<string, object> = {}
    this.getAllDefinitions().forEach((definition) => {
      schemas[definition.name] = generateJSONSchema(definition)
    })
    return schemas
  }

  /**
   * 清除所有定义
   */
  clear() {
    this.definitions.clear()
  }
}

// 导出单例实例 - 使用懒加载
let _typeGenerator: TemplateTypeGenerator | null = null

export function getTypeGenerator(): TemplateTypeGenerator {
  if (!_typeGenerator) {
    _typeGenerator = new TemplateTypeGenerator()
  }
  return _typeGenerator
}

// 清理单例实例
export function destroyTypeGenerator() {
  if (_typeGenerator) {
    _typeGenerator.clear()
    _typeGenerator = null
  }
}

// 使用getter延迟加载，避免立即创建实例
let _typeGeneratorProxy: TemplateTypeGenerator | null = null
export const typeGenerator = new Proxy({} as TemplateTypeGenerator, {
  get(target, prop) {
    if (!_typeGeneratorProxy) {
      _typeGeneratorProxy = getTypeGenerator()
    }
    return (_typeGeneratorProxy as any)[prop]
  }
})
