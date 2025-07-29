/**
 * 设备类型
 */
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  TV = 'tv',
  WEARABLE = 'wearable',
  CONSOLE = 'console',
  EMBEDDED = 'embedded',
  UNKNOWN = 'unknown'
}

/**
 * 操作系统类型
 */
export enum OSType {
  WINDOWS = 'Windows',
  MACOS = 'macOS',
  LINUX = 'Linux',
  ANDROID = 'Android',
  IOS = 'iOS',
  CHROME_OS = 'Chrome OS',
  UBUNTU = 'Ubuntu',
  UNKNOWN = 'Unknown'
}

/**
 * 浏览器类型
 */
export enum BrowserType {
  CHROME = 'Chrome',
  FIREFOX = 'Firefox',
  SAFARI = 'Safari',
  EDGE = 'Edge',
  IE = 'IE',
  OPERA = 'Opera',
  SAMSUNG = 'Samsung Browser',
  UC = 'UC Browser',
  WECHAT = 'WeChat',
  QQ = 'QQ Browser',
  UNKNOWN = 'Unknown'
}

/**
 * 设备方向
 */
export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

/**
 * 网络类型
 */
export enum NetworkType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  BLUETOOTH = 'bluetooth',
  UNKNOWN = 'unknown',
  NONE = 'none'
}

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  /** 设备类型 */
  type: DeviceType
  /** 设备型号 */
  model?: string
  /** 设备厂商 */
  vendor?: string
  /** 是否为移动设备 */
  isMobile: boolean
  /** 是否为平板设备 */
  isTablet: boolean
  /** 是否为桌面设备 */
  isDesktop: boolean
  /** 是否为触摸设备 */
  isTouchDevice: boolean
  /** 设备像素比 */
  pixelRatio: number
  /** 屏幕信息 */
  screen: ScreenInfo
  /** 设备方向 */
  orientation: Orientation
}

/**
 * 操作系统信息接口
 */
export interface OSInfo {
  /** 操作系统名称 */
  name: OSType
  /** 操作系统版本 */
  version?: string
  /** 操作系统架构 */
  architecture?: string
  /** 是否为移动操作系统 */
  isMobile: boolean
  /** 是否为桌面操作系统 */
  isDesktop: boolean
}

/**
 * 浏览器信息接口
 */
export interface BrowserInfo {
  /** 浏览器名称 */
  name: BrowserType
  /** 浏览器版本 */
  version?: string
  /** 浏览器引擎 */
  engine?: string
  /** 引擎版本 */
  engineVersion?: string
  /** 用户代理字符串 */
  userAgent: string
  /** 是否支持WebGL */
  supportsWebGL: boolean
  /** 是否支持WebRTC */
  supportsWebRTC: boolean
  /** 是否支持Service Worker */
  supportsServiceWorker: boolean
  /** 是否支持Push API */
  supportsPushAPI: boolean
  /** 是否支持Notification API */
  supportsNotification: boolean
  /** 是否支持Geolocation API */
  supportsGeolocation: boolean
  /** 是否支持Local Storage */
  supportsLocalStorage: boolean
  /** 是否支持Session Storage */
  supportsSessionStorage: boolean
  /** 是否支持IndexedDB */
  supportsIndexedDB: boolean
  /** 是否支持WebAssembly */
  supportsWebAssembly: boolean
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
  /** 颜色深度 */
  colorDepth: number
  /** 像素深度 */
  pixelDepth: number
  /** 设备像素比 */
  devicePixelRatio: number
}

/**
 * 网络信息接口
 */
export interface NetworkInfo {
  /** 网络类型 */
  type: NetworkType
  /** 网络速度（Mbps） */
  downlink?: number
  /** 网络延迟（ms） */
  rtt?: number
  /** 是否在线 */
  isOnline: boolean
  /** 是否为慢速网络 */
  isSlowConnection: boolean
  /** 有效连接类型 */
  effectiveType?: string
}

/**
 * 性能信息接口
 */
export interface PerformanceInfo {
  /** CPU核心数 */
  cpuCores?: number
  /** 内存大小（GB） */
  memory?: number
  /** 是否支持硬件加速 */
  hardwareAcceleration: boolean
  /** GPU信息 */
  gpu?: GPUInfo
  /** 电池信息 */
  battery?: BatteryInfo
}

/**
 * GPU信息接口
 */
export interface GPUInfo {
  /** GPU厂商 */
  vendor?: string
  /** GPU型号 */
  renderer?: string
  /** 是否支持WebGL */
  webglSupported: boolean
  /** WebGL版本 */
  webglVersion?: string
  /** 最大纹理大小 */
  maxTextureSize?: number
}

/**
 * 电池信息接口
 */
export interface BatteryInfo {
  /** 电池电量（0-1） */
  level?: number
  /** 是否正在充电 */
  charging?: boolean
  /** 充电时间（秒） */
  chargingTime?: number
  /** 放电时间（秒） */
  dischargingTime?: number
}

/**
 * 设备特性接口
 */
export interface DeviceFeatures {
  /** 是否支持触摸 */
  touch: boolean
  /** 是否支持摄像头 */
  camera: boolean
  /** 是否支持麦克风 */
  microphone: boolean
  /** 是否支持扬声器 */
  speaker: boolean
  /** 是否支持振动 */
  vibration: boolean
  /** 是否支持陀螺仪 */
  gyroscope: boolean
  /** 是否支持加速度计 */
  accelerometer: boolean
  /** 是否支持磁力计 */
  magnetometer: boolean
  /** 是否支持环境光传感器 */
  ambientLight: boolean
  /** 是否支持接近传感器 */
  proximity: boolean
  /** 是否支持NFC */
  nfc: boolean
  /** 是否支持蓝牙 */
  bluetooth: boolean
  /** 是否支持USB */
  usb: boolean
}

/**
 * 设备检测配置
 */
export interface DeviceDetectionConfig {
  /** 是否启用详细检测 */
  detailed?: boolean
  /** 是否检测性能信息 */
  includePerformance?: boolean
  /** 是否检测网络信息 */
  includeNetwork?: boolean
  /** 是否检测电池信息 */
  includeBattery?: boolean
  /** 是否检测设备特性 */
  includeFeatures?: boolean
  /** 自定义用户代理 */
  customUserAgent?: string
  /** 缓存检测结果时间（毫秒） */
  cacheTime?: number
}

/**
 * 完整设备信息接口
 */
export interface CompleteDeviceInfo {
  /** 设备信息 */
  device: DeviceInfo
  /** 操作系统信息 */
  os: OSInfo
  /** 浏览器信息 */
  browser: BrowserInfo
  /** 网络信息 */
  network?: NetworkInfo
  /** 性能信息 */
  performance?: PerformanceInfo
  /** 设备特性 */
  features?: DeviceFeatures
  /** 检测时间戳 */
  timestamp: number
}

/**
 * 设备插件配置
 */
export interface DevicePluginConfig {
  /** 是否启用自动检测 */
  autoDetect?: boolean
  /** 检测配置 */
  detection?: DeviceDetectionConfig
  /** 是否启用调试模式 */
  debug?: boolean
  /** 自定义检测器 */
  customDetectors?: Record<string, (info: CompleteDeviceInfo) => any>
}

/**
 * 设备变化事件
 */
export interface DeviceChangeEvent {
  /** 变化类型 */
  type: 'orientation' | 'network' | 'battery' | 'screen'
  /** 旧值 */
  oldValue: any
  /** 新值 */
  newValue: any
  /** 时间戳 */
  timestamp: number
}