import { I18nOptions, I18nInstance } from '../core/types.d.js';

/**
 * i18n Engine 插件选项
 */
interface I18nEnginePluginOptions extends I18nOptions {
    /** 插件名称 */
    name?: string;
    /** 插件版本 */
    version?: string;
    /** 是否启用全局注入 */
    globalInjection?: boolean;
    /** 全局属性名称 */
    globalPropertyName?: string;
    /** 自定义 i18n 创建函数 */
    createI18n?: (options?: I18nOptions) => Promise<I18nInstance>;
}

export type { I18nEnginePluginOptions };
