/**
 * 媒体插件模块
 * 导出所有媒体相关的插件
 */

// 原有的插件
export { ImagePlugin } from './image-plugin'
export type { ImageConfig, ImageAlignment } from './image-plugin'

export { LinkPlugin } from './link-plugin'
export type { LinkConfig } from './link-plugin'

// 新的完整媒体插件
export { MediaPlugin } from './media-plugin';
export type {
  MediaType,
  MediaFile,
  MediaConfig,
  UploadHandler
} from './media-plugin';

// 导出默认配置
export const defaultMediaConfig = {
  supportedTypes: ['image', 'video', 'audio'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    video: ['mp4', 'webm', 'ogg', 'avi', 'mov'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'flac']
  },
  compression: {
    enabled: true,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  },
  storage: {
    type: 'dataurl' as const
  }
};

// 创建媒体插件实例的工厂函数
export function createMediaPlugin(config?: Partial<MediaConfig>) {
  return new MediaPlugin({
    ...defaultMediaConfig,
    ...config
  });
}

// 便捷的预设配置
export const MediaPresets = {
  // 基础配置 - 支持所有媒体类型
  basic: {
    supportedTypes: ['image', 'video', 'audio'],
    maxFileSize: 10 * 1024 * 1024
  },
  
  // 仅图片配置
  imageOnly: {
    supportedTypes: ['image'],
    maxFileSize: 5 * 1024 * 1024,
    allowedFormats: {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
  },
  
  // 高质量图片配置
  highQualityImage: {
    supportedTypes: ['image'],
    maxFileSize: 20 * 1024 * 1024,
    compression: {
      enabled: true,
      quality: 0.9,
      maxWidth: 3840,
      maxHeight: 2160
    }
  },
  
  // 视频重点配置
  videoFocused: {
    supportedTypes: ['video', 'image'],
    maxFileSize: 50 * 1024 * 1024,
    allowedFormats: {
      image: ['jpg', 'jpeg', 'png'],
      video: ['mp4', 'webm']
    }
  },
  
  // 音频重点配置
  audioFocused: {
    supportedTypes: ['audio', 'image'],
    maxFileSize: 20 * 1024 * 1024,
    allowedFormats: {
      image: ['jpg', 'jpeg', 'png'],
      audio: ['mp3', 'wav', 'ogg']
    }
  },
  
  // 紧凑配置 - 较小文件尺寸限制
  compact: {
    supportedTypes: ['image'],
    maxFileSize: 2 * 1024 * 1024,
    compression: {
      enabled: true,
      quality: 0.7,
      maxWidth: 1280,
      maxHeight: 720
    }
  }
} as const;

// 工具函数 - 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 工具函数 - 检测媒体类型
export function detectMediaType(file: File): MediaType | null {
  const type = file.type.toLowerCase();
  
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';  
  if (type.startsWith('audio/')) return 'audio';
  
  // 基于文件扩展名的备用检测
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
  const videoExts = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'm4a'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  
  return null;
}

// 工具函数 - 检查文件是否被支持
export function isFileSupported(file: File, config: MediaConfig): boolean {
  const mediaType = detectMediaType(file);
  if (!mediaType || !config.supportedTypes.includes(mediaType)) {
    return false;
  }
  
  // 检查文件大小
  if (file.size > config.maxFileSize) {
    return false;
  }
  
  // 检查文件格式
  if (config.allowedFormats && config.allowedFormats[mediaType]) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExts = config.allowedFormats[mediaType] || [];
    if (!allowedExts.includes(ext)) {
      return false;
    }
  }
  
  return true;
}

// 工具函数 - 获取文件扩展名
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// 工具函数 - 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
