# 模板库 (Templates)

## 📋 概述

模板库包含了Vue3模板管理系统的所有预制模板，涵盖了常见的业务场景和UI组件。每个模板都经过精心设计，支持多设备适配，并提供完整的配置选项。

## ✨ 特性

- **🎨 丰富多样**：涵盖登录、仪表板、表单、电商等多种场景
- **📱 多设备支持**：每个模板都提供desktop、tablet、mobile三个版本
- **🔧 高度可配置**：丰富的配置选项和自定义能力
- **🎯 开箱即用**：无需额外配置即可直接使用
- **📚 文档完整**：每个模板都有详细的使用文档

## 📁 目录结构

```
templates/
├── auth/                     # 认证相关模板
│   ├── login/               # 登录模板
│   │   ├── desktop/
│   │   │   ├── default/     # 默认登录页面
│   │   │   ├── modern/      # 现代风格登录
│   │   │   └── minimal/     # 简约风格登录
│   │   ├── tablet/
│   │   └── mobile/
│   ├── register/            # 注册模板
│   └── reset-password/      # 重置密码模板
├── dashboard/               # 仪表板模板
│   ├── overview/           # 概览仪表板
│   ├── analytics/          # 数据分析仪表板
│   └── reports/            # 报告仪表板
├── user/                   # 用户管理模板
│   ├── profile/           # 用户资料
│   └── settings/          # 用户设置
├── form/                   # 表单模板
│   ├── contact/           # 联系表单
│   ├── survey/            # 调查问卷
│   └── wizard/            # 多步骤表单
├── content/                # 内容展示模板
│   ├── article/           # 文章页面
│   ├── blog/              # 博客页面
│   └── gallery/           # 图片画廊
├── ecommerce/              # 电商模板
│   ├── product/           # 产品页面
│   ├── cart/              # 购物车
│   └── checkout/          # 结账页面
├── common/                 # 通用组件模板
│   ├── header/            # 页面头部
│   ├── footer/            # 页面底部
│   └── navigation/        # 导航组件
└── error/                  # 错误页面模板
    ├── not-found/         # 404页面
    └── maintenance/       # 维护页面
```

## 🎯 模板分类

### 认证相关 (Auth)

#### 登录模板 (Login)
- **用途**：用户登录页面
- **变体**：默认、现代、简约风格
- **特性**：表单验证、记住密码、社交登录
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

#### 注册模板 (Register)
- **用途**：用户注册页面
- **特性**：密码强度检测、邮箱验证、条款同意
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

#### 重置密码模板 (Reset Password)
- **用途**：密码重置流程
- **特性**：多步骤流程、邮件验证、密码强度检测
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

### 仪表板 (Dashboard)

#### 概览仪表板 (Overview)
- **用途**：系统概览和关键指标展示
- **特性**：数据卡片、图表展示、实时更新
- **设备支持**：✅ Desktop ✅ Tablet ❌ Mobile

#### 数据分析仪表板 (Analytics)
- **用途**：详细的数据分析和报告
- **特性**：多种图表、数据过滤、导出功能
- **设备支持**：✅ Desktop ✅ Tablet ❌ Mobile

### 用户管理 (User)

#### 用户资料 (Profile)
- **用途**：用户个人信息管理
- **特性**：头像上传、信息编辑、隐私设置
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

#### 用户设置 (Settings)
- **用途**：系统设置和偏好配置
- **特性**：主题切换、通知设置、账户安全
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

### 表单 (Form)

#### 联系表单 (Contact)
- **用途**：联系我们表单
- **特性**：字段验证、文件上传、提交确认
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

#### 调查问卷 (Survey)
- **用途**：问卷调查和反馈收集
- **特性**：多种题型、条件逻辑、进度显示
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

### 电商 (E-commerce)

#### 产品页面 (Product)
- **用途**：产品详情展示
- **特性**：图片画廊、规格选择、评价展示
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

#### 购物车 (Cart)
- **用途**：购物车管理
- **特性**：商品管理、优惠券、价格计算
- **设备支持**：✅ Desktop ✅ Tablet ✅ Mobile

## 🚀 快速开始

### 使用模板

```typescript
import { useTemplateScanner } from '@ldesign/template/composables'

// 扫描所有模板
const { templates } = useTemplateScanner({
  templatesDir: 'src/templates',
  autoScan: true
})

// 获取登录模板
const loginTemplates = templates.value.get('login-desktop-default')
```

### 渲染模板

```vue
<template>
  <component 
    :is="templateComponent" 
    v-bind="templateProps"
  />
</template>

<script setup lang="ts">
import { useTemplateRenderer } from '@ldesign/template/composables'

const { renderTemplate, renderedComponent } = useTemplateRenderer()

// 渲染登录模板
await renderTemplate({
  name: 'login-desktop-default',
  category: 'login',
  device: 'desktop'
})
</script>
```

## 📋 模板规范

### 目录结构规范

每个模板必须遵循以下目录结构：

```
template-name/
├── index.vue          # 主组件文件 (必需)
├── config.ts          # 配置文件 (必需)
├── style.css          # 样式文件 (可选)
├── preview.png        # 预览图片 (推荐)
└── README.md          # 说明文档 (推荐)
```

### 文件命名规范

- **组件文件**：`index.vue`
- **配置文件**：`config.ts`
- **样式文件**：`style.css` 或 `style.scss`
- **预览图片**：`preview.png` 或 `preview.jpg`
- **说明文档**：`README.md`

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
  // ... 其他配置
} as TemplateConfig
```

## 🎨 设计规范

### 响应式设计

所有模板都必须支持响应式设计：

- **Desktop**: ≥ 1024px
- **Tablet**: 768px - 1023px  
- **Mobile**: < 768px

### 颜色规范

使用CSS变量定义主题色彩：

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

### 字体规范

```css
.template {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
```

## 🔧 开发指南

### 创建新模板

1. **创建目录结构**
```bash
mkdir -p src/templates/category/device/template-name
cd src/templates/category/device/template-name
```

2. **创建基础文件**
```bash
touch index.vue config.ts style.css README.md
```

3. **实现模板组件**
```vue
<!-- index.vue -->
<template>
  <div class="template-container">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped>
/* 组件样式 */
</style>
```

4. **配置模板信息**
```typescript
// config.ts
export default {
  name: 'my-template',
  displayName: '我的模板',
  // ... 其他配置
}
```

### 测试模板

```typescript
// 测试模板加载
import { TemplateScanner } from '@ldesign/template/scanner'

const scanner = new TemplateScanner({
  templatesDir: 'src/templates'
})

const result = await scanner.scan()
const myTemplate = result.templates.get('my-template')

console.log('模板信息:', myTemplate)
```

## 📊 模板统计

| 分类 | Desktop | Tablet | Mobile | 总计 |
|------|---------|--------|--------|------|
| 认证 | 6 | 4 | 4 | 14 |
| 仪表板 | 4 | 3 | 1 | 8 |
| 用户管理 | 3 | 3 | 3 | 9 |
| 表单 | 4 | 4 | 4 | 12 |
| 内容 | 3 | 3 | 2 | 8 |
| 电商 | 5 | 4 | 4 | 13 |
| 通用 | 6 | 4 | 4 | 14 |
| 错误页面 | 2 | 2 | 2 | 6 |
| **总计** | **33** | **27** | **24** | **84** |

## 🎯 使用场景

### 快速原型

```typescript
// 快速创建登录页面原型
const loginPrototype = await loadTemplate('login-desktop-modern')
```

### 项目脚手架

```typescript
// 基于模板创建项目结构
const projectTemplates = [
  'login-desktop-default',
  'dashboard-desktop-overview',
  'user-desktop-profile'
]
```

### 设计系统

```typescript
// 构建设计系统组件库
const designSystemTemplates = filterTemplates({
  tags: ['design-system', 'component']
})
```

## 🛠️ 故障排除

### 常见问题

**Q: 模板加载失败？**
A: 检查模板目录结构和文件命名是否符合规范。

**Q: 样式不生效？**
A: 确保样式文件路径正确，检查CSS变量定义。

**Q: 配置验证失败？**
A: 检查config.ts文件的类型定义是否正确。

### 调试技巧

```typescript
// 启用模板调试
const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  debug: true
})
```

## 📝 贡献指南

### 提交新模板

1. Fork项目仓库
2. 创建新的模板分支
3. 按照规范实现模板
4. 添加测试和文档
5. 提交Pull Request

### 代码规范

- 使用TypeScript编写
- 遵循ESLint规则
- 添加单元测试
- 编写完整文档

## 🔗 相关资源

- [模板扫描器](../scanner/README.md)
- [组合式函数](../composables/README.md)
- [类型定义](../types/README.md)
- [配置管理](../config/README.md)

## 📄 许可证

MIT License - 详见 [LICENSE](../../../LICENSE) 文件
