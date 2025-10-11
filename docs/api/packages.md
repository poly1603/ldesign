# LDesign 包总览

LDesign 是一个 monorepo 结构的现代化设计系统,包含多个相互独立又紧密协作的包。

## 📦 核心包

### [@ldesign/color](./color.md)

颜色主题管理库,提供完整的颜色处理、主题管理和可访问性检查功能。

**主要功能:**
- 🎨 智能主题管理 (亮色/暗色模式)
- 🔄 颜色格式转换 (HEX、RGB、HSL、HSV)
- 🎭 色阶生成
- ♿ WCAG 可访问性检查
- 🌈 色彩和谐分析
- 🚀 高性能缓存优化

```bash
pnpm add @ldesign/color
```

### @ldesign/api

强大的 API 请求管理库,提供类型安全的 HTTP 请求、智能缓存和状态管理。

**主要功能:**
- 🚀 基于 Fetch API 的现代化请求
- 📝 完整的 TypeScript 类型支持
- 💾 智能请求缓存
- 🔄 自动重试和错误处理
- 🎯 请求/响应拦截器
- 📊 请求状态管理
- 🔌 GraphQL 支持
- 🌐 WebSocket 集成

```bash
pnpm add @ldesign/api
```

### @ldesign/cache

高性能缓存系统,支持多种缓存策略和持久化方式。

**主要功能:**
- 💾 多种缓存策略 (LRU、LFU、FIFO、TTL)
- 🗄️ IndexedDB 持久化
- ⚡ 内存缓存
- 🔄 自动过期和清理
- 📊 缓存统计和监控
- 🎯 类型安全

```bash
pnpm add @ldesign/cache
```

### @ldesign/crypto

加密和哈希工具库,提供常用的加密算法实现。

**主要功能:**
- 🔐 对称加密 (AES)
- 🔑 非对称加密 (RSA)
- 🔏 哈希算法 (SHA-256、MD5)
- 🎲 随机数生成
- 🔒 密码加密
- ✅ 数据完整性校验

```bash
pnpm add @ldesign/crypto
```

### @ldesign/device

设备检测和信息获取库,识别用户设备类型和特性。

**主要功能:**
- 📱 设备类型检测 (手机、平板、桌面)
- 🌐 浏览器检测
- 🖥️ 操作系统检测
- 📐 屏幕尺寸和方向
- 🔋 设备能力检测
- 🌍 地理位置

```bash
pnpm add @ldesign/device
```

### @ldesign/engine

应用引擎和配置管理,提供应用初始化和运行时管理功能。

**主要功能:**
- ⚙️ 应用配置管理
- 🚀 应用生命周期管理
- 📊 性能监控
- 🔌 插件系统
- 🔔 通知系统
- 📝 日志记录

```bash
pnpm add @ldesign/engine
```

### @ldesign/http

HTTP 客户端库,提供简洁的 API 和强大的功能。

**主要功能:**
- 🌐 RESTful API 支持
- 🔄 请求/响应拦截器
- 💾 智能缓存
- 🔁 自动重试
- ⚡ 并发控制
- 📊 进度监控
- 🔐 认证支持

```bash
pnpm add @ldesign/http
```

### @ldesign/i18n

国际化解决方案,支持多语言和区域化。

**主要功能:**
- 🌍 多语言支持
- 🔄 动态语言切换
- 📦 按需加载翻译文件
- 🎯 TypeScript 类型安全
- 📝 复数和格式化
- 🌐 区域化支持
- ⚡ 性能优化

```bash
pnpm add @ldesign/i18n
```

### @ldesign/router

前端路由管理库,支持多种路由模式和高级特性。

**主要功能:**
- 🛣️ Hash 和 History 模式
- 🎯 路由守卫
- 📦 代码分割和懒加载
- 🔄 动态路由
- 📊 路由过渡动画
- 🔐 权限控制
- 📝 类型安全

```bash
pnpm add @ldesign/router
```

### @ldesign/shared

共享工具库,提供通用的工具函数和类型定义。

**主要功能:**
- 🛠️ 通用工具函数
- 🎯 TypeScript 类型工具
- 📝 常量定义
- 🔄 数据转换
- ✅ 数据验证
- 📊 数据结构

```bash
pnpm add @ldesign/shared
```

### @ldesign/store

状态管理库,提供响应式的全局状态管理。

**主要功能:**
- 📦 响应式状态管理
- 🔄 状态持久化
- 🎯 TypeScript 支持
- 🔌 插件系统
- 📊 开发工具集成
- ⚡ 高性能

```bash
pnpm add @ldesign/store
```

## 🏗️ 构建工具

### @ldesign/builder

统一的构建工具,支持多种输出格式。

**主要功能:**
- 📦 ESM、CJS、UMD 输出
- 🔄 监听模式
- 🎯 TypeScript 支持
- 📊 构建分析
- ⚡ 快速构建
- 🔧 可配置

### @ldesign/cli

命令行工具,提供项目脚手架和开发工具。

**主要功能:**
- 🚀 项目初始化
- 📦 组件生成
- 🔧 配置管理
- 📊 项目分析
- 🛠️ 开发工具

### @ldesign/launcher

应用启动器,管理应用的启动和配置。

**主要功能:**
- 🚀 应用启动
- ⚙️ 环境配置
- 🔌 插件加载
- 📊 性能监控

## 🎨 UI 库

### @ldesign/webcomponent

基于 Stencil 的 Web Components 组件库。

**主要功能:**
- 🎯 框架无关
- 📦 按需加载
- 🎨 主题定制
- ♿ 可访问性
- 📱 响应式设计

```bash
pnpm add @ldesign/webcomponent
```

## 📚 高级库

### @ldesign/form

表单解决方案,提供完整的表单管理功能。

**主要功能:**
- 📝 表单验证
- 🔄 动态表单
- 🎯 类型安全
- 📊 表单状态管理
- 🔌 框架适配器

### @ldesign/cropper

图片裁剪库,支持多种裁剪模式和框架。

**主要功能:**
- ✂️ 图片裁剪
- 🔄 图片旋转和缩放
- 🎨 自定义裁剪框
- 📱 触摸支持
- 🔌 框架适配器

### @ldesign/editor

富文本编辑器,提供丰富的编辑功能。

**主要功能:**
- 📝 富文本编辑
- 🎨 格式化工具
- 🖼️ 图片和表格
- 📋 代码块
- 🔌 插件系统

### @ldesign/flowchart

流程图编辑器,支持审批流程和复杂流程图。

**主要功能:**
- 📊 流程图绘制
- 🔄 节点连接
- 🎨 自定义节点
- 📱 响应式
- 🔌 框架适配器

## 🎯 包依赖关系

```
@ldesign/shared (基础)
    ↓
┌───┴───┬───────┬─────────┬────────┐
│       │       │         │        │
color  cache  crypto   device   i18n
│       │       │         │        │
└───┬───┴───┬───┴────┬────┴────┬───┘
    │       │        │         │
    http   api    engine    router
    │       │        │         │
    └───┬───┴────┬───┴─────────┘
        │        │
     store   webcomponent
```

## 📦 安装建议

### 完整安装

如果你需要使用完整的 LDesign 生态系统:

```bash
pnpm add @ldesign/color @ldesign/api @ldesign/cache @ldesign/http @ldesign/i18n @ldesign/router @ldesign/store @ldesign/webcomponent
```

### 最小安装

如果你只需要基本功能:

```bash
pnpm add @ldesign/shared @ldesign/color @ldesign/webcomponent
```

### 按需安装

根据项目需求安装特定的包:

```bash
# 需要主题管理
pnpm add @ldesign/color

# 需要 API 请求
pnpm add @ldesign/api @ldesign/http

# 需要状态管理
pnpm add @ldesign/store

# 需要国际化
pnpm add @ldesign/i18n

# 需要路由
pnpm add @ldesign/router
```

## 🚀 快速开始

### 1. 创建新项目

```bash
# 使用 CLI 创建项目
pnpm dlx @ldesign/cli create my-app

# 或使用模板
git clone https://github.com/ldesign-org/template-app.git my-app
cd my-app
pnpm install
```

### 2. 配置主题

```typescript path=null start=null
import { createThemeManagerWithPresets } from '@ldesign/color'

const themeManager = await createThemeManagerWithPresets({
  defaultTheme: 'default',
  autoDetect: true
})
```

### 3. 配置 API

```typescript path=null start=null
import { createApiEngine } from '@ldesign/api'

const api = createApiEngine({
  baseURL: 'https://api.example.com',
  timeout: 10000
})
```

### 4. 配置路由

```typescript path=null start=null
import { createRouter } from '@ldesign/router'

const router = createRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})
```

### 5. 配置国际化

```typescript path=null start=null
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': { hello: '你好' },
    'en-US': { hello: 'Hello' }
  }
})
```

## 📖 更多文档

- [颜色主题管理](./color.md)
- [API 请求管理](./api.md)
- [缓存系统](./cache.md)
- [HTTP 客户端](./http.md)
- [国际化](./i18n.md)
- [路由管理](./router.md)
- [状态管理](./store.md)

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

- [贡献指南](../contributing/)
- [GitHub 仓库](https://github.com/ldesign-org/ldesign)
- [问题跟踪](https://github.com/ldesign-org/ldesign/issues)

## 📄 许可证

MIT License © 2024 LDesign Team
