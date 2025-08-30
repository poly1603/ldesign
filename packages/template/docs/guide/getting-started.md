# 快速开始

> 🚀 5分钟带你体验模板管理的魅力！

## 📦 安装

首先，让我们安装 `@ldesign/template`：

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/template

# 使用 npm
npm install @ldesign/template

# 使用 yarn
yarn add @ldesign/template
```

## 🏗️ 项目结构

在开始之前，让我们了解一下模板的目录结构：

```
src/templates/
├── login/                    # 登录模板分类
│   ├── desktop/             # 桌面端版本
│   │   ├── default/         # 默认模板
│   │   │   ├── index.tsx    # 模板组件
│   │   │   ├── index.less   # 样式文件
│   │   │   └── config.ts    # 配置文件
│   │   ├── modern/          # 现代风格模板
│   │   └── classic/         # 经典风格模板
│   ├── tablet/              # 平板端版本
│   └── mobile/              # 移动端版本
└── dashboard/               # 仪表板模板分类
    ├── desktop/
    ├── tablet/
    └── mobile/
```

## 🎯 第一个例子

让我们从最简单的例子开始：

```typescript
import { TemplateManager } from '@ldesign/template'

// 1. 创建模板管理器
const manager = new TemplateManager({
  templateRoot: 'src/templates',
  enableCache: true,
  defaultDevice: 'desktop'
})

// 2. 初始化并扫描模板
await manager.initialize()
console.log(`发现 ${manager.getTemplates().length} 个模板！`)

// 3. 渲染一个登录模板
const result = await manager.render('login', 'desktop', 'default')
console.log('模板渲染成功！', result.template.displayName)
```

## 🎪 Vue 3 集成

如果你使用 Vue 3，可以享受更简单的集成体验：

### 1. 安装插件

```typescript
import { createApp } from 'vue'
import TemplatePlugin from '@ldesign/template'
import App from './App.vue'

const app = createApp(App)

// 安装模板插件
app.use(TemplatePlugin, {
  templateRoot: 'src/templates',
  enableCache: true,
  deviceDetection: {
    mobileBreakpoint: 768,
    tabletBreakpoint: 992,
    autoDetect: true
  }
})

app.mount('#app')
```

### 2. 使用组件

```vue
<template>
  <div class="app">
    <!-- 自动渲染登录模板，支持设备响应式切换 -->
    <TemplateRenderer
      category="login"
      :show-selector="true"
      @template-change="handleTemplateChange"
    />
  </div>
</template>

<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template'

const handleTemplateChange = (template) => {
  console.log('切换到模板:', template.displayName)
}
</script>
```

### 3. 使用 Composition API

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template'

const {
  currentTemplate,
  currentDevice,
  loading,
  availableTemplates,
  render,
  switchTemplate
} = useTemplate({
  templateRoot: 'src/templates'
})

// 渲染登录模板
const renderLogin = async () => {
  await render('login')
}

// 切换到现代风格
const switchToModern = async () => {
  await switchTemplate('login', 'modern')
}
</script>

<template>
  <div>
    <p>当前设备: {{ currentDevice }}</p>
    <p>当前模板: {{ currentTemplate?.displayName }}</p>

    <button @click="renderLogin" :disabled="loading">
      渲染登录模板
    </button>

    <button @click="switchToModern" :disabled="loading">
      切换到现代风格
    </button>
  </div>
</template>
```

## 🎨 创建你的第一个模板

让我们创建一个简单的登录模板：

### 1. 创建模板目录

```bash
mkdir -p src/templates/login/desktop/my-template
```

### 2. 创建模板组件

```tsx
// src/templates/login/desktop/my-template/index.tsx
import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'MyLoginTemplate',
  props: {
    title: {
      type: String,
      default: '欢迎登录'
    },
    showLogo: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const handleLogin = () => {
      console.log('登录逻辑')
    }

    return {
      handleLogin
    }
  },
  render() {
    return (
      <div class="my-login-template">
        {this.showLogo && (
          <div class="logo">
            <img src="/logo.png" alt="Logo" />
          </div>
        )}

        <h1 class="title">{this.title}</h1>

        <form class="login-form" onSubmit={this.handleLogin}>
          <input
            type="text"
            placeholder="用户名"
            class="form-input"
          />
          <input
            type="password"
            placeholder="密码"
            class="form-input"
          />
          <button type="submit" class="login-btn">
            登录
          </button>
        </form>
      </div>
    )
  }
})
```

### 3. 创建样式文件

```less
// src/templates/login/desktop/my-template/index.less
.my-login-template {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .logo {
    text-align: center;
    margin-bottom: 24px;

    img {
      width: 80px;
      height: 80px;
    }
  }

  .title {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 32px;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .form-input {
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: #007bff;
      }
    }

    .login-btn {
      padding: 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: #0056b3;
      }
    }
  }
}
```

### 4. 创建配置文件

```typescript
// src/templates/login/desktop/my-template/config.ts
import type { TemplateConfig } from '@ldesign/template'

const config: TemplateConfig = {
  id: 'my-template',
  name: '我的登录模板',
  description: '一个简洁美观的登录模板',
  version: '1.0.0',
  author: '你的名字',
  category: 'login',
  device: 'desktop',
  variant: 'my-template',
  isDefault: false,
  features: ['responsive', 'accessible'],
  thumbnail: '/thumbnails/my-login-template.png',
  props: {
    title: {
      type: 'string',
      default: '欢迎登录',
      description: '登录页面标题'
    },
    showLogo: {
      type: 'boolean',
      default: true,
      description: '是否显示Logo'
    }
  }
}

export default config
```

## 🚀 运行你的模板

现在你可以在应用中使用你的模板了：

```vue
<template>
  <TemplateRenderer
    category="login"
    template="my-template"
    :props="{
      title: '欢迎回来！',
      showLogo: true
    }"
  />
</template>
```

## 🎉 恭喜！

你已经成功创建了第一个模板！接下来你可以：

- 📱 [创建响应式模板](./responsive-templates.md) - 适配不同设备
- 🎨 [自定义模板选择器](./template-selector.md) - 让用户自由切换
- ⚡ [性能优化](./performance.md) - 让模板加载更快
- 🧪 [编写测试](./testing.md) - 确保模板质量

## 💡 小贴士

- 🔍 使用 `manager.getTemplates()` 查看所有可用模板
- 🎯 使用 `manager.getCurrentDevice()` 获取当前设备类型
- 🔄 使用 `manager.on('template:loaded', callback)` 监听模板加载事件
- 🧹 使用 `manager.clearCache()` 清除缓存以便开发调试

// 4. 使用渲染结果
console.log('模板组件:', loginTemplate.component)
console.log('模板元数据:', loginTemplate.metadata)
```

## 🎨 Vue 项目中使用

在 Vue 3 项目中使用更加简单：

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { computed } from 'vue'

// 使用模板管理 Hook
const {
  currentTemplate,
  templates,
  isLoading,
  switchTemplate,
  scanTemplates
} = useTemplate({
  enableCache: true,
  autoDetectDevice: true
}, {
  autoScan: true // 自动扫描模板
})

// 可用模板列表
const availableTemplates = computed(() =>
  templates.value.filter(t => t.category === 'login')
)

// 切换模板
async function switchTo(template: any) {
  await switchTemplate(
    template.category,
    template.device,
    template.template
  )
}

// 检查是否为当前模板
function isCurrentTemplate(template: any) {
  return currentTemplate.value?.metadata.template === template.template
}

// 传递给模板的属性
const templateProps = {
  title: '欢迎登录',
  subtitle: '请输入您的账号信息',
  onLogin: (credentials: any) => {
    console.log('登录信息:', credentials)
  }
}
</script>

<template>
  <div class="app">
    <!-- 模板选择器 -->
    <div class="template-selector">
      <button
        v-for="template in availableTemplates"
        :key="template.template"
        :class="{ active: isCurrentTemplate(template) }"
        @click="switchTo(template)"
      >
        {{ template.name }}
      </button>
    </div>

    <!-- 当前模板 -->
    <div class="template-container">
      <component
        :is="currentTemplate.component"
        v-if="currentTemplate"
        v-bind="templateProps"
      />
      <div v-else class="loading">
        🎭 模板加载中...
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.template-selector button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.template-selector button:hover {
  background: #f5f5f5;
}

.template-selector button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.template-container {
  min-height: 400px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 18px;
  color: #666;
}
</style>
```

## 📱 设备自适应示例

模板系统会自动检测设备类型：

```typescript
import { DeviceDetector } from '@ldesign/device'
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager({
  autoDetectDevice: true // 启用自动设备检测
})

// 扫描模板
await manager.scanTemplates()

// 系统会自动选择适合当前设备的模板
const currentDevice = manager.getCurrentDevice()
console.log('当前设备:', currentDevice) // 'desktop' | 'mobile' | 'tablet'

// 渲染适合当前设备的登录模板
const template = await manager.render({
  category: 'login',
  device: currentDevice, // 或者省略，系统会自动选择
  template: 'modern'
})
```

## 🎭 模板切换动画

添加平滑的切换动画：

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { computed } from 'vue'

const { currentTemplate } = useTemplate()

// 用于触发过渡的唯一键
const templateKey = computed(() =>
  currentTemplate.value
    ? `${currentTemplate.value.metadata.category}-${currentTemplate.value.metadata.template}`
    : 'loading'
)

function onBeforeEnter() {
  console.log('🎭 模板切换开始')
}

function onAfterEnter() {
  console.log('✨ 模板切换完成')
}
</script>

<template>
  <div class="template-wrapper">
    <transition
      name="template-fade"
      mode="out-in"
      @before-enter="onBeforeEnter"
      @after-enter="onAfterEnter"
    >
      <component
        :is="currentTemplate?.component"
        :key="templateKey"
        v-bind="templateProps"
      />
    </transition>
  </div>
</template>

<style scoped>
.template-fade-enter-active,
.template-fade-leave-active {
  transition: all 0.3s ease;
}

.template-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.template-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
```

## 🔧 配置选项

```typescript
const manager = new TemplateManager({
  // 缓存配置
  enableCache: true,

  // 设备检测
  autoDetectDevice: true,
  defaultDevice: 'desktop',

  // 调试模式
  debug: process.env.NODE_ENV === 'development',

  // 自定义模板路径
  templatePaths: [
    './src/templates',
    './src/custom-templates'
  ],

  // 错误处理
  onError: (error) => {
    console.error('模板错误:', error)
  },

  // 模板加载完成回调
  onTemplateLoaded: (metadata) => {
    console.log('模板已加载:', metadata.name)
  }
})
```

## 🎪 实时预览

想要实时预览模板效果？试试这个：

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { ref, watch } from 'vue'

const { render } = useTemplate()

const devices = ['desktop', 'tablet', 'mobile']
const deviceNames = {
  desktop: '🖥️ 桌面',
  tablet: '📱 平板',
  mobile: '📱 手机'
}

const currentDevice = ref('desktop')
const previewTemplate = ref(null)

// 监听设备变化，重新渲染模板
watch(currentDevice, async (newDevice) => {
  previewTemplate.value = await render({
    category: 'login',
    device: newDevice,
    template: 'modern'
  })
}, { immediate: true })
</script>

<template>
  <div class="preview-container">
    <!-- 设备选择器 -->
    <div class="device-selector">
      <button
        v-for="device in devices"
        :key="device"
        :class="{ active: currentDevice === device }"
        @click="currentDevice = device"
      >
        {{ deviceNames[device] }}
      </button>
    </div>

    <!-- 模板预览 -->
    <div class="preview-frame" :class="`device-${currentDevice}`">
      <component
        :is="previewTemplate?.component"
        v-bind="previewProps"
      />
    </div>
  </div>
</template>

<style scoped>
.preview-frame.device-desktop {
  width: 1200px;
  height: 800px;
}

.preview-frame.device-tablet {
  width: 768px;
  height: 1024px;
}

.preview-frame.device-mobile {
  width: 375px;
  height: 667px;
}
</style>
```

## 🎯 下一步

恭喜！你已经掌握了基础用法。接下来可以：

- 📖 深入了解 [核心概念](/guide/concepts)
- 🎨 学习 [自定义模板](/guide/custom-templates)
- 🚀 查看 [完整示例](/examples/full-app)
- 📚 浏览 [API 文档](/api/)

## 💡 小贴士

- 🔄 使用 `enableCache: true` 提升性能
- 📱 启用 `autoDetectDevice` 获得最佳用户体验
- 🎭 为模板切换添加过渡动画
- 🐛 在开发环境启用 `debug: true` 便于调试
