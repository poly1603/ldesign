/**
 * 安全相关类型定义
 */
type SecurityLevel = 'none' | 'basic' | 'advanced';
type SecurityViolationType = 'dom_removal' | 'style_modification' | 'visibility_hidden' | 'opacity_changed' | 'position_changed' | 'size_changed' | 'canvas_tampering' | 'unknown';
interface SecurityViolation {
    /** 违规类型 */
    type: SecurityViolationType;
    /** 目标元素 */
    target: HTMLElement | null;
    /** 发生时间 */
    timestamp: number;
    /** 详细信息 */
    details: {
        /** 原始值 */
        originalValue?: any;
        /** 当前值 */
        currentValue?: any;
        /** 变更记录 */
        mutation?: MutationRecord;
        /** 额外信息 */
        extra?: Record<string, any>;
    };
    /** 违规严重程度 */
    severity: 'low' | 'medium' | 'high';
    /** 是否已处理 */
    handled: boolean;
}
type SecurityCallback = (violation: SecurityViolation) => void | Promise<void>;
type SecurityWatcherType = 'mutation' | 'style' | 'visibility' | 'resize' | 'canvas';
interface SecurityWatcher {
    /** 监听器类型 */
    type: SecurityWatcherType;
    /** 监听器实例 */
    observer: MutationObserver | ResizeObserver | IntersectionObserver | any;
    /** 回调函数 */
    callback: SecurityCallback;
    /** 是否激活 */
    isActive: boolean;
    /** 监听选项 */
    options?: Record<string, any>;
    /** 清理函数 */
    cleanup?: () => void;
}
interface SecurityConfig {
    /** 安全级别 */
    level: SecurityLevel;
    /** 违规回调 */
    onViolation?: SecurityCallback;
    /** 是否启用DOM变化监听 */
    mutationObserver?: boolean;
    /** 是否启用样式保护 */
    styleProtection?: boolean;
    /** 是否启用Canvas保护 */
    canvasProtection?: boolean;
    /** 是否启用DOM混淆 */
    obfuscation?: boolean;
    /** 是否启用可见性监听 */
    visibilityObserver?: boolean;
    /** 是否启用尺寸监听 */
    resizeObserver?: boolean;
    /** 自动恢复延迟(毫秒) */
    recoveryDelay?: number;
    /** 最大恢复次数 */
    maxRecoveryAttempts?: number;
    /** 是否记录违规历史 */
    logViolations?: boolean;
    /** 是否上报违规信息 */
    reportViolations?: boolean;
    /** 上报接口地址 */
    reportUrl?: string;
    /** 自定义保护规则 */
    customRules?: SecurityRule[];
}
interface SecurityRule {
    /** 规则名称 */
    name: string;
    /** 规则描述 */
    description?: string;
    /** 检查函数 */
    check: (element: HTMLElement, instance: any) => boolean;
    /** 恢复函数 */
    recover?: (element: HTMLElement, instance: any) => void;
    /** 违规回调 */
    onViolation?: SecurityCallback;
    /** 是否启用 */
    enabled?: boolean;
}
interface SecurityManagerState {
    /** 是否已初始化 */
    initialized: boolean;
    /** 当前安全级别 */
    currentLevel: SecurityLevel;
    /** 活跃的监听器 */
    activeWatchers: Map<string, SecurityWatcher>;
    /** 违规历史 */
    violationHistory: SecurityViolation[];
    /** 恢复次数统计 */
    recoveryCount: Map<string, number>;
    /** 是否正在恢复中 */
    isRecovering: boolean;
}
interface ObfuscationConfig {
    /** 是否随机化类名 */
    randomizeClassName?: boolean;
    /** 是否随机化ID */
    randomizeId?: boolean;
    /** 是否添加干扰元素 */
    addDecoyElements?: boolean;
    /** 干扰元素数量 */
    decoyCount?: number;
    /** 是否使用随机样式 */
    randomizeStyles?: boolean;
    /** 混淆强度 */
    intensity?: 'low' | 'medium' | 'high';
}
interface CanvasProtectionConfig {
    /** 是否启用Canvas绘制 */
    enabled?: boolean;
    /** Canvas层级 */
    zIndex?: number;
    /** 是否使用离屏Canvas */
    useOffscreenCanvas?: boolean;
    /** 绘制质量 */
    quality?: 'low' | 'medium' | 'high';
    /** 是否启用Canvas指纹 */
    enableFingerprint?: boolean;
}
declare const DEFAULT_SECURITY_CONFIG: Required<Omit<SecurityConfig, 'onViolation' | 'reportUrl' | 'customRules'>>;

export { DEFAULT_SECURITY_CONFIG };
export type { CanvasProtectionConfig, ObfuscationConfig, SecurityCallback, SecurityConfig, SecurityLevel, SecurityManagerState, SecurityRule, SecurityViolation, SecurityViolationType, SecurityWatcher, SecurityWatcherType };
