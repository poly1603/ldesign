/**
 * 字符串处理工具类
 * 提供字符串格式化、转换、验证等功能
 *
 * @example
 * ```typescript
 * import { StringUtils } from '@ldesign/kit'
 *
 * // 转换命名格式
 * StringUtils.toCamelCase('hello-world') // 'helloWorld'
 * StringUtils.toPascalCase('hello-world') // 'HelloWorld'
 * StringUtils.toKebabCase('HelloWorld') // 'hello-world'
 *
 * // 字符串验证
 * StringUtils.isEmail('test@example.com') // true
 * StringUtils.isUrl('https://example.com') // true
 *
 * // 字符串处理
 * StringUtils.capitalize('hello') // 'Hello'
 * StringUtils.truncate('long text', 5) // 'long...'
 * ```
 */

/**
 * 字符串处理工具类
 * 提供各种字符串操作方法，包括格式转换、验证、处理等
 */
export class StringUtils {
  /**
   * 转换为驼峰命名（camelCase）
   * 将字符串转换为驼峰命名格式，首字母小写，后续单词首字母大写
   *
   * @param str - 需要转换的输入字符串
   * @returns 转换后的驼峰命名字符串
   *
   * @example
   * ```typescript
   * StringUtils.toCamelCase('hello-world') // 'helloWorld'
   * StringUtils.toCamelCase('hello_world') // 'helloWorld'
   * StringUtils.toCamelCase('hello world') // 'helloWorld'
   * StringUtils.toCamelCase('HELLO-WORLD') // 'helloWorld'
   * ```
   */
  static toCamelCase(str: string): string {
    // 使用正则表达式匹配分隔符（-、_、空格）后的字符，并转换为大写
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      // 确保首字母小写
      .replace(/^(.)/, m => m.toLowerCase())
  }

  /**
   * 转换为帕斯卡命名（PascalCase）
   * 将字符串转换为帕斯卡命名格式，每个单词首字母大写
   *
   * @param str - 需要转换的输入字符串
   * @returns 转换后的帕斯卡命名字符串
   *
   * @example
   * ```typescript
   * StringUtils.toPascalCase('hello-world') // 'HelloWorld'
   * StringUtils.toPascalCase('hello_world') // 'HelloWorld'
   * StringUtils.toPascalCase('hello world') // 'HelloWorld'
   * StringUtils.toPascalCase('helloWorld') // 'HelloWorld'
   * ```
   */
  static toPascalCase(str: string): string {
    // 先转换为驼峰命名格式
    const s = str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    // 确保首字母大写
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  /**
   * 转换为短横线命名（kebab-case）
   * 将字符串转换为短横线分隔的小写格式，常用于CSS类名和URL
   *
   * @param str - 需要转换的输入字符串
   * @returns 转换后的短横线命名字符串
   *
   * @example
   * ```typescript
   * StringUtils.toKebabCase('HelloWorld') // 'hello-world'
   * StringUtils.toKebabCase('hello_world') // 'hello-world'
   * StringUtils.toKebabCase('hello world') // 'hello-world'
   * StringUtils.toKebabCase('helloWorld') // 'hello-world'
   * ```
   */
  static toKebabCase(str: string): string {
    return str
      // 在小写字母和大写字母之间插入短横线
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // 将空格和下划线替换为短横线
      .replace(/[\s_]+/g, '-')
      // 转换为小写
      .toLowerCase()
  }

  /**
   * 转换为下划线命名（snake_case）
   * 将字符串转换为下划线分隔的小写格式，常用于数据库字段名和变量名
   *
   * @param str - 需要转换的输入字符串
   * @returns 转换后的下划线命名字符串
   *
   * @example
   * ```typescript
   * StringUtils.toSnakeCase('HelloWorld') // 'hello_world'
   * StringUtils.toSnakeCase('hello-world') // 'hello_world'
   * StringUtils.toSnakeCase('hello world') // 'hello_world'
   * StringUtils.toSnakeCase('helloWorld') // 'hello_world'
   * ```
   */
  static toSnakeCase(str: string): string {
    return str
      // 在小写字母和大写字母之间插入下划线
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      // 将空格和短横线替换为下划线
      .replace(/[\s-]+/g, '_')
      // 转换为小写
      .toLowerCase()
  }

  /**
   * 转换为常量命名（CONSTANT_CASE）
   * 将字符串转换为全大写下划线格式，常用于常量定义
   *
   * @param str - 需要转换的输入字符串
   * @returns 转换后的常量命名字符串
   *
   * @example
   * ```typescript
   * StringUtils.toConstantCase('HelloWorld') // 'HELLO_WORLD'
   * StringUtils.toConstantCase('hello-world') // 'HELLO_WORLD'
   * StringUtils.toConstantCase('hello world') // 'HELLO_WORLD'
   * StringUtils.toConstantCase('helloWorld') // 'HELLO_WORLD'
   * ```
   */
  static toConstantCase(str: string): string {
    // 先转换为下划线命名，然后转换为大写
    return StringUtils.toSnakeCase(str).toUpperCase()
  }

  /**
   * 别名方法，保持向后兼容性
   * 这些方法提供了更简短的调用方式
   */
  static camelCase = StringUtils.toCamelCase
  static pascalCase = StringUtils.toPascalCase
  static kebabCase = StringUtils.toKebabCase
  static snakeCase = StringUtils.toSnakeCase

  /**
   * 创建URL友好的slug
   * @param str 输入字符串
   * @returns slug字符串
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      // 替换特殊字符为空格（这样后面会被转换为连字符）
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
      // 替换空格和下划线为连字符
      .replace(/[\s_]+/g, '-')
      // 移除多余的连字符
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * 在字符串开头填充
   * @param str 输入字符串
   * @param length 目标长度
   * @param fillString 填充字符
   * @returns 填充后的字符串
   */
  static padStart(str: string, length: number, fillString = ' '): string {
    return str.padStart(length, fillString)
  }

  /**
   * 在字符串末尾填充
   * @param str 输入字符串
   * @param length 目标长度
   * @param fillString 填充字符
   * @returns 填充后的字符串
   */
  static padEnd(str: string, length: number, fillString = ' '): string {
    return str.padEnd(length, fillString)
  }

  /**
   * 反转字符串
   * @param str 输入字符串
   * @returns 反转后的字符串
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('')
  }

  /**
   * 验证邮箱地址
   * @param str 输入字符串
   * @returns 是否为有效邮箱
   */
  static isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(str) && !str.includes('..')
  }

  /**
   * 验证URL
   * @param str 输入字符串
   * @returns 是否为有效URL
   */
  static isUrl(str: string): boolean {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  /**
   * 模板字符串替换
   * @param template 模板字符串
   * @param data 数据对象
   * @returns 替换后的字符串
   */
  static template(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const keys = key.trim().split('.')
      let value: unknown = data

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k]
        } else {
          return '' // 返回空字符串而不是保留占位符
        }
      }

      return value !== undefined ? String(value) : ''
    })
  }

  /**
   * 计算编辑距离
   * @param str1 字符串1
   * @param str2 字符串2
   * @returns 编辑距离
   */
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = Array.from({ length: str2.length + 1 }, () =>
      Array.from({ length: str1.length + 1 }, () => 0))

    for (let i = 0; i <= str1.length; i++) {
      matrix[0]![i] = i
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j]![0] = j
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1,
          matrix[j - 1]![i]! + 1,
          matrix[j - 1]![i - 1]! + indicator,
        )
      }
    }

    return matrix[str2.length]![str1.length]!
  }

  /**
   * 计算字符串相似度
   * @param str1 第一个字符串
   * @param str2 第二个字符串
   * @returns 相似度（0-1之间）
   */
  static similarity(str1: string, str2: string): number {
    if (str1 === str2) return 1
    if (str1.length === 0 && str2.length === 0) return 1
    if (str1.length === 0 || str2.length === 0) return 0

    const distance = StringUtils.levenshteinDistance(str1, str2)
    const maxLength = Math.max(str1.length, str2.length)
    return 1 - distance / maxLength
  }

  /**
   * 转义HTML特殊字符
   * @param str 输入字符串
   * @returns 转义后的字符串
   */
  static escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return str.replace(/[&<>"']/g, char => htmlEscapes[char] || char)
  }

  /**
   * 反转义HTML特殊字符
   * @param str 输入字符串
   * @returns 反转义后的字符串
   */
  static unescapeHtml(str: string): string {
    const htmlUnescapes: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    }
    return str.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => htmlUnescapes[entity] || entity)
  }

  /**
   * 计算单词数量
   * @param str 输入字符串
   * @returns 单词数量
   */
  static wordCount(str: string): number {
    if (!str.trim()) return 0

    // 对于中文，每个字符算一个词
    const chineseChars = str.match(/[\u4e00-\u9fff]/g)
    const chineseCount = chineseChars ? chineseChars.length : 0

    // 对于英文，按空格分割，但要排除中文字符
    const nonChineseStr = str.replace(/[\u4e00-\u9fff]/g, '')
    const englishWords = nonChineseStr.trim().split(/\s+/).filter(word => word.length > 0)
    const englishCount = nonChineseStr.trim() ? englishWords.length : 0

    return chineseCount + englishCount
  }

  /**
   * 移除重音符号
   * @param str 输入字符串
   * @returns 移除重音后的字符串
   */
  static removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  /**
   * 首字母大写
   * @param str 输入字符串
   * @returns 首字母大写的字符串
   */
  static capitalize(str: string): string {
    if (!str)
      return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  /**
   * 首字母小写
   * @param str 输入字符串
   * @returns 首字母小写的字符串
   */
  static uncapitalize(str: string): string {
    if (!str)
      return str
    return str.charAt(0).toLowerCase() + str.slice(1)
  }

  /**
   * 标题格式化（每个单词首字母大写）
   * @param str 输入字符串
   * @returns 标题格式的字符串
   */
  static toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  }

  /**
   * 移除字符串两端空白
   * @param str 输入字符串
   * @param chars 要移除的字符
   * @returns 处理后的字符串
   */
  static trim(str: string, chars?: string): string {
    if (!chars)
      return str.trim()

    const pattern = new RegExp(`^[${chars}]+|[${chars}]+$`, 'g')
    return str.replace(pattern, '')
  }

  /**
   * 移除字符串左侧空白
   * @param str 输入字符串
   * @param chars 要移除的字符
   * @returns 处理后的字符串
   */
  static trimStart(str: string, chars?: string): string {
    if (!chars)
      return str.trimStart()

    const pattern = new RegExp(`^[${chars}]+`, 'g')
    return str.replace(pattern, '')
  }

  /**
   * 移除字符串右侧空白
   * @param str 输入字符串
   * @param chars 要移除的字符
   * @returns 处理后的字符串
   */
  static trimEnd(str: string, chars?: string): string {
    if (!chars)
      return str.trimEnd()

    const pattern = new RegExp(`[${chars}]+$`, 'g')
    return str.replace(pattern, '')
  }

  /**
   * 字符串填充
   * @param str 输入字符串
   * @param length 目标长度
   * @param fillString 填充字符串
   * @param direction 填充方向
   * @returns 填充后的字符串
   */
  static pad(
    str: string,
    length: number,
    fillString = ' ',
    direction: 'start' | 'end' | 'both' = 'both',
  ): string {
    if (str.length >= length)
      return str

    const fillLength = length - str.length

    switch (direction) {
      case 'start':
        return str.padStart(length, fillString)
      case 'end':
        return str.padEnd(length, fillString)
      case 'both': {
        const leftPad = Math.floor(fillLength / 2)
        return str.padStart(str.length + leftPad, fillString).padEnd(length, fillString)
      }
      default:
        return str
    }
  }

  /**
   * 字符串截断
   * @param str 输入字符串
   * @param length 最大长度
   * @param suffix 后缀
   * @returns 截断后的字符串
   */
  static truncate(str: string, length: number, suffix = '...'): string {
    if (!str) return str
    if (length <= 0) return suffix
    if (str.length <= length) return str

    const maxContentLength = length - suffix.length
    if (maxContentLength <= 0) return suffix

    return str.slice(0, maxContentLength) + suffix
  }

  /**
   * 字符串重复
   * @param str 输入字符串
   * @param count 重复次数
   * @returns 重复后的字符串
   */
  static repeat(str: string, count: number): string {
    return str.repeat(Math.max(0, count))
  }

  /**
   * 检查字符串是否为空
   * @param str 输入字符串
   * @returns 是否为空
   */
  static isEmpty(str: string): boolean {
    return !str || str.trim().length === 0
  }

  /**
   * 检查字符串是否不为空
   * @param str 输入字符串
   * @returns 是否不为空
   */
  static isNotEmpty(str: string): boolean {
    return !StringUtils.isEmpty(str)
  }

  /**
   * 获取嵌套对象属性值
   * @param obj 对象
   * @param path 路径
   * @returns 属性值
   */
  private static get(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key]
      }
      return undefined
    }, obj)
  }

  /**
   * 字符串插值（ES6 模板字符串风格）
   * @param template 模板字符串
   * @param data 数据对象
   * @returns 插值后的字符串
   */
  static interpolate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      try {
        // 简单的表达式求值（仅支持属性访问）
        const value = StringUtils.get(data, expression.trim())
        return value !== undefined ? String(value) : match
      }
      catch {
        return match
      }
    })
  }

  /**
   * 字符串分割（支持多个分隔符）
   * @param str 输入字符串
   * @param separators 分隔符数组
   * @returns 分割后的数组
   */
  static split(str: string, separators: string[]): string[] {
    if (separators.length === 0)
      return [str]

    const pattern = new RegExp(
      `[${separators.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')}]`,
    )

    return str.split(pattern).filter(Boolean)
  }

  /**
   * 字符串哈希
   * @param str 输入字符串
   * @returns 哈希值
   */
  static hash(str: string): number {
    let hash = 0
    if (str.length === 0)
      return hash

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }

    return hash
  }

  /**
   * 字符串转义正则表达式
   * @param str 输入字符串
   * @returns 转义后的字符串
   */
  static escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 生成随机字符串
   * @param length 长度
   * @param charset 字符集
   * @returns 随机字符串
   */
  static random(
    length: number,
    charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return result
  }

  /**
   * 字符串字节长度
   * @param str 输入字符串
   * @param encoding 编码
   * @returns 字节长度
   */
  static byteLength(str: string, encoding: BufferEncoding = 'utf8'): number {
    return Buffer.byteLength(str, encoding)
  }

  /**
   * 字符串编码转换
   * @param str 输入字符串
   * @param fromEncoding 源编码
   * @param toEncoding 目标编码
   * @returns 转换后的字符串
   */
  static convertEncoding(
    str: string,
    fromEncoding: BufferEncoding,
    toEncoding: BufferEncoding,
  ): string {
    const buffer = Buffer.from(str, fromEncoding)
    return buffer.toString(toEncoding)
  }
}
