# @ldesign/form - 重构总结

## 🎯 重构目标

将所有功能从 examples 迁移到核心库 `src/` 中，让用户使用极其简单。

## ✅ 已完成的重构

### 📁 核心库 (src/) - 功能实现

#### 1. 类型定义扩展

- **`types/layout.ts`**:

  - 扩展 `LabelConfig` 支持间距、自动宽度、按列宽度等
  - 添加 `FormTheme` 类型支持主题切换
  - 扩展 `ButtonPosition` 支持 `follow-last-row` 和 `separate-row`

- **`types/field.ts`**:
  - 添加 `SimpleConditionalConfig` 简化条件显示配置
  - 扩展 `FormItemConfig` 支持 `showWhen` 属性

#### 2. 工具函数

- **`utils/conditional.ts`**:
  - `shouldShowField()` - 检查字段是否应该显示
  - `filterVisibleFields()` - 过滤可见字段
  - 支持多种操作符：equals, not-equals, includes, not-includes, greater, less

#### 3. 核心组件重构

- **`components/DynamicForm.vue`** - 完全重写，集成所有功能：

##### 🎨 主题支持

```javascript
layout: {
  theme: 'bordered',  // 'default' | 'bordered'
  className: 'custom-class'
}
```

##### 🏷️ 标签配置

```javascript
layout: {
  label: {
    position: 'left',    // 'top' | 'left' | 'right'
    showColon: true,     // 显示冒号
    gap: 12,             // 标签间距
    autoWidth: true,     // 自动宽度
    widthByColumn: { 0: 100, 1: 120 }  // 按列设置宽度
  }
}
```

##### 🔄 条件显示

```javascript
fields: [
  {
    name: 'province',
    title: '省份',
    component: 'FormInput',
    showWhen: { field: 'country', value: 'china' }, // 简单配置
  },
]
```

##### 📱 响应式布局

```javascript
layout: {
  columns: 2,
  defaultRows: 2,      // 默认显示行数
  button: {
    position: 'follow-last-row',  // 按钮位置
    align: 'right'               // 按钮对齐
  }
}
```

##### 🎮 按钮组功能

- **查询按钮**: 具有提交表单功能
- **重置按钮**: 重置表单数据
- **展开/收起**: 控制隐藏字段显示
- **智能位置**: 跟随最后一行或单独占一行

#### 4. 样式系统

- **默认主题**: 简洁的表单样式
- **边框主题**: 表格式布局，标签有灰色背景
- **响应式设计**: 移动端适配
- **按钮组样式**: 完整的按钮样式系统

### 📁 示例 (examples/) - 使用演示

#### 简化的使用方式

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" />
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({})
const formOptions = {
  fields: [
    { name: 'name', title: '姓名', component: 'FormInput', required: true },
    {
      name: 'province',
      title: '省份',
      component: 'FormInput',
      showWhen: { field: 'country', value: 'china' },
    },
  ],
  layout: {
    theme: 'bordered',
    columns: 2,
    defaultRows: 2,
    button: { position: 'follow-last-row' },
  },
}
</script>
```

## 🎯 用户体验对比

### ❌ 重构前（错误）

用户需要自己实现复杂逻辑：

```javascript
// 用户需要自己写条件显示逻辑
const shouldShowField = (field, formData) => {
  /* 复杂逻辑 */
}
// 用户需要自己写布局计算
const calculateLayout = () => {
  /* 复杂逻辑 */
}
// 用户需要自己写主题样式
const applyTheme = () => {
  /* 复杂逻辑 */
}
```

### ✅ 重构后（正确）

用户只需要简单配置：

```javascript
const formOptions = {
  fields: [{ name: 'field1', showWhen: { field: 'other', value: 'show' } }],
  layout: {
    theme: 'bordered',
    defaultRows: 2,
    button: { position: 'follow-last-row' },
  },
}
```

## 🚀 核心优势

1. **极简使用**: 用户只需要 JSON 配置，无需编写复杂逻辑
2. **功能完整**: 所有功能都在核心库中实现
3. **类型安全**: 完整的 TypeScript 类型定义
4. **高度可配置**: 支持主题、布局、条件显示等
5. **响应式设计**: 自动适配不同屏幕尺寸

## 📚 使用文档

- [快速开始](./examples/simple-usage/README.md)
- [API 文档](./docs/api.md)
- [主题定制](./docs/themes.md)
- [条件渲染](./docs/conditional.md)

## 🎉 总结

现在 `@ldesign/form` 是一个真正的企业级表单库：

- **核心库负责所有功能实现**
- **用户使用极其简单**
- **examples 只是演示用法**

这才是正确的库设计理念！🎯
