/**
 * URL 处理增强工具类
 * 提供 URL 构建、解析、验证和规范化等功能
 * 
 * @example
 * ```typescript
 * import { UrlUtils } from '@ldesign/kit'
 * 
 * // URL 构建
 * const url = UrlUtils.buildUrl('https://api.example.com/users', {
 *   page: 1,
 *   limit: 10,
 *   search: 'john'
 * })
 * // 结果: 'https://api.example.com/users?page=1&limit=10&search=john'
 * 
 * // 查询参数解析
 * const params = UrlUtils.parseQuery('?page=1&limit=10')
 * // 结果: { page: '1', limit: '10' }
 * 
 * // URL 分析
 * const domain = UrlUtils.getDomain('https://www.example.com/path')
 * // 结果: 'example.com'
 * ```
 */

/**
 * URL 处理增强工具类
 * 提供各种 URL 操作功能
 */
export class UrlUtils {
  /**
   * 构建带查询参数的 URL
   * 
   * @param base - 基础 URL
   * @param params - 查询参数对象
   * @returns 完整的 URL 字符串
   * 
   * @example
   * ```typescript
   * UrlUtils.buildUrl('https://api.example.com/users', {
   *   page: 1,
   *   limit: 10,
   *   tags: ['javascript', 'typescript']
   * })
   * // 'https://api.example.com/users?page=1&limit=10&tags=javascript&tags=typescript'
   * ```
   */
  static buildUrl(base: string, params: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return base
    }

    const url = new URL(base)
    const searchParams = new URLSearchParams(url.search)

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          // 处理数组参数
          for (const item of value) {
            if (item !== null && item !== undefined) {
              searchParams.append(key, String(item))
            }
          }
        } else {
          searchParams.append(key, String(value))
        }
      }
    }

    url.search = searchParams.toString()
    return url.toString()
  }

  /**
   * 解析查询字符串为对象
   * 
   * @param queryString - 查询字符串（可以包含或不包含 ?）
   * @returns 查询参数对象
   * 
   * @example
   * ```typescript
   * UrlUtils.parseQuery('?page=1&limit=10&tags=js&tags=ts')
   * // { page: '1', limit: '10', tags: ['js', 'ts'] }
   * 
   * UrlUtils.parseQuery('name=John%20Doe&age=30')
   * // { name: 'John Doe', age: '30' }
   * ```
   */
  static parseQuery(queryString: string): Record<string, string | string[]> {
    const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString

    if (!cleanQuery) {
      return {}
    }

    const params = new URLSearchParams(cleanQuery)
    const result: Record<string, string | string[]> = {}

    for (const [key, value] of params.entries()) {
      if (key in result) {
        // 如果键已存在，转换为数组
        const existing = result[key]
        if (Array.isArray(existing)) {
          existing.push(value)
        } else {
          result[key] = [existing as string, value]
        }
      } else {
        result[key] = value
      }
    }

    return result
  }

  /**
   * 将对象转换为查询字符串
   * 
   * @param params - 参数对象
   * @returns 查询字符串（不包含 ?）
   * 
   * @example
   * ```typescript
   * UrlUtils.stringifyQuery({ page: 1, limit: 10, tags: ['js', 'ts'] })
   * // 'page=1&limit=10&tags=js&tags=ts'
   * ```
   */
  static stringifyQuery(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams()

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item !== null && item !== undefined) {
              searchParams.append(key, String(item))
            }
          }
        } else {
          searchParams.append(key, String(value))
        }
      }
    }

    return searchParams.toString()
  }

  /**
   * 规范化 URL
   * 
   * @param url - 需要规范化的 URL
   * @returns 规范化后的 URL
   * 
   * @example
   * ```typescript
   * UrlUtils.normalize('https://example.com//path/../other')
   * // 'https://example.com/other'
   * 
   * UrlUtils.normalize('HTTP://EXAMPLE.COM/Path')
   * // 'http://example.com/Path'
   * ```
   */
  static normalize(url: string): string {
    try {
      const urlObj = new URL(url)

      // 规范化协议和主机名为小写
      urlObj.protocol = urlObj.protocol.toLowerCase()
      urlObj.hostname = urlObj.hostname.toLowerCase()

      // 移除默认端口
      if ((urlObj.protocol === 'http:' && urlObj.port === '80') ||
        (urlObj.protocol === 'https:' && urlObj.port === '443')) {
        urlObj.port = ''
      }

      // 规范化路径（移除多余的斜杠和解析 . 和 ..）
      urlObj.pathname = urlObj.pathname.replace(/\/+/g, '/')

      return urlObj.toString()
    } catch {
      return url // 如果无法解析，返回原始 URL
    }
  }

  /**
   * 判断 URL 是否为绝对路径
   * 
   * @param url - 要检查的 URL
   * @returns 如果是绝对 URL 返回 true
   * 
   * @example
   * ```typescript
   * UrlUtils.isAbsolute('https://example.com') // true
   * UrlUtils.isAbsolute('/path/to/resource') // false
   * UrlUtils.isAbsolute('path/to/resource') // false
   * ```
   */
  static isAbsolute(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * 连接 URL 路径片段
   * 
   * @param parts - URL 路径片段
   * @returns 连接后的路径
   * 
   * @example
   * ```typescript
   * UrlUtils.join('https://example.com', 'api', 'v1', 'users')
   * // 'https://example.com/api/v1/users'
   * 
   * UrlUtils.join('/api/', '/v1/', '/users/')
   * // '/api/v1/users/'
   * ```
   */
  static join(...parts: string[]): string {
    if (parts.length === 0) {
      return ''
    }

    const [first, ...rest] = parts

    // 如果第一部分是绝对 URL，特殊处理
    if (first && this.isAbsolute(first)) {
      try {
        const url = new URL(first)
        const pathParts = [url.pathname, ...rest]
        url.pathname = this.joinPaths(...pathParts)
        return url.toString()
      } catch {
        // 如果解析失败，按普通路径处理
      }
    }

    return this.joinPaths(...parts)
  }

  /**
   * 获取 URL 的域名（不包含子域名）
   * 
   * @param url - URL 字符串
   * @returns 域名
   * 
   * @example
   * ```typescript
   * UrlUtils.getDomain('https://www.example.com/path') // 'example.com'
   * UrlUtils.getDomain('https://api.sub.example.com') // 'example.com'
   * ```
   */
  static getDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()

      // 检查是否为 IP 地址
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
      const ipv6Regex = /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i

      if (ipv4Regex.test(hostname) || ipv6Regex.test(hostname)) {
        return hostname
      }

      // 简单的域名提取逻辑（可能需要更复杂的公共后缀列表）
      const parts = hostname.split('.')
      if (parts.length >= 2) {
        return parts.slice(-2).join('.')
      }

      return hostname
    } catch {
      return ''
    }
  }

  /**
   * 获取 URL 的子域名
   * 
   * @param url - URL 字符串
   * @returns 子域名
   * 
   * @example
   * ```typescript
   * UrlUtils.getSubdomain('https://www.example.com') // 'www'
   * UrlUtils.getSubdomain('https://api.v1.example.com') // 'api.v1'
   * UrlUtils.getSubdomain('https://example.com') // ''
   * ```
   */
  static getSubdomain(url: string): string {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      const domain = this.getDomain(url)

      if (hostname === domain) {
        return ''
      }

      return hostname.replace(`.${domain}`, '')
    } catch {
      return ''
    }
  }

  /**
   * 判断两个 URL 是否属于同一域名
   * 
   * @param url1 - 第一个 URL
   * @param url2 - 第二个 URL
   * @returns 如果属于同一域名返回 true
   * 
   * @example
   * ```typescript
   * UrlUtils.isSameDomain('https://www.example.com', 'https://api.example.com') // true
   * UrlUtils.isSameDomain('https://example.com', 'https://other.com') // false
   * ```
   */
  static isSameDomain(url1: string, url2: string): boolean {
    try {
      const domain1 = this.getDomain(url1)
      const domain2 = this.getDomain(url2)
      return domain1 === domain2 && domain1 !== ''
    } catch {
      return false
    }
  }

  /**
   * 私有方法：连接路径片段
   */
  private static joinPaths(...parts: string[]): string {
    if (parts.length === 0) {
      return ''
    }

    const normalized = parts
      .filter(part => part !== '')
      .map((part, index) => {
        // 移除开头的斜杠（除了第一个部分）
        if (index > 0 && part.startsWith('/')) {
          part = part.slice(1)
        }
        // 移除结尾的斜杠（除了最后一个部分）
        if (index < parts.length - 1 && part.endsWith('/')) {
          part = part.slice(0, -1)
        }
        return part
      })
      .filter(part => part !== '')

    return normalized.join('/')
  }
}
