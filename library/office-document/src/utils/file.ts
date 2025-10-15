/**
 * File utility functions
 */

import type { DocumentType } from '../types';
import { FILE_EXTENSIONS, MIME_TYPES, ERROR_MESSAGES } from '../constants';

/**
 * Detect document type from source
 */
export function detectDocumentType(
 source: string | File | Blob,
 explicitType?: DocumentType
): DocumentType {
 if (explicitType) return explicitType;

 let filename = '';
 let mimeType = '';

 if (typeof source === 'string') {
  filename = source.toLowerCase();
 } else if (source instanceof File) {
  filename = source.name.toLowerCase();
  mimeType = source.type;
 } else if (source instanceof Blob) {
  mimeType = source.type;
 }

 // Check by MIME type
 if (mimeType) {
  if (MIME_TYPES.WORD.some(type => mimeType.includes(type))) return 'word';
  if (MIME_TYPES.EXCEL.some(type => mimeType.includes(type))) return 'excel';
  if (MIME_TYPES.POWERPOINT.some(type => mimeType.includes(type))) return 'powerpoint';
 }

 // Check by file extension
 if (filename) {
  if (FILE_EXTENSIONS.WORD.some(ext => filename.endsWith(ext))) return 'word';
  if (FILE_EXTENSIONS.EXCEL.some(ext => filename.endsWith(ext))) return 'excel';
  if (FILE_EXTENSIONS.POWERPOINT.some(ext => filename.endsWith(ext))) return 'powerpoint';
 }

 throw new Error(ERROR_MESSAGES.UNSUPPORTED_FORMAT);
}

/**
 * Convert source to ArrayBuffer
 */
export async function sourceToArrayBuffer(
 source: string | File | ArrayBuffer | Blob
): Promise<ArrayBuffer> {
 if (source instanceof ArrayBuffer) {
  return source;
 }

 if (source instanceof Blob || source instanceof File) {
  return await source.arrayBuffer();
 }

 if (typeof source === 'string') {
  // Data URL
  if (source.startsWith('data:')) {
   const base64 = source.split(',')[1];
   const binaryString = atob(base64);
   const bytes = new Uint8Array(binaryString.length);
   for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
   }
   return bytes.buffer;
  }

  // URL
  const response = await fetch(source);
  if (!response.ok) {
   throw new Error(`${ERROR_MESSAGES.LOAD_FAILED}: ${response.statusText}`);
  }
  return await response.arrayBuffer();
 }

 throw new Error(ERROR_MESSAGES.INVALID_SOURCE);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
 if (bytes === 0) return '0 B';

 const k = 1024;
 const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));

 return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Download blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
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
 * Get file extension
 */
export function getFileExtension(filename: string): string {
 const index = filename.lastIndexOf('.');
 return index > 0 ? filename.substring(index) : '';
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
 return allowedTypes.some(type =>
  file.name.toLowerCase().endsWith(type) ||
  file.type.includes(type)
 );
}
