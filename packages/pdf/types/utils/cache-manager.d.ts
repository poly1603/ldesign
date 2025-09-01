/**
 * 缓存管理器
 * 提供页面缓存、渲染缓存等功能
 */
import type { PDFPageProxy } from 'pdfjs-dist';
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
export declare class CacheManager<T> {
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
export declare class PdfPageCacheManager extends CacheManager<PDFPageProxy> {
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
export declare class RenderCacheManager extends CacheManager<HTMLCanvasElement> {
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
export declare class ThumbnailCacheManager extends CacheManager<HTMLCanvasElement> {
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
export {};
//# sourceMappingURL=cache-manager.d.ts.map