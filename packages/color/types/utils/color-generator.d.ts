import { ColorGenerator, ColorConfig } from '../core/types.js';

/**
 * 基于 a-nice-red 算法的颜色生成器
 * 参考：https://github.com/Jahallahan/a-nice-red
 */

/**
 * 颜色生成配置
 */
interface ColorGenerationConfig {
    /** 成功色色相偏移 */
    successHueOffset: number;
    /** 警告色色相偏移 */
    warningHueOffset: number;
    /** 危险色色相偏移 */
    dangerHueOffset: number;
    /** 灰色饱和度 */
    graySaturation: number;
    /** 饱和度调整范围 */
    saturationRange: [number, number];
    /** 亮度调整范围 */
    lightnessRange: [number, number];
}
/**
 * 颜色生成器实现
 * 基于 a-nice-red 算法和色彩理论，从主色调生成和谐的配套颜色
 */
declare class ColorGeneratorImpl implements ColorGenerator {
    private config;
    constructor(config?: Partial<ColorGenerationConfig>);
    /**
     * 从主色调生成其他颜色
     * 使用改进的 a-nice-red 算法，确保生成的颜色和谐且符合设计规范
     */
    generateColors(primary: string): Omit<ColorConfig, 'primary'>;
    /**
     * 生成成功色（绿色系）
     * 基于色彩和谐理论，生成与主色调协调的绿色
     */
    private generateSuccessColor;
    /**
     * 生成警告色（橙色系）
     * 基于色彩和谐理论，生成与主色调协调的橙色
     */
    private generateWarningColor;
    /**
     * 生成危险色（红色系）
     * 基于色彩和谐理论，生成与主色调协调的红色
     */
    private generateDangerColor;
    /**
     * 生成灰色系
     * 基于色彩和谐理论，生成带有主色调倾向的中性灰色
     */
    private generateGrayColor;
    /**
     * 生成完整的灰色系配置
     * 基于四个基础灰色生成完整的灰色系统
     */
    generateGraySystem(primaryHsl: {
        h: number;
        s: number;
        l: number;
    }): {
        lightGray: string;
        midGray: string;
        darkGray: string;
        black: string;
    };
    /**
     * 计算最优饱和度
     * 基于 a-nice-red 算法，根据颜色类型和主色调特性计算最佳饱和度
     */
    private calculateOptimalSaturation;
    /**
     * 计算最优亮度
     * 基于 a-nice-red 算法，根据颜色类型和主色调特性计算最佳亮度
     */
    private calculateOptimalLightness;
    /**
     * 调整饱和度（保留原方法以兼容性）
     */
    private adjustSaturation;
    /**
     * 调整亮度（保留原方法以兼容性）
     */
    private adjustLightness;
    /**
     * 更新生成配置
     */
    updateConfig(config: Partial<ColorGenerationConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): ColorGenerationConfig;
    /**
     * 生成色阶（实现 ColorGenerator 接口）
     */
    generateScale(color: string, _mode: 'light' | 'dark'): any;
    /**
     * 生成 CSS 变量（实现 ColorGenerator 接口）
     */
    generateCSSVariables(scales: Record<string, any>, prefix?: string): Record<string, string>;
}
/**
 * 创建颜色生成器实例
 */
declare function createColorGenerator(config?: Partial<ColorGenerationConfig>): ColorGenerator;
/**
 * 默认颜色生成器实例
 */
declare const defaultColorGenerator: ColorGeneratorImpl;
/**
 * 便捷函数：从主色调生成完整的颜色配置
 */
declare function generateColorConfig(primary: string, config?: Partial<ColorGenerationConfig>): ColorConfig;
/**
 * 便捷函数：验证并生成颜色配置
 */
declare function safeGenerateColorConfig(primary: string, config?: Partial<ColorGenerationConfig>): ColorConfig | null;
/**
 * 预设的颜色生成配置
 */
declare const COLOR_GENERATION_PRESETS: {
    /** 默认配置 */
    readonly default: ColorGenerationConfig;
    /** 柔和配置 - 降低饱和度和对比度 */
    readonly soft: {
        readonly saturationRange: [number, number];
        readonly lightnessRange: [number, number];
        readonly successHueOffset: number;
        readonly warningHueOffset: number;
        readonly dangerHueOffset: number;
        readonly graySaturation: number;
    };
    /** 鲜艳配置 - 提高饱和度和对比度 */
    readonly vibrant: {
        readonly saturationRange: [number, number];
        readonly lightnessRange: [number, number];
        readonly successHueOffset: number;
        readonly warningHueOffset: number;
        readonly dangerHueOffset: number;
        readonly graySaturation: number;
    };
    /** 单色配置 - 基于主色调的不同明度 */
    readonly monochrome: {
        readonly successHueOffset: 0;
        readonly warningHueOffset: 0;
        readonly dangerHueOffset: 0;
        readonly graySaturation: 0;
        readonly saturationRange: [number, number];
        readonly lightnessRange: [number, number];
    };
};

export { COLOR_GENERATION_PRESETS, ColorGeneratorImpl, createColorGenerator, defaultColorGenerator, generateColorConfig, safeGenerateColorConfig };
