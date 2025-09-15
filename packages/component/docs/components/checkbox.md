# Checkbox 复选框

用于在多个选项中进行多项选择，支持单独使用和组合使用。

## 基础用法

最简单的复选框用法。

<l-checkbox v-model="checked1" label="选项1" />

```vue
<template>
  <l-checkbox v-model="checked" label="选项1" />
</template>

<script setup>
import { ref } from 'vue'

const checked = ref(false)
</script>
```

## 禁用状态

通过 `disabled` 属性禁用复选框。

<l-checkbox v-model="checked2" label="禁用选项" disabled />
<l-checkbox v-model="checked3" label="禁用已选中" disabled />

```vue
<template>
  <l-checkbox v-model="checked1" label="禁用选项" disabled />
  <l-checkbox v-model="checked2" label="禁用已选中" disabled />
</template>

<script setup>
import { ref } from 'vue'

const checked1 = ref(false)
const checked2 = ref(true)
</script>
```

## 不确定状态

通过 `indeterminate` 属性设置不确定状态，常用于全选功能。

<l-checkbox v-model="indeterminateChecked" :indeterminate="isIndeterminate" label="全选" />

```vue
<template>
  <l-checkbox 
    v-model="checkAll" 
    :indeterminate="isIndeterminate" 
    label="全选" 
    @change="handleCheckAllChange"
  />
</template>

<script setup>
import { ref, computed } from 'vue'

const checkAll = ref(false)
const checkedList = ref(['选项1'])
const options = ['选项1', '选项2', '选项3']

const isIndeterminate = computed(() => {
  const checkedCount = checkedList.value.length
  return checkedCount > 0 && checkedCount < options.length
})

const handleCheckAllChange = (checked) => {
  checkedList.value = checked ? [...options] : []
}
</script>
```

## 不同尺寸

通过 `size` 属性设置复选框尺寸，支持 `small`、`medium`、`large` 三种尺寸。

<div style="display: flex; gap: 16px; align-items: center;">
  <l-checkbox v-model="sizeChecked1" size="small" label="小尺寸" />
  <l-checkbox v-model="sizeChecked2" size="medium" label="中尺寸" />
  <l-checkbox v-model="sizeChecked3" size="large" label="大尺寸" />
</div>

```vue
<template>
  <l-checkbox v-model="checked1" size="small" label="小尺寸" />
  <l-checkbox v-model="checked2" size="medium" label="中尺寸" />
  <l-checkbox v-model="checked3" size="large" label="大尺寸" />
</template>

<script setup>
import { ref } from 'vue'

const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(false)
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `boolean` | `false` |
| value | 复选框的值，用于复选框组 | `string \| number \| boolean` | - |
| label | 复选框标签文本 | `string` | - |
| size | 组件尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| disabled | 是否禁用 | `boolean` | `false` |
| indeterminate | 是否为不确定状态 | `boolean` | `false` |
| name | 原生 name 属性 | `string` | - |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:modelValue | 绑定值变化时触发 | `(value: boolean)` |
| change | 值变化时触发 | `(value: boolean, event: Event)` |

### Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| focus | 使复选框获得焦点 | - |
| blur | 使复选框失去焦点 | - |

<script setup>
import { ref, computed } from 'vue'

const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(true)
const sizeChecked1 = ref(false)
const sizeChecked2 = ref(false)
const sizeChecked3 = ref(false)
const indeterminateChecked = ref(false)
const isIndeterminate = ref(true)
</script>
