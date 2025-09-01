/**
 * PDF处理工具函数
 * 提供PDF相关的实用功能
 */
import type { PDFPageProxy } from 'pdfjs-dist';
import type { ZoomMode, RotationAngle, ThumbnailOptions } from '../core/types';
/**
 * 计算适合容器的缩放比例
 */
export declare function calculateFitScale(pageWidth: number, pageHeight: number, containerWidth: number, containerHeight: number, mode: ZoomMode, padding?: number): number;
/**
 * 获取页面的实际尺寸（考虑旋转）
 */
export declare function getRotatedPageSize(width: number, height: number, rotation: RotationAngle): {
    width: number;
    height: number;
};
/**
 * 创建缩略图
 */
export declare function createThumbnail(page: PDFPageProxy, options?: ThumbnailOptions): Promise<HTMLCanvasElement>;
/**
 * 将canvas转换为Blob
 */
export declare function canvasToBlob(canvas: HTMLCanvasElement, type?: string, quality?: number): Promise<Blob>;
/**
 * 将canvas转换为DataURL
 */
export declare function canvasToDataURL(canvas: HTMLCanvasElement, type?: string, quality?: number): string;
/**
 * 下载canvas为图片
 */
export declare function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string, type?: string): Promise<void>;
/**
 * 获取页面文本内容
 */
export declare function getPageTextContent(page: PDFPageProxy): Promise<string>;
/**
 * 在文本中搜索关键词
 */
export declare function searchInText(text: string, query: string, caseSensitive?: boolean, wholeWords?: boolean): Array<{
    index: number;
    length: number;
    match: string;
}>;
/**
 * 高亮显示搜索结果
 */
export declare function highlightSearchResults(text: string, results: Array<{
    index: number;
    length: number;
    match: string;
}>, highlightClass?: string): string;
/**
 * 计算页面在容器中的居中位置
 */
export declare function calculateCenterPosition(pageWidth: number, pageHeight: number, containerWidth: number, containerHeight: number): {
    x: number;
    y: number;
};
/**
 * 限制数值在指定范围内
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * 防抖函数
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 生成唯一ID
 */
export declare function generateId(prefix?: string): string;
/**
 * 检查元素是否在视口中
 */
export declare function isElementInViewport(element: HTMLElement): boolean;
/**
 * 平滑滚动到元素
 */
export declare function scrollToElement(element: HTMLElement, behavior?: ScrollBehavior): void;
//# sourceMappingURL=pdf-utils.d.ts.map