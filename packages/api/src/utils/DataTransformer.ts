/**
 * 数据转换/序列化工具
 * 提供常用的数据转换、序列化、反序列化功能
 */

/**
 * 转换器函数类型
 */
export type TransformerFn<T = any, R = any> = (data: T) => R

/**
 * 转换器配置
 */
export interface TransformerConfig {
  /** 转换器名称 */
  name: string
  /** 转换函数 */
  transform: TransformerFn
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 数据转换器
 */
export class DataTransformer {
  private transformers = new Map<string, TransformerConfig>()

  /**
   * 注册转换器
   */
  register(config: TransformerConfig): void {
    this.transformers.set(config.name, {
      enabled: true,
      ...config,
    })
  }

  /**
   * 批量注册
   */
  registerBatch(configs: TransformerConfig[]): void {
    configs.forEach(config => this.register(config))
  }

  /**
   * 移除转换器
   */
  unregister(name: string): void {
    this.transformers.delete(name)
  }

  /**
   * 执行转换
   */
  transform<T = any, R = any>(name: string, data: T): R {
    const transformer = this.transformers.get(name)

    if (!transformer) {
      throw new Error(`Transformer "${name}" not found`)
    }

    if (!transformer.enabled) {
      return data as any
    }

    return transformer.transform(data)
  }

  /**
   * 链式转换（依次应用多个转换器）
   */
  chain<T = any>(data: T, transformerNames: string[]): any {
    return transformerNames.reduce((result, name) => {
      return this.transform(name, result)
    }, data)
  }

  /**
   * 启用/禁用转换器
   */
  setEnabled(name: string, enabled: boolean): void {
    const transformer = this.transformers.get(name)
    if (transformer) {
      transformer.enabled = enabled
    }
  }

  /**
   * 获取所有转换器名称
   */
  getTransformerNames(): string[] {
    return Array.from(this.transformers.keys())
  }

  /**
   * 清空所有转换器
   */
  clear(): void {
    this.transformers.clear()
  }
}

/**
 * 内置转换器
 */
export const BuiltinTransformers = {
  /**
   * 驼峰命名转换
   */
  camelCase: {
    name: 'camelCase',
    transform: (data: any): any => {
      if (Array.isArray(data)) {
        return data.map(item => BuiltinTransformers.camelCase.transform(item))
      }

      if (data && typeof data === 'object' && data.constructor === Object) {
        const result: any = {}
        for (const key of Object.keys(data)) {
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
          result[camelKey] = BuiltinTransformers.camelCase.transform(data[key])
        }
        return result
      }

      return data
    },
  },

  /**
   * 蛇形命名转换
   */
  snakeCase: {
    name: 'snakeCase',
    transform: (data: any): any => {
      if (Array.isArray(data)) {
        return data.map(item => BuiltinTransformers.snakeCase.transform(item))
      }

      if (data && typeof data === 'object' && data.constructor === Object) {
        const result: any = {}
        for (const key of Object.keys(data)) {
          const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
          result[snakeKey] = BuiltinTransformers.snakeCase.transform(data[key])
        }
        return result
      }

      return data
    },
  },

  /**
   * 移除空值
   */
  removeEmpty: {
    name: 'removeEmpty',
    transform: (data: any): any => {
      if (Array.isArray(data)) {
        return data
          .filter(item => item !== null && item !== undefined && item !== '')
          .map(item => BuiltinTransformers.removeEmpty.transform(item))
      }

      if (data && typeof data === 'object' && data.constructor === Object) {
        const result: any = {}
        for (const key of Object.keys(data)) {
          const value = data[key]
          if (value !== null && value !== undefined && value !== '') {
            result[key] = BuiltinTransformers.removeEmpty.transform(value)
          }
        }
        return result
      }

      return data
    },
  },

  /**
   * 日期字符串转Date对象
   */
  parseDates: {
    name: 'parseDates',
    transform: (data: any): any => {
      if (Array.isArray(data)) {
        return data.map(item => BuiltinTransformers.parseDates.transform(item))
      }

      if (data && typeof data === 'object' && data.constructor === Object) {
        const result: any = {}
        for (const key of Object.keys(data)) {
          const value = data[key]
          // 检测ISO 8601日期字符串
          if (
            typeof value === 'string'
            && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
          ) {
            result[key] = new Date(value)
          }
          else {
            result[key] = BuiltinTransformers.parseDates.transform(value)
          }
        }
        return result
      }

      return data
    },
  },

  /**
   * Date对象转日期字符串
   */
  stringifyDates: {
    name: 'stringifyDates',
    transform: (data: any): any => {
      if (Array.isArray(data)) {
        return data.map(item => BuiltinTransformers.stringifyDates.transform(item))
      }

      if (data instanceof Date) {
        return data.toISOString()
      }

      if (data && typeof data === 'object' && data.constructor === Object) {
        const result: any = {}
        for (const key of Object.keys(data)) {
          result[key] = BuiltinTransformers.stringifyDates.transform(data[key])
        }
        return result
      }

      return data
    },
  },

  /**
   * 深拷贝
   */
  deepClone: {
    name: 'deepClone',
    transform: (data: any): any => {
      if (data === null || typeof data !== 'object') {
        return data
      }

      if (data instanceof Date) {
        return new Date(data.getTime())
      }

      if (Array.isArray(data)) {
        return data.map(item => BuiltinTransformers.deepClone.transform(item))
      }

      const result: any = {}
      for (const key of Object.keys(data)) {
        result[key] = BuiltinTransformers.deepClone.transform(data[key])
      }
      return result
    },
  },

  /**
   * 扁平化对象
   */
  flatten: {
    name: 'flatten',
    transform: (data: any, prefix: string = ''): any => {
      const result: any = {}

      for (const key of Object.keys(data)) {
        const value = data[key]
        const newKey = prefix ? `${prefix}.${key}` : key

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(result, BuiltinTransformers.flatten.transform(value, newKey))
        }
        else {
          result[newKey] = value
        }
      }

      return result
    },
  },

  /**
   * 数字字符串转数字
   */
  parseNumbers: {
    name: 'parseNumbers',
    transform: (data: any): any => {
      if (Array.isArray(data)) {
        return data.map(item => BuiltinTransformers.parseNumbers.transform(item))
      }

      if (data && typeof data === 'object' && data.constructor === Object) {
        const result: any = {}
        for (const key of Object.keys(data)) {
          const value = data[key]
          if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
            result[key] = Number.parseFloat(value)
          }
          else {
            result[key] = BuiltinTransformers.parseNumbers.transform(value)
          }
        }
        return result
      }

      return data
    },
  },
}

/**
 * 创建数据转换器
 */
export function createDataTransformer(
  withBuiltin: boolean = true,
): DataTransformer {
  const transformer = new DataTransformer()

  if (withBuiltin) {
    transformer.registerBatch(Object.values(BuiltinTransformers))
  }

  return transformer
}

/**
 * 全局转换器实例
 */
let globalTransformer: DataTransformer | null = null

/**
 * 获取全局转换器
 */
export function getGlobalTransformer(): DataTransformer {
  if (!globalTransformer) {
    globalTransformer = createDataTransformer(true)
  }
  return globalTransformer
}

/**
 * 设置全局转换器
 */
export function setGlobalTransformer(transformer: DataTransformer): void {
  globalTransformer = transformer
}

/**
 * 便捷函数
 */
export function transform<T = any, R = any>(
  name: string,
  data: T,
): R {
  return getGlobalTransformer().transform(name, data)
}

export function transformChain<T = any>(
  data: T,
  transformerNames: string[],
): any {
  return getGlobalTransformer().chain(data, transformerNames)
}

/**
 * 便捷的内置转换函数
 */
export const toCamelCase = (data: any) => transform('camelCase', data)
export const toSnakeCase = (data: any) => transform('snakeCase', data)
export const removeEmpty = (data: any) => transform('removeEmpty', data)
export const parseDates = (data: any) => transform('parseDates', data)
export const stringifyDates = (data: any) => transform('stringifyDates', data)
export const deepClone = (data: any) => transform('deepClone', data)
export const flatten = (data: any) => transform('flatten', data)
export const parseNumbers = (data: any) => transform('parseNumbers', data)
