/**
 * 正则表达式工具类
 * 提供常用的正则表达式和验证方法
 * 
 * @example
 * ```typescript
 * import { RegexUtils } from '@ldesign/kit'
 * 
 * // 验证邮箱
 * const isValid = RegexUtils.isEmail('user@example.com')
 * 
 * // 提取 URL
 * const urls = RegexUtils.extractUrls(text)
 * 
 * // 验证密码强度
 * const isStrong = RegexUtils.isStrongPassword('MyPass123!')
 * ```
 */

/**
 * 常用正则表达式
 */
export const Patterns = {
  // 邮箱
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // URL
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,

  // IP 地址
  ipv4: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,

  // 手机号（中国）
  phoneZh: /^1[3-9]\d{9}$/,

  // 固定电话（中国）
  telZh: /^0\d{2,3}-?\d{7,8}$/,

  // 身份证号（中国）
  idCardZh: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,

  // 邮政编码（中国）
  postalCodeZh: /^[1-9]\d{5}$/,

  // 数字
  number: /^-?\d+(\.\d+)?$/,
  integer: /^-?\d+$/,
  positiveInteger: /^\d+$/,
  negativeInteger: /^-\d+$/,

  // 字母
  alpha: /^[a-zA-Z]+$/,
  alphaNumeric: /^[a-zA-Z0-9]+$/,

  // 用户名（字母开头，字母数字下划线）
  username: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/,

  // 密码（至少8位，包含大小写字母和数字）
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // 十六进制颜色
  hexColor: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,

  // 日期
  date: /^\d{4}-\d{2}-\d{2}$/,
  datetime: /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}$/,

  // 信用卡号
  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/,

  // Base64
  base64: /^[A-Za-z0-9+/]*={0,2}$/,

  // UUID
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  // MD5
  md5: /^[a-f0-9]{32}$/i,

  // 中文
  chinese: /^[\u4e00-\u9fa5]+$/,

  // HTML 标签
  htmlTag: /<[^>]+>/g,

  // Emoji
  emoji: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
}

/**
 * 正则表达式工具类
 */
export class RegexUtils {
  /**
   * 验证邮箱
   */
  static isEmail(str: string): boolean {
    return Patterns.email.test(str)
  }

  /**
   * 验证 URL
   */
  static isUrl(str: string): boolean {
    try {
      new URL(str)
      return true
    }
    catch {
      return Patterns.url.test(str)
    }
  }

  /**
   * 验证 IPv4 地址
   */
  static isIPv4(str: string): boolean {
    return Patterns.ipv4.test(str)
  }

  /**
   * 验证 IPv6 地址
   */
  static isIPv6(str: string): boolean {
    return Patterns.ipv6.test(str)
  }

  /**
   * 验证 IP 地址（IPv4 或 IPv6）
   */
  static isIP(str: string): boolean {
    return RegexUtils.isIPv4(str) || RegexUtils.isIPv6(str)
  }

  /**
   * 验证手机号（中国）
   */
  static isPhoneZh(str: string): boolean {
    return Patterns.phoneZh.test(str)
  }

  /**
   * 验证身份证号（中国）
   */
  static isIdCardZh(str: string): boolean {
    if (!Patterns.idCardZh.test(str)) {
      return false
    }

    // 验证校验码
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += Number.parseInt(str[i]!) * weights[i]!
    }

    const checkCode = checkCodes[sum % 11]
    return str[17]!.toUpperCase() === checkCode
  }

  /**
   * 验证数字
   */
  static isNumber(str: string): boolean {
    return Patterns.number.test(str)
  }

  /**
   * 验证整数
   */
  static isInteger(str: string): boolean {
    return Patterns.integer.test(str)
  }

  /**
   * 验证正整数
   */
  static isPositiveInteger(str: string): boolean {
    return Patterns.positiveInteger.test(str)
  }

  /**
   * 验证字母
   */
  static isAlpha(str: string): boolean {
    return Patterns.alpha.test(str)
  }

  /**
   * 验证字母数字
   */
  static isAlphaNumeric(str: string): boolean {
    return Patterns.alphaNumeric.test(str)
  }

  /**
   * 验证用户名
   */
  static isUsername(str: string): boolean {
    return Patterns.username.test(str)
  }

  /**
   * 验证密码（基本强度）
   */
  static isPassword(str: string): boolean {
    return Patterns.password.test(str)
  }

  /**
   * 验证强密码
   */
  static isStrongPassword(str: string): boolean {
    return Patterns.strongPassword.test(str)
  }

  /**
   * 验证十六进制颜色
   */
  static isHexColor(str: string): boolean {
    return Patterns.hexColor.test(str)
  }

  /**
   * 验证日期（YYYY-MM-DD）
   */
  static isDate(str: string): boolean {
    return Patterns.date.test(str)
  }

  /**
   * 验证信用卡号
   */
  static isCreditCard(str: string): boolean {
    return Patterns.creditCard.test(str.replace(/\s/g, ''))
  }

  /**
   * 验证 Base64
   */
  static isBase64(str: string): boolean {
    return Patterns.base64.test(str)
  }

  /**
   * 验证 UUID
   */
  static isUUID(str: string): boolean {
    return Patterns.uuid.test(str)
  }

  /**
   * 验证 MD5
   */
  static isMD5(str: string): boolean {
    return Patterns.md5.test(str)
  }

  /**
   * 验证中文
   */
  static isChinese(str: string): boolean {
    return Patterns.chinese.test(str)
  }

  /**
   * 提取邮箱
   */
  static extractEmails(str: string): string[] {
    const matches = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
    return matches || []
  }

  /**
   * 提取 URL
   */
  static extractUrls(str: string): string[] {
    const matches = str.match(/https?:\/\/[^\s]+/g)
    return matches || []
  }

  /**
   * 提取数字
   */
  static extractNumbers(str: string): number[] {
    const matches = str.match(/-?\d+(\.\d+)?/g)
    return matches ? matches.map(Number) : []
  }

  /**
   * 提取中文
   */
  static extractChinese(str: string): string[] {
    const matches = str.match(/[\u4e00-\u9fa5]+/g)
    return matches || []
  }

  /**
   * 移除 HTML 标签
   */
  static stripHtmlTags(str: string): string {
    return str.replace(Patterns.htmlTag, '')
  }

  /**
   * 移除 Emoji
   */
  static stripEmoji(str: string): string {
    return str.replace(Patterns.emoji, '')
  }

  /**
   * 提取 Emoji
   */
  static extractEmoji(str: string): string[] {
    const matches = str.match(Patterns.emoji)
    return matches || []
  }

  /**
   * 验证自定义正则
   */
  static test(str: string, pattern: RegExp): boolean {
    return pattern.test(str)
  }

  /**
   * 匹配所有
   */
  static matchAll(str: string, pattern: RegExp): RegExpMatchArray[] {
    const matches: RegExpMatchArray[] = []
    let match: RegExpExecArray | null

    const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)

    while ((match = regex.exec(str)) !== null) {
      matches.push(match as any)
    }

    return matches
  }

  /**
   * 替换所有匹配
   */
  static replaceAll(str: string, pattern: RegExp, replacement: string | ((match: string) => string)): string {
    if (typeof replacement === 'string') {
      return str.replace(new RegExp(pattern.source, 'g'), replacement)
    }

    let result = str
    const matches = RegexUtils.matchAll(str, pattern)

    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i]!
      const replaced = replacement(match[0]!)
      result = result.slice(0, match.index!) + replaced + result.slice(match.index! + match[0]!.length)
    }

    return result
  }

  /**
   * 转义正则表达式特殊字符
   */
  static escape(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 创建模糊匹配正则
   */
  static fuzzy(str: string): RegExp {
    const escaped = RegexUtils.escape(str)
    const pattern = escaped.split('').join('.*?')
    return new RegExp(pattern, 'i')
  }

  /**
   * 验证文件扩展名
   */
  static hasExtension(filename: string, extensions: string[]): boolean {
    const ext = filename.split('.').pop()?.toLowerCase()
    return ext ? extensions.map(e => e.toLowerCase()).includes(ext) : false
  }

  /**
   * 提取文件扩展名
   */
  static extractExtension(filename: string): string | null {
    const match = filename.match(/\.([^.]+)$/)
    return match?.[1] || null
  }

  /**
   * 验证域名
   */
  static isDomain(str: string): boolean {
    const pattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    return pattern.test(str)
  }

  /**
   * 验证子域名
   */
  static isSubdomain(str: string, domain: string): boolean {
    const pattern = new RegExp(`^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+${RegexUtils.escape(domain)}$`)
    return pattern.test(str)
  }

  /**
   * 验证语义化版本号
   */
  static isSemver(str: string): boolean {
    const pattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    return pattern.test(str)
  }

  /**
   * 验证 MAC 地址
   */
  static isMACAddress(str: string): boolean {
    const pattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    return pattern.test(str)
  }

  /**
   * 验证 ISBN
   */
  static isISBN(str: string): boolean {
    const isbn10 = /^(?:\d{9}X|\d{10})$/
    const isbn13 = /^(?:97[89]\d{10})$/

    const cleaned = str.replace(/[-\s]/g, '')
    return isbn10.test(cleaned) || isbn13.test(cleaned)
  }

  /**
   * 高亮匹配文本
   */
  static highlight(str: string, pattern: RegExp | string, tag = 'mark'): string {
    const regex = typeof pattern === 'string' ? new RegExp(RegexUtils.escape(pattern), 'gi') : pattern
    return str.replace(regex, match => `<${tag}>${match}</${tag}>`)
  }

  /**
   * 计算匹配数量
   */
  static countMatches(str: string, pattern: RegExp): number {
    const matches = RegexUtils.matchAll(str, pattern)
    return matches.length
  }

  /**
   * 分组提取
   */
  static extractGroups(str: string, pattern: RegExp): Record<string, string>[] {
    const matches = RegexUtils.matchAll(str, pattern)
    return matches.map(match => match.groups || {})
  }
}



