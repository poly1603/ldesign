# Radio 单选框

用于在多个选项中进行单项选择。

## 基础用法

最简单的单选框用法。

<div style="display: flex; flex-direction: column; gap: 8px;">
  <l-radio v-model="radioValue1" value="option1" label="选项1" />
  <l-radio v-model="radioValue1" value="option2" label="选项2" />
  <l-radio v-model="radioValue1" value="option3" label="选项3" />
</div>

```vue
<template>
  <l-radio v-model="radioValue" value="option1" label="选项1" />
  <l-radio v-model="radioValue" value="option2" label="选项2" />
  <l-radio v-model="radioValue" value="option3" label="选项3" />
</template>

<script setup>
import { ref } from 'vue'

const radioValue = ref('option1')
</script>
```

## 禁用状态

通过 `disabled` 属性禁用单选框。

<div style="display: flex; flex-direction: column; gap: 8px;">
  <l-radio v-model="radioValue2" value="option1" label="正常选项" />
  <l-radio v-model="radioValue2" value="option2" label="禁用选项" disabled />
  <l-radio v-model="radioValue2" value="option3" label="禁用已选中" disabled />
</div>

```vue
<template>
  <l-radio v-model="radioValue" value="option1" label="正常选项" />
  <l-radio v-model="radioValue" value="option2" label="禁用选项" disabled />
  <l-radio v-model="radioValue" value="option3" label="禁用已选中" disabled />
</template>

<script setup>
import { ref } from 'vue'

const radioValue = ref('option3')
</script>
```

## 不同尺寸

通过 `size` 属性设置单选框尺寸，支持 `small`、`medium`、`large` 三种尺寸。

<div style="display: flex; gap: 16px; align-items: center;">
  <l-radio v-model="sizeValue1" value="small" size="small" label="小尺寸" />
  <l-radio v-model="sizeValue2" value="medium" size="medium" label="中尺寸" />
  <l-radio v-model="sizeValue3" value="large" size="large" label="大尺寸" />
</div>

```vue
<template>
  <l-radio v-model="radioValue1" value="small" size="small" label="小尺寸" />
  <l-radio v-model="radioValue2" value="medium" size="medium" label="中尺寸" />
  <l-radio v-model="radioValue3" value="large" size="large" label="大尺寸" />
</template>

<script setup>
import { ref } from 'vue'

const radioValue1 = ref('small')
const radioValue2 = ref('medium')
const radioValue3 = ref('large')
</script>
```

## 按钮样式

使用插槽自定义单选框内容。

<div style="display: flex; flex-direction: column; gap: 8px;">
  <l-radio v-model="customValue" value="custom1">
    <span style="color: #0052d9;">自定义内容1</span>
  </l-radio>
  <l-radio v-model="customValue" value="custom2">
    <span style="color: #00a870;">自定义内容2</span>
  </l-radio>
</div>

```vue
<template>
  <l-radio v-model="radioValue" value="custom1">
    <span style="color: #0052d9;">自定义内容1</span>
  </l-radio>
  <l-radio v-model="radioValue" value="custom2">
    <span style="color: #00a870;">自定义内容2</span>
  </l-radio>
</template>

<script setup>
import { ref } from 'vue'

const radioValue = ref('custom1')
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `string \| number \| boolean` | - |
| value | 单选框的值 | `string \| number \| boolean` | - |
| label | 单选框标签文本 | `string` | - |
| size | 组件尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| disabled | 是否禁用 | `boolean` | `false` |
| name | 原生 name 属性 | `string` | - |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:modelValue | 绑定值变化时触发 | `(value: string \| number \| boolean)` |
| change | 值变化时触发 | `(value: string \| number \| boolean, event: Event)` |

### Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| focus | 使单选框获得焦点 | - |
| blur | 使单选框失去焦点 | - |

<script setup>
import { ref } from 'vue'

const radioValue1 = ref('option1')
const radioValue2 = ref('option3')
const sizeValue1 = ref('small')
const sizeValue2 = ref('medium')
const sizeValue3 = ref('large')
const customValue = ref('custom1')
</script>
