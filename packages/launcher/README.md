# Vite Launcher

一个强大的 Vite 前端项目启动器，支持多种框架和自动化配置。🎉 让前端项目创建和管理变得简单有趣！

## 特性

- 🚀 **快速创建项目** - 支持 Vue2/3、React、Lit、Svelte、Angular、Vanilla/TS 等多种框架
- 🔧 **智能配置管理** - 自动检测项目类型并生成最优配置
- 📦 **插件管理** - 内置常用插件，支持自定义插件扩展
- 🛠️ **开发工具集成** - 集成开发服务器、构建工具、预览服务器
- 📊 **构建分析** - 详细的构建统计和性能分析
- 🎯 **TypeScript 支持** - 完整的 TypeScript 类型定义
- 🔍 **项目检测** - 智能识别现有项目框架类型
- ⚡ **高性能** - 基于 Vite 的极速开发体验

## 安装

```bash
npm install @ldesign/launcher
# 或
yarn add @ldesign/launcher
# 或
pnpm add @ldesign/launcher
```

## 快速开始

### 编程式使用

```typescript
import { ViteLauncher, createProject, startDev } from '@ldesign/launcher';

// 创建启动器实例
const launcher = new ViteLauncher({
  logLevel: 'info',
  mode: 'development'
});

// 创建新项目
await launcher.create('./my-app', 'vue3', { force: true });

// 启动开发服务器
const server = await launcher.dev('./my-app', {
  port: 3000,
  open: true
});

// 构建项目
const result = await launcher.build('./my-app', {
  mode: 'production',
  outDir: 'dist'
});

console.log('构建完成:', result.stats);
```

### 便捷函数

```typescript
import { 
  createProject, 
  startDev, 
  buildProject, 
  startPreview, 
  getProjectInfo,
  createLauncher 
} from '@ldesign/launcher';

// 快速创建项目
await createProject('./my-vue-app', 'vue3');

// 快速启动开发服务器
const server = await startDev('./my-vue-app', { port: 3000 });

// 快速构建项目
const buildResult = await buildProject('./my-vue-app', { 
  outDir: 'build',
  minify: true 
});

// 快速启动预览服务器
const previewServer = await startPreview('./my-vue-app', { port: 4173 });

// 获取项目信息
const projectInfo = await getProjectInfo('./my-vue-app');
console.log('项目类型:', projectInfo.type);
console.log('是否使用TypeScript:', projectInfo.hasTypeScript);

// 创建自定义配置的启动器
const customLauncher = createLauncher({
  logLevel: 'error',
  mode: 'production',
  autoDetect: false
});
```

### 默认实例

```typescript
import launcher from '@ldesign/launcher';

// 使用默认实例
await launcher.create('./my-app', 'react');
const server = await launcher.dev('./my-app');
await launcher.stop();
```

## API 参考

### ViteLauncher 类

#### 构造函数

```typescript
new ViteLauncher(options?: LauncherOptions)
```

**选项:**
- `logLevel`: 日志级别 ('error' | 'warn' | 'info' | 'silent')
- `mode`: 运行模式 ('development' | 'production')
- `autoDetect`: 是否启用自动项目类型检测
- `root`: 项目根目录路径
- `configFile`: Vite配置文件路径

#### 方法

##### create(projectPath, projectType, options?)

创建新项目。

```typescript
await launcher.create('./my-app', 'vue3', { 
  template: 'default',
  force: true 
});
```

##### dev(projectPath?, options?)

启动开发服务器。

```typescript
const server = await launcher.dev('./my-app', {
  port: 3000,
  host: 'localhost',
  open: true,
  https: false
});
```

##### build(projectPath?, options?)

构建项目。

```typescript
const result = await launcher.build('./my-app', {
  outDir: 'dist',
  minify: true,
  sourcemap: false,
  emptyOutDir: true
});
```

##### preview(projectPath?, options?)

启动预览服务器。

```typescript
const server = await launcher.preview('./my-app', {
  port: 4173,
  host: 'localhost',
  outDir: 'dist'
});
```

##### stop()

停止当前服务器。

```typescript
await launcher.stop();
```

##### destroy()

销毁启动器实例。

```typescript
await launcher.destroy();
```

##### getProjectInfo(projectPath?)

获取项目信息。

```typescript
const info = await launcher.getProjectInfo('./my-app');
```

##### configure(config)

更新配置。

```typescript
launcher.configure({
  server: { port: 3000 },
  build: { outDir: 'build' }
});
```

### 支持的项目类型

- `vue2` - Vue 2.x 项目
- `vue3` - Vue 3.x 项目
- `react` - React 项目
- `react-next` - Next.js 项目
- `lit` - Lit 项目
- `svelte` - Svelte 项目
- `angular` - Angular 项目
- `vanilla` - 原生 JavaScript 项目
- `vanilla-ts` - 原生 TypeScript 项目

### 类型定义

```typescript
import type {
  ViteLauncher,
  LauncherOptions,
  DevOptions,
  BuildOptions,
  PreviewOptions,
  ProjectType,
  BuildResult,
  ProjectInfo
} from '@ldesign/launcher';
```

## 错误处理

启动器提供了完善的错误处理机制：

```typescript
import { ERROR_CODES } from '@ldesign/launcher';

try {
  await launcher.create('./my-app', 'vue3');
} catch (error) {
  if (error.code === ERROR_CODES.INVALID_PROJECT_ROOT) {
    console.log('项目根目录无效');
  } else if (error.code === ERROR_CODES.BUILD_FAILED) {
    console.log('构建失败');
  }
}
```

## 开发

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试UI
npm run test:ui

# 运行测试一次
npm run test:run
```

### 构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint
npm run lint:fix
```

## 示例

### 基本使用

查看 `examples/basic-usage.ts` 了解基本使用方法。

### 高级使用

查看 `examples/advanced-usage.ts` 了解高级功能和最佳实践。

### 快速开始

```typescript
import { ViteLauncher, createProject, startDev } from '@ldesign/launcher'

// 创建项目
await createProject('./my-app', 'vue3', { force: true })

// 启动开发服务器
const server = await startDev('./my-app', { port: 3000 })

// 构建项目
const result = await buildProject('./my-app', { outDir: 'dist' })
```

### 运行示例

```bash
# 运行基本使用示例
npx tsx examples/basic-usage.ts

# 运行高级使用示例
npx tsx examples/advanced-usage.ts
```

## 优化总结

本项目已经完成了主要的优化工作，包括：

- ✅ 移除了CLI相关代码，专注于类库导出
- ✅ 优化了核心架构和API设计
- ✅ 添加了完整的TypeScript类型定义
- ✅ 创建了完整的测试框架
- ✅ 更新了文档和使用示例

详细优化内容请查看 [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)

## 测试状态

当前测试通过率: **35/37 (94.6%)**

- ✅ ViteLauncher基础功能测试 (11/11)
- ✅ ViteLauncher简化测试 (8/8)  
- ✅ ErrorHandler服务测试 (7/7)
- ✅ 集成测试 (9/11)

## 构建输出

项目使用 tsup 进行打包，生成以下文件：

- `dist/index.cjs` - CommonJS格式 (68.69 KB)
- `dist/index.js` - ESM格式 (66.55 KB)  
- `dist/index.d.ts` - TypeScript类型声明 (21.05 KB)
- `dist/index.d.cts` - CommonJS类型声明 (21.05 KB)

## 许可证

MIT
