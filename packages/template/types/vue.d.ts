import * as vue from 'vue';
import { Component, DefineComponent, Ref, Directive, Plugin } from 'vue';

/**
 * 设备类型
 */
type DeviceType = 'desktop' | 'mobile' | 'tablet';
/**
 * 模板配置接口
 */
interface TemplateConfig {
    /** 模板名称 */
    name: string;
    /** 显示标题 */
    title: string;
    /** 模板描述 */
    description: string;
    /** 版本号 */
    version: string;
    /** 作者 */
    author?: string;
    /** 预览图路径 */
    preview?: string;
    /** 标签 */
    tags?: string[];
    /** 是否响应式 */
    responsive?: boolean;
    /** 最小宽度 */
    minWidth?: number;
    /** 最大宽度 */
    maxWidth?: number;
    /** 创建时间 */
    createdAt?: string;
    /** 更新时间 */
    updatedAt?: string;
}
/**
 * 模板元数据
 */
interface TemplateMetadata {
    /** 模板分类 */
    category: string;
    /** 设备类型 */
    device: DeviceType;
    /** 模板名称 */
    template: string;
    /** 模板配置 */
    config: TemplateConfig;
    /** 模板组件路径 */
    componentPath: string;
    /** 样式文件路径 */
    stylePath?: string;
}
/**
 * 模板组件
 */
interface TemplateComponent {
    /** Vue 组件 */
    component: Component | DefineComponent;
    /** 模板元数据 */
    metadata: TemplateMetadata;
    /** 是否已加载 */
    loaded: boolean;
    /** 加载时间 */
    loadedAt?: number;
}
/**
 * 模板渲染选项
 */
interface TemplateRenderOptions {
    /** 模板分类 */
    category: string;
    /** 设备类型 */
    device?: DeviceType;
    /** 模板名称 */
    template: string;
    /** 传递给模板的属性 */
    props?: Record<string, any>;
    /** 是否启用缓存 */
    cache?: boolean;
    /** 加载超时时间（毫秒） */
    timeout?: number;
}
/**
 * 设备检测配置
 */
interface DeviceDetectionConfig {
    /** 移动端断点 */
    mobileBreakpoint: number;
    /** 平板端断点 */
    tabletBreakpoint: number;
    /** 桌面端断点 */
    desktopBreakpoint: number;
    /** 自定义检测函数 */
    customDetector?: () => DeviceType;
}
/**
 * 模板管理器配置
 */
interface TemplateManagerConfig {
    /** 模板根目录 */
    templateRoot?: string;
    /** 设备检测配置 */
    deviceDetection?: DeviceDetectionConfig;
    /** 是否启用缓存 */
    enableCache?: boolean;
    /** 缓存大小限制 */
    cacheLimit?: number;
    /** 是否启用预加载 */
    enablePreload?: boolean;
    /** 预加载模板列表 */
    preloadTemplates?: string[];
    /** 默认设备类型 */
    defaultDevice?: DeviceType;
}
/**
 * 模板切换事件
 */
interface TemplateChangeEvent {
    /** 之前的模板 */
    from?: TemplateMetadata;
    /** 当前模板 */
    to: TemplateMetadata;
    /** 切换时间 */
    timestamp: number;
}
/**
 * 模板加载状态
 */
declare enum TemplateLoadingState {
    IDLE = "idle",
    LOADING = "loading",
    LOADED = "loaded",
    ERROR = "error"
}
/**
 * 模板加载结果
 */
interface TemplateLoadResult {
    /** 加载状态 */
    state: TemplateLoadingState;
    /** 模板组件 */
    component?: TemplateComponent;
    /** 错误信息 */
    error?: Error;
    /** 加载耗时 */
    duration?: number;
}
/**
 * 模板扫描结果
 */
interface TemplateScanResult {
    /** 扫描到的模板列表 */
    templates: TemplateMetadata[];
    /** 扫描耗时 */
    duration: number;
    /** 扫描的目录数量 */
    scannedDirectories: number;
    /** 错误列表 */
    errors: Error[];
}
/**
 * 模板指令绑定值
 */
interface TemplateDirectiveBinding {
    /** 模板分类 */
    category: string;
    /** 设备类型 */
    device?: DeviceType;
    /** 模板名称 */
    template: string;
    /** 传递给模板的属性 */
    props?: Record<string, any>;
}

/**
 * 事件发射器
 */
declare class EventEmitter<T extends Record<string, any>> {
    private listeners;
    on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void;
    off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
    emit<K extends keyof T>(event: K, data: T[K]): void;
    removeAllListeners(): void;
}
/**
 * 模板管理器
 */
declare class TemplateManager extends EventEmitter<{
    'template:change': TemplateChangeEvent;
    'template:load': TemplateLoadResult;
    'template:error': Error;
    'device:change': DeviceType;
}> {
    private config;
    private scanner;
    private cache;
    private currentTemplate?;
    private currentDevice;
    private deviceWatcherCleanup?;
    private loadingPromises;
    constructor(config?: TemplateManagerConfig);
    /**
     * 初始化设备监听器
     */
    private initializeDeviceWatcher;
    /**
     * 自动切换设备模板
     */
    private autoSwitchDeviceTemplate;
    /**
     * 扫描模板
     */
    scanTemplates(): Promise<TemplateScanResult>;
    /**
     * 预加载模板
     */
    private preloadTemplates;
    /**
     * 生成缓存键
     */
    private getCacheKey;
    /**
     * 加载模板组件
     */
    private loadTemplate;
    /**
     * 执行模板加载
     */
    private performTemplateLoad;
    /**
     * 渲染模板
     */
    render(options: TemplateRenderOptions): Promise<Component>;
    /**
     * 切换模板
     */
    switch(category: string, device: DeviceType, template: string): Promise<void>;
    /**
     * 获取可用模板列表
     */
    getAvailableTemplates(category?: string, device?: DeviceType): Promise<TemplateMetadata[]>;
    /**
     * 获取当前模板信息
     */
    getCurrentTemplate(): TemplateMetadata | undefined;
    /**
     * 检测当前设备类型
     */
    detectDevice(): DeviceType;
    /**
     * 获取当前设备类型
     */
    getCurrentDevice(): DeviceType;
    /**
     * 获取可用的分类列表
     */
    getAvailableCategories(): Promise<string[]>;
    /**
     * 获取指定分类下的可用设备类型
     */
    getAvailableDevices(category?: string): Promise<DeviceType[]>;
    /**
     * 检查模板是否存在
     */
    hasTemplate(category: string, device: DeviceType, template: string): Promise<boolean>;
    /**
     * 获取模板元数据
     */
    getTemplateMetadata(category: string, device: DeviceType, template: string): Promise<TemplateMetadata | undefined>;
    /**
     * 清空缓存
     */
    clearCache(): void;
    /**
     * 获取缓存统计信息
     */
    getCacheStats(): {
        hits: number;
        misses: number;
        components: {
            size: number;
            maxSize: number;
            totalAccess: number;
            averageAge: number;
            expiredCount: number;
        };
        metadata: {
            size: number;
            maxSize: number;
            totalAccess: number;
            averageAge: number;
            expiredCount: number;
        };
        preloadQueue: number;
    };
    /**
     * 清理过期缓存
     */
    cleanupCache(): {
        components: number;
        metadata: number;
    };
    /**
     * 销毁管理器
     */
    destroy(): void;
    /**
     * 获取管理器配置
     */
    getConfig(): Readonly<Required<TemplateManagerConfig>>;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<TemplateManagerConfig>): void;
}

/**
 * 模板 Composable 选项
 */
interface UseTemplateOptions$1 extends TemplateManagerConfig {
    /** 是否自动扫描模板 */
    autoScan?: boolean;
    /** 是否自动检测设备变化 */
    autoDetectDevice?: boolean;
    /** 初始模板配置 */
    initialTemplate?: {
        category: string;
        device?: DeviceType;
        template: string;
    };
}
/**
 * 模板 Composable 返回值
 */
interface UseTemplateReturn$1 {
    /** 模板管理器实例 */
    manager: TemplateManager;
    /** 当前模板 */
    currentTemplate: Ref<TemplateMetadata | undefined>;
    /** 当前设备类型 */
    currentDevice: Ref<DeviceType>;
    /** 加载状态 */
    loading: Ref<boolean>;
    /** 错误信息 */
    error: Ref<Error | null>;
    /** 可用模板列表 */
    availableTemplates: Ref<TemplateMetadata[]>;
    /** 可用分类列表 */
    availableCategories: Ref<string[]>;
    /** 可用设备类型列表 */
    availableDevices: Ref<DeviceType[]>;
    /** 扫描模板 */
    scanTemplates: () => Promise<void>;
    /** 渲染模板 */
    render: (options: TemplateRenderOptions) => Promise<Component>;
    /** 切换模板 */
    switchTemplate: (category: string, device: DeviceType, template: string) => Promise<void>;
    /** 获取模板列表 */
    getTemplates: (category?: string, device?: DeviceType) => Promise<TemplateMetadata[]>;
    /** 检查模板是否存在 */
    hasTemplate: (category: string, device: DeviceType, template: string) => Promise<boolean>;
    /** 清空缓存 */
    clearCache: () => void;
    /** 刷新模板列表 */
    refresh: () => Promise<void>;
}
/**
 * 模板管理 Composable
 */
declare function useTemplate(options?: UseTemplateOptions$1): UseTemplateReturn$1;
/**
 * 创建独立的模板管理器实例
 */
declare function createTemplateManager(config?: TemplateManagerConfig): TemplateManager;

/**
 * 模板渲染器组件
 */
declare const TemplateRenderer: any;

/**
 * 指令绑定的元素数据
 */
interface TemplateDirectiveElement extends HTMLElement {
    __templateDirective?: {
        manager: ReturnType<typeof createTemplateManager>;
        currentTemplate?: string;
        cleanup?: () => void;
    };
}
/**
 * 模板指令实现
 */
declare const templateDirective: Directive<TemplateDirectiveElement, any>;
/**
 * 注册模板指令
 */
declare function registerTemplateDirective(app: any): void;

/**
 * 模板插件
 */
declare const TemplatePlugin: Plugin;
/**
 * 获取全局模板管理器
 */
declare function getGlobalTemplateManager(): TemplateManager | null;

interface TemplateRendererProps {
    category: string;
    device?: DeviceType;
    template: string;
    templateProps?: Record<string, any>;
    cache?: boolean;
    preload?: boolean;
}
interface UseTemplateOptions extends TemplateManagerConfig {
    autoScan?: boolean;
    autoDetectDevice?: boolean;
    initialTemplate?: {
        category: string;
        device?: DeviceType;
        template: string;
    };
}
interface UseTemplateReturn {
    currentTemplate: vue.Ref<vue.Component | null>;
    loading: vue.Ref<boolean>;
    error: vue.Ref<Error | null>;
    render: (options: TemplateRenderOptions) => Promise<void>;
    preload: (templates: Array<{
        category: string;
        device?: DeviceType;
        template: string;
    }>) => Promise<void>;
    clearCache: (category?: string, device?: DeviceType, template?: string) => void;
}
interface TemplatePluginOptions extends TemplateManagerConfig {
    componentPrefix?: string;
    registerComponents?: boolean;
    registerDirectives?: boolean;
    provideGlobalProperties?: boolean;
}

export { TemplatePlugin, TemplateRenderer, TemplatePlugin as default, getGlobalTemplateManager, registerTemplateDirective, templateDirective, useTemplate };
export type { TemplateDirectiveBinding, TemplatePluginOptions, TemplateRendererProps, UseTemplateOptions, UseTemplateReturn };
