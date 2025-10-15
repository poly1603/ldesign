# AutoTemplate 自动化组件使用指南

## 🎯 设计理念

`AutoTemplate` 是一个完全自动化的模板组件，封装了所有复杂逻辑，让使用变得极其简单。

## ✨ 自动化功能

1. ✅ **自动初始化** - 自动扫描和初始化模板系统
2. ✅ **自动设备检测** - 根据窗口宽度自动检测设备类型
3. ✅ **自动加载默认模板** - 自动加载当前设备的默认模板
4. ✅ **响应式切换** - 窗口大小变化时自动切换设备和模板
5. ✅ **内置选择器** - 自动显示模板选择器
6. ✅ **加载状态** - 内置加载和错误状态显示

## 🚀 基础使用

### 最简单的用法

```vue
<template>
  <AutoTemplate category="login" />
</template>

<script setup>
import { AutoTemplate } from '@ldesign/template'
</script>
```

就这么简单！✨

## 📚 完整示例

### 示例 1：登录页面

```vue
<template>
  <AutoTemplate 
    category="login"
    @submit="handleSubmit"
    @register="handleRegister"
  />
</template>

<script setup>
import { AutoTemplate } from '@ldesign/template'

const handleSubmit = (data) => {
  console.log('登录数据:', data)
}

const handleRegister = () => {
  console.log('跳转注册')
}
</script>
```

### 示例 2：仪表板

```vue
<template>
  <AutoTemplate category="dashboard" />
</template>

<script setup>
import { AutoTemplate } from '@ldesign/template'
</script>
```

### 示例 3：自定义配置

```vue
<template>
  <AutoTemplate 
    category="login"
    initial-device="mobile"
    initial-template="split"
    :show-selector="false"
    :responsive="false"
    @ready="onReady"
    @device-change="onDeviceChange"
    @template-change="onTemplateChange"
  />
</template>

<script setup>
import { AutoTemplate } from '@ldesign/template'

const onReady = () => {
  console.log('模板系统准备完成')
}

const onDeviceChange = (device) => {
  console.log('设备切换:', device)
}

const onTemplateChange = (template) => {
  console.log('模板切换:', template)
}
</script>
```

## 🔧 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `category` | `string` | - | **必填**，模板分类（如 login、dashboard） |
| `initialDevice` | `DeviceType` | 自动检测 | 初始设备类型 |
| `initialTemplate` | `string` | 默认模板 | 初始模板名称 |
| `showSelector` | `boolean` | `true` | 是否显示模板选择器 |
| `responsive` | `boolean` | `true` | 是否启用响应式设备切换 |

## 📡 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `ready` | - | 模板系统初始化完成 |
| `device-change` | `device: DeviceType` | 设备类型改变 |
| `template-change` | `template: string` | 模板切换 |
| `submit` | `data: any` | 表单提交（透传） |
| `register` | - | 注册事件（透传） |
| ... | ... | 所有模板事件都会透传 |

## 🎨 设备断点

- **Mobile**: 窗口宽度 < 768px
- **Tablet**: 768px ≤ 窗口宽度 < 1024px
- **Desktop**: 窗口宽度 ≥ 1024px

## 💡 高级用法

### 禁用响应式

```vue
<AutoTemplate 
  category="login"
  :responsive="false"
/>
```

### 隐藏选择器

```vue
<AutoTemplate 
  category="login"
  :show-selector="false"
/>
```

### 指定初始状态

```vue
<AutoTemplate 
  category="login"
  initial-device="desktop"
  initial-template="split"
/>
```

## 🆚 对比

### 使用 AutoTemplate（推荐）

```vue
<template>
  <AutoTemplate category="login" @submit="handleSubmit" />
</template>

<script setup>
import { AutoTemplate } from '@ldesign/template'

const handleSubmit = (data) => {
  console.log(data)
}
</script>
```

**优点**：
- ✅ 极简
- ✅ 自动化
- ✅ 零配置

### 使用 TemplateRenderer（手动控制）

```vue
<template>
  <TemplateRenderer
    :category="category"
    :device="device"
    :name="template"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TemplateRenderer, getManager } from '@ldesign/template'

const category = ref('login')
const device = ref('desktop')
const template = ref('default')

onMounted(async () => {
  const manager = getManager()
  await manager.initialize()
  // ... 手动处理设备检测、模板加载等
})

const handleSubmit = (data) => {
  console.log(data)
}
</script>
```

**优点**：
- ✅ 完全控制
- ✅ 灵活定制

**使用场景**：需要完全自定义控制逻辑时

## 📝 最佳实践

1. **快速原型**：使用 `AutoTemplate` 快速搭建
2. **生产环境**：如果需要特殊控制，使用 `TemplateRenderer`
3. **简单场景**：优先使用 `AutoTemplate`
4. **复杂场景**：需要精细控制时使用 `TemplateRenderer`

## 🎉 总结

`AutoTemplate` = 零配置 + 自动化 + 极简使用

适合 90% 的使用场景！
