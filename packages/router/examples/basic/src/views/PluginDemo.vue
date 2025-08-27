<script setup lang="ts">
import { RouterLink } from '@ldesign/router'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'

// 动画相关
const selectedAnimation = ref('fade')
const animationDuration = ref(300)
const currentPreviewPage = ref(0)

const previewPages = [
  { title: '首页', content: '这是首页的内容，展示了淡入淡出的动画效果。' },
  { title: '关于', content: '这是关于页面的内容，可以看到平滑的过渡动画。' },
  { title: '联系', content: '这是联系页面的内容，动画让切换更加自然。' },
]

// 缓存相关
const cacheEnabled = ref(true)
const cachedComponents = ref(['Home', 'About', 'User'])
const memoryUsage = ref(2048576) // 2MB

const testComponents = reactive([
  { id: 1, name: '组件A', inputValue: '' },
  { id: 2, name: '组件B', inputValue: '' },
  { id: 3, name: '组件C', inputValue: '' },
])

// 性能监控相关
const performanceMetrics = reactive({
  avgNavigationTime: 45,
  slowestNavigation: 120,
  navigationCount: 15,
  avgRenderTime: 12,
  mountCount: 8,
  unmountCount: 3,
})

const systemMetrics = reactive({
  memoryUsage: 15728640, // 15MB
  cpuUsage: 8.5,
  fps: 60,
})

// 预加载相关
const preloadSettings = reactive({
  enabled: true,
  aggressive: false,
  onHover: true,
  strategy: 'idle',
})

const preloadableRoutes = reactive([
  { path: '/about', name: '关于页面', icon: '📖', preloaded: false, preloading: false },
  { path: '/user/123', name: '用户详情', icon: '👤', preloaded: true, preloading: false },
  { path: '/error-demo', name: '错误演示', icon: '🚨', preloaded: false, preloading: false },
  { path: '/device-demo', name: '设备适配', icon: '📱', preloaded: false, preloading: false },
])

// 插件管理相关
const installedPlugins = reactive([
  {
    name: 'Router Animation',
    version: '1.2.0',
    description: '提供丰富的路由切换动画效果',
    enabled: true,
  },
  {
    name: 'Route Cache',
    version: '1.1.5',
    description: '智能缓存路由组件，提升性能',
    enabled: true,
  },
  {
    name: 'Performance Monitor',
    version: '1.0.8',
    description: '实时监控路由性能和系统资源',
    enabled: true,
  },
  {
    name: 'Smart Preloader',
    version: '1.3.2',
    description: '智能预加载路由和组件',
    enabled: true,
  },
  {
    name: 'SEO Optimizer',
    version: '1.0.3',
    description: '优化SEO和元数据管理',
    enabled: false,
  },
])

// 性能图表
const performanceChart = ref<HTMLCanvasElement>()
let chartUpdateInterval: ReturnType<typeof setInterval>

// 方法
function updateAnimation() {
  // 动画类型切换
}

function updateDuration() {
  // 动画时长设置
}

function switchPreviewPage(index: number) {
  currentPreviewPage.value = index
}

function toggleCache() {
  cacheEnabled.value = !cacheEnabled.value
  // 缓存状态切换
}

function simulateNavigation(component: any) {
  // 模拟导航离开组件
  if (!cacheEnabled.value) {
    component.inputValue = ''
  }
}

function clearComponentState(component: any) {
  component.inputValue = ''
  // 清除组件状态
}

function updatePreloadSettings() {
  // 预加载设置已更新
}

function triggerPreload(route: any) {
  route.preloading = true
  setTimeout(() => {
    route.preloading = false
    route.preloaded = true
    // 预加载完成
  }, 1000 + Math.random() * 2000)
}

function handleLinkHover(route: any) {
  if (preloadSettings.onHover && !route.preloaded && !route.preloading) {
    triggerPreload(route)
  }
}

function handleLinkLeave(_route: any) {
  // 可以在这里实现取消预加载的逻辑
}

function togglePlugin(plugin: any) {
  plugin.enabled = !plugin.enabled
  // 插件状态切换
}

function configurePlugin(plugin: any) {
  // 配置插件
  console.error(`打开 ${plugin.name} 的配置面板`)
}

function formatBytes(bytes: number) {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

function updatePerformanceChart() {
  if (!performanceChart.value)
    return

  const ctx = performanceChart.value.getContext('2d')
  if (!ctx)
    return

  // 简单的性能图表绘制
  ctx.clearRect(0, 0, 600, 200)
  ctx.strokeStyle = '#007bff'
  ctx.lineWidth = 2
  ctx.beginPath()

  for (let i = 0; i < 50; i++) {
    const x = i * 12
    const y = 100 + Math.sin(i * 0.1 + Date.now() * 0.001) * 30 + Math.random() * 20
    if (i === 0) {
      ctx.moveTo(x, y)
    }
    else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()
}

function updateMetrics() {
  // 模拟性能指标更新
  performanceMetrics.avgNavigationTime = 40 + Math.random() * 20
  performanceMetrics.avgRenderTime = 10 + Math.random() * 10
  systemMetrics.cpuUsage = 5 + Math.random() * 10
  systemMetrics.fps = 58 + Math.random() * 4
  memoryUsage.value = 2000000 + Math.random() * 1000000
}

onMounted(() => {
  // 启动性能图表更新
  chartUpdateInterval = setInterval(() => {
    updatePerformanceChart()
    updateMetrics()
  }, 1000)

  // 初始化图表
  nextTick(() => {
    updatePerformanceChart()
  })
})

onUnmounted(() => {
  if (chartUpdateInterval) {
    clearInterval(chartUpdateInterval)
  }
})
</script>

<template>
  <div class="plugin-demo">
    <h2>🔌 插件功能演示</h2>
    <p>这个页面演示了@ldesign/router的各种插件功能，包括动画、缓存、性能监控、预加载等。</p>

    <!-- 路由动画演示 -->
    <div class="animation-demo">
      <h3>🎬 路由动画演示</h3>
      <p>演示不同的路由切换动画效果：</p>

      <div class="animation-controls">
        <div class="animation-type">
          <label>动画类型：</label>
          <select v-model="selectedAnimation" @change="updateAnimation">
            <option value="fade">
              淡入淡出
            </option>
            <option value="slide">
              滑动
            </option>
            <option value="zoom">
              缩放
            </option>
            <option value="flip">
              翻转
            </option>
            <option value="bounce">
              弹跳
            </option>
          </select>
        </div>

        <div class="animation-duration">
          <label>动画时长：</label>
          <input
            v-model="animationDuration"
            type="range"
            min="100"
            max="1000"
            step="50"
            @input="updateDuration"
          >
          <span>{{ animationDuration }}ms</span>
        </div>
      </div>

      <div class="animation-preview">
        <div class="preview-container">
          <transition :name="selectedAnimation" mode="out-in">
            <div :key="currentPreviewPage" class="preview-page" :class="selectedAnimation">
              <h4>{{ previewPages[currentPreviewPage]?.title || '页面标题' }}</h4>
              <p>{{ previewPages[currentPreviewPage]?.content || '页面内容' }}</p>
            </div>
          </transition>
        </div>

        <div class="preview-controls">
          <button
            v-for="(page, index) in previewPages"
            :key="index"
            :class="{ active: currentPreviewPage === index }"
            class="preview-btn"
            @click="switchPreviewPage(index)"
          >
            {{ page.title }}
          </button>
        </div>
      </div>
    </div>

    <!-- 路由缓存演示 -->
    <div class="cache-demo">
      <h3>💾 路由缓存演示</h3>
      <p>演示路由组件的缓存和状态保持功能：</p>

      <div class="cache-controls">
        <div class="cache-status">
          <span class="status-label">缓存状态：</span>
          <span class="status-value" :class="[cacheEnabled ? 'enabled' : 'disabled']">
            {{ cacheEnabled ? '已启用' : '已禁用' }}
          </span>
          <button class="toggle-btn" @click="toggleCache">
            {{ cacheEnabled ? '禁用缓存' : '启用缓存' }}
          </button>
        </div>

        <div class="cache-info">
          <div class="info-item">
            <span class="info-label">缓存组件数：</span>
            <span class="info-value">{{ cachedComponents.length }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">内存使用：</span>
            <span class="info-value">{{ formatBytes(memoryUsage) }}</span>
          </div>
        </div>
      </div>

      <div class="cache-test">
        <h4>缓存测试区域</h4>
        <div class="test-components">
          <div v-for="component in testComponents" :key="component.id" class="test-component">
            <h5>{{ component.name }}</h5>
            <div class="component-state">
              <input
                v-model="component.inputValue"
                :placeholder="`输入${component.name}的状态`"
                class="state-input"
              >
              <div class="state-display">
                状态值: {{ component.inputValue || '未输入' }}
              </div>
            </div>
            <div class="component-actions">
              <button class="nav-btn" @click="simulateNavigation(component)">
                模拟导航离开
              </button>
              <button class="clear-btn" @click="clearComponentState(component)">
                清除状态
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能监控演示 -->
    <div class="performance-demo">
      <h3>📊 性能监控演示</h3>
      <p>实时监控路由性能指标和系统资源使用情况：</p>

      <div class="performance-metrics">
        <div class="metric-card">
          <h4>路由性能</h4>
          <div class="metric-item">
            <span class="metric-label">平均导航时间：</span>
            <span class="metric-value">{{ performanceMetrics.avgNavigationTime }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">最慢导航：</span>
            <span class="metric-value">{{ performanceMetrics.slowestNavigation }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">导航次数：</span>
            <span class="metric-value">{{ performanceMetrics.navigationCount }}</span>
          </div>
        </div>

        <div class="metric-card">
          <h4>组件性能</h4>
          <div class="metric-item">
            <span class="metric-label">平均渲染时间：</span>
            <span class="metric-value">{{ performanceMetrics.avgRenderTime }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">组件挂载次数：</span>
            <span class="metric-value">{{ performanceMetrics.mountCount }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">组件销毁次数：</span>
            <span class="metric-value">{{ performanceMetrics.unmountCount }}</span>
          </div>
        </div>

        <div class="metric-card">
          <h4>系统资源</h4>
          <div class="metric-item">
            <span class="metric-label">内存使用：</span>
            <span class="metric-value">{{ formatBytes(systemMetrics.memoryUsage) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">CPU 使用率：</span>
            <span class="metric-value">{{ systemMetrics.cpuUsage }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">FPS：</span>
            <span class="metric-value">{{ systemMetrics.fps }}</span>
          </div>
        </div>
      </div>

      <div class="performance-chart">
        <h4>性能趋势图</h4>
        <div class="chart-container">
          <canvas ref="performanceChart" width="600" height="200" />
        </div>
      </div>
    </div>

    <!-- 预加载演示 -->
    <div class="preload-demo">
      <h3>⚡ 预加载演示</h3>
      <p>演示路由和组件的预加载功能，提升用户体验：</p>

      <div class="preload-controls">
        <div class="preload-settings">
          <label>
            <input v-model="preloadSettings.enabled" type="checkbox" @change="updatePreloadSettings">
            启用预加载
          </label>
          <label>
            <input v-model="preloadSettings.aggressive" type="checkbox" @change="updatePreloadSettings">
            激进预加载
          </label>
          <label>
            <input v-model="preloadSettings.onHover" type="checkbox" @change="updatePreloadSettings">
            悬停预加载
          </label>
        </div>

        <div class="preload-strategy">
          <label>预加载策略：</label>
          <select v-model="preloadSettings.strategy" @change="updatePreloadSettings">
            <option value="idle">
              空闲时预加载
            </option>
            <option value="visible">
              可见时预加载
            </option>
            <option value="immediate">
              立即预加载
            </option>
          </select>
        </div>
      </div>

      <div class="preload-status">
        <h4>预加载状态</h4>
        <div class="status-grid">
          <div v-for="route in preloadableRoutes" :key="route.path" class="route-status">
            <div class="route-info">
              <span class="route-name">{{ route.name }}</span>
              <span class="route-path">{{ route.path }}</span>
            </div>
            <div class="route-state">
              <span class="state-indicator" :class="[route.preloaded ? 'loaded' : 'pending']">
                {{ route.preloaded ? '已预加载' : '待加载' }}
              </span>
              <button
                :disabled="route.preloaded"
                class="preload-btn"
                @click="triggerPreload(route)"
              >
                {{ route.preloaded ? '已完成' : '预加载' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="preload-test">
        <h4>预加载测试</h4>
        <p>将鼠标悬停在下面的链接上，观察预加载行为：</p>
        <div class="test-links">
          <RouterLink
            v-for="route in preloadableRoutes"
            :key="route.path"
            :to="route.path"
            class="test-link"
            @mouseenter="handleLinkHover(route)"
            @mouseleave="handleLinkLeave(route)"
          >
            <span class="link-icon">{{ route.icon }}</span>
            <span class="link-text">{{ route.name }}</span>
            <span v-if="route.preloading" class="loading-indicator">⏳</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- 插件管理 -->
    <div class="plugin-management">
      <h3>🔧 插件管理</h3>
      <p>管理和配置已安装的路由插件：</p>

      <div class="plugin-list">
        <div v-for="plugin in installedPlugins" :key="plugin.name" class="plugin-item">
          <div class="plugin-info">
            <div class="plugin-header">
              <span class="plugin-name">{{ plugin.name }}</span>
              <span class="plugin-version">v{{ plugin.version }}</span>
              <span class="plugin-status" :class="[plugin.enabled ? 'enabled' : 'disabled']">
                {{ plugin.enabled ? '已启用' : '已禁用' }}
              </span>
            </div>
            <div class="plugin-description">
              {{ plugin.description }}
            </div>
          </div>

          <div class="plugin-actions">
            <button
              class="toggle-plugin-btn" :class="[plugin.enabled ? 'disable' : 'enable']"
              @click="togglePlugin(plugin)"
            >
              {{ plugin.enabled ? '禁用' : '启用' }}
            </button>
            <button class="config-btn" @click="configurePlugin(plugin)">
              配置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plugin-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.animation-demo, .cache-demo, .performance-demo, .preload-demo, .plugin-management {
  margin: 40px 0;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.animation-controls {
  display: flex;
  gap: 30px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.animation-type, .animation-duration {
  display: flex;
  align-items: center;
  gap: 10px;
}

.animation-type select, .animation-duration input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.animation-duration input[type="range"] {
  width: 150px;
}

.animation-preview {
  margin-top: 30px;
}

.preview-container {
  height: 200px;
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.preview-page {
  text-align: center;
  padding: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}

.preview-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-btn:hover {
  background: #545b62;
}

.preview-btn.active {
  background: #007bff;
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}

.zoom-enter-active, .zoom-leave-active {
  transition: transform 0.3s;
}
.zoom-enter-from, .zoom-leave-to {
  transform: scale(0);
}

.flip-enter-active, .flip-leave-active {
  transition: transform 0.3s;
}
.flip-enter-from {
  transform: rotateY(90deg);
}
.flip-leave-to {
  transform: rotateY(-90deg);
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-out 0.5s;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes bounce-out {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(0); }
}

.cache-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  flex-wrap: wrap;
  gap: 20px;
}

.cache-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-label, .info-label {
  font-weight: 600;
  color: #495057;
}

.status-value.enabled {
  color: #28a745;
  font-weight: 600;
}

.status-value.disabled {
  color: #dc3545;
  font-weight: 600;
}

.toggle-btn {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #0056b3;
}

.cache-info {
  display: flex;
  gap: 20px;
}

.info-item {
  display: flex;
  gap: 5px;
}

.info-value {
  color: #007bff;
  font-weight: 600;
}

.cache-test {
  margin-top: 30px;
}

.test-components {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.test-component {
  background: white;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.component-state {
  margin: 15px 0;
}

.state-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.state-display {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  color: #6c757d;
}

.component-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.nav-btn, .clear-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.nav-btn {
  background: #ffc107;
  color: #212529;
}

.nav-btn:hover {
  background: #e0a800;
}

.clear-btn {
  background: #dc3545;
  color: white;
}

.clear-btn:hover {
  background: #c82333;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.metric-card h4 {
  margin: 0 0 15px 0;
  color: #495057;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  padding: 5px 0;
}

.metric-label {
  color: #6c757d;
}

.metric-value {
  font-weight: 600;
  color: #007bff;
}

.performance-chart {
  margin-top: 30px;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  text-align: center;
}

.chart-container canvas {
  max-width: 100%;
  height: auto;
}

.preload-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  flex-wrap: wrap;
  gap: 20px;
}

.preload-settings {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.preload-settings label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.preload-strategy {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preload-strategy select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.preload-status {
  margin: 30px 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.route-status {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.route-name {
  font-weight: 600;
  color: #495057;
}

.route-path {
  font-size: 12px;
  color: #6c757d;
  font-family: monospace;
}

.route-state {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.state-indicator.loaded {
  color: #28a745;
  font-weight: 600;
}

.state-indicator.pending {
  color: #ffc107;
  font-weight: 600;
}

.preload-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.preload-btn:not(:disabled) {
  background: #007bff;
  color: white;
}

.preload-btn:not(:disabled):hover {
  background: #0056b3;
}

.preload-btn:disabled {
  background: #6c757d;
  color: white;
  cursor: not-allowed;
}

.preload-test {
  margin-top: 30px;
}

.test-links {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.test-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  text-decoration: none;
  color: #495057;
  transition: all 0.2s;
  position: relative;
}

.test-link:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.link-icon {
  font-size: 18px;
}

.link-text {
  font-weight: 500;
}

.loading-indicator {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ffc107;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.plugin-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.plugin-item {
  background: white;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plugin-info {
  flex: 1;
}

.plugin-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.plugin-name {
  font-weight: 600;
  color: #495057;
  font-size: 16px;
}

.plugin-version {
  background: #e9ecef;
  color: #6c757d;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.plugin-status.enabled {
  background: #d4edda;
  color: #155724;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.plugin-status.disabled {
  background: #f8d7da;
  color: #721c24;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.plugin-description {
  color: #6c757d;
  font-size: 14px;
}

.plugin-actions {
  display: flex;
  gap: 10px;
}

.toggle-plugin-btn, .config-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.toggle-plugin-btn.enable {
  background: #28a745;
  color: white;
}

.toggle-plugin-btn.enable:hover {
  background: #218838;
}

.toggle-plugin-btn.disable {
  background: #dc3545;
  color: white;
}

.toggle-plugin-btn.disable:hover {
  background: #c82333;
}

.config-btn {
  background: #6c757d;
  color: white;
}

.config-btn:hover {
  background: #545b62;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plugin-demo {
    padding: 15px;
  }

  .animation-controls, .cache-controls, .preload-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .performance-metrics {
    grid-template-columns: 1fr;
  }

  .test-components, .status-grid {
    grid-template-columns: 1fr;
  }

  .plugin-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .plugin-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .test-links {
    flex-direction: column;
  }

  .test-link {
    justify-content: center;
  }
}
</style>
