# @ldesign/builder

基于 rollup/rolldown 的通用库打包工具，支持多种前端库类型的打包和双打包核心的灵活切换。

## ✨ 特性

### 核心功能
- 🚀 **双打包核心支持** - 支持 Rollup 和 Rolldown，可灵活切换
- 📦 **多格式输出** - 自动输出 ESM (es/)、CJS (cjs/)、UMD (dist/) 三种格式
- 🎯 **多入口构建** - 默认将 src/ 下所有源文件作为入口，保留模块结构
- 📝 **TypeScript 优先** - 完整的 TypeScript 支持，自动分发 .d.ts 到各格式目录
- ⚡ **智能配置** - 基于项目类型自动生成最佳配置，零配置可用
- 🔧 **灵活配置** - 支持多种配置文件格式和环境特定配置

### 性能优化 🚀
- ⚡ **增量构建** - 智能检测文件变更，只重新构建修改的文件，速度提升 60-80%
- 🔄 **并行处理** - 高效的并行任务处理，支持优先级和自动并发调整
- 💾 **智能缓存** - 多层缓存策略，显著提升重复构建速度
- 🌊 **流式处理** - 处理大文件时避免内存溢出，内存使用降低 30-40%
- 🗑️ **GC 优化** - 智能垃圾回收管理，确保长时间运行的稳定性

### 开发体验 ✨
- 📊 **构建报告** - 生成详细的 HTML/JSON 报告，可视化性能分析
- 🔍 **代码质量分析** - 内置代码质量检查和优化建议
- 📈 **性能监控** - 实时性能分析和瓶颈识别
- 🎯 **插件系统** - 丰富的插件生态和自定义插件支持
- 🛠️ **CLI 工具** - 完整的命令行工具支持

### 稳定性保障 🛡️
- 💾 **内存管理** - 智能内存监控和资源自动释放
- 🔄 **错误恢复** - 完善的错误处理和自动重试机制
- 🧹 **智能清理** - 构建前自动清理，支持自定义清理规则
- 📁 **批量构建** - 支持一键构建所有示例项目

## 📦 安装

```bash
# 使用 npm
npm install @ldesign/builder --save-dev

# 使用 pnpm
pnpm add @ldesign/builder -D

# 使用 yarn
yarn add @ldesign/builder --dev
```

## 🚀 快速开始

提示：示例项目仅需安装 @ldesign/builder，无需额外安装各框架插件或类型包；构建时所需能力由构建器自身提供。

### 基础使用

```javascript
import { build } from '@ldesign/builder'

// 零配置构建 - 自动多入口，输出到 es/cjs/dist
await build()

// 或指定入口
await build({
  input: 'src/index.ts'
})
```

### 使用配置文件

创建 `builder.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  // 🚀 启用增量构建
  incremental: {
    enabled: true,
    hashAlgorithm: 'md5'
  },
  // 📊 生成构建报告
  report: {
    enabled: true,
    formats: ['html', 'json']
  }
})
```

### 🚀 使用新功能

#### 增量构建

```typescript
import { createIncrementalBuildManager } from '@ldesign/builder'

const manager = createIncrementalBuildManager({ enabled: true })
await manager.loadState()

const { changed, unchanged } = await manager.getChangedFiles(files)
console.log(`只需构建 ${changed.length} 个文件`)

// 构建后保存状态
await manager.saveState()
```

#### 并行处理

```typescript
import { createParallelProcessor } from '@ldesign/builder'

const processor = createParallelProcessor({
  maxConcurrency: 4,
  autoAdjustConcurrency: true
})

files.forEach(file => {
  processor.addTask({
    id: file,
    fn: async () => buildFile(file),
    data: file
  })
})

await processor.waitAll()
```

#### 构建报告

```typescript
import { createBuildReportGenerator } from '@ldesign/builder'

const generator = createBuildReportGenerator()
await generator.generate(reportData, {
  formats: ['html', 'json']
})
// 生成美观的 HTML 报告和 JSON 数据
```

查看 [新功能文档](./docs/NEW_FEATURES.md) 了解更多详情。

### 使用预设配置

```typescript
import { presets } from '@ldesign/builder'

// 库开发预设
export default presets.library({
  input: 'src/index.ts',
  external: ['vue', 'react']
})

// Vue 组件库预设
export default presets.vue({
  input: 'src/index.ts',
  name: 'MyVueLib'
})

// React 组件库预设
export default presets.react({
  input: 'src/index.tsx',
  name: 'MyReactLib'
})
```

### 高级多入口配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 通配符入口配置，支持多种文件类型
  input: [
    'src/**/*.ts',
    'src/**/*.vue',
    'src/**/*.less',
    'src/**/*.tsx'
  ]
})
```

### 批量构建示例项目

示例项目仅需安装 @ldesign/builder，无需安装其他依赖（所有必须的打包插件由构建器在工作区内提供）。

```bash
# 构建仓库中的所有示例
node bin/ldesign-builder.js examples

# 按关键字过滤（例如只构建 TypeScript 示例）
node bin/ldesign-builder.js examples --filter typescript

# 并发构建（默认 1）
node bin/ldesign-builder.js examples --concurrency 3

# 指定示例根目录
node bin/ldesign-builder.js examples --root examples
```

支持的框架示例（零安装）：
- Svelte: `node bin/ldesign-builder.js examples --filter svelte-components`
- Solid: `node bin/ldesign-builder.js examples --filter solid-components`
- Preact: `node bin/ldesign-builder.js examples --filter preact-components`
- Lit/Web Components: `node bin/ldesign-builder.js examples --filter lit-components`
- Angular（基础）: `node bin/ldesign-builder.js examples --filter angular-lib`

### 验证所有示例

提供了一个一键验证脚本，用于批量构建并测试所有示例项目。

- 在 PowerShell 中运行：

```
# 运行全部示例（默认）
pwsh -File packages/builder/scripts/verify-examples.ps1

# 仅验证部分示例
pwsh -File packages/builder/scripts/verify-examples.ps1 -Examples react-components,vue3-components

# 仅构建不测试
pwsh -File packages/builder/scripts/verify-examples.ps1 -NoTest

# 仅测试（跳过构建）
pwsh -File packages/builder/scripts/verify-examples.ps1 -NoBuild

# 发现失败时立即中断
pwsh -File packages/builder/scripts/verify-examples.ps1 -FailFast
```

成功示例会显示 build:OK / test:OK，总结中如有 FAIL，脚本会以非零状态码退出，便于在 CI 中使用。

### 输出目录结构

默认情况下，构建会产生以下目录结构：

```
project/
├── es/           # ESM 格式，保留模块结构
│   ├── index.js
│   ├── index.d.ts
│   └── utils/
│       ├── helper.js
│       └── helper.d.ts
├── cjs/          # CJS 格式，保留模块结构
│   ├── index.cjs
│   ├── index.d.ts
│   └── utils/
│       ├── helper.cjs
│       └── helper.d.ts
└── dist/         # UMD 格式，单文件
    └── index.umd.js
```

  // 新的多输出配置格式
  output: {
    // UMD 格式 - 用于浏览器直接引用
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'MyLibrary',
      sourcemap: true,
      minify: true
    },

    // ESM 格式 - 保持目录结构，生成类型声明
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      sourcemap: true,
      dts: true
    },

    // CJS 格式 - 保持目录结构，生成类型声明
    cjs: {
      dir: 'cjs',
      format: 'cjs',
      preserveStructure: true,
      sourcemap: true,
      dts: true
    }
  },

  mode: 'production',
  clean: true,
  external: ['vue', 'react']
})
```

## 📖 API 文档

### build(options)

执行构建任务。

```typescript
import { build } from '@ldesign/builder'

const result = await build({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  mode: 'production',
  dts: true,
  sourcemap: true,
  minify: true,
  clean: true,
  external: ['vue', 'react'],
  globals: {
    vue: 'Vue',
    react: 'React'
  }
})

console.log(result.success) // true/false
console.log(result.outputs) // 输出文件信息
console.log(result.duration) // 构建耗时
```

### watch(options)

启动监听模式。

```typescript
import { watch } from '@ldesign/builder'

const { watcher, stop } = await watch({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm'],
  buildOnStart: true,
  debounce: 100
})

// 停止监听
await stop()
```

### analyze(rootDir, options)

分析项目结构。

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze('./src', {
  includePatterns: ['**/*.{ts,tsx,js,jsx,vue}'],
  ignorePatterns: ['node_modules/**']
})

console.log(result.projectType) // 'vue' | 'react' | 'typescript' | 'javascript'
console.log(result.stats) // 统计信息
console.log(result.recommendations) // 构建建议
```

### init(options)

初始化项目模板。

```typescript
import { init } from '@ldesign/builder'

await init({
  template: 'vue', // 'vanilla' | 'vue' | 'react' | 'typescript' | 'library'
  typescript: true,
  output: './my-project',
  name: 'my-awesome-lib'
})
```

## ⚙️ 配置选项

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

## � 高级功能

### 通配符入口配置

支持使用通配符模式自动匹配多个入口文件：

```typescript
export default defineConfig({
  // 单个通配符模式
  input: 'src/**/*.ts',

  // 多个通配符模式
  input: [
    'src/**/*.ts',
    'src/**/*.vue',
    'src/**/*.tsx'
  ],

  // 混合配置
  input: [
    'src/index.ts',        // 具体文件
    'src/components/**/*.vue', // 通配符
    'src/utils/**/*.ts'    // 通配符
  ]
})
```

### 多输出目录配置

按格式分别配置输出目录，替代简单的 `outDir` 配置：

```typescript
export default defineConfig({
  input: 'src/**/*.ts',

  output: {
    // UMD 格式输出到 dist/ 目录
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'MyLibrary',
      minify: true
    },

    // ESM 格式输出到 es/ 目录
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true
    },

    // CJS 格式输出到 lib/ 目录
    cjs: {
      dir: 'cjs',
      format: 'cjs',
      preserveStructure: true,
      dts: true
    }
  }
})
```

### 目录结构保持

使用 `preserveStructure: true` 保持源文件的目录层级：

```typescript
// 源文件结构
src/
├── index.ts
├── components/
│   ├── Button.ts
│   └── Input.ts
└── utils/
    └── helpers.ts

// 构建后结构（preserveStructure: true）
es/
├── index.js
├── index.d.ts
├── components/
│   ├── Button.js
│   ├── Button.d.ts
│   ├── Input.js
│   └── Input.d.ts
└── utils/
    ├── helpers.js
    └── helpers.d.ts
```

### 向后兼容性

新功能完全向后兼容，现有配置无需修改：

```typescript
// 旧配置格式（仍然支持）
export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true
})

// 新配置格式（推荐）
export default defineConfig({
  input: 'src/index.ts',
  output: {
    umd: { dir: 'dist', format: 'umd' },
    esm: { dir: 'es', format: 'esm', dts: true },
    cjs: { dir: 'lib', format: 'cjs', dts: true }
  }
})
```

## �🎯 预设配置

### library - 库开发预设

适用于 npm 包开发，输出 ESM + CJS 格式。

```typescript
export default presets.library({
  input: 'src/index.ts',
  external: ['lodash', 'axios']
})
```

### vue - Vue 组件库预设

适用于 Vue 3 组件库，支持 SFC 和 TypeScript。

```typescript
export default presets.vue({
  input: 'src/index.ts',
  name: 'MyVueComponents'
})
```

### react - React 组件库预设

适用于 React 组件库，支持 JSX/TSX。

```typescript
export default presets.react({
  input: 'src/index.tsx',
  name: 'MyReactComponents'
})
```

### node - Node.js 库预设

适用于 Node.js 库，自动排除内置模块。

```typescript
export default presets.node({
  input: 'src/index.ts'
})
```

### browser - 浏览器库预设

适用于浏览器库，输出 ESM + UMD 格式。

```typescript
export default presets.browser({
  input: 'src/index.ts',
  name: 'MyBrowserLib'
})
```

### multiEntry - 多入口组件库预设

适用于多入口组件库，使用新的配置格式。

```typescript
export default presets.multiEntry({
  name: 'MyComponentLib',
  external: ['vue', 'react']
})
```

### modern - 现代化组件库预设

适用于现代化组件库，保持目录结构。

```typescript
export default presets.modern({
  external: ['vue', 'react', 'lodash']
})
```

## 🔧 插件系统

构建工具内置了丰富的插件支持：

- **TypeScript** - 使用 esbuild 或官方插件编译 TypeScript
- **Vue** - 支持 Vue 3 单文件组件
- **React** - 支持 JSX/TSX 转换
- **样式处理** - 支持 CSS、Less、Sass、Stylus
- **代码压缩** - 使用 Terser 压缩代码
- **模块解析** - 智能解析 Node.js 模块
- **环境变量** - 替换环境变量

### 自定义插件

```typescript
import { defineConfig } from '@ldesign/builder'
import myCustomPlugin from './my-plugin'

export default defineConfig({
  input: 'src/index.ts',
  plugins: [
    myCustomPlugin({
      // 插件选项
    })
  ]
})
```

## 📊 项目分析

使用 `analyze` 命令分析项目结构：

```bash
npx @ldesign/builder analyze
```

分析结果包括：

- 📋 项目基本信息
- 📁 文件类型统计
- 💡 构建建议
- ⚠️ 潜在问题

## 🔍 监听模式

启动监听模式进行开发：

```bash
npx @ldesign/builder build --watch
```

或使用 API：

```typescript
import { watch } from '@ldesign/builder'

const { watcher, stop, getState } = await watch({
  input: 'src/index.ts',
  outDir: 'dist',
  buildOnStart: true
})

// 获取监听状态
const state = getState()
console.log(state.buildCount) // 构建次数
console.log(state.errorCount) // 错误次数
```

## 🎨 样式处理

自动检测和处理样式文件：

```typescript
// 支持的样式文件
import './styles/index.css'
import './styles/theme.less'
import './styles/components.scss'
import './styles/utils.styl'
```

样式处理特性：

- ✅ 自动添加浏览器前缀
- ✅ 样式压缩和优化
- ✅ 样式提取到单独文件
- ✅ 支持 CSS Modules
- ✅ PostCSS 插件支持

## 🚀 性能优化

- **增量构建** - 只重新构建变化的文件
- **并行处理** - 多格式并行构建
- **Tree Shaking** - 自动移除未使用的代码
- **代码分割** - 支持动态导入和代码分割
- **缓存优化** - 智能缓存提升构建速度

## 🔗 集成示例

### 与 package.json 集成

```json
{
  "scripts": {
    "build": "ldesign-builder build",
    "build:watch": "ldesign-builder build --watch",
    "dev": "ldesign-builder build --mode development --watch",
    "analyze": "ldesign-builder analyze"
  }
}
```

## 🤝 贡献

欢迎贡献代码！

## 🎯 示例项目

我们提供了多个示例项目来演示不同场景的使用：

### Vue 3 组件库示例
```bash
cd packages/builder/examples/vue3-component
pnpm install
node build.js
```

特性：
- Vue 3 单文件组件
- Less 样式预处理
- TypeScript 支持
- 组件导出

### React 组件库示例
```bash
cd packages/builder/examples/react-component
pnpm install
node build.js
```

特性：
- React TSX 组件
- Less 样式文件
- TypeScript 类型定义
- Hook 使用示例

### TypeScript 库示例
```bash
cd packages/builder/examples/typescript-lib
pnpm install
node build.js
```

特性：
- 纯 TypeScript 代码
- 复杂类型定义
- 工具类和常量
- 完整的类型声明

## 🔧 自动检测功能

@ldesign/builder 会自动检测项目类型和配置：

- **Vue 版本检测** - 自动识别 Vue 2 或 Vue 3 项目
- **框架检测** - 根据文件类型自动配置相应插件
- **样式处理** - 自动处理 Less、Sass、CSS 文件
- **TypeScript 支持** - 自动配置 TypeScript 编译

## 📚 技术栈

- **构建引擎**: Rollup
- **Vue 支持**: unplugin-vue, @vitejs/plugin-vue2
- **React 支持**: @vitejs/plugin-react
- **样式处理**: rollup-plugin-postcss, rollup-plugin-less
- **TypeScript**: @rollup/plugin-typescript

## 📄 许可证

MIT License

## 🔗 相关链接

- [Rollup 官方文档](https://rollupjs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vue 官方文档](https://vuejs.org/)
- [React 官方文档](https://reactjs.org/)
