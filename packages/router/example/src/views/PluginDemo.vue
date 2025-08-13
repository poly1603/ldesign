<script setup lang="ts">
import { RouterLink } from '@ldesign/router'
import { onMounted, onUnmounted, ref } from 'vue'

// 动画相关
const selectedAnimation = ref('fade')
const animationKey = ref(0)

// 缓存相关
const cacheCount = ref(3)
const cacheItems = ref([
  { id: 1, name: 'Home组件', timestamp: '2024-01-15 10:30:00' },
  { id: 2, name: 'Basic组件', timestamp: '2024-01-15 10:32:15' },
  { id: 3, name: 'Nested组件', timestamp: '2024-01-15 10:35:20' },
])

// 预加载相关
const preloadLinks = ref([
  { path: '/', name: '首页', preloaded: false },
  { path: '/basic', name: '基础路由', preloaded: false },
  { path: '/nested', name: '嵌套路由', preloaded: false },
  { path: '/dynamic/123', name: '动态路由', preloaded: false },
])

// 性能监控相关
const performanceMetrics = ref({
  navigationTime: 45,
  componentLoadTime: 23,
  memoryUsage: 12.5,
  fps: 60,
})

const performanceHistory = ref([65, 45, 80, 30, 95, 40, 75, 60, 85, 50])

let performanceInterval: number | null = null

// 方法
function triggerAnimation() {
  animationKey.value++
}

function addToCache() {
  const newItem = {
    id: Date.now(),
    name: `组件${cacheCount.value + 1}`,
    timestamp: new Date().toLocaleString(),
  }
  cacheItems.value.push(newItem)
  cacheCount.value++
}

function clearCache() {
  cacheItems.value = []
  cacheCount.value = 0
}

function handlePreload(link: any) {
  if (!link.preloaded) {
    setTimeout(() => {
      link.preloaded = true
    }, 500)
  }
}

function updatePerformanceMetrics() {
  performanceMetrics.value = {
    navigationTime: Math.floor(Math.random() * 100) + 20,
    componentLoadTime: Math.floor(Math.random() * 50) + 10,
    memoryUsage: Math.round((Math.random() * 20 + 10) * 10) / 10,
    fps: Math.floor(Math.random() * 10) + 55,
  }

  performanceHistory.value.push(Math.floor(Math.random() * 100))
  if (performanceHistory.value.length > 10) {
    performanceHistory.value.shift()
  }
}

onMounted(() => {
  performanceInterval = window.setInterval(updatePerformanceMetrics, 3000)
})

onUnmounted(() => {
  if (performanceInterval) {
    clearInterval(performanceInterval)
  }
})
</script>

<template>
  <div class="plugin-demo">
    <div class="card">
      <h1>插件系统演示</h1>
      <p>
        这里展示了 @ldesign/router
        的插件系统功能，包括动画、缓存、预加载和性能监控。
      </p>
    </div>

    <div class="card">
      <h2>🎨 动画插件</h2>
      <div class="animation-demo">
        <div class="animation-controls">
          <label>选择动画类型:</label>
          <select v-model="selectedAnimation" class="input">
            <option value="fade">淡入淡出</option>
            <option value="slide">滑动</option>
            <option value="zoom">缩放</option>
            <option value="bounce">弹跳</option>
          </select>
          <button class="btn btn-primary" @click="triggerAnimation">
            触发动画
          </button>
        </div>
        <div class="animation-preview">
          <transition :name="selectedAnimation" mode="out-in">
            <div :key="animationKey" class="animation-box">
              <h3>动画演示</h3>
              <p>当前动画: {{ selectedAnimation }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>💾 缓存插件</h2>
      <div class="cache-demo">
        <div class="cache-info">
          <div class="info-item">
            <strong>缓存策略:</strong> LRU (最近最少使用)
          </div>
          <div class="info-item"><strong>最大缓存数:</strong> 10 个组件</div>
          <div class="info-item">
            <strong>当前缓存:</strong> {{ cacheCount }} 个组件
          </div>
        </div>
        <div class="cache-actions">
          <button class="btn btn-success" @click="addToCache">
            添加到缓存
          </button>
          <button class="btn btn-warning" @click="clearCache">清空缓存</button>
        </div>
        <div class="cache-list">
          <h4>缓存列表:</h4>
          <ul>
            <li v-for="item in cacheItems" :key="item.id">
              {{ item.name }} - {{ item.timestamp }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>⚡ 预加载插件</h2>
      <div class="preload-demo">
        <div class="preload-info">
          <div class="info-item"><strong>预加载策略:</strong> 鼠标悬停触发</div>
          <div class="info-item">
            <strong>自动预加载相关路由:</strong> 已启用
          </div>
        </div>
        <div class="preload-links">
          <h4>悬停以下链接查看预加载效果:</h4>
          <div class="link-grid">
            <RouterLink
              v-for="link in preloadLinks"
              :key="link.path"
              :to="link.path"
              class="preload-link"
              @mouseenter="handlePreload(link)"
            >
              {{ link.name }}
              <span v-if="link.preloaded" class="preload-status">✅</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>📊 性能监控插件</h2>
      <div class="performance-demo">
        <div class="performance-metrics">
          <div class="metric-item">
            <span class="metric-label">导航时间:</span>
            <span class="metric-value"
              >{{ performanceMetrics.navigationTime }}ms</span
            >
          </div>
          <div class="metric-item">
            <span class="metric-label">组件加载时间:</span>
            <span class="metric-value"
              >{{ performanceMetrics.componentLoadTime }}ms</span
            >
          </div>
          <div class="metric-item">
            <span class="metric-label">内存使用:</span>
            <span class="metric-value"
              >{{ performanceMetrics.memoryUsage }}MB</span
            >
          </div>
          <div class="metric-item">
            <span class="metric-label">FPS:</span>
            <span class="metric-value">{{ performanceMetrics.fps }}</span>
          </div>
        </div>
        <div class="performance-chart">
          <h4>性能趋势图:</h4>
          <div class="chart">
            <div
              v-for="(value, index) in performanceHistory"
              :key="index"
              class="chart-bar"
              :style="{ height: `${value}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.plugin-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.animation-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: @spacing-lg;
  align-items: start;
}

.animation-controls {
  display: grid;
  gap: @spacing-md;

  label {
    font-weight: 500;
    color: @gray-700;
  }
}

.animation-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.animation-box {
  padding: @spacing-lg;
  background: linear-gradient(135deg, @primary-color, @secondary-color);
  color: white;
  border-radius: @border-radius-lg;
  text-align: center;
  min-width: 200px;

  h3 {
    margin-bottom: @spacing-sm;
  }
}

.cache-demo {
  display: grid;
  gap: @spacing-lg;
}

.cache-info {
  display: grid;
  gap: @spacing-sm;
}

.info-item {
  padding: @spacing-sm;
  background: @gray-50;
  border-radius: @border-radius-sm;
}

.cache-actions {
  display: flex;
  gap: @spacing-md;
}

.cache-list {
  h4 {
    margin-bottom: @spacing-md;
    color: @gray-700;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: @spacing-sm;
      margin-bottom: @spacing-xs;
      background: @gray-50;
      border-radius: @border-radius-sm;
      font-family: monospace;
      font-size: @font-size-sm;
    }
  }
}

.preload-demo {
  display: grid;
  gap: @spacing-lg;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: @spacing-md;
}

.preload-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @spacing-md;
  background: @gray-50;
  border-radius: @border-radius-md;
  text-decoration: none;
  color: @gray-700;
  transition: all @transition-base;

  &:hover {
    background: @primary-color;
    color: white;
    transform: translateY(-2px);
  }

  .preload-status {
    font-size: @font-size-sm;
  }
}

.performance-demo {
  display: grid;
  gap: @spacing-lg;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: @spacing-md;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: @spacing-sm;
  background: @gray-50;
  border-radius: @border-radius-sm;

  .metric-label {
    color: @gray-700;
    font-weight: 500;
  }

  .metric-value {
    color: @primary-color;
    font-weight: 600;
  }
}

.performance-chart {
  h4 {
    margin-bottom: @spacing-md;
    color: @gray-700;
  }
}

.chart {
  display: flex;
  align-items: end;
  height: 100px;
  gap: @spacing-xs;
  padding: @spacing-sm;
  background: @gray-50;
  border-radius: @border-radius-md;
}

.chart-bar {
  flex: 1;
  background: @primary-color;
  border-radius: @border-radius-sm @border-radius-sm 0 0;
  min-height: 10px;
  transition: height 0.3s ease;
}

// 动画样式
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}
.slide-enter-from {
  transform: translateX(100px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-100px);
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.5s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0);
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.8s ease;
}
.bounce-leave-active {
  animation: bounce-out 0.5s ease;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}

@media (max-width: 768px) {
  .animation-demo {
    grid-template-columns: 1fr;
  }

  .cache-actions {
    flex-direction: column;
  }

  .cache-actions .btn {
    width: 100%;
  }

  .performance-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
