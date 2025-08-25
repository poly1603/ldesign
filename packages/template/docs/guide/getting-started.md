# 快速开始

> 🚀 5分钟带你体验模板管理的魅力！

## 🎯 第一个例子

让我们从最简单的例子开始：

```typescript
import { TemplateManager } from '@ldesign/template'

// 1. 创建模板管理器
const manager = new TemplateManager({
  enableCache: true,
  defaultDevice: 'desktop'
})

// 2. 扫描可用模板
const scanResult = await manager.scanTemplates()
console.log(`发现 ${scanResult.count} 个模板！`)

// 3. 渲染一个登录模板
const loginTemplate = await manager.render({
  category: 'login',
  device: 'desktop',
  template: 'classic'
})

// 4. 使用渲染结果
console.log('模板组件:', loginTemplate.component)
console.log('模板元数据:', loginTemplate.metadata)
```

## 🎨 Vue 项目中使用

在 Vue 3 项目中使用更加简单：

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { computed } from 'vue'

// 使用模板管理 Hook
const {
  currentTemplate,
  templates,
  isLoading,
  switchTemplate,
  scanTemplates
} = useTemplate({
  enableCache: true,
  autoDetectDevice: true
}, {
  autoScan: true // 自动扫描模板
})

// 可用模板列表
const availableTemplates = computed(() =>
  templates.value.filter(t => t.category === 'login')
)

// 切换模板
async function switchTo(template: any) {
  await switchTemplate(
    template.category,
    template.device,
    template.template
  )
}

// 检查是否为当前模板
function isCurrentTemplate(template: any) {
  return currentTemplate.value?.metadata.template === template.template
}

// 传递给模板的属性
const templateProps = {
  title: '欢迎登录',
  subtitle: '请输入您的账号信息',
  onLogin: (credentials: any) => {
    console.log('登录信息:', credentials)
  }
}
</script>

<template>
  <div class="app">
    <!-- 模板选择器 -->
    <div class="template-selector">
      <button
        v-for="template in availableTemplates"
        :key="template.template"
        :class="{ active: isCurrentTemplate(template) }"
        @click="switchTo(template)"
      >
        {{ template.name }}
      </button>
    </div>

    <!-- 当前模板 -->
    <div class="template-container">
      <component
        :is="currentTemplate.component"
        v-if="currentTemplate"
        v-bind="templateProps"
      />
      <div v-else class="loading">
        🎭 模板加载中...
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.template-selector button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.template-selector button:hover {
  background: #f5f5f5;
}

.template-selector button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.template-container {
  min-height: 400px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 18px;
  color: #666;
}
</style>
```

## 📱 设备自适应示例

模板系统会自动检测设备类型：

```typescript
import { DeviceDetector } from '@ldesign/device'
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager({
  autoDetectDevice: true // 启用自动设备检测
})

// 扫描模板
await manager.scanTemplates()

// 系统会自动选择适合当前设备的模板
const currentDevice = manager.getCurrentDevice()
console.log('当前设备:', currentDevice) // 'desktop' | 'mobile' | 'tablet'

// 渲染适合当前设备的登录模板
const template = await manager.render({
  category: 'login',
  device: currentDevice, // 或者省略，系统会自动选择
  template: 'modern'
})
```

## 🎭 模板切换动画

添加平滑的切换动画：

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { computed } from 'vue'

const { currentTemplate } = useTemplate()

// 用于触发过渡的唯一键
const templateKey = computed(() =>
  currentTemplate.value
    ? `${currentTemplate.value.metadata.category}-${currentTemplate.value.metadata.template}`
    : 'loading'
)

function onBeforeEnter() {
  console.log('🎭 模板切换开始')
}

function onAfterEnter() {
  console.log('✨ 模板切换完成')
}
</script>

<template>
  <div class="template-wrapper">
    <transition
      name="template-fade"
      mode="out-in"
      @before-enter="onBeforeEnter"
      @after-enter="onAfterEnter"
    >
      <component
        :is="currentTemplate?.component"
        :key="templateKey"
        v-bind="templateProps"
      />
    </transition>
  </div>
</template>

<style scoped>
.template-fade-enter-active,
.template-fade-leave-active {
  transition: all 0.3s ease;
}

.template-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.template-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
```

## 🔧 配置选项

```typescript
const manager = new TemplateManager({
  // 缓存配置
  enableCache: true,

  // 设备检测
  autoDetectDevice: true,
  defaultDevice: 'desktop',

  // 调试模式
  debug: process.env.NODE_ENV === 'development',

  // 自定义模板路径
  templatePaths: [
    './src/templates',
    './src/custom-templates'
  ],

  // 错误处理
  onError: (error) => {
    console.error('模板错误:', error)
  },

  // 模板加载完成回调
  onTemplateLoaded: (metadata) => {
    console.log('模板已加载:', metadata.name)
  }
})
```

## 🎪 实时预览

想要实时预览模板效果？试试这个：

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { ref, watch } from 'vue'

const { render } = useTemplate()

const devices = ['desktop', 'tablet', 'mobile']
const deviceNames = {
  desktop: '🖥️ 桌面',
  tablet: '📱 平板',
  mobile: '📱 手机'
}

const currentDevice = ref('desktop')
const previewTemplate = ref(null)

// 监听设备变化，重新渲染模板
watch(currentDevice, async (newDevice) => {
  previewTemplate.value = await render({
    category: 'login',
    device: newDevice,
    template: 'modern'
  })
}, { immediate: true })
</script>

<template>
  <div class="preview-container">
    <!-- 设备选择器 -->
    <div class="device-selector">
      <button
        v-for="device in devices"
        :key="device"
        :class="{ active: currentDevice === device }"
        @click="currentDevice = device"
      >
        {{ deviceNames[device] }}
      </button>
    </div>

    <!-- 模板预览 -->
    <div class="preview-frame" :class="`device-${currentDevice}`">
      <component
        :is="previewTemplate?.component"
        v-bind="previewProps"
      />
    </div>
  </div>
</template>

<style scoped>
.preview-frame.device-desktop {
  width: 1200px;
  height: 800px;
}

.preview-frame.device-tablet {
  width: 768px;
  height: 1024px;
}

.preview-frame.device-mobile {
  width: 375px;
  height: 667px;
}
</style>
```

## 🎯 下一步

恭喜！你已经掌握了基础用法。接下来可以：

- 📖 深入了解 [核心概念](/guide/concepts)
- 🎨 学习 [自定义模板](/guide/custom-templates)
- 🚀 查看 [完整示例](/examples/full-app)
- 📚 浏览 [API 文档](/api/)

## 💡 小贴士

- 🔄 使用 `enableCache: true` 提升性能
- 📱 启用 `autoDetectDevice` 获得最佳用户体验
- 🎭 为模板切换添加过渡动画
- 🐛 在开发环境启用 `debug: true` 便于调试
