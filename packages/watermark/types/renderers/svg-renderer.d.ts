import { WatermarkConfig } from '../types/config.js';
import { SVGRenderer, RenderContext, RenderOptions } from '../types/render.js';

/**
 * SVG渲染器实现
 */

/**
 * SVG渲染器实现
 * 使用SVG元素渲染水印
 */
declare class SVGRendererImpl implements SVGRenderer {
    private imageCache;
    private patternCache;
    /**
     * 渲染水印
     */
    render(config: WatermarkConfig, context: RenderContext, options?: RenderOptions): Promise<HTMLElement[]>;
    /**
     * 更新水印
     */
    update(elements: HTMLElement[], config: WatermarkConfig, context: RenderContext, options?: RenderOptions): Promise<HTMLElement[]>;
    /**
     * 销毁水印元素
     */
    destroy(elements: HTMLElement[]): Promise<void>;
    /**
     * 获取渲染器类型
     */
    getType(): string;
    /**
     * 检查是否支持
     */
    isSupported(): boolean;
    /**
     * 清理缓存
     */
    clearCache(): void;
    /**
     * 销毁渲染器
     */
    dispose(): void;
    private createSVG;
    private updateSVGSize;
    private calculateLayout;
    private createDefs;
    private createFilters;
    private createGradients;
    private createPatterns;
    private renderWatermarks;
    private renderSingleWatermark;
    private renderBackground;
    private renderText;
    private renderImage;
    private applySVGStyles;
}

export { SVGRendererImpl };
