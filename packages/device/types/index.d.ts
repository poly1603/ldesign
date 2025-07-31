/**
 * 设备类型枚举
 */
type DeviceType = 'desktop' | 'tablet' | 'mobile';
/**
 * 屏幕方向枚举
 */
type Orientation = 'portrait' | 'landscape';
/**
 * 网络连接类型
 */
type NetworkType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'unknown';
/**
 * 网络连接状态
 */
type NetworkStatus = 'online' | 'offline';
/**
 * 设备检测器配置选项
 */
interface DeviceDetectorOptions {
    /** 是否启用窗口缩放监听 */
    enableResize?: boolean;
    /** 是否启用设备方向监听 */
    enableOrientation?: boolean;
    /** 自定义断点配置 */
    breakpoints?: {
        mobile: number;
        tablet: number;
    };
    /** 防抖延迟时间（毫秒） */
    debounceDelay?: number;
}
/**
 * 设备信息接口
 */
interface DeviceInfo {
    /** 设备类型 */
    type: DeviceType;
    /** 屏幕方向 */
    orientation: Orientation;
    /** 屏幕宽度 */
    width: number;
    /** 屏幕高度 */
    height: number;
    /** 设备像素比 */
    pixelRatio: number;
    /** 是否为触摸设备 */
    isTouchDevice: boolean;
    /** 用户代理字符串 */
    userAgent: string;
    /** 操作系统信息 */
    os: {
        name: string;
        version: string;
    };
    /** 浏览器信息 */
    browser: {
        name: string;
        version: string;
    };
}
/**
 * 网络信息接口
 */
interface NetworkInfo {
    /** 网络状态 */
    status: NetworkStatus;
    /** 连接类型 */
    type: NetworkType;
    /** 下载速度（Mbps） */
    downlink?: number;
    /** 往返时间（毫秒） */
    rtt?: number;
    /** 是否为计量连接 */
    saveData?: boolean;
}
/**
 * 电池信息接口
 */
interface BatteryInfo {
    /** 电池电量（0-1） */
    level: number;
    /** 是否正在充电 */
    charging: boolean;
    /** 充电时间（秒） */
    chargingTime: number;
    /** 放电时间（秒） */
    dischargingTime: number;
}
/**
 * 地理位置信息接口
 */
interface GeolocationInfo {
    /** 纬度 */
    latitude: number;
    /** 经度 */
    longitude: number;
    /** 精度（米） */
    accuracy: number;
    /** 海拔（米） */
    altitude?: number;
    /** 海拔精度（米） */
    altitudeAccuracy?: number;
    /** 方向（度） */
    heading?: number;
    /** 速度（米/秒） */
    speed?: number;
}
/**
 * 事件监听器类型
 */
type EventListener<T = any> = (data: T) => void;
/**
 * 设备检测器事件映射
 */
interface DeviceDetectorEvents {
    deviceChange: DeviceInfo;
    orientationChange: Orientation;
    resize: {
        width: number;
        height: number;
    };
    networkChange: NetworkInfo;
    batteryChange: BatteryInfo;
}
/**
 * 模块加载器接口
 */
interface ModuleLoader$1 {
    /** 加载模块 */
    load: <T = any>(name: string) => Promise<T>;
    /** 卸载模块 */
    unload: (name: string) => void;
    /** 检查模块是否已加载 */
    isLoaded: (name: string) => boolean;
}
/**
 * 扩展模块接口
 */
interface DeviceModule {
    /** 模块名称 */
    name: string;
    /** 初始化模块 */
    init: () => Promise<void> | void;
    /** 销毁模块 */
    destroy: () => Promise<void> | void;
    /** 获取模块数据 */
    getData: () => any;
}
declare module 'vue' {
    interface ComponentCustomProperties {
        $device: DeviceDetector;
    }
}

/**
 * 简单的事件发射器实现
 */
declare class EventEmitter<T extends Record<string, any> = Record<string, any>> {
    private events;
    /**
     * 添加事件监听器
     */
    on<K extends keyof T>(event: K, listener: EventListener<T[K]>): this;
    /**
     * 添加一次性事件监听器
     */
    once<K extends keyof T>(event: K, listener: EventListener<T[K]>): this;
    /**
     * 移除事件监听器
     */
    off<K extends keyof T>(event: K, listener?: EventListener<T[K]>): this;
    /**
     * 触发事件
     */
    emit<K extends keyof T>(event: K, data: T[K]): this;
    /**
     * 获取事件的监听器数量
     */
    listenerCount<K extends keyof T>(event: K): number;
    /**
     * 获取所有事件名称
     */
    eventNames(): Array<keyof T>;
    /**
     * 移除所有事件监听器
     */
    removeAllListeners<K extends keyof T>(event?: K): this;
    /**
     * 获取指定事件的所有监听器
     */
    listeners<K extends keyof T>(event: K): EventListener<T[K]>[];
    /**
     * 检查是否有指定事件的监听器
     */
    hasListeners<K extends keyof T>(event: K): boolean;
}

/**
 * 设备检测器主类
 */
declare class DeviceDetector extends EventEmitter<DeviceDetectorEvents> {
    private options;
    private moduleLoader;
    private currentDeviceInfo;
    private resizeHandler?;
    private orientationHandler?;
    private isDestroyed;
    constructor(options?: DeviceDetectorOptions);
    /**
     * 获取当前设备类型
     */
    getDeviceType(): DeviceType;
    /**
     * 获取当前屏幕方向
     */
    getOrientation(): Orientation;
    /**
     * 获取完整的设备信息
     */
    getDeviceInfo(): DeviceInfo;
    /**
     * 检查是否为移动设备
     */
    isMobile(): boolean;
    /**
     * 检查是否为平板设备
     */
    isTablet(): boolean;
    /**
     * 检查是否为桌面设备
     */
    isDesktop(): boolean;
    /**
     * 检查是否为触摸设备
     */
    isTouchDevice(): boolean;
    /**
     * 刷新设备信息
     */
    refresh(): void;
    /**
     * 动态加载扩展模块
     */
    loadModule<T = any>(name: string): Promise<T>;
    /**
     * 卸载扩展模块
     */
    unloadModule(name: string): Promise<void>;
    /**
     * 检查模块是否已加载
     */
    isModuleLoaded(name: string): boolean;
    /**
     * 获取已加载的模块列表
     */
    getLoadedModules(): string[];
    /**
     * 销毁检测器，清理资源
     */
    destroy(): Promise<void>;
    /**
     * 检测设备信息
     */
    private detectDevice;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 移除事件监听器
     */
    private removeEventListeners;
}

/**
 * 模块加载器实现
 */
declare class ModuleLoader implements ModuleLoader$1 {
    private modules;
    private loadingPromises;
    /**
     * 加载模块
     */
    load<T = any>(name: string): Promise<T>;
    /**
     * 卸载模块
     */
    unload(name: string): Promise<void>;
    /**
     * 检查模块是否已加载
     */
    isLoaded(name: string): boolean;
    /**
     * 获取已加载的模块
     */
    getModule(name: string): DeviceModule | undefined;
    /**
     * 获取所有已加载的模块名称
     */
    getLoadedModules(): string[];
    /**
     * 卸载所有模块
     */
    unloadAll(): Promise<void>;
    /**
     * 实际加载模块的方法
     */
    private loadModule;
    /**
     * 加载网络信息模块
     */
    private loadNetworkModule;
    /**
     * 加载电池信息模块
     */
    private loadBatteryModule;
    /**
     * 加载地理位置模块
     */
    private loadGeolocationModule;
}

/**
 * 网络信息模块
 */
declare class NetworkModule implements DeviceModule {
    name: string;
    private networkInfo;
    private connection;
    private onlineHandler?;
    private offlineHandler?;
    private changeHandler?;
    constructor();
    /**
     * 初始化模块
     */
    init(): Promise<void>;
    /**
     * 销毁模块
     */
    destroy(): Promise<void>;
    /**
     * 获取网络信息
     */
    getData(): NetworkInfo;
    /**
     * 获取网络连接状态
     */
    getStatus(): NetworkStatus;
    /**
     * 获取网络连接类型
     */
    getConnectionType(): NetworkType;
    /**
     * 获取下载速度（Mbps）
     */
    getDownlink(): number | undefined;
    /**
     * 获取往返时间（毫秒）
     */
    getRTT(): number | undefined;
    /**
     * 是否为计量连接
     */
    isSaveData(): boolean | undefined;
    /**
     * 检查是否在线
     */
    isOnline(): boolean;
    /**
     * 检查是否离线
     */
    isOffline(): boolean;
    /**
     * 检测网络信息
     */
    private detectNetworkInfo;
    /**
     * 解析连接类型
     */
    private parseConnectionType;
    /**
     * 更新网络信息
     */
    private updateNetworkInfo;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 移除事件监听器
     */
    private removeEventListeners;
}

/**
 * 电池信息模块
 */
declare class BatteryModule implements DeviceModule {
    name: string;
    private batteryInfo;
    private battery;
    private eventHandlers;
    constructor();
    /**
     * 初始化模块
     */
    init(): Promise<void>;
    /**
     * 销毁模块
     */
    destroy(): Promise<void>;
    /**
     * 获取电池信息
     */
    getData(): BatteryInfo;
    /**
     * 获取电池电量（0-1）
     */
    getLevel(): number;
    /**
     * 获取电池电量百分比（0-100）
     */
    getLevelPercentage(): number;
    /**
     * 检查是否正在充电
     */
    isCharging(): boolean;
    /**
     * 获取充电时间（秒）
     */
    getChargingTime(): number;
    /**
     * 获取放电时间（秒）
     */
    getDischargingTime(): number;
    /**
     * 获取充电时间（格式化）
     */
    getChargingTimeFormatted(): string;
    /**
     * 获取放电时间（格式化）
     */
    getDischargingTimeFormatted(): string;
    /**
     * 检查电池是否电量低
     */
    isLowBattery(threshold?: number): boolean;
    /**
     * 检查电池是否电量充足
     */
    isHighBattery(threshold?: number): boolean;
    /**
     * 获取电池状态描述
     */
    getBatteryStatus(): string;
    /**
     * 获取默认电池信息
     */
    private getDefaultBatteryInfo;
    /**
     * 更新电池信息
     */
    private updateBatteryInfo;
    /**
     * 格式化时间
     */
    private formatTime;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 移除事件监听器
     */
    private removeEventListeners;
}

/**
 * 地理位置模块
 */
declare class GeolocationModule implements DeviceModule {
    name: string;
    private geolocationInfo;
    private watchId;
    private options;
    constructor(options?: PositionOptions);
    /**
     * 初始化模块
     */
    init(): Promise<void>;
    /**
     * 销毁模块
     */
    destroy(): Promise<void>;
    /**
     * 获取地理位置信息
     */
    getData(): GeolocationInfo | null;
    /**
     * 检查是否支持地理位置 API
     */
    isSupported(): boolean;
    /**
     * 获取当前位置
     */
    getCurrentPosition(): Promise<GeolocationInfo>;
    /**
     * 开始监听位置变化
     */
    startWatching(callback?: (position: GeolocationInfo) => void): void;
    /**
     * 停止监听位置变化
     */
    stopWatching(): void;
    /**
     * 获取纬度
     */
    getLatitude(): number | null;
    /**
     * 获取经度
     */
    getLongitude(): number | null;
    /**
     * 获取精度（米）
     */
    getAccuracy(): number | null;
    /**
     * 获取海拔（米）
     */
    getAltitude(): number | null;
    /**
     * 获取海拔精度（米）
     */
    getAltitudeAccuracy(): number | null;
    /**
     * 获取方向（度）
     */
    getHeading(): number | null;
    /**
     * 获取速度（米/秒）
     */
    getSpeed(): number | null;
    /**
     * 计算两点之间的距离（米）
     */
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
    /**
     * 计算与当前位置的距离
     */
    getDistanceFromCurrent(latitude: number, longitude: number): number | null;
    /**
     * 解析位置信息
     */
    private parsePosition;
    /**
     * 解析地理位置错误
     */
    private parseGeolocationError;
}

/**
 * 防抖函数
 */
declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
declare function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 检测是否为移动设备
 */
declare function isMobileDevice(): boolean;
/**
 * 检测是否为触摸设备
 */
declare function isTouchDevice(): boolean;
/**
 * 根据屏幕宽度判断设备类型
 */
declare function getDeviceTypeByWidth(width: number, breakpoints?: {
    mobile: number;
    tablet: number;
}): DeviceType;
/**
 * 获取屏幕方向
 */
declare function getScreenOrientation(): Orientation;
/**
 * 解析用户代理字符串获取操作系统信息
 */
declare function parseOS(userAgent: string): {
    name: string;
    version: string;
};
/**
 * 解析用户代理字符串获取浏览器信息
 */
declare function parseBrowser(userAgent: string): {
    name: string;
    version: string;
};
/**
 * 获取设备像素比
 */
declare function getPixelRatio(): number;
/**
 * 检查是否支持某个 API
 */
declare function isAPISupported(api: string): boolean;
/**
 * 安全地访问 navigator API
 */
declare function safeNavigatorAccess<T>(accessor: (navigator: Navigator) => T, fallback: T): T;
/**
 * 格式化字节大小
 */
declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 生成唯一 ID
 */
declare function generateId(): string;

export { BatteryModule, DeviceDetector, EventEmitter, GeolocationModule, ModuleLoader, NetworkModule, debounce, DeviceDetector as default, formatBytes, generateId, getDeviceTypeByWidth, getPixelRatio, getScreenOrientation, isAPISupported, isMobileDevice, isTouchDevice, parseBrowser, parseOS, safeNavigatorAccess, throttle };
export type { BatteryInfo, DeviceDetectorEvents, DeviceDetectorOptions, DeviceInfo, DeviceModule, DeviceType, EventListener, GeolocationInfo, ModuleLoader$1 as IModuleLoader, NetworkInfo, NetworkStatus, NetworkType, Orientation };
