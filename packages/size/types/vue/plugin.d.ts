/**
 * Vue 插件
 */
import type { Plugin } from 'vue';
import type { SizeManager, VueSizePluginOptions } from '../types';
/**
 * Vue Size 插件符号
 */
export declare const VueSizeSymbol: unique symbol;
/**
 * Vue Size 插件
 */
export declare const VueSizePlugin: Plugin;
/**
 * 创建 Vue Size 插件
 */
export declare function createVueSizePlugin(options?: VueSizePluginOptions): Plugin;
/**
 * 默认导出插件
 */
export default VueSizePlugin;
declare module 'vue' {
    interface ComponentCustomProperties {
        $size: SizeManager;
        $setSize: (mode: string) => void;
        $getSizeMode: () => string;
        $getSizeConfig: (mode?: string) => any;
    }
}
//# sourceMappingURL=plugin.d.ts.map