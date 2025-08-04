import { WatermarkConfig } from '../types/config.js';
import { DOMRenderer, RenderContext, RenderOptions } from '../types/render.js';

/**
 * DOM渲染器实现
 */

/**
 * DOM渲染器实现
 * 使用DOM元素渲染水印
 */
declare class DOMRendererImpl implements DOMRenderer {
    private cache;
    private imageCache;
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
    private calculateLayout;
    private createWatermarkElement;
    private applyBaseStyles;
    private addTextContent;
    private addImageContent;
    private loadImage;
    private applyStyles;
    private setupEventListeners;
}

export { DOMRendererImpl };
