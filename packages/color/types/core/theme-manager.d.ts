import { ThemeManagerInstance, ThemeManagerOptions, ColorMode, ThemeConfig, GeneratedTheme, ThemeEventType, ThemeEventListener } from './types.js';

/**
 * 主题管理器核心类
 */

/**
 * 主题管理器实现
 */
declare class ThemeManager implements ThemeManagerInstance {
    private options;
    private currentTheme;
    private currentMode;
    private storage;
    private cache;
    private colorGenerator;
    private scaleGenerator;
    private cssInjector;
    private cssVariableGenerator;
    private idleProcessor;
    private systemThemeDetector;
    private eventEmitter;
    private isInitialized;
    private systemThemeWatcher;
    constructor(options?: ThemeManagerOptions);
    /**
     * 初始化主题管理器
     */
    init(): Promise<void>;
    /**
     * 获取当前主题名称
     */
    getCurrentTheme(): string;
    /**
     * 获取当前颜色模式
     */
    getCurrentMode(): ColorMode;
    /**
     * 设置主题
     */
    setTheme(theme: string, mode?: ColorMode): Promise<void>;
    /**
     * 设置颜色模式
     */
    setMode(mode: ColorMode): Promise<void>;
    /**
     * 切换颜色模式
     */
    toggleMode(): Promise<void>;
    /**
     * 注册主题
     */
    registerTheme(config: ThemeConfig): void;
    /**
     * 注册多个主题
     */
    registerThemes(configs: ThemeConfig[]): void;
    /**
     * 获取主题配置
     */
    getThemeConfig(name: string): ThemeConfig | undefined;
    /**
     * 获取所有主题名称
     */
    getThemeNames(): string[];
    /**
     * 获取生成的主题数据
     */
    getGeneratedTheme(name: string): GeneratedTheme | undefined;
    /**
     * 预生成主题
     */
    preGenerateTheme(name: string): Promise<void>;
    /**
     * 预生成所有主题
     */
    preGenerateAllThemes(): Promise<void>;
    /**
     * 应用主题到页面
     */
    applyTheme(name: string, mode: ColorMode): void;
    /**
     * 移除主题样式
     */
    removeTheme(): void;
    /**
     * 销毁实例
     */
    destroy(): void;
    /**
     * 创建存储实例
     */
    private createStorage;
    /**
     * 创建内存存储
     */
    private createMemoryStorage;
    /**
     * 创建缓存实例
     */
    private createCache;
    /**
     * 初始化系统主题检测器
     */
    private initSystemThemeDetector;
    /**
     * 从存储中恢复主题设置
     */
    private restoreThemeFromStorage;
    /**
     * 保存主题设置到存储
     */
    private saveThemeToStorage;
    /**
     * 应用当前主题
     */
    private applyCurrentTheme;
    /**
     * 生成主题数据
     */
    private generateThemeData;
    /**
     * 开始闲时预生成
     */
    private startIdlePreGeneration;
    /**
     * 处理错误
     */
    private handleError;
    on<T = unknown>(event: ThemeEventType, listener: ThemeEventListener<T>): void;
    off<T = unknown>(event: ThemeEventType, listener: ThemeEventListener<T>): void;
    emit<T = unknown>(event: ThemeEventType, data?: T): void;
    once<T = unknown>(event: ThemeEventType, listener: ThemeEventListener<T>): void;
    removeAllListeners(event?: ThemeEventType): void;
    listenerCount(event: ThemeEventType): number;
    eventNames(): ThemeEventType[];
}

export { ThemeManager };
