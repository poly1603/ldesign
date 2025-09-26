/**
 * @ldesign/cropper 设备检测工具函数
 * 
 * 提供设备类型检测、浏览器检测、特性检测等工具函数
 */

import type { DeviceType } from '../types';

// ============================================================================
// 设备类型检测
// ============================================================================

/**
 * 检测设备类型
 * @returns 设备类型
 */
export function detectDeviceType(): DeviceType {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  
  // 检测移动设备
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    // 区分手机和平板
    if (/ipad/i.test(userAgent) || (screenWidth >= 768 && screenWidth <= 1024)) {
      return 'tablet';
    }
    return 'mobile';
  }
  
  // 基于屏幕尺寸判断
  if (screenWidth <= 768) {
    return 'mobile';
  } else if (screenWidth <= 1024) {
    return 'tablet';
  }
  
  return 'desktop';
}

/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobile(): boolean {
  return detectDeviceType() === 'mobile';
}

/**
 * 检查是否为平板设备
 * @returns 是否为平板设备
 */
export function isTablet(): boolean {
  return detectDeviceType() === 'tablet';
}

/**
 * 检查是否为桌面设备
 * @returns 是否为桌面设备
 */
export function isDesktop(): boolean {
  return detectDeviceType() === 'desktop';
}

/**
 * 检查是否为触摸设备
 * @returns 是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 || 
         (navigator as any).msMaxTouchPoints > 0;
}

// ============================================================================
// 浏览器检测
// ============================================================================

/**
 * 浏览器信息接口
 */
export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
}

/**
 * 检测浏览器信息
 * @returns 浏览器信息
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  let name = 'Unknown';
  let version = 'Unknown';
  let engine = 'Unknown';

  // Chrome
  if (/Chrome\/(\d+)/.test(userAgent) && !/Edg\//.test(userAgent)) {
    name = 'Chrome';
    version = RegExp.$1;
    engine = 'Blink';
  }
  // Edge
  else if (/Edg\/(\d+)/.test(userAgent)) {
    name = 'Edge';
    version = RegExp.$1;
    engine = 'Blink';
  }
  // Firefox
  else if (/Firefox\/(\d+)/.test(userAgent)) {
    name = 'Firefox';
    version = RegExp.$1;
    engine = 'Gecko';
  }
  // Safari
  else if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) {
    name = 'Safari';
    engine = 'WebKit';
    if (/Version\/(\d+)/.test(userAgent)) {
      version = RegExp.$1;
    }
  }
  // Internet Explorer
  else if (/MSIE (\d+)/.test(userAgent) || /Trident\/.*rv:(\d+)/.test(userAgent)) {
    name = 'Internet Explorer';
    version = RegExp.$1;
    engine = 'Trident';
  }

  return { name, version, engine, platform };
}

/**
 * 检查是否为特定浏览器
 * @param browserName 浏览器名称
 * @returns 是否为指定浏览器
 */
export function isBrowser(browserName: string): boolean {
  return detectBrowser().name.toLowerCase() === browserName.toLowerCase();
}

/**
 * 检查浏览器版本是否满足最低要求
 * @param minVersion 最低版本
 * @returns 是否满足要求
 */
export function isBrowserVersionSupported(minVersion: number): boolean {
  const browser = detectBrowser();
  const currentVersion = parseInt(browser.version, 10);
  return !isNaN(currentVersion) && currentVersion >= minVersion;
}

// ============================================================================
// 操作系统检测
// ============================================================================

/**
 * 操作系统类型
 */
export type OSType = 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown';

/**
 * 检测操作系统
 * @returns 操作系统类型
 */
export function detectOS(): OSType {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  if (/Win/.test(platform)) {
    return 'Windows';
  }
  if (/Mac/.test(platform)) {
    return /iPhone|iPad|iPod/.test(userAgent) ? 'iOS' : 'macOS';
  }
  if (/Linux/.test(platform)) {
    return /Android/.test(userAgent) ? 'Android' : 'Linux';
  }
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return 'iOS';
  }
  if (/Android/.test(userAgent)) {
    return 'Android';
  }

  return 'Unknown';
}

/**
 * 检查是否为特定操作系统
 * @param osName 操作系统名称
 * @returns 是否为指定操作系统
 */
export function isOS(osName: OSType): boolean {
  return detectOS() === osName;
}

// ============================================================================
// 屏幕信息
// ============================================================================

/**
 * 屏幕信息接口
 */
export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  pixelRatio: number;
  orientation: string;
  colorDepth: number;
}

/**
 * 获取屏幕信息
 * @returns 屏幕信息
 */
export function getScreenInfo(): ScreenInfo {
  const screen = window.screen;
  
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: screen.orientation?.type || 'unknown',
    colorDepth: screen.colorDepth
  };
}

/**
 * 检查是否为高分辨率屏幕
 * @returns 是否为高分辨率屏幕
 */
export function isHighDPIScreen(): boolean {
  return window.devicePixelRatio > 1;
}

/**
 * 获取视口尺寸
 * @returns 视口尺寸
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

// ============================================================================
// 特性检测
// ============================================================================

/**
 * 检查是否支持Canvas
 * @returns 是否支持Canvas
 */
export function supportsCanvas(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  } catch {
    return false;
  }
}

/**
 * 检查是否支持WebGL
 * @returns 是否支持WebGL
 */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

/**
 * 检查是否支持File API
 * @returns 是否支持File API
 */
export function supportsFileAPI(): boolean {
  return !!(window.File && window.FileReader && window.FileList && window.Blob);
}

/**
 * 检查是否支持拖拽
 * @returns 是否支持拖拽
 */
export function supportsDragAndDrop(): boolean {
  return 'draggable' in document.createElement('div');
}

/**
 * 检查是否支持Pointer Events
 * @returns 是否支持Pointer Events
 */
export function supportsPointerEvents(): boolean {
  return 'PointerEvent' in window;
}

/**
 * 检查是否支持Intersection Observer
 * @returns 是否支持Intersection Observer
 */
export function supportsIntersectionObserver(): boolean {
  return 'IntersectionObserver' in window;
}

/**
 * 检查是否支持ResizeObserver
 * @returns 是否支持ResizeObserver
 */
export function supportsResizeObserver(): boolean {
  return 'ResizeObserver' in window;
}

/**
 * 检查是否支持CSS变量
 * @returns 是否支持CSS变量
 */
export function supportsCSSVariables(): boolean {
  return window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
}

/**
 * 检查是否支持Passive Event Listeners
 * @returns 是否支持Passive Event Listeners
 */
export function supportsPassiveEvents(): boolean {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        supportsPassive = true;
        return false;
      }
    });
    window.addEventListener('testPassive', () => {}, opts);
    window.removeEventListener('testPassive', () => {}, opts);
  } catch {
    // ignore
  }
  return supportsPassive;
}

// ============================================================================
// 性能检测
// ============================================================================

/**
 * 检查是否支持Performance API
 * @returns 是否支持Performance API
 */
export function supportsPerformanceAPI(): boolean {
  return 'performance' in window && 'now' in performance;
}

/**
 * 检查是否支持requestAnimationFrame
 * @returns 是否支持requestAnimationFrame
 */
export function supportsRequestAnimationFrame(): boolean {
  return 'requestAnimationFrame' in window;
}

/**
 * 检查是否支持requestIdleCallback
 * @returns 是否支持requestIdleCallback
 */
export function supportsRequestIdleCallback(): boolean {
  return 'requestIdleCallback' in window;
}

// ============================================================================
// 网络检测
// ============================================================================

/**
 * 网络信息接口
 */
export interface NetworkInfo {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * 获取网络信息
 * @returns 网络信息
 */
export function getNetworkInfo(): NetworkInfo {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;

  const info: NetworkInfo = {
    online: navigator.onLine
  };

  if (connection) {
    info.effectiveType = connection.effectiveType;
    info.downlink = connection.downlink;
    info.rtt = connection.rtt;
    info.saveData = connection.saveData;
  }

  return info;
}

/**
 * 检查是否为慢速网络
 * @returns 是否为慢速网络
 */
export function isSlowNetwork(): boolean {
  const networkInfo = getNetworkInfo();
  return networkInfo.effectiveType === 'slow-2g' || 
         networkInfo.effectiveType === '2g' ||
         (networkInfo.downlink !== undefined && networkInfo.downlink < 1);
}

// ============================================================================
// 设备能力综合评估
// ============================================================================

/**
 * 设备能力等级
 */
export type DeviceCapability = 'low' | 'medium' | 'high';

/**
 * 评估设备能力
 * @returns 设备能力等级
 */
export function assessDeviceCapability(): DeviceCapability {
  const screenInfo = getScreenInfo();
  const networkInfo = getNetworkInfo();
  const deviceType = detectDeviceType();
  
  let score = 0;

  // 设备类型评分
  if (deviceType === 'desktop') score += 3;
  else if (deviceType === 'tablet') score += 2;
  else score += 1;

  // 屏幕分辨率评分
  if (screenInfo.width >= 1920) score += 3;
  else if (screenInfo.width >= 1280) score += 2;
  else score += 1;

  // 像素比评分
  if (screenInfo.pixelRatio >= 2) score += 2;
  else score += 1;

  // 网络评分
  if (!isSlowNetwork()) score += 2;
  else score += 1;

  // 特性支持评分
  if (supportsWebGL()) score += 1;
  if (supportsPerformanceAPI()) score += 1;
  if (supportsRequestAnimationFrame()) score += 1;

  // 根据总分判断能力等级
  if (score >= 10) return 'high';
  if (score >= 7) return 'medium';
  return 'low';
}

// ============================================================================
// 设备信息汇总
// ============================================================================

/**
 * 完整设备信息接口
 */
export interface DeviceInfo {
  type: DeviceType;
  browser: BrowserInfo;
  os: OSType;
  screen: ScreenInfo;
  network: NetworkInfo;
  capability: DeviceCapability;
  features: {
    touch: boolean;
    canvas: boolean;
    webgl: boolean;
    fileAPI: boolean;
    dragAndDrop: boolean;
    pointerEvents: boolean;
    passiveEvents: boolean;
  };
}

/**
 * 获取完整设备信息
 * @returns 设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    type: detectDeviceType(),
    browser: detectBrowser(),
    os: detectOS(),
    screen: getScreenInfo(),
    network: getNetworkInfo(),
    capability: assessDeviceCapability(),
    features: {
      touch: isTouchDevice(),
      canvas: supportsCanvas(),
      webgl: supportsWebGL(),
      fileAPI: supportsFileAPI(),
      dragAndDrop: supportsDragAndDrop(),
      pointerEvents: supportsPointerEvents(),
      passiveEvents: supportsPassiveEvents()
    }
  };
}
