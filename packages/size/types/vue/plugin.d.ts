import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { SizeManager, VueSizePluginOptions } from '../types/index.js';
import { Plugin } from '../node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.js';

/**
 * Vue 插件
 */

/**
 * Vue Size 插件符号
 */
declare const VueSizeSymbol: unique symbol;
/**
 * Vue Size 插件
 */
declare const VueSizePlugin: Plugin;
/**
 * 创建 Vue Size 插件
 */
declare function createVueSizePlugin(options?: VueSizePluginOptions): Plugin;

declare module 'vue' {
    interface ComponentCustomProperties {
        $size: SizeManager;
        $setSize: (mode: string) => void;
        $getSizeMode: () => string;
        $getSizeConfig: (mode?: string) => any;
    }
}

export { VueSizePlugin, VueSizeSymbol, createVueSizePlugin, VueSizePlugin as default };
