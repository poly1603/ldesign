# 🚀 LDesign App

> 基于LDesign引擎的Vue3应用示例，集成多模板登录系统和完整的企业级功能

## ✨ 特性

- 🎨 **多模板系统** - 支持经典、现代、简约、创意四种登录模板，一键切换
- 🔐 **完整认证系统** - 登录、注册、密码重置，支持记住我功能
- 🌍 **国际化支持** - 中英文双语，可扩展更多语言
- 🎭 **主题切换** - 浅色/深色主题，自定义主色调
- 💧 **智能水印** - 防篡改水印系统，支持用户信息和时间戳
- 📱 **响应式设计** - 完美适配桌面、平板、手机
- 🔧 **插件化架构** - 基于LDesign引擎的插件系统
- 🛡️ **安全加固** - 密码加密、请求签名、XSS防护
- 📊 **状态管理** - 基于Pinia的响应式状态管理
- 🧪 **完整测试** - 单元测试、集成测试、E2E测试

## 🏗️ 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite + Rollup
- **状态管理**: Pinia
- **样式**: Less + CSS Variables
- **测试**: Vitest + Playwright
- **代码规范**: ESLint + Prettier
- **核心引擎**: @ldesign/engine

## 🏗️ 重构后的架构设计

### 🎯 重构目标
本次重构的主要目标是简化应用架构，移除冗余的封装层，直接使用@ldesign包的原生接口。

### 📦 核心包及其Vue集成

#### 核心引擎包
- `@ldesign/engine` - 核心引擎，提供插件系统、中间件、事件管理
  - Vue集成：`@ldesign/engine/vue` - 提供 `useEngine` 等组合式API

#### 路由和状态管理
- `@ldesign/router` - 路由系统，支持守卫、懒加载、权限控制
  - Vue集成：内置 `useRouter`, `useRoute` 等组合式API
- `@ldesign/store` - 状态管理，基于Pinia的增强
  - Vue集成：内置 `useStore`, `useState` 等组合式API

#### 国际化和模板
- `@ldesign/i18n` - 国际化，多语言支持
  - Vue集成：`@ldesign/i18n/vue` - 提供 `useI18n`, `useLocale` 等组合式API
- `@ldesign/template` - 模板系统，多模板切换
  - Vue集成：内置 `useTemplate`, `TemplateRenderer` 组件

#### 工具包
- `@ldesign/color` - 颜色工具，主题生成、颜色转换
  - Vue集成：`@ldesign/color/vue` - 提供主题相关组合式API和组件
- `@ldesign/crypto` - 加密工具，密码哈希、数据加密
  - Vue集成：`@ldesign/crypto/vue` - 提供 `useCrypto` 等组合式API
- `@ldesign/device` - 设备检测，响应式适配
  - Vue集成：`@ldesign/device/vue` - 提供 `useDevice` 等组合式API
- `@ldesign/http` - HTTP客户端，请求拦截、错误处理
  - Vue集成：内置 `useHttp`, `useQuery` 等组合式API
- `@ldesign/watermark` - 水印系统，防篡改保护
  - Vue集成：`@ldesign/watermark/vue` - 提供 `useWatermark`, `Watermark` 组件

### 🔧 重构改进

#### 移除的冗余层
- ❌ 移除了 `src/mocks/ldesign.ts` 模拟文件
- ❌ 移除了 `src/plugins/` 目录下的冗余插件封装
- ❌ 移除了 `src/composables/` 中的重复封装

#### 新的导入方式
```typescript
// 之前：通过模拟文件导入
import { createApp } from './mocks/ldesign'
import { useEngine } from './composables/useEngine'

// 现在：直接从@ldesign包导入
import { createEngine } from '@ldesign/engine'
import { useEngine } from '@ldesign/engine/vue'
import { useWatermark } from '@ldesign/watermark/vue'
import { Watermark } from '@ldesign/watermark/vue'
```

#### Vite配置优化
```typescript
// vite.config.ts 中添加了包别名，直接指向源码
resolve: {
  alias: {
    '@ldesign/engine': resolve(__dirname, '../engine/src'),
    '@ldesign/router': resolve(__dirname, '../router/src'),
    // ... 其他包
  }
}
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 7

### 安装依赖

```bash
# 在项目根目录安装所有依赖
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev

# 应用将在 http://localhost:3000 启动
```

### 构建项目

```bash
# 构建应用
pnpm build

# 构建npm包
pnpm build:lib

# 预览构建结果
pnpm preview
```

### 运行测试

```bash
# 运行单元测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行E2E测试
pnpm test:e2e
```

## 🎯 使用指南

### 登录系统

应用提供了完整的登录系统，支持：

1. **多模板切换**: 右上角可以切换不同的登录模板
2. **用户认证**: 默认用户名/密码：`admin/admin123`
3. **记住我**: 勾选后会保存登录状态
4. **密码加密**: 使用crypto包进行密码哈希

### 模板系统

内置四种登录模板：

- **经典模板**: 传统的登录界面设计，简洁实用
- **现代模板**: 现代化设计风格，时尚美观
- **简约模板**: 极简设计理念，专注用户体验
- **创意模板**: 富有创意的设计，独特视觉体验

### 主题定制

支持多种主题定制选项：

```typescript
// 切换主题模式
const { toggleTheme, setThemeMode } = useTheme()

// 浅色/深色/自动
setThemeMode('dark')

// 自定义主色调
setPrimaryColor('#ff6b6b')
```

### 国际化

支持中英文切换：

```typescript
// 切换语言
const { setLocale } = useI18n()
setLocale('en-US')

// 使用翻译
const { t } = useI18n()
t('auth.login.title') // 用户登录
```

### 水印系统

智能水印保护：

```typescript
// 启用水印
const { enableWatermark, updateWatermarkText } = useWatermark()
enableWatermark()
updateWatermarkText('我的水印')
```

## 🔧 配置

### 环境变量

创建 `.env.local` 文件：

```bash
# API基础URL
VITE_API_BASE_URL=http://localhost:8080/api

# CDN基础URL
VITE_CDN_BASE_URL=https://cdn.example.com

# 应用标题
VITE_APP_TITLE=LDesign App
```

### 应用配置

在 `src/config/index.ts` 中修改应用配置：

```typescript
export const appConfig = {
  name: 'My App',
  features: {
    watermark: true,
    darkMode: true,
    i18n: true
  }
}
```

## 📚 API文档

### 核心API

```typescript
// 创建应用实例
import { createLDesignApp } from '@ldesign/app'

const { engine, router, mount } = await createLDesignApp()
mount('#app')
```

### 组件API

```vue
<!-- 水印组件 -->
<LWatermark :text="watermarkText" :options="watermarkOptions">
  <div>受保护的内容</div>
</LWatermark>

<!-- 错误边界 -->
<LErrorBoundary @error="handleError">
  <MyComponent />
</LErrorBoundary>
```

## 🧪 测试

### 单元测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 覆盖率报告
pnpm test:coverage
```

### E2E测试

```bash
# 运行E2E测试
pnpm test:e2e

# 交互式模式
pnpm test:e2e:ui
```

## 📦 构建和发布

### 构建应用

```bash
# 构建生产版本
pnpm build

# 构建npm包
pnpm build:lib
```

### 发布npm包

```bash
# 发布到npm
pnpm publish
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

## 🙏 致谢

感谢所有为LDesign生态系统做出贡献的开发者！

---

<div align="center">
  <strong>🎉 享受使用LDesign App的乐趣！</strong>
</div>
