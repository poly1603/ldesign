/**
 * Size Vue 插件
 */
import type { Plugin } from 'vue';
import type { SizeManager } from '../../types';
/**
 * Size 插件选项
 */
export interface SizePluginOptions {
    /** 尺寸管理器实例 */
    sizeManager?: SizeManager;
    /** 是否注册全局属性 */
    globalProperties?: boolean;
    /** 全局属性名称 */
    globalPropertyName?: string;
}
/**
 * Size Vue 插件符号
 */
export declare const SizeSymbol: unique symbol;
/**
 * Size Vue 插件
 */
export declare const SizePlugin: Plugin;
/**
 * 创建 Size Vue 插件
 */
export declare function createSizePlugin(options?: SizePluginOptions): Plugin;
/**
 * 默认导出插件
 */
export default SizePlugin;
declare module 'vue' {
    interface ComponentCustomProperties {
        $size: SizeManager;
        $setSize: (mode: string) => void;
        $getSizeMode: () => string;
        $getSizeConfig: (mode?: string) => any;
    }
}
//# sourceMappingURL=plugin.d.ts.map