# 最佳实践指南

## 性能优化

### 1. 缓存策略

#### 启用缓存
```javascript
// 推荐：启用缓存以提高性能
const generator = new QRCodeGenerator({
  performance: {
    enableCache: true,
    cacheSize: 100  // 根据应用需求调整
  }
})
```

#### 缓存管理
```javascript
// 定期清理缓存
setInterval(() => {
  generator.clearCache()
}, 5 * 60 * 1000)  // 每5分钟清理一次

// 监控缓存使用情况
const metrics = generator.getPerformanceMetrics()
console.log('缓存命中率:', metrics.cacheHitRate)
```

### 2. 格式选择

#### 根据用途选择格式
```javascript
// Canvas - 适合需要像素级操作的场景
const canvasResult = await generateQRCode(text, {
  format: 'canvas',
  size: 200
})

// SVG - 适合响应式设计和矢量图形
const svgResult = await generateQRCode(text, {
  format: 'svg',
  size: 200
})

// Image - 适合需要直接显示的场景
const imageResult = await generateQRCode(text, {
  format: 'image',
  size: 200
})
```

#### 框架特定推荐
```javascript
// Vue - 推荐使用SVG
const vueConfig = getFrameworkBestPractices('vue')
// { format: 'svg', size: 200, margin: 4 }

// React - 推荐使用Canvas
const reactConfig = getFrameworkBestPractices('react')
// { format: 'canvas', size: 200, margin: 4 }

// Angular - 推荐使用SVG
const angularConfig = getFrameworkBestPractices('angular')
// { format: 'svg', size: 200, margin: 4 }
```

### 3. 批量处理优化

#### 并行生成
```javascript
// 推荐：使用并行处理
const texts = ['text1', 'text2', 'text3']
const results = await Promise.all(
  texts.map(text => generateQRCode(text, options))
)

// 避免：串行处理
// for (const text of texts) {
//   await generateQRCode(text, options)  // 慢
// }
```

#### 批量API
```javascript
// 推荐：使用专门的批量API
const results = await generateQRCodeBatch(texts, options)

// 或者使用生成器的批量方法
const generator = new SimpleQRCodeGenerator(options)
const results = await Promise.all(
  texts.map(text => generator.generate(text))
)
generator.destroy()  // 记得清理
```

### 4. 内存管理

#### 及时清理资源
```javascript
// 推荐：使用完毕后清理
const generator = new QRCodeGenerator(options)
try {
  const result = await generator.generate(text)
  // 使用结果...
} finally {
  generator.destroy()  // 清理资源
}

// 或者使用工厂函数
const result = await generateQRCode(text, options)  // 自动清理
```

#### 监控内存使用
```javascript
const monitor = new PerformanceMonitor()
const id = monitor.start('qr-generation')

const result = await generateQRCode(text, options)

const metric = monitor.end(id)
console.log(`内存使用: ${metric.memory}MB`)

// 如果内存使用过高，考虑减少缓存大小或清理缓存
if (metric.memory > 50) {  // 50MB阈值
  generator.clearCache()
}
```

## 错误处理

### 1. 基础错误处理

#### 捕获和处理错误
```javascript
try {
  const result = await generateQRCode(text, options)
  // 处理成功结果
} catch (error) {
  // 根据错误类型进行处理
  switch (error.code) {
    case 'INVALID_TEXT':
      console.error('文本无效:', error.message)
      break
    case 'INVALID_OPTIONS':
      console.error('选项无效:', error.message)
      break
    case 'GENERATION_FAILED':
      console.error('生成失败:', error.message)
      break
    default:
      console.error('未知错误:', error.message)
  }
}
```

#### 验证输入
```javascript
// 推荐：生成前验证输入
function validateInput(text, options) {
  if (!text || typeof text !== 'string') {
    throw createError('Text must be a non-empty string', 'INVALID_TEXT')
  }
  
  if (text.length > 4296) {  // QR码最大容量
    throw createError('Text too long for QR code', 'TEXT_TOO_LONG')
  }
  
  const validation = validateOptions(options)
  if (!validation.valid) {
    throw createError(validation.errors.join(', '), 'INVALID_OPTIONS')
  }
}

// 使用验证
try {
  validateInput(text, options)
  const result = await generateQRCode(text, options)
} catch (error) {
  // 处理验证错误
}
```

### 2. 框架特定错误处理

#### Vue错误处理
```vue
<template>
  <div>
    <QRCode 
      :text="qrText"
      @error="handleError"
      @generated="handleSuccess"
    />
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const errorMessage = ref('')

const handleError = (error) => {
  errorMessage.value = `生成失败: ${error.message}`
  
  // 根据错误类型采取不同措施
  if (error.code === 'INVALID_TEXT') {
    // 提示用户输入有效文本
  } else if (error.code === 'NETWORK_ERROR') {
    // 重试机制
    setTimeout(() => {
      // 重新生成
    }, 2000)
  }
}

const handleSuccess = () => {
  errorMessage.value = ''
}
</script>
```

#### React错误边界
```jsx
// ErrorBoundary.jsx
import React from 'react'

class QRCodeErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('QR Code Error:', error, errorInfo)
    
    // 发送错误报告
    this.reportError(error, errorInfo)
  }

  reportError(error, errorInfo) {
    // 发送到错误监控服务
    // analytics.reportError(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="qr-error">
          <h3>二维码生成失败</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 使用错误边界
function App() {
  return (
    <QRCodeErrorBoundary>
      <QRCode text="Hello World" />
    </QRCodeErrorBoundary>
  )
}
```

#### Angular错误处理
```typescript
// error-handler.service.ts
import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { catchError, retry } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class QRCodeErrorHandler {
  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error)
      
      // 发送错误到监控服务
      this.reportError(error, operation)
      
      // 返回默认结果
      return of(result as T)
    }
  }

  private reportError(error: any, operation: string) {
    // 实现错误报告逻辑
  }
}

// 在组件中使用
export class QRCodeComponent {
  constructor(
    private qrService: QRCodeService,
    private errorHandler: QRCodeErrorHandler
  ) {}

  generateQRCode(text: string) {
    this.qrService.generate(text)
      .pipe(
        retry(3),  // 重试3次
        catchError(this.errorHandler.handleError('generateQRCode'))
      )
      .subscribe({
        next: (result) => {
          // 处理成功结果
        },
        error: (error) => {
          // 处理最终错误
        }
      })
  }
}
```

### 3. 网络错误处理

#### 离线检测
```javascript
// 检测网络状态
function isOnline() {
  return navigator.onLine
}

// 监听网络状态变化
window.addEventListener('online', () => {
  console.log('网络已连接')
  // 重新尝试生成失败的二维码
})

window.addEventListener('offline', () => {
  console.log('网络已断开')
  // 显示离线提示
})

// 生成时检查网络状态
async function generateWithNetworkCheck(text, options) {
  if (!isOnline()) {
    throw createError('Network is offline', 'NETWORK_OFFLINE')
  }
  
  try {
    return await generateQRCode(text, options)
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      // 网络错误时的处理
      throw createError('Network error occurred', 'NETWORK_ERROR')
    }
    throw error
  }
}
```

## 跨框架兼容性

### 1. 框架检测和适配

#### 自动检测
```javascript
import { detectFramework, generateQRCodeAuto } from '@ldesign/qrcode'

// 自动检测当前框架
const detection = detectFramework()
console.log('当前框架:', detection.framework)

// 使用自动适配的生成函数
const result = await generateQRCodeAuto(text, {
  autoDetect: true,
  size: 200
})
```

#### 手动指定框架
```javascript
// 明确指定框架
const result = await generateQRCodeAuto(text, {
  framework: 'vue',
  size: 200
})
```

#### 兼容性检查
```javascript
import { checkFrameworkCompatibility } from '@ldesign/qrcode'

const compatibility = checkFrameworkCompatibility('react', ['ssr', 'logo'])

if (!compatibility.compatible) {
  console.warn('兼容性问题:', compatibility.issues)
  console.log('建议:', compatibility.recommendations)
}
```

### 2. SSR支持

#### 服务端渲染注意事项
```javascript
// 检查是否在浏览器环境
function isBrowser() {
  return typeof window !== 'undefined'
}

// SSR安全的生成函数
async function generateQRCodeSSR(text, options) {
  if (!isBrowser()) {
    // 服务端返回占位符
    return {
      data: '',
      element: null,
      format: options.format || 'canvas',
      size: options.size || 200,
      timestamp: Date.now(),
      isPlaceholder: true
    }
  }
  
  // 客户端正常生成
  return await generateQRCode(text, options)
}
```

#### Next.js集成
```jsx
// components/QRCode.jsx
import dynamic from 'next/dynamic'

// 动态导入，禁用SSR
const QRCodeComponent = dynamic(
  () => import('@ldesign/qrcode/react').then(mod => mod.QRCode),
  { ssr: false }
)

export default function QRCode(props) {
  return <QRCodeComponent {...props} />
}
```

#### Nuxt.js集成
```vue
<!-- components/QRCode.vue -->
<template>
  <div>
    <client-only>
      <QRCodeComponent v-bind="$attrs" />
    </client-only>
  </div>
</template>

<script>
export default {
  components: {
    QRCodeComponent: () => import('@ldesign/qrcode/vue')
  }
}
</script>
```

### 3. TypeScript支持

#### 类型安全
```typescript
import type { QRCodeOptions, QRCodeResult } from '@ldesign/qrcode'

// 严格类型检查
function createQRCodeConfig(
  text: string,
  size: number = 200
): QRCodeOptions {
  return {
    data: text,
    size,
    format: 'canvas',
    errorCorrectionLevel: 'M',
    color: {
      foreground: '#000000',
      background: '#ffffff'
    }
  }
}

// 类型守卫
function isQRCodeResult(obj: any): obj is QRCodeResult {
  return obj && 
         typeof obj.data === 'string' &&
         typeof obj.format === 'string' &&
         typeof obj.size === 'number' &&
         typeof obj.timestamp === 'number'
}
```

#### 泛型支持
```typescript
// 泛型工厂函数
function createFrameworkQRCode<T extends 'vue' | 'react' | 'angular'>(
  framework: T
): FrameworkQRCodeGenerator<T> {
  return createFrameworkFactory(framework)
}

// 使用泛型
const vueGenerator = createFrameworkQRCode('vue')
const reactGenerator = createFrameworkQRCode('react')
```

## 安全性

### 1. 输入验证

#### 文本内容验证
```javascript
function validateQRText(text) {
  // 检查文本长度
  if (text.length > 4296) {
    throw new Error('Text too long for QR code')
  }
  
  // 检查恶意内容
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i
  ]
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(text)) {
      throw new Error('Potentially malicious content detected')
    }
  }
  
  return true
}
```

#### URL验证
```javascript
function validateURL(url) {
  try {
    const parsed = new URL(url)
    
    // 只允许特定协议
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error('Protocol not allowed')
    }
    
    return true
  } catch (error) {
    throw new Error('Invalid URL format')
  }
}
```

### 2. 内容安全策略

#### CSP配置
```html
<!-- 添加CSP头部 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               img-src 'self' data: blob:; 
               script-src 'self' 'unsafe-inline';">
```

#### 安全的数据URL
```javascript
function createSecureDataURL(canvas) {
  // 验证canvas元素
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Invalid canvas element')
  }
  
  // 生成数据URL
  const dataURL = canvas.toDataURL('image/png')
  
  // 验证数据URL格式
  if (!dataURL.startsWith('data:image/png;base64,')) {
    throw new Error('Invalid data URL format')
  }
  
  return dataURL
}
```

### 3. 隐私保护

#### 避免敏感信息
```javascript
function sanitizeText(text) {
  // 移除可能的敏感信息
  const sensitivePatterns = [
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,  // 信用卡号
    /\b\d{3}-\d{2}-\d{4}\b/g,  // SSN
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g  // 邮箱
  ]
  
  let sanitized = text
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  }
  
  return sanitized
}
```

## 可访问性

### 1. 替代文本

#### 提供有意义的alt文本
```jsx
// React
<QRCode 
  text="https://example.com"
  alt="QR code linking to example.com"
/>

// 或者手动设置
<img 
  src={qrResult.data}
  alt={`QR code containing: ${qrText}`}
/>
```

#### 屏幕阅读器支持
```html
<!-- 添加ARIA标签 -->
<div 
  role="img" 
  aria-label="QR code for website URL"
  aria-describedby="qr-description">
  <!-- QR码内容 -->
</div>
<div id="qr-description" class="sr-only">
  Scan this QR code to visit our website
</div>
```

### 2. 键盘导航

#### 可聚焦的二维码
```css
.qrcode-container {
  /* 使二维码可聚焦 */
  tabindex: 0;
  outline: none;
}

.qrcode-container:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### 3. 高对比度支持

#### 响应系统主题
```css
@media (prefers-contrast: high) {
  .qrcode-container {
    /* 高对比度样式 */
    border: 2px solid #000;
  }
}

@media (prefers-color-scheme: dark) {
  .qrcode-container {
    /* 深色模式样式 */
    background-color: #1f2937;
    border-color: #374151;
  }
}
```
