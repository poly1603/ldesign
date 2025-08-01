# 动态切换示例

本示例展示如何在运行时动态切换模板，实现主题切换、布局变更等功能。

## 主题切换示例

```vue
<script setup lang="ts">
import { ref } from 'vue'

const themes = [
  { name: 'classic', label: '经典主题' },
  { name: 'modern', label: '现代主题' },
  { name: 'dark', label: '暗黑主题' },
  { name: 'minimal', label: '极简主题' }
]

const currentTheme = ref('classic')

const layoutProps = ref({
  title: '动态主题切换',
  content: '这是一个动态切换主题的示例'
})

function switchTheme(themeName: string) {
  currentTheme.value = themeName
  console.log('切换到主题:', themeName)
}

function onThemeLoad(component: any) {
  console.log('主题加载完成:', component)
}
</script>

<template>
  <div class="app">
    <div class="theme-switcher">
      <h2>选择主题</h2>
      <div class="theme-options">
        <button
          v-for="theme in themes"
          :key="theme.name"
          :class="{ active: currentTheme === theme.name }"
          @click="switchTheme(theme.name)"
        >
          {{ theme.label }}
        </button>
      </div>
    </div>

    <div class="template-container">
      <LTemplateRenderer
        category="layout"
        device="desktop"
        :template="currentTheme"
        :template-props="layoutProps"
        @load="onThemeLoad"
      />
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 2rem;
}

.theme-switcher {
  margin-bottom: 2rem;
  text-align: center;
}

.theme-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.theme-options button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-options button:hover {
  border-color: #007bff;
}

.theme-options button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.template-container {
  min-height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
</style>
```

## 布局切换示例

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const currentLayout = ref('sidebar')

const layoutProps = computed(() => ({
  title: `${currentLayout.value} 布局`,
  items: [
    { id: 1, title: '项目 1', content: '内容 1' },
    { id: 2, title: '项目 2', content: '内容 2' },
    { id: 3, title: '项目 3', content: '内容 3' }
  ]
}))

function onLayoutChange() {
  console.log('布局已切换:', currentLayout.value)
}
</script>

<template>
  <div class="app">
    <div class="layout-controls">
      <h2>选择布局</h2>
      <select v-model="currentLayout" @change="onLayoutChange">
        <option value="sidebar">
          侧边栏布局
        </option>
        <option value="topbar">
          顶部导航布局
        </option>
        <option value="grid">
          网格布局
        </option>
        <option value="card">
          卡片布局
        </option>
      </select>
    </div>

    <transition name="layout-fade" mode="out-in">
      <LTemplateRenderer
        :key="currentLayout"
        category="layout"
        device="desktop"
        :template="currentLayout"
        :template-props="layoutProps"
      />
    </transition>
  </div>
</template>

<style scoped>
.layout-controls {
  margin-bottom: 2rem;
  text-align: center;
}

.layout-controls select {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.layout-fade-enter-active,
.layout-fade-leave-active {
  transition: opacity 0.3s ease;
}

.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
}
</style>
```

## 条件模板渲染

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const roles = [
  { name: 'admin', label: '管理员' },
  { name: 'user', label: '普通用户' },
  { name: 'guest', label: '访客' }
]

const currentRole = ref('user')

// 根据角色选择不同的模板
const dashboardTemplate = computed(() => {
  const templateMap = {
    admin: 'admin-dashboard',
    user: 'user-dashboard',
    guest: 'guest-dashboard'
  }
  return templateMap[currentRole.value] || 'guest-dashboard'
})

const dashboardProps = computed(() => ({
  userRole: currentRole.value,
  userName: `${currentRole.value}用户`,
  permissions: getPermissions(currentRole.value)
}))

function switchRole(role: string) {
  currentRole.value = role
  console.log('切换到角色:', role)
}

function getPermissions(role: string) {
  const permissionMap = {
    admin: ['read', 'write', 'delete', 'manage'],
    user: ['read', 'write'],
    guest: ['read']
  }
  return permissionMap[role] || []
}
</script>

<template>
  <div class="app">
    <div class="user-controls">
      <h2>用户角色</h2>
      <div class="role-buttons">
        <button
          v-for="role in roles"
          :key="role.name"
          :class="{ active: currentRole === role.name }"
          @click="switchRole(role.name)"
        >
          {{ role.label }}
        </button>
      </div>
    </div>

    <div class="dashboard-container">
      <LTemplateRenderer
        category="dashboard"
        device="desktop"
        :template="dashboardTemplate"
        :template-props="dashboardProps"
      />
    </div>
  </div>
</template>

<style scoped>
.user-controls {
  margin-bottom: 2rem;
  text-align: center;
}

.role-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.role-buttons button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.role-buttons button.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}
</style>
```

## 使用 Composable 动态切换

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template'
import { computed, ref } from 'vue'

const {
  currentTemplate,
  loading,
  error,
  render,
  preload,
  clearCache
} = useTemplate()

const availableTemplates = [
  { category: 'greeting', template: 'hello' },
  { category: 'dashboard', template: 'admin' },
  { category: 'layout', template: 'sidebar' }
]

const currentTemplateName = ref('')
const loadTime = ref(0)
const fromCache = ref(false)

const templateProps = computed(() => ({
  title: `动态加载的${currentTemplateName.value}模板`,
  message: '这是通过 Composable 动态加载的模板'
}))

async function loadRandomTemplate() {
  const randomTemplate = availableTemplates[
    Math.floor(Math.random() * availableTemplates.length)
  ]

  const startTime = Date.now()

  try {
    const result = await render({
      category: randomTemplate.category,
      device: 'desktop',
      template: randomTemplate.template
    })

    loadTime.value = Date.now() - startTime
    fromCache.value = result?.fromCache || false
    currentTemplateName.value = randomTemplate.template
  }
  catch (err) {
    console.error('加载模板失败:', err)
  }
}

async function preloadTemplates() {
  try {
    await preload(availableTemplates.map(t => ({
      category: t.category,
      device: 'desktop',
      template: t.template
    })))

    console.log('模板预加载完成')
  }
  catch (err) {
    console.error('预加载失败:', err)
  }
}

function clearCurrentTemplate() {
  currentTemplate.value = null
  currentTemplateName.value = ''
}

function retryLoad() {
  loadRandomTemplate()
}
</script>

<template>
  <div class="app">
    <div class="controls">
      <button @click="loadRandomTemplate">
        加载随机模板
      </button>
      <button @click="preloadTemplates">
        预加载模板
      </button>
      <button @click="clearCurrentTemplate">
        清空模板
      </button>
    </div>

    <div v-if="currentTemplate" class="template-info">
      <p>当前模板: {{ currentTemplateName }}</p>
      <p>加载时间: {{ loadTime }}ms</p>
      <p>来自缓存: {{ fromCache ? '是' : '否' }}</p>
    </div>

    <div class="template-display">
      <div v-if="loading" class="loading">
        正在加载模板...
      </div>

      <div v-else-if="error" class="error">
        加载失败: {{ error.message }}
        <button @click="retryLoad">
          重试
        </button>
      </div>

      <component
        :is="currentTemplate"
        v-else-if="currentTemplate"
        v-bind="templateProps"
      />

      <div v-else class="empty">
        点击按钮加载模板
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.controls button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.controls button:hover {
  background: #f0f0f0;
}

.template-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.template-info p {
  margin: 0.5rem 0;
}

.template-display {
  min-height: 300px;
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

这个示例展示了如何实现动态模板切换，包括主题切换、布局变更和条件渲染等功能。
