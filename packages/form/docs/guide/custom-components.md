# 自定义组件

@ldesign/form 支持集成自定义组件，让你可以扩展表单功能，满足特殊的业务需求。

## 组件接口规范

自定义组件需要遵循以下接口规范：

### Props

```typescript
interface CustomComponentProps {
  modelValue: any // 组件值
  disabled?: boolean // 是否禁用
  readonly?: boolean // 是否只读
  placeholder?: string // 占位符
  size?: 'small' | 'medium' | 'large' // 尺寸
  [key: string]: any // 其他自定义属性
}
```

### Events

```typescript
interface CustomComponentEvents {
  'update:modelValue': (value: any) => void // 值更新事件
  focus: (event: FocusEvent) => void // 获得焦点事件
  blur: (event: FocusEvent) => void // 失去焦点事件
  change: (value: any) => void // 值变化事件
}
```

## 创建自定义组件

### 基础示例：颜色选择器

创建一个简单的颜色选择器组件：

```vue
<!-- ColorPicker.vue -->
<template>
  <div class="color-picker">
    <input
      type="color"
      :value="modelValue || '#000000'"
      @input="handleInput"
      :disabled="disabled"
      :readonly="readonly"
    />
    <input
      type="text"
      :value="modelValue || ''"
      :placeholder="placeholder"
      @input="handleTextInput"
      :disabled="disabled"
      :readonly="readonly"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: String,
  disabled: Boolean,
  readonly: Boolean,
  placeholder: {
    type: String,
    default: '请选择颜色',
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change'])

const handleInput = event => {
  const color = event.target.value
  emit('update:modelValue', color)
  emit('change', color)
}

const handleTextInput = event => {
  const color = event.target.value
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    emit('update:modelValue', color)
    emit('change', color)
  }
}
</script>

<style scoped>
.color-picker {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-picker input[type='color'] {
  width: 40px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker input[type='text'] {
  flex: 1;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
</style>
```

### 使用示例

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'
import ColorPicker from './ColorPicker.vue'

const formData = ref({
  primaryColor: '#1890ff',
  secondaryColor: '#52c41a',
})

const formOptions = {
  components: { ColorPicker }, // 注册自定义组件
  fields: [
    {
      name: 'primaryColor',
      label: '主色调',
      component: 'ColorPicker',
      placeholder: '请选择主色调',
    },
    {
      name: 'secondaryColor',
      label: '辅助色',
      component: 'ColorPicker',
      placeholder: '请选择辅助色',
    },
  ],
}

const handleSubmit = data => {
  console.log('配色方案:', data)
}
</script>
```

### 高级示例：文件上传组件

创建一个简单的文件上传组件：

```vue
<!-- FileUpload.vue -->
<template>
  <div class="file-upload">
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      :disabled="disabled"
      @change="handleFileSelect"
      style="display: none"
    />

    <div class="upload-area" @click="$refs.fileInput.click()">
      <div v-if="!files.length" class="upload-placeholder">
        <p>点击选择文件</p>
        <p class="hint">{{ placeholder }}</p>
      </div>

      <div v-else class="file-list">
        <div v-for="(file, index) in files" :key="index" class="file-item">
          <span>{{ file.name }}</span>
          <button @click.stop="removeFile(index)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  multiple: { type: Boolean, default: true },
  accept: String,
  disabled: Boolean,
  placeholder: { type: String, default: '支持常见文件格式' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const files = ref([...props.modelValue])

watch(
  () => props.modelValue,
  newValue => {
    files.value = [...newValue]
  }
)

watch(
  files,
  newFiles => {
    emit('update:modelValue', newFiles)
    emit('change', newFiles)
  },
  { deep: true }
)

const handleFileSelect = event => {
  const selectedFiles = Array.from(event.target.files)
  const fileObjects = selectedFiles.map(file => ({
    name: file.name,
    size: file.size,
    type: file.type,
    file: file,
  }))

  files.value.push(...fileObjects)
}

const removeFile = index => {
  files.value.splice(index, 1)
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
</style>
```

## 组件注册方式

### 1. 全局注册

```javascript
import { createApp } from 'vue'
import LDesignForm from '@ldesign/form'
import ColorPicker from './components/ColorPicker.vue'

const app = createApp(App)

app.use(LDesignForm, {
  components: {
    ColorPicker,
  },
})
```

### 2. 局部注册

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" />
</template>

<script setup>
import { DynamicForm } from '@ldesign/form'
import ColorPicker from './ColorPicker.vue'

const formOptions = {
  components: { ColorPicker }, // 局部注册
  fields: [
    {
      name: 'color',
      label: '颜色',
      component: 'ColorPicker',
    },
  ],
}
</script>
```

## 开发最佳实践

### 1. 遵循 Vue 3 组合式 API

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: [String, Number, Array, Object],
  disabled: Boolean,
  readonly: Boolean,
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change'])
</script>
```

### 2. 支持表单验证

确保组件能正确触发验证：

```javascript
const triggerValidation = () => {
  emit('change', currentValue.value)
}
```

### 3. 响应式设计

```css
.custom-component {
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .custom-component {
    /* 移动端样式 */
  }
}
```

### 4. 无障碍支持

```vue
<template>
  <div
    class="custom-component"
    :aria-label="label"
    :aria-disabled="disabled"
    :aria-readonly="readonly"
  >
    <input :aria-invalid="error" :aria-describedby="errorMessage ? 'error-message' : undefined" />
  </div>
</template>
```

## 组件注册方式

### 1. 全局注册

```javascript
import { createApp } from 'vue'
import LDesignForm from '@ldesign/form'
import ColorPicker from './components/ColorPicker.vue'
import FileUpload from './components/FileUpload.vue'

const app = createApp(App)

// 注册自定义组件
app.use(LDesignForm, {
  components: {
    ColorPicker,
    FileUpload,
  },
})
```

### 2. 局部注册

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" />
</template>

<script setup>
import { DynamicForm } from '@ldesign/form'
import ColorPicker from './ColorPicker.vue'

const formOptions = {
  components: {
    ColorPicker, // 局部注册
  },
  fields: [
    {
      name: 'color',
      label: '颜色',
      component: 'ColorPicker',
    },
  ],
}
</script>
```

### 3. 动态注册

```javascript
import { registerComponent } from '@ldesign/form'

// 动态注册组件
registerComponent('ColorPicker', ColorPicker)
registerComponent('FileUpload', FileUpload)
```

## 组件开发最佳实践

### 1. 遵循 Vue 3 组合式 API

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: [String, Number, Array, Object],
  disabled: Boolean,
  readonly: Boolean,
  // 其他属性...
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change'])

// 组件逻辑...
</script>
```

### 2. 支持表单验证

```javascript
// 在组件中触发验证
const triggerValidation = () => {
  emit('change', currentValue.value)
}

// 支持错误状态显示
const props = defineProps({
  error: Boolean,
  errorMessage: String,
})
```

### 3. 响应式设计

```css
.custom-component {
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .custom-component {
    /* 移动端样式 */
  }
}
```

### 4. 无障碍支持

```vue
<template>
  <div
    class="custom-component"
    :aria-label="label"
    :aria-disabled="disabled"
    :aria-readonly="readonly"
  >
    <input
      :id="fieldId"
      :aria-describedby="errorMessage ? `${fieldId}-error` : undefined"
      :aria-invalid="error"
    />
    <div v-if="errorMessage" :id="`${fieldId}-error`" role="alert">
      {{ errorMessage }}
    </div>
  </div>
</template>
```

### 5. 性能优化

```vue
<script setup>
import { ref, computed, watchEffect } from 'vue'

// 使用 computed 缓存计算结果
const computedValue = computed(() => {
  // 复杂计算逻辑
})

// 使用 watchEffect 优化副作用
watchEffect(() => {
  // 副作用逻辑
})

// 避免不必要的响应式
const staticConfig = Object.freeze({
  // 静态配置
})
</script>
```
