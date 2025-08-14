/**
 * 简化的类型定义
 */
/**
 * 应用配置接口
 */
interface AppConfig {
    name: string;
    version: string;
    debug: boolean;
}
/**
 * 用户信息接口
 */
interface UserInfo {
    username: string;
    loginTime: string;
    device: string;
}

export type { AppConfig, UserInfo };
