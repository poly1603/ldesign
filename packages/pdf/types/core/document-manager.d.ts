/**
 * PDF文档管理器
 * 负责PDF文档的加载、解析和管理
 */
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type { IPdfDocumentManager, PdfInput, PdfDocumentInfo } from './types';
/**
 * PDF文档管理器实现
 */
export declare class PdfDocumentManager implements IPdfDocumentManager {
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
//# sourceMappingURL=document-manager.d.ts.map