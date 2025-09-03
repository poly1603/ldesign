/**
 * 文件处理工具
 *
 * @description
 * 提供文件上传、下载、图片处理、Excel/CSV 导入导出等功能。
 * 支持文件类型检测、大小限制、格式转换等。
 */
/**
 * 文件上传配置
 */
export interface FileUploadConfig {
    /** 允许的文件类型 */
    accept?: string[];
    /** 最大文件大小（字节） */
    maxSize?: number;
    /** 是否允许多选 */
    multiple?: boolean;
    /** 上传前的处理函数 */
    beforeUpload?: (file: File) => boolean | Promise<boolean>;
    /** 上传进度回调 */
    onProgress?: (percent: number, file: File) => void;
    /** 上传成功回调 */
    onSuccess?: (response: any, file: File) => void;
    /** 上传失败回调 */
    onError?: (error: Error, file: File) => void;
}
/**
 * 获取文件扩展名
 *
 * @param filename - 文件名
 * @returns 文件扩展名（小写）
 *
 * @example
 * ```typescript
 * getFileExtension('document.pdf') // 'pdf'
 * getFileExtension('image.JPEG') // 'jpeg'
 * getFileExtension('file') // ''
 * ```
 */
export declare function getFileExtension(filename: string): string;
/**
 * 获取文件类型
 *
 * @param filename - 文件名
 * @returns 文件类型
 *
 * @example
 * ```typescript
 * getFileType('photo.jpg') // 'image'
 * getFileType('video.mp4') // 'video'
 * getFileType('document.pdf') // 'document'
 * getFileType('unknown.xyz') // 'unknown'
 * ```
 */
export declare function getFileType(filename: string): string;
/**
 * 验证文件类型
 *
 * @param file - 文件对象
 * @param allowedTypes - 允许的文件类型
 * @returns 是否为允许的文件类型
 *
 * @example
 * ```typescript
 * validateFileType(file, ['jpg', 'png']) // true/false
 * validateFileType(file, ['image']) // 验证是否为图片类型
 * ```
 */
export declare function validateFileType(file: File, allowedTypes: string[]): boolean;
/**
 * 验证文件大小
 *
 * @param file - 文件对象
 * @param maxSize - 最大文件大小（字节）
 * @returns 是否符合大小限制
 *
 * @example
 * ```typescript
 * validateFileSize(file, 1024 * 1024) // 限制1MB
 * validateFileSize(file, 5 * 1024 * 1024) // 限制5MB
 * ```
 */
export declare function validateFileSize(file: File, maxSize: number): boolean;
/**
 * 读取文件内容
 *
 * @param file - 文件对象
 * @param readAs - 读取方式
 * @returns Promise<读取结果>
 *
 * @example
 * ```typescript
 * const text = await readFile(file, 'text')
 * const dataUrl = await readFile(file, 'dataURL')
 * const arrayBuffer = await readFile(file, 'arrayBuffer')
 * ```
 */
export declare function readFile(file: File, readAs?: 'text' | 'dataURL' | 'arrayBuffer' | 'binaryString'): Promise<string | ArrayBuffer>;
/**
 * 下载文件
 *
 * @param data - 文件数据
 * @param filename - 文件名
 * @param mimeType - MIME类型
 *
 * @example
 * ```typescript
 * downloadFile('Hello World', 'hello.txt', 'text/plain')
 * downloadFile(blob, 'image.png', 'image/png')
 * downloadFile(arrayBuffer, 'data.bin', 'application/octet-stream')
 * ```
 */
export declare function downloadFile(data: string | Blob | ArrayBuffer, filename: string, mimeType?: string): void;
/**
 * 压缩图片
 *
 * @param file - 图片文件
 * @param options - 压缩选项
 * @returns Promise<压缩后的文件>
 *
 * @example
 * ```typescript
 * const compressedFile = await compressImage(file, {
 *   maxWidth: 800,
 *   maxHeight: 600,
 *   quality: 0.8
 * })
 * ```
 */
export declare function compressImage(file: File, options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    outputFormat?: 'jpeg' | 'png' | 'webp';
}): Promise<File>;
/**
 * 创建文件选择器
 *
 * @param config - 配置选项
 * @returns Promise<选择的文件>
 *
 * @example
 * ```typescript
 * const files = await selectFiles({
 *   accept: ['image'],
 *   multiple: true,
 *   maxSize: 5 * 1024 * 1024
 * })
 * ```
 */
export declare function selectFiles(config?: FileUploadConfig): Promise<File[]>;
/**
 * 数组转CSV
 *
 * @param data - 数据数组
 * @param options - 选项
 * @returns CSV字符串
 *
 * @example
 * ```typescript
 * const csv = arrayToCSV([
 *   { name: '张三', age: 25, city: '北京' },
 *   { name: '李四', age: 30, city: '上海' }
 * ])
 * ```
 */
export declare function arrayToCSV(data: Record<string, any>[], options?: {
    headers?: string[];
    delimiter?: string;
    includeHeaders?: boolean;
}): string;
/**
 * CSV转数组
 *
 * @param csv - CSV字符串
 * @param options - 选项
 * @returns 数据数组
 *
 * @example
 * ```typescript
 * const data = csvToArray('name,age\n张三,25\n李四,30')
 * // [{ name: '张三', age: '25' }, { name: '李四', age: '30' }]
 * ```
 */
export declare function csvToArray(csv: string, options?: {
    delimiter?: string;
    hasHeaders?: boolean;
    headers?: string[];
}): Record<string, string>[];
/**
 * 导出CSV文件
 *
 * @param data - 数据数组
 * @param filename - 文件名
 * @param options - 选项
 *
 * @example
 * ```typescript
 * exportCSV(data, 'users.csv', {
 *   headers: ['姓名', '年龄', '城市']
 * })
 * ```
 */
export declare function exportCSV(data: Record<string, any>[], filename: string, options?: Parameters<typeof arrayToCSV>[1]): void;
/**
 * 获取文件的Base64编码
 *
 * @param file - 文件对象
 * @returns Promise<Base64字符串>
 *
 * @example
 * ```typescript
 * const base64 = await getFileBase64(file)
 * console.log(base64) // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
 * ```
 */
export declare function getFileBase64(file: File): Promise<string>;
//# sourceMappingURL=file.d.ts.map