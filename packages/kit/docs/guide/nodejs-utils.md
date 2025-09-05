# Node.js 工具集

@ldesign/kit 提供了丰富的 Node.js 工具集，涵盖系统信息、文件操作、网络请求等常用功能。

## 系统工具 (SystemUtils)

### 获取系统信息

```typescript
import { SystemUtils } from '@ldesign/kit/utils'

// 获取完整系统信息
const systemInfo = SystemUtils.getSystemInfo()
console.log('系统信息:', systemInfo)
// {
//   platform: 'linux',
//   arch: 'x64',
//   hostname: 'my-server',
//   uptime: 123456,
//   memory: { total: 8589934592, free: 4294967296, used: 4294967296, percentage: 50 },
//   cpu: { model: 'Intel Core i7', cores: 8, speed: 2400 },
//   user: { username: 'user', homedir: '/home/user' },
//   network: [...],
//   node: { version: 'v18.0.0', platform: 'linux', arch: 'x64' }
// }
```

### 内存和 CPU 监控

```typescript
// 获取内存使用情况
const memoryUsage = SystemUtils.getMemoryUsage()
console.log('内存使用:', memoryUsage)

// 获取 CPU 使用率
const cpuUsage = await SystemUtils.getCpuUsage()
console.log('CPU 使用率:', cpuUsage, '%')

// 获取磁盘使用情况
const diskUsage = await SystemUtils.getDiskUsage('/')
console.log('磁盘使用:', diskUsage)
```

### 环境检测

```typescript
// 检查是否为 Docker 环境
const isDocker = await SystemUtils.isDocker()
console.log('Docker 环境:', isDocker)

// 检查是否为 CI 环境
const isCI = SystemUtils.isCI()
console.log('CI 环境:', isCI)

// 获取环境类型
const environment = SystemUtils.getEnvironment()
console.log('环境类型:', environment) // 'development' | 'production' | 'test' | 'staging' | 'unknown'
```

### 端口管理

```typescript
// 检查端口是否可用
const isAvailable = await SystemUtils.isPortAvailable(3000)
console.log('端口 3000 可用:', isAvailable)

// 查找可用端口
const availablePort = await SystemUtils.findAvailablePort(3000, 4000)
console.log('可用端口:', availablePort)
```

### 工具函数

```typescript
// 格式化字节大小
const formatted = SystemUtils.formatBytes(1024 * 1024 * 1024)
console.log(formatted) // "1 GB"

// 格式化运行时间
const uptime = SystemUtils.formatUptime(3661)
console.log(uptime) // "1h 1m 1s"
```

## 文件工具 (FileUtils)

### 文件操作

```typescript
import { FileUtils } from '@ldesign/kit/utils'

// 计算文件哈希
const hash = await FileUtils.calculateHash('./file.txt', 'sha256')
console.log('文件哈希:', hash)

// 比较两个文件
const comparison = await FileUtils.compareFiles('./file1.txt', './file2.txt')
console.log('文件比较:', comparison)
// { identical: true, sizeDifference: 0 }
```

### 批量文件操作

```typescript
// 批量复制文件
const copied = await FileUtils.copyFiles(['./src/file1.txt', './src/file2.txt'], './dest/', {
  overwrite: true,
  preserveTimestamps: true,
  onProgress: (copied, total) => {
    console.log(`进度: ${copied}/${total}`)
  },
})

// 搜索文件
const files = await FileUtils.searchFiles('./src', {
  pattern: /\.ts$/,
  extensions: ['.ts', '.js'],
  maxDepth: 3,
  includeDirectories: false,
})

// 批量重命名
const renamed = await FileUtils.renameFiles(files, (oldName, index) => {
  return `file_${index}_${oldName}`
})
```

### 高级文件操作

```typescript
// 获取文件详细信息
const fileInfo = await FileUtils.getFileInfo('./file.txt')
console.log('文件信息:', fileInfo)

// 获取目录大小
const dirSize = await FileUtils.getDirectorySize('./src')
console.log('目录大小:', dirSize)
// { size: 1024000, fileCount: 50, directoryCount: 10 }

// 清理空目录
const removed = await FileUtils.cleanEmptyDirectories('./temp')
console.log('删除的空目录:', removed)
```

### 文件备份和安全删除

```typescript
// 创建文件备份
const backupPath = await FileUtils.createBackup('./important.txt', './backups')
console.log('备份文件:', backupPath)

// 安全删除（移动到回收站）
const trashedPath = await FileUtils.safeDelete('./temp.txt', './trash')
console.log('已移动到回收站:', trashedPath)
```

### 文件分割和合并

```typescript
// 分割大文件
const chunks = await FileUtils.splitFile('./large-file.zip', 1024 * 1024) // 1MB 块
console.log('文件块:', chunks)

// 合并文件块
await FileUtils.mergeFiles(chunks, './merged-file.zip')
```

## HTTP 工具 (HttpUtils)

### 基本请求

```typescript
import { HttpUtils } from '@ldesign/kit/utils'

// GET 请求
const response = await HttpUtils.get('https://api.example.com/users')
console.log('响应数据:', response.data)

// POST 请求
const postResponse = await HttpUtils.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com',
})

// 其他 HTTP 方法
await HttpUtils.put(url, data)
await HttpUtils.patch(url, data)
await HttpUtils.delete(url)
```

### 高级请求选项

```typescript
// 带重试和缓存的请求
const response = await HttpUtils.get('https://api.example.com/data', {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  cache: true,
  cacheTTL: 300000, // 5 minutes
  validateStatus: status => status < 500,
})
```

### 批量请求

```typescript
// 并发请求
const requests = [
  { url: 'https://api.example.com/users/1' },
  { url: 'https://api.example.com/users/2' },
  { url: 'https://api.example.com/users/3' },
]

const results = await HttpUtils.batchRequest(requests, 2) // 并发数为 2
```

### 文件上传下载

```typescript
// 下载文件
await HttpUtils.downloadFile('https://example.com/file.zip', './downloads/file.zip', {
  onProgress: (downloaded, total) => {
    console.log(`下载进度: ${((downloaded / total) * 100).toFixed(2)}%`)
  },
})

// 上传文件
const uploadResponse = await HttpUtils.uploadFile(
  'https://api.example.com/upload',
  './file.txt',
  'file'
)
```

### 网络检测

```typescript
// 检查 URL 是否可访问
const isAccessible = await HttpUtils.isUrlAccessible('https://example.com')
console.log('URL 可访问:', isAccessible)

// 获取响应时间
const responseTime = await HttpUtils.getResponseTime('https://example.com')
console.log('响应时间:', responseTime, 'ms')
```

### 缓存管理

```typescript
// 清除所有缓存
HttpUtils.clearCache()

// 清除匹配模式的缓存
HttpUtils.clearCache(/api\.example\.com/)

// 设置默认选项
HttpUtils.setDefaultOptions({
  timeout: 15000,
  retries: 5,
  headers: {
    'User-Agent': 'MyApp/1.0.0',
  },
})
```

## 使用示例

### 系统监控脚本

```typescript
import { SystemUtils } from '@ldesign/kit/utils'

async function monitorSystem() {
  const info = SystemUtils.getSystemInfo()
  const cpuUsage = await SystemUtils.getCpuUsage()
  const diskUsage = await SystemUtils.getDiskUsage('/')

  console.log(`
系统监控报告:
- 平台: ${info.platform} ${info.arch}
- 内存使用: ${info.memory.percentage.toFixed(2)}%
- CPU 使用: ${cpuUsage.toFixed(2)}%
- 磁盘使用: ${diskUsage?.percentage.toFixed(2)}%
- 运行时间: ${SystemUtils.formatUptime(info.uptime)}
  `)
}

// 每 30 秒监控一次
setInterval(monitorSystem, 30000)
```

### 文件同步工具

```typescript
import { FileUtils } from '@ldesign/kit/utils'

async function syncDirectories(source: string, target: string) {
  // 搜索源目录中的所有文件
  const sourceFiles = await FileUtils.searchFiles(source, {
    maxDepth: 10,
  })

  // 复制文件到目标目录
  const copied = await FileUtils.copyFiles(sourceFiles, target, {
    overwrite: true,
    preserveTimestamps: true,
    onProgress: (copied, total) => {
      console.log(`同步进度: ${copied}/${total}`)
    },
  })

  console.log(`同步完成，复制了 ${copied.length} 个文件`)
}
```

### API 客户端

```typescript
import { HttpUtils } from '@ldesign/kit/utils'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL

    // 设置默认选项
    HttpUtils.setDefaultOptions({
      timeout: 10000,
      retries: 3,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async getUsers() {
    return HttpUtils.get(`${this.baseURL}/users`, {
      cache: true,
      cacheTTL: 300000, // 5 minutes
    })
  }

  async createUser(userData: any) {
    return HttpUtils.post(`${this.baseURL}/users`, userData)
  }

  async uploadAvatar(userId: string, filePath: string) {
    return HttpUtils.uploadFile(`${this.baseURL}/users/${userId}/avatar`, filePath, 'avatar')
  }
}
```

## 最佳实践

### 1. 错误处理

```typescript
try {
  const result = await HttpUtils.get('https://api.example.com/data')
  console.log(result.data)
} catch (error) {
  if (error.status === 404) {
    console.log('资源未找到')
  } else if (error.code === 'ECONNREFUSED') {
    console.log('连接被拒绝')
  } else {
    console.error('请求失败:', error.message)
  }
}
```

### 2. 性能优化

```typescript
// 使用缓存减少重复请求
const cachedResponse = await HttpUtils.get(url, {
  cache: true,
  cacheTTL: 600000, // 10 minutes
})

// 批量处理文件操作
const files = await FileUtils.searchFiles('./src')
const results = await Promise.all(files.map(file => FileUtils.getFileInfo(file)))
```

### 3. 资源清理

```typescript
// 定期清理缓存
setInterval(() => {
  HttpUtils.clearCache()
}, 3600000) // 每小时清理一次

// 清理临时文件
await FileUtils.cleanEmptyDirectories('./temp')
```
