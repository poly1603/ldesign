# 文件上传处理器使用指南

## 概述

编辑器现在支持在插入图片、视频、音频时自动上传文件到服务器，而不是使用本地的 data URL。这样可以：

- 减少编辑器内容的大小
- 文件持久化存储
- 便于分享和多端访问

## 配置上传处理器

在初始化编辑器时，通过 `uploadHandler` 选项配置文件上传处理器：

```typescript
import { Editor } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  uploadHandler: async (file, onProgress) => {
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)
    
    // 使用 XMLHttpRequest 实现带进度的上传
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      // 监听上传进度
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percent: Math.round((e.loaded / e.total) * 100)
          })
        }
      })
      
      // 监听完成
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          resolve(response.url) // 返回上传后的 URL
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })
      
      // 监听错误
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })
      
      // 发送请求
      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }
})
```

## 使用 fetch 的简单示例

如果不需要进度显示，可以使用更简单的 fetch 实现：

```typescript
const editor = new Editor({
  element: '#editor',
  uploadHandler: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    const data = await response.json()
    return data.url // 返回上传后的 URL
  }
})
```

## 服务端示例

### Node.js + Express + Multer

```javascript
const express = require('express')
const multer = require('multer')
const path = require('path')

const app = express()

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// 上传接口
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  
  // 返回文件的访问 URL
  const url = `/uploads/${req.file.filename}`
  res.json({ url })
})

// 静态文件服务
app.use('/uploads', express.static('uploads'))

app.listen(3000)
```

## 与云存储服务集成

### 阿里云 OSS

```typescript
import OSS from 'ali-oss'

const client = new OSS({
  region: 'oss-cn-hangzhou',
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  bucket: 'your-bucket-name'
})

const editor = new Editor({
  element: '#editor',
  uploadHandler: async (file, onProgress) => {
    const fileName = `uploads/${Date.now()}-${file.name}`
    
    const result = await client.put(fileName, file, {
      progress: (p) => {
        if (onProgress) {
          onProgress({
            loaded: Math.round(p * file.size),
            total: file.size,
            percent: Math.round(p * 100)
          })
        }
      }
    })
    
    return result.url
  }
})
```

### 腾讯云 COS

```typescript
import COS from 'cos-js-sdk-v5'

const cos = new COS({
  SecretId: 'your-secret-id',
  SecretKey: 'your-secret-key'
})

const editor = new Editor({
  element: '#editor',
  uploadHandler: async (file, onProgress) => {
    const fileName = `uploads/${Date.now()}-${file.name}`
    
    return new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: 'your-bucket',
        Region: 'ap-guangzhou',
        Key: fileName,
        Body: file,
        onProgress: (progressData) => {
          if (onProgress) {
            onProgress({
              loaded: progressData.loaded,
              total: progressData.total,
              percent: Math.round(progressData.percent * 100)
            })
          }
        }
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(`https://${data.Location}`)
        }
      })
    })
  }
})
```

## TypeScript 类型定义

```typescript
interface UploadProgress {
  loaded: number  // 已上传字节数
  total: number   // 总字节数
  percent: number // 百分比 (0-100)
}

type UploadHandler = (
  file: File,
  onProgress?: (progress: UploadProgress) => void
) => Promise<string>
```

## 注意事项

1. **安全性**：确保服务端对上传的文件进行验证（类型、大小等）
2. **文件大小限制**：考虑设置合理的文件大小限制
3. **文件类型限制**：只允许上传特定类型的文件
4. **错误处理**：上传失败时要有适当的错误提示
5. **并发上传**：多个文件会顺序上传，避免服务器压力过大

## 不配置上传处理器的情况

如果没有配置 `uploadHandler`，编辑器会将文件转换为 data URL（base64 编码）直接嵌入到 HTML 中。这种方式：

- ✅ 不需要服务器支持
- ✅ 实现简单
- ❌ 会大幅增加 HTML 内容大小
- ❌ 不适合大文件
- ❌ 不便于分享和多端访问

**建议**：生产环境中务必配置上传处理器。
