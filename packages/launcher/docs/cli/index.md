---
title: CLI 工具
---

# CLI 工具

@ldesign/launcher 提供了强大且易用的命令行界面，让您可以快速执行开发、构建和预览任务。

## 📋 命令概览

| 命令 | 描述 | 示例 |
|------|------|------|
| [dev](./dev) | 启动开发服务器 | launcher dev --port 3000 |
| [build](./build) | 执行生产构建 | launcher build --outDir dist |
| [preview](./preview) | 启动预览服务器 | launcher preview --port 4173 |
| [config](./config) | 配置管理工具 | launcher config list |
| [help](./help) | 显示帮助信息 | launcher help dev |
| [version](./version) | 显示版本信息 | launcher --version |

## 🚀 快速开始

### 安装

首先确保已安装 @ldesign/launcher：

```bash
# 全局安装 (推荐)
pnpm add -g @ldesign/launcher

# 或项目本地安装
pnpm add @ldesign/launcher
```

### 基本用法

```bash
# 启动开发服务器
launcher dev

# 执行生产构建
launcher build

# 预览构建结果
launcher preview

# 查看帮助
launcher --help
```

## 🔧 全局选项

所有命令都支持以下全局选项：

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| --config | -c | 指定配置文件路径 | 自动检测 |
| --mode | -m | 指定运行模式 | development / production |
| --debug | -d | 启用调试模式 | false |
| --silent | -s | 静默模式（禁用输出） | false |
| --help | -h | 显示帮助信息 | - |
| --version | -v | 显示版本信息 | - |

### 使用示例

```bash
# 使用自定义配置文件
launcher dev --config ./custom.config.ts

# 指定运行模式
launcher build --mode staging

# 启用调试模式
launcher dev --debug

# 静默模式运行
launcher build --silent

# 组合多个选项
launcher dev --config ./dev.config.js --debug --port 8080
```

## 📁 配置文件

CLI 工具会按以下优先级查找配置文件：

1. 命令行指定的配置文件 (--config)
2. 项目根目录中的配置文件（按优先级从高到低）：
   - vite.config.ts
   - vite.config.mjs
   - vite.config.js
   - vite.config.cjs
   - launcher.config.mjs
   - launcher.config.ts
   - launcher.config.js
   - launcher.config.cjs

注意：如同时存在 .mjs 与 .ts/.js，将优先使用 .mjs（优先 ESM 格式）。

### 配置文件示例

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3000,
    host: '127.0.0.1',
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true
  },
  launcher: {
    autoRestart: true,
    hooks: {
      beforeStart: () => console.log('🚀 Starting...'),
      afterStart: () => console.log('✅ Started!'),
      beforeBuild: () => console.log('🔨 Building...'),
      afterBuild: () => console.log('📦 Built!')
    }
  }
})
```

## 🌍 环境变量

CLI 工具支持通过环境变量进行配置：

| 环境变量 | 描述 | 示例 |
|----------|------|------|
| NODE_ENV | Node.js 环境模式 | development / production |
| LAUNCHER_CONFIG | 配置文件路径 | ./config/launcher.config.ts |
| LAUNCHER_DEBUG | 启用调试模式 | true / 1 |
| LAUNCHER_SILENT | 启用静默模式 | true / 1 |
| DEBUG | 调试命名空间 | launcher:* |

### 使用示例

```bash
# 设置环境变量
export NODE_ENV=production
export LAUNCHER_DEBUG=true

# 运行命令
launcher build

# 或者一次性设置
NODE_ENV=production launcher build
DEBUG=launcher:* launcher dev
```

## 📊 输出格式

CLI 工具提供了友好的输出格式：

### 正常模式

```
ℹ️  正在启动开发服务器...
ℹ️  找到配置文件 {"path":"./launcher.config.ts"}
ℹ️  配置文件加载成功
ℹ️  检测到 Vue 3 项目
🚀 Vue 3 项目启动前钩子
────────────────────────────────────────────────
✔ 开发服务器已启动
• 本地:   http://127.0.0.1:3000/
• 网络:   http://192.168.1.100:3000/
• 提示:   按 Ctrl+C 停止服务器
────────────────────────────────────────────────
✅ Vue 3 项目启动完成
```

### 调试模式

```bash
launcher dev --debug
```

```
[2025-01-01T10:00:00.000Z] [ViteLauncher] [DEBUG] ViteLauncher 初始化完成
[2025-01-01T10:00:00.100Z] [ConfigManager] [DEBUG] 配置文件加载结果 {"type":"object","hasDefault":true}
[2025-01-01T10:00:00.200Z] [SmartPluginManager] [DEBUG] 检测到 Vue 3 项目
[2025-01-01T10:00:00.300Z] [ViteLauncher] [INFO ] 正在启动开发服务器...
```

### 静默模式

```bash
launcher build --silent
```

静默模式下不会输出任何信息，只有错误信息会显示。

## 🔍 错误处理

CLI 工具提供了详细的错误信息和解决建议：

### 配置错误

```
❌ 配置文件验证失败:
  - 服务器端口必须是 1-65535 之间的数字
  - 构建输出目录必须是字符串

💡 解决建议:
  1. 检查配置文件格式是否正确
  2. 使用 launcher config validate 验证配置
  3. 查看文档: https://ldesign.github.io/launcher/config/
```

### 端口占用

```
❌ 端口 3000 被占用

💡 解决建议:
  1. 使用不同的端口: launcher dev --port 8080
  2. 检查是否有其他服务占用该端口
  3. 使用 --strictPort 选项禁用自动端口选择
```

### 依赖问题

```
❌ 找不到模块 '@vitejs/plugin-vue'

💡 解决建议:
  1. 安装缺少的依赖: pnpm add @vitejs/plugin-vue
  2. 检查 package.json 中的依赖配置
  3. 尝试重新安装依赖: rm -rf node_modules && pnpm install
```

## 🎯 高级用法

### 配置验证

```bash
# 验证当前目录的配置
launcher config validate

# 验证指定配置文件
launcher config validate --config ./my-config.ts

# 显示配置内容
launcher config list

# 以 JSON 格式显示配置
launcher config list --json
```

### 性能分析

```bash
# 启用性能监控（如已提供相关插件/能力）
launcher dev --performance

# 构建体积分析（需安装可视化插件）
launcher build --analyze

# 内存使用监控（如已提供相关插件/能力）
launcher dev --memory-monitor
```

### 多项目支持

```bash
# 在特定目录运行
launcher dev --cwd ./projects/app1

# 使用不同配置文件
launcher dev --config ./configs/app1.config.ts
cd ./projects/app1 && launcher dev

# 并行运行多个项目（根据 Shell 能力）
launcher dev --port 3001 &
launcher dev --port 3002 --cwd ./app2
```

### 脚本集成

在 package.json 中集成：

```json
{
  "scripts": {
    "dev": "launcher dev",
    "build": "launcher build",
    "preview": "launcher preview",
    "dev:debug": "launcher dev --debug",
    "build:analyze": "launcher build --analyze",
    "config:validate": "launcher config validate"
  }
}
```

### CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Build project
  run: launcher build --silent
  env:
    NODE_ENV: production

- name: Validate config
  run: launcher config validate
```

## 🔗 命令详细文档

点击以下链接查看各命令的详细文档：

- [dev 命令](./dev) - 开发服务器相关选项和用法
- [build 命令](./build) - 构建相关选项和用法
- [preview 命令](./preview) - 预览服务器相关选项和用法
- [config 命令](./config) - 配置管理工具的使用
- [help 命令](./help) - 帮助系统的使用
- [version 命令](./version) - 版本信息显示

## 🛠️ 开发和调试

### 本地开发

如果您正在开发 @ldesign/launcher：

```bash
# 克隆仓库
git clone https://github.com/ldesign/launcher.git
cd launcher/packages/launcher

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 链接到全局
pnpm link --global

# 现在可以使用开发版本
launcher dev --debug
```

### 调试技巧

```bash
# 查看完整错误堆栈
DEBUG=launcher:* launcher dev

# 只显示特定模块的调试信息
DEBUG=launcher:config launcher dev
DEBUG=launcher:plugin launcher dev

# 输出到文件
DEBUG=launcher:* launcher dev 2> debug.log
```

---

快速导航：
- [开发服务器 (dev)](./dev) - 最常用的开发命令
- [生产构建 (build)](./build) - 构建发布版本
- [配置管理 (config)](./config) - 管理项目配置
