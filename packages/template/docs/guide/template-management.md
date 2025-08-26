# 模板管理

> 🎭 掌握模板管理的艺术，让你的应用界面千变万化！

## 🎯 核心概念

模板管理是 `@ldesign/template` 的核心功能，它提供了一套完整的模板生命周期管理机制。

### 模板结构

每个模板都包含以下关键信息：

```typescript
interface TemplateMetadata {
  id: string // 唯一标识符
  name: string // 显示名称
  category: string // 分类（login、dashboard等）
  device: DeviceType // 设备类型
  template: string // 模板变体
  version: string // 版本号
  description?: string // 描述
  author?: string // 作者
  tags?: string[] // 标签
}
```

## 🔍 模板扫描

### 自动扫描

```typescript
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager({
  templatePaths: [
    './src/templates',
    './src/custom-templates'
  ]
})

// 扫描所有模板
const result = await manager.scanTemplates()
console.log(`发现 ${result.count} 个模板`)
console.log('模板列表:', result.templates)
```

### 手动注册

```typescript
// 注册单个模板
manager.registerTemplate({
  id: 'login-desktop-custom',
  name: '自定义登录',
  category: 'login',
  device: 'desktop',
  template: 'custom',
  component: CustomLoginComponent
})

// 批量注册
manager.registerTemplates([
  { /* 模板1 */ },
  { /* 模板2 */ },
  { /* 模板3 */ }
])
```

## 📂 模板组织

### 推荐目录结构

```
src/templates/
├── login/              # 登录模板分类
│   ├── desktop/        # 桌面端
│   │   ├── classic/    # 经典风格
│   │   ├── modern/     # 现代风格
│   │   └── minimal/    # 极简风格
│   ├── mobile/         # 移动端
│   │   ├── default/
│   │   └── card/
│   └── tablet/         # 平板端
│       ├── default/
│       └── split/
├── dashboard/          # 仪表板模板
│   ├── admin/
│   ├── user/
│   └── analytics/
└── content/            # 内容模板
    ├── article/
    ├── product/
    └── news/
```

### 命名规范

- **分类名**: 使用小写字母，如 `login`、`dashboard`
- **设备类型**: `desktop`、`tablet`、`mobile`
- **模板变体**: 描述性名称，如 `classic`、`modern`、`minimal`

## 🎨 模板创建

### Vue 组件模板

```vue
<!-- src/templates/login/desktop/modern/index.vue -->
<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  onLogin?: (credentials: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '欢迎登录',
  subtitle: '请输入您的账号信息'
})

const formData = ref({
  username: '',
  password: ''
})

function handleSubmit() {
  props.onLogin?.(formData.value)
}
</script>

<template>
  <div class="modern-login">
    <div class="login-card">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>

      <form @submit.prevent="handleSubmit">
        <input
          v-model="formData.username"
          type="text"
          placeholder="用户名"
          required
        >
        <input
          v-model="formData.password"
          type="password"
          placeholder="密码"
          required
        >
        <button type="submit">
          登录
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modern-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}
</style>
```

### 模板配置文件

```typescript
// src/templates/login/desktop/modern/config.ts
import type { TemplateConfig } from '@ldesign/template'

export const modernLoginConfig: TemplateConfig = {
  id: 'login-desktop-modern',
  name: '现代登录',
  description: '现代化设计的桌面端登录界面',
  category: 'login',
  device: 'desktop',
  template: 'modern',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['现代', '渐变', '卡片'],

  // 支持的属性
  props: {
    title: {
      type: 'string',
      default: '欢迎登录',
      description: '登录页面标题'
    },
    subtitle: {
      type: 'string',
      default: '请输入您的账号信息',
      description: '登录页面副标题'
    }
  },

  // 预览图
  preview: '/previews/login-desktop-modern.png',

  // 兼容性
  compatibility: {
    vue: '^3.0.0',
    browsers: ['Chrome >= 88', 'Firefox >= 85']
  }
}
```

## 🔄 模板切换

### 基础切换

```typescript
// 切换到指定模板
await manager.switchTemplate('login', 'desktop', 'modern')

// 获取当前模板
const current = manager.getCurrentTemplate()
console.log('当前模板:', current.metadata.name)
```

### 智能切换

```typescript
// 根据条件智能选择模板
const template = await manager.selectTemplate({
  category: 'login',
  device: 'auto', // 自动检测设备
  preferences: {
    style: 'modern', // 偏好现代风格
    theme: 'dark' // 偏好深色主题
  }
})
```

## 📊 模板查询

### 按条件查询

```typescript
// 查询所有登录模板
const loginTemplates = manager.getTemplatesByCategory('login')

// 查询桌面端模板
const desktopTemplates = manager.getTemplatesByDevice('desktop')

// 复合查询
const modernDesktopTemplates = manager.getTemplates({
  category: 'login',
  device: 'desktop',
  tags: ['modern']
})
```

### 模板统计

```typescript
// 获取统计信息
const stats = manager.getTemplateStats()
console.log('模板统计:', {
  total: stats.total,
  byCategory: stats.byCategory,
  byDevice: stats.byDevice,
  byAuthor: stats.byAuthor
})
```

## 🎭 模板生命周期

### 生命周期钩子

```typescript
const manager = new TemplateManager({
  // 模板加载前
  onBeforeLoad: (metadata) => {
    console.log('准备加载模板:', metadata.name)
  },

  // 模板加载完成
  onTemplateLoaded: (template) => {
    console.log('模板加载成功:', template.metadata.name)
  },

  // 模板切换前
  onBeforeSwitch: (from, to) => {
    console.log(`准备从 ${from?.name} 切换到 ${to.name}`)
  },

  // 模板切换完成
  onAfterSwitch: (template) => {
    console.log('模板切换完成:', template.metadata.name)
  },

  // 错误处理
  onError: (error, context) => {
    console.error('模板错误:', error, context)
  }
})
```

## 🔧 高级功能

### 模板预加载

```typescript
// 预加载常用模板
await manager.preloadTemplates([
  { category: 'login', device: 'desktop', template: 'modern' },
  { category: 'dashboard', device: 'desktop', template: 'admin' }
])
```

### 模板验证

```typescript
// 验证模板配置
const isValid = manager.validateTemplate(templateConfig)
if (!isValid) {
  console.error('模板配置无效')
}
```

### 模板热更新

```typescript
// 开发环境下启用热更新
if (process.env.NODE_ENV === 'development') {
  manager.enableHotReload({
    watchPaths: ['./src/templates'],
    onReload: (template) => {
      console.log('模板已热更新:', template.name)
    }
  })
}
```

## 💡 最佳实践

1. **统一命名**: 使用一致的命名规范
2. **模块化**: 将模板按功能和设备类型组织
3. **版本管理**: 为模板添加版本号
4. **文档化**: 为每个模板编写清晰的文档
5. **测试**: 为模板编写单元测试
6. **性能**: 使用预加载和缓存优化性能

## 🔗 相关链接

- [设备检测](/guide/device-detection)
- [缓存机制](/guide/caching)
- [自定义模板](/guide/custom-templates)
- [API 参考](/api/template-manager)
