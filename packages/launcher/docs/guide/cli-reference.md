---
title: 命令行参考
description: launcher CLI 的命令、选项、环境变量、故障排除与最佳实践
---

# 命令行参考

@ldesign/launcher 提供了强大而直观的命令行接口，支持开发、构建、预览等完整的前端开发流程。

## 📋 命令总览

| 命令 | 描述 | 快捷键 |
|------|------|--------|
| dev | 启动开发服务器 | d |
| build | 构建生产版本 | b |
| preview | 预览构建结果 | p |
| config | 配置管理 | c |
| help | 显示帮助信息 | h |
| version | 显示版本信息 | v |

## 🚀 开发服务器 (`dev`)

启动本地开发服务器，支持热模块替换 (HMR) 和实时重载。

### 基本语法

```bash
launcher dev [options]
```

### 选项参数

| 参数 | 短参数 | 类型 | 默认值 | 描述 |
|------|--------|------|--------|------|
| --port | -p | number | 3000 | 指定服务器端口 |
| --host | -H | string | 127.0.0.1 | 指定主机地址 |
| --open | -o | boolean | false | 自动打开浏览器 |
| --https |  | boolean | false | 启用 HTTPS |
| --config | -c | string |  | 指定配置文件路径 |
| --mode | -m | string | development | 设置运行模式 |
| --debug | -d | boolean | false | 启用调试模式 |
| --silent | -s | boolean | false | 静默模式 |

### 使用示例

```bash
# 基本使用
launcher dev

# 指定端口
launcher dev --port 8080
launcher dev -p 8080

# 指定主机和端口
launcher dev --host 0.0.0.0 --port 3001

# 自动打开浏览器
launcher dev --open
launcher dev --open chrome  # 指定浏览器

# 启用 HTTPS
launcher dev --https

# 使用自定义配置文件
launcher dev --config ./my-config.ts

# 设置运行模式
launcher dev --mode staging

# 调试模式
launcher dev --debug

# 静默模式（最少日志输出）
launcher dev --silent

# 组合使用
launcher dev -p 8080 -o -d
```

### 环境变量

开发服务器支持以下环境变量：

```bash
# 设置端口
PORT=3000 launcher dev

# 设置主机
HOST=0.0.0.0 launcher dev

# 设置模式
NODE_ENV=development launcher dev

# 启用调试
DEBUG=launcher:* launcher dev
```

## 🏗 构建 (`build`)

构建生产版本的应用程序。

### 基本语法

```bash
launcher build [options]
```

### 选项参数

| 参数 | 短参数 | 类型 | 默认值 | 描述 |
|------|--------|------|--------|------|
| --outDir | -o | string | dist | 指定输出目录 |
| --mode | -m | string | production | 设置构建模式 |
| --target | -t | string | modules | 构建目标 |
| --sourcemap |  | boolean | false | 生成 source map |
| --minify |  | boolean | true | 代码压缩 |
| --watch | -w | boolean | false | 监听模式 |
| --emptyOutDir |  | boolean | true | 清空输出目录 |
| --config | -c | string |  | 指定配置文件路径 |
| --debug | -d | boolean | false | 启用调试模式 |
| --silent | -s | boolean | false | 静默模式 |

### 使用示例

```bash
# 基本构建
launcher build

# 指定输出目录
launcher build --outDir build
launcher build -o ./output

# 生成 source map
launcher build --sourcemap

# 禁用代码压缩
launcher build --minify false

# 指定压缩工具
launcher build --minify terser
launcher build --minify esbuild

# 设置构建目标
launcher build --target es2015
launcher build --target esnext

# 监听模式（开发时构建）
launcher build --watch
launcher build -w

# 不清空输出目录
launcher build --emptyOutDir false

# 使用自定义配置
launcher build --config ./prod.config.ts

# 设置构建模式
launcher build --mode production
launcher build --mode staging

# 组合使用
launcher build -o dist --sourcemap --debug
```

### 构建报告

构建完成后，launcher 会显示详细的构建报告：

```bash
✓ 构建完成 (2.34s)

dist/index.html                   1.23 kB
dist/assets/index-a1b2c3d4.js    145.67 kB │ gzip: 52.31 kB
dist/assets/index-e5f6g7h8.css    12.45 kB │ gzip: 3.21 kB

✨ 构建优化提示:
  • 已启用代码分割，减少首次加载大小
  • 建议启用 gzip 压缩以进一步减小文件大小
```

## 👀 预览 (`preview`)

预览构建后的应用程序。

### 基本语法

```bash
launcher preview [options]
```

### 选项参数

| 参数 | 短参数 | 类型 | 默认值 | 描述 |
|------|--------|------|--------|------|
| --port | -p | number | 4173 | 指定服务器端口 |
| --host | -H | string | 127.0.0.1 | 指定主机地址 |
| --open | -o | boolean | false | 自动打开浏览器 |
| --https |  | boolean | false | 启用 HTTPS |
| --outDir |  | string | dist | 指定预览目录 |
| --config | -c | string |  | 指定配置文件路径 |
| --debug | -d | boolean | false | 启用调试模式 |
| --silent | -s | boolean | false | 静默模式 |

### 使用示例

```bash
# 基本预览
launcher preview

# 指定端口
launcher preview --port 8080

# 自动打开浏览器
launcher preview --open

# 预览指定目录
launcher preview --outDir build

# 启用 HTTPS
launcher preview --https

# 组合使用
launcher preview -p 5000 -o --https
```

## ⚙️ 配置管理 (`config`)

管理项目配置文件和预设。

### 基本语法

```bash
launcher config <subcommand> [options]
```

### 子命令

#### `init` - 初始化配置

创建新的配置文件：

```bash
# 自动检测项目类型并生成配置
launcher config init

# 指定预设类型
launcher config init --preset vue3-ts

# 指定输出文件
launcher config init --output launcher.config.js

# 生成 JavaScript 格式
launcher config init --no-typescript

# 包含详细注释
launcher config init --with-comments
```

**选项参数：**

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--preset` | `string` | auto-detect | 指定项目预设 |
| `--output` | `string` | `launcher.config.ts` | 输出文件路径 |
| `--typescript` | `boolean` | `true` | 生成 TypeScript 配置 |
| `--with-comments` | `boolean` | `true` | 包含注释说明 |
| `--force` | `boolean` | `false` | 强制覆盖已存在文件 |

#### `validate` - 验证配置

检查配置文件的正确性：

```bash
# 验证默认配置文件
launcher config validate

# 验证指定配置文件
launcher config validate --config ./custom.config.ts

# 严格模式验证
launcher config validate --strict
```

**选项参数：**

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config` | `string` | auto-find | 指定配置文件 |
| `--strict` | `boolean` | `false` | 启用严格验证模式 |
| `--fix` | `boolean` | `false` | 自动修复可修复的问题 |

#### `show` - 显示配置

显示当前有效的配置：

```bash
# 显示完整配置
launcher config show

# 显示指定部分
launcher config show --section server
launcher config show --section build

# JSON 格式输出
launcher config show --json

# 显示配置来源
launcher config show --with-source
```

#### `list` - 列出预设

显示可用的项目预设：

```bash
# 列出所有预设
launcher config list

# 显示预设详情
launcher config list --detailed

# 仅显示指定类型
launcher config list --type vue
```

### 配置文件查找顺序

Launcher 按以下顺序查找配置文件：

1. `launcher.config.ts`
2. `launcher.config.mjs`
3. `launcher.config.js`
4. `launcher.config.cjs`
5. `vite.config.ts`
6. `vite.config.mjs`
7. `vite.config.js`
8. `vite.config.cjs`

## ❓ 帮助 (`help`)

显示帮助信息。

### 基本语法

```bash
launcher help [command]
launcher --help
launcher -h
```

### 使用示例

```bash
# 显示总体帮助
launcher help
launcher --help

# 显示特定命令帮助
launcher help dev
launcher dev --help

# 显示配置子命令帮助
launcher help config
launcher config --help
```

## 🔖 版本 (`version`)

显示版本信息。

### 基本语法

```bash
launcher version
launcher --version
launcher -v
```

### 输出示例

```bash
@ldesign/launcher v1.0.0

Dependencies:
  vite: 5.0.0
  node: 20.10.0

System:
  OS: Windows 10
  CPU: x64
```

## 🌍 全局选项

所有命令都支持以下全局选项：

| 参数 | 短参数 | 类型 | 默认值 | 描述 |
|------|--------|------|--------|------|
| `--config` | `-c` | `string` | auto-find | 指定配置文件路径 |
| `--mode` | `-m` | `string` | command-dependent | 设置运行模式 |
| `--debug` | `-d` | `boolean` | `false` | 启用详细调试日志 |
| `--silent` | `-s` | `boolean` | `false` | 静默模式，最少日志输出 |
| `--help` | `-h` | `boolean` | `false` | 显示命令帮助 |
| `--version` | `-v` | `boolean` | `false` | 显示版本信息 |

## 🔧 环境变量

### 系统环境变量

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `NODE_ENV` | 节点环境 | `development`, `production` |
| `PORT` | 默认端口号 | `3000` |
| `HOST` | 默认主机地址 | `localhost`, `0.0.0.0` |
| `HTTPS` | 启用 HTTPS | `true`, `false` |
| `DEBUG` | 调试日志 | `launcher:*`, `vite:*` |

### Launcher 专用环境变量

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `LAUNCHER_CONFIG` | 配置文件路径 | `./config/launcher.config.ts` |
| `LAUNCHER_MODE` | 运行模式 | `development`, `production` |
| `LAUNCHER_LOG_LEVEL` | 日志级别 | `debug`, `info`, `warn`, `error` |
| `LAUNCHER_CACHE_DIR` | 缓存目录 | `node_modules/.launcher` |

## 📝 配置文件示例

### 基本配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 继承预设
  launcher: {
    preset: 'vue3-ts'
  },
  
  // 开发服务器
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    https: false
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser'
  },
  
  // 预览配置
  preview: {
    port: 4173,
    open: true
  }
})
```

### 高级配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    // 多重继承
    extends: ['vue3-ts', './base.config.ts'],
    
    // 环境变量配置
    env: {
      envFile: ['.env', '.env.local', `.env.${process.env.NODE_ENV}`],
      variables: {
        BUILD_TIME: new Date().toISOString()
      },
      required: ['API_BASE_URL']
    },
    
    // 库模式
    lib: {
      entry: './src/index.ts',
      name: 'MyLibrary',
      formats: ['es', 'cjs', 'umd']
    },
    
    // 多入口
    entry: {
      entries: {
        main: './src/main.ts',
        admin: './src/admin/main.ts'
      }
    }
  },
  
  // 代理配置
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
```

## 🎯 最佳实践

### 1. 脚本配置

在 `package.json` 中配置便捷脚本：

```json
{
  "scripts": {
    "dev": "launcher dev",
    "dev:host": "launcher dev --host 0.0.0.0",
    "build": "launcher build",
    "build:staging": "launcher build --mode staging",
    "preview": "launcher preview",
    "lint": "launcher config validate"
  }
}
```

### 2. 环境配置

使用环境文件管理不同环境的配置：

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_LOG_LEVEL=debug

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_LOG_LEVEL=error

# .env.staging
VITE_API_BASE_URL=https://staging-api.example.com
VITE_LOG_LEVEL=warn
```

### 3. 调试技巧

```bash
# 详细日志调试
DEBUG=launcher:* launcher dev --debug

# 性能分析
launcher build --debug --mode=profile

# 网络调试
launcher dev --host 0.0.0.0 --debug
```

## 🚨 故障排除

### 常见错误

1. **端口被占用**
   ```bash
   Error: Port 3000 is already in use
   ```
   解决方案：使用 `--port` 参数指定其他端口

2. **配置文件错误**
   ```bash
   Error: Failed to load config file
   ```
   解决方案：使用 `launcher config validate` 检查配置

3. **依赖缺失**
   ```bash
   Error: Cannot resolve plugin "@vitejs/plugin-vue"
   ```
   解决方案：安装相关依赖或使用预设配置

### 获取帮助

```bash
# 检查版本和环境
launcher --version

# 验证配置
launcher config validate

# 调试模式运行
launcher dev --debug

# 查看详细日志
DEBUG=launcher:* launcher dev
```

---

## 📚 相关文档

- [快速开始](./quick-start.md)
- [配置文档](./configuration.md)
- [最佳实践](./best-practices.md)
- [常见问题](./faq.md)
