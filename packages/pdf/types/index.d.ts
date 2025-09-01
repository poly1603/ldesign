/**
 * @ldesign/pdf - PDF预览器库
 *
 * 一个功能完整的PDF预览器库，支持多种框架集成
 * 提供PDF文档加载、页面渲染、缩放、旋转、搜索等功能
 */
export type { PdfInput, RenderMode, ZoomMode, RotationAngle, PdfPageInfo, PdfDocumentInfo, RenderOptions, SearchOptions, SearchResult, ThumbnailOptions, PrintOptions, DownloadOptions, PdfViewerConfig, PdfViewerEvents, PdfViewerState, IPdfViewer, IPdfPageRenderer, IPdfDocumentManager, } from './core/types';
export { PdfViewer } from './core/pdf-viewer';
export { PdfDocumentManager } from './core/document-manager';
export { PdfPageRenderer } from './core/page-renderer';
export { EventManager } from './core/event-manager';
export { isValidPdfInput, isPdfFile, isPdfUrl, fileToArrayBuffer, arrayBufferToUint8Array, isPdfArrayBuffer, formatFileSize, getFileNameFromUrl, validateAndNormalizePdfInput, createDownloadUrl, revokeDownloadUrl, isBrowserSupportPdf, getBrowserInfo, } from './utils/file-utils';
export { CacheManager, PdfPageCacheManager, RenderCacheManager, ThumbnailCacheManager, } from './utils/cache-manager';
export declare function createPdfViewer(config: import('./core/types').PdfViewerConfig): import('./core/types').IPdfViewer;
export declare const version = "0.1.0";
declare const _default: {
    PdfViewer: any;
    createPdfViewer: typeof createPdfViewer;
    version: string;
};
export default _default;
//# sourceMappingURL=index.d.ts.map