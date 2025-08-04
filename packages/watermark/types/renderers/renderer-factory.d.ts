import { WatermarkConfig } from '../types/config.js';
import { RendererFactory as RendererFactory$1, BaseRenderer } from '../types/render.js';

/**
 * 渲染器工厂
 */

/**
 * 渲染器工厂
 * 根据配置创建合适的渲染器
 */
declare class RendererFactory implements RendererFactory$1 {
    private renderers;
    private defaultRenderer;
    constructor();
    /**
     * 创建渲染器
     */
    createRenderer(config: WatermarkConfig): BaseRenderer;
    /**
     * 注册渲染器
     */
    registerRenderer(name: string, renderer: BaseRenderer): void;
    /**
     * 注销渲染器
     */
    unregisterRenderer(name: string): boolean;
    /**
     * 获取渲染器
     */
    getRenderer(name: string): BaseRenderer | undefined;
    /**
     * 获取所有注册的渲染器名称
     */
    getRegisteredRenderers(): string[];
    /**
     * 检查渲染器是否支持
     */
    isRendererSupported(mode: string): boolean;
    /**
     * 获取推荐的渲染器
     */
    getRecommendedRenderer(config: WatermarkConfig): string;
    /**
     * 获取渲染器能力信息
     */
    getRendererCapabilities(name: string): {
        supportsAnimation: boolean;
        supportsTransparency: boolean;
        supportsBlending: boolean;
        supportsFilters: boolean;
        performance: 'low' | 'medium' | 'high';
    };
    /**
     * 设置默认渲染器
     */
    setDefaultRenderer(name: string): void;
    /**
     * 获取默认渲染器
     */
    getDefaultRenderer(): BaseRenderer;
    /**
     * 清理所有渲染器
     */
    dispose(): void;
    private isCanvasSupported;
    private isSVGSupported;
}

export { RendererFactory };
