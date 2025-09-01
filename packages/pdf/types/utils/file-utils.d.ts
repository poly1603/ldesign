/**
 * 文件处理工具函数
 * 提供文件类型检测、转换等功能
 */
import type { PdfInput } from '../core/types';
/**
 * 检查输入是否为有效的PDF数据
 */
export declare function isValidPdfInput(input: unknown): input is PdfInput;
/**
 * 检查文件是否为PDF格式
 */
export declare function isPdfFile(file: File): boolean;
/**
 * 检查URL是否指向PDF文件
 */
export declare function isPdfUrl(url: string): boolean;
/**
 * 将File对象转换为ArrayBuffer
 */
export declare function fileToArrayBuffer(file: File): Promise<ArrayBuffer>;
/**
 * 将ArrayBuffer转换为Uint8Array
 */
export declare function arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array;
/**
 * 检查ArrayBuffer是否为PDF格式
 */
export declare function isPdfArrayBuffer(buffer: ArrayBuffer): boolean;
/**
 * 获取文件大小的可读格式
 */
export declare function formatFileSize(bytes: number): string;
/**
 * 从URL获取文件名
 */
export declare function getFileNameFromUrl(url: string): string;
/**
 * 验证PDF输入并返回标准化的数据
 */
export declare function validateAndNormalizePdfInput(input: PdfInput): Promise<{
    data: string | ArrayBuffer | Uint8Array;
    type: 'url' | 'file' | 'buffer';
    size?: number;
    name?: string;
}>;
/**
 * 创建用于下载的Blob URL
 */
export declare function createDownloadUrl(data: ArrayBuffer | Uint8Array, filename: string): string;
/**
 * 清理Blob URL
 */
export declare function revokeDownloadUrl(url: string): void;
/**
 * 检查浏览器是否支持PDF预览
 */
export declare function isBrowserSupportPdf(): boolean;
/**
 * 获取浏览器信息
 */
export declare function getBrowserInfo(): {
    name: string;
    version: string;
    isSupported: boolean;
};
//# sourceMappingURL=file-utils.d.ts.map