import { WatermarkConfig } from '../types/config.js';
import { CreateInstanceOptions, WatermarkInstance, UpdateInstanceOptions } from '../types/instance.js';
import { SecurityLevel } from '../types/security.js';
import { WatermarkEvent, WatermarkEventType, EventListener } from '../types/events.js';

/**
 * 水印系统核心类
 */

/**
 * 水印系统核心类
 * 提供水印的创建、更新、销毁等核心功能
 */
declare class WatermarkCore {
    private configManager;
    private instanceManager;
    private eventManager;
    private errorManager;
    private rendererFactory;
    private securityManager;
    private responsiveManager;
    private animationEngine;
    private initialized;
    constructor();
    /**
     * 初始化核心系统
     */
    private init;
    /**
     * 创建水印实例
     */
    create(config: WatermarkConfig, options?: CreateInstanceOptions): Promise<WatermarkInstance>;
    /**
     * 更新水印实例
     */
    update(instanceId: string, config: Partial<WatermarkConfig>, options?: UpdateInstanceOptions): Promise<void>;
    /**
     * 销毁水印实例
     */
    destroy(instanceId: string): Promise<void>;
    /**
     * 获取实例
     */
    getInstance(instanceId: string): WatermarkInstance | undefined;
    /**
     * 获取所有实例
     */
    getAllInstances(): WatermarkInstance[];
    /**
     * 暂停实例
     */
    pause(instanceId: string): Promise<void>;
    /**
     * 恢复实例
     */
    resume(instanceId: string): Promise<void>;
    /**
     * 显示实例
     */
    show(instanceId: string): void;
    /**
     * 隐藏实例
     */
    hide(instanceId: string): void;
    /**
     * 启用安全保护
     */
    enableSecurity(instanceId: string, level: SecurityLevel): Promise<void>;
    /**
     * 添加事件监听器
     */
    on<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void;
    /**
     * 移除事件监听器
     */
    off<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void;
    /**
     * 销毁核心系统
     */
    dispose(): Promise<void>;
    private ensureInitialized;
    private resolveContainer;
    private renderInstance;
    private setupAnimations;
    private stopAnimations;
    private pauseAnimations;
    private resumeAnimations;
    private updateSecurity;
    private updateResponsive;
    private setupErrorHandling;
    private setupEventListeners;
}

export { WatermarkCore };
