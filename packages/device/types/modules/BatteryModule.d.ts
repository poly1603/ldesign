import type { BatteryInfo, DeviceModule } from '../types';
export declare class BatteryModule implements DeviceModule {
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
//# sourceMappingURL=BatteryModule.d.ts.map