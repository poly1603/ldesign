# API 文档

@ldesign/builder 提供了丰富的 API 接口，支持编程式使用和配置文件两种方式。

## 主要 API

### build(options)

执行一次性构建任务。

```typescript
import { build } from '@ldesign/builder'

const result = await build({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  mode: 'production',
  dts: true,
  sourcemap: true,
  minify: true,
  clean: true
})

// 构建结果
interface BuildResult {
  success: boolean        // 是否构建成功
  outputs: OutputInfo[]   // 输出文件信息
  duration: number        // 构建耗时（毫秒）
  errors?: BuildError[]   // 错误信息
  warnings?: BuildError[] // 警告信息
}
```

### watch(options)

启动监听模式，文件变化时自动重新构建。

```typescript
import { watch } from '@ldesign/builder'

const { watcher, stop, getState } = await watch({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm'],
  buildOnStart: true,
  debounce: 100
})

// 停止监听
await stop()

// 获取监听状态
const state = getState()
console.log(state.buildCount)  // 构建次数
console.log(state.errorCount)  // 错误次数
```

### analyze(rootDir, options)

分析项目结构，提供构建建议。

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze('./src', {
  includePatterns: ['**/*.{ts,tsx,js,jsx,vue}'],
  ignorePatterns: ['node_modules/**']
})

// 分析结果
interface AnalyzeResult {
  projectType: ProjectType      // 项目类型
  files: FileInfo[]            // 文件列表
  entryPoints: string[]        // 入口文件
  stats: ProjectStats          // 统计信息
  recommendations: string[]    // 构建建议
  issues: string[]            // 潜在问题
}
```

### init(options)

初始化项目模板。

```typescript
import { init } from '@ldesign/builder'

const result = await init({
  template: 'vue',           // 模板类型
  typescript: true,          // 是否使用 TypeScript
  output: './my-project',    // 输出目录
  name: 'my-awesome-lib',    // 项目名称
  overwrite: false          // 是否覆盖已存在的文件
})
```

## 配置 API

### defineConfig(config)

定义构建配置，提供类型安全。

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true
})
```

### mergeConfigs(...configs)

合并多个配置对象。

```typescript
import { mergeConfigs, presets } from '@ldesign/builder'

const baseConfig = {
  input: 'src/index.ts',
  outDir: 'dist'
}

const prodConfig = {
  mode: 'production',
  minify: true
}

export default mergeConfigs(baseConfig, prodConfig)
```

### extendConfig(baseConfig, overrides)

基于基础配置创建新配置。

```typescript
import { extendConfig, presets } from '@ldesign/builder'

const baseConfig = presets.library()

export default extendConfig(baseConfig, {
  external: ['lodash', 'axios'],
  globals: {
    lodash: '_',
    axios: 'axios'
  }
})
```

### createConditionalConfig(conditions, defaultConfig)

根据环境变量创建条件配置。

```typescript
import { createConditionalConfig, presets } from '@ldesign/builder'

export default createConditionalConfig({
  development: presets.development(),
  production: presets.production(),
  test: {
    input: 'src/index.ts',
    outDir: 'dist-test',
    formats: ['esm']
  }
}, presets.library())
```

### createMultiEntryConfig(entries, baseConfig)

创建多入口配置。

```typescript
import { createMultiEntryConfig } from '@ldesign/builder'

export default createMultiEntryConfig({
  main: 'src/index.ts',
  utils: 'src/utils/index.ts',
  components: 'src/components/index.ts'
}, {
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true
})
```

## 预设配置

### presets.library(options)

库开发预设，适用于 npm 包开发。

```typescript
import { presets } from '@ldesign/builder'

export default presets.library({
  input: 'src/index.ts',
  external: ['lodash']
})
```

### presets.vue(options)

Vue 组件库预设。

```typescript
export default presets.vue({
  input: 'src/index.ts',
  name: 'MyVueLib'
})
```

### presets.react(options)

React 组件库预设。

```typescript
export default presets.react({
  input: 'src/index.tsx',
  name: 'MyReactLib'
})
```

### presets.node(options)

Node.js 库预设，自动排除内置模块。

```typescript
export default presets.node({
  input: 'src/index.ts'
})
```

### presets.browser(options)

浏览器库预设，输出 ESM + UMD 格式。

```typescript
export default presets.browser({
  input: 'src/index.ts',
  name: 'MyBrowserLib'
})
```

## 类型定义

### BuildOptions

```typescript
interface BuildOptions {
  // 入口文件
  input: string | Record<string, string>
  
  // 输出目录
  outDir?: string
  
  // 输出格式
  formats?: ('esm' | 'cjs' | 'umd' | 'iife')[]
  
  // 构建模式
  mode?: 'development' | 'production'
  
  // 生成类型声明文件
  dts?: boolean | DtsOptions
  
  // 生成 sourcemap
  sourcemap?: boolean
  
  // 压缩代码
  minify?: boolean
  
  // 清理输出目录
  clean?: boolean
  
  // 外部依赖
  external?: string[] | ((id: string) => boolean)
  
  // 全局变量映射（UMD 格式）
  globals?: Record<string, string>
  
  // UMD 包名
  name?: string
  
  // 自定义 Rollup 配置
  rollupOptions?: Partial<RollupOptions>
  
  // 自定义插件
  plugins?: RollupPlugin[]
}
```

### WatchOptions

```typescript
interface WatchOptions extends BuildOptions {
  // 监听的文件模式
  include?: string[]
  
  // 忽略的文件模式
  exclude?: string[]
  
  // 防抖延迟时间（毫秒）
  debounce?: number
  
  // 是否在启动时立即构建
  buildOnStart?: boolean
}
```

### DtsOptions

```typescript
interface DtsOptions {
  // 是否打包成单个文件
  bundled?: boolean
  
  // 输出文件名
  fileName?: string
  
  // 输出目录
  outDir?: string
  
  // 是否包含外部依赖的类型
  respectExternal?: boolean
  
  // TypeScript 编译选项
  compilerOptions?: Record<string, any>
}
```

### InitOptions

```typescript
interface InitOptions {
  // 项目模板
  template: 'vanilla' | 'vue' | 'react' | 'typescript' | 'library'
  
  // 是否使用 TypeScript
  typescript?: boolean
  
  // 输出目录
  output?: string
  
  // 项目名称
  name?: string
  
  // 是否覆盖已存在的文件
  overwrite?: boolean
}
```

### ScanOptions

```typescript
interface ScanOptions {
  // 包含的文件模式
  includePatterns?: string[]
  
  // 忽略的文件模式
  ignorePatterns?: string[]
  
  // 最大扫描深度
  maxDepth?: number
  
  // 是否跟随符号链接
  followSymlinks?: boolean
  
  // 支持的文件扩展名
  extensions?: string[]
}
```

## 工具函数

### 文件操作

```typescript
import { 
  fileExists,
  readFile,
  writeFile,
  readJson,
  writeJson,
  ensureDir,
  cleanDir
} from '@ldesign/builder'

// 检查文件是否存在
const exists = await fileExists('path/to/file')

// 读取文件
const content = await readFile('path/to/file')

// 写入文件
await writeFile('path/to/file', content)

// 读取 JSON
const data = await readJson('package.json')

// 写入 JSON
await writeJson('config.json', { key: 'value' })
```

### 路径处理

```typescript
import {
  normalizePath,
  resolvePath,
  getRelativePath,
  detectEntryFiles
} from '@ldesign/builder'

// 规范化路径
const normalized = normalizePath('path\\to\\file')

// 解析绝对路径
const absolute = resolvePath('relative/path')

// 获取相对路径
const relative = getRelativePath('/from/path', '/to/path')

// 检测入口文件
const entries = await detectEntryFiles('./src')
```

### 格式化工具

```typescript
import {
  formatFileSize,
  formatTime,
  formatBuildSummary
} from '@ldesign/builder'

// 格式化文件大小
const size = formatFileSize(1024) // "1 KB"

// 格式化时间
const time = formatTime(1500) // "1.50s"

// 格式化构建摘要
const summary = formatBuildSummary(outputs, duration)
```

### 验证工具

```typescript
import {
  validateBuildOptions,
  validatePackageName,
  validateVersion
} from '@ldesign/builder'

// 验证构建选项
const validation = await validateBuildOptions(options)

// 验证包名
const isValidName = validatePackageName('@scope/package')

// 验证版本号
const isValidVersion = validateVersion('1.0.0')
```

## 错误处理

```typescript
import {
  BuilderError,
  ConfigError,
  FileError,
  PluginError,
  safeExecute
} from '@ldesign/builder'

// 安全执行
const result = await safeExecute(async () => {
  // 可能出错的操作
  return await someAsyncOperation()
})

if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}

// 自定义错误
throw new BuilderError('构建失败', 'BUILD_ERROR')
throw new ConfigError('配置无效', 'config.js')
throw new FileError('文件不存在', '/path/to/file')
```

## 日志系统

```typescript
import { logger, LogLevel, createTimer } from '@ldesign/builder'

// 设置日志级别
logger.setLevel(LogLevel.DEBUG)

// 输出日志
logger.info('构建开始')
logger.warn('发现警告')
logger.error('构建失败')
logger.success('构建成功')

// 性能计时
const timer = createTimer('构建时间')
// ... 执行操作
timer.end() // 输出耗时
```
