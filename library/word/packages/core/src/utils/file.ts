/**
 * 文件处理工具
 */

import { SUPPORTED_FILE_TYPES, SUPPORTED_EXTENSIONS } from '../core/constants';

/**
 * 检查文件类型是否支持
 */
export function isSupportedFile(file: File): boolean {
  const supportedTypes = Object.values(SUPPORTED_FILE_TYPES);
  
  // 检查 MIME 类型
  if (supportedTypes.includes(file.type)) {
    return true;
  }

  // 检查文件扩展名
  const fileName = file.name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

/**
 * 读取文件为 ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 从 URL 加载文件
 */
export async function loadFileFromUrl(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    throw new Error(`加载文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 将 Blob 转换为 ArrayBuffer
 */
export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('转换 Blob 失败'));
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * 下载文件
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
}

/**
 * 检查是否为 DOCX 格式
 */
export function isDocx(file: File | string): boolean {
  if (typeof file === 'string') {
    return file.toLowerCase().endsWith('.docx');
  }
  return (
    file.type === SUPPORTED_FILE_TYPES.DOCX ||
    file.name.toLowerCase().endsWith('.docx')
  );
}

/**
 * 检查是否为 DOC 格式
 */
export function isDoc(file: File | string): boolean {
  if (typeof file === 'string') {
    return file.toLowerCase().endsWith('.doc');
  }
  return (
    file.type === SUPPORTED_FILE_TYPES.DOC ||
    file.name.toLowerCase().endsWith('.doc')
  );
}


