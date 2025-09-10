# Input 输入框

通过鼠标或键盘输入字符。

## 基础用法

基础的输入框用法。

<div class="demo-container">
  <div class="demo-button">
    <l-input v-model="value1" placeholder="请输入内容" />
  </div>
</div>

::: details 查看代码
```vue
<template>
  <div class="demo-button">
    <l-input v-model="value1" placeholder="请输入内容" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value1 = ref('')
</script>

<style scoped>
.demo-button {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
```
:::

## 输入框尺寸

输入框有三种尺寸：小、中、大。

<div class="demo-container">
  <div class="demo-section">
    <div class="demo-row">
      <h4>小尺寸</h4>
      <div class="demo-button">
        <l-input v-model="value2" size="small" placeholder="小尺寸输入框" />
      </div>
    </div>
    <div class="demo-row">
      <h4>中尺寸</h4>
      <div class="demo-button">
        <l-input v-model="value3" size="medium" placeholder="中尺寸输入框" />
      </div>
    </div>
    <div class="demo-row">
      <h4>大尺寸</h4>
      <div class="demo-button">
        <l-input v-model="value4" size="large" placeholder="大尺寸输入框" />
      </div>
    </div>
  </div>
</div>

::: details 查看代码
```vue
<template>
  <div class="demo-section">
    <div class="demo-row">
      <h4>小尺寸</h4>
      <div class="demo-button">
        <l-input v-model="value2" size="small" placeholder="小尺寸输入框" />
      </div>
    </div>
    <div class="demo-row">
      <h4>中尺寸</h4>
      <div class="demo-button">
        <l-input v-model="value3" size="medium" placeholder="中尺寸输入框" />
      </div>
    </div>
    <div class="demo-row">
      <h4>大尺寸</h4>
      <div class="demo-button">
        <l-input v-model="value4" size="large" placeholder="大尺寸输入框" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value2 = ref('')
const value3 = ref('')
const value4 = ref('')
</script>
```
:::

## 输入框状态

输入框有不同的状态：默认、成功、警告、错误。

<div class="demo-container">
  <div class="demo-section">
    <div class="demo-row">
      <h4>默认状态</h4>
      <div class="demo-button">
        <l-input v-model="value5" placeholder="默认状态" />
      </div>
    </div>
    <div class="demo-row">
      <h4>成功状态</h4>
      <div class="demo-button">
        <l-input v-model="value6" status="success" placeholder="成功状态" />
      </div>
    </div>
    <div class="demo-row">
      <h4>警告状态</h4>
      <div class="demo-button">
        <l-input v-model="value7" status="warning" placeholder="警告状态" />
      </div>
    </div>
    <div class="demo-row">
      <h4>错误状态</h4>
      <div class="demo-button">
        <l-input v-model="value8" status="error" placeholder="错误状态" />
      </div>
    </div>
  </div>
</div>

::: details 查看代码
```vue
<template>
  <div class="demo-section">
    <div class="demo-row">
      <h4>默认状态</h4>
      <div class="demo-button">
        <l-input v-model="value5" placeholder="默认状态" />
      </div>
    </div>
    <div class="demo-row">
      <h4>成功状态</h4>
      <div class="demo-button">
        <l-input v-model="value6" status="success" placeholder="成功状态" />
      </div>
    </div>
    <div class="demo-row">
      <h4>警告状态</h4>
      <div class="demo-button">
        <l-input v-model="value7" status="warning" placeholder="警告状态" />
      </div>
    </div>
    <div class="demo-row">
      <h4>错误状态</h4>
      <div class="demo-button">
        <l-input v-model="value8" status="error" placeholder="错误状态" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value5 = ref('')
const value6 = ref('')
const value7 = ref('')
const value8 = ref('')
</script>
```
:::

## 禁用和只读

输入框可以设置为禁用或只读状态。

<div class="demo-container">
  <div class="demo-section">
    <div class="demo-row">
      <h4>禁用状态</h4>
      <div class="demo-button">
        <l-input v-model="value9" disabled placeholder="禁用状态" />
      </div>
    </div>
    <div class="demo-row">
      <h4>只读状态</h4>
      <div class="demo-button">
        <l-input v-model="value10" readonly placeholder="只读状态" />
      </div>
    </div>
  </div>
</div>

::: details 查看代码
```vue
<template>
  <div class="demo-section">
    <div class="demo-row">
      <h4>禁用状态</h4>
      <div class="demo-button">
        <l-input v-model="value9" disabled placeholder="禁用状态" />
      </div>
    </div>
    <div class="demo-row">
      <h4>只读状态</h4>
      <div class="demo-button">
        <l-input v-model="value10" readonly placeholder="只读状态" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value9 = ref('禁用的值')
const value10 = ref('只读的值')
</script>
```
:::

## 可清空

可以快速清空输入框内容。

<div class="demo-container">
  <div class="demo-button">
    <l-input v-model="value11" clearable placeholder="可清空的输入框" />
  </div>
</div>

::: details 查看代码
```vue
<template>
  <div class="demo-button">
    <l-input v-model="value11" clearable placeholder="可清空的输入框" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value11 = ref('')
</script>
```
:::

## 密码输入框

用于输入密码，可以切换显示/隐藏密码。

<div class="demo-container">
  <div class="demo-button">
    <l-input v-model="password" type="password" show-password placeholder="请输入密码" />
  </div>
</div>

::: details 查看代码
```vue
<template>
  <div class="demo-button">
    <l-input v-model="password" type="password" show-password placeholder="请输入密码" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const password = ref('')
</script>
```
:::

## 带图标的输入框

可以在输入框前后添加图标。

<div class="demo-container">
  <div class="demo-section">
    <div class="demo-row">
      <h4>前缀图标</h4>
      <div class="demo-button">
        <l-input v-model="value12" prefix-icon="🔍" placeholder="搜索内容" />
      </div>
    </div>
    <div class="demo-row">
      <h4>后缀图标</h4>
      <div class="demo-button">
        <l-input v-model="value13" suffix-icon="⭐" placeholder="收藏内容" />
      </div>
    </div>
    <div class="demo-row">
      <h4>前后缀图标</h4>
      <div class="demo-button">
        <l-input v-model="value14" prefix-icon="👤" suffix-icon="✉️" placeholder="用户邮箱" />
      </div>
    </div>
  </div>
</div>

::: details 查看代码
```vue
<template>
  <div class="demo-section">
    <div class="demo-row">
      <h4>前缀图标</h4>
      <div class="demo-button">
        <l-input v-model="value12" prefix-icon="🔍" placeholder="搜索内容" />
      </div>
    </div>
    <div class="demo-row">
      <h4>后缀图标</h4>
      <div class="demo-button">
        <l-input v-model="value13" suffix-icon="⭐" placeholder="收藏内容" />
      </div>
    </div>
    <div class="demo-row">
      <h4>前后缀图标</h4>
      <div class="demo-button">
        <l-input v-model="value14" prefix-icon="👤" suffix-icon="✉️" placeholder="用户邮箱" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value12 = ref('')
const value13 = ref('')
const value14 = ref('')
</script>
```
:::

## API

### Input Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 输入框值 | `string \| number` | - |
| type | 输入框类型 | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url' \| 'search'` | `'text'` |
| size | 输入框尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| status | 输入框状态 | `'default' \| 'success' \| 'warning' \| 'error'` | `'default'` |
| placeholder | 占位符文本 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `false` |
| showPassword | 是否显示密码切换按钮 | `boolean` | `false` |
| maxlength | 最大长度 | `number` | - |
| showCount | 是否显示字数统计 | `boolean` | `false` |
| prefixIcon | 前缀图标 | `string \| Component` | - |
| suffixIcon | 后缀图标 | `string \| Component` | - |
| prepend | 输入框前置内容 | `string` | - |
| append | 输入框后置内容 | `string` | - |
| autofocus | 自动获取焦点 | `boolean` | `false` |
| autocomplete | 自动完成 | `string` | `'off'` |
| name | 表单名称 | `string` | - |
| id | 表单 ID | `string` | - |

### Input Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:modelValue | 值更新事件 | `(value: string \| number) => void` |
| input | 输入事件 | `(value: string \| number, event: Event) => void` |
| change | 变化事件 | `(value: string \| number, event: Event) => void` |
| focus | 获得焦点事件 | `(event: FocusEvent) => void` |
| blur | 失去焦点事件 | `(event: FocusEvent) => void` |
| clear | 清空事件 | `() => void` |
| keydown | 按键事件 | `(event: KeyboardEvent) => void` |
| enter | 回车事件 | `(event: KeyboardEvent) => void` |

### Input Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| getInputElement | 获取输入框元素 | - |
| focus | 获取焦点 | - |
| blur | 失去焦点 | - |
| select | 选中所有文本 | - |
| clear | 清空输入框 | - |

<script setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')
const value4 = ref('')
const value5 = ref('')
const value6 = ref('')
const value7 = ref('')
const value8 = ref('')
const value9 = ref('禁用的值')
const value10 = ref('只读的值')
const value11 = ref('')
const password = ref('')
const value12 = ref('')
const value13 = ref('')
const value14 = ref('')
</script>
