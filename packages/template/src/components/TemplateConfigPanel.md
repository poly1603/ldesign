# TemplateConfigPanel 模板配置面板

## 📋 概述

`TemplateConfigPanel` 是一个集成了多种配置功能的Vue组件，为模板系统提供统一的配置界面。它整合了模板选择器、主题色选择、多语言选择和暗黑模式切换等功能。

## ✨ 特性

- **🎨 模板选择器**：快速切换不同的模板样式，支持搜索和预览
- **🌈 主题色选择**：提供多种预设主题色，支持实时切换
- **🌙 暗黑模式**：支持浅色、深色和自动模式切换
- **🌍 多语言支持**：支持中文、英文、日文等多种语言
- **📱 响应式设计**：适配桌面端和移动端
- **⚡ 实时预览**：所有配置更改都会实时生效
- **💾 持久化**：配置可以保存到本地存储

## 🚀 快速开始

### 基础使用

```vue
<template>
  <div>
    <!-- 你的模板内容 -->
    <div class="template-content">
      <!-- ... -->
    </div>
    
    <!-- 配置面板 -->
    <TemplateConfigPanel
      v-model:visible="showConfigPanel"
      :current-template="currentTemplate"
      template-category="dashboard"
      device-type="desktop"
      @template-select="handleTemplateSelect"
      @theme-change="handleThemeChange"
      @language-change="handleLanguageChange"
      @dark-mode-change="handleDarkModeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TemplateConfigPanel } from '@ldesign/template/components'

const showConfigPanel = ref(false)
const currentTemplate = ref('dashboard-desktop-default')

const handleTemplateSelect = (templateName: string) => {
  currentTemplate.value = templateName
  console.log('Selected template:', templateName)
}

const handleThemeChange = (theme: string) => {
  console.log('Theme changed:', theme)
}

const handleLanguageChange = (language: string) => {
  console.log('Language changed:', language)
}

const handleDarkModeChange = (isDark: boolean) => {
  console.log('Dark mode changed:', isDark)
}
</script>
```

### 在模板中集成

配置面板已经集成到以下模板中：

- `packages/template/src/templates/dashboard/desktop/default/index.vue`
- `packages/template/src/templates/login/desktop/default/index.vue`

## 📖 API 文档

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `visible` | `boolean` | `false` | 是否显示配置面板 |
| `currentTemplate` | `string` | `''` | 当前模板名称 |
| `templateCategory` | `string` | `'dashboard'` | 模板分类 |
| `deviceType` | `DeviceType` | `'desktop'` | 设备类型 |
| `showTemplateSelector` | `boolean` | `true` | 是否显示模板选择器 |
| `showThemeSelector` | `boolean` | `true` | 是否显示主题选择 |
| `showLanguageSelector` | `boolean` | `true` | 是否显示语言选择 |
| `showDarkModeToggle` | `boolean` | `true` | 是否显示暗黑模式切换 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:visible` | `(visible: boolean)` | 面板显示状态变化 |
| `template-select` | `(templateName: string)` | 模板选择事件 |
| `theme-change` | `(theme: string)` | 主题变化事件 |
| `language-change` | `(language: string)` | 语言变化事件 |
| `dark-mode-change` | `(isDark: boolean)` | 暗黑模式变化事件 |

### 插槽

目前组件不提供插槽，所有内容都是预定义的。

## 🎨 样式定制

### CSS 变量

配置面板使用了 LDESIGN 设计系统的 CSS 变量，你可以通过覆盖这些变量来定制样式：

```css
:root {
  --ldesign-brand-color: #722ED1;
  --ldesign-brand-color-hover: #5e2aa7;
  --ldesign-bg-color-container: #ffffff;
  --ldesign-text-color-primary: rgba(0, 0, 0, 0.9);
  /* ... 更多变量 */
}
```

### 自定义样式

```vue
<style>
.template-config-panel {
  /* 自定义配置面板位置 */
  top: 10px;
  right: 10px;
}

.config-panel-trigger {
  /* 自定义触发按钮样式 */
  background: linear-gradient(45deg, #722ED1, #9254de);
}
</style>
```

## 🌍 国际化

配置面板支持多语言，目前支持：

- 简体中文 (`zh-CN`)
- 英文 (`en`)
- 日文 (`ja`)

### 添加新语言

1. 在 `packages/template/src/locales/` 目录下创建新的语言文件
2. 更新 `packages/template/src/locales/index.ts` 导出新语言
3. 在组件中添加新语言到 `availableLanguages` 数组

## 🔧 高级配置

### 自定义主题色

```typescript
const customThemeColors = [
  { name: 'custom-blue', value: '#1890ff', displayName: '自定义蓝色' },
  { name: 'custom-green', value: '#52c41a', displayName: '自定义绿色' },
  // ... 更多自定义颜色
]
```

### 集成外部主题管理

```vue
<script setup lang="ts">
import { useTheme } from '@ldesign/theme/vue'

const { theme, setTheme, toggleTheme } = useTheme()

const handleThemeChange = (themeName: string) => {
  setTheme(themeName)
}
</script>
```

## 📱 响应式设计

配置面板在不同设备上的表现：

- **桌面端** (≥1024px)：完整功能，浮动面板
- **平板端** (768px-1023px)：适配布局，保持完整功能
- **移动端** (<768px)：紧凑布局，优化触摸操作

## 🎯 使用场景

### 1. 后台管理系统

```vue
<template>
  <DashboardTemplate>
    <template #content>
      <!-- 仪表板内容 -->
    </template>
    
    <TemplateConfigPanel
      template-category="dashboard"
      :show-template-selector="true"
      :show-theme-selector="true"
    />
  </DashboardTemplate>
</template>
```

### 2. 登录页面

```vue
<template>
  <LoginTemplate>
    <template #content>
      <!-- 登录表单 -->
    </template>
    
    <TemplateConfigPanel
      template-category="login"
      :show-language-selector="true"
      :show-dark-mode-toggle="true"
    />
  </LoginTemplate>
</template>
```

### 3. 演示和预览

```vue
<template>
  <div class="demo-container">
    <component :is="currentTemplateComponent" />
    
    <TemplateConfigPanel
      v-model:visible="true"
      :current-template="currentTemplate"
      @template-select="switchTemplate"
    />
  </div>
</template>
```

## 🐛 故障排除

### 常见问题

**Q: 配置面板不显示？**
A: 检查 `visible` 属性是否正确绑定，确保组件已正确导入。

**Q: 主题切换不生效？**
A: 确保已正确集成主题管理系统，检查 CSS 变量是否正确定义。

**Q: 语言切换不生效？**
A: 确保已正确集成国际化系统，检查语言包是否正确加载。

### 调试技巧

```vue
<script setup lang="ts">
// 启用调试模式
const debug = ref(true)

const handleTemplateSelect = (templateName: string) => {
  if (debug.value) {
    console.log('Template selected:', templateName)
  }
}
</script>
```

## 📄 许可证

MIT License - 详见 [LICENSE](../../../../LICENSE) 文件
