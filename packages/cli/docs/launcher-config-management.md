# Launcher 配置管理功能

## 功能概述

为 LDesign CLI 的 Web UI 添加了专门的 Launcher 配置管理页面，可以直观地查看、编辑和管理项目中的 `launcher.config.ts` 配置文件。

## 主要特性

### 1. 多环境配置支持

支持管理多个环境的配置文件：
- **基础配置** (`launcher.config.ts`) - 通用配置
- **开发环境** (`launcher.config.development.ts`) - 开发环境特定配置
- **测试环境** (`launcher.config.test.ts`) - 测试环境配置
- **预发布环境** (`launcher.config.staging.ts`) - 预发布环境配置
- **生产环境** (`launcher.config.production.ts`) - 生产环境配置

### 2. 可视化编辑界面

- **代码编辑器**: 使用 Monaco Editor（VS Code 同款编辑器）提供语法高亮和智能提示
- **配置状态显示**: 清晰显示每个配置文件是否存在
- **实时保存状态**: 显示是否有未保存的更改
- **配置文件模板**: 为不存在的配置文件提供默认模板

### 3. 配置管理功能

- **加载配置**: 自动加载选定环境的配置文件
- **保存配置**: 保存修改后的配置到 `.ldesign` 目录
- **重置更改**: 撤销未保存的修改
- **复制配置**: 一键复制配置内容到剪贴板
- **刷新配置**: 手动刷新配置内容

### 4. 配置结构说明

页面提供了详细的配置结构说明，包括：
- **基础配置**: Launcher 核心配置（预设、模式等）
- **服务器配置**: 开发服务器设置（端口、主机、CORS 等）
- **构建配置**: 项目构建设置（输出目录、Source Map、代码压缩等）
- **预览配置**: 预览服务器设置
- **优化配置**: 依赖预构建优化设置

## 技术实现

### 后端 API

在 `project-manager.ts` 中添加了以下方法：

```typescript
// 获取所有 launcher 配置列表
getLauncherConfigs(): Promise<{ environment: string; path: string; exists: boolean }[]>

// 读取指定环境的配置内容
readLauncherConfig(environment: string): Promise<{ content: string; path: string; exists: boolean }>

// 保存配置文件
saveLauncherConfig(environment: string, content: string): Promise<void>
```

### API 路由

在 `server.ts` 中添加了以下路由：

```typescript
GET  /api/launcher-configs          // 获取配置列表
GET  /api/launcher-config/:env      // 获取指定环境配置
POST /api/launcher-config/:env      // 保存指定环境配置
```

### 前端组件

- **LauncherConfig.tsx**: 主配置管理组件
- 使用 `@monaco-editor/react` 提供代码编辑功能
- 使用 `react-hot-toast` 提供用户反馈

## 文件结构

```
.ldesign/
├── launcher.config.ts              # 基础配置
├── launcher.config.development.ts  # 开发环境配置
├── launcher.config.test.ts         # 测试环境配置
├── launcher.config.staging.ts      # 预发布环境配置
└── launcher.config.production.ts   # 生产环境配置
```

## 默认配置模板

系统为每个环境提供了合理的默认配置模板：

### 基础配置
```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    preset: 'ldesign',
  },
  server: {
    port: 3340,
    open: false,
    host: 'localhost',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true,
  },
  preview: {
    port: 8888,
    host: 'localhost',
  },
})
```

### 环境特定配置

每个环境都有针对性的默认设置：
- **开发环境**: 启用 sourcemap，禁用压缩，自动打开浏览器
- **测试环境**: 启用 sourcemap，禁用压缩，用于测试
- **预发布环境**: 禁用 sourcemap，启用压缩，开放网络访问
- **生产环境**: 禁用 sourcemap，启用压缩，完全优化

## 使用方法

1. 启动 Web UI：
```bash
pnpm run ui
```

2. 导航到配置页面（侧边栏"配置"菜单）

3. 选择要编辑的环境配置

4. 在代码编辑器中修改配置

5. 点击"保存"按钮保存更改

## 注意事项

1. 配置文件保存在项目的 `.ldesign` 目录下
2. 如果目录不存在，系统会自动创建
3. 修改配置后需要重启相应的服务才能生效
4. 配置文件使用 TypeScript 格式，支持类型提示和验证

## 后续改进计划

1. **表单视图**: 提供可视化表单编辑界面（当前仅支持代码视图）
2. **配置验证**: 实时验证配置语法和结构
3. **配置对比**: 支持不同环境配置的对比查看
4. **配置导入/导出**: 支持配置的批量导入导出
5. **配置继承**: 支持环境配置继承基础配置
6. **实时预览**: 修改配置后实时预览效果