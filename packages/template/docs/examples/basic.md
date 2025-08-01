# 基础用法示例

本示例展示了 LDesign Template 的基础使用方法，包括模板创建、配置和渲染。

## 创建第一个模板

### 1. 创建模板目录结构

```
src/templates/
└── greeting/
    └── desktop/
        └── hello/
            ├── index.vue
            └── config.ts
```

### 2. 创建模板组件

创建 `src/templates/greeting/desktop/hello/index.vue`：

```vue
<script setup lang="ts">
import { computed } from 'vue'

// 定义属性接口
interface Props {
  title?: string
  message?: string
  buttonText?: string
  showButton?: boolean
  onClick?: () => void
}

// 定义属性和默认值
const props = withDefaults(defineProps<Props>(), {
  title: 'Hello World',
  message: '欢迎使用 LDesign Template！',
  buttonText: '点击我',
  showButton: true
})

// 定义事件
const emit = defineEmits<{
  click: []
  greet: [message: string]
}>()

// 计算属性
const greeting = computed(() => `${props.title}: ${props.message}`)

// 事件处理
function handleClick() {
  emit('click')
  emit('greet', greeting.value)
  props.onClick?.()
}
</script>

<template>
  <div class="hello-template">
    <div class="greeting-card">
      <h1 class="greeting-title">
        {{ title }}
      </h1>
      <p class="greeting-message">
        {{ message }}
      </p>
      <div class="greeting-actions">
        <button
          v-if="showButton"
          class="greeting-button"
          @click="handleClick"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hello-template {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.greeting-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.greeting-title {
  color: #333;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.greeting-message {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.greeting-actions {
  margin-top: 1.5rem;
}

.greeting-button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.greeting-button:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.greeting-button:active {
  transform: translateY(0);
}
</style>
```

### 3. 创建模板配置

创建 `src/templates/greeting/desktop/hello/config.ts`：

```typescript
import type { TemplateConfig } from '@ldesign/template'

export const config: TemplateConfig = {
  // 基础信息
  name: 'hello',
  title: 'Hello World 模板',
  description: '一个简单的问候模板，展示基础的模板功能',
  version: '1.0.0',
  author: 'LDesign Team',

  // 分类信息
  category: 'greeting',
  device: 'desktop',
  tags: ['问候', '示例', '基础'],

  // 预览图片（可选）
  preview: '/previews/greeting/hello-desktop.png',

  // 属性定义
  props: {
    title: {
      type: 'string',
      default: 'Hello World',
      description: '问候标题',
      required: false
    },
    message: {
      type: 'string',
      default: '欢迎使用 LDesign Template！',
      description: '问候消息',
      required: false
    },
    buttonText: {
      type: 'string',
      default: '点击我',
      description: '按钮文本',
      required: false
    },
    showButton: {
      type: 'boolean',
      default: true,
      description: '是否显示按钮',
      required: false
    },
    onClick: {
      type: 'function',
      description: '按钮点击回调函数',
      required: false
    }
  },

  // 事件定义
  events: {
    click: {
      description: '按钮点击时触发'
    },
    greet: {
      description: '发送问候时触发',
      payload: 'string'
    }
  },

  // 兼容性
  compatibility: {
    vue: '>=3.2.0',
    browsers: ['Chrome >= 88', 'Firefox >= 85', 'Safari >= 14']
  }
}
```

## 使用模板

### 1. 安装和配置插件

在你的 Vue 应用中安装插件：

```typescript
import TemplatePlugin from '@ldesign/template'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 注册插件
app.use(TemplatePlugin, {
  autoScan: true,
  autoDetectDevice: true
})

app.mount('#app')
```

### 2. 使用组件方式

```vue
<script setup lang="ts">
function handleGreeting() {
  console.log('按钮被点击了！')
}

function onTemplateClick() {
  console.log('模板触发了点击事件')
}

function onTemplateGreet(message: string) {
  console.log('收到问候:', message)
  alert(`问候消息: ${message}`)
}
</script>

<template>
  <div class="app">
    <h1>LDesign Template 基础示例</h1>

    <!-- 使用模板渲染器组件 -->
    <LTemplateRenderer
      category="greeting"
      device="desktop"
      template="hello"
      :template-props="{
        title: '你好',
        message: '这是一个基础示例！',
        buttonText: '打招呼',
        onClick: handleGreeting,
      }"
      @click="onTemplateClick"
      @greet="onTemplateGreet"
    />
  </div>
</template>

<style>
.app {
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}
</style>
```

### 3. 使用 Composable 方式

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template'
import { ref } from 'vue'

// 使用模板管理 composable
const {
  currentTemplate,
  loading,
  error,
  render,
  clearCache
} = useTemplate()

// 响应式数据
const templateTitle = ref('Hello')
const templateMessage = ref('这是通过 Composable 加载的模板！')

// 加载模板
async function loadTemplate() {
  await render({
    category: 'greeting',
    device: 'desktop',
    template: 'hello'
  })
}

// 切换消息
function switchMessage() {
  const messages = [
    '这是通过 Composable 加载的模板！',
    '消息已切换！',
    '又一条新消息！',
    'LDesign Template 很棒！'
  ]

  const currentIndex = messages.indexOf(templateMessage.value)
  const nextIndex = (currentIndex + 1) % messages.length
  templateMessage.value = messages[nextIndex]
}

// 清空模板
function clearTemplate() {
  currentTemplate.value = null
}

// 重试加载
function retry() {
  loadTemplate()
}

// 处理模板事件
function handleTemplateClick() {
  console.log('模板按钮被点击')
}

function onGreet(message: string) {
  console.log('收到问候:', message)
}
</script>

<template>
  <div class="app">
    <h1>使用 Composable</h1>

    <div class="controls">
      <button @click="loadTemplate">
        加载模板
      </button>
      <button @click="switchMessage">
        切换消息
      </button>
      <button @click="clearTemplate">
        清空模板
      </button>
    </div>

    <div class="template-container">
      <div v-if="loading" class="loading">
        正在加载模板...
      </div>

      <div v-else-if="error" class="error">
        加载失败: {{ error.message }}
        <button @click="retry">
          重试
        </button>
      </div>

      <component
        :is="currentTemplate"
        v-else-if="currentTemplate"
        :title="templateTitle"
        :message="templateMessage"
        :on-click="handleTemplateClick"
        @greet="onGreet"
      />

      <div v-else class="empty">
        点击"加载模板"开始
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.controls button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.controls button:hover {
  background: #f0f0f0;
}

.template-container {
  min-height: 400px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading,
.error,
.empty {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
}

.error {
  color: #e74c3c;
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

### 4. 使用指令方式

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const selectedTemplate = ref('')

const templateConfig = computed(() => {
  if (!selectedTemplate.value)
    return null

  return {
    category: 'greeting',
    device: 'desktop',
    template: selectedTemplate.value,
    props: {
      title: '指令模板',
      message: '这是通过指令加载的模板！',
      onClick: () => {
        console.log('指令模板按钮被点击')
      }
    }
  }
})

function updateTemplate() {
  console.log('模板已切换:', selectedTemplate.value)
}
</script>

<template>
  <div class="app">
    <h1>使用指令</h1>

    <div class="controls">
      <label>
        选择模板:
        <select v-model="selectedTemplate" @change="updateTemplate">
          <option value="">请选择</option>
          <option value="hello">Hello 模板</option>
        </select>
      </label>
    </div>

    <!-- 使用 v-template 指令 -->
    <div
      v-if="templateConfig"
      v-template="templateConfig"
      class="template-container"
    />

    <div v-else class="empty">
      请选择一个模板
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.controls {
  margin-bottom: 2rem;
  text-align: center;
}

.controls select {
  margin-left: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.template-container {
  min-height: 400px;
}

.empty {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 2rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
}
</style>
```

## 错误处理

### 处理模板加载错误

```vue
<script setup lang="ts">
import { ref } from 'vue'

const templateProps = ref({
  title: '错误处理示例',
  message: '这个示例展示了如何处理模板加载错误'
})

function handleError(error: Error) {
  console.error('模板加载错误:', error)
  // 可以在这里上报错误到监控系统
}

function handleLoad(component: any) {
  console.log('模板加载成功:', component)
}
</script>

<template>
  <div class="app">
    <LTemplateRenderer
      category="greeting"
      device="desktop"
      template="hello"
      :template-props="templateProps"
      @error="handleError"
      @load="handleLoad"
    >
      <!-- 自定义加载状态 -->
      <template #loading>
        <div class="custom-loading">
          <div class="spinner" />
          <p>正在加载问候模板...</p>
        </div>
      </template>

      <!-- 自定义错误状态 -->
      <template #error="{ error, retry }">
        <div class="custom-error">
          <h3>😞 加载失败</h3>
          <p>{{ error.message }}</p>
          <button @click="retry">
            重新加载
          </button>
        </div>
      </template>

      <!-- 自定义空状态 -->
      <template #empty>
        <div class="custom-empty">
          <h3>🤔 没有找到模板</h3>
          <p>请检查模板配置是否正确</p>
        </div>
      </template>
    </LTemplateRenderer>
  </div>
</template>

<style scoped>
.custom-loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.custom-error {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.custom-error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.custom-empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
```

## 总结

这个基础示例展示了：

1. **模板创建**: 如何创建模板组件和配置文件
2. **组件使用**: 使用 `LTemplateRenderer` 组件渲染模板
3. **Composable 使用**: 使用 `useTemplate` 进行程序化控制
4. **指令使用**: 使用 `v-template` 指令声明式渲染
5. **错误处理**: 如何处理加载错误和提供自定义状态

通过这个示例，你应该能够理解 LDesign Template 的基本工作原理，并开始创建自己的模板。

## 下一步

- 查看 [响应式模板](./responsive.md) 了解多设备适配
- 学习 [动态切换](./dynamic.md) 实现主题切换
- 探索 [自定义组件](./custom.md) 创建复杂模板
