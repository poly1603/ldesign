import type { TranslationParams, InterpolationOptions } from '@/core/types'

/**
 * 默认插值选项
 */
const DEFAULT_OPTIONS: Required<InterpolationOptions> = {
  prefix: '{{',
  suffix: '}}',
  escapeValue: true
}

/**
 * HTML 转义映射
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
}

/**
 * 转义 HTML 字符
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, char => HTML_ESCAPE_MAP[char] || char)
}

/**
 * 格式化值
 * @param value 要格式化的值
 * @param escapeValue 是否转义 HTML
 * @returns 格式化后的字符串
 */
function formatValue(value: any, escapeValue: boolean): string {
  if (value === null || value === undefined) {
    return ''
  }

  const str = String(value)
  return escapeValue ? escapeHtml(str) : str
}

/**
 * 解析插值表达式
 * @param expression 插值表达式
 * @param params 参数对象
 * @returns 解析后的值
 */
function parseExpression(expression: string, params: TranslationParams): any {
  const trimmed = expression.trim()
  
  // 支持点分隔的嵌套属性访问
  const keys = trimmed.split('.')
  let value: any = params
  
  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined
    }
    value = value[key]
  }
  
  return value
}

/**
 * 字符串插值处理
 * @param template 模板字符串，如 "Hello {{name}}!"
 * @param params 插值参数
 * @param options 插值选项
 * @returns 插值后的字符串
 */
export function interpolate(
  template: string,
  params: TranslationParams = {},
  options: InterpolationOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const { prefix, suffix, escapeValue } = opts

  // 创建正则表达式来匹配插值标记
  const regex = new RegExp(`${escapeRegExp(prefix)}\\s*([^${escapeRegExp(suffix)}]+)\\s*${escapeRegExp(suffix)}`, 'g')

  return template.replace(regex, (match, expression) => {
    const value = parseExpression(expression, params)
    return formatValue(value, escapeValue)
  })
}

/**
 * 转义正则表达式特殊字符
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 检查字符串是否包含插值标记
 * @param template 模板字符串
 * @param options 插值选项
 * @returns 是否包含插值标记
 */
export function hasInterpolation(
  template: string,
  options: InterpolationOptions = {}
): boolean {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const { prefix, suffix } = opts
  
  const regex = new RegExp(`${escapeRegExp(prefix)}\\s*[^${escapeRegExp(suffix)}]+\\s*${escapeRegExp(suffix)}`)
  return regex.test(template)
}

/**
 * 提取模板中的所有插值键
 * @param template 模板字符串
 * @param options 插值选项
 * @returns 插值键数组
 */
export function extractInterpolationKeys(
  template: string,
  options: InterpolationOptions = {}
): string[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const { prefix, suffix } = opts
  
  const regex = new RegExp(`${escapeRegExp(prefix)}\\s*([^${escapeRegExp(suffix)}]+)\\s*${escapeRegExp(suffix)}`, 'g')
  const keys: string[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(template)) !== null) {
    const expression = match[1].trim()
    if (expression && !keys.includes(expression)) {
      keys.push(expression)
    }
  }

  return keys
}

/**
 * 验证插值参数是否完整
 * @param template 模板字符串
 * @param params 插值参数
 * @param options 插值选项
 * @returns 验证结果
 */
export function validateInterpolationParams(
  template: string,
  params: TranslationParams,
  options: InterpolationOptions = {}
): { valid: boolean; missingKeys: string[] } {
  const requiredKeys = extractInterpolationKeys(template, options)
  const missingKeys: string[] = []

  for (const key of requiredKeys) {
    const value = parseExpression(key, params)
    if (value === undefined || value === null) {
      missingKeys.push(key)
    }
  }

  return {
    valid: missingKeys.length === 0,
    missingKeys
  }
}

/**
 * 批量插值处理
 * @param templates 模板字符串数组
 * @param params 插值参数
 * @param options 插值选项
 * @returns 插值后的字符串数组
 */
export function batchInterpolate(
  templates: string[],
  params: TranslationParams = {},
  options: InterpolationOptions = {}
): string[] {
  return templates.map(template => interpolate(template, params, options))
}
