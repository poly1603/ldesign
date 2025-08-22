# 模板选择器

模板选择器是 LDesign Template 系统的核心组件之一，提供了智能的模板浏览、筛选和选择功能。它能够根据当前的模板分类和设备类型，动态展示可用的模板列表，并支持实时搜索和预览。

## 🎯 核心特性

### 智能分类和筛选

- **分类筛选**：根据当前模板分类（如 login、dashboard）自动分组
- **设备适配**：根据设备类型（desktop、tablet、mobile）动态筛选
- **实时更新**：当分类或设备类型变化时，自动更新模板列表

### 丰富的交互功能

- **实时搜索**：支持模板名称、描述、标签的模糊搜索
- **预览功能**：鼠标悬停即可预览模板详情
- **多种布局**：支持网格和列表两种展示模式
- **响应式设计**：适配不同屏幕尺寸

## 📦 基础使用

### 组件方式

```vue
<template>
  <div>
    <!-- 基础使用 -->
    <TemplateSelector
      category="login"
      device="desktop"
      :templates="availableTemplates"
      @template-change="handleTemplateChange"
    />

    <!-- 完整配置 -->
    <TemplateSelector
      category="login"
      device="desktop"
      :current-template="selectedTemplate"
      :templates="availableTemplates"
      :show-preview="true"
      :show-search="true"
      layout="grid"
      :columns="3"
      :show-info="true"
      @template-change="handleTemplateChange"
      @template-preview="handleTemplatePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { TemplateSelector, useTemplate } from '@ldesign/template/vue'

const { availableTemplates } = useTemplate({
  category: 'login',
  autoScan: true,
})

const selectedTemplate = ref('')

function handleTemplateChange(template: string) {
  selectedTemplate.value = template
  console.log('选择了模板:', template)
}

function handleTemplatePreview(template: string) {
  console.log('预览模板:', template)
}
</script>
```

### Hook 方式

```typescript
import { useTemplateSelector } from '@ldesign/template/vue'

const {
  availableTemplates,
  filteredTemplates,
  searchQuery,
  selectedTemplate,
  loading,
  error,
  selectTemplate,
  previewTemplate,
  searchTemplates,
  refreshTemplates,
  reset,
} = useTemplateSelector({
  category: 'login',
  device: 'desktop',
  templates: templateList,
  onTemplateChange: template => {
    console.log('模板变化:', template)
  },
})
```

## ⚙️ 配置选项

### TemplateSelector 属性

| 属性              | 类型                 | 默认值      | 说明             |
| ----------------- | -------------------- | ----------- | ---------------- |
| `category`        | `string`             | -           | 模板分类（必填） |
| `device`          | `DeviceType`         | `'desktop'` | 设备类型         |
| `currentTemplate` | `string`             | -           | 当前选中的模板   |
| `templates`       | `TemplateMetadata[]` | `[]`        | 模板列表         |
| `showPreview`     | `boolean`            | `true`      | 是否显示预览     |
| `showSearch`      | `boolean`            | `true`      | 是否显示搜索     |
| `layout`          | `'grid' \| 'list'`   | `'grid'`    | 布局模式         |
| `columns`         | `number`             | `3`         | 网格列数         |
| `showInfo`        | `boolean`            | `true`      | 是否显示模板信息 |

### 事件

| 事件               | 参数               | 说明               |
| ------------------ | ------------------ | ------------------ |
| `template-change`  | `template: string` | 模板选择变化时触发 |
| `template-preview` | `template: string` | 模板预览时触发     |

## 🎨 样式定制

模板选择器提供了丰富的 CSS 变量，可以轻松定制样式：

```css
.template-selector {
  /* 主要颜色 */
  --selector-primary-color: #007bff;
  --selector-hover-color: #0056b3;

  /* 背景颜色 */
  --selector-bg-color: #fff;
  --selector-item-bg-color: #f8f9fa;

  /* 边框颜色 */
  --selector-border-color: #e9ecef;
  --selector-selected-border-color: #007bff;

  /* 文字颜色 */
  --selector-text-color: #333;
  --selector-text-secondary-color: #666;

  /* 间距 */
  --selector-padding: 20px;
  --selector-gap: 16px;

  /* 圆角 */
  --selector-border-radius: 8px;

  /* 阴影 */
  --selector-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --selector-hover-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}
```

## 🔧 高级用法

### 自定义模板卡片

```vue
<template>
  <TemplateSelector
    category="login"
    device="desktop"
    :templates="availableTemplates"
    @template-change="handleTemplateChange"
  >
    <!-- 自定义模板卡片插槽 -->
    <template #template-item="{ template, isSelected, onSelect }">
      <div
        class="custom-template-card"
        :class="{ selected: isSelected }"
        @click="onSelect"
      >
        <img :src="template.config.preview" :alt="template.config.name" />
        <h4>{{ template.config.name }}</h4>
        <p>{{ template.config.description }}</p>
        <div class="template-tags">
          <span v-for="tag in template.config.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </template>
  </TemplateSelector>
</template>
```

### 与 useTemplate 集成

```vue
<template>
  <div class="template-manager">
    <!-- 模板选择器 -->
    <TemplateSelector
      :category="currentCategory"
      :device="currentDevice"
      :current-template="currentTemplate?.template"
      :templates="availableTemplates"
      @template-change="handleTemplateChange"
    />

    <!-- 模板渲染器 -->
    <TemplateRenderer
      v-if="currentTemplate"
      :category="currentTemplate.category"
      :device="currentTemplate.device"
      :template="currentTemplate.template"
    />
  </div>
</template>

<script setup lang="ts">
import {
  TemplateSelector,
  TemplateRenderer,
  useTemplate,
} from '@ldesign/template/vue'

const { currentDevice, currentTemplate, availableTemplates, switchTemplate } =
  useTemplate({
    autoScan: true,
  })

const currentCategory = ref('login')

async function handleTemplateChange(template: string) {
  await switchTemplate(currentCategory.value, currentDevice.value, template)
}
</script>
```

## 📱 响应式适配

模板选择器内置了响应式设计，在不同屏幕尺寸下会自动调整布局：

- **桌面端**：默认网格布局，支持多列显示
- **平板端**：自动调整列数，保持良好的视觉效果
- **移动端**：切换为单列布局，优化触摸体验

```css
/* 自定义响应式断点 */
@media (max-width: 768px) {
  .template-selector {
    --selector-columns: 1;
    --selector-padding: 16px;
    --selector-gap: 12px;
  }
}
```

## 🎯 最佳实践

### 1. 合理设置模板列表

```typescript
// 推荐：使用 useTemplate 提供的 availableTemplates
const { availableTemplates } = useTemplate({
  category: 'login',
  autoScan: true,
})

// 避免：手动维护模板列表
const templates = [
  /* 手动列表 */
]
```

### 2. 处理加载状态

```vue
<template>
  <TemplateSelector
    v-if="!loading"
    :templates="availableTemplates"
    @template-change="handleTemplateChange"
  />
  <div v-else class="loading">加载模板中...</div>
</template>
```

### 3. 错误处理

```typescript
function handleTemplateChange(template: string) {
  try {
    switchTemplate(category, device, template)
  } catch (error) {
    console.error('模板切换失败:', error)
    // 显示错误提示
  }
}
```

### 4. 性能优化

```vue
<!-- 使用 v-memo 优化大列表渲染 -->
<TemplateSelector
  :templates="availableTemplates"
  :key="templateListKey"
  v-memo="[availableTemplates.length, currentDevice]"
/>
```

## 🔍 故障排除

### 常见问题

**Q: 模板选择器显示为空？**
A: 检查是否正确传入了 `templates` 属性，确保模板已经扫描完成。

**Q: 模板切换没有反应？**
A: 确保监听了 `template-change` 事件并正确处理模板切换逻辑。

**Q: 搜索功能不工作？**
A: 检查模板的 `config` 中是否包含 `name`、`description` 和 `tags` 字段。

**Q: 样式显示异常？**
A: 确保正确导入了组件的样式文件，或检查 CSS 变量是否被覆盖。

### 调试技巧

```typescript
// 开启调试模式
const { availableTemplates } = useTemplate({
  debug: true,
  autoScan: true,
})

// 监听模板变化
watch(
  availableTemplates,
  templates => {
    console.log('可用模板:', templates)
  },
  { immediate: true }
)
```
