// 条件渲染工具函数

import type { ConditionalRenderConfig } from '../types/conditional'
import type { FormItemConfig } from '../types/field'
import type { FormData } from '../types/form'
import { get } from './common'

/**
 * 条件表达式解析器
 */
export class ConditionParser {
  /**
   * 解析条件表达式
   */
  static parse(expression: string): (values: FormData) => boolean {
    // 简单的条件表达式解析
    // 支持格式: fieldName === 'value' || fieldName !== 'value' 等

    return (values: FormData) => {
      try {
        // 替换字段名为实际值
        const processedExpression = expression.replace(/(\w+)/g, match => {
          // 如果是操作符或关键字，不替换
          if (
            [
              '===',
              '!==',
              '==',
              '!=',
              '>',
              '<',
              '>=',
              '<=',
              '&&',
              '||',
              'true',
              'false',
              'null',
              'undefined',
            ].includes(match)
          ) {
            return match
          }

          // 获取字段值
          const value = get(values, match)
          return JSON.stringify(value)
        })

        // 使用 Function 构造器安全执行表达式
        return new Function(`return ${processedExpression}`)()
      } catch (error) {
        console.warn('条件表达式解析失败:', expression, error)
        return false
      }
    }
  }
}

/**
 * 内置条件函数
 */
export const builtinConditions = {
  /**
   * 字段值等于指定值
   */
  equals: (fieldName: string, value: any) => (values: FormData) => {
    return get(values, fieldName) === value
  },

  /**
   * 字段值不等于指定值
   */
  notEquals: (fieldName: string, value: any) => (values: FormData) => {
    return get(values, fieldName) !== value
  },

  /**
   * 字段值在指定数组中
   */
  in: (fieldName: string, values: any[]) => (formValues: FormData) => {
    const fieldValue = get(formValues, fieldName)
    return values.includes(fieldValue)
  },

  /**
   * 字段值不在指定数组中
   */
  notIn: (fieldName: string, values: any[]) => (formValues: FormData) => {
    const fieldValue = get(formValues, fieldName)
    return !values.includes(fieldValue)
  },

  /**
   * 字段值为空
   */
  isEmpty: (fieldName: string) => (values: FormData) => {
    const value = get(values, fieldName)
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    )
  },

  /**
   * 字段值不为空
   */
  isNotEmpty: (fieldName: string) => (values: FormData) => {
    return !builtinConditions.isEmpty(fieldName)(values)
  },

  /**
   * 字段值大于指定值
   */
  greaterThan: (fieldName: string, value: number) => (values: FormData) => {
    const fieldValue = Number(get(values, fieldName))
    return !isNaN(fieldValue) && fieldValue > value
  },

  /**
   * 字段值小于指定值
   */
  lessThan: (fieldName: string, value: number) => (values: FormData) => {
    const fieldValue = Number(get(values, fieldName))
    return !isNaN(fieldValue) && fieldValue < value
  },

  /**
   * 字段值在指定范围内
   */
  between:
    (fieldName: string, min: number, max: number) => (values: FormData) => {
      const fieldValue = Number(get(values, fieldName))
      return !isNaN(fieldValue) && fieldValue >= min && fieldValue <= max
    },

  /**
   * 字段值匹配正则表达式
   */
  matches: (fieldName: string, pattern: RegExp) => (values: FormData) => {
    const fieldValue = String(get(values, fieldName) || '')
    return pattern.test(fieldValue)
  },

  /**
   * 字段值包含指定字符串
   */
  contains: (fieldName: string, substring: string) => (values: FormData) => {
    const fieldValue = String(get(values, fieldName) || '')
    return fieldValue.includes(substring)
  },

  /**
   * 字段值以指定字符串开头
   */
  startsWith: (fieldName: string, prefix: string) => (values: FormData) => {
    const fieldValue = String(get(values, fieldName) || '')
    return fieldValue.startsWith(prefix)
  },

  /**
   * 字段值以指定字符串结尾
   */
  endsWith: (fieldName: string, suffix: string) => (values: FormData) => {
    const fieldValue = String(get(values, fieldName) || '')
    return fieldValue.endsWith(suffix)
  },

  /**
   * 多个条件的 AND 组合
   */
  and:
    (...conditions: Array<(values: FormData) => boolean>) =>
    (values: FormData) => {
      return conditions.every(condition => condition(values))
    },

  /**
   * 多个条件的 OR 组合
   */
  or:
    (...conditions: Array<(values: FormData) => boolean>) =>
    (values: FormData) => {
      return conditions.some(condition => condition(values))
    },

  /**
   * 条件取反
   */
  not: (condition: (values: FormData) => boolean) => (values: FormData) => {
    return !condition(values)
  },
}

/**
 * 条件构建器
 */
export class ConditionBuilder {
  private conditions: Array<(values: FormData) => boolean> = []

  /**
   * 添加条件
   */
  add(condition: (values: FormData) => boolean): this {
    this.conditions.push(condition)
    return this
  }

  /**
   * 字段等于值
   */
  equals(fieldName: string, value: any): this {
    return this.add(builtinConditions.equals(fieldName, value))
  }

  /**
   * 字段不等于值
   */
  notEquals(fieldName: string, value: any): this {
    return this.add(builtinConditions.notEquals(fieldName, value))
  }

  /**
   * 字段值在数组中
   */
  in(fieldName: string, values: any[]): this {
    return this.add(builtinConditions.in(fieldName, values))
  }

  /**
   * 字段值不在数组中
   */
  notIn(fieldName: string, values: any[]): this {
    return this.add(builtinConditions.notIn(fieldName, values))
  }

  /**
   * 字段为空
   */
  isEmpty(fieldName: string): this {
    return this.add(builtinConditions.isEmpty(fieldName))
  }

  /**
   * 字段不为空
   */
  isNotEmpty(fieldName: string): this {
    return this.add(builtinConditions.isNotEmpty(fieldName))
  }

  /**
   * 字段大于值
   */
  greaterThan(fieldName: string, value: number): this {
    return this.add(builtinConditions.greaterThan(fieldName, value))
  }

  /**
   * 字段小于值
   */
  lessThan(fieldName: string, value: number): this {
    return this.add(builtinConditions.lessThan(fieldName, value))
  }

  /**
   * 字段在范围内
   */
  between(fieldName: string, min: number, max: number): this {
    return this.add(builtinConditions.between(fieldName, min, max))
  }

  /**
   * 字段匹配正则
   */
  matches(fieldName: string, pattern: RegExp): this {
    return this.add(builtinConditions.matches(fieldName, pattern))
  }

  /**
   * 构建 AND 条件
   */
  buildAnd(): (values: FormData) => boolean {
    return builtinConditions.and(...this.conditions)
  }

  /**
   * 构建 OR 条件
   */
  buildOr(): (values: FormData) => boolean {
    return builtinConditions.or(...this.conditions)
  }

  /**
   * 构建单个条件（默认为 AND）
   */
  build(): (values: FormData) => boolean {
    if (this.conditions.length === 0) {
      return () => true
    }
    if (this.conditions.length === 1) {
      return this.conditions[0]
    }
    return this.buildAnd()
  }

  /**
   * 重置条件
   */
  reset(): this {
    this.conditions = []
    return this
  }
}

/**
 * 创建条件构建器
 */
export function createCondition(): ConditionBuilder {
  return new ConditionBuilder()
}

/**
 * 解析依赖字段
 */
export function parseDependencies(
  condition: ConditionalRenderConfig
): string[] {
  if (typeof condition.dependsOn === 'string') {
    return [condition.dependsOn]
  }
  if (Array.isArray(condition.dependsOn)) {
    return condition.dependsOn
  }
  return []
}

/**
 * 检查字段是否应该显示（基于完整的条件渲染配置）
 */
export function shouldShowFieldAdvanced(
  field: FormItemConfig,
  formData: FormData,
  allFields: FormItemConfig[]
): boolean {
  if (!field.conditionalRender) {
    return !field.hidden
  }

  try {
    return field.conditionalRender.condition(formData, field, allFields)
  } catch (error) {
    console.warn(`字段 ${field.name} 条件渲染检查失败:`, error)
    return !field.hidden
  }
}

/**
 * 获取字段的动态配置
 */
export function getFieldDynamicConfig(
  field: FormItemConfig,
  formData: FormData,
  allFields: FormItemConfig[]
): Partial<FormItemConfig> | undefined {
  if (!field.conditionalRender?.render) {
    return undefined
  }

  try {
    return field.conditionalRender.render(formData, field, allFields)
  } catch (error) {
    console.warn(`字段 ${field.name} 动态配置获取失败:`, error)
    return undefined
  }
}

/**
 * 应用条件渲染到字段
 */
export function applyConditionalRender(
  field: FormItemConfig,
  formData: FormData,
  allFields: FormItemConfig[]
): FormItemConfig {
  const shouldShow = shouldShowFieldAdvanced(field, formData, allFields)
  const dynamicConfig = getFieldDynamicConfig(field, formData, allFields)

  return {
    ...field,
    ...dynamicConfig,
    hidden: !shouldShow,
  }
}

/**
 * 批量应用条件渲染
 */
export function applyConditionalRenderToFields(
  fields: FormItemConfig[],
  formData: FormData
): FormItemConfig[] {
  return fields.map(field => applyConditionalRender(field, formData, fields))
}

/**
 * 检查字段是否应该显示（基于简化的条件配置）
 */
export function shouldShowField(
  field: FormItemConfig,
  formData: Record<string, any>
): boolean {
  // 如果没有条件配置，默认显示
  if (!field.showWhen) {
    return true
  }

  const {
    field: dependentField,
    value: expectedValue,
    operator = 'equals',
  } = field.showWhen
  const actualValue = formData[dependentField]

  switch (operator) {
    case 'equals':
      return actualValue === expectedValue
    case 'not-equals':
      return actualValue !== expectedValue
    case 'includes':
      return Array.isArray(actualValue)
        ? actualValue.includes(expectedValue)
        : false
    case 'not-includes':
      return Array.isArray(actualValue)
        ? !actualValue.includes(expectedValue)
        : true
    case 'greater':
      return Number(actualValue) > Number(expectedValue)
    case 'less':
      return Number(actualValue) < Number(expectedValue)
    default:
      return true
  }
}

/**
 * 过滤可见字段（基于简化的条件显示）
 */
export function filterVisibleFields(
  fields: FormItemConfig[],
  formData: Record<string, any>
): FormItemConfig[] {
  return fields.filter(field => shouldShowField(field, formData))
}
