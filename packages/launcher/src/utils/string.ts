/**
 * 字符串工具模块
 * 提供字符串处理、格式化和转换的工具函数
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */

/**
 * 字符串处理工具类
 * 提供常用的字符串操作和格式化方法
 */
export class StringUtils {
  /**
   * 转换为驼峰命名（camelCase）
   * @param str 输入字符串
   * @returns 驼峰命名字符串
   * @example
   * ```typescript
   * StringUtils.toCamelCase('hello-world') // 'helloWorld'
   * StringUtils.toCamelCase('user_name') // 'userName'
   * StringUtils.toCamelCase('my-project-name') // 'myProjectName'
   * ```
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^[A-Z]/, char => char.toLowerCase())
  }

  /**
   * 转换为短横线命名（kebab-case）
   * @param str 输入字符串
   * @returns 短横线命名字符串
   * @example
   * ```typescript
   * StringUtils.toKebabCase('helloWorld') // 'hello-world'
   * StringUtils.toKebabCase('userName') // 'user-name'
   * StringUtils.toKebabCase('MyProjectName') // 'my-project-name'
   * ```
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }

  /**
   * 转换为帕斯卡命名（PascalCase）
   * @param str 输入字符串
   * @returns 帕斯卡命名字符串
   * @example
   * ```typescript
   * StringUtils.toPascalCase('hello-world') // 'HelloWorld'
   * StringUtils.toPascalCase('user_name') // 'UserName'
   * StringUtils.toPascalCase('my-project') // 'MyProject'
   * ```
   */
  static toPascalCase(str: string): string {
    const camelCase = this.toCamelCase(str)
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
  }

  /**
   * 转换为蛇形命名（snake_case）
   * @param str 输入字符串
   * @returns 蛇形命名字符串
   * @example
   * ```typescript
   * StringUtils.toSnakeCase('helloWorld') // 'hello_world'
   * StringUtils.toSnakeCase('UserName') // 'user_name'
   * StringUtils.toSnakeCase('my-project') // 'my_project'
   * ```
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase()
  }

  /**
   * 格式化字节数为可读的字符串
   * @param bytes 字节数
   * @param decimals 小数位数
   * @returns 格式化后的字符串
   * @example
   * ```typescript
   * StringUtils.formatBytes(1024) // '1.00 KB'
   * StringUtils.formatBytes(1536, 1) // '1.5 KB'
   * StringUtils.formatBytes(1048576) // '1.00 MB'
   * StringUtils.formatBytes(0) // '0 Bytes'
   * ```
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
  }

  /**
   * 格式化时间（毫秒）为可读的字符串
   * @param ms 毫秒数
   * @returns 格式化后的时间字符串
   * @example
   * ```typescript
   * StringUtils.formatTime(500) // '500ms'
   * StringUtils.formatTime(1500) // '1.5s'
   * StringUtils.formatTime(65000) // '1.1m'
   * StringUtils.formatTime(3665000) // '61.1m'
   * ```
   */
  static formatTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    }

    const seconds = ms / 1000
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`
    }

    const minutes = seconds / 60
    if (minutes < 60) {
      return `${minutes.toFixed(1)}m`
    }

    const hours = minutes / 60
    return `${hours.toFixed(1)}h`
  }

  /**
   * 生成随机字符串
   * @param length 字符串长度
   * @param charset 字符集
   * @returns 随机字符串
   * @example
   * ```typescript
   * StringUtils.randomString(8) // 'Kj9p2NqR'
   * StringUtils.randomString(6, '0123456789') // '193847'
   * StringUtils.randomString(4, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') // 'JKPQ'
   * ```
   */
  static randomString(
    length: number = 8,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    let result = ''
    const charsetLength = charset.length
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charsetLength))
    }
    
    return result
  }

  /**
   * 截断字符串并添加省略号
   * @param str 输入字符串
   * @param maxLength 最大长度
   * @param suffix 后缀（默认为省略号）
   * @returns 截断后的字符串
   * @example
   * ```typescript
   * StringUtils.truncate('Hello World!', 8) // 'Hello...'
   * StringUtils.truncate('Short', 10) // 'Short'
   * StringUtils.truncate('Long text here', 8, ' (more)') // 'Long (more)'
   * ```
   */
  static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) {
      return str
    }
    
    const truncateLength = maxLength - suffix.length
    return str.slice(0, Math.max(0, truncateLength)) + suffix
  }

  /**
   * 首字母大写
   * @param str 输入字符串
   * @returns 首字母大写的字符串
   * @example
   * ```typescript
   * StringUtils.capitalize('hello') // 'Hello'
   * StringUtils.capitalize('WORLD') // 'WORLD'
   * StringUtils.capitalize('') // ''
   * ```
   */
  static capitalize(str: string): string {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * 移除字符串前后的空白字符
   * @param str 输入字符串
   * @param chars 要移除的字符（默认为空白字符）
   * @returns 处理后的字符串
   * @example
   * ```typescript
   * StringUtils.trim('  hello  ') // 'hello'
   * StringUtils.trim('--hello--', '-') // 'hello'
   * StringUtils.trim('___test___', '_') // 'test'
   * ```
   */
  static trim(str: string, chars?: string): string {
    if (!chars) {
      return str.trim()
    }
    
    const escapedChars = chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`^[${escapedChars}]+|[${escapedChars}]+$`, 'g')
    return str.replace(regex, '')
  }

  /**
   * 检查字符串是否为空（null、undefined 或仅包含空白字符）
   * @param str 输入字符串
   * @returns 是否为空
   * @example
   * ```typescript
   * StringUtils.isEmpty('') // true
   * StringUtils.isEmpty('   ') // true
   * StringUtils.isEmpty(null) // true
   * StringUtils.isEmpty('hello') // false
   * ```
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0
  }

  /**
   * 反转字符串
   * @param str 输入字符串
   * @returns 反转后的字符串
   * @example
   * ```typescript
   * StringUtils.reverse('hello') // 'olleh'
   * StringUtils.reverse('12345') // '54321'
   * ```
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('')
  }

  /**
   * 重复字符串
   * @param str 输入字符串
   * @param count 重复次数
   * @returns 重复后的字符串
   * @example
   * ```typescript
   * StringUtils.repeat('abc', 3) // 'abcabcabc'
   * StringUtils.repeat('-', 5) // '-----'
   * ```
   */
  static repeat(str: string, count: number): string {
    if (count < 0) return ''
    return str.repeat(count)
  }

  /**
   * 字符串模板替换
   * @param template 模板字符串，使用 {{key}} 作为占位符
   * @param values 替换值对象
   * @returns 替换后的字符串
   * @example
   * ```typescript
   * const template = 'Hello {{name}}, you have {{count}} messages'
   * const values = { name: 'Alice', count: 5 }
   * StringUtils.template(template, values) // 'Hello Alice, you have 5 messages'
   * ```
   */
  static template(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return key in values ? String(values[key]) : match
    })
  }

  /**
   * 将字符串转换为 URL 友好的 slug 格式
   * @param str 输入字符串
   * @returns slug 字符串
   * @example
   * ```typescript
   * StringUtils.slugify('Hello World!') // 'hello-world'
   * StringUtils.slugify('My Awesome Project') // 'my-awesome-project'
   * StringUtils.slugify('Vue.js & React') // 'vue-js-react'
   * ```
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/[\s_-]+/g, '-') // 将空格、下划线、连字符替换为单个连字符
      .replace(/^-+|-+$/g, '') // 移除首尾的连字符
  }
}

// 导出便捷函数
export const {
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
  formatBytes,
  formatTime,
  randomString,
  truncate,
  capitalize,
  trim,
  isEmpty,
  reverse,
  repeat,
  template,
  slugify,
} = StringUtils