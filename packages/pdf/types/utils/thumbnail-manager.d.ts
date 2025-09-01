/**
 * PDF缩略图管理器
 * 提供缩略图生成、缓存和管理功能
 */
import type { PDFPageProxy } from 'pdfjs-dist';
import type { ThumbnailOptions } from '../core/types';
/**
 * 缩略图项
 */
interface ThumbnailItem {
    pageNumber: number;
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    scale: number;
    isLoading: boolean;
    error?: Error;
}
/**
 * 缩略图管理器
 */
export declare class PdfThumbnailManager {
    private thumbnails;
    private cacheManager;
    private documentId;
    private loadingPromises;
    constructor(documentId: string);
    /**
     * 生成缩略图
     */
    generateThumbnail(page: PDFPageProxy, pageNumber: number, options?: ThumbnailOptions): Promise<HTMLCanvasElement>;
    /**
     * 内部创建缩略图方法
     */
    private createThumbnailInternal;
    /**
     * 计算缩放比例
     */
    private calculateScale;
    /**
     * 创建错误占位符canvas
     */
    private createErrorCanvas;
    /**
     * 批量生成缩略图
     */
    generateThumbnails(getPage: (pageNumber: number) => Promise<PDFPageProxy>, pageNumbers: number[], options?: ThumbnailOptions): Promise<Map<number, HTMLCanvasElement>>;
    /**
     * 获取缩略图
     */
    getThumbnail(pageNumber: number): ThumbnailItem | null;
    /**
     * 检查缩略图是否存在
     */
    hasThumbnail(pageNumber: number): boolean;
    /**
     * 检查缩略图是否正在加载
     */
    isLoading(pageNumber: number): boolean;
    /**
     * 获取所有缩略图
     */
    getAllThumbnails(): Map<number, ThumbnailItem>;
    /**
     * 删除缩略图
     */
    removeThumbnail(pageNumber: number): boolean;
    /**
     * 清空所有缩略图
     */
    clearThumbnails(): void;
    /**
     * 预加载缩略图
     */
    preloadThumbnails(getPage: (pageNumber: number) => Promise<PDFPageProxy>, startPage: number, endPage: number, options?: ThumbnailOptions): Promise<void>;
    /**
     * 创建缩略图导航元素
     */
    createThumbnailNavigation(container: HTMLElement, onPageClick?: (pageNumber: number) => void, currentPage?: number): void;
    /**
     * 创建单个缩略图元素
     */
    private createThumbnailElement;
    /**
     * 更新活动缩略图
     */
    updateActiveThumbnail(container: HTMLElement, currentPage: number): void;
    /**
     * 获取缩略图统计信息
     */
    getStats(): {
        totalThumbnails: number;
        loadingThumbnails: number;
        errorThumbnails: number;
        cacheStats: any;
    };
    /**
     * 销毁缩略图管理器
     */
    destroy(): void;
}
export {};
//# sourceMappingURL=thumbnail-manager.d.ts.map