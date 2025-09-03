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
interface CookieOptions {
    /** 过期时间（天数） */
    expires?: number;
    /** 过期时间（Date对象） */
    expiresDate?: Date;
    /** 路径 */
    path?: string;
    /** 域名 */
    domain?: string;
    /** 是否安全连接 */
    secure?: boolean;
    /** SameSite 属性 */
    sameSite?: 'Strict' | 'Lax' | 'None';
}
/**
 * 设备信息
 */
interface DeviceInfo {
    /** 是否为移动设备 */
    isMobile: boolean;
    /** 是否为平板设备 */
    isTablet: boolean;
    /** 是否为桌面设备 */
    isDesktop: boolean;
    /** 是否为触摸设备 */
    isTouchDevice: boolean;
    /** 操作系统 */
    os: string;
    /** 浏览器名称 */
    browser: string;
    /** 浏览器版本 */
    browserVersion: string;
    /** 屏幕宽度 */
    screenWidth: number;
    /** 屏幕高度 */
    screenHeight: number;
    /** 设备像素比 */
    devicePixelRatio: number;
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
declare function setCookie(name: string, value: string, options?: CookieOptions): void;
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
declare function getCookie(name: string): string | null;
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
declare function removeCookie(name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void;
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
declare function getAllCookies(): Record<string, string>;
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
declare function setStorage(key: string, value: any, options?: {
    expires?: number;
    storage?: 'localStorage' | 'sessionStorage';
}): void;
/**
 * 获取本地存储
 *
 * @param key - 存储键
 * @param options - 配置选项
 * @returns 存储值或 null
 */
declare function getStorage(key: string, options?: {
    storage?: 'localStorage' | 'sessionStorage';
}): any;
/**
 * 删除本地存储
 *
 * @param key - 存储键
 * @param options - 配置选项
 */
declare function removeStorage(key: string, options?: {
    storage?: 'localStorage' | 'sessionStorage';
}): void;
/**
 * 清空本地存储
 *
 * @param options - 配置选项
 */
declare function clearStorage(options?: {
    storage?: 'localStorage' | 'sessionStorage';
}): void;
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
declare function getUrlParams(url?: string): Record<string, string>;
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
declare function setUrlParams(params: Record<string, string | number | boolean>, options?: {
    replace?: boolean;
    baseUrl?: string;
}): void;
/**
 * 删除 URL 参数
 *
 * @param keys - 要删除的参数键
 * @param options - 配置选项
 */
declare function removeUrlParams(keys: string | string[], options?: {
    replace?: boolean;
}): void;
/**
 * 获取设备信息
 *
 * @returns 设备信息对象
 *
 * @example
 * ```typescript
 * const device = getDeviceInfo()
 * console.log(device.isMobile) // true/false
 * console.log(device.os) // 'iOS', 'Android', 'Windows', etc.
 * ```
 */
declare function getDeviceInfo(): DeviceInfo;
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
declare function getBrowserSupport(): {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    fetch: boolean;
    websocket: boolean;
    webp: boolean;
    geolocation: boolean;
    notification: boolean;
    serviceWorker: boolean;
    intersectionObserver: boolean;
    mutationObserver: boolean;
    touch: boolean;
    pointer: boolean;
    cssGrid: boolean;
    cssFlexbox: boolean;
    cssCustomProperties: boolean;
};
/**
 * 复制文本到剪贴板（降级版本）
 *
 * @param text - 要复制的文本
 * @returns 是否复制成功
 *
 * @example
 * ```typescript
 * const success = await copyToClipboard('Hello World')
 * ```
 */
declare function copyToClipboard(text: string): Promise<boolean>;
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
declare function getPageVisibility(): boolean;
/**
 * 监听页面可见性变化
 *
 * @param callback - 回调函数
 * @returns 取消监听的函数
 *
 * @example
 * ```typescript
 * const unwatch = watchPageVisibility((isVisible) => {
 *   console.log('页面可见性:', isVisible)
 * })
 *
 * // 取消监听
 * unwatch()
 * ```
 */
declare function watchPageVisibility(callback: (isVisible: boolean) => void): () => void;

export { clearStorage, copyToClipboard, getAllCookies, getBrowserSupport, getCookie, getDeviceInfo, getPageVisibility, getStorage, getUrlParams, removeCookie, removeStorage, removeUrlParams, setCookie, setStorage, setUrlParams, watchPageVisibility };
export type { CookieOptions, DeviceInfo };
