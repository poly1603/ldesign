/**
 * PDF页面渲染器
 * 负责将PDF页面渲染到DOM元素中
 */
import type { PDFPageProxy } from 'pdfjs-dist';
import type { IPdfPageRenderer, RenderOptions } from './types';
/**
 * PDF页面渲染器实现
 */
export declare class PdfPageRenderer implements IPdfPageRenderer {
    private renderTasks;
    private textLayers;
    /**
     * 渲染PDF页面
     */
    renderPage(page: PDFPageProxy, container: HTMLElement, options?: RenderOptions): Promise<void>;
    /**
     * 渲染到Canvas
     */
    private renderToCanvas;
    /**
     * 渲染到SVG
     */
    private renderToSvg;
    /**
     * 仅渲染文本
     */
    private renderTextOnly;
    /**
     * 渲染文本层
     */
    private renderTextLayer;
    /**
     * 渲染注释层
     */
    private renderAnnotationLayer;
    /**
     * 取消渲染任务
     */
    private cancelRenderTask;
    /**
     * 清理容器
     */
    private cleanupContainer;
    /**
     * 清理所有渲染内容
     */
    cleanup(): void;
}
//# sourceMappingURL=page-renderer.d.ts.map