# TemplateSelector 组件

强大的可视化模板选择器组件，支持搜索、过滤和预览功能。

## 特性

- 🎨 **可视化界面** - 卡片式展示，直观易用
- 🔍 **实时搜索** - 支持按名称、描述、标签等搜索
- 🎯 **智能过滤** - 按类别、设备筛选模板
- 📱 **响应式设计** - 自适应各种屏幕尺寸
- ⚡ **高性能** - 延迟加载，优化体验

## 基础用法

```vue
<template>
  <div>
    <button @click="showSelector = true">打开模板选择器</button>
    
    <TemplateSelector
      v-if="showSelector"
      category="login"
      device="desktop"
      :current-template="selectedTemplate"
      :visible="showSelector"
      :show-preview="true"
      :searchable="true"
      @select="handleSelect"
      @close="showSelector = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TemplateSelector } from '@ldesign/template'

const showSelector = ref(false)
const selectedTemplate = ref('default')

const handleSelect = (templateName, template) => {
  console.log('选择的模板:', templateName, template)
  selectedTemplate.value = templateName
  showSelector.value = false
}
</script>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `false` | 是否显示选择器 |
| `currentTemplate` | `string` | `''` | 当前选中的模板名称 |
| `category` | `string` | `''` | 限制类别（可选） |
| `device` | `DeviceType` | `undefined` | 限制设备（可选） |
| `showPreview` | `boolean` | `true` | 是否显示预览 |
| `searchable` | `boolean` | `true` | 是否可搜索 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `select` | `(templateName: string, template: TemplateMetadata)` | 选择模板时触发 |
| `close` | `()` | 关闭选择器时触发 |

## 高级用法

### 限制类别和设备

```vue
<TemplateSelector
  category="dashboard"
  device="mobile"
  :visible="visible"
  @select="handleSelect"
  @close="visible = false"
/>
```

### 禁用搜索

```vue
<TemplateSelector
  :searchable="false"
  :visible="visible"
  @select="handleSelect"
  @close="visible = false"
/>
```

### 配合其他hooks使用

```vue
<template>
  <div>
    <button @click="showSelector = true">选择模板</button>
    
    <TemplateSelector
      v-if="showSelector"
      :visible="showSelector"
      :current-template="currentTemplate?.name"
      @select="switchToTemplate"
      @close="showSelector = false"
    />
    
    <component :is="currentComponent" v-if="currentComponent" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TemplateSelector, useTemplate } from '@ldesign/template'

const showSelector = ref(false)

const {
  currentComponent,
  currentTemplate,
  switchTemplate,
} = useTemplate({
  category: 'login',
  device: 'desktop',
})

const switchToTemplate = async (templateName) => {
  await switchTemplate(templateName)
  showSelector.value = false
}
</script>
```

## 实际可用模板

根据当前项目配置，以下是实际注册的模板：

### Login 模板

- **Desktop**: `default`, `split`
- **Mobile**: `default`, `card`
- **Tablet**: `simple`, `landscape`

### Dashboard 模板

- **Desktop**: `default`, `sidebar`
- **Mobile**: `simple`, `tabs`
- **Tablet**: `simple`, `grid`

## 样式定制

组件使用scoped样式，可以通过全局CSS覆盖：

```css
.ldesign-template-selector {
  /* 自定义背景 */
}

.selector-modal {
  /* 自定义模态框样式 */
}

.template-card {
  /* 自定义卡片样式 */
}
```

## 注意事项

1. 选择器会在首次打开时加载模板列表
2. 搜索是实时的，支持多字段匹配
3. 默认模板会有特殊标记（黄色边框）
4. 已选中的模板会高亮显示（绿色）
