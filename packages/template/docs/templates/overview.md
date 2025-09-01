# 模板库概览

LDesign Template 提供了丰富的预制模板，涵盖了常见的业务场景和UI组件。每个模板都经过精心设计，支持多设备适配，并提供完整的配置选项。

## 📊 模板统计

| 分类 | Desktop | Tablet | Mobile | 总计 |
|------|---------|--------|--------|------|
| 认证模板 | 6 | 4 | 4 | 14 |
| 仪表板 | 4 | 3 | 1 | 8 |
| 用户管理 | 3 | 3 | 3 | 9 |
| 表单模板 | 4 | 4 | 4 | 12 |
| 内容展示 | 3 | 3 | 2 | 8 |
| 电商模板 | 5 | 4 | 4 | 13 |
| 通用组件 | 6 | 4 | 4 | 14 |
| 错误页面 | 2 | 2 | 2 | 6 |
| **总计** | **33** | **27** | **24** | **84** |

## 🎨 模板分类

### 认证模板 (Auth)

专为用户认证流程设计的模板集合。

#### 🔐 登录模板 (Login)
- **用途**：用户登录页面
- **变体**：默认、现代、简约、企业级
- **特性**：表单验证、记住密码、社交登录、多语言支持
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

**预览：**
<div class="template-preview-grid">
  <div class="preview-item">
    <img src="/templates/login-desktop-default.png" alt="默认登录" />
    <h4>默认风格</h4>
    <p>简洁实用的登录界面</p>
  </div>
  <div class="preview-item">
    <img src="/templates/login-desktop-modern.png" alt="现代登录" />
    <h4>现代风格</h4>
    <p>时尚的渐变背景设计</p>
  </div>
</div>

#### 📝 注册模板 (Register)
- **用途**：用户注册页面
- **特性**：密码强度检测、邮箱验证、条款同意、多步骤注册
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

#### 🔄 重置密码模板 (Reset Password)
- **用途**：密码重置流程
- **特性**：多步骤流程、邮件验证、密码强度检测
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

### 仪表板模板 (Dashboard)

为数据展示和管理界面设计的模板。

#### 📊 概览仪表板 (Overview)
- **用途**：系统概览和关键指标展示
- **特性**：数据卡片、图表展示、实时更新、响应式布局
- **设备支持**：✅ Desktop ✅ Tablet ❌ Mobile

#### 📈 数据分析仪表板 (Analytics)
- **用途**：详细的数据分析和报告
- **特性**：多种图表、数据过滤、导出功能、交互式图表
- **设备支持**：✅ Desktop ✅ Tablet ❌ Mobile

### 用户管理模板 (User)

用户信息管理相关的模板。

#### 👤 用户资料 (Profile)
- **用途**：用户个人信息管理
- **特性**：头像上传、信息编辑、隐私设置、活动记录
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

#### ⚙️ 用户设置 (Settings)
- **用途**：系统设置和偏好配置
- **特性**：主题切换、通知设置、账户安全、数据导出
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

### 表单模板 (Form)

各种表单场景的模板。

#### 📧 联系表单 (Contact)
- **用途**：联系我们表单
- **特性**：字段验证、文件上传、提交确认、防垃圾邮件
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

#### 📋 调查问卷 (Survey)
- **用途**：问卷调查和反馈收集
- **特性**：多种题型、条件逻辑、进度显示、数据分析
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

### 电商模板 (E-commerce)

电子商务相关的模板。

#### 🛍️ 产品页面 (Product)
- **用途**：产品详情展示
- **特性**：图片画廊、规格选择、评价展示、相关推荐
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

#### 🛒 购物车 (Cart)
- **用途**：购物车管理
- **特性**：商品管理、优惠券、价格计算、库存检查
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

## 🎯 设备适配

### 响应式设计原则

所有模板都遵循响应式设计原则：

- **Desktop (≥ 1024px)**：完整功能，丰富交互
- **Tablet (768px - 1023px)**：优化布局，保持核心功能
- **Mobile (< 768px)**：简化界面，触摸优化

### 设备特定优化

#### 桌面端优化
- 鼠标悬停效果
- 键盘快捷键支持
- 多列布局
- 详细信息展示

#### 移动端优化
- 触摸手势支持
- 大按钮设计
- 简化导航
- 垂直滚动优化

## 🏷️ 模板标签系统

### 设计风格标签
- `modern` - 现代风格
- `classic` - 经典风格
- `minimal` - 极简风格
- `corporate` - 企业风格

### 功能特性标签
- `responsive` - 响应式设计
- `accessible` - 无障碍访问
- `interactive` - 交互丰富
- `animated` - 动画效果

### 技术标签
- `typescript` - TypeScript支持
- `composition-api` - 组合式API
- `pinia` - Pinia状态管理
- `vueuse` - VueUse工具库

## 🚀 快速使用

### 浏览模板

```vue
<script setup lang="ts">
import { TemplateSelector } from '@ldesign/template'

function handleTemplateSelect(template) {
  console.log('选中模板:', template.displayName)
}
</script>

<template>
  <div class="template-browser">
    <TemplateSelector
      :categories="['login', 'dashboard']"
      :devices="['desktop', 'mobile']"
      @select="handleTemplateSelect"
    />
  </div>
</template>
```

### 渲染模板

```vue
<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template'

const templateProps = {
  title: '欢迎登录',
  showLogo: true,
  enableSocialLogin: true
}
</script>

<template>
  <TemplateRenderer
    category="login"
    device="desktop"
    template="modern"
    :props="templateProps"
  />
</template>
```

## 📋 模板规范

### 目录结构

```
template-name/
├── index.vue          # 主组件文件 (必需)
├── config.ts          # 配置文件 (必需)
├── style.css          # 样式文件 (可选)
├── preview.png        # 预览图片 (推荐)
└── README.md          # 说明文档 (推荐)
```

### 配置文件规范

```typescript
// config.ts
import type { TemplateConfig } from '@ldesign/template/types'

export default {
  name: 'template-name',
  displayName: '模板显示名称',
  description: '模板描述',
  version: '1.0.0',
  author: '作者名称',
  category: 'login',
  device: 'desktop',
  tags: ['modern', 'responsive'],

  props: {
    title: {
      type: String,
      default: '默认标题',
      description: '页面标题'
    }
  },

  events: [
    {
      name: 'submit',
      description: '表单提交事件',
      payload: 'FormData'
    }
  ]
} as TemplateConfig
```

## 🎨 自定义主题

### CSS变量

所有模板都支持CSS变量自定义：

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 主题切换

```vue
<script setup lang="ts">
import { useTheme } from '@ldesign/template'

const { setTheme, currentTheme } = useTheme()

function switchTheme(theme: 'light' | 'dark') {
  setTheme(theme)
}
</script>
```

## 🔍 搜索和过滤

### 按分类搜索

```typescript
import { useTemplateScanner } from '@ldesign/template/composables'

const { searchTemplates } = useTemplateScanner()

// 搜索登录模板
const loginTemplates = searchTemplates({
  categories: ['login']
})
```

### 按标签搜索

```typescript
// 搜索现代风格模板
const modernTemplates = searchTemplates({
  tags: ['modern']
})
```

### 关键词搜索

```typescript
// 关键词搜索
const searchResults = searchTemplates({
  keyword: '登录'
})
```

## 📈 性能优化

### 懒加载

```typescript
// 模板组件懒加载
const LazyTemplate = defineAsyncComponent(() =>
  import('./templates/login/desktop/default/index.vue')
)
```

### 缓存策略

```typescript
import { useTemplateCache } from '@ldesign/template'

const { enableCache, clearCache } = useTemplateCache({
  maxSize: 50,
  ttl: 300000 // 5分钟
})
```

## 🛠️ 开发工具

### 模板开发脚手架

```bash
# 创建新模板
npx @ldesign/template-cli create my-template

# 预览模板
npx @ldesign/template-cli preview

# 构建模板
npx @ldesign/template-cli build
```

### 热更新

开发环境下支持模板热更新：

```typescript
import { enableHMR } from '@ldesign/template'

if (process.env.NODE_ENV === 'development') {
  enableHMR()
}
```

## 🔗 相关链接

- [模板分类详情](./categories)
- [设备适配指南](./devices)
- [模板开发规范](./standards)
- [API 参考](../api/scanner)

<style>
.template-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.preview-item {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.preview-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.preview-item h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-brand-1);
}

.preview-item p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
