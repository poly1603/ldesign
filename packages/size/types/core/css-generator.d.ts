/**
 * CSS变量生成器
 */
import type { SizeConfig } from '../types';
/**
 * CSS变量生成器类
 */
export declare class CSSVariableGenerator {
    private prefix;
    constructor(prefix?: string);
    /**
     * 生成完整的CSS变量集合
     */
    generateVariables(config: SizeConfig): Record<string, string>;
    /**
     * 生成字体大小变量
     */
    private generateFontSizeVariables;
    /**
     * 生成间距变量
     */
    private generateSpacingVariables;
    /**
     * 生成组件尺寸变量
     */
    private generateComponentVariables;
    /**
     * 生成边框圆角变量
     */
    private generateBorderRadiusVariables;
    /**
     * 生成阴影变量
     */
    private generateShadowVariables;
    /**
     * 生成CSS字符串
     */
    generateCSSString(variables: Record<string, string>, selector?: string): string;
    /**
     * 更新前缀
     */
    updatePrefix(prefix: string): void;
    /**
     * 获取当前前缀
     */
    getPrefix(): string;
}
/**
 * 创建CSS变量生成器实例
 */
export declare function createCSSVariableGenerator(prefix?: string): CSSVariableGenerator;
/**
 * 默认CSS变量生成器实例
 */
export declare const defaultCSSVariableGenerator: CSSVariableGenerator;
//# sourceMappingURL=css-generator.d.ts.map