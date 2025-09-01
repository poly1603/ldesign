import type { DeviceModule, GeolocationInfo } from '../types';
/**
 * 地理位置模块
 */
export declare class GeolocationModule implements DeviceModule {
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
    getCurrentPosition(options?: PositionOptions): Promise<GeolocationInfo>;
    /**
     * 开始监听位置变化
     */
    startWatching(callback?: (position: GeolocationInfo) => void): void;
    /**
     * 停止监听位置变化
     */
    stopWatching(): void;
    /**
     * 监听位置变化（别名方法，用于测试兼容性）
     */
    watchPosition(callback: (position: GeolocationInfo) => void): number | null;
    /**
     * 清除位置监听（别名方法，用于测试兼容性）
     */
    clearWatch(watchId: number): void;
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
//# sourceMappingURL=GeolocationModule.d.ts.map