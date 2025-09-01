/**
 * PDF预览器核心类
 * 整合所有功能模块，提供完整的PDF预览功能
 */
import type { IPdfViewer, PdfInput, PdfViewerConfig, PdfViewerState, PdfDocumentInfo, ZoomMode, RotationAngle, SearchOptions, SearchResult, DownloadOptions, PrintOptions } from './types';
/**
 * PDF预览器实现
 */
export declare class PdfViewer implements IPdfViewer {
    private documentManager;
    private pageRenderer;
    private eventManager;
    private config;
    private state;
    constructor(config: PdfViewerConfig);
    /**
     * 初始化容器
     */
    private initializeContainer;
    /**
     * 加载PDF文档
     */
    loadDocument(input: PdfInput): Promise<void>;
    /**
     * 跳转到指定页面
     */
    goToPage(pageNumber: number): Promise<void>;
    /**
     * 上一页
     */
    previousPage(): Promise<void>;
    /**
     * 下一页
     */
    nextPage(): Promise<void>;
    /**
     * 设置缩放比例
     */
    setZoom(scale: number): void;
    /**
     * 设置缩放模式
     */
    setZoomMode(mode: ZoomMode): void;
    /**
     * 放大
     */
    zoomIn(): void;
    /**
     * 缩小
     */
    zoomOut(): void;
    /**
     * 旋转页面
     */
    rotate(angle: RotationAngle): void;
    /**
     * 搜索文本
     */
    search(options: SearchOptions): Promise<SearchResult[]>;
    /**
     * 进入全屏
     */
    enterFullscreen(): void;
    /**
     * 退出全屏
     */
    exitFullscreen(): void;
    /**
     * 下载PDF
     */
    download(options?: DownloadOptions): void;
    /**
     * 打印PDF
     */
    print(options?: PrintOptions): void;
    /**
     * 获取当前状态
     */
    getState(): PdfViewerState;
    /**
     * 获取文档信息
     */
    getDocumentInfo(): PdfDocumentInfo | null;
    /**
     * 渲染当前页面
     */
    private renderCurrentPage;
    /**
     * 获取当前页面信息
     */
    private getCurrentPageInfo;
    /**
     * 根据缩放模式计算缩放比例
     */
    private calculateScaleForMode;
    /**
     * 添加事件监听器
     */
    on<K extends keyof import('./types').PdfViewerEvents>(event: K, listener: import('./types').PdfViewerEvents[K]): void;
    /**
     * 移除事件监听器
     */
    off<K extends keyof import('./types').PdfViewerEvents>(event: K, listener: import('./types').PdfViewerEvents[K]): void;
    /**
     * 销毁预览器
     */
    destroy(): void;
}
//# sourceMappingURL=pdf-viewer.d.ts.map