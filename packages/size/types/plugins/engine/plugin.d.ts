/**
 * Size Engine 插件
 */
import type { SizeEnginePluginOptions } from './types';
import { SizeManagerImpl } from '../../core/size-manager';
/**
 * 创建尺寸管理器实例
 */
declare function createSizeManagerInstance(options?: SizeEnginePluginOptions): Promise<SizeManagerImpl>;
/**
 * Engine 插件接口
 */
interface Plugin {
    name: string;
    version: string;
    dependencies?: string[];
    install: (context: any) => Promise<void>;
    uninstall?: (context: any) => Promise<void>;
}
/**
 * Engine 插件上下文
 */
export interface EnginePluginContext {
    engine: any;
    logger: any;
    config: any;
}
/**
 * 创建 Size Engine 插件
 * @param options 插件配置选项
 * @returns Engine 插件
 */
export declare function createSizeEnginePlugin(options?: SizeEnginePluginOptions): Plugin;
export { createSizeManagerInstance };
export { createSizeEnginePlugin as default };
//# sourceMappingURL=plugin.d.ts.map