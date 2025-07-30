import { ColorMode, ColorValue, ColorScale, ColorCategory } from '../core/types.js';

/**
 * 色阶生成系统
 * 集成 @arco-design/color 库实现亮色和暗色模式的完整色阶生成
 */
declare module '@arco-design/color' {
    interface RGB {
        r: number;
        g: number;
        b: number;
    }
    interface GenerateOptions {
        list?: boolean;
        dark?: boolean;
        index?: number;
    }
    function generate(color: string, options?: GenerateOptions): string | string[] | RGB | RGB[];
    function getRgbStr(rgb: RGB): string;
}

/**
 * 色阶生成选项
 */
interface ColorScaleOptions {
    /** 色阶数量 */
    count?: number;
    /** 颜色模式 */
    mode?: ColorMode;
    /** 是否包含原色 */
    includeOriginal?: boolean;
    /** 自定义色阶索引映射 */
    customIndices?: number[];
}
/**
 * 色阶生成器类
 */
declare class ColorScaleGenerator {
    private options;
    constructor(options?: ColorScaleOptions);
    /**
     * 生成单个颜色的色阶
     */
    generateScale(color: ColorValue, mode?: ColorMode): ColorScale;
    /**
     * 为灰色系生成特殊的色阶
     * 先生成4个基础灰色，然后基于这些基础灰色平滑插值生成完整的10级色阶
     */
    generateGrayScale(baseGray: ColorValue, mode?: ColorMode): ColorScale;
    /**
     * 批量生成多个颜色的色阶
     */
    generateScales(colors: Record<ColorCategory, ColorValue>, mode?: ColorMode): Record<ColorCategory, ColorScale>;
    /**
     * 创建回退色阶（当生成失败时使用）
     */
    private createFallbackScale;
    /**
     * 更新生成选项
     */
    updateOptions(options: Partial<ColorScaleOptions>): void;
    /**
     * 获取当前选项
     */
    getOptions(): Required<ColorScaleOptions>;
}
/**
 * 预设的色阶配置
 */
declare const COLOR_SCALE_PRESETS: {
    /** 标准 10 级色阶 */
    readonly standard: {
        readonly count: 10;
        readonly customIndices: readonly [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    };
    /** 简化 5 级色阶 */
    readonly simple: {
        readonly count: 5;
        readonly customIndices: readonly [1, 2, 3, 4, 5];
    };
    /** 扩展 12 级色阶 */
    readonly extended: {
        readonly count: 12;
        readonly customIndices: readonly [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    };
    /** 自定义索引色阶 */
    readonly custom: {
        readonly count: 10;
        readonly customIndices: readonly [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    };
};
/**
 * 创建色阶生成器实例
 */
declare function createColorScaleGenerator(options?: ColorScaleOptions): ColorScaleGenerator;
/**
 * 默认色阶生成器实例
 */
declare const defaultColorScaleGenerator: ColorScaleGenerator;
/**
 * 便捷函数：生成单个颜色的色阶
 */
declare function generateColorScale(color: ColorValue, mode?: ColorMode, options?: ColorScaleOptions): ColorScale;
/**
 * 便捷函数：批量生成色阶
 */
declare function generateColorScales(colors: Record<ColorCategory, ColorValue>, mode?: ColorMode, options?: ColorScaleOptions): Record<ColorCategory, ColorScale>;
/**
 * 便捷函数：安全生成色阶（不抛出异常）
 */
declare function safeGenerateColorScale(color: ColorValue, mode?: ColorMode, options?: ColorScaleOptions): ColorScale | null;
/**
 * 便捷函数：安全批量生成色阶
 */
declare function safeGenerateColorScales(colors: Record<ColorCategory, ColorValue>, mode?: ColorMode, options?: ColorScaleOptions): Record<ColorCategory, ColorScale> | null;
/**
 * 获取色阶中的特定颜色
 */
declare function getColorFromScale(scale: ColorScale, index: number): ColorValue | undefined;
/**
 * 检查色阶是否有效
 */
declare function isValidColorScale(scale: ColorScale): boolean;

export { COLOR_SCALE_PRESETS, ColorScaleGenerator, createColorScaleGenerator, defaultColorScaleGenerator, generateColorScale, generateColorScales, getColorFromScale, isValidColorScale, safeGenerateColorScale, safeGenerateColorScales };
export type { ColorScaleOptions };
