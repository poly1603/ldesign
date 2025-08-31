/**
 * 字符串工具函数模块
 * 
 * @description
 * 提供常用的字符串处理、格式化、验证等工具函数。
 * 这些函数具有良好的类型安全性和性能表现。
 */

/**
 * 将字符串转换为驼峰命名法
 * 
 * @param str - 要转换的字符串
 * @returns 驼峰命名法字符串
 * 
 * @example
 * ```typescript
 * toCamelCase('hello-world') // 'helloWorld'
 * toCamelCase('hello_world') // 'helloWorld'
 * toCamelCase('hello world') // 'helloWorld'
 * ```
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, char => char.toLowerCase())
}

/**
 * 将字符串转换为帕斯卡命名法
 * 
 * @param str - 要转换的字符串
 * @returns 帕斯卡命名法字符串
 * 
 * @example
 * ```typescript
 * toPascalCase('hello-world') // 'HelloWorld'
 * toPascalCase('hello_world') // 'HelloWorld'
 * ```
 */
export function toPascalCase(str: string): string {
  return toCamelCase(str).replace(/^[a-z]/, char => char.toUpperCase())
}

/**
 * 将字符串转换为短横线命名法
 * 
 * @param str - 要转换的字符串
 * @returns 短横线命名法字符串
 * 
 * @example
 * ```typescript
 * toKebabCase('helloWorld') // 'hello-world'
 * toKebabCase('HelloWorld') // 'hello-world'
 * ```
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * 将字符串转换为下划线命名法
 * 
 * @param str - 要转换的字符串
 * @returns 下划线命名法字符串
 * 
 * @example
 * ```typescript
 * toSnakeCase('helloWorld') // 'hello_world'
 * toSnakeCase('HelloWorld') // 'hello_world'
 * ```
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

/**
 * 首字母大写
 * 
 * @param str - 要处理的字符串
 * @returns 首字母大写的字符串
 * 
 * @example
 * ```typescript
 * capitalize('hello') // 'Hello'
 * capitalize('HELLO') // 'Hello'
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 截断字符串并添加省略号
 * 
 * @param str - 要截断的字符串
 * @param maxLength - 最大长度
 * @param suffix - 后缀（默认为 '...'）
 * @returns 截断后的字符串
 * 
 * @example
 * ```typescript
 * truncate('Hello World', 8) // 'Hello...'
 * truncate('Hello World', 8, '***') // 'Hello***'
 * ```
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 移除字符串中的 HTML 标签
 * 
 * @param str - 包含 HTML 的字符串
 * @returns 移除 HTML 标签后的纯文本
 * 
 * @example
 * ```typescript
 * stripHtml('<p>Hello <strong>World</strong></p>') // 'Hello World'
 * ```
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

/**
 * 转义 HTML 特殊字符
 * 
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 * 
 * @example
 * ```typescript
 * escapeHtml('<script>alert("xss")</script>') 
 * // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return str.replace(/[&<>"']/g, char => htmlEscapes[char])
}

/**
 * 反转义 HTML 特殊字符
 * 
 * @param str - 要反转义的字符串
 * @returns 反转义后的字符串
 * 
 * @example
 * ```typescript
 * unescapeHtml('&lt;div&gt;Hello&lt;/div&gt;') // '<div>Hello</div>'
 * ```
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  }

  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => htmlUnescapes[entity])
}

/**
 * 生成随机字符串
 * 
 * @param length - 字符串长度
 * @param charset - 字符集（可选）
 * @returns 随机字符串
 * 
 * @example
 * ```typescript
 * randomString(8) // 'aBc3Def9'
 * randomString(6, 'ABCDEF0123456789') // 'A3F2E1'
 * ```
 */
export function randomString(
  length: number,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * 检查字符串是否为有效的邮箱地址
 * 
 * @param email - 要验证的邮箱地址
 * @returns 如果是有效邮箱则返回 true，否则返回 false
 * 
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 检查字符串是否为有效的 URL
 * 
 * @param url - 要验证的 URL
 * @returns 如果是有效 URL 则返回 true，否则返回 false
 * 
 * @example
 * ```typescript
 * isValidUrl('https://example.com') // true
 * isValidUrl('invalid-url') // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 格式化文件大小
 * 
 * @param bytes - 字节数
 * @param decimals - 小数位数（默认为 2）
 * @returns 格式化后的文件大小字符串
 * 
 * @example
 * ```typescript
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 * formatFileSize(1073741824, 1) // '1.0 GB'
 * ```
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(dm)} ${sizes[i]}`
}

/**
 * 字符串模板替换
 * 
 * @param template - 模板字符串
 * @param data - 替换数据
 * @returns 替换后的字符串
 * 
 * @example
 * ```typescript
 * const template = 'Hello {{name}}, you have {{count}} messages'
 * const data = { name: 'John', count: 5 }
 * interpolate(template, data) // 'Hello John, you have 5 messages'
 * ```
 */
export function interpolate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
}
