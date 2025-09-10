import { PDFPageProxy, PDFDocumentProxy } from 'pdfjs-dist';

/**
 * PDF预览器核心类型定义
 * 定义了PDF预览器的所有核心接口和类型
 */

/**
 * PDF文档输入类型
 * 支持多种输入方式：URL、File对象、ArrayBuffer等
 */
type PdfInput = string | File | ArrayBuffer | Uint8Array;
/**
 * PDF页面渲染模式
 */
type RenderMode = 'canvas' | 'svg' | 'text';
/**
 * 缩放模式
 */
type ZoomMode = 'fit-width' | 'fit-page' | 'auto' | 'custom';
/**
 * 旋转角度（以度为单位）
 */
type RotationAngle = 0 | 90 | 180 | 270;
/**
 * PDF页面信息
 */
interface PdfPageInfo {
    /** 页面编号（从1开始） */
    pageNumber: number;
    /** 页面宽度 */
    width: number;
    /** 页面高度 */
    height: number;
    /** 旋转角度 */
    rotation: RotationAngle;
    /** 页面视口 */
    viewport: {
        width: number;
        height: number;
        scale: number;
        rotation: RotationAngle;
    };
}
/**
 * PDF文档信息
 */
interface PdfDocumentInfo {
    /** 文档标题 */
    title?: string;
    /** 作者 */
    author?: string;
    /** 主题 */
    subject?: string;
    /** 关键词 */
    keywords?: string;
    /** 创建者 */
    creator?: string;
    /** 生产者 */
    producer?: string;
    /** 创建日期 */
    creationDate?: Date;
    /** 修改日期 */
    modificationDate?: Date;
    /** 总页数 */
    numPages: number;
    /** 文件大小（字节） */
    fileSize?: number;
    /** PDF版本 */
    pdfVersion?: string;
}
/**
 * 渲染选项
 */
interface RenderOptions {
    /** 渲染模式 */
    mode?: RenderMode;
    /** 缩放比例 */
    scale?: number;
    /** 旋转角度 */
    rotation?: RotationAngle;
    /** 是否启用文本选择 */
    enableTextSelection?: boolean;
    /** 是否启用注释 */
    enableAnnotations?: boolean;
    /** 背景颜色 */
    backgroundColor?: string;
    /** 是否使用高质量渲染 */
    useHighQuality?: boolean;
}
/**
 * 搜索选项
 */
interface SearchOptions {
    /** 搜索关键词 */
    query: string;
    /** 是否区分大小写 */
    caseSensitive?: boolean;
    /** 是否全词匹配 */
    wholeWords?: boolean;
    /** 是否高亮显示 */
    highlightAll?: boolean;
    /** 搜索方向 */
    findPrevious?: boolean;
}
/**
 * 搜索结果
 */
interface SearchResult {
    /** 匹配的页面编号 */
    pageNumber: number;
    /** 匹配的文本 */
    text: string;
    /** 匹配位置 */
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** 匹配索引 */
    matchIndex: number;
    /** 总匹配数 */
    totalMatches: number;
}
/**
 * 缩略图选项
 */
interface ThumbnailOptions {
    /** 缩略图宽度 */
    width?: number;
    /** 缩略图高度 */
    height?: number;
    /** 缩放比例 */
    scale?: number;
    /** 是否启用缓存 */
    enableCache?: boolean;
}
/**
 * 打印选项
 */
interface PrintOptions {
    /** 打印页面范围 */
    pageRange?: string;
    /** 是否适应页面 */
    fitToPage?: boolean;
    /** 打印质量 */
    quality?: 'draft' | 'normal' | 'high';
    /** 是否显示打印对话框 */
    showDialog?: boolean;
}
/**
 * 下载选项
 */
interface DownloadOptions {
    /** 文件名 */
    filename?: string;
    /** 是否保存为副本 */
    saveAsCopy?: boolean;
}
/**
 * PDF预览器配置
 */
interface PdfViewerConfig {
    /** 容器元素 */
    container: HTMLElement;
    /** 初始缩放比例 */
    initialScale?: number;
    /** 初始页面 */
    initialPage?: number;
    /** 缩放模式 */
    zoomMode?: ZoomMode;
    /** 渲染选项 */
    renderOptions?: RenderOptions;
    /** 是否启用工具栏 */
    enableToolbar?: boolean;
    /** 是否启用侧边栏 */
    enableSidebar?: boolean;
    /** 是否启用搜索 */
    enableSearch?: boolean;
    /** 是否启用缩略图 */
    enableThumbnails?: boolean;
    /** 是否启用全屏 */
    enableFullscreen?: boolean;
    /** 是否启用下载 */
    enableDownload?: boolean;
    /** 是否启用打印 */
    enablePrint?: boolean;
    /** 自定义样式 */
    customStyles?: Record<string, string>;
    /** 本地化配置 */
    locale?: string;
}
/**
 * 事件类型
 */
interface PdfViewerEvents {
    /** 文档加载完成 */
    documentLoaded: (info: PdfDocumentInfo) => void;
    /** 页面变化 */
    pageChanged: (pageNumber: number, pageInfo: PdfPageInfo) => void;
    /** 缩放变化 */
    zoomChanged: (scale: number, zoomMode: ZoomMode) => void;
    /** 旋转变化 */
    rotationChanged: (rotation: RotationAngle) => void;
    /** 搜索结果 */
    searchResult: (results: SearchResult[]) => void;
    /** 错误事件 */
    error: (error: Error) => void;
    /** 加载进度 */
    loadProgress: (progress: number) => void;
    /** 渲染完成 */
    renderComplete: (pageNumber: number) => void;
}
/**
 * PDF预览器状态
 */
interface PdfViewerState {
    /** 是否已加载文档 */
    isDocumentLoaded: boolean;
    /** 当前页面编号 */
    currentPage: number;
    /** 总页数 */
    totalPages: number;
    /** 当前缩放比例 */
    currentScale: number;
    /** 当前缩放模式 */
    currentZoomMode: ZoomMode;
    /** 当前旋转角度 */
    currentRotation: RotationAngle;
    /** 是否正在加载 */
    isLoading: boolean;
    /** 是否全屏模式 */
    isFullscreen: boolean;
    /** 搜索状态 */
    searchState: {
        isSearching: boolean;
        query: string;
        currentMatch: number;
        totalMatches: number;
    };
}
/**
 * PDF预览器核心接口
 */
interface IPdfViewer {
    /** 加载PDF文档 */
    loadDocument(input: PdfInput): Promise<void>;
    /** 跳转到指定页面 */
    goToPage(pageNumber: number): Promise<void>;
    /** 上一页 */
    previousPage(): Promise<void>;
    /** 下一页 */
    nextPage(): Promise<void>;
    /** 设置缩放比例 */
    setZoom(scale: number): void;
    /** 设置缩放模式 */
    setZoomMode(mode: ZoomMode): void;
    /** 放大 */
    zoomIn(): void;
    /** 缩小 */
    zoomOut(): void;
    /** 旋转页面 */
    rotate(angle: RotationAngle): void;
    /** 搜索文本 */
    search(options: SearchOptions): Promise<SearchResult[]>;
    /** 进入全屏 */
    enterFullscreen(): void;
    /** 退出全屏 */
    exitFullscreen(): void;
    /** 下载PDF */
    download(options?: DownloadOptions): void;
    /** 打印PDF */
    print(options?: PrintOptions): void;
    /** 获取当前状态 */
    getState(): PdfViewerState;
    /** 获取文档信息 */
    getDocumentInfo(): PdfDocumentInfo | null;
    /** 销毁预览器 */
    destroy(): void;
    /** 事件订阅 */
    on<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    off<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    once<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
}
/**
 * PDF页面渲染器接口
 */
interface IPdfPageRenderer {
    /** 渲染页面 */
    renderPage(page: PDFPageProxy, container: HTMLElement, options: RenderOptions): Promise<void>;
    /** 清理渲染内容 */
    cleanup(): void;
}
/**
 * PDF文档管理器接口
 */
interface IPdfDocumentManager {
    /** 加载文档 */
    loadDocument(input: PdfInput): Promise<PDFDocumentProxy>;
    /** 获取页面 */
    getPage(pageNumber: number): Promise<PDFPageProxy>;
    /** 获取文档信息 */
    getDocumentInfo(): Promise<PdfDocumentInfo>;
    /** 销毁文档 */
    destroy(): void;
}

/**
 * PDF预览器实现
 */
declare class PdfViewer implements IPdfViewer {
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
     * 获取PDF文档对象
     */
    getDocument(): Promise<any>;
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
    on<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    /**
     * 移除事件监听器
     */
    off<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    /**
     * 添加一次性事件监听器
     */
    once<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    /**
     * 销毁预览器
     */
    destroy(): void;
}

/**
 * PDF文档管理器
 * 负责PDF文档的加载、解析和管理
 */

/**
 * PDF文档管理器实现
 */
declare class PdfDocumentManager implements IPdfDocumentManager {
    private document;
    private pageCache;
    constructor();
    /**
     * 设置PDF.js worker
     */
    private setupWorker;
    /**
     * 加载PDF文档
     */
    loadDocument(input: PdfInput): Promise<PDFDocumentProxy>;
    /**
     * 处理不同类型的输入
     */
    private processInput;
    /**
     * 将File对象转换为ArrayBuffer
     */
    private fileToArrayBuffer;
    /**
     * 获取指定页面
     */
    getPage(pageNumber: number): Promise<PDFPageProxy>;
    /**
     * 获取文档信息
     */
    getDocumentInfo(): Promise<PdfDocumentInfo>;
    /**
     * 获取当前文档
     */
    getDocument(): PDFDocumentProxy | null;
    /**
     * 检查是否已加载文档
     */
    hasDocument(): boolean;
    /**
     * 获取总页数
     */
    getPageCount(): number;
    /**
     * 预加载页面（用于性能优化）
     */
    preloadPages(startPage: number, endPage: number): Promise<void>;
    /**
     * 清理页面缓存
     */
    clearPageCache(): void;
    /**
     * 销毁文档管理器
     */
    destroy(): Promise<void>;
}

/**
 * PDF页面渲染器
 * 负责将PDF页面渲染到DOM元素中
 */

/**
 * PDF页面渲染器实现
 */
declare class PdfPageRenderer implements IPdfPageRenderer {
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

/**
 * 事件管理器
 * 负责PDF预览器的事件处理和分发
 */

/**
 * 事件管理器实现
 */
declare class EventManager {
    private listeners;
    /**
     * 添加事件监听器
     */
    on<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    /**
     * 移除事件监听器
     */
    off<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    /**
     * 添加一次性事件监听器
     */
    once<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    /**
     * 触发事件
     */
    emit<K extends keyof PdfViewerEvents>(event: K, ...args: Parameters<PdfViewerEvents[K]>): void;
    /**
     * 移除所有事件监听器
     */
    removeAllListeners(event?: keyof PdfViewerEvents): void;
    /**
     * 获取事件监听器数量
     */
    listenerCount(event: keyof PdfViewerEvents): number;
    /**
     * 获取所有事件名称
     */
    eventNames(): Array<keyof PdfViewerEvents>;
    /**
     * 检查是否有监听器
     */
    hasListeners(event: keyof PdfViewerEvents): boolean;
    /**
     * 销毁事件管理器
     */
    destroy(): void;
}

/**
 * 文件处理工具函数
 * 提供文件类型检测、转换等功能
 */

/**
 * 检查输入是否为有效的PDF数据
 */
declare function isValidPdfInput(input: unknown): input is PdfInput;
/**
 * 检查文件是否为PDF格式
 */
declare function isPdfFile(file: File): boolean;
/**
 * 检查URL是否指向PDF文件
 */
declare function isPdfUrl(url: string): boolean;
/**
 * 将File对象转换为ArrayBuffer
 */
declare function fileToArrayBuffer(file: File): Promise<ArrayBuffer>;
/**
 * 将ArrayBuffer转换为Uint8Array
 */
declare function arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array;
/**
 * 检查ArrayBuffer是否为PDF格式
 */
declare function isPdfArrayBuffer(buffer: ArrayBufferLike): boolean;
/**
 * 获取文件大小的可读格式
 */
declare function formatFileSize(bytes: number): string;
/**
 * 从URL获取文件名
 */
declare function getFileNameFromUrl(url: string): string;
/**
 * 验证PDF输入并返回标准化的数据
 */
declare function validateAndNormalizePdfInput(input: PdfInput): Promise<{
    data: string | ArrayBuffer | Uint8Array;
    type: 'url' | 'file' | 'buffer';
    size?: number;
    name?: string;
}>;
/**
 * 创建用于下载的Blob URL
 */
declare function createDownloadUrl(data: ArrayBuffer | Uint8Array, filename: string): string;
/**
 * 清理Blob URL
 */
declare function revokeDownloadUrl(url: string): void;
/**
 * 检查浏览器是否支持PDF预览
 */
declare function isBrowserSupportPdf(): boolean;
/**
 * 获取浏览器信息
 */
declare function getBrowserInfo(): {
    name: string;
    version: string;
    isSupported: boolean;
};

/**
 * 缓存管理器
 * 提供页面缓存、渲染缓存等功能
 */

/**
 * 缓存配置
 */
interface CacheConfig {
    /** 最大缓存项数量 */
    maxItems: number;
    /** 缓存过期时间（毫秒） */
    maxAge: number;
    /** 是否启用LRU清理 */
    enableLRU: boolean;
}
/**
 * 通用缓存管理器
 */
declare class CacheManager<T> {
    private cache;
    private config;
    constructor(config?: Partial<CacheConfig>);
    /**
     * 设置缓存项
     */
    set(key: string, data: T): void;
    /**
     * 获取缓存项
     */
    get(key: string): T | null;
    /**
     * 检查缓存项是否存在
     */
    has(key: string): boolean;
    /**
     * 删除缓存项
     */
    delete(key: string): boolean;
    /**
     * 清空所有缓存
     */
    clear(): void;
    /**
     * 获取缓存大小
     */
    size(): number;
    /**
     * 获取所有缓存键
     */
    keys(): string[];
    /**
     * 清理过期和最少使用的缓存项
     */
    private cleanup;
    /**
     * 获取缓存统计信息
     */
    getStats(): {
        size: number;
        maxItems: number;
        hitRate: number;
        oldestItem: number;
        newestItem: number;
    };
}
/**
 * PDF页面缓存管理器
 */
declare class PdfPageCacheManager extends CacheManager<PDFPageProxy> {
    constructor();
    /**
     * 生成页面缓存键
     */
    static generatePageKey(documentId: string, pageNumber: number): string;
    /**
     * 缓存页面
     */
    cachePage(documentId: string, pageNumber: number, page: PDFPageProxy): void;
    /**
     * 获取缓存的页面
     */
    getCachedPage(documentId: string, pageNumber: number): PDFPageProxy | null;
    /**
     * 检查页面是否已缓存
     */
    hasPage(documentId: string, pageNumber: number): boolean;
    /**
     * 删除文档的所有页面缓存
     */
    clearDocument(documentId: string): void;
}
/**
 * 渲染缓存管理器
 */
declare class RenderCacheManager extends CacheManager<HTMLCanvasElement> {
    constructor();
    /**
     * 生成渲染缓存键
     */
    static generateRenderKey(documentId: string, pageNumber: number, scale: number, rotation: number): string;
    /**
     * 缓存渲染结果
     */
    cacheRender(documentId: string, pageNumber: number, scale: number, rotation: number, canvas: HTMLCanvasElement): void;
    /**
     * 获取缓存的渲染结果
     */
    getCachedRender(documentId: string, pageNumber: number, scale: number, rotation: number): HTMLCanvasElement | null;
    /**
     * 检查渲染是否已缓存
     */
    hasRender(documentId: string, pageNumber: number, scale: number, rotation: number): boolean;
    /**
     * 删除文档的所有渲染缓存
     */
    clearDocument(documentId: string): void;
}
/**
 * 缩略图缓存管理器
 */
declare class ThumbnailCacheManager extends CacheManager<HTMLCanvasElement> {
    constructor();
    /**
     * 生成缩略图缓存键
     */
    static generateThumbnailKey(documentId: string, pageNumber: number, width: number, height: number): string;
    /**
     * 缓存缩略图
     */
    cacheThumbnail(documentId: string, pageNumber: number, width: number, height: number, canvas: HTMLCanvasElement): void;
    /**
     * 获取缓存的缩略图
     */
    getCachedThumbnail(documentId: string, pageNumber: number, width: number, height: number): HTMLCanvasElement | null;
    /**
     * 检查缩略图是否已缓存
     */
    hasThumbnail(documentId: string, pageNumber: number, width: number, height: number): boolean;
    /**
     * 删除文档的所有缩略图缓存
     */
    clearDocument(documentId: string): void;
}

declare function createPdfViewer(config: PdfViewerConfig): IPdfViewer;
declare const version = "0.1.0";

export { CacheManager, EventManager, PdfDocumentManager, PdfPageCacheManager, PdfPageRenderer, PdfViewer, RenderCacheManager, ThumbnailCacheManager, arrayBufferToUint8Array, createDownloadUrl, createPdfViewer, fileToArrayBuffer, formatFileSize, getBrowserInfo, getFileNameFromUrl, isBrowserSupportPdf, isPdfArrayBuffer, isPdfFile, isPdfUrl, isValidPdfInput, revokeDownloadUrl, validateAndNormalizePdfInput, version };
export type { DownloadOptions, IPdfDocumentManager, IPdfPageRenderer, IPdfViewer, PdfDocumentInfo, PdfInput, PdfPageInfo, PdfViewerConfig, PdfViewerEvents, PdfViewerState, PrintOptions, RenderMode, RenderOptions, RotationAngle, SearchOptions, SearchResult, ThumbnailOptions, ZoomMode };
