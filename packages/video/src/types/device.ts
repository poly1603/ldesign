/**
 * 设备相关类型定义
 * 定义设备检测、适配和响应式处理的类型
 */

/**
 * 设备类型枚举
 */
export enum DeviceType {
  /** 移动设备 */
  MOBILE = 'mobile',
  /** 平板设备 */
  TABLET = 'tablet',
  /** 桌面设备 */
  DESKTOP = 'desktop',
  /** 智能电视 */
  TV = 'tv',
  /** 未知设备 */
  UNKNOWN = 'unknown'
}

/**
 * 操作系统类型枚举
 */
export enum OSType {
  /** iOS */
  IOS = 'ios',
  /** Android */
  ANDROID = 'android',
  /** Windows */
  WINDOWS = 'windows',
  /** macOS */
  MACOS = 'macos',
  /** Linux */
  LINUX = 'linux',
  /** 未知系统 */
  UNKNOWN = 'unknown'
}

/**
 * 浏览器类型枚举
 */
export enum BrowserType {
  /** Chrome */
  CHROME = 'chrome',
  /** Firefox */
  FIREFOX = 'firefox',
  /** Safari */
  SAFARI = 'safari',
  /** Edge */
  EDGE = 'edge',
  /** Internet Explorer */
  IE = 'ie',
  /** Opera */
  OPERA = 'opera',
  /** 微信浏览器 */
  WECHAT = 'wechat',
  /** QQ浏览器 */
  QQ = 'qq',
  /** UC浏览器 */
  UC = 'uc',
  /** 未知浏览器 */
  UNKNOWN = 'unknown'
}

/**
 * 屏幕方向枚举
 */
export enum ScreenOrientation {
  /** 竖屏 */
  PORTRAIT = 'portrait',
  /** 横屏 */
  LANDSCAPE = 'landscape'
}

/**
 * 网络类型枚举
 */
export enum NetworkType {
  /** WiFi */
  WIFI = 'wifi',
  /** 4G */
  CELLULAR_4G = '4g',
  /** 3G */
  CELLULAR_3G = '3g',
  /** 2G */
  CELLULAR_2G = '2g',
  /** 5G */
  CELLULAR_5G = '5g',
  /** 以太网 */
  ETHERNET = 'ethernet',
  /** 未知网络 */
  UNKNOWN = 'unknown'
}

/**
 * 设备能力接口
 */
export interface DeviceCapabilities {
  /** 是否支持触摸 */
  touch: boolean
  /** 是否支持鼠标 */
  mouse: boolean
  /** 是否支持键盘 */
  keyboard: boolean
  /** 是否支持全屏 */
  fullscreen: boolean
  /** 是否支持画中画 */
  pip: boolean
  /** 是否支持屏幕方向锁定 */
  orientationLock: boolean
  /** 是否支持振动 */
  vibration: boolean
  /** 是否支持设备运动 */
  deviceMotion: boolean
  /** 是否支持地理位置 */
  geolocation: boolean
  /** 是否支持摄像头 */
  camera: boolean
  /** 是否支持麦克风 */
  microphone: boolean
  /** 是否支持Web Workers */
  webWorkers: boolean
  /** 是否支持Service Workers */
  serviceWorkers: boolean
  /** 是否支持WebAssembly */
  webAssembly: boolean
}

/**
 * 屏幕信息接口
 */
export interface ScreenInfo {
  /** 屏幕宽度 */
  width: number
  /** 屏幕高度 */
  height: number
  /** 可用宽度 */
  availWidth: number
  /** 可用高度 */
  availHeight: number
  /** 像素密度 */
  pixelRatio: number
  /** 颜色深度 */
  colorDepth: number
  /** 当前方向 */
  orientation: ScreenOrientation
  /** 是否支持方向变化 */
  orientationSupport: boolean
}

/**
 * 视口信息接口
 */
export interface ViewportInfo {
  /** 视口宽度 */
  width: number
  /** 视口高度 */
  height: number
  /** 滚动X位置 */
  scrollX: number
  /** 滚动Y位置 */
  scrollY: number
  /** 缩放级别 */
  zoom: number
}

/**
 * 网络信息接口
 */
export interface NetworkInfo {
  /** 网络类型 */
  type: NetworkType
  /** 有效类型 */
  effectiveType: string
  /** 下行速度 (Mbps) */
  downlink: number
  /** 往返时间 (ms) */
  rtt: number
  /** 是否启用数据节省模式 */
  saveData: boolean
  /** 是否在线 */
  online: boolean
}

/**
 * 性能信息接口
 */
export interface PerformanceInfo {
  /** CPU核心数 */
  cpuCores: number
  /** 内存大小 (GB) */
  memory: number
  /** GPU信息 */
  gpu?: {
    vendor: string
    renderer: string
  }
  /** 硬件加速支持 */
  hardwareAcceleration: boolean
}

/**
 * 浏览器信息接口
 */
export interface BrowserInfo {
  /** 浏览器类型 */
  type: BrowserType
  /** 浏览器名称 */
  name: string
  /** 浏览器版本 */
  version: string
  /** 渲染引擎 */
  engine: string
  /** 引擎版本 */
  engineVersion: string
  /** 用户代理字符串 */
  userAgent: string
  /** 是否为移动浏览器 */
  mobile: boolean
  /** 是否为WebView */
  webview: boolean
}

/**
 * 操作系统信息接口
 */
export interface OSInfo {
  /** 操作系统类型 */
  type: OSType
  /** 操作系统名称 */
  name: string
  /** 操作系统版本 */
  version: string
  /** 系统架构 */
  architecture: string
}

/**
 * 完整设备信息接口
 */
export interface DeviceInfo {
  /** 设备类型 */
  type: DeviceType
  /** 设备型号 */
  model?: string
  /** 设备制造商 */
  manufacturer?: string
  /** 操作系统信息 */
  os: OSInfo
  /** 浏览器信息 */
  browser: BrowserInfo
  /** 屏幕信息 */
  screen: ScreenInfo
  /** 视口信息 */
  viewport: ViewportInfo
  /** 网络信息 */
  network: NetworkInfo
  /** 性能信息 */
  performance: PerformanceInfo
  /** 设备能力 */
  capabilities: DeviceCapabilities
  /** 是否为移动设备 */
  isMobile: boolean
  /** 是否为平板设备 */
  isTablet: boolean
  /** 是否为桌面设备 */
  isDesktop: boolean
  /** 是否为智能电视 */
  isTV: boolean
  /** 是否支持触摸 */
  isTouch: boolean
  /** 是否为横屏 */
  isLandscape: boolean
  /** 是否为竖屏 */
  isPortrait: boolean
}

/**
 * 设备检测器接口
 */
export interface IDeviceDetector {
  /** 获取设备信息 */
  getDeviceInfo(): DeviceInfo
  /** 检测设备类型 */
  detectDeviceType(): DeviceType
  /** 检测操作系统 */
  detectOS(): OSInfo
  /** 检测浏览器 */
  detectBrowser(): BrowserInfo
  /** 检测屏幕信息 */
  detectScreen(): ScreenInfo
  /** 检测网络信息 */
  detectNetwork(): NetworkInfo
  /** 检测设备能力 */
  detectCapabilities(): DeviceCapabilities
  /** 是否为移动设备 */
  isMobile(): boolean
  /** 是否为平板设备 */
  isTablet(): boolean
  /** 是否为桌面设备 */
  isDesktop(): boolean
  /** 是否支持特定功能 */
  supports(feature: string): boolean
}

/**
 * 响应式断点配置
 */
export interface ResponsiveBreakpoints {
  /** 移动设备断点 */
  mobile: number
  /** 平板设备断点 */
  tablet: number
  /** 桌面设备断点 */
  desktop: number
  /** 大屏设备断点 */
  large?: number
}

/**
 * 响应式管理器接口
 */
export interface IResponsiveManager {
  /** 当前断点 */
  readonly currentBreakpoint: keyof ResponsiveBreakpoints
  /** 断点配置 */
  readonly breakpoints: ResponsiveBreakpoints
  /** 设备信息 */
  readonly deviceInfo: DeviceInfo

  /** 设置断点配置 */
  setBreakpoints(breakpoints: Partial<ResponsiveBreakpoints>): void
  /** 获取当前断点 */
  getCurrentBreakpoint(): keyof ResponsiveBreakpoints
  /** 检查是否匹配断点 */
  matches(breakpoint: keyof ResponsiveBreakpoints): boolean
  /** 监听断点变化 */
  onBreakpointChange(callback: (breakpoint: keyof ResponsiveBreakpoints) => void): void
  /** 移除断点变化监听 */
  offBreakpointChange(callback: (breakpoint: keyof ResponsiveBreakpoints) => void): void
}

/**
 * 设备适配配置
 */
export interface DeviceAdaptationConfig {
  /** 移动设备配置 */
  mobile?: {
    /** 控制栏高度 */
    controlBarHeight?: number
    /** 是否显示全屏按钮 */
    showFullscreenButton?: boolean
    /** 是否启用手势控制 */
    enableGestures?: boolean
    /** 触摸灵敏度 */
    touchSensitivity?: number
  }
  /** 平板设备配置 */
  tablet?: {
    /** 控制栏高度 */
    controlBarHeight?: number
    /** 是否显示画中画按钮 */
    showPipButton?: boolean
    /** 是否启用手势控制 */
    enableGestures?: boolean
  }
  /** 桌面设备配置 */
  desktop?: {
    /** 控制栏高度 */
    controlBarHeight?: number
    /** 是否显示快捷键提示 */
    showHotkeyHints?: boolean
    /** 鼠标悬停延迟 */
    hoverDelay?: number
  }
}

/**
 * 设备适配器接口
 */
export interface IDeviceAdapter {
  /** 适配配置 */
  readonly config: DeviceAdaptationConfig
  /** 当前设备信息 */
  readonly deviceInfo: DeviceInfo

  /** 应用设备适配 */
  apply(element: HTMLElement): void
  /** 移除设备适配 */
  remove(element: HTMLElement): void
  /** 更新适配配置 */
  updateConfig(config: Partial<DeviceAdaptationConfig>): void
  /** 获取当前设备的适配配置 */
  getCurrentConfig(): any
}
