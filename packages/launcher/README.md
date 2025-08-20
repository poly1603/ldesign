# Vite Launcher

一个强大的 Vite 前端项目启动器，支持多种框架和自动化配置。

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
npm install @ldesign/vite-launcher
# 或
yarn add @ldesign/vite-launcher
# 或
pnpm add @ldesign/vite-launcher
```

## 快速开始

### 命令行使用

```bash
# 创建新项目
npx @ldesign/vite-launcher create my-app --framework vue3

# 在现有目录初始化
npx @ldesign/vite-launcher init --framework react

# 启动开发服务器
npx @ldesign/vite-launcher dev

# 构建项目
npx @ldesign/vite-launcher build

# 预览构建结果
npx @ldesign/vite-launcher preview

# 查看项目信息
npx @ldesign/vite-launcher info
```

### 编程式使用

```typescript
import { ViteLauncher, createProject, startDev } from '@ldesign/vite-launcher';

// 创建启动器实例
const launcher = new ViteLauncher({
  logLevel: 'info',
  silent: false
});

// 创建新项目
await launcher.create({
  projectName: 'my-app',
  projectPath: './my-app',
  framework: 'vue3',
  features: ['typescript', 'router', 'pinia']
});

// 启动开发服务器
const server = await launcher.dev({
  projectPath: './my-app',
  port: 3000,
  open: true
});

// 构建项目
const result = await launcher.build({
  projectPath: './my-app',
  mode: 'production',
  analyze: true
});

console.log('构建完成:', result.stats);
```

### 便捷函数

```typescript
import { createProject, startDev, buildProject, startPreview, getProjectInfo } from '@ldesign/vite-launcher';

// 快速创建项目
await createProject({
  projectName: 'my-vue-app',
  projectPath: './my-vue-app',
  framework: 'vue3'
});

// 快速启动开发服务器
const server = await startDev('./my-vue-app', { port: 3000 });

// 快速构建项目
const result = await buildProject('./my-vue-app');

// 快速启动预览服务器
const previewServer = await startPreview('./my-vue-app');

// 获取项目信息
const info = await getProjectInfo('./my-vue-app');
```

## API 文档

### ViteLauncher 类

#### 构造函数

```typescript
const launcher = new ViteLauncher(options?: LauncherOptions);
```

**LauncherOptions:**
- `logLevel?: LogLevel` - 日志级别 ('silent' | 'error' | 'warn' | 'info' | 'debug')
- `silent?: boolean` - 是否静默模式
- `configFile?: string` - 自定义配置文件路径

#### 方法

##### create(options: CreateOptions)

创建新项目。

```typescript
await launcher.create({
  projectName: 'my-app',
  projectPath: './my-app',
  framework: 'vue3',
  features: ['typescript', 'router'],
  template?: 'default',
  packageManager?: 'npm',
  skipInstall?: false,
  overwrite?: false
});
```

##### dev(options: DevOptions)

启动开发服务器。

```typescript
const server = await launcher.dev({
  projectPath: './my-app',
  port?: 3000,
  host?: 'localhost',
  open?: true,
  cors?: true,
  https?: false,
  mode?: 'development'
});
```

##### build(options: BuildOptions)

构建项目。

```typescript
const result = await launcher.build({
  projectPath: './my-app',
  mode?: 'production',
  outDir?: 'dist',
  analyze?: false,
  minify?: true,
  sourcemap?: false,
  target?: 'es2015'
});
```

##### preview(options: PreviewOptions)

预览构建结果。

```typescript
const server = await launcher.preview({
  projectPath: './my-app',
  port?: 4173,
  host?: 'localhost',
  open?: true,
  outDir?: 'dist'
});
```

##### getProjectInfo(projectPath: string)

获取项目信息。

```typescript
const info = await launcher.getProjectInfo('./my-app');
// 返回: DetectionResult
```

##### stop()

停止所有服务器。

```typescript
await launcher.stop();
```

### 支持的框架

- **Vue 2** - `vue2`
- **Vue 3** - `vue3`
- **React** - `react`
- **Next.js** - `nextjs`
- **Lit** - `lit`
- **Svelte** - `svelte`
- **Angular** - `angular`
- **Vanilla JS** - `vanilla`
- **TypeScript** - `typescript`

### 支持的特性

- `typescript` - TypeScript 支持
- `router` - 路由支持
- `pinia` - Pinia 状态管理 (Vue)
- `vuex` - Vuex 状态管理 (Vue)
- `redux` - Redux 状态管理 (React)
- `tailwind` - Tailwind CSS
- `sass` - Sass/SCSS 支持
- `less` - Less 支持
- `stylus` - Stylus 支持
- `eslint` - ESLint 代码检查
- `prettier` - Prettier 代码格式化
- `vitest` - Vitest 测试框架
- `jest` - Jest 测试框架
- `cypress` - Cypress E2E 测试
- `playwright` - Playwright E2E 测试
- `pwa` - PWA 支持
- `electron` - Electron 支持

## 配置

### 配置文件

在项目根目录创建 `vite-launcher.config.js` 或 `vite-launcher.config.ts`：

```typescript
import { defineConfig } from '@ldesign/vite-launcher';

export default defineConfig({
  // 默认框架
  defaultFramework: 'vue3',
  
  // 默认特性
  defaultFeatures: ['typescript', 'router'],
  
  // 自定义模板
  templates: {
    'my-template': {
      framework: 'vue3',
      features: ['typescript', 'router', 'pinia'],
      files: {
        // 自定义文件模板
      }
    }
  },
  
  // 自定义插件
  plugins: [
    {
      name: 'my-plugin',
      framework: ['vue3'],
      plugin: () => import('my-vite-plugin')
    }
  ],
  
  // 预设配置
  presets: {
    vue3: {
      // Vue 3 预设配置
    },
    react: {
      // React 预设配置
    }
  }
});
```

### 环境变量

- `VITE_LAUNCHER_LOG_LEVEL` - 日志级别
- `VITE_LAUNCHER_SILENT` - 静默模式
- `VITE_LAUNCHER_CONFIG` - 配置文件路径

## 错误处理

```typescript
import { LauncherError, ERROR_CODES } from '@ldesign/vite-launcher';

try {
  await launcher.create(options);
} catch (error) {
  if (error instanceof LauncherError) {
    console.error('错误代码:', error.code);
    console.error('错误消息:', error.message);
    console.error('建议:', error.suggestion);
    console.error('详情:', error.details);
  }
}
```

## 插件开发

```typescript
import { PluginConfig } from '@ldesign/vite-launcher';

const myPlugin: PluginConfig = {
  name: 'my-plugin',
  framework: ['vue3', 'react'],
  required: false,
  plugin: async () => {
    const plugin = await import('my-vite-plugin');
    return plugin.default();
  },
  dependencies: ['my-vite-plugin'],
  devDependencies: ['@types/my-plugin'],
  config: {
    // 插件配置
  }
};
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License