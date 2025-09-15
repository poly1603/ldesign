# Switch 开关

用于切换两种状态，如开启/关闭。

## 基础用法

最简单的开关用法。

<l-switch v-model="switchValue1" />

```vue
<template>
  <l-switch v-model="switchValue" />
</template>

<script setup>
import { ref } from 'vue'

const switchValue = ref(false)
</script>
```

## 禁用状态

通过 `disabled` 属性禁用开关。

<div style="display: flex; gap: 16px; align-items: center;">
  <l-switch v-model="disabledValue1" disabled />
  <l-switch v-model="disabledValue2" disabled />
</div>

```vue
<template>
  <l-switch v-model="switchValue1" disabled />
  <l-switch v-model="switchValue2" disabled />
</template>

<script setup>
import { ref } from 'vue'

const switchValue1 = ref(false)
const switchValue2 = ref(true)
</script>
```

## 加载状态

通过 `loading` 属性设置加载状态。

<div style="display: flex; gap: 16px; align-items: center;">
  <l-switch v-model="loadingValue1" loading />
  <l-switch v-model="loadingValue2" loading />
</div>

```vue
<template>
  <l-switch v-model="switchValue1" loading />
  <l-switch v-model="switchValue2" loading />
</template>

<script setup>
import { ref } from 'vue'

const switchValue1 = ref(false)
const switchValue2 = ref(true)
</script>
```

## 不同尺寸

通过 `size` 属性设置开关尺寸，支持 `small`、`medium`、`large` 三种尺寸。

<div style="display: flex; gap: 16px; align-items: center;">
  <l-switch v-model="sizeValue1" size="small" />
  <l-switch v-model="sizeValue2" size="medium" />
  <l-switch v-model="sizeValue3" size="large" />
</div>

```vue
<template>
  <l-switch v-model="switchValue1" size="small" />
  <l-switch v-model="switchValue2" size="medium" />
  <l-switch v-model="switchValue3" size="large" />
</template>

<script setup>
import { ref } from 'vue'

const switchValue1 = ref(false)
const switchValue2 = ref(false)
const switchValue3 = ref(false)
</script>
```

## 文字描述

通过 `checkedText` 和 `uncheckedText` 属性设置开关的文字描述。

<div style="display: flex; flex-direction: column; gap: 16px;">
  <l-switch v-model="textValue1" checked-text="开" unchecked-text="关" />
  <l-switch v-model="textValue2" checked-text="ON" unchecked-text="OFF" />
</div>

```vue
<template>
  <l-switch v-model="switchValue1" checked-text="开" unchecked-text="关" />
  <l-switch v-model="switchValue2" checked-text="ON" unchecked-text="OFF" />
</template>

<script setup>
import { ref } from 'vue'

const switchValue1 = ref(false)
const switchValue2 = ref(true)
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `boolean` | `false` |
| size | 组件尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| checkedText | 选中时的文本 | `string` | - |
| uncheckedText | 未选中时的文本 | `string` | - |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:modelValue | 绑定值变化时触发 | `(value: boolean)` |
| change | 值变化时触发 | `(value: boolean)` |

<script setup>
import { ref } from 'vue'

const switchValue1 = ref(false)
const disabledValue1 = ref(false)
const disabledValue2 = ref(true)
const loadingValue1 = ref(false)
const loadingValue2 = ref(true)
const sizeValue1 = ref(false)
const sizeValue2 = ref(false)
const sizeValue3 = ref(false)
const textValue1 = ref(false)
const textValue2 = ref(true)
</script>
