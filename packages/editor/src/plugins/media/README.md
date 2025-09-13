# 媒体插件 (MediaPlugin)

完整的媒体文件管理解决方案，支持图片、视频、音频等多种媒体类型的上传、管理和插入功能。

## 功能特性

### 🖼️ 多媒体支持
- **图片格式**: JPG, JPEG, PNG, GIF, WebP, SVG
- **视频格式**: MP4, WebM, OGG, AVI, MOV
- **音频格式**: MP3, WAV, OGG, AAC, FLAC

### 📤 上传功能
- 拖拽上传支持
- 批量文件上传
- 实时上传进度
- 文件验证和错误处理
- 自动压缩和尺寸调整

### 📚 媒体库管理
- 集中媒体文件管理
- 搜索和筛选功能
- 预览和详细信息
- 批量操作支持
- 本地存储同步

### ⚡ 高级功能
- 图片自动压缩
- 响应式设计
- 可配置的文件限制
- 多种存储方式
- 自定义上传处理器

## 安装和使用

### 基础用法

```typescript
import { createMediaPlugin, LDesignEditor } from '@ldesign/editor'

// 创建媒体插件
const mediaPlugin = createMediaPlugin()

// 创建编辑器实例
const editor = new LDesignEditor({
  container: '#editor',
  plugins: [mediaPlugin]
})

editor.init()
```

### 自定义配置

```typescript
import { createMediaPlugin } from '@ldesign/editor'

const mediaPlugin = createMediaPlugin({
  // 支持的媒体类型
  supportedTypes: ['image', 'video', 'audio'],
  
  // 最大文件大小 (20MB)
  maxFileSize: 20 * 1024 * 1024,
  
  // 允许的文件格式
  allowedFormats: {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    video: ['mp4', 'webm', 'mov'],
    audio: ['mp3', 'wav', 'ogg']
  },
  
  // 压缩设置
  compression: {
    enabled: true,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  },
  
  // 存储配置
  storage: {
    type: 'dataurl' // 'dataurl' | 'blob' | 'server'
  },
  
  // 自定义上传处理器
  uploadHandler: async (files) => {
    // 自定义上传逻辑
    const results = []
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      results.push({
        id: data.id,
        name: file.name,
        type: detectMediaType(file),
        size: file.size,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl
      })
    }
    return results
  }
})
```

### 使用预设配置

插件提供了多种预设配置，可以快速应用到不同的使用场景：

```typescript
import { createMediaPlugin, MediaPresets } from '@ldesign/editor'

// 仅支持图片
const imageOnlyPlugin = createMediaPlugin(MediaPresets.imageOnly)

// 高质量图片配置
const highQualityPlugin = createMediaPlugin(MediaPresets.highQualityImage)

// 视频重点配置
const videoFocusedPlugin = createMediaPlugin(MediaPresets.videoFocused)

// 音频重点配置
const audioFocusedPlugin = createMediaPlugin(MediaPresets.audioFocused)

// 紧凑配置
const compactPlugin = createMediaPlugin(MediaPresets.compact)
```

## 配置选项

### MediaConfig

```typescript
interface MediaConfig {
  /** 支持的媒体类型 */
  supportedTypes: MediaType[]
  
  /** 最大文件大小（字节） */
  maxFileSize: number
  
  /** 允许的文件格式 */
  allowedFormats?: {
    [key in MediaType]?: string[]
  }
  
  /** 上传处理器 */
  uploadHandler?: UploadHandler
  
  /** 压缩配置 */
  compression?: {
    enabled: boolean
    quality: number
    maxWidth: number
    maxHeight: number
  }
  
  /** 存储配置 */
  storage?: {
    type: 'dataurl' | 'blob' | 'server'
    serverConfig?: {
      uploadUrl: string
      headers?: Record<string, string>
    }
  }
}
```

### 媒体类型

```typescript
type MediaType = 'image' | 'video' | 'audio'
```

### 媒体文件接口

```typescript
interface MediaFile {
  /** 文件ID */
  id: string
  /** 文件名 */
  name: string
  /** 媒体类型 */
  type: MediaType
  /** MIME类型 */
  mimeType: string
  /** 文件大小 */
  size: number
  /** 文件URL */
  url: string
  /** 缩略图URL */
  thumbnailUrl?: string
  /** 上传时间 */
  uploadTime: Date
  /** 元数据 */
  metadata?: Record<string, any>
}
```

## 工具函数

插件还提供了一些实用的工具函数：

```typescript
import {
  formatFileSize,
  detectMediaType,
  isFileSupported,
  getFileExtension
} from '@ldesign/editor'

// 格式化文件大小
const sizeText = formatFileSize(1024 * 1024) // "1 MB"

// 检测媒体类型
const file = new File([''], 'image.jpg', { type: 'image/jpeg' })
const mediaType = detectMediaType(file) // "image"

// 检查文件是否支持
const isSupported = isFileSupported(file, config) // true/false

// 获取文件扩展名
const ext = getFileExtension('image.jpg') // "jpg"
```

## 命令和工具栏

插件会自动注册以下命令和工具栏项：

### 命令
- `insertImage`: 插入图片
- `insertVideo`: 插入视频
- `insertAudio`: 插入音频
- `uploadMedia`: 上传媒体文件
- `openMediaLibrary`: 打开媒体库

### 工具栏项
- `image`: 插入图片按钮
- `video`: 插入视频按钮
- `audio`: 插入音频按钮
- `upload`: 上传媒体按钮
- `mediaLibrary`: 媒体库按钮

## 事件

插件会触发以下事件：

```typescript
// 媒体文件上传完成
editor.events.on('mediaUploaded', (data) => {
  console.log('媒体上传完成:', data.files)
})

// 媒体文件插入
editor.events.on('mediaInserted', (data) => {
  console.log('媒体插入:', data.media)
})

// 媒体文件删除
editor.events.on('mediaDeleted', (data) => {
  console.log('媒体删除:', data.id)
})

// 媒体库更新
editor.events.on('mediaLibraryUpdated', (data) => {
  console.log('媒体库更新:', data.library)
})
```

## 样式定制

插件使用了 CSS 变量，可以轻松定制样式：

```css
:root {
  --ldesign-media-primary-color: #722ED1;
  --ldesign-media-border-color: #d9d9d9;
  --ldesign-media-hover-color: #f6f0ff;
  --ldesign-media-success-color: #52c41a;
  --ldesign-media-error-color: #ff4d4f;
}

/* 自定义媒体元素样式 */
.ldesign-media-image {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ldesign-media-video {
  border-radius: 8px;
  overflow: hidden;
}
```

## 性能优化

### 图片压缩
插件支持自动图片压缩，可以显著减小文件大小：

```typescript
const mediaPlugin = createMediaPlugin({
  compression: {
    enabled: true,
    quality: 0.8,      // 压缩质量 (0.1-1.0)
    maxWidth: 1920,    // 最大宽度
    maxHeight: 1080    // 最大高度
  }
})
```

### 懒加载
对于大量媒体文件，建议启用懒加载：

```typescript
const mediaPlugin = createMediaPlugin({
  lazyLoad: true,
  loadingPlaceholder: 'data:image/svg+xml;base64,...'
})
```

## 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 注意事项

1. **文件大小限制**: 默认最大文件大小为10MB，可以通过配置调整
2. **CORS设置**: 如果使用服务器上传，确保正确配置CORS
3. **内存使用**: 大文件上传可能占用较多内存，建议合理设置文件大小限制
4. **浏览器兼容**: 某些较老的浏览器可能不支持所有文件格式

## 示例

查看完整的使用示例：
- [基础示例](../../../examples/media-demo.html)
- [React 集成](../../../examples/react-example.html)
- [Vue 集成](../../../examples/vue-example.html)

## 许可证

MIT License
