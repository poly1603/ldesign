import { Plugin } from 'vue';
import { SizeManager } from '../../types/index.js';

/**
 * Size Vue 插件
 */

/**
 * Size 插件选项
 */
interface SizePluginOptions {
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
declare const SizeSymbol: unique symbol;
/**
 * Size Vue 插件
 */
declare const SizePlugin: Plugin;
/**
 * 创建 Size Vue 插件
 */
declare function createSizePlugin(options?: SizePluginOptions): Plugin;

declare module 'vue' {
    interface ComponentCustomProperties {
        $size: SizeManager;
        $setSize: (mode: string) => void;
        $getSizeMode: () => string;
        $getSizeConfig: (mode?: string) => any;
    }
}

export { SizePlugin, SizeSymbol, createSizePlugin, SizePlugin as default };
export type { SizePluginOptions };
