/**
 * 字符串处理工具类
 * 提供字符串格式化、转换、验证等功能
 */

/**
 * 字符串处理工具
 */
export class StringUtils {
  /**
   * 转换为驼峰命名
   * @param str 输入字符串
   * @returns 驼峰命名字符串
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, m => m.toLowerCase())
  }

  /**
   * 转换为帕斯卡命名
   * @param str 输入字符串
   * @returns 帕斯卡命名字符串
   */
  static toPascalCase(str: string): string {
    const s = str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  /**
   * 转换为短横线命名
   * @param str 输入字符串
   * @returns 短横线命名字符串
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }

  /**
   * 转换为下划线命名
   * @param str 输入字符串
   * @returns 下划线命名字符串
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase()
  }

  /**
   * 转换为常量命名（全大写下划线）
   * @param str 输入字符串
   * @returns 常量命名字符串
   */
  static toConstantCase(str: string): string {
    return StringUtils.toSnakeCase(str).toUpperCase()
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
    if (str.length <= length)
      return str
    return str.slice(0, length - suffix.length) + suffix
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
   * 字符串反转
   * @param str 输入字符串
   * @returns 反转后的字符串
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('')
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
   * 字符串模板替换
   * @param template 模板字符串
   * @param data 数据对象
   * @param options 选项
   * @returns 替换后的字符串
   */
  static template(
    template: string,
    data: Record<string, any>,
    options: {
      prefix?: string
      suffix?: string
      fallback?: string
    } = {},
  ): string {
    const { prefix = '{{', suffix = '}}', fallback = '' } = options
    const pattern = new RegExp(`${prefix}\\s*([^${suffix}]+)\\s*${suffix}`, 'g')

    return template.replace(pattern, (_match, key) => {
      const value = StringUtils.get(data, key.trim())
      return value !== undefined ? String(value) : fallback
    })
  }

  /**
   * 获取嵌套对象属性值
   * @param obj 对象
   * @param path 路径
   * @returns 属性值
   */
  private static get(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * 字符串插值（ES6 模板字符串风格）
   * @param template 模板字符串
   * @param data 数据对象
   * @returns 插值后的字符串
   */
  static interpolate(template: string, data: Record<string, any>): string {
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
   * 字符串相似度计算（编辑距离）
   * @param str1 字符串1
   * @param str2 字符串2
   * @returns 相似度（0-1）
   */
  static similarity(str1: string, str2: string): number {
    const distance = StringUtils.levenshteinDistance(str1, str2)
    const maxLength = Math.max(str1.length, str2.length)
    return maxLength === 0 ? 1 : 1 - distance / maxLength
  }

  /**
   * 计算编辑距离
   * @param str1 字符串1
   * @param str2 字符串2
   * @returns 编辑距离
   */
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = Array.from({ length: str2.length + 1 }, () =>
      Array.from({ length: str1.length + 1 }).fill(0))

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
   * 字符串转义HTML
   * @param str 输入字符串
   * @returns 转义后的字符串
   */
  static escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
    }

    return str.replace(/[&<>"']/g, match => htmlEscapes[match as keyof typeof htmlEscapes] || match)
  }

  /**
   * 字符串反转义HTML
   * @param str 输入字符串
   * @returns 反转义后的字符串
   */
  static unescapeHtml(str: string): string {
    const htmlUnescapes: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': '\'',
    }

    return str.replace(/&(?:amp|lt|gt|quot|#39);/g, match => htmlUnescapes[match as keyof typeof htmlUnescapes] || match)
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
