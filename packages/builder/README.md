# @ldesign/builder

🚀 **智能化前端库打包工具** - 基于 Rollup 的现代化构建解决方案

一个专为现代前端开发设计的智能打包工具，能够自动检测项目类型、智能配置构建选项，让你专注于代码而非配置！

## ✨ 核心特性

### 🧠 智能项目检测
- **自动识别项目类型**：Vue、React、TypeScript、JavaScript 等
- **智能文件分析**：自动检测 .ts、.tsx、.vue、.jsx、.css、.less、.scss 等文件
- **依赖关系分析**：构建完整的项目依赖图谱

### 🔧 现代插件系统
- **Vue 完美支持**：使用 `unplugin-vue` 处理 Vue 单文件组件
- **Vue JSX 支持**：使用 `unplugin-vue-jsx` 处理 Vue JSX 语法
- **TypeScript 原生支持**：完整的 TS 编译和类型生成
- **样式预处理器**：支持 CSS、Less、Sass、Stylus 等

### 📦 多格式输出
- **ESM 格式**：现代 ES 模块，保持目录结构
- **CJS 格式**：CommonJS 兼容，Node.js 友好
- **UMD 格式**：通用模块，浏览器直接可用
- **类型声明**：自动生成 TypeScript 声明文件

### 🎯 编程式 API
- **零配置体验**：开箱即用，无需复杂配置
- **类型安全**：完整的 TypeScript 类型定义
- **简洁优雅**：直观的 API 设计

## 🚀 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/builder

# 使用 npm
npm install @ldesign/builder

# 使用 yarn
yarn add @ldesign/builder
```

## 🚀 快速开始

### 基础使用

```typescript
import { build } from '@ldesign/builder'

// 最简单的使用方式 - 零配置！
await build({
  input: 'src/index.ts',
  outDir: 'dist'
})

// 系统会自动：
// ✅ 检测项目类型
// ✅ 配置相应插件
// ✅ 生成多种格式
// ✅ 创建类型声明
```

### Vue 组件库

```typescript
import { build, defineConfig } from '@ldesign/builder'

const config = defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  external: ['vue'],
  globals: { vue: 'Vue' },
  name: 'MyVueLibrary'
})

await build(config)
```

### React 组件库

```typescript
await build({
  input: 'src/index.tsx',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'react-dom'],
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
})
```

### TypeScript 工具库

```typescript
await build({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true,
  minify: true
})
```

## 配置文件

在项目根目录创建 `ldesign.config.ts` 或 `ldesign.config.js`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['es', 'cjs', 'umd'],
    name: 'MyLibrary'
  },
  
  // 生成类型声明文件
  dts: true,
  
  // 外部依赖
  external: ['vue', 'react'],
  
  // 插件配置
  plugins: {
    typescript: {
      target: 'es2020'
    },
    terser: {
      compress: {
        drop_console: true
      }
    }
  },
  
  // 构建模式
  mode: 'production'
})
```

## API 使用

### 编程式 API

```typescript
import { build, watch, analyze, createBuilder } from '@ldesign/builder'

// 构建项目
const result = await build({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['es', 'cjs']
  },
  dts: true
})

// 监听模式
await watch({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['es']
  }
})

// 项目分析
const analysis = await analyze('./src')
console.log(analysis)

// 创建自定义构建器
const { builder, typeGenerator } = await createBuilder({
  input: 'src/index.ts',
  output: { dir: 'dist' }
})

const buildResult = await builder.build()
```

### 核心类使用

```typescript
import {
  ProjectScanner,
  PluginConfigurator,
  RollupBuilder,
  TypeGenerator,
  Logger
} from '@ldesign/builder'

// 项目扫描
const scanner = new ProjectScanner('./src')
const scanResult = await scanner.scan()

// 插件配置
const configurator = new PluginConfigurator()
const plugins = await configurator.configure(scanResult, options)

// Rollup 构建
const builder = new RollupBuilder(options)
const result = await builder.build()

// 类型生成
const typeGen = new TypeGenerator()
await typeGen.generate({
  input: 'src/index.ts',
  output: 'dist/index.d.ts'
})
```

## 命令行选项

### build 命令

```bash
ldesign build [input] [options]

选项:
  -o, --output <dir>           输出目录 (默认: dist)
  -f, --format <formats>       输出格式 (es,cjs,umd,iife)
  -n, --name <name>           UMD/IIFE 全局变量名
  --dts [type]                生成类型声明文件 (bundled|separate)
  --external <deps>           外部依赖列表
  --mode <mode>               构建模式 (development|production)
  -c, --config <file>         配置文件路径
  --minify                    压缩输出
  --sourcemap                 生成 sourcemap
  -v, --verbose               详细日志
  -s, --silent                静默模式
```

### watch 命令

```bash
ldesign watch [input] [options]

选项:
  -o, --output <dir>           输出目录
  -f, --format <formats>       输出格式
  --debounce <ms>             防抖延迟 (默认: 100ms)
  --ignore <patterns>         忽略文件模式
  -c, --config <file>         配置文件路径
  -v, --verbose               详细日志
```

### init 命令

```bash
ldesign init [options]

选项:
  -t, --template <type>       项目模板 (vanilla|vue|react)
  --typescript                使用 TypeScript
  -o, --output <dir>          输出目录
  -f, --force                 强制覆盖现有文件
```

### analyze 命令

```bash
ldesign analyze [input] [options]

选项:
  --depth <number>            扫描深度
  --include <patterns>        包含文件模式
  --exclude <patterns>        排除文件模式
  -v, --verbose               详细输出
```

## 支持的文件类型

- **JavaScript**: `.js`, `.mjs`, `.cjs`
- **TypeScript**: `.ts`, `.tsx`
- **Vue**: `.vue`
- **React**: `.jsx`, `.tsx`
- **Svelte**: `.svelte`
- **样式**: `.css`, `.scss`, `.sass`, `.less`, `.styl`
- **资源**: `.png`, `.jpg`, `.svg`, `.woff`, `.woff2`

## 插件系统

内置插件自动配置，支持：

- **语言插件**: TypeScript, Babel, Esbuild
- **框架插件**: Vue, React, Svelte
- **样式插件**: PostCSS, Sass, Less, Stylus
- **优化插件**: Terser, Replace, Strip
- **开发插件**: Serve, Livereload

### 自定义插件

```typescript
export default defineConfig({
  plugins: {
    // 覆盖内置插件配置
    typescript: {
      target: 'es2020',
      declaration: true
    },
    
    // 添加自定义插件
    custom: [
      myCustomPlugin(),
      anotherPlugin({
        option: 'value'
      })
    ]
  }
})
```

## 项目模板

### Vanilla JavaScript/TypeScript

```bash
ldesign init --template vanilla
ldesign init --template vanilla --typescript
```

### Vue 组件库

```bash
ldesign init --template vue
ldesign init --template vue --typescript
```

### React 组件库

```bash
ldesign init --template react
ldesign init --template react --typescript
```

## 最佳实践

### 1. 库开发

```typescript
export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['es', 'cjs']
  },
  dts: 'bundled',
  external: ['vue', 'react'], // 不打包框架依赖
  mode: 'production'
})
```

### 2. 组件库开发

```typescript
export default defineConfig({
  input: {
    index: 'src/index.ts',
    button: 'src/components/button/index.ts',
    input: 'src/components/input/index.ts'
  },
  output: {
    dir: 'dist',
    format: ['es']
  },
  dts: 'separate', // 每个组件单独的类型文件
  preserveModules: true // 保持模块结构
})
```

### 3. 工具库开发

```typescript
export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['es', 'cjs', 'umd'],
    name: 'MyUtils'
  },
  dts: true,
  minify: true,
  sourcemap: true
})
```

## 故障排除

### 常见问题

1. **构建失败**
   - 检查入口文件是否存在
   - 确认依赖是否正确安装
   - 查看详细错误日志：`ldesign build -v`

2. **类型生成失败**
   - 确认 TypeScript 配置正确
   - 检查 `tsconfig.json` 文件
   - 使用 `--verbose` 查看详细信息

3. **插件配置问题**
   - 查看项目分析结果：`ldesign analyze -v`
   - 检查插件依赖是否安装
   - 自定义插件配置

### 调试模式

```bash
# 启用详细日志
ldesign build --verbose

# 启用调试日志
DEBUG=ldesign:* ldesign build

# 分析项目结构
ldesign analyze --verbose
```

## 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新信息。

## 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 相关链接

- [官方文档](https://ldesign.dev/builder)
- [GitHub 仓库](https://github.com/ldesign/builder)
- [问题反馈](https://github.com/ldesign/builder/issues)
- [讨论区](https://github.com/ldesign/builder/discussions)