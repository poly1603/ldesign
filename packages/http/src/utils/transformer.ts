/**
 * 自动数据转换器
 *
 * 自动转换响应数据中的特殊类型（日期、大数字、枚举等）
 */

/**
 * 转换器配置
 */
export interface TransformerConfig {
 /** 是否转换日期字符串为Date对象 */
 transformDates?: boolean
 /** 是否转换大数字字符串为BigInt */
 transformBigInt?: boolean
 /** 是否转换null为undefined */
 nullToUndefined?: boolean
 /** 是否转换空字符串为null */
 emptyStringToNull?: boolean
 /** 日期字段的正则匹配 */
 datePattern?: RegExp
 /** 自定义转换函数 */
 customTransformers?: Array<(key: string, value: any) => any>
}

/**
 * 数据转换器
 *
 * @example
 * ```typescript
 * const transformer = new DataTransformer({
 *  transformDates: true,
 *  transformBigInt: true,
 * })
 *
 * const data = {
 *  createdAt: '2024-01-01T00:00:00Z',
 *  count: '9007199254740991',
 * }
 *
 * const transformed = transformer.transform(data)
 * // {
 * //  createdAt: Date 对象,
 * //  count: BigInt
 * // }
 * ```
 */
export class DataTransformer {
 private config: Required<Omit<TransformerConfig, 'customTransformers'>> & { customTransformers: TransformerConfig['customTransformers'] }

 // ISO 8601日期格式正则
 private static readonly ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/

 // 常见日期字段名
 private static readonly DATE_FIELD_NAMES = [
  'date',
  'time',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'publishedAt',
  'timestamp',
  'startTime',
  'endTime',
 ]

 constructor(config: TransformerConfig = {}) {
  this.config = {
   transformDates: config.transformDates ?? true,
   transformBigInt: config.transformBigInt ?? false,
   nullToUndefined: config.nullToUndefined ?? false,
   emptyStringToNull: config.emptyStringToNull ?? false,
   datePattern: config.datePattern ?? DataTransformer.ISO_DATE_REGEX,
   customTransformers: config.customTransformers ?? [],
  }
 }

 /**
  * 转换数据
  */
 transform<T = any>(data: any): T {
  return this.transformValue('root', data) as T
 }

 /**
  * 转换单个值
  */
 private transformValue(key: string, value: any): any {
  // 应用自定义转换器
  for (const customTransformer of this.config?.customTransformers || []) {
   const result = customTransformer(key, value)
   if (result !== undefined) {
    return result
   }
  }

  // null处理
  if (value === null) {
   return this.config?.nullToUndefined ? undefined : null
  }

  // undefined直接返回
  if (value === undefined) {
   return undefined
  }

  // 字符串处理
  if (typeof value === 'string') {
   return this.transformString(key, value)
  }

  // 数组处理
  if (Array.isArray(value)) {
   return value.map((item, index) => this.transformValue(`${key}[${index}]`, item))
  }

  // 对象处理
  if (typeof value === 'object' && value !== null) {
   return this.transformObject(value)
  }

  // 其他类型直接返回
  return value
 }

 /**
  * 转换字符串
  */
 private transformString(key: string, value: string): any {
  // 空字符串处理
  if (value === '' && this.config?.emptyStringToNull) {
   return null
  }

  // 日期转换
  if (this.config?.transformDates && this.isDateField(key, value)) {
   const date = new Date(value)
   if (!Number.isNaN(date.getTime())) {
    return date
   }
  }

  // 大数字转换
  if (this.config?.transformBigInt && this.isBigIntString(value)) {
   try {
    return BigInt(value)
   }
   catch {
    // 转换失败，返回原值
   }
  }

  return value
 }

 /**
  * 转换对象
  */
 private transformObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
   result[key] = this.transformValue(key, value)
  }

  return result
 }

 /**
  * 判断是否为日期字段
  */
 private isDateField(key: string, value: string): boolean {
  // 检查字段名是否包含日期相关关键词
  const lowerKey = key.toLowerCase()
  const isDateFieldName = DataTransformer.DATE_FIELD_NAMES.some(name =>
   lowerKey.includes(name.toLowerCase()),
  )

  // 检查值是否匹配日期格式
  const matchesDatePattern = this.config?.datePattern.test(value)

  return isDateFieldName || matchesDatePattern
 }

 /**
  * 判断是否为大数字字符串
  */
 private isBigIntString(value: string): boolean {
  // 只包含数字
  if (!/^\d+$/.test(value)) {
   return false
  }

  // 超过JavaScript安全整数范围
  const num = Number(value)
  return num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER
 }

 /**
  * 反向转换（用于请求数据）
  */
 serialize<T = any>(data: any): T {
  return this.serializeValue(data) as T
 }

 /**
  * 序列化值
  */
 private serializeValue(value: any): any {
  // Date转ISO字符串
  if (value instanceof Date) {
   return value.toISOString()
  }

  // BigInt转字符串
  if (typeof value === 'bigint') {
   return value.toString()
  }

  // 数组
  if (Array.isArray(value)) {
   return value.map(item => this.serializeValue(item))
  }

  // 对象
  if (typeof value === 'object' && value !== null) {
   const result: Record<string, any> = {}
   for (const [key, val] of Object.entries(value)) {
    result[key] = this.serializeValue(val)
   }
   return result
  }

  return value
 }
}

/**
 * 创建数据转换器
 */
export function createDataTransformer(config?: TransformerConfig): DataTransformer {
 return new DataTransformer(config)
}

/**
 * 全局数据转换器
 */
export const globalDataTransformer = new DataTransformer()

/**
 * 数据转换拦截器
 *
 * 自动转换响应数据和请求数据
 */
export function createDataTransformInterceptor(config?: TransformerConfig) {
 const transformer = new DataTransformer(config)

 return {
  // 请求拦截器 - 序列化数据
  request: {
   onFulfilled: (requestConfig: any) => {
    if (requestConfig.data) {
     requestConfig.data = transformer.serialize(requestConfig.data)
    }
    return requestConfig
   },
  },

  // 响应拦截器 - 转换数据
  response: {
   onFulfilled: (response: any) => {
    if (response.data) {
     response.data = transformer.transform(response.data)
    }
    return response
   },
  },
 }
}

/**
 * 便捷转换函数
 */

/**
 * 将日期字符串转换为Date对象
 */
export function transformDates<T = any>(data: any): T {
 const transformer = new DataTransformer({
  transformDates: true,
  transformBigInt: false,
 })
 return transformer.transform(data)
}

/**
 * 将大数字字符串转换为BigInt
 */
export function transformBigInts<T = any>(data: any): T {
 const transformer = new DataTransformer({
  transformDates: false,
  transformBigInt: true,
 })
 return transformer.transform(data)
}

/**
 * 将null转换为undefined
 */
export function nullToUndefined<T = any>(data: any): T {
 const transformer = new DataTransformer({
  transformDates: false,
  nullToUndefined: true,
 })
 return transformer.transform(data)
}
