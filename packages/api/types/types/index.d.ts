import { HttpClientConfig, RequestConfig } from '../packages/http/dist/index.d.js';
export { ResponseData } from '../packages/http/dist/index.d.js';

/**
 * API 引擎配置
 */
interface ApiEngineConfig {
    /** 应用名称 */
    appName?: string;
    /** 版本号 */
    version?: string;
    /** 是否启用调试模式 */
    debug?: boolean;
    /** HTTP 客户端配置 */
    http?: HttpClientConfig;
    /** 缓存配置 */
    cache?: CacheConfig;
    /** 防抖配置 */
    debounce?: DebounceConfig;
    /** 请求去重配置 */
    deduplication?: DeduplicationConfig;
    /** 自定义配置 */
    [key: string]: any;
}
/**
 * 缓存配置
 */
interface CacheConfig {
    /** 是否启用缓存 */
    enabled?: boolean;
    /** 默认缓存时间（毫秒） */
    ttl?: number;
    /** 最大缓存条目数 */
    maxSize?: number;
    /** 缓存存储类型 */
    storage?: 'memory' | 'localStorage' | 'sessionStorage';
    /** 缓存键前缀 */
    prefix?: string;
}
/**
 * 防抖配置
 */
interface DebounceConfig {
    /** 是否启用防抖 */
    enabled?: boolean;
    /** 默认防抖延迟（毫秒） */
    delay?: number;
}
/**
 * 请求去重配置
 */
interface DeduplicationConfig {
    /** 是否启用请求去重 */
    enabled?: boolean;
    /** 去重键生成函数 */
    keyGenerator?: (config: RequestConfig) => string;
}
/**
 * API 方法定义
 */
interface ApiMethod<T = any, P = any> {
    /** 方法名称 */
    name: string;
    /** 请求配置 */
    config: RequestConfig | ((params?: P) => RequestConfig);
    /** 缓存配置 */
    cache?: Partial<CacheConfig>;
    /** 防抖配置 */
    debounce?: Partial<DebounceConfig>;
    /** 是否启用请求去重 */
    deduplication?: boolean;
    /** 数据转换函数 */
    transform?: (data: any) => T;
    /** 验证函数 */
    validate?: (data: any) => boolean;
    /** 错误处理函数 */
    onError?: (error: any) => void;
}
/**
 * API 插件接口
 */
interface ApiPlugin {
    /** 插件名称 */
    name: string;
    /** 插件版本 */
    version?: string;
    /** 依赖的插件 */
    dependencies?: string[];
    /** 插件安装函数 */
    install: (engine: ApiEngine) => void | Promise<void>;
    /** 插件卸载函数 */
    uninstall?: (engine: ApiEngine) => void | Promise<void>;
    /** 插件提供的 API 方法 */
    apis?: Record<string, ApiMethod>;
}
/**
 * API 引擎接口
 */
interface ApiEngine {
    /** 配置 */
    config: ApiEngineConfig;
    /** 使用插件 */
    use: (plugin: ApiPlugin) => Promise<void>;
    /** 注册 API 方法 */
    register: (name: string, method: ApiMethod) => void;
    /** 批量注册 API 方法 */
    registerBatch: (methods: Record<string, ApiMethod>) => void;
    /** 调用 API 方法 */
    call: <T = unknown, P extends Record<string, unknown> | undefined = Record<string, unknown>>(name: string, params?: P) => Promise<T>;
    /** 获取 API 方法 */
    getMethod: (name: string) => ApiMethod | undefined;
    /** 获取所有 API 方法 */
    getAllMethods: () => Record<string, ApiMethod>;
    /** 销毁引擎 */
    destroy: () => void;
}
/**
 * 系统 API 响应数据结构
 */
interface SystemApiResponse<T = any> {
    /** 状态码 */
    code: number;
    /** 响应消息 */
    message: string;
    /** 响应数据 */
    data: T;
    /** 时间戳 */
    timestamp?: number;
    /** 请求ID */
    requestId?: string;
}
/**
 * 用户信息
 */
interface UserInfo {
    /** 用户ID */
    id: string | number;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname?: string;
    /** 邮箱 */
    email?: string;
    /** 手机号 */
    phone?: string;
    /** 头像 */
    avatar?: string;
    /** 角色 */
    roles?: string[];
    /** 权限 */
    permissions?: string[];
    /** 扩展信息 */
    [key: string]: any;
}
/**
 * 菜单项
 */
interface MenuItem {
    /** 菜单ID */
    id: string | number;
    /** 菜单名称 */
    name: string;
    /** 菜单标题 */
    title: string;
    /** 菜单图标 */
    icon?: string;
    /** 菜单路径 */
    path?: string;
    /** 菜单组件 */
    component?: string;
    /** 父菜单ID */
    parentId?: string | number;
    /** 排序 */
    sort?: number;
    /** 是否隐藏 */
    hidden?: boolean;
    /** 子菜单 */
    children?: MenuItem[];
    /** 扩展信息 */
    [key: string]: any;
}
/**
 * 会话信息
 */
interface SessionInfo {
    /** 会话ID */
    sessionId: string;
    /** 用户ID */
    userId: string | number;
    /** 访问令牌 */
    accessToken: string;
    /** 刷新令牌 */
    refreshToken?: string;
    /** 过期时间 */
    expiresAt: number;
    /** 创建时间 */
    createdAt: number;
    /** 扩展信息 */
    [key: string]: any;
}
/**
 * 验证码信息
 */
interface CaptchaInfo {
    /** 验证码ID */
    captchaId: string;
    /** 验证码图片（base64） */
    image: string;
    /** 过期时间 */
    expiresAt: number;
}
/**
 * 登录参数
 */
interface LoginParams {
    /** 用户名 */
    username: string;
    /** 密码 */
    password: string;
    /** 验证码 */
    captcha?: string;
    /** 验证码ID */
    captchaId?: string;
    /** 记住我 */
    rememberMe?: boolean;
    /** 扩展参数 */
    [key: string]: any;
}
/**
 * 登录响应
 */
interface LoginResponse {
    /** 访问令牌 */
    accessToken: string;
    /** 刷新令牌 */
    refreshToken?: string;
    /** 过期时间 */
    expiresIn: number;
    /** 用户信息 */
    userInfo: UserInfo;
}

export { HttpClientConfig, RequestConfig };
export type { ApiEngine, ApiEngineConfig, ApiMethod, ApiPlugin, CacheConfig, CaptchaInfo, DebounceConfig, DeduplicationConfig, LoginParams, LoginResponse, MenuItem, SessionInfo, SystemApiResponse, UserInfo };
