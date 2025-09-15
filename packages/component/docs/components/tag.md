# Tag 标签

用于标记和选择。

## 基础用法

由 `type` 属性来选择 tag 的类型。

<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <l-tag>标签一</l-tag>
  <l-tag type="primary">标签二</l-tag>
  <l-tag type="success">标签三</l-tag>
  <l-tag type="warning">标签四</l-tag>
  <l-tag type="error">标签五</l-tag>
</div>

```vue
<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <l-tag>标签一</l-tag>
    <l-tag type="primary">标签二</l-tag>
    <l-tag type="success">标签三</l-tag>
    <l-tag type="warning">标签四</l-tag>
    <l-tag type="error">标签五</l-tag>
  </div>
</template>
```

## 可移除标签

设置 `closable` 属性可以定义一个标签是否可移除。

```vue
<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <l-tag
      v-for="tag in tags"
      :key="tag.name"
      :type="tag.type"
      closable
      @close="handleClose(tag)"
    >
      {{ tag.name }}
    </l-tag>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tags = ref([
  { name: '标签一', type: 'default' },
  { name: '标签二', type: 'primary' },
  { name: '标签三', type: 'success' },
  { name: '标签四', type: 'warning' },
  { name: '标签五', type: 'error' }
])

const handleClose = (tag) => {
  const index = tags.value.indexOf(tag)
  if (index > -1) {
    tags.value.splice(index, 1)
  }
}
</script>
```

## 不同尺寸

Tag 组件提供除了默认值以外的三种尺寸，可以在不同场景下选择合适的按钮尺寸。

```vue
<template>
  <div style="display: flex; gap: 8px; align-items: center;">
    <l-tag size="small">小尺寸</l-tag>
    <l-tag size="medium">中等尺寸</l-tag>
    <l-tag size="large">大尺寸</l-tag>
  </div>
</template>
```

## 不同主题

Tag 组件提供了三个不同的主题：`filled`、`outlined` 和 `light`。

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <span style="margin-right: 8px;">Filled:</span>
      <l-tag variant="filled">默认</l-tag>
      <l-tag variant="filled" type="primary">主要</l-tag>
      <l-tag variant="filled" type="success">成功</l-tag>
      <l-tag variant="filled" type="warning">警告</l-tag>
      <l-tag variant="filled" type="error">错误</l-tag>
    </div>
    
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <span style="margin-right: 8px;">Outlined:</span>
      <l-tag variant="outlined">默认</l-tag>
      <l-tag variant="outlined" type="primary">主要</l-tag>
      <l-tag variant="outlined" type="success">成功</l-tag>
      <l-tag variant="outlined" type="warning">警告</l-tag>
      <l-tag variant="outlined" type="error">错误</l-tag>
    </div>
    
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <span style="margin-right: 8px;">Light:</span>
      <l-tag variant="light">默认</l-tag>
      <l-tag variant="light" type="primary">主要</l-tag>
      <l-tag variant="light" type="success">成功</l-tag>
      <l-tag variant="light" type="warning">警告</l-tag>
      <l-tag variant="light" type="error">错误</l-tag>
    </div>
  </div>
</template>
```

## 可选择

设置 `clickable` 属性可以定义一个标签是否可选择。

```vue
<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <l-tag
      v-for="tag in selectableTags"
      :key="tag.name"
      :type="tag.type"
      :checked="tag.checked"
      clickable
      @click="handleSelect(tag)"
    >
      {{ tag.name }}
    </l-tag>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectableTags = ref([
  { name: '标签一', type: 'default', checked: false },
  { name: '标签二', type: 'primary', checked: true },
  { name: '标签三', type: 'success', checked: false },
  { name: '标签四', type: 'warning', checked: false }
])

const handleSelect = (tag) => {
  tag.checked = !tag.checked
}
</script>
```

## 带图标

```vue
<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <l-tag icon="user">用户</l-tag>
    <l-tag icon="star" type="primary">收藏</l-tag>
    <l-tag icon="heart" type="error">喜欢</l-tag>
    <l-tag icon="settings" type="warning">设置</l-tag>
  </div>
</template>
```

## 自定义颜色

```vue
<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <l-tag color="#f50">自定义颜色</l-tag>
    <l-tag color="#2db7f5" variant="outlined">自定义颜色</l-tag>
    <l-tag color="#87d068" variant="light">自定义颜色</l-tag>
  </div>
</template>
```

## 动态编辑标签

```vue
<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
    <l-tag
      v-for="tag in dynamicTags"
      :key="tag"
      closable
      @close="handleClose(tag)"
    >
      {{ tag }}
    </l-tag>
    
    <l-input
      v-if="inputVisible"
      ref="inputRef"
      v-model="inputValue"
      size="small"
      style="width: 80px;"
      @blur="handleInputConfirm"
      @keyup.enter="handleInputConfirm"
    />
    
    <l-button
      v-else
      size="small"
      @click="showInput"
    >
      + 新标签
    </l-button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const dynamicTags = ref(['标签一', '标签二', '标签三'])
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

const handleClose = (tag) => {
  const index = dynamicTags.value.indexOf(tag)
  if (index > -1) {
    dynamicTags.value.splice(index, 1)
  }
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !dynamicTags.value.includes(inputValue.value)) {
    dynamicTags.value.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 类型 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error'` | `'default'` |
| variant | 变体 | `'filled' \| 'outlined' \| 'light'` | `'filled'` |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| closable | 是否可关闭 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| clickable | 是否可点击 | `boolean` | `false` |
| checked | 是否选中 | `boolean` | `false` |
| icon | 图标 | `string` | `undefined` |
| color | 颜色 | `string` | `undefined` |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| click | 点击标签时触发 | `event: MouseEvent` |
| close | 关闭标签时触发 | `event: MouseEvent` |
| update:checked | 选中状态改变时触发 | `checked: boolean` |

## 主题定制

Tag 组件使用以下 CSS 变量：

```css
.ld-tag {
  --ldesign-brand-color: #722ed1;
  --ldesign-success-color: #52c41a;
  --ldesign-warning-color: #faad14;
  --ldesign-error-color: #ff4d4f;
  --ldesign-text-color-primary: #262626;
  --ldesign-text-color-secondary: #666666;
  --ldesign-bg-color-container: #fafafa;
  --ldesign-border-level-2-color: #d9d9d9;
  --ldesign-border-radius-sm: 2px;
  --ldesign-font-size-xs: 12px;
  --ldesign-font-size-sm: 14px;
  --ldesign-font-size-base: 16px;
  --ldesign-spacing-xs: 4px;
  --ldesign-spacing-sm: 8px;
}
```
