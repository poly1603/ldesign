/**
 * 浏览器 API 封装工具
 * 
 * @description
 * 提供本地存储增强、Cookie 操作、URL 参数处理、设备信息检测等功能。
 * 封装常用的浏览器 API，提供更友好的使用接口。
 */

/**
 * Cookie 配置选项
 */
export interface CookieOptions {
  /** 过期时间（天数） */
  expires?: number
  /** 过期时间（Date对象） */
  expiresDate?: Date
  /** 路径 */
  path?: string
  /** 域名 */
  domain?: string
  /** 是否安全连接 */
  secure?: boolean
  /** SameSite 属性 */
  sameSite?: 'Strict' | 'Lax' | 'None'
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  /** 是否为移动设备 */
  isMobile: boolean
  /** 是否为平板设备 */
  isTablet: boolean
  /** 是否为桌面设备 */
  isDesktop: boolean
  /** 是否为触摸设备 */
  isTouchDevice: boolean
  /** 操作系统 */
  os: string
  /** 浏览器名称 */
  browser: string
  /** 浏览器版本 */
  browserVersion: string
  /** 屏幕宽度 */
  screenWidth: number
  /** 屏幕高度 */
  screenHeight: number
  /** 设备像素比 */
  devicePixelRatio: number
}

/**
 * 设置 Cookie
 * 
 * @param name - Cookie 名称
 * @param value - Cookie 值
 * @param options - 配置选项
 * 
 * @example
 * ```typescript
 * setCookie('username', 'john', { expires: 7 }) // 7天后过期
 * setCookie('theme', 'dark', { path: '/', secure: true })
 * ```
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const {
    expires,
    expiresDate,
    path = '/',
    domain,
    secure,
    sameSite = 'Lax',
  } = options

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  // 设置过期时间
  if (expiresDate) {
    cookieString += `; expires=${expiresDate.toUTCString()}`
  } else if (expires) {
    const date = new Date()
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000)
    cookieString += `; expires=${date.toUTCString()}`
  }

  // 设置路径
  if (path) {
    cookieString += `; path=${path}`
  }

  // 设置域名
  if (domain) {
    cookieString += `; domain=${domain}`
  }

  // 设置安全标志
  if (secure) {
    cookieString += '; secure'
  }

  // 设置 SameSite
  cookieString += `; samesite=${sameSite}`

  document.cookie = cookieString
}

/**
 * 获取 Cookie
 * 
 * @param name - Cookie 名称
 * @returns Cookie 值或 null
 * 
 * @example
 * ```typescript
 * const username = getCookie('username') // 'john' 或 null
 * ```
 */
export function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + '='
  const cookies = document.cookie.split(';')

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return null
}

/**
 * 删除 Cookie
 * 
 * @param name - Cookie 名称
 * @param options - 配置选项
 * 
 * @example
 * ```typescript
 * removeCookie('username')
 * removeCookie('theme', { path: '/', domain: '.example.com' })
 * ```
 */
export function removeCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  setCookie(name, '', {
    ...options,
    expires: -1,
  })
}

/**
 * 获取所有 Cookie
 * 
 * @returns Cookie 对象
 * 
 * @example
 * ```typescript
 * const allCookies = getAllCookies()
 * // { username: 'john', theme: 'dark' }
 * ```
 */
export function getAllCookies(): Record<string, string> {
  const cookies: Record<string, string> = {}
  
  if (document.cookie) {
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value)
      }
    })
  }

  return cookies
}

/**
 * 增强的本地存储
 * 
 * @param key - 存储键
 * @param value - 存储值
 * @param options - 配置选项
 * 
 * @example
 * ```typescript
 * setStorage('user', { name: 'john', age: 25 }, { expires: 7 })
 * const user = getStorage('user') // { name: 'john', age: 25 }
 * ```
 */
export function setStorage(
  key: string,
  value: any,
  options: {
    expires?: number // 过期时间（天数）
    storage?: 'localStorage' | 'sessionStorage'
  } = {}
): void {
  const { expires, storage = 'localStorage' } = options
  
  const data = {
    value,
    timestamp: Date.now(),
    expires: expires ? Date.now() + expires * 24 * 60 * 60 * 1000 : null,
  }

  try {
    window[storage].setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Storage quota exceeded or not available:', error)
  }
}

/**
 * 获取本地存储
 * 
 * @param key - 存储键
 * @param options - 配置选项
 * @returns 存储值或 null
 */
export function getStorage(
  key: string,
  options: {
    storage?: 'localStorage' | 'sessionStorage'
  } = {}
): any {
  const { storage = 'localStorage' } = options

  try {
    const item = window[storage].getItem(key)
    if (!item) return null

    const data = JSON.parse(item)
    
    // 检查是否过期
    if (data.expires && Date.now() > data.expires) {
      window[storage].removeItem(key)
      return null
    }

    return data.value
  } catch (error) {
    console.warn('Failed to parse storage item:', error)
    return null
  }
}

/**
 * 删除本地存储
 * 
 * @param key - 存储键
 * @param options - 配置选项
 */
export function removeStorage(
  key: string,
  options: {
    storage?: 'localStorage' | 'sessionStorage'
  } = {}
): void {
  const { storage = 'localStorage' } = options
  window[storage].removeItem(key)
}

/**
 * 清空本地存储
 * 
 * @param options - 配置选项
 */
export function clearStorage(
  options: {
    storage?: 'localStorage' | 'sessionStorage'
  } = {}
): void {
  const { storage = 'localStorage' } = options
  window[storage].clear()
}

/**
 * 获取 URL 参数
 * 
 * @param url - URL 字符串（可选，默认为当前页面 URL）
 * @returns URL 参数对象
 * 
 * @example
 * ```typescript
 * // 当前 URL: https://example.com?name=john&age=25
 * const params = getUrlParams() // { name: 'john', age: '25' }
 * 
 * const params2 = getUrlParams('https://example.com?foo=bar')
 * // { foo: 'bar' }
 * ```
 */
export function getUrlParams(url?: string): Record<string, string> {
  const targetUrl = url || window.location.href
  const urlObj = new URL(targetUrl)
  const params: Record<string, string> = {}

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}

/**
 * 设置 URL 参数
 * 
 * @param params - 参数对象
 * @param options - 配置选项
 * 
 * @example
 * ```typescript
 * setUrlParams({ name: 'john', age: '25' })
 * setUrlParams({ page: '2' }, { replace: true })
 * ```
 */
export function setUrlParams(
  params: Record<string, string | number | boolean>,
  options: {
    replace?: boolean // 是否替换当前历史记录
    baseUrl?: string // 基础 URL
  } = {}
): void {
  const { replace = false, baseUrl } = options
  const url = new URL(baseUrl || window.location.href)

  // 设置参数
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, String(value))
    }
  })

  // 更新 URL
  if (replace) {
    window.history.replaceState({}, '', url.toString())
  } else {
    window.history.pushState({}, '', url.toString())
  }
}

/**
 * 删除 URL 参数
 * 
 * @param keys - 要删除的参数键
 * @param options - 配置选项
 */
export function removeUrlParams(
  keys: string | string[],
  options: {
    replace?: boolean
  } = {}
): void {
  const { replace = false } = options
  const url = new URL(window.location.href)
  const keysArray = Array.isArray(keys) ? keys : [keys]

  keysArray.forEach(key => {
    url.searchParams.delete(key)
  })

  if (replace) {
    window.history.replaceState({}, '', url.toString())
  } else {
    window.history.pushState({}, '', url.toString())
  }
}

/**
 * 获取设备信息
 * 
 * @returns 设备信息对象
 * 
 * @example
 * ```typescript
 * const device = getDeviceInfo()
 *  // true/false
 *  // 'iOS', 'Android', 'Windows', etc.
 * ```
 */
export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent.toLowerCase()
  
  // 检测操作系统
  let os = 'Unknown'
  if (userAgent.includes('windows')) os = 'Windows'
  else if (userAgent.includes('mac')) os = 'macOS'
  else if (userAgent.includes('linux')) os = 'Linux'
  else if (userAgent.includes('android')) os = 'Android'
  else if (userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'iOS'

  // 检测浏览器
  let browser = 'Unknown'
  let browserVersion = ''
  
  if (userAgent.includes('chrome')) {
    browser = 'Chrome'
    browserVersion = userAgent.match(/chrome\/(\d+)/)?.[1] || ''
  } else if (userAgent.includes('firefox')) {
    browser = 'Firefox'
    browserVersion = userAgent.match(/firefox\/(\d+)/)?.[1] || ''
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    browser = 'Safari'
    browserVersion = userAgent.match(/version\/(\d+)/)?.[1] || ''
  } else if (userAgent.includes('edge')) {
    browser = 'Edge'
    browserVersion = userAgent.match(/edge\/(\d+)/)?.[1] || ''
  }

  // 检测设备类型
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent)
  const isDesktop = !isMobile && !isTablet
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    os,
    browser,
    browserVersion,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio || 1,
  }
}

/**
 * 检测浏览器功能支持
 * 
 * @returns 功能支持对象
 * 
 * @example
 * ```typescript
 * const support = getBrowserSupport()
 * if (support.webp) {
 *   // 使用 WebP 图片
 * }
 * ```
 */
export function getBrowserSupport() {
  return {
    // 存储支持
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof Storage !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined',
    
    // 网络支持
    fetch: typeof fetch !== 'undefined',
    websocket: typeof WebSocket !== 'undefined',
    
    // 媒体支持
    webp: (() => {
      const canvas = document.createElement('canvas')
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    })(),
    
    // API 支持
    geolocation: 'geolocation' in navigator,
    notification: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    intersectionObserver: 'IntersectionObserver' in window,
    mutationObserver: 'MutationObserver' in window,
    
    // 输入支持
    touch: 'ontouchstart' in window,
    pointer: 'PointerEvent' in window,
    
    // CSS 支持
    cssGrid: CSS.supports('display', 'grid'),
    cssFlexbox: CSS.supports('display', 'flex'),
    cssCustomProperties: CSS.supports('--custom', 'property'),
  }
}

/**
 * 复制文本到剪贴板（基础版本）
 *
 * @param text - 要复制的文本
 * @returns 是否复制成功
 *
 * @example
 * ```typescript
 * const success = await copyTextToClipboard('Hello World')
 * ```
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // 降级到传统方法
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    
    textArea.focus()
    textArea.select()
    
    const result = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return result
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * 获取页面可见性状态
 * 
 * @returns 页面是否可见
 * 
 * @example
 * ```typescript
 * const isVisible = getPageVisibility()
 * ```
 */
export function getPageVisibility(): boolean {
  return !document.hidden
}

/**
 * 监听页面可见性变化
 * 
 * @param callback - 回调函数
 * @returns 取消监听的函数
 * 
 * @example
 * ```typescript
 * const unwatch = watchPageVisibility((isVisible) => {
 *    * })
 * 
 * // 取消监听
 * unwatch()
 * ```
 */
export function watchPageVisibility(callback: (isVisible: boolean) => void): () => void {
  const handleVisibilityChange = () => {
    callback(getPageVisibility())
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}
