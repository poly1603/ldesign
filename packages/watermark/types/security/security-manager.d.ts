import { SecurityWatcher, SecurityCallback, SecurityViolationType, SecurityViolation, SecurityManagerState } from '../types/security.js';
import { WatermarkInstance } from '../types/instance.js';

/**
 * 安全管理器
 */

/**
 * 安全管理器
 * 负责水印的安全保护，防止被删除、修改或绕过
 */
declare class SecurityManager {
    private watchers;
    private violations;
    private callbacks;
    private state;
    private intervals;
    private observers;
    private initialized;
    /**
     * 初始化安全管理器
     */
    init(): Promise<void>;
    /**
     * 为实例启用保护
     */
    enableProtection(instance: WatermarkInstance): Promise<void>;
    /**
     * 禁用实例保护
     */
    disableProtection(instance: WatermarkInstance): Promise<void>;
    /**
     * 更新实例保护
     */
    updateProtection(instance: WatermarkInstance): Promise<void>;
    /**
     * 添加监听器
     */
    addWatcher(instanceId: string, config: Omit<SecurityWatcher, 'id' | 'instanceId' | 'active'>): Promise<string>;
    /**
     * 移除监听器
     */
    removeWatcher(watcherId: string): Promise<boolean>;
    /**
     * 添加违规回调
     */
    addCallback(instanceId: string, callback: SecurityCallback): void;
    /**
     * 移除违规回调
     */
    removeCallback(instanceId: string, callback: SecurityCallback): boolean;
    /**
     * 报告违规
     */
    reportViolation(instanceId: string, type: SecurityViolationType, details?: Record<string, any>): Promise<void>;
    /**
     * 获取违规记录
     */
    getViolations(instanceId?: string): SecurityViolation[];
    /**
     * 清空违规记录
     */
    clearViolations(instanceId?: string): void;
    /**
     * 获取状态
     */
    getState(): SecurityManagerState;
    /**
     * 销毁安全管理器
     */
    dispose(): Promise<void>;
    private enableLowLevelProtection;
    private enableMediumLevelProtection;
    private enableHighLevelProtection;
    private startWatcher;
    private stopWatcher;
    private startDOMMutationWatcher;
    private startStyleChangeWatcher;
    private startConsoleAccessWatcher;
    private startDevToolsDetectionWatcher;
    private startNetworkMonitoringWatcher;
    private startPerformanceMonitoringWatcher;
    private setupGlobalProtection;
    private enableObfuscationProtection;
    private isWatermarkElement;
    private findWatermarkElements;
    private hasStyleViolation;
    private getViolationSeverity;
    private updateState;
    private generateRandomString;
    private obfuscateClassName;
}

export { SecurityManager };
