import type { Ref } from 'vue';
import type { DeviceDetector } from '../core/DeviceDetector';
/**
 * 设备类型枚举
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile';
/**
 * 屏幕方向枚举
 */
export type Orientation = 'portrait' | 'landscape';
/**
 * 网络连接类型
 */
export type NetworkType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'unknown';
/**
 * 网络连接状态
 */
export type NetworkStatus = 'online' | 'offline';
/**
 * 设备检测器配置选项
 */
export interface DeviceDetectorOptions {
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
export interface DeviceInfo {
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
export interface NetworkInfo {
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
    /** 是否在线（兼容性属性） */
    online?: boolean;
    /** 有效连接类型（兼容性属性） */
    effectiveType?: string;
}
/**
 * 电池信息接口
 */
export interface BatteryInfo {
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
export interface GeolocationInfo {
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
export type EventListener<T = any> = (data: T) => void;
/**
 * 设备检测器事件映射
 */
export interface DeviceDetectorEvents extends Record<string, unknown> {
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
export interface ModuleLoader {
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
export interface DeviceModule {
    /** 模块名称 */
    name: string;
    /** 初始化模块 */
    init: () => Promise<void> | void;
    /** 销毁模块 */
    destroy: () => Promise<void> | void;
    /** 获取模块数据 */
    getData: () => unknown;
}
/**
 * 网络模块接口
 */
export interface NetworkModule extends DeviceModule {
    getData: () => NetworkInfo;
    isOnline: () => boolean;
    getConnectionType: () => string;
}
/**
 * 电池模块接口
 */
export interface BatteryModule extends DeviceModule {
    getData: () => BatteryInfo;
    getLevel: () => number;
    isCharging: () => boolean;
    getBatteryStatus: () => string;
}
/**
 * 地理位置模块接口
 */
export interface GeolocationModule extends DeviceModule {
    getData: () => GeolocationInfo | null;
    isSupported: () => boolean;
    getCurrentPosition: () => Promise<GeolocationInfo>;
    startWatching: (callback?: (position: GeolocationInfo) => void) => void;
    stopWatching: () => void;
}
/**
 * Vue3 集成相关类型
 */
export interface UseDeviceReturn {
    /** 设备类型 */
    deviceType: Readonly<Ref<DeviceType>>;
    /** 屏幕方向 */
    orientation: Readonly<Ref<Orientation>>;
    /** 设备信息 */
    deviceInfo: Readonly<Ref<DeviceInfo>>;
    /** 是否为移动设备 */
    isMobile: Readonly<Ref<boolean>>;
    /** 是否为平板设备 */
    isTablet: Readonly<Ref<boolean>>;
    /** 是否为桌面设备 */
    isDesktop: Readonly<Ref<boolean>>;
    /** 是否为触摸设备 */
    isTouchDevice: Readonly<Ref<boolean>>;
    /** 刷新设备信息 */
    refresh: () => void;
}
/**
 * Vue3 指令绑定值类型
 */
export type DeviceDirectiveValue = DeviceType | DeviceType[] | {
    type: DeviceType | DeviceType[];
    inverse?: boolean;
};
/**
 * Vue3 插件选项
 */
export interface DevicePluginOptions extends DeviceDetectorOptions {
    /** 全局属性名称 */
    globalPropertyName?: string;
}
declare module 'vue' {
    interface ComponentCustomProperties {
        $device: DeviceDetector;
    }
}
export type { Ref };
/**
 * 扩展 Navigator 接口以支持 Battery API
 */
declare global {
    interface Navigator {
        getBattery?: () => Promise<{
            level: number;
            charging: boolean;
            chargingTime: number;
            dischargingTime: number;
            addEventListener: (type: string, listener: EventListener) => void;
            removeEventListener: (type: string, listener: EventListener) => void;
        }>;
    }
}
//# sourceMappingURL=index.d.ts.map