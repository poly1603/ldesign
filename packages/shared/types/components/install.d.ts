/**
 * 组件安装函数
 * 用于在 Vue 应用中全局注册组件
 */
import type { App } from 'vue';
export interface ComponentInstallOptions {
    /** 组件名称前缀 */
    prefix?: string;
    /** 要安装的组件列表，如果不指定则安装所有组件 */
    components?: ('select' | 'popup' | 'dialog')[];
}
/**
 * 安装所有组件
 */
export declare function installComponents(app: App, options?: ComponentInstallOptions): void;
/**
 * 创建组件安装插件
 */
export declare function createComponentPlugin(options?: ComponentInstallOptions): {
    install(app: App): void;
};
declare const _default: {
    install: typeof installComponents;
};
export default _default;
//# sourceMappingURL=install.d.ts.map