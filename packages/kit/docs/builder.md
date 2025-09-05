# 构建工具模块

构建工具模块提供了对 Vite 和 Rollup 的高级封装，让你能够轻松地进行项目构建、开发服务器启动、库打包等操作。

## 特性

- 🚀 **Vite 构建器** - 封装 Vite 的构建、开发服务器、预览等功能
- 📦 **Rollup 构建器** - 封装 Rollup 的打包功能，支持多种输出格式
- 🎯 **预设配置** - 内置多种项目类型的预设配置
- 🔧 **工具函数** - 提供项目检测、配置生成等实用工具
- 📊 **构建监控** - 支持构建事件监听和性能监控
- 🔄 **监听模式** - 支持文件变更自动重新构建

## 快速开始

### 安装

```bash
npm install @ldesign/kit
```

### 基础使用

```typescript
import { ViteBuilder, RollupBuilder } from '@ldesign/kit'

// 创建 Vite 构建器
const viteBuilder = new ViteBuilder({
  entry: 'src/index.ts',
  outDir: 'dist',
})

// 构建项目
const result = await viteBuilder.build()
console.log('构建结果:', result)

// 创建 Rollup 构建器
const rollupBuilder = new RollupBuilder({
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
  },
})

// 执行打包
const rollupResult = await rollupBuilder.build()
console.log('打包结果:', rollupResult)
```

## ViteBuilder

### 基础配置

```typescript
const builder = new ViteBuilder({
  // 项目根目录
  root: process.cwd(),

  // 入口文件
  entry: 'src/index.ts',

  // 输出目录
  outDir: 'dist',

  // 构建环境
  env: 'production',

  // 是否生成源码映射
  sourcemap: true,

  // 是否压缩代码
  minify: true,

  // 目标环境
  target: 'es2015',

  // 外部依赖
  external: ['react', 'react-dom'],

  // 全局变量定义
  define: {
    __VERSION__: JSON.stringify('1.0.0'),
  },

  // 路径别名
  alias: {
    '@': 'src',
  },
})
```

### 开发服务器

```typescript
const builder = new ViteBuilder({
  entry: 'src/index.ts',
  server: {
    port: 3000,
    host: true,
    open: true,
    https: false,
    cors: true,
    hmr: true,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})

// 启动开发服务器
const server = await builder.dev()
console.log(`开发服务器已启动: ${server.url}`)

// 关闭服务器
await server.close()
```

### 库模式构建

```typescript
const libBuilder = new ViteBuilder({
  lib: {
    entry: 'src/index.ts',
    name: 'MyLibrary',
    formats: ['es', 'cjs', 'umd'],
    fileName: (format, entryName) => {
      const formatMap = {
        es: `${entryName}.js`,
        cjs: `${entryName}.cjs`,
        umd: `${entryName}.umd.js`,
      }
      return formatMap[format]
    },
  },
  external: ['react', 'react-dom'],
})

// 构建库
const result = await libBuilder.buildLib()
```

### 预览服务器

```typescript
const builder = new ViteBuilder({
  outDir: 'dist',
  preview: {
    port: 4173,
    host: true,
    open: false,
  },
})

// 先构建项目
await builder.build()

// 启动预览服务器
const previewServer = await builder.preview()
console.log(`预览服务器: ${previewServer.url}`)
```

## RollupBuilder

### 基础配置

```typescript
const builder = new RollupBuilder({
  // 入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true,
  },

  // 外部依赖
  external: ['lodash'],

  // 插件
  plugins: [
    // 你的插件
  ],
})
```

### 多输出格式

```typescript
const builder = new RollupBuilder({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'MyLibrary',
      sourcemap: true,
    },
  ],
})

// 构建所有格式
const result = await builder.build()
```

### 多入口构建

```typescript
const builder = new RollupBuilder({
  input: {
    main: 'src/index.ts',
    utils: 'src/utils/index.ts',
    components: 'src/components/index.ts',
  },
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name]-[hash].js',
  },
})
```

### 使用 buildMultiple 方法

```typescript
const builder = new RollupBuilder({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    sourcemap: true,
  },
})

// 构建多种格式
const results = await builder.buildMultiple(['es', 'cjs', 'umd'])
results.forEach((result, index) => {
  const formats = ['es', 'cjs', 'umd']
  console.log(`${formats[index]} 格式: ${result.success ? '成功' : '失败'}`)
})
```

## 预设配置

### 使用内置预设

```typescript
import { createViteBuilderWithPreset, createRollupBuilderWithPreset } from '@ldesign/kit'

// Vue 应用
const vueBuilder = createViteBuilderWithPreset('vue-app', {
  server: { port: 8080 },
})

// React 应用
const reactBuilder = createViteBuilderWithPreset('react-app')

// 库开发
const libBuilder = createViteBuilderWithPreset('library', {
  lib: { name: 'MyCustomLibrary' },
})

// TypeScript 库
const tsLibBuilder = createViteBuilderWithPreset('ts-library')

// Node.js 应用
const nodeBuilder = createViteBuilderWithPreset('node-app')

// Rollup 库
const rollupLibBuilder = createRollupBuilderWithPreset('rollup-library')

// UMD 库
const umdBuilder = createRollupBuilderWithPreset('umd-library', {
  output: { name: 'MyUMDLibrary' },
})
```

### 注册自定义预设

```typescript
import { BuilderFactory } from '@ldesign/kit'

// 注册自定义预设
BuilderFactory.registerPreset({
  name: 'my-custom-preset',
  description: '我的自定义预设',
  config: {
    entry: 'src/app.ts',
    outDir: 'build',
    server: {
      port: 9000,
      open: true,
    },
  },
})

// 使用自定义预设
const customBuilder = createViteBuilderWithPreset('my-custom-preset')
```

## 工具函数

### 项目检测

```typescript
import { BuilderUtils } from '@ldesign/kit'

// 检测项目类型
const projectType = BuilderUtils.detectProjectType('./my-project')
// 返回: 'vue', 'react', 'angular', 'svelte', 'library', 'node', 'web', 'unknown'

// 查找入口文件
const entryFile = BuilderUtils.findEntryFile('./my-project')
// 返回: '/path/to/src/index.ts' 或 null

// 查找多个入口文件
const entries = BuilderUtils.findMultipleEntries('./my-project', 'src/*/index.ts')
// 返回: { components: '/path/to/src/components/index.ts', utils: '/path/to/src/utils/index.ts' }
```

### 配置生成

```typescript
// 获取推荐配置
const config = BuilderUtils.getRecommendedConfig('./my-project')
console.log('推荐配置:', config)

// 验证配置
const validation = BuilderUtils.validateConfig(config)
if (!validation.valid) {
  console.log('配置错误:', validation.errors)
}
```

### 依赖检查

```typescript
// 检查依赖是否已安装
const depCheck = BuilderUtils.checkDependencies('./my-project', ['react', 'vue', 'typescript'])

console.log('已安装:', depCheck.installed)
console.log('缺失:', depCheck.missing)
```

### 文件名生成

```typescript
// 生成输出文件名
const fileName = BuilderUtils.generateFileName('es', 'index', {
  minify: true,
  hash: true,
})
console.log(fileName) // 'index.min.[hash].js'
```

### 结果格式化

```typescript
// 格式化构建结果
const formatted = BuilderUtils.formatBuildResult(buildResult)
console.log(formatted)

// 格式化文件大小
const size = BuilderUtils.formatFileSize(1024 * 1024)
console.log(size) // '1 MB'
```

## 事件监听

### 构建事件

```typescript
const builder = new ViteBuilder({ entry: 'src/index.ts' })

// 监听构建开始
builder.on('build:start', ({ mode, config }) => {
  console.log(`开始构建 (模式: ${mode})`)
})

// 监听构建完成
builder.on('build:end', ({ result }) => {
  if (result.success) {
    console.log(`构建成功 (${result.duration}ms)`)
    result.outputs.forEach(output => {
      console.log(`  ${output.fileName} - ${BuilderUtils.formatFileSize(output.size)}`)
    })
  } else {
    console.log('构建失败')
    result.errors.forEach(error => console.log(`  错误: ${error}`))
  }
})

// 监听构建错误
builder.on('build:error', ({ error }) => {
  console.error('构建错误:', error.message)
})

// 监听服务器启动
builder.on('server:start', ({ server }) => {
  console.log(`服务器已启动: ${server.url}`)
})
```

## 监听模式

### Vite 监听模式

```typescript
const builder = new ViteBuilder({
  entry: 'src/index.ts',
  outDir: 'dist',
})

// 启动监听模式
await builder.watch()
```

### Rollup 监听模式

```typescript
const builder = new RollupBuilder({
  input: 'src/index.ts',
  output: { file: 'dist/bundle.js', format: 'es' },
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**',
    clearScreen: true,
  },
})

// 启动监听模式
await builder.watch()
```

## 插件管理

```typescript
const builder = new ViteBuilder({ entry: 'src/index.ts' })

// 添加插件
const myPlugin = {
  name: 'my-plugin',
  setup() {
    // 插件逻辑
  },
}

builder.addPlugin(myPlugin)

// 移除插件
builder.removePlugin('my-plugin')

// 查看当前插件
const config = builder.getConfig()
console.log('插件数量:', config.plugins?.length)
```

## 最佳实践

### 1. 资源清理

```typescript
const builder = new ViteBuilder({ entry: 'src/index.ts' })

try {
  const result = await builder.build()
  // 处理构建结果
} finally {
  // 始终清理资源
  await builder.destroy()
}
```

### 2. 错误处理

```typescript
const builder = new ViteBuilder({ entry: 'src/index.ts' })

builder.on('build:error', ({ error }) => {
  console.error('构建错误:', error.message)
  // 发送错误通知或记录日志
})

try {
  const result = await builder.build()
  if (!result.success) {
    // 处理构建失败
    console.log('构建失败:', result.errors)
  }
} catch (error) {
  // 处理异常
  console.error('构建异常:', error)
}
```

### 3. 性能监控

```typescript
const builder = new ViteBuilder({ entry: 'src/index.ts' })

const performanceData = []

builder.on('build:end', ({ result }) => {
  performanceData.push({
    duration: result.duration,
    outputCount: result.outputs.length,
    totalSize: result.outputs.reduce((sum, output) => sum + output.size, 0),
  })

  // 分析性能数据
  const avgDuration =
    performanceData.reduce((sum, data) => sum + data.duration, 0) / performanceData.length
  console.log(`平均构建时间: ${Math.round(avgDuration)}ms`)
})
```

## API 参考

详细的 API 文档请参考 TypeScript 类型定义文件和 JSDoc 注释。

## 示例项目

查看 `examples/builder/` 目录中的完整示例：

- `vite-builder-demo.js` - ViteBuilder 使用示例
- `rollup-builder-demo.js` - RollupBuilder 使用示例
- `comprehensive-demo.js` - 综合使用示例

运行示例：

```bash
npm run demo:vite-builder
npm run demo:rollup-builder
npm run demo:builder-comprehensive
```
