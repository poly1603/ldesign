import { ColorCategory, ColorMode, ColorScale, ColorValue, NeutralColors } from '../core/types.js';

/**
 * 色阶生成系统
 * 使用优化的HSL算法实现高质量的色阶生成，确保亮色和暗色模式都有正确的色阶效果
 */

/**
 * 色阶生成器类
 */
declare class ColorScaleGenerator {
    /**
     * 生成单个颜色的色阶
     */
    generateScale(baseColor: string, category: ColorCategory, mode?: ColorMode): ColorScale;
    /**
     * 生成彩色色阶 - 完全使用Arco Design的原始算法
     * 直接拷贝自官方源码，不使用硬编码
     * 暗黑模式下色阶反转：1是最深的，10是最浅的
     */
    private generateColorScale;
    /**
     * Arco Design的原始色阶算法 - 直接拷贝自官方源码
     * 来源: https://github.com/arco-design/color/blob/main/src/palette.js
     */
    private arcoColorPalette;
    /**
     * 生成额外的浅色（用于扩展到12级或14级）
     */
    private generateExtraLightColor;
    /**
     * Hex转RGB
     */
    private hexToRgb;
    /**
     * RGB转Hex
     */
    private rgbToHex;
    /**
     * RGB转HSV - 完全按照Arco Design的算法
     */
    private rgbToHsv;
    /**
     * HSV转RGB - 完全按照Arco Design的算法
     */
    private hsvToRgb;
    /**
     * 生成灰色色阶 - 直接使用Arco Design的预设灰色
     */
    private generateGrayScale;
    /**
     * 生成多个颜色类别的色阶
     */
    generateScales<T extends ColorCategory>(colors: Record<T, ColorValue>, mode?: ColorMode): Record<T, ColorScale>;
    /**
     * 创建回退色阶
     */
    private createFallbackScale;
    /**
     * 生成中性色（灰色）色阶
     */
    generateNeutralColors(mode?: ColorMode): NeutralColors;
}
declare const colorScaleGenerator: ColorScaleGenerator;
declare function generateColorScales<T extends ColorCategory>(colors: Record<T, ColorValue>, mode?: ColorMode): Record<T, ColorScale>;
declare function generateColorScale(baseColor: string, category: ColorCategory, mode?: ColorMode): ColorScale;

export { ColorScaleGenerator, colorScaleGenerator, generateColorScale, generateColorScales };
