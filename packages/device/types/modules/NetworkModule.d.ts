import type { DeviceModule, NetworkInfo, NetworkStatus, NetworkType } from '../types';
import { EventEmitter } from '../core/EventEmitter';
/**
 * 网络信息模块
 */
export declare class NetworkModule extends EventEmitter<{
    networkChange: NetworkInfo;
}> implements DeviceModule {
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
     * 获取网络信息（别名方法，用于测试兼容性）
     */
    getNetworkInfo(): NetworkInfo;
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
//# sourceMappingURL=NetworkModule.d.ts.map