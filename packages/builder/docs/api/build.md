# build

构建项目的主要 API 函数。

## 语法

```typescript
function build(options: BuildOptions): Promise<BuildResult>
```

## 参数

### options

类型：`BuildOptions`

构建配置选项。

```typescript
interface BuildOptions {
  /** 入口文件路径 */
  input: string
  /** 输出目录 */
  outDir?: string
  /** 输出格式 */
  formats?: OutputFormat[]
  /** 是否生成类型声明文件 */
  dts?: boolean | DtsOptions
  /** 是否生成 sourcemap */
  sourcemap?: boolean
  /** 外部依赖 */
  external?: string[]
  /** 全局变量映射 */
  globals?: Record<string, string>
  /** UMD 包名 */
  name?: string
  /** 自定义 Rollup 配置 */
  rollupOptions?: RollupOptions
}
```

## 返回值

类型：`Promise<BuildResult>`

返回构建结果的 Promise。

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

## 示例

### 基础用法

```typescript
import { build } from '@ldesign/builder'

const result = await build({
  input: 'src/index.ts',
  outDir: 'dist'
})

if (result.success) {
  console.log('构建成功！')
  console.log(`构建时间: ${result.duration}ms`)
  console.log(`输出文件: ${result.outputs.length} 个`)
} else {
  console.error('构建失败:', result.errors)
}
```

### 多格式输出

```typescript
import { build } from '@ldesign/builder'

await build({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  name: 'MyLibrary'
})
```

### 生成类型声明

```typescript
import { build } from '@ldesign/builder'

await build({
  input: 'src/index.ts',
  outDir: 'dist',
  dts: true
})
```

### 自定义配置

```typescript
import { build } from '@ldesign/builder'

await build({
  input: 'src/index.ts',
  outDir: 'dist',
  external: ['vue', 'react'],
  globals: {
    vue: 'Vue',
    react: 'React'
  },
  rollupOptions: {
    treeshake: {
      moduleSideEffects: false
    }
  }
})
```

## 相关

- [BuildOptions](/api/build-options)
- [BuildResult](/api/build-result)
- [watch](/api/watch)
