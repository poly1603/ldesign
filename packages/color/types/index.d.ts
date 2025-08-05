import { ThemeManagerOptions, ThemeManagerInstance } from './core/types.js';
export { CSSInjector, CacheItem, CacheOptions, ColorCategory, ColorConfig, ColorGenerator, ColorMode, ColorScale, ColorValue, EventEmitter, GeneratedTheme, IdleProcessor, LRUCache, NeutralColorCategory, NeutralColors, Storage, SystemThemeDetector, ThemeConfig, ThemeEventListener, ThemeEventType, ThemeType } from './core/types.js';
import { ThemeManager } from './core/theme-manager.js';
export { CookieStorage, LRUCacheImpl, LocalStorage, MemoryStorage, NoStorage, SessionStorage, createLRUCache, createStorage, defaultCache, defaultStorage } from './core/storage.js';
export { BrowserSystemThemeDetector, ManualSystemThemeDetector, browserDetector, createSystemThemeDetector, createThemeMediaQuery, getSystemTheme, isSystemThemeSupported, watchSystemTheme } from './core/system-theme-detector.js';
export { createCustomTheme, cyanTheme, darkTheme, defaultTheme, getPresetTheme, getPresetThemeNames, getRandomPresetTheme, getThemesByCategory, getThemesByTag, greenTheme, isPresetTheme, minimalTheme, orangeTheme, pinkTheme, presetThemes, purpleTheme, recommendThemes, redTheme, themeCategories, themeTags, yellowTheme } from './themes/presets.js';
export { HSL, RGB, clamp, hexToHsl, hexToRgb, hslToHex, hslToRgb, isValidHex, normalizeHex, normalizeHue, rgbToHex, rgbToHsl } from './utils/color-converter.js';
export { COLOR_GENERATION_PRESETS, ColorGeneratorImpl, createColorGenerator, createNeutralGrayGenerator, createTintedGrayGenerator, defaultColorGenerator, generateColorConfig, safeGenerateColorConfig } from './utils/color-generator.js';
export { ColorScaleGenerator, colorScaleGenerator, generateColorScale, generateColorScales } from './utils/color-scale.js';
export { CSSInjectionOptions, CSSInjectorImpl, CSSVariableGenerator, createCSSInjector, createCSSVariableGenerator, defaultCSSInjector, defaultCSSVariableGenerator, injectScaleVariables, removeAllColorVariables } from './utils/css-injector.js';
export { CSSVariableInjector, getCSSVariableValue, globalCSSInjector, injectThemeVariables, setCSSVariableValue, toggleThemeMode } from './utils/css-variables.js';
export { EventEmitterImpl, createEventEmitter } from './utils/event-emitter.js';
export { IdleProcessorImpl, IdleProcessorOptions, addIdleTask, addIdleTasks, createConditionalIdleTask, createDelayedIdleTask, createIdleProcessor, defaultIdleProcessor, getDefaultProcessorStatus, supportsIdleCallback } from './utils/idle-processor.js';

/**
 * @ldesign/color - 框架无关的主题色管理系统
 *
 * 这是一个功能完整的主题色管理库，提供：
 * - 框架无关的核心功能
 * - TypeScript 类型安全
 * - 高性能缓存和闲时处理
 * - 灵活的颜色生成算法
 * - 完整的主题预设和自定义支持
 * - 多框架适配器支持（Vue、React等）
 *
 * @version 0.1.0
 * @author ldesign
 */

declare function createThemeManager(options?: ThemeManagerOptions): ThemeManagerInstance;
/**
 * 创建带有预设主题的主题管理器实例
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
declare function createThemeManagerWithPresets(options?: ThemeManagerOptions): Promise<ThemeManagerInstance>;
/**
 * 创建简单的主题管理器实例（仅默认主题）
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
declare function createSimpleThemeManager(options?: ThemeManagerOptions): Promise<ThemeManagerInstance>;
/**
 * 创建自定义主题管理器
 * @param primaryColor 主色调
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
declare function createCustomThemeManager(primaryColor: string, options?: ThemeManagerOptions & {
    themeName?: string;
    darkPrimaryColor?: string;
}): Promise<ThemeManagerInstance>;
/**
 * 版本信息
 */
declare const version = "0.1.0";

export { ThemeManager, ThemeManagerInstance, ThemeManagerOptions, createCustomThemeManager, createSimpleThemeManager, createThemeManager, createThemeManagerWithPresets, ThemeManager as default, version };
