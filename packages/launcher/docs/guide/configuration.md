# 配置选项

本章详细介绍 Vite Launcher 的所有配置选项。

## LauncherOptions

启动器的主要配置选项。

```typescript
interface LauncherOptions {
  logLevel?: 'error' | 'warn' | 'info' | 'silent' // 日志级别
  mode?: 'development' | 'production' // 运行模式
  autoDetect?: boolean // 是否启用自动检测
  root?: string // 项目根目录
  configFile?: string // Vite 配置文件路径
}
```

### 示例

```typescript
const launcher = new ViteLauncher({
  logLevel: 'info',
  mode: 'development',
  autoDetect: true,
  root: process.cwd(),
  configFile: 'vite.config.ts'
})
```

## DevOptions

开发服务器配置选项。

```typescript
interface DevOptions {
  port?: number // 端口号，默认 5173
  host?: string // 主机地址，默认 'localhost'
  open?: boolean // 是否自动打开浏览器
  https?: boolean // 是否使用 HTTPS
  cors?: boolean // 是否启用 CORS
}
```

### 示例

```typescript
const server = await launcher.dev('./my-app', {
  port: 3000,
  host: '0.0.0.0',
  open: true,
  https: false,
  cors: true
})
```

## BuildOptions

构建配置选项。

```typescript
interface BuildOptions {
  outDir?: string // 输出目录，默认 'dist'
  minify?: boolean | 'terser' | 'esbuild' // 压缩选项
  sourcemap?: boolean // 是否生成 sourcemap
  emptyOutDir?: boolean // 是否清空输出目录
  target?: string // 目标环境
}
```

### 示例

```typescript
const result = await launcher.build('./my-app', {
  outDir: 'dist',
  minify: 'terser',
  sourcemap: true,
  emptyOutDir: true,
  target: 'es2015'
})
```

## PreviewOptions

预览服务器配置选项。

```typescript
interface PreviewOptions {
  port?: number // 端口号，默认 4173
  host?: string // 主机地址，默认 'localhost'
  outDir?: string // 输出目录，默认 'dist'
  open?: boolean // 是否自动打开浏览器
}
```

### 示例

```typescript
const server = await launcher.preview('./my-app', {
  port: 4173,
  host: 'localhost',
  outDir: 'dist',
  open: true
})
```

## CreateOptions

项目创建配置选项。

```typescript
interface CreateOptions {
  template?: string // 模板名称
  force?: boolean // 是否强制覆盖现有目录
}
```

### 示例

```typescript
await launcher.create('./my-app', 'vue3', {
  template: 'typescript',
  force: true
})
```

## 环境变量配置

### 开发环境

```bash
# .env.development
VITE_LAUNCHER_LOG_LEVEL=info
VITE_LAUNCHER_MODE=development
VITE_LAUNCHER_PORT=3000
```

### 生产环境

```bash
# .env.production
VITE_LAUNCHER_LOG_LEVEL=silent
VITE_LAUNCHER_MODE=production
VITE_LAUNCHER_OUT_DIR=dist
```

## 配置文件示例

### vite.config.ts

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true
  }
})
```

### 自定义配置

```typescript
const launcher = new ViteLauncher()

launcher.configure({
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: false
  },
  plugins: [
    // 自定义插件
  ]
})
```

## 配置优先级

1. 命令行参数
2. 环境变量
3. 配置文件
4. 默认值

## 最佳实践

1. **环境分离**: 为不同环境使用不同的配置
2. **配置验证**: 验证配置的有效性
3. **默认值**: 提供合理的默认配置
4. **文档化**: 记录配置选项的用途
