# 🎨 LDesign Template

> 为 Vue 3 而生的多模板管理及动态渲染系统

[![npm version](https://badge.fury.io/js/@ldesign%2Ftemplate.svg)](https://badge.fury.io/js/@ldesign%2Ftemplate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)

## ✨ 特性

- 🎯 **内置模板库** - 丰富的内置模板，涵盖登录、仪表板等常见场景
- 🚀 **开箱即用** - 零配置启动，智能模板扫描
- 📱 **响应式设计** - 自动设备检测，完美适配各种屏幕
- ⚡ **性能优化** - 懒加载、缓存机制、预加载支持
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🔧 **灵活配置** - 支持自定义配置和扩展
- 🎪 **多种用法** - Composable、组件、指令、插件
- 🧪 **测试完备** - 单元测试 + E2E 测试覆盖

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/template

# 使用 npm
npm install @ldesign/template

# 使用 yarn
yarn add @ldesign/template
```

## 🚀 快速开始

### 1. Provider 方式 (推荐)

```typescript
import { TemplateProvider } from '@ldesign/template'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import {
  createTemplateProviderConfig,
  TemplateProvider,
} from '@ldesign/template'

const providerConfig = createTemplateProviderConfig({
  enableCache: true,
  autoDetectDevice: true,
  defaultSelectorConfig: {
    enabled: true,
    position: 'top',
    showPreview: true,
    layout: 'grid',
  },
  theme: {
    primaryColor: '#1890ff',
    borderRadius: '8px',
  },
})
</script>

<template>
  <TemplateProvider :config="providerConfig">
    <router-view />
  </TemplateProvider>
</template>
```

### 2. 插件方式

```typescript
import TemplatePlugin from '@ldesign/template'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(TemplatePlugin, {
  enableCache: true,
  autoDetectDevice: true,
  providerConfig: {
    defaultSelectorConfig: {
      enabled: true,
      position: 'top',
    },
  },
})

app.mount('#app')
```

## 🎨 内置模板库

@ldesign/template 提供了丰富的内置模板，开箱即用，无需额外配置。

### 登录模板 (login)

#### 桌面端 (desktop)
- **default** - 经典登录页面
  - 简洁大方的设计风格
  - 支持用户名/邮箱登录
  - 记住我功能
  - 忘记密码链接

- **modern** - 现代化登录页面
  - 卡片式布局设计
  - 渐变背景效果
  - 动画过渡效果
  - 响应式适配

- **creative** - 创意登录页面
  - 艺术化设计元素
  - 动态背景动画
  - 创意图形装饰
  - 沉浸式体验

#### 平板端 (tablet)
- **default** - 平板优化登录页面
  - 触摸友好的交互设计
  - 横屏竖屏自适应
  - 中等尺寸布局
  - 手势支持

#### 移动端 (mobile)
- **default** - 移动端登录页面
  - 全屏设计布局
  - 生物识别登录支持
  - 触摸优化交互
  - 键盘适配

### 仪表板模板 (dashboard)

#### 桌面端 (desktop)
- **admin** - 管理后台仪表板
  - 完整的侧边栏导航
  - 数据统计卡片
  - 表格数据管理
  - 用户权限控制

- **analytics** - 数据分析仪表板
  - 专业的图表展示
  - 实时数据更新
  - 多维度分析
  - 智能洞察功能

### 使用内置模板

```vue
<template>
  <!-- 使用桌面端默认登录模板 -->
  <TemplateRenderer
    category="login"
    device="desktop"
    template="default"
    :props="{
      title: '欢迎登录',
      subtitle: '请输入您的账号信息',
      primaryColor: '#667eea',
      showRemember: true,
      showRegister: true
    }"
  />

  <!-- 使用移动端登录模板 -->
  <TemplateRenderer
    category="login"
    device="mobile"
    template="default"
    :props="{
      title: '手机登录',
      subtitle: '随时随地，安全登录',
      enableBiometric: true,
      showQuickLogin: true
    }"
  />

  <!-- 使用管理后台仪表板 -->
  <TemplateRenderer
    category="dashboard"
    device="desktop"
    template="admin"
    :props="{
      title: '管理后台',
      userName: '管理员',
      showSidebar: true,
      darkMode: false
    }"
  />
</template>
```

### 2. Composable 方式

```vue
<script setup lang="ts">
import { TemplateRenderer, useTemplate } from '@ldesign/template'

const { currentDevice, switchTemplate, availableTemplates } = useTemplate()

const selectedTemplate = ref(null)

async function switchToLogin() {
  await switchTemplate('login', currentDevice.value, 'classic')
  selectedTemplate.value = {
    category: 'login',
    template: 'classic',
  }
}
</script>

<template>
  <div>
    <button @click="switchToLogin">
      切换到登录页
    </button>
    <TemplateRenderer
      v-if="selectedTemplate"
      :category="selectedTemplate.category"
      :device="currentDevice"
      :template="selectedTemplate.template"
    />
  </div>
</template>
```

### 3. 内置模板选择器

```vue
<script setup>
import { TemplateRenderer } from '@ldesign/template'
</script>

<template>
  <!-- 带顶部选择器的模板渲染器 -->
  <TemplateRenderer
    category="login"
    :selector="{
      enabled: true,
      position: 'top',
      showPreview: true,
      showSearch: true,
      layout: 'grid',
      columns: 3,
    }"
  />

  <!-- 带覆盖层选择器的模板渲染器 -->
  <TemplateRenderer
    category="dashboard"
    :selector="{
      enabled: true,
      position: 'overlay',
      trigger: 'manual',
      showPreview: true,
    }"
    :template="{
      desktop: 'full-layout',
      tablet: 'compact-layout',
      mobile: 'simple-layout',
    }"
  />

  <!-- 简单布尔值启用默认选择器 -->
  <TemplateRenderer category="profile" :selector="true" />
</template>
```

### 4. 组件方式

```vue
<template>
  <!-- 基础用法 -->
  <LTemplateRenderer category="login" device="desktop" template="classic" />

  <!-- 带属性传递 -->
  <LTemplateRenderer
    category="login"
    device="mobile"
    template="simple"
    :template-props="{ title: '欢迎登录' }"
  />

  <!-- 自定义加载和错误状态 -->
  <LTemplateRenderer
    category="dashboard"
    template="admin"
    @load="onTemplateLoad"
    @error="onTemplateError"
  >
    <template #loading>
      <div class="custom-loading">
        加载中...
      </div>
    </template>

    <template #error="{ error, retry }">
      <div class="custom-error">
        <p>{{ error.message }}</p>
        <button @click="retry">
          重试
        </button>
      </div>
    </template>
  </LTemplateRenderer>
</template>
```

### 5. Provider 模式使用

```vue
<script setup>
import { TemplateRenderer, useTemplateProvider } from '@ldesign/template'

const { currentDevice, loading, error, switchTemplate, getTemplates }
  = useTemplateProvider()

async function handleSwitchTemplate() {
  const templates = getTemplates('login', currentDevice.value)
  if (templates.length > 0) {
    await switchTemplate('login', currentDevice.value, templates[0].template)
  }
}
</script>

<template>
  <div>
    <!-- 在Provider上下文中使用组合式函数 -->
    <div v-if="loading">
      加载中...
    </div>
    <div v-else-if="error">
      {{ error.message }}
    </div>
    <div v-else>
      <h3>当前设备: {{ currentDevice }}</h3>
      <button @click="handleSwitchTemplate">
        切换模板
      </button>

      <!-- 简化的模板渲染器，自动使用Provider配置 -->
      <TemplateRenderer category="login" :selector="true" />
    </div>
  </div>
</template>
```

### 6. 指令方式

```vue
<template>
  <!-- 字符串格式 -->
  <div v-template="'login:desktop:classic'" />

  <!-- 对象格式 -->
  <div
    v-template="{
      category: 'login',
      device: 'mobile',
      template: 'simple',
      props: { title: '移动端登录' },
    }"
  />
</template>
```

## 📁 模板目录结构

```
src/templates/
├── login/                    # 模板分类
│   ├── desktop/             # 设备类型
│   │   ├── classic/         # 模板变体
│   │   │   ├── index.tsx    # 模板组件
│   │   │   ├── index.less   # 模板样式
│   │   │   └── config.ts    # 模板配置
│   │   └── modern/
│   │       ├── index.tsx
│   │       ├── index.less
│   │       └── config.ts
│   ├── mobile/
│   │   └── simple/
│   │       ├── index.tsx
│   │       ├── index.less
│   │       └── config.ts
│   └── tablet/
└── dashboard/
    └── desktop/
        └── admin/
            ├── index.tsx
            ├── index.less
            └── config.ts
```

## ⚙️ 模板配置

每个模板的 `config.ts` 文件需要导出配置对象：

```typescript
// src/templates/login/desktop/classic/config.ts
import type { TemplateConfig } from '@ldesign/template'

export default {
  name: 'classic',
  title: '经典登录页',
  description: '传统的登录页面设计，简洁大方',
  version: '1.0.0',
  author: 'LDesign Team',
  preview: '/previews/login-classic.png',
  tags: ['classic', 'simple', 'enterprise'],
  responsive: true,
  minWidth: 1200,
  maxWidth: undefined,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
} as TemplateConfig
```

## 🎯 模板组件开发

```tsx
// src/templates/login/desktop/classic/index.tsx
import { defineComponent, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'ClassicLoginTemplate',
  props: {
    title: {
      type: String,
      default: '系统登录',
    },
    onLogin: {
      type: Function,
      default: () => {},
    },
  },
  setup(props) {
    const form = ref({
      username: '',
      password: '',
    })

    const handleLogin = () => {
      props.onLogin(form.value)
    }

    return () => (
      <div class="classic-login">
        <h1>{props.title}</h1>
        <form onSubmit={handleLogin}>
          <input v-model={form.value.username} placeholder="用户名" />
          <input
            v-model={form.value.password}
            type="password"
            placeholder="密码"
          />
          <button type="submit">登录</button>
        </form>
      </div>
    )
  },
})
```

## 🔧 高级配置

```typescript
import TemplatePlugin from '@ldesign/template'
import { createApp } from 'vue'

const app = createApp(App)

app.use(TemplatePlugin, {
  // 模板根目录
  templateRoot: 'src/templates',

  // 设备检测配置
  deviceDetection: {
    mobileBreakpoint: 768,
    tabletBreakpoint: 992,
    desktopBreakpoint: 1200,
    customDetector: () => {
      // 自定义设备检测逻辑
      return 'desktop'
    },
  },

  // 缓存配置
  enableCache: true,
  cacheLimit: 50,

  // 预加载配置
  enablePreload: true,
  preloadTemplates: ['login:desktop:classic', 'login:mobile:simple'],

  // 默认设备类型
  defaultDevice: 'desktop',

  // 组件配置
  componentPrefix: 'L',
  registerComponents: true,
  registerDirectives: true,
  provideGlobalProperties: true,
})
```

## 📱 响应式适配

系统会自动检测设备类型并切换对应模板：

```typescript
import { useTemplate } from '@ldesign/template'

const { currentDevice, switchTemplate } = useTemplate()

// 监听设备变化
watch(currentDevice, (newDevice) => {
  console.log('设备类型变化:', newDevice)
  // 自动切换到对应设备的模板
})
```

## 🎪 API 参考

### TemplateProvider 组件

全局模板配置提供者，为子组件提供统一的模板管理上下文：

```typescript
interface TemplateProviderProps {
  config?: TemplateProviderConfig
}

interface TemplateProviderConfig {
  enableCache?: boolean
  autoDetectDevice?: boolean
  defaultSelectorConfig?: TemplateSelectorConfig
  globalTemplateProps?: Record<string, unknown>
  enableGlobalState?: boolean
  autoScan?: boolean
  theme?: {
    primaryColor?: string
    borderRadius?: string
    spacing?: string
  }
}
```

### useTemplateProvider()

在 Provider 上下文中使用的组合式函数：

```typescript
const {
  // 状态
  isInProvider, // 是否在Provider上下文中
  config, // 全局配置
  currentDevice, // 当前设备类型
  loading, // 加载状态
  error, // 错误信息

  // 方法
  getTemplates, // 获取模板列表
  switchTemplate, // 切换模板
  refreshTemplates, // 刷新模板列表
  clearCache, // 清空缓存
  hasTemplate, // 检查模板是否存在
} = useTemplateProvider()
```

### useTemplate()

独立的模板管理组合式函数：

```typescript
const {
  // 状态
  currentTemplate, // 当前模板
  currentDevice, // 当前设备类型
  loading, // 加载状态
  error, // 错误信息
  availableTemplates, // 可用模板列表
  availableCategories, // 可用分类列表
  availableDevices, // 可用设备类型列表

  // 方法
  scanTemplates, // 扫描模板
  render, // 渲染模板
  switchTemplate, // 切换模板
  getTemplates, // 获取模板列表
  hasTemplate, // 检查模板是否存在
  clearCache, // 清空缓存
  refresh, // 刷新模板列表
} = useTemplate(options)
```

### TemplateRenderer 组件

支持内置模板选择器的模板渲染组件：

```typescript
interface TemplateRendererProps {
  // 基础属性
  category: string // 模板分类
  device?: DeviceType // 设备类型
  template?: string | Record<DeviceType, string> // 模板名称
  templateProps?: Record<string, unknown> // 传递给模板的属性

  // 缓存和性能
  cache?: boolean // 是否启用缓存
  preload?: boolean // 是否预加载

  // 动画效果
  transition?: boolean // 是否启用切换动画
  transitionDuration?: number // 动画持续时间
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip' // 动画类型

  // 状态控制
  loading?: boolean // 是否显示加载状态
  error?: boolean // 是否显示错误状态

  // 内置模板选择器
  selector?: boolean | TemplateSelectorConfig // 选择器配置
  allowTemplateSwitch?: boolean // 是否允许用户切换模板
  canSwitchTemplate?: (template: string) => boolean // 模板切换权限检查

  // 自定义插槽
  slots?: SlotConfig[] // 自定义插槽配置
}

interface TemplateSelectorConfig {
  enabled?: boolean // 是否显示选择器
  position?: 'top' | 'bottom' | 'left' | 'right' | 'overlay' | 'inline' // 选择器位置
  showPreview?: boolean // 是否显示预览
  showSearch?: boolean // 是否显示搜索
  layout?: 'grid' | 'list' // 布局模式
  columns?: number // 网格列数
  showInfo?: boolean // 是否显示模板信息
  trigger?: 'click' | 'hover' | 'manual' // 触发方式
  animation?: boolean // 动画效果
}
```

### TemplateSelector 组件

模板选择器组件提供了智能的模板浏览和选择功能：

```vue
<template>
  <TemplateSelector
    category="login"
    device="desktop"
    :current-template="selectedTemplate"
    :templates="availableTemplates"
    :show-preview="true"
    :show-search="true"
    layout="grid"
    :columns="3"
    @template-change="handleTemplateChange"
    @template-preview="handleTemplatePreview"
  />
</template>
```

#### 组件属性

```typescript
interface TemplateSelectorProps {
  category: string // 模板分类
  device?: DeviceType // 设备类型
  currentTemplate?: string // 当前选中的模板
  showPreview?: boolean // 是否显示预览
  showSearch?: boolean // 是否显示搜索
  layout?: 'grid' | 'list' // 布局模式
  columns?: number // 网格列数
  showInfo?: boolean // 是否显示模板信息
  onTemplateChange?: (template: string) => void // 模板变化回调
  onTemplatePreview?: (template: string) => void // 模板预览回调
}
```

#### 功能特性

- 🎯 **智能分类**：根据模板分类自动分组显示
- 📱 **设备适配**：根据设备类型动态筛选模板
- 🔍 **实时搜索**：支持模板名称、描述、标签搜索
- 👀 **预览功能**：鼠标悬停即可预览模板
- 🎨 **多种布局**：支持网格和列表两种布局模式
- ⚡ **实时响应**：设备类型变化时自动更新模板列表

### useTemplateSelector Hook

```typescript
const {
  availableTemplates, // 可用模板列表
  filteredTemplates, // 过滤后的模板列表
  searchQuery, // 搜索查询
  selectedTemplate, // 选中的模板
  loading, // 加载状态
  error, // 错误信息
  selectTemplate, // 选择模板
  previewTemplate, // 预览模板
  searchTemplates, // 搜索模板
  refreshTemplates, // 刷新模板列表
  reset, // 重置选择器
} = useTemplateSelector(options)
```

## 🧪 测试

```bash
# 运行单元测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行 E2E 测试
pnpm test:e2e

# 运行一键测试系统（测试 src 和 es 版本一致性）
pnpm test:consistency

# 运行测试 UI
pnpm test:ui
```

## 📚 更多示例

查看 `examples/` 目录获取更多使用示例：

- [基础用法](./examples/basic-usage.vue)
- [高级配置](./examples/advanced-config.vue)
- [自定义模板](./examples/custom-template.vue)
- [响应式适配](./examples/responsive.vue)

## 🚀 性能优化

本包经过多项性能优化：

- ✅ **智能缓存**: LRU 缓存算法，避免重复加载
- ✅ **懒加载**: 按需加载模板组件
- ✅ **设备检测缓存**: 避免重复计算设备类型
- ✅ **视口信息缓存**: 减少 DOM 查询次数
- ✅ **代码分割**: 支持动态导入和代码分割
- ✅ **构建优化**: 多格式输出，支持 Tree Shaking

## 🏗️ 项目结构

```
packages/template/
├── src/                    # 源代码
│   ├── core/              # 核心功能
│   ├── utils/             # 工具函数
│   ├── types/             # 类型定义
│   ├── vue/               # Vue 集成
│   └── templates/         # 内置模板
├── test-apps/             # 测试应用
│   ├── src-test/          # 源码测试应用
│   └── es-test/           # 构建产物测试应用
├── e2e/                   # E2E 测试
├── tests/                 # 单元测试
├── docs/                  # 文档
└── examples/              # 示例代码
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

[MIT](./LICENSE) © LDesign Team

## 🙏 致谢

感谢所有贡献者的努力！

---

<div align="center">
  <p>如果这个项目对你有帮助，请给个 ⭐️ 支持一下！</p>
  <p>Made with ❤️ by LDesign Team</p>
</div>
