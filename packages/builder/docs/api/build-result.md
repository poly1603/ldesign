# BuildResult

构建结果的类型定义。

## 类型定义

```typescript
interface BuildResult {
  /** 是否构建成功 */
  success: boolean
  /** 构建时间（毫秒） */
  duration: number
  /** 输出文件列表 */
  outputs: OutputFile[]
  /** 错误信息 */
  errors: BuildError[]
  /** 警告信息 */
  warnings: BuildWarning[]
  /** 构建统计 */
  stats: BuildStats
}
```

## 属性详解

### success

类型：`boolean`

指示构建是否成功完成。

```typescript
if (result.success) {
  console.log('构建成功！')
} else {
  console.error('构建失败')
}
```

### duration

类型：`number`

构建耗时，单位为毫秒。

```typescript
console.log(`构建耗时: ${result.duration}ms`)
```

### outputs

类型：`OutputFile[]`

构建生成的输出文件列表。

```typescript
result.outputs.forEach(file => {
  console.log(`${file.fileName} (${file.size} bytes)`)
})
```

### errors

类型：`BuildError[]`

构建过程中发生的错误列表。

```typescript
if (result.errors.length > 0) {
  console.error('构建错误:')
  result.errors.forEach(error => {
    console.error(`- ${error.message}`)
    if (error.file) {
      console.error(`  文件: ${error.file}:${error.line}:${error.column}`)
    }
  })
}
```

### warnings

类型：`BuildWarning[]`

构建过程中的警告信息。

```typescript
if (result.warnings.length > 0) {
  console.warn('构建警告:')
  result.warnings.forEach(warning => {
    console.warn(`- ${warning.message}`)
  })
}
```

### stats

类型：`BuildStats`

构建统计信息。

```typescript
console.log('构建统计:')
console.log(`- 总文件数: ${result.stats.totalFiles}`)
console.log(`- 输出大小: ${result.stats.totalSize} bytes`)
console.log(`- 压缩率: ${result.stats.compressionRatio}%`)
```

## 相关类型

### OutputFile

```typescript
interface OutputFile {
  /** 文件名 */
  fileName: string
  /** 文件大小（字节） */
  size: number
  /** 文件类型 */
  type: 'js' | 'css' | 'dts' | 'map'
  /** 输出格式 */
  format?: OutputFormat
  /** 文件路径 */
  path: string
}
```

### BuildError

```typescript
interface BuildError {
  /** 错误消息 */
  message: string
  /** 错误堆栈 */
  stack?: string
  /** 错误文件 */
  file?: string
  /** 错误行号 */
  line?: number
  /** 错误列号 */
  column?: number
}
```

### BuildWarning

```typescript
interface BuildWarning {
  /** 警告消息 */
  message: string
  /** 警告文件 */
  file?: string
  /** 警告行号 */
  line?: number
  /** 警告列号 */
  column?: number
}
```

### BuildStats

```typescript
interface BuildStats {
  /** 总文件数 */
  totalFiles: number
  /** 总输出大小 */
  totalSize: number
  /** 压缩率 */
  compressionRatio: number
  /** 各格式文件数 */
  formatCounts: Record<OutputFormat, number>
  /** 构建开始时间 */
  startTime: number
  /** 构建结束时间 */
  endTime: number
}
```

## 使用示例

### 基础用法

```typescript
import { build } from '@ldesign/builder'

const result = await build({
  input: 'src/index.ts',
  outDir: 'dist'
})

console.log('构建结果:')
console.log(`- 成功: ${result.success}`)
console.log(`- 耗时: ${result.duration}ms`)
console.log(`- 输出文件: ${result.outputs.length} 个`)

if (!result.success) {
  console.error('构建失败:')
  result.errors.forEach(error => {
    console.error(`  ${error.message}`)
  })
}
```

### 详细信息展示

```typescript
import { build } from '@ldesign/builder'

const result = await build({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd']
})

if (result.success) {
  console.log('✅ 构建成功！')
  
  // 显示构建统计
  console.log('\n📊 构建统计:')
  console.log(`   总文件数: ${result.stats.totalFiles}`)
  console.log(`   总大小: ${(result.stats.totalSize / 1024).toFixed(2)} KB`)
  console.log(`   构建时间: ${result.duration}ms`)
  
  // 显示输出文件
  console.log('\n📦 输出文件:')
  result.outputs.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(2)
    console.log(`   ${file.fileName} (${sizeKB} KB) [${file.format || file.type}]`)
  })
  
  // 显示警告
  if (result.warnings.length > 0) {
    console.log('\n⚠️  警告:')
    result.warnings.forEach(warning => {
      console.log(`   ${warning.message}`)
    })
  }
} else {
  console.error('❌ 构建失败')
  
  // 显示错误
  result.errors.forEach(error => {
    console.error(`\n错误: ${error.message}`)
    if (error.file) {
      console.error(`文件: ${error.file}`)
      if (error.line) {
        console.error(`位置: ${error.line}:${error.column || 0}`)
      }
    }
    if (error.stack) {
      console.error(`堆栈:\n${error.stack}`)
    }
  })
}
```

### 条件处理

```typescript
import { build } from '@ldesign/builder'

async function buildWithRetry(options: BuildOptions, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await build(options)
    
    if (result.success) {
      return result
    }
    
    console.warn(`构建失败，第 ${i + 1} 次重试...`)
    
    // 如果是最后一次重试，抛出错误
    if (i === maxRetries - 1) {
      throw new Error(`构建失败: ${result.errors.map(e => e.message).join(', ')}`)
    }
  }
}
```

## 相关

- [build](/api/build)
- [BuildOptions](/api/build-options)
- [watch](/api/watch)
