# LDesign Builder

智能前端库打包工具，基于 Rollup 的零配置多格式打包解决方案。

## 特性

- 🚀 **零配置启动** - 自动检测项目类型和依赖
- 📦 **多格式输出** - 支持 ES、CJS、UMD、IIFE 格式
- 🔧 **智能插件配置** - 根据项目自动配置最佳插件组合
- 📝 **TypeScript 支持** - 自动生成类型声明文件
- 🎯 **框架支持** - 内置 Vue、React、Svelte 支持
- 🔍 **项目分析** - 深度分析项目结构和依赖关系
- 👀 **监听模式** - 文件变化自动重新构建
- 🎨 **美观输出** - 彩色日志和进度显示

## 安装

```bash
# 全局安装
npm install -g @ldesign/builder

# 项目安装
npm install --save-dev @ldesign/builder
```

## 快速开始

### 1. 初始化项目配置

```bash
ldesign init
```

### 2. 构建项目

```bash
# 基础构建
ldesign build

# 指定入口文件
ldesign build src/index.ts

# 多格式输出
ldesign build --format es,cjs,umd

# 生成类型声明文件
ldesign build --dts
```

### 3. 监听模式

```bash
# 启动监听模式
ldesign watch

# 指定入口文件监听
ldesign watch src/index.ts
```

### 4. 项目分析

```bash
# 分析当前项目
ldesign analyze

# 分析指定目录
ldesign analyze ./src
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