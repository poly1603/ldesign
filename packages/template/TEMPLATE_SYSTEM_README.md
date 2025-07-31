# 🎨 LDesign Template 智能模板系统

## 🌟 系统概述

LDesign Template 智能模板系统是一个完整的、开箱即用的模板管理解决方案，提供了：

- 🔄 **智能设备检测**：自动识别桌面端、平板端、移动端
- 🎯 **自动模板切换**：根据设备类型自动选择最适合的模板
- 💾 **智能缓存机制**：记住用户在每个设备类型下的模板选择
- 🎛️ **可视化选择器**：提供直观的模板切换界面
- 📱 **响应式设计**：所有模板都完美适配各种屏幕尺寸

## 📁 项目结构

```
packages/template/
├── src/
│   ├── core/                    # 核心功能模块
│   │   ├── device.ts           # 设备检测和管理
│   │   ├── template-manager.ts # 模板注册和管理
│   │   └── cache.ts            # 缓存管理
│   ├── templates/              # 内置模板库
│   │   └── login/              # 登录模板分类
│   │       ├── desktop/        # 桌面端模板
│   │       │   ├── classic/    # 经典登录模板 (默认)
│   │       │   └── modern/     # 现代登录模板
│   │       ├── mobile/         # 移动端模板
│   │       │   ├── simple/     # 简洁登录模板 (默认)
│   │       │   └── card/       # 卡片登录模板
│   │       └── tablet/         # 平板端模板
│   │           ├── adaptive/   # 自适应登录模板 (默认)
│   │           └── split/      # 分屏登录模板
│   └── vue/                    # Vue 集成
│       ├── components/         # Vue 组件
│       │   ├── TemplateSelector.tsx  # 模板选择器
│       │   └── TemplateSelector.less # 选择器样式
│       └── composables/        # 组合式API
│           └── useTemplateSwitch.ts  # 智能切换Hook
└── examples/
    └── src/views/Login.vue     # 完整示例页面
```

## 🚀 核心功能

### 1. 设备类型检测

系统能够智能检测当前设备类型：

- **桌面端** (≥1024px): 提供功能完整的登录界面
- **平板端** (768-1023px): 平衡功能性和触摸友好性
- **移动端** (≤767px): 专为触摸操作优化

### 2. 内置模板库

#### 桌面端模板
- **经典登录** (默认): 传统企业级登录界面，简洁大方
- **现代登录**: 现代化设计，渐变背景和动画效果

#### 移动端模板
- **简洁登录** (默认): 全屏设计，大按钮操作，触摸友好
- **卡片登录**: 卡片式设计，层次分明，视觉效果佳

#### 平板端模板
- **自适应登录** (默认): 兼顾横屏和竖屏使用场景
- **分屏登录**: 左右分栏设计，专业感强

### 3. 智能切换机制

- **自动检测**: 页面加载时自动检测设备类型
- **实时响应**: 窗口大小变化时自动切换对应模板
- **缓存记忆**: 记住用户在每个设备类型下的模板选择
- **手动切换**: 提供可视化选择器供用户手动切换

## 🛠️ 使用方法

### 基础使用

```vue
<template>
  <div class="login-page">
    <!-- 模板选择器 -->
    <TemplateSelector
      category="login"
      v-model:value="selectedTemplate"
      :show-device-info="true"
      @change="handleTemplateChange"
    />

    <!-- 动态模板渲染 -->
    <component
      :is="currentTemplateComponent"
      v-bind="templateProps"
      @login="handleLogin"
    />
  </div>
</template>

<script setup>
import { useTemplateSwitch } from '@ldesign/template/vue'

const {
  currentTemplate,
  currentVariant,
  switchTemplate,
  getTemplateComponent
} = useTemplateSwitch({
  category: 'login',
  autoSwitch: true,
  cacheEnabled: true
})
</script>
```

### 高级配置

```typescript
// 注册自定义模板
import { registerTemplate } from '@ldesign/template/core'

registerTemplate(
  'login',           // 分类
  'desktop',         // 设备类型
  'custom',          // 变体名称
  customConfig,      // 模板配置
  CustomComponent    // 模板组件
)

// 使用组合式API
const templateSwitch = useTemplateSwitch({
  category: 'login',
  autoSwitch: true,
  cacheEnabled: true,
  onDeviceChange: (oldDevice, newDevice) => {
    console.log(`设备切换: ${oldDevice} -> ${newDevice}`)
  },
  onTemplateChange: (template) => {
    console.log('模板变化:', template.name)
  }
})
```

## 🎯 API 参考

### useTemplateSwitch

智能模板切换的核心组合式API。

```typescript
interface UseTemplateSwitchOptions {
  category: string              // 模板分类
  initialVariant?: string       // 初始模板变体
  autoSwitch?: boolean         // 是否自动切换
  cacheEnabled?: boolean       // 是否启用缓存
  onDeviceChange?: Function    // 设备变化回调
  onTemplateChange?: Function  // 模板变化回调
}
```

### TemplateSelector

可视化模板选择器组件。

```typescript
interface TemplateSelectorProps {
  category: string             // 模板分类
  value?: string              // 当前选中的模板
  showDeviceInfo?: boolean    // 是否显示设备信息
  showPreview?: boolean       // 是否显示预览图
  disabled?: boolean          // 是否禁用
}
```

## 🎨 模板开发

### 创建新模板

1. **创建模板目录结构**：
```
src/templates/[category]/[device]/[variant]/
├── config.ts    # 模板配置
├── index.tsx    # 模板组件
└── index.less   # 模板样式
```

2. **定义模板配置**：
```typescript
export const config: TemplateConfig = {
  id: 'login-desktop-custom',
  name: '自定义登录',
  description: '这是一个自定义的桌面端登录模板',
  category: 'login',
  device: 'desktop',
  variant: 'custom',
  isDefault: false,
  // ... 其他配置
}
```

3. **实现模板组件**：
```tsx
export default defineComponent({
  name: 'CustomLoginTemplate',
  props: {
    title: String,
    subtitle: String,
    // ... 其他props
  },
  emits: ['login', 'register'],
  setup(props, { emit }) {
    // 组件逻辑
    return () => (
      <div class="custom-login">
        {/* 模板内容 */}
      </div>
    )
  }
})
```

### 模板规范

- **响应式设计**: 所有模板必须支持响应式布局
- **事件规范**: 统一的事件命名和参数格式
- **样式隔离**: 使用作用域样式避免冲突
- **无障碍支持**: 遵循WCAG无障碍标准
- **性能优化**: 合理使用懒加载和代码分割

## 🔧 配置选项

### 设备断点配置

```typescript
export const DEVICE_BREAKPOINTS = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity }
}
```

### 缓存配置

- **存储方式**: localStorage
- **缓存键**: `ldesign-template-cache`
- **过期时间**: 30天
- **版本控制**: 自动版本检查和清理

## 📱 响应式特性

### 断点系统
- **移动端**: 0-767px
- **平板端**: 768-1023px  
- **桌面端**: 1024px+

### 自适应特性
- **方向检测**: 自动检测横屏/竖屏
- **触摸支持**: 针对触摸设备优化
- **高分辨率**: 支持Retina等高DPI屏幕
- **安全区域**: 适配刘海屏等特殊屏幕

## 🎯 最佳实践

1. **模板设计**：
   - 保持设计一致性
   - 考虑不同设备的使用场景
   - 提供清晰的视觉层次

2. **性能优化**：
   - 使用懒加载减少初始包大小
   - 合理使用缓存机制
   - 避免不必要的重渲染

3. **用户体验**：
   - 提供平滑的切换动画
   - 保持用户的选择偏好
   - 提供清晰的状态反馈

## 🚀 快速开始

1. **安装依赖**：
```bash
pnpm install
```

2. **启动示例**：
```bash
cd packages/template/examples
pnpm dev
```

3. **访问演示**：
打开 http://localhost:3001/login 查看完整的模板系统演示

## 🎉 总结

LDesign Template 智能模板系统为开发者提供了一个完整的、可扩展的模板管理解决方案。通过智能的设备检测、自动模板切换和用户偏好记忆，为不同设备的用户提供最佳的使用体验。

系统具有以下优势：
- ✅ **开箱即用**：内置多种精美模板
- ✅ **智能切换**：自动适配不同设备
- ✅ **高度可定制**：支持自定义模板开发
- ✅ **性能优化**：懒加载和缓存机制
- ✅ **类型安全**：完整的TypeScript支持
- ✅ **响应式设计**：完美适配各种屏幕

立即开始使用，为您的应用打造专业的多设备登录体验！🎨✨
