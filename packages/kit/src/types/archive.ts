/**
 * Archive 模块类型定义
 */

// 压缩算法类型
export type CompressionAlgorithm = 'gzip' | 'deflate' | 'brotli'

// 压缩级别类型
export type CompressionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

// 基础压缩包选项
export interface ArchiveOptions {
  compressionLevel?: CompressionLevel
  preservePermissions?: boolean
  preserveTimestamps?: boolean
  followSymlinks?: boolean
  ignoreHidden?: boolean
  maxFileSize?: number
  password?: string
}

// 压缩选项
export interface CompressionOptions extends ArchiveOptions {
  gzip?: boolean
  comment?: string
}

// 解压选项
export interface ExtractionOptions extends ArchiveOptions {
  overwrite?: boolean
  createDirectories?: boolean
  filter?: (entry: ArchiveEntry) => boolean
}

// TAR 选项
export interface TarOptions extends ArchiveOptions {
  gzip?: boolean
}

// ZIP 选项
export interface ZipOptions extends ArchiveOptions {
  comment?: string
}

// 压缩包条目
export interface ArchiveEntry {
  name: string
  size: number
  type: 'file' | 'directory'
  compressedSize?: number
  lastModified?: Date
  crc32?: number
  permissions?: number
}

// 压缩进度
export interface ArchiveProgress {
  processedFiles: number
  totalFiles: number
  processedBytes: number
  totalBytes: number
  percentage: number
}

// 压缩统计
export interface ArchiveStats {
  totalFiles: number
  totalSize: number
  compressedSize: number
  compressionRatio: number
  startTime: Date
  endTime: Date
  duration: number
}
