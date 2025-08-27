# watch

监听文件变化并自动重新构建的 API 函数。

## 语法

```typescript
function watch(options: BuildOptions): Promise<WatchResult>
```

## 参数

### options

类型：`BuildOptions`

与 `build` 函数相同的配置选项。

## 返回值

类型：`Promise<WatchResult>`

返回监听器对象的 Promise。

```typescript
interface WatchResult {
  /** 是否启动成功 */
  success: boolean
  /** 监听器实例 */
  watcher?: RollupWatcher
  /** 错误信息 */
  errors: BuildError[]
  /** 停止监听的方法 */
  stop(): Promise<void>
}
```

## 示例

### 基础用法

```typescript
import { watch } from '@ldesign/builder'

const watchResult = await watch({
  input: 'src/index.ts',
  outDir: 'dist'
})

if (watchResult.success) {
  console.log('开始监听文件变化...')
  
  // 在需要时停止监听
  // await watchResult.stop()
} else {
  console.error('启动监听失败:', watchResult.errors)
}
```

### 监听事件

```typescript
import { watch } from '@ldesign/builder'

const watchResult = await watch({
  input: 'src/index.ts',
  outDir: 'dist'
})

if (watchResult.watcher) {
  watchResult.watcher.on('event', (event) => {
    switch (event.code) {
      case 'START':
        console.log('开始构建...')
        break
      case 'BUNDLE_START':
        console.log('开始打包...')
        break
      case 'BUNDLE_END':
        console.log('打包完成')
        break
      case 'END':
        console.log('构建完成')
        break
      case 'ERROR':
        console.error('构建错误:', event.error)
        break
    }
  })
}
```

### 自动停止

```typescript
import { watch } from '@ldesign/builder'

const watchResult = await watch({
  input: 'src/index.ts',
  outDir: 'dist'
})

// 10 秒后自动停止监听
setTimeout(async () => {
  await watchResult.stop()
  console.log('监听已停止')
}, 10000)
```

## 相关

- [build](/api/build)
- [BuildOptions](/api/build-options)
