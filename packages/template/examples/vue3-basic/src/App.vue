<script setup lang="ts">
import type { DeviceType } from '@ldesign/template'
import { computed, onMounted, ref, watch } from 'vue'
import TemplateRenderer from '../../../src/vue/components/TemplateRenderer.vue'

// 简单的模板渲染器组件（用于演示）
const SimpleTemplateRenderer = {
  name: 'SimpleTemplateRenderer',
  props: {
    template: String,
    deviceType: String,
    templateProps: Object
  },
  emits: ['template-loaded', 'template-error'],
  setup(props: any, { emit }: any) {
    const currentComponent = ref(null)
    const isLoading = ref(false)
    const loadError = ref(null)

    const loadTemplate = async () => {
      if (!props.template || !props.deviceType) return

      isLoading.value = true
      loadError.value = null

      try {
        // 动态导入模板组件
        const templatePath = `/src/templates/${props.template}/${props.deviceType}/${getComponentName(props.template)}.vue`
        const module = await import(/* @vite-ignore */ templatePath)
        currentComponent.value = module.default
        emit('template-loaded', { template: props.template, deviceType: props.deviceType })
      } catch (error) {
        console.error('模板加载失败:', error)
        loadError.value = error
        emit('template-error', error)
      } finally {
        isLoading.value = false
      }
    }

    const getComponentName = (template: string) => {
      if (template === 'login') return 'LoginForm'
      if (template === 'dashboard') return 'Dashboard'
      return template.charAt(0).toUpperCase() + template.slice(1)
    }

    // 监听属性变化
    watch([() => props.template, () => props.deviceType], loadTemplate, { immediate: true })

    return () => {
      if (isLoading.value) {
        return h('div', {
          class: 'template-loading',
          style: {
            padding: '2rem',
            textAlign: 'center',
            color: '#667eea'
          }
        }, '加载模板中...')
      }

      if (loadError.value) {
        return h('div', {
          class: 'template-error',
          style: {
            padding: '2rem',
            textAlign: 'center',
            color: '#e53e3e',
            background: '#fed7d7',
            borderRadius: '8px'
          }
        }, `模板加载失败: ${loadError.value.message}`)
      }

      if (currentComponent.value) {
        return h(currentComponent.value, props.templateProps || {})
      }

      return h('div', {
        class: 'template-placeholder',
        style: {
          padding: '2rem',
          border: '2px dashed #667eea',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#667eea',
          background: '#f7fafc'
        }
      }, '等待加载模板...')
    }
  }
}

// 导入h函数用于渲染
import { h } from 'vue'

// 响应式数据
const currentDevice = ref<DeviceType>('desktop')
const screenSize = ref({ width: 0, height: 0 })
const orientation = ref<'portrait' | 'landscape'>('landscape')
const scanning = ref(false)

// 组合式API示例数据
const templateComponent = ref(null)
const loading = ref(false)
const error = ref(null)

// 使用组合式API加载模板
async function loadDashboardTemplate() {
  loading.value = true
  error.value = null

  try {
    const module = await import('/src/templates/dashboard/desktop/Dashboard.vue')
    templateComponent.value = module.default
  } catch (err) {
    error.value = err
    console.error('组合式API加载模板失败:', err)
  } finally {
    loading.value = false
  }
}
const manager = ref(null)
const cacheStats = ref({ hitRate: 85, memoryUsage: 1024 * 1024 * 2 })

// 计算属性
const templateStats = computed(() => ({
  total: 5,
  categories: 2,
}))

const performanceStats = computed(() => ({
  averageLoadTime: 120,
  memoryUsage: 1024 * 1024 * 2,
  activeTemplates: 3,
}))

// 方法
function updateDeviceInfo() {
  screenSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'

  // 简单的设备类型检测
  if (window.innerWidth <= 768) {
    currentDevice.value = 'mobile'
  }
  else if (window.innerWidth <= 1024) {
    currentDevice.value = 'tablet'
  }
  else {
    currentDevice.value = 'desktop'
  }
}

async function scanTemplates() {
  scanning.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  finally {
    scanning.value = false
  }
}

function clearCache() {
  console.log('清空缓存')
}

function switchDevice() {
  const devices = ['desktop', 'tablet', 'mobile']
  const currentIndex = devices.indexOf(currentDevice.value)
  const nextIndex = (currentIndex + 1) % devices.length
  currentDevice.value = devices[nextIndex]
}

function onTemplateLoaded(component: any) {
  console.log('模板加载成功:', component)
}

function onTemplateError(error: Error) {
  console.error('模板加载失败:', error)
}

function onTemplateChanged(templateName: string) {
  console.log('模板已切换到:', templateName)
}

function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// 生命周期
onMounted(() => {
  updateDeviceInfo()

  // 监听窗口大小变化
  window.addEventListener('resize', updateDeviceInfo)

  // 加载组合式API示例模板
  loadDashboardTemplate()

  console.log('加载示例模板:', currentDevice.value)
})
</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>@ldesign/template Vue3 基础示例</h1>
      <p>高性能动态模板管理系统演示</p>
    </header>

    <main class="app-main">
      <!-- 设备信息显示 -->
      <section class="device-info">
        <h2>设备信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>当前设备类型:</label>
            <span class="device-type">{{ currentDevice }}</span>
          </div>
          <div class="info-item">
            <label>屏幕尺寸:</label>
            <span>{{ screenSize.width }} × {{ screenSize.height }}</span>
          </div>
          <div class="info-item">
            <label>设备方向:</label>
            <span>{{ orientation }}</span>
          </div>
        </div>
      </section>

      <!-- 模板渲染演示 -->
      <section class="template-demo">
        <h2>模板渲染演示</h2>

        <!-- 使用组件方式（带选择器） -->
        <div class="demo-section">
          <h3>组件方式渲染（带模板选择器）</h3>
          <TemplateRenderer
            template="login"
            category="login"
            :device-type="currentDevice"
            :template-props="{ title: '用户登录' }"
            :show-selector="true"
            @template-loaded="onTemplateLoaded"
            @template-error="onTemplateError"
            @template-changed="onTemplateChanged"
            @selector-opened="() => console.log('选择器打开')"
            @selector-closed="() => console.log('选择器关闭')"
          />
        </div>

        <!-- 仪表板模板演示 -->
        <div class="demo-section">
          <h3>仪表板模板（带选择器）</h3>
          <TemplateRenderer
            template="dashboard"
            category="dashboard"
            :device-type="currentDevice"
            :template-props="{ showStats: true }"
            :show-selector="true"
            @template-loaded="onTemplateLoaded"
            @template-error="onTemplateError"
            @template-changed="onTemplateChanged"
          />
        </div>

        <!-- 使用组合式API -->
        <div class="demo-section">
          <h3>组合式API方式</h3>
          <div v-if="templateComponent">
            <component :is="templateComponent" title="仪表板" />
          </div>
          <div v-else-if="loading" class="loading">
            加载模板中...
          </div>
          <div v-else-if="error" class="error">
            加载失败: {{ error.message }}
          </div>
        </div>
      </section>

      <!-- 模板管理演示 -->
      <section class="template-management">
        <h2>模板管理</h2>

        <div class="controls">
          <button :disabled="scanning" @click="scanTemplates">
            {{ scanning ? '扫描中...' : '扫描模板' }}
          </button>
          <button @click="clearCache">
            清空缓存
          </button>
          <button @click="switchDevice">
            切换设备类型
          </button>
        </div>

        <div class="stats">
          <div class="stat-item">
            <label>已扫描模板:</label>
            <span>{{ templateStats.total }}</span>
          </div>
          <div class="stat-item">
            <label>可用分类:</label>
            <span>{{ templateStats.categories }}</span>
          </div>
          <div class="stat-item">
            <label>缓存命中率:</label>
            <span>{{ cacheStats.hitRate }}%</span>
          </div>
        </div>
      </section>

      <!-- 性能监控 -->
      <section class="performance">
        <h2>性能监控</h2>
        <div class="perf-grid">
          <div class="perf-item">
            <label>平均加载时间:</label>
            <span>{{ performanceStats.averageLoadTime }}ms</span>
          </div>
          <div class="perf-item">
            <label>内存使用:</label>
            <span>{{ formatBytes(performanceStats.memoryUsage) }}</span>
          </div>
          <div class="perf-item">
            <label>活跃模板:</label>
            <span>{{ performanceStats.activeTemplates }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2.5rem;
}

.app-header p {
  margin: 0;
  opacity: 0.9;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

section h2 {
  margin: 0 0 1rem;
  color: #2d3748;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

section h3 {
  margin: 0 0 1rem;
  color: #4a5568;
}

.info-grid,
.perf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item,
.perf-item,
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 4px;
}

.info-item label,
.perf-item label,
.stat-item label {
  font-weight: 600;
  color: #4a5568;
}

.device-type {
  padding: 0.25rem 0.5rem;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.demo-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.controls button {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.controls button:hover:not(:disabled) {
  background: #5a67d8;
}

.controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #667eea;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #e53e3e;
  background: #fed7d7;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }

  .controls {
    flex-direction: column;
  }

  .info-grid,
  .perf-grid,
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
