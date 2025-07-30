import type { PluralRule, PluralRules, TranslationParams } from '@/core/types'

/**
 * 默认复数规则（英语规则）
 * @param count 数量
 * @returns 复数形式索引
 */
const defaultPluralRule: PluralRule = (count: number): number => {
  return count === 1 ? 0 : 1
}

/**
 * 各语言的复数规则
 */
const PLURAL_RULES: PluralRules = {
  // 英语：单数/复数
  'en': (count: number) => count === 1 ? 0 : 1,
  'en-US': (count: number) => count === 1 ? 0 : 1,
  'en-GB': (count: number) => count === 1 ? 0 : 1,

  // 中文：无复数变化
  'zh': () => 0,
  'zh-CN': () => 0,
  'zh-TW': () => 0,
  'zh-HK': () => 0,

  // 日语：无复数变化
  'ja': () => 0,
  'ja-JP': () => 0,

  // 法语：0和1为单数，其他为复数
  'fr': (count: number) => count <= 1 ? 0 : 1,
  'fr-FR': (count: number) => count <= 1 ? 0 : 1,

  // 德语：单数/复数
  'de': (count: number) => count === 1 ? 0 : 1,
  'de-DE': (count: number) => count === 1 ? 0 : 1,

  // 俄语：复杂的复数规则
  'ru': (count: number) => {
    const mod10 = count % 10
    const mod100 = count % 100
    
    if (mod10 === 1 && mod100 !== 11) return 0
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1
    return 2
  },

  // 波兰语：复杂的复数规则
  'pl': (count: number) => {
    if (count === 1) return 0
    const mod10 = count % 10
    const mod100 = count % 100
    
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1
    return 2
  },

  // 阿拉伯语：非常复杂的复数规则
  'ar': (count: number) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count === 2) return 2
    if (count % 100 >= 3 && count % 100 <= 10) return 3
    if (count % 100 >= 11) return 4
    return 5
  }
}

/**
 * 获取语言的复数规则
 * @param locale 语言代码
 * @returns 复数规则函数
 */
export function getPluralRule(locale: string): PluralRule {
  // 首先尝试完整的语言代码
  if (PLURAL_RULES[locale]) {
    return PLURAL_RULES[locale]
  }

  // 尝试语言代码的主要部分（去掉区域代码）
  const mainLocale = locale.split('-')[0]
  if (PLURAL_RULES[mainLocale]) {
    return PLURAL_RULES[mainLocale]
  }

  // 返回默认规则
  return defaultPluralRule
}

/**
 * 解析复数表达式
 * 支持格式：{count, plural, =0{no items} =1{one item} other{# items}}
 * @param expression 复数表达式
 * @param params 参数对象
 * @param locale 语言代码
 * @returns 解析后的字符串
 */
export function parsePluralExpression(
  expression: string,
  params: TranslationParams,
  locale: string
): string {
  // 匹配复数表达式的正则
  const pluralRegex = /\{(\w+),\s*plural,\s*(.+)\}/
  const match = expression.match(pluralRegex)

  if (!match) {
    return expression
  }

  const [, countKey, rules] = match
  const count = Number(params[countKey]) || 0

  // 解析规则部分
  const ruleMap = parsePluralRules(rules)
  
  // 获取复数规则函数
  const pluralRule = getPluralRule(locale)
  
  // 首先检查精确匹配（=0, =1, =2 等）
  const exactKey = `=${count}`
  if (ruleMap[exactKey]) {
    return interpolatePluralRule(ruleMap[exactKey], count)
  }

  // 使用复数规则确定使用哪个形式
  const pluralIndex = pluralRule(count)
  const pluralKeys = ['zero', 'one', 'two', 'few', 'many', 'other']
  
  // 按优先级查找匹配的规则
  for (let i = pluralIndex; i < pluralKeys.length; i++) {
    if (ruleMap[pluralKeys[i]]) {
      return interpolatePluralRule(ruleMap[pluralKeys[i]], count)
    }
  }

  // 如果没有找到匹配的规则，使用 other
  if (ruleMap.other) {
    return interpolatePluralRule(ruleMap.other, count)
  }

  // 最后的降级方案
  return expression
}

/**
 * 解析复数规则字符串
 * @param rulesStr 规则字符串，如 "=0{no items} =1{one item} other{# items}"
 * @returns 规则映射对象
 */
function parsePluralRules(rulesStr: string): Record<string, string> {
  const rules: Record<string, string> = {}
  
  // 匹配规则的正则：=0{...} 或 other{...}
  const ruleRegex = /(=\d+|zero|one|two|few|many|other)\{([^}]*)\}/g
  let match: RegExpExecArray | null

  while ((match = ruleRegex.exec(rulesStr)) !== null) {
    const [, key, value] = match
    rules[key] = value
  }

  return rules
}

/**
 * 在复数规则中插值 # 占位符
 * @param rule 复数规则字符串
 * @param count 数量
 * @returns 插值后的字符串
 */
function interpolatePluralRule(rule: string, count: number): string {
  return rule.replace(/#/g, String(count))
}

/**
 * 检查字符串是否包含复数表达式
 * @param str 要检查的字符串
 * @returns 是否包含复数表达式
 */
export function hasPluralExpression(str: string): boolean {
  const pluralRegex = /\{\w+,\s*plural,\s*.+\}/
  return pluralRegex.test(str)
}

/**
 * 提取复数表达式中的计数键
 * @param expression 复数表达式
 * @returns 计数键数组
 */
export function extractPluralKeys(expression: string): string[] {
  const keys: string[] = []
  const pluralRegex = /\{(\w+),\s*plural,\s*.+\}/g
  let match: RegExpExecArray | null

  while ((match = pluralRegex.exec(expression)) !== null) {
    const countKey = match[1]
    if (!keys.includes(countKey)) {
      keys.push(countKey)
    }
  }

  return keys
}

/**
 * 注册自定义复数规则
 * @param locale 语言代码
 * @param rule 复数规则函数
 */
export function registerPluralRule(locale: string, rule: PluralRule): void {
  PLURAL_RULES[locale] = rule
}

/**
 * 获取所有支持的复数语言
 * @returns 支持复数的语言代码数组
 */
export function getSupportedPluralLocales(): string[] {
  return Object.keys(PLURAL_RULES)
}

/**
 * 处理包含复数表达式的翻译字符串
 * @param template 模板字符串
 * @param params 参数对象
 * @param locale 语言代码
 * @returns 处理后的字符串
 */
export function processPluralization(
  template: string,
  params: TranslationParams,
  locale: string
): string {
  if (!hasPluralExpression(template)) {
    return template
  }

  // 替换所有复数表达式
  return template.replace(/\{\w+,\s*plural,\s*.+?\}/g, (match) => {
    return parsePluralExpression(match, params, locale)
  })
}
