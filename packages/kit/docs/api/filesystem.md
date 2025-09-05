# FileSystem 文件系统

FileSystem 模块提供了完整的文件和目录操作 API，支持文件监听、权限管理和路径处理。

## 导入方式

```typescript
// 完整导入
import { FileSystem, FileWatcher, PathUtils } from '@ldesign/kit'

// 按需导入
import { FileSystem } from '@ldesign/kit/filesystem'

// 单独导入
import { FileSystem } from '@ldesign/kit'
```

## FileSystem

文件系统操作类，提供文件和目录的基本操作方法。

### 文件操作

#### `readFile(path: string, encoding?: string): Promise<string | Buffer>`

读取文件内容。

```typescript
// 读取文本文件
const content = await FileSystem.readFile('./config.json')
const config = JSON.parse(content)

// 读取二进制文件
const buffer = await FileSystem.readFile('./image.png', null)

// 指定编码
const content = await FileSystem.readFile('./data.txt', 'utf8')
```

#### `writeFile(path: string, content: string | Buffer, options?: WriteFileOptions): Promise<void>`

写入文件内容。

```typescript
// 写入文本内容
await FileSystem.writeFile('./output.txt', 'Hello World')

// 写入 JSON 数据
await FileSystem.writeFile('./data.json', JSON.stringify(data, null, 2))

// 写入二进制数据
await FileSystem.writeFile('./image.png', buffer)

// 使用选项
await FileSystem.writeFile('./config.json', content, {
  encoding: 'utf8',
  mode: 0o644,
  backup: true, // 写入前备份原文件
})
```

#### `appendFile(path: string, content: string | Buffer): Promise<void>`

追加内容到文件。

```typescript
await FileSystem.appendFile('./log.txt', 'New log entry\n')
await FileSystem.appendFile('./data.csv', 'John,25,Engineer\n')
```

#### `copy(src: string, dest: string, options?: CopyOptions): Promise<void>`

复制文件或目录。

```typescript
// 复制文件
await FileSystem.copy('./src/config.json', './dist/config.json')

// 复制目录
await FileSystem.copy('./src', './backup')

// 使用选项
await FileSystem.copy('./src', './dist', {
  overwrite: true, // 覆盖已存在的文件
  preserveTimestamps: true, // 保持时间戳
  filter: (src, dest) => {
    // 过滤函数
    return !src.includes('node_modules')
  },
})
```

#### `move(src: string, dest: string): Promise<void>`

移动文件或目录。

```typescript
await FileSystem.move('./old.txt', './new.txt')
await FileSystem.move('./old-dir', './new-dir')
```

#### `remove(path: string): Promise<void>`

删除文件或目录。

```typescript
await FileSystem.remove('./temp.txt')
await FileSystem.remove('./temp-dir') // 递归删除目录
```

#### `exists(path: string): Promise<boolean>`

检查文件或目录是否存在。

```typescript
if (await FileSystem.exists('./config.json')) {
  console.log('配置文件存在')
}

const configExists = await FileSystem.exists('./config.json')
```

#### `stat(path: string): Promise<FileStats>`

获取文件或目录信息。

```typescript
const stats = await FileSystem.stat('./file.txt')

console.log('文件大小:', stats.size)
console.log('是否为文件:', stats.isFile())
console.log('是否为目录:', stats.isDirectory())
console.log('创建时间:', stats.birthtime)
console.log('修改时间:', stats.mtime)
console.log('权限:', stats.mode)
```

### 目录操作

#### `ensureDir(path: string): Promise<void>`

确保目录存在，如果不存在则创建。

```typescript
await FileSystem.ensureDir('./data/logs')
await FileSystem.ensureDir('./uploads/images/thumbnails')
```

#### `readDir(path: string, options?: ReadDirOptions): Promise<string[]>`

读取目录内容。

```typescript
// 读取目录文件列表
const files = await FileSystem.readDir('./src')

// 递归读取
const allFiles = await FileSystem.readDir('./src', {
  recursive: true,
})

// 使用过滤器
const jsFiles = await FileSystem.readDir('./src', {
  recursive: true,
  filter: file => file.endsWith('.js'),
})

// 包含详细信息
const filesWithStats = await FileSystem.readDir('./src', {
  withFileTypes: true,
})
```

#### `emptyDir(path: string): Promise<void>`

清空目录内容。

```typescript
await FileSystem.emptyDir('./temp')
await FileSystem.emptyDir('./cache')
```

#### `removeDir(path: string): Promise<void>`

删除目录及其内容。

```typescript
await FileSystem.removeDir('./old-project')
await FileSystem.removeDir('./temp-files')
```

### 权限操作

#### `chmod(path: string, mode: number): Promise<void>`

修改文件或目录权限。

```typescript
await FileSystem.chmod('./script.sh', 0o755) // 可执行权限
await FileSystem.chmod('./config.json', 0o644) // 只读权限
```

#### `chown(path: string, uid: number, gid: number): Promise<void>`

修改文件或目录所有者。

```typescript
await FileSystem.chown('./file.txt', 1000, 1000)
```

#### `access(path: string, mode?: number): Promise<boolean>`

检查文件访问权限。

```typescript
const canRead = await FileSystem.access('./file.txt', FileSystem.constants.R_OK)
const canWrite = await FileSystem.access('./file.txt', FileSystem.constants.W_OK)
const canExecute = await FileSystem.access('./script.sh', FileSystem.constants.X_OK)
```

### 路径操作

#### `resolve(...paths: string[]): string`

解析绝对路径。

```typescript
const absolutePath = FileSystem.resolve('./data', 'config.json')
const fullPath = FileSystem.resolve('/home/user', '../documents', 'file.txt')
```

#### `relative(from: string, to: string): string`

计算相对路径。

```typescript
const relativePath = FileSystem.relative('/home/user', '/home/user/documents/file.txt')
// 'documents/file.txt'
```

#### `join(...paths: string[]): string`

连接路径。

```typescript
const filePath = FileSystem.join('data', 'users', 'profile.json')
const configPath = FileSystem.join(process.cwd(), 'config', 'app.json')
```

#### `dirname(path: string): string`

获取目录名。

```typescript
const dir = FileSystem.dirname('/home/user/documents/file.txt')
// '/home/user/documents'
```

#### `basename(path: string, ext?: string): string`

获取文件名。

```typescript
const filename = FileSystem.basename('/home/user/documents/file.txt')
// 'file.txt'

const name = FileSystem.basename('/home/user/documents/file.txt', '.txt')
// 'file'
```

#### `extname(path: string): string`

获取文件扩展名。

```typescript
const ext = FileSystem.extname('/home/user/documents/file.txt')
// '.txt'
```

## FileWatcher

文件监听器类，用于监听文件和目录的变化。

### 创建监听器

#### `create(path: string, options?: WatchOptions): FileWatcher`

创建文件监听器。

```typescript
const watcher = FileWatcher.create('./src', {
  recursive: true, // 递归监听
  ignored: /node_modules/, // 忽略模式
  persistent: true, // 持久监听
  followSymlinks: false, // 不跟随符号链接
  depth: 10, // 最大深度
  awaitWriteFinish: {
    // 等待写入完成
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
})
```

### 事件监听

#### `on(event: string, listener: Function): void`

监听文件变化事件。

```typescript
// 文件变更
watcher.on('change', (path, stats) => {
  console.log(`文件变更: ${path}`)
  console.log('新的大小:', stats?.size)
})

// 文件添加
watcher.on('add', (path, stats) => {
  console.log(`文件添加: ${path}`)
})

// 文件删除
watcher.on('unlink', path => {
  console.log(`文件删除: ${path}`)
})

// 目录添加
watcher.on('addDir', (path, stats) => {
  console.log(`目录添加: ${path}`)
})

// 目录删除
watcher.on('unlinkDir', path => {
  console.log(`目录删除: ${path}`)
})

// 错误处理
watcher.on('error', error => {
  console.error('监听错误:', error)
})

// 准备就绪
watcher.on('ready', () => {
  console.log('文件监听器已准备就绪')
})
```

### 控制方法

#### `close(): Promise<void>`

关闭监听器。

```typescript
await watcher.close()
```

#### `add(path: string): void`

添加监听路径。

```typescript
watcher.add('./additional-dir')
watcher.add('./specific-file.txt')
```

#### `unwatch(path: string): void`

移除监听路径。

```typescript
watcher.unwatch('./no-longer-needed')
```

#### `getWatched(): Record<string, string[]>`

获取当前监听的路径。

```typescript
const watched = watcher.getWatched()
console.log('监听的路径:', watched)
```

## 实际应用示例

### 配置文件管理

```typescript
class ConfigManager {
  private configPath: string
  private watcher?: FileWatcher

  constructor(configPath: string) {
    this.configPath = configPath
  }

  async load() {
    if (await FileSystem.exists(this.configPath)) {
      const content = await FileSystem.readFile(this.configPath)
      return JSON.parse(content)
    }
    return {}
  }

  async save(config: any) {
    await FileSystem.ensureDir(FileSystem.dirname(this.configPath))
    await FileSystem.writeFile(this.configPath, JSON.stringify(config, null, 2))
  }

  watch(callback: (config: any) => void) {
    this.watcher = FileWatcher.create(this.configPath)
    this.watcher.on('change', async () => {
      const config = await this.load()
      callback(config)
    })
  }

  async close() {
    if (this.watcher) {
      await this.watcher.close()
    }
  }
}
```

### 文件备份工具

```typescript
class BackupManager {
  async backup(sourcePath: string, backupDir: string) {
    await FileSystem.ensureDir(backupDir)

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const stats = await FileSystem.stat(sourcePath)

    if (stats.isFile()) {
      const filename = FileSystem.basename(sourcePath)
      const backupPath = FileSystem.join(backupDir, `${timestamp}-${filename}`)
      await FileSystem.copy(sourcePath, backupPath)
    } else {
      const dirname = FileSystem.basename(sourcePath)
      const backupPath = FileSystem.join(backupDir, `${timestamp}-${dirname}`)
      await FileSystem.copy(sourcePath, backupPath)
    }
  }

  async restore(backupPath: string, targetPath: string) {
    await FileSystem.copy(backupPath, targetPath, { overwrite: true })
  }

  async listBackups(backupDir: string) {
    const files = await FileSystem.readDir(backupDir)
    return files
      .map(file => {
        const timestamp = file.split('-')[0]
        return {
          file,
          timestamp: new Date(timestamp.replace(/-/g, ':')),
          path: FileSystem.join(backupDir, file),
        }
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }
}
```

### 日志文件管理

```typescript
class LogManager {
  private logPath: string
  private maxSize: number
  private maxFiles: number

  constructor(logPath: string, maxSize = 10 * 1024 * 1024, maxFiles = 5) {
    this.logPath = logPath
    this.maxSize = maxSize
    this.maxFiles = maxFiles
  }

  async log(message: string) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\n`

    await FileSystem.ensureDir(FileSystem.dirname(this.logPath))

    // 检查文件大小
    if (await FileSystem.exists(this.logPath)) {
      const stats = await FileSystem.stat(this.logPath)
      if (stats.size > this.maxSize) {
        await this.rotateLog()
      }
    }

    await FileSystem.appendFile(this.logPath, logEntry)
  }

  private async rotateLog() {
    // 轮转日志文件
    for (let i = this.maxFiles - 1; i > 0; i--) {
      const oldPath = `${this.logPath}.${i}`
      const newPath = `${this.logPath}.${i + 1}`

      if (await FileSystem.exists(oldPath)) {
        if (i === this.maxFiles - 1) {
          await FileSystem.remove(oldPath)
        } else {
          await FileSystem.move(oldPath, newPath)
        }
      }
    }

    if (await FileSystem.exists(this.logPath)) {
      await FileSystem.move(this.logPath, `${this.logPath}.1`)
    }
  }
}
```

## 类型定义

```typescript
interface WriteFileOptions {
  encoding?: string
  mode?: number
  backup?: boolean
}

interface CopyOptions {
  overwrite?: boolean
  preserveTimestamps?: boolean
  filter?: (src: string, dest: string) => boolean
}

interface ReadDirOptions {
  recursive?: boolean
  filter?: (file: string) => boolean
  withFileTypes?: boolean
}

interface WatchOptions {
  recursive?: boolean
  ignored?: RegExp | string | Array<RegExp | string>
  persistent?: boolean
  followSymlinks?: boolean
  depth?: number
  awaitWriteFinish?: {
    stabilityThreshold: number
    pollInterval: number
  }
}

interface FileStats {
  size: number
  mode: number
  uid: number
  gid: number
  atime: Date
  mtime: Date
  ctime: Date
  birthtime: Date
  isFile(): boolean
  isDirectory(): boolean
  isSymbolicLink(): boolean
}
```

## 错误处理

```typescript
try {
  const content = await FileSystem.readFile('./config.json')
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('文件不存在')
  } else if (error.code === 'EACCES') {
    console.log('权限不足')
  } else {
    console.error('读取失败:', error.message)
  }
}
```

## 最佳实践

1. **错误处理**: 始终处理文件操作可能出现的错误
2. **路径处理**: 使用 `FileSystem.join()` 而不是字符串拼接
3. **权限检查**: 在操作前检查文件权限
4. **资源清理**: 及时关闭文件监听器
5. **原子操作**: 对于重要文件，使用原子写入

## 示例应用

查看 [使用示例](/examples/file-processing) 了解更多文件处理的实际应用场景。
