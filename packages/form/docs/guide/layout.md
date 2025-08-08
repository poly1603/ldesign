# 布局系统

@ldesign/form 提供了灵活的布局系统，支持响应式设计、网格布局、自定义间距等多种布局方式。

## 基础布局

### 网格布局

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" />
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({})

const formOptions = {
  layout: {
    columns: 2, // 列数
    gap: 16, // 间距
    rowGap: 20, // 行间距
    columnGap: 16, // 列间距
  },
  fields: [
    {
      name: 'firstName',
      label: '名',
      component: 'FormInput',
    },
    {
      name: 'lastName',
      label: '姓',
      component: 'FormInput',
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      span: 'full', // 跨越所有列
    },
    {
      name: 'phone',
      label: '电话',
      component: 'FormInput',
    },
    {
      name: 'address',
      label: '地址',
      component: 'FormTextarea',
      span: 2, // 跨越2列
    },
  ],
}
</script>
```

### 布局配置选项

| 属性            | 类型               | 默认值   | 说明                                |
| --------------- | ------------------ | -------- | ----------------------------------- |
| `columns`       | `Number \| Object` | `1`      | 列数或响应式列数配置                |
| `gap`           | `Number \| String` | `16`     | 统一间距                            |
| `rowGap`        | `Number \| String` | -        | 行间距                              |
| `columnGap`     | `Number \| String` | -        | 列间距                              |
| `labelPosition` | `String`           | `'top'`  | 标签位置：`top`, `left`, `right`    |
| `labelWidth`    | `Number \| String` | `'auto'` | 标签宽度                            |
| `labelAlign`    | `String`           | `'left'` | 标签对齐：`left`, `center`, `right` |

## 响应式布局

### 断点配置

```javascript
const formOptions = {
  layout: {
    columns: {
      xs: 1, // 超小屏幕
      sm: 1, // 小屏幕
      md: 2, // 中等屏幕
      lg: 3, // 大屏幕
      xl: 4, // 超大屏幕
    },
    gap: {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
    },
  },
  fields: [
    // 字段配置...
  ],
}
```

### 断点定义

| 断点 | 屏幕宽度   | 说明               |
| ---- | ---------- | ------------------ |
| `xs` | `< 576px`  | 超小屏幕（手机）   |
| `sm` | `≥ 576px`  | 小屏幕（大手机）   |
| `md` | `≥ 768px`  | 中等屏幕（平板）   |
| `lg` | `≥ 992px`  | 大屏幕（桌面）     |
| `xl` | `≥ 1200px` | 超大屏幕（大桌面） |

## 字段跨列

### 基础跨列

```javascript
const formOptions = {
  layout: {
    columns: 3,
  },
  fields: [
    {
      name: 'title',
      label: '标题',
      component: 'FormInput',
      span: 'full', // 跨越所有列
    },
    {
      name: 'firstName',
      label: '名',
      component: 'FormInput',
      // span: 1 (默认)
    },
    {
      name: 'lastName',
      label: '姓',
      component: 'FormInput',
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
    },
    {
      name: 'description',
      label: '描述',
      component: 'FormTextarea',
      span: 2, // 跨越2列
    },
  ],
}
```

### 响应式跨列

```javascript
const formOptions = {
  fields: [
    {
      name: 'title',
      label: '标题',
      component: 'FormInput',
      span: {
        xs: 'full',
        sm: 'full',
        md: 2,
        lg: 3,
      },
    },
  ],
}
```

## 标签布局

### 标签位置

```javascript
// 顶部标签（默认）
const topLabelLayout = {
  layout: {
    labelPosition: 'top',
    columns: 2,
  },
}

// 左侧标签
const leftLabelLayout = {
  layout: {
    labelPosition: 'left',
    labelWidth: 100,
    labelAlign: 'right',
    columns: 1,
  },
}

// 右侧标签
const rightLabelLayout = {
  layout: {
    labelPosition: 'right',
    labelWidth: 100,
    labelAlign: 'left',
    columns: 1,
  },
}
```

### 标签样式

```javascript
const formOptions = {
  layout: {
    labelPosition: 'left',
    labelWidth: 120,
    labelAlign: 'right',
    labelStyle: {
      fontWeight: 'bold',
      color: '#333',
    },
  },
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      labelStyle: {
        color: '#1890ff', // 单独设置标签样式
      },
    },
  ],
}
```

## 自定义布局

### 使用 CSS Grid

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" class="custom-grid-form" />
</template>

<script setup>
const formOptions = {
  layout: {
    type: 'custom',
    className: 'custom-grid',
  },
  fields: [
    {
      name: 'title',
      label: '标题',
      component: 'FormInput',
      gridArea: 'title',
    },
    {
      name: 'firstName',
      label: '名',
      component: 'FormInput',
      gridArea: 'firstName',
    },
    {
      name: 'lastName',
      label: '姓',
      component: 'FormInput',
      gridArea: 'lastName',
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      gridArea: 'email',
    },
    {
      name: 'phone',
      label: '电话',
      component: 'FormInput',
      gridArea: 'phone',
    },
    {
      name: 'address',
      label: '地址',
      component: 'FormTextarea',
      gridArea: 'address',
    },
  ],
}
</script>

<style scoped>
.custom-grid-form .custom-grid {
  display: grid;
  grid-template-areas:
    'title title'
    'firstName lastName'
    'email phone'
    'address address';
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.custom-grid-form .custom-grid > div[data-grid-area='title'] {
  grid-area: title;
}

.custom-grid-form .custom-grid > div[data-grid-area='firstName'] {
  grid-area: firstName;
}

.custom-grid-form .custom-grid > div[data-grid-area='lastName'] {
  grid-area: lastName;
}

.custom-grid-form .custom-grid > div[data-grid-area='email'] {
  grid-area: email;
}

.custom-grid-form .custom-grid > div[data-grid-area='phone'] {
  grid-area: phone;
}

.custom-grid-form .custom-grid > div[data-grid-area='address'] {
  grid-area: address;
}
</style>
```

### 使用 Flexbox

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" class="flex-form" />
</template>

<script setup>
const formOptions = {
  layout: {
    type: 'flex',
    direction: 'row',
    wrap: true,
    justify: 'space-between',
    align: 'flex-start',
  },
  fields: [
    {
      name: 'name',
      label: '姓名',
      component: 'FormInput',
      flex: '1 1 300px', // flex 属性
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      flex: '1 1 300px',
    },
    {
      name: 'phone',
      label: '电话',
      component: 'FormInput',
      flex: '1 1 200px',
    },
  ],
}
</script>

<style scoped>
.flex-form .form-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.flex-form .form-field {
  flex: var(--field-flex, 1);
}
</style>
```

## 分组布局

### 字段分组

```javascript
const formOptions = {
  layout: {
    columns: 2,
    gap: 16,
  },
  groups: [
    {
      title: '基本信息',
      fields: ['firstName', 'lastName', 'email'],
      layout: {
        columns: 2,
        border: true,
        padding: 16,
      },
    },
    {
      title: '联系方式',
      fields: ['phone', 'address'],
      layout: {
        columns: 1,
        border: true,
        padding: 16,
      },
    },
  ],
  fields: [
    {
      name: 'firstName',
      label: '名',
      component: 'FormInput',
    },
    {
      name: 'lastName',
      label: '姓',
      component: 'FormInput',
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      span: 'full',
    },
    {
      name: 'phone',
      label: '电话',
      component: 'FormInput',
    },
    {
      name: 'address',
      label: '地址',
      component: 'FormTextarea',
    },
  ],
}
```

### 可折叠分组

```javascript
const formOptions = {
  groups: [
    {
      title: '基本信息',
      fields: ['name', 'email'],
      collapsible: true,
      collapsed: false,
    },
    {
      title: '高级设置',
      fields: ['settings', 'preferences'],
      collapsible: true,
      collapsed: true, // 默认折叠
    },
  ],
}
```

## 内联布局

### 内联表单

```javascript
const formOptions = {
  layout: {
    type: 'inline',
    gap: 16,
  },
  fields: [
    {
      name: 'keyword',
      label: '关键词',
      component: 'FormInput',
      placeholder: '请输入关键词',
    },
    {
      name: 'category',
      label: '分类',
      component: 'FormSelect',
      props: {
        options: [
          { label: '全部', value: '' },
          { label: '文章', value: 'article' },
          { label: '视频', value: 'video' },
        ],
      },
    },
    {
      name: 'submit',
      component: 'FormButton',
      props: {
        text: '搜索',
        type: 'primary',
      },
    },
  ],
}
```

## 布局工具类

### CSS 类名

@ldesign/form 提供了一些实用的 CSS 类名：

```css
/* 间距类 */
.form-gap-xs {
  gap: 8px;
}
.form-gap-sm {
  gap: 12px;
}
.form-gap-md {
  gap: 16px;
}
.form-gap-lg {
  gap: 20px;
}
.form-gap-xl {
  gap: 24px;
}

/* 列数类 */
.form-cols-1 {
  grid-template-columns: repeat(1, 1fr);
}
.form-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.form-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.form-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* 跨列类 */
.form-span-1 {
  grid-column: span 1;
}
.form-span-2 {
  grid-column: span 2;
}
.form-span-3 {
  grid-column: span 3;
}
.form-span-full {
  grid-column: 1 / -1;
}
```

### 使用工具类

```javascript
const formOptions = {
  layout: {
    className: 'form-cols-3 form-gap-lg',
  },
  fields: [
    {
      name: 'title',
      label: '标题',
      component: 'FormInput',
      className: 'form-span-full',
    },
  ],
}
```

## 最佳实践

1. **响应式优先**: 始终考虑不同屏幕尺寸的布局效果
2. **合理分组**: 将相关字段分组，提高表单的可读性
3. **标签一致性**: 保持标签位置和样式的一致性
4. **间距统一**: 使用统一的间距规范
5. **性能考虑**: 避免过于复杂的布局计算

## 下一步

- [自定义组件](/guide/custom-components) - 创建自定义布局组件
- [国际化](/guide/i18n) - 支持多语言布局
- [性能优化](/guide/performance) - 优化布局性能
