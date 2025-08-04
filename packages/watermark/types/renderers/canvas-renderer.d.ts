import { WatermarkConfig } from '../types/config.js';
import { CanvasRenderer, RenderContext, RenderOptions } from '../types/render.js';

/**
 * Canvas渲染器实现
 */

/**
 * Canvas渲染器实现
 * 使用Canvas元素渲染水印
 */
declare class CanvasRendererImpl implements CanvasRenderer {
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
    private createCanvas;
    private updateCanvasSize;
    private calculateLayout;
    private applyGlobalStyles;
    private renderWatermarks;
    private renderSingleWatermark;
    private renderBackground;
    private renderText;
    private renderImage;
    private loadImage;
    private applyCanvasStyles;
    private applyTextShadow;
    private convertBlendMode;
}

export { CanvasRendererImpl };
