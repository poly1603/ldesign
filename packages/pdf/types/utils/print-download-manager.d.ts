/**
 * PDF打印和下载管理器
 * 提供PDF文档的打印和下载功能
 */
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PrintOptions, DownloadOptions } from '../core/types';
/**
 * 打印和下载管理器
 */
export declare class PdfPrintDownloadManager {
    private documentProxy;
    private originalData;
    constructor(documentProxy?: PDFDocumentProxy);
    /**
     * 设置文档代理
     */
    setDocument(documentProxy: PDFDocumentProxy, originalData?: ArrayBuffer): void;
    /**
     * 下载PDF文档
     */
    downloadPdf(options?: DownloadOptions): Promise<void>;
    /**
     * 打印PDF文档
     */
    printPdf(options?: PrintOptions): Promise<void>;
    /**
     * 使用浏览器打印对话框打印
     */
    private printWithDialog;
    /**
     * 直接打印（不显示对话框）
     */
    private printDirect;
    /**
     * 为打印渲染页面
     */
    private renderPageForPrint;
    /**
     * 解析页面范围
     */
    private parsePageRange;
    /**
     * 生成PDF数据
     */
    private generatePdfData;
    /**
     * 确保文件名有PDF扩展名
     */
    private ensurePdfExtension;
    /**
     * 检查浏览器是否支持打印
     */
    static isPrintSupported(): boolean;
    /**
     * 检查浏览器是否支持下载
     */
    static isDownloadSupported(): boolean;
    /**
     * 获取支持的打印格式
     */
    static getSupportedFormats(): string[];
    /**
     * 销毁管理器
     */
    destroy(): void;
}
//# sourceMappingURL=print-download-manager.d.ts.map