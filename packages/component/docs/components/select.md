# Select 选择器

当选项过多时，使用下拉菜单展示并选择内容。

## 基础用法

适用广泛的基础单选。

```vue
<template>
  <l-select
    v-model="value"
    :options="options"
    placeholder="请选择"
  />
</template>

<script setup>
import { ref } from 'vue'

const value = ref('')
const options = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' }
]
</script>
```

## 有禁用选项

```vue
<template>
  <l-select
    v-model="value"
    :options="options"
    placeholder="请选择"
  />
</template>

<script setup>
import { ref } from 'vue'

const value = ref('')
const options = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2', disabled: true },
  { label: '选项三', value: 'option3' }
]
</script>
```

## 禁用状态

选择器不可用状态。

```vue
<template>
  <l-select
    v-model="value"
    :options="options"
    placeholder="请选择"
    disabled
  />
</template>

<script setup>
import { ref } from 'vue'

const value = ref('')
const options = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' }
]
</script>
```

## 可清空

包含清空按钮，可将选择器清空为初始状态。

```vue
<template>
  <l-select
    v-model="value"
    :options="options"
    placeholder="请选择"
    clearable
  />
</template>

<script setup>
import { ref } from 'vue'

const value = ref('')
const options = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' }
]
</script>
```

## 可搜索

可以利用搜索功能快速查找选项。

```vue
<template>
  <l-select
    v-model="value"
    :options="options"
    placeholder="请选择"
    filterable
  />
</template>

<script setup>
import { ref } from 'vue'

const value = ref('')
const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' }
]
</script>
```

## 多选

适用性较广的基础多选，用 Tag 展示已选项。

```vue
<template>
  <l-select
    v-model="value"
    :options="options"
    placeholder="请选择"
    multiple
  />
</template>

<script setup>
import { ref } from 'vue'

const value = ref([])
const options = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
  { label: '选项四', value: 'option4' },
  { label: '选项五', value: 'option5' }
]
</script>
```

## 限制多选数量

```vue
<template>
  <l-select
    v-model="value"
    :options="options"
    placeholder="请选择"
    multiple
    :multiple-limit="2"
  />
</template>

<script setup>
import { ref } from 'vue'

const value = ref([])
const options = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
  { label: '选项四', value: 'option4' },
  { label: '选项五', value: 'option5' }
]
</script>
```

## 不同尺寸

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <l-select
      v-model="value1"
      :options="options"
      placeholder="小尺寸"
      size="small"
    />
    
    <l-select
      v-model="value2"
      :options="options"
      placeholder="中等尺寸"
      size="medium"
    />
    
    <l-select
      v-model="value3"
      :options="options"
      placeholder="大尺寸"
      size="large"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')
const options = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' }
]
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 选中的值 | `string \| number \| (string \| number)[]` | `undefined` |
| options | 选项数据 | `SelectOption[]` | `[]` |
| placeholder | 占位符 | `string` | `'请选择'` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `false` |
| filterable | 是否可搜索 | `boolean` | `false` |
| multiple | 是否多选 | `boolean` | `false` |
| multipleLimit | 多选时最多选择的项目数 | `number` | `0` |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| loading | 是否加载中 | `boolean` | `false` |
| loadingText | 加载文本 | `string` | `'加载中...'` |
| noDataText | 无数据文本 | `string` | `'无数据'` |
| noMatchText | 无匹配数据文本 | `string` | `'无匹配数据'` |
| popperClass | 下拉面板的类名 | `string` | `undefined` |
| teleported | 是否将弹出框插入至 body 元素 | `boolean` | `true` |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:modelValue | 选中值发生变化时触发 | `value: string \| number \| (string \| number)[]` |
| change | 选中值发生变化时触发 | `value: string \| number \| (string \| number)[]` |
| visible-change | 下拉框出现/隐藏时触发 | `visible: boolean` |
| clear | 可清空的单选模式下用户点击清空按钮时触发 | — |
| remove-tag | 多选模式下移除tag时触发 | `value: string \| number` |
| blur | 当输入框失去焦点时触发 | `event: FocusEvent` |
| focus | 当输入框获得焦点时触发 | `event: FocusEvent` |

### SelectOption

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label | 选项的标签 | `string` | — |
| value | 选项的值 | `string \| number` | — |
| disabled | 是否禁用该选项 | `boolean` | `false` |

### Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| focus | 使选择器获取焦点 | — |
| blur | 使选择器失去焦点 | — |
| clear | 清空选择 | — |
