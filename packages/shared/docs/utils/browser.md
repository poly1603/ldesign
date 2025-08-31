# 浏览器相关

浏览器相关工具函数提供了与浏览器环境交互的实用功能，包括设备检测、剪贴板操作、文件下载等。

## 概述

浏览器相关模块包含以下功能：
- **设备检测**：获取设备类型、浏览器信息、操作系统等
- **剪贴板操作**：复制文本、读取剪贴板内容
- **文件操作**：文件下载、上传、预览等
- **URL 处理**：参数解析、路由操作等
- **存储检测**：检测存储可用性和容量

## 安装和导入

```typescript
// 按需导入
import { 
  getDeviceInfo, 
  getBrowserInfo, 
  copyToClipboard, 
  downloadFile,
  getUrlParams 
} from '@ldesign/shared'

// 或者导入整个浏览器模块
import { browser } from '@ldesign/shared'
```

## API 参考

### getDeviceInfo

获取设备信息。

**函数签名**
```typescript
interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  os: string
  osVersion: string
  screen: {
    width: number
    height: number
    pixelRatio: number
  }
  touch: boolean
  orientation?: 'portrait' | 'landscape'
}

function getDeviceInfo(): DeviceInfo
```

**返回值**
- `DeviceInfo` - 设备信息对象

**使用示例**

```typescript
// 获取设备信息
const deviceInfo = getDeviceInfo()
console.log(deviceInfo)
// {
//   type: 'desktop',
//   os: 'Windows',
//   osVersion: '10',
//   screen: {
//     width: 1920,
//     height: 1080,
//     pixelRatio: 1
//   },
//   touch: false
// }

// 根据设备类型调整界面
function adaptUIForDevice() {
  const device = getDeviceInfo()
  
  if (device.type === 'mobile') {
    document.body.classList.add('mobile-layout')
    // 启用移动端特定功能
  } else if (device.type === 'tablet') {
    document.body.classList.add('tablet-layout')
  } else {
    document.body.classList.add('desktop-layout')
  }
  
  // 根据屏幕像素比调整图片质量
  if (device.screen.pixelRatio > 1) {
    document.body.classList.add('high-dpi')
  }
}

// 实际应用：响应式组件
class ResponsiveComponent {
  private deviceInfo = getDeviceInfo()
  
  getColumnCount(): number {
    switch (this.deviceInfo.type) {
      case 'mobile': return 1
      case 'tablet': return 2
      case 'desktop': return this.deviceInfo.screen.width > 1400 ? 4 : 3
      default: return 3
    }
  }
  
  shouldShowSidebar(): boolean {
    return this.deviceInfo.type === 'desktop' && this.deviceInfo.screen.width > 1200
  }
  
  getImageSize(): 'small' | 'medium' | 'large' {
    if (this.deviceInfo.type === 'mobile') return 'small'
    if (this.deviceInfo.type === 'tablet') return 'medium'
    return 'large'
  }
}
```

### getBrowserInfo

获取浏览器信息。

**函数签名**
```typescript
interface BrowserInfo {
  name: string
  version: string
  engine: string
  platform: string
  language: string
  cookieEnabled: boolean
  onlineStatus: boolean
  features: {
    webGL: boolean
    webWorker: boolean
    serviceWorker: boolean
    localStorage: boolean
    sessionStorage: boolean
    indexedDB: boolean
    webRTC: boolean
  }
}

function getBrowserInfo(): BrowserInfo
```

**使用示例**

```typescript
// 获取浏览器信息
const browserInfo = getBrowserInfo()
console.log(browserInfo)

// 功能检测和降级处理
class FeatureDetector {
  checkCompatibility(): { compatible: boolean; issues: string[] } {
    const browser = getBrowserInfo()
    const issues: string[] = []
    
    if (!browser.features.localStorage) {
      issues.push('不支持本地存储')
    }
    
    if (!browser.features.webWorker) {
      issues.push('不支持 Web Worker')
    }
    
    if (!browser.features.serviceWorker) {
      issues.push('不支持 Service Worker')
    }
    
    return {
      compatible: issues.length === 0,
      issues
    }
  }
  
  enableFallbacks() {
    const browser = getBrowserInfo()
    
    if (!browser.features.localStorage) {
      // 使用内存存储作为降级方案
      this.setupMemoryStorage()
    }
    
    if (!browser.features.webWorker) {
      // 在主线程中执行任务
      this.setupMainThreadFallback()
    }
  }
  
  private setupMemoryStorage() {
    const memoryStorage = new Map<string, string>()
    
    window.localStorage = {
      getItem: (key: string) => memoryStorage.get(key) || null,
      setItem: (key: string, value: string) => memoryStorage.set(key, value),
      removeItem: (key: string) => memoryStorage.delete(key),
      clear: () => memoryStorage.clear(),
      length: memoryStorage.size,
      key: (index: number) => Array.from(memoryStorage.keys())[index] || null
    } as Storage
  }
  
  private setupMainThreadFallback() {
    // 主线程任务处理逻辑
  }
}
```

### copyToClipboard

复制文本到剪贴板。

**函数签名**
```typescript
function copyToClipboard(
  text: string,
  options?: {
    fallback?: boolean
    onSuccess?: () => void
    onError?: (error: Error) => void
  }
): Promise<boolean>
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| text | string | ✓ | - | 要复制的文本 |
| options | object | ✗ | {} | 复制选项 |

**使用示例**

```typescript
// 基础复制功能
async function handleCopy() {
  const success = await copyToClipboard('Hello, World!')
  
  if (success) {
    console.log('复制成功')
  } else {
    console.log('复制失败')
  }
}

// 带回调的复制
copyToClipboard('复制的内容', {
  onSuccess: () => {
    showToast('复制成功', 'success')
  },
  onError: (error) => {
    showToast('复制失败: ' + error.message, 'error')
  }
})

// 实际应用：代码复制组件
class CodeCopyButton {
  constructor(private codeElement: HTMLElement) {
    this.setupCopyButton()
  }
  
  private setupCopyButton() {
    const button = document.createElement('button')
    button.textContent = '复制'
    button.className = 'copy-button'
    
    button.addEventListener('click', async () => {
      const code = this.codeElement.textContent || ''
      
      button.textContent = '复制中...'
      button.disabled = true
      
      const success = await copyToClipboard(code, {
        onSuccess: () => {
          button.textContent = '已复制'
          setTimeout(() => {
            button.textContent = '复制'
            button.disabled = false
          }, 2000)
        },
        onError: () => {
          button.textContent = '复制失败'
          setTimeout(() => {
            button.textContent = '复制'
            button.disabled = false
          }, 2000)
        }
      })
    })
    
    this.codeElement.parentElement?.appendChild(button)
  }
}

// 分享功能
class ShareManager {
  async shareText(text: string, title?: string) {
    if (navigator.share) {
      try {
        await navigator.share({ text, title })
      } catch (error) {
        // 降级到复制
        await copyToClipboard(text)
        showToast('链接已复制到剪贴板')
      }
    } else {
      await copyToClipboard(text)
      showToast('链接已复制到剪贴板')
    }
  }
}
```

### downloadFile

下载文件。

**函数签名**
```typescript
function downloadFile(
  data: string | Blob | ArrayBuffer,
  filename: string,
  options?: {
    type?: string
    encoding?: string
  }
): void
```

**使用示例**

```typescript
// 下载文本文件
function downloadTextFile() {
  const content = 'Hello, World!\nThis is a text file.'
  downloadFile(content, 'hello.txt', { type: 'text/plain' })
}

// 下载 JSON 数据
function downloadJSON(data: any) {
  const jsonString = JSON.stringify(data, null, 2)
  downloadFile(jsonString, 'data.json', { type: 'application/json' })
}

// 下载 CSV 文件
function downloadCSV(data: any[]) {
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n')
  
  downloadFile(csvContent, 'export.csv', { type: 'text/csv' })
}

// 下载图片
async function downloadImage(imageUrl: string, filename: string) {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    downloadFile(blob, filename)
  } catch (error) {
    console.error('下载图片失败:', error)
  }
}

// 实际应用：导出功能
class DataExporter {
  exportToExcel(data: any[], filename: string) {
    // 简化的 Excel 导出（实际应用中可能需要专门的库）
    const worksheet = this.createWorksheet(data)
    const blob = new Blob([worksheet], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    downloadFile(blob, filename + '.xlsx')
  }
  
  exportToPDF(content: string, filename: string) {
    // 使用 PDF 库生成 PDF
    const pdfBlob = this.generatePDF(content)
    downloadFile(pdfBlob, filename + '.pdf')
  }
  
  private createWorksheet(data: any[]): string {
    // 简化的工作表创建逻辑
    return JSON.stringify(data)
  }
  
  private generatePDF(content: string): Blob {
    // PDF 生成逻辑
    return new Blob([content], { type: 'application/pdf' })
  }
}
```

### getUrlParams

解析 URL 参数。

**函数签名**
```typescript
function getUrlParams(url?: string): Record<string, string>
function getUrlParams<T extends Record<string, any>>(
  url?: string,
  schema?: T
): Partial<T>
```

**使用示例**

```typescript
// 基础参数解析
const params = getUrlParams('https://example.com?name=John&age=30&active=true')
console.log(params)
// { name: 'John', age: '30', active: 'true' }

// 解析当前页面参数
const currentParams = getUrlParams()
console.log(currentParams)

// 带类型转换的参数解析
const typedParams = getUrlParams(window.location.href, {
  page: Number,
  size: Number,
  keyword: String,
  active: Boolean
})

// 实际应用：路由参数管理
class RouteManager {
  getQueryParams<T = Record<string, string>>(): T {
    return getUrlParams() as T
  }
  
  setQueryParams(params: Record<string, any>) {
    const url = new URL(window.location.href)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value))
      } else {
        url.searchParams.delete(key)
      }
    })
    
    window.history.pushState({}, '', url.toString())
  }
  
  removeQueryParam(key: string) {
    const url = new URL(window.location.href)
    url.searchParams.delete(key)
    window.history.pushState({}, '', url.toString())
  }
}

// 分页参数管理
class PaginationManager {
  getCurrentPage(): number {
    const params = getUrlParams()
    return parseInt(params.page || '1', 10)
  }
  
  getPageSize(): number {
    const params = getUrlParams()
    return parseInt(params.size || '20', 10)
  }
  
  updatePagination(page: number, size: number) {
    const routeManager = new RouteManager()
    routeManager.setQueryParams({ page, size })
  }
}
```

### checkStorageAvailability

检查存储可用性。

**函数签名**
```typescript
function checkStorageAvailability(type: 'localStorage' | 'sessionStorage'): boolean
function getStorageQuota(): Promise<{ usage: number; quota: number }>
```

**使用示例**

```typescript
// 检查存储可用性
if (checkStorageAvailability('localStorage')) {
  localStorage.setItem('key', 'value')
} else {
  console.warn('localStorage 不可用')
  // 使用降级方案
}

// 检查存储配额
async function checkStorageQuota() {
  try {
    const quota = await getStorageQuota()
    const usagePercent = (quota.usage / quota.quota) * 100
    
    console.log(`存储使用率: ${usagePercent.toFixed(2)}%`)
    
    if (usagePercent > 80) {
      console.warn('存储空间不足，建议清理数据')
    }
  } catch (error) {
    console.error('无法获取存储配额信息')
  }
}
```

## 注意事项

### 浏览器兼容性
- 某些 API 在旧版浏览器中不可用
- 提供降级方案和特性检测
- 测试目标浏览器的兼容性

### 安全性
- 剪贴板操作需要用户交互
- 文件下载可能被浏览器阻止
- 注意跨域限制

### 性能考虑
- 避免频繁的设备检测
- 缓存浏览器信息
- 大文件下载考虑分块处理

## 相关功能

- [useClipboard](/hooks/use-clipboard) - 剪贴板 Hook
- [useNetwork](/hooks/use-network) - 网络状态 Hook
- [通用工具](/utils/general) - 其他工具函数
