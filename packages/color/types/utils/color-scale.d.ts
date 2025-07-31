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
     * 生成彩色色阶
     */
    private generateColorScale;
    /**
     * 生成灰色色阶
     */
    private generateGrayScale;
    /**
     * 扩展色阶到目标数量
     */
    private extendColorScale;
    /**
     * 在两个颜色之间插值
     */
    private interpolateColors;
    /**
     * 色相插值 - 处理色相环的最短路径
     */
    private interpolateHue;
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
