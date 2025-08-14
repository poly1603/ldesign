import { I18nOptions, I18nInstance } from '../packages/i18n/types/core/types.d.js';
import { I18nEnginePluginOptions } from '../packages/i18n/types/engine/plugin.d.js';

/**
 * 应用 i18n 配置
 *
 * 这个文件包含应用的 i18n 配置选项，用于扩展 @ldesign/i18n 的内置功能
 */

/**
 * 创建带有应用语言包的 I18n 实例
 */
declare function createAppI18n(options?: I18nOptions): Promise<I18nInstance>;
/**
 * 应用 i18n 配置选项
 */
declare const appI18nConfig: I18nEnginePluginOptions;

export { appI18nConfig, createAppI18n };
