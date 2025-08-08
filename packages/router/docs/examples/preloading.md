# 智能预加载示例

展示 LDesign Router 独特的智能预加载功能，实现极致的用户体验优化。

## 🎯 示例概述

构建一个新闻网站，展示四种预加载策略：

- **immediate** - 立即预加载重要页面
- **hover** - 悬停时预加载
- **visible** - 可见时预加载
- **idle** - 空闲时预加载

## 🚀 预加载策略配置

```typescript
// router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      preload: 'immediate', // 立即预加载
    },
  },
  {
    path: '/news',
    name: 'NewsList',
    component: () => import('../views/NewsList.vue'),
    meta: {
      title: '新闻列表',
      preload: 'hover', // 悬停预加载
    },
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: () => import('../views/NewsDetail.vue'),
    props: true,
    meta: {
      title: '新闻详情',
      preload: 'visible', // 可见时预加载
    },
  },
  {
    path: '/archive',
    name: 'Archive',
    component: () => import('../views/Archive.vue'),
    meta: {
      title: '历史归档',
      preload: 'idle', // 空闲时预加载
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 全局预加载配置
  preloadStrategy: 'hover', // 默认策略
  preloadDelay: 100, // 预加载延迟

  // 预加载条件
  preloadCondition: route => {
    // 移动端减少预加载
    if (isMobile()) {
      return route.meta.priority === 'high'
    }

    // 慢网络减少预加载
    if (isSlowNetwork()) {
      return route.meta.preload === 'immediate'
    }

    return true
  },
})

export default router
```

## 🎨 智能导航组件

```vue
<!-- components/SmartNavigation.vue -->
<script setup>
import { useRouter } from '@ldesign/router'
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const router = useRouter()
const hoveringItem = ref(null)
const visibleItems = ref([])
const preloadStats = reactive({
  loaded: 0,
  hits: 0,
  timeSaved: 0,
})

// 页面配置
const importantPages = [
  {
    path: '/',
    title: '首页',
    icon: 'home',
    priority: 'high',
  },
  {
    path: '/breaking-news',
    title: '突发新闻',
    icon: 'alert',
    priority: 'high',
  },
]

const commonPages = [
  {
    path: '/news',
    title: '新闻列表',
    icon: 'newspaper',
    preview: '/images/news-preview.jpg',
    description: '最新新闻资讯',
  },
  {
    path: '/sports',
    title: '体育新闻',
    icon: 'sports',
    preview: '/images/sports-preview.jpg',
    description: '体育赛事报道',
  },
  {
    path: '/tech',
    title: '科技新闻',
    icon: 'cpu',
    preview: '/images/tech-preview.jpg',
    description: '科技前沿资讯',
  },
]

const secondaryPages = [
  {
    path: '/opinion',
    title: '观点评论',
    icon: 'message-circle',
  },
  {
    path: '/lifestyle',
    title: '生活方式',
    icon: 'coffee',
  },
]

const archivePages = [
  {
    path: '/archive/2023',
    title: '2023年归档',
    icon: 'archive',
  },
  {
    path: '/archive/2022',
    title: '2022年归档',
    icon: 'archive',
  },
]

// 悬停处理
function onHoverStart(item) {
  hoveringItem.value = item.path

  // 记录悬停事件
  analytics.track('nav_hover', {
    path: item.path,
    title: item.title,
  })
}

function onHoverEnd(item) {
  setTimeout(() => {
    if (hoveringItem.value === item.path) {
      hoveringItem.value = null
    }
  }, 300)
}

// 可见性检测
function setupVisibilityObserver() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const link = entry.target
        const path = link.getAttribute('to')

        if (entry.isIntersecting) {
          if (!visibleItems.value.includes(path)) {
            visibleItems.value.push(path)

            // 记录可见事件
            analytics.track('nav_visible', { path })
          }
        } else {
          const index = visibleItems.value.indexOf(path)
          if (index > -1) {
            visibleItems.value.splice(index, 1)
          }
        }
      })
    },
    {
      threshold: 0.5,
    }
  )

  // 观察所有可见预加载链接
  const visibleLinks = document.querySelectorAll('[preload="visible"]')
  visibleLinks.forEach(link => observer.observe(link))

  return observer
}

// 导航追踪
function trackNavigation(item, strategy) {
  analytics.track('navigation', {
    path: item.path,
    title: item.title,
    strategy,
    timestamp: Date.now(),
  })
}

// 预加载统计更新
function updatePreloadStats() {
  const stats = router.getPreloadStats()
  preloadStats.loaded = stats.preloadedCount
  preloadStats.hits = stats.cacheHits
  preloadStats.timeSaved = stats.timeSaved
}

// 监听预加载事件
function setupPreloadListeners() {
  router.onPreloadStart(route => {
    console.log('开始预加载:', route.path)
  })

  router.onPreloadComplete((route, duration) => {
    console.log('预加载完成:', route.path, `${duration}ms`)
    updatePreloadStats()
  })

  router.onPreloadError((route, error) => {
    console.error('预加载失败:', route.path, error)
  })
}

let visibilityObserver = null

onMounted(() => {
  visibilityObserver = setupVisibilityObserver()
  setupPreloadListeners()
  updatePreloadStats()

  // 定期更新统计
  const statsInterval = setInterval(updatePreloadStats, 5000)

  onUnmounted(() => {
    clearInterval(statsInterval)
  })
})

onUnmounted(() => {
  if (visibilityObserver) {
    visibilityObserver.disconnect()
  }
})
</script>

<template>
  <nav class="smart-nav">
    <div class="nav-section">
      <h3>重要页面（立即预加载）</h3>
      <RouterLink
        v-for="item in importantPages"
        :key="item.path"
        :to="item.path"
        class="nav-link nav-link--important"
        preload="immediate"
        @click="trackNavigation(item, 'immediate')"
      >
        <Icon :name="item.icon" />
        <span>{{ item.title }}</span>
        <span class="preload-indicator immediate">⚡</span>
      </RouterLink>
    </div>

    <div class="nav-section">
      <h3>常用页面（悬停预加载）</h3>
      <RouterLink
        v-for="item in commonPages"
        :key="item.path"
        :to="item.path"
        class="nav-link nav-link--common"
        preload="hover"
        :preload-delay="200"
        @mouseenter="onHoverStart(item)"
        @mouseleave="onHoverEnd(item)"
        @click="trackNavigation(item, 'hover')"
      >
        <Icon :name="item.icon" />
        <span>{{ item.title }}</span>
        <span class="preload-indicator hover">🎯</span>
        <div v-if="hoveringItem === item.path" class="hover-preview">
          <img :src="item.preview" :alt="item.title" />
          <p>{{ item.description }}</p>
        </div>
      </RouterLink>
    </div>

    <div class="nav-section">
      <h3>次要页面（可见时预加载）</h3>
      <RouterLink
        v-for="item in secondaryPages"
        :key="item.path"
        ref="visibleLinks"
        :to="item.path"
        class="nav-link nav-link--secondary"
        preload="visible"
        @click="trackNavigation(item, 'visible')"
      >
        <Icon :name="item.icon" />
        <span>{{ item.title }}</span>
        <span class="preload-indicator visible">👁️</span>
        <div v-if="visibleItems.includes(item.path)" class="visibility-indicator">已预加载</div>
      </RouterLink>
    </div>

    <div class="nav-section">
      <h3>归档页面（空闲时预加载）</h3>
      <RouterLink
        v-for="item in archivePages"
        :key="item.path"
        :to="item.path"
        class="nav-link nav-link--archive"
        preload="idle"
        @click="trackNavigation(item, 'idle')"
      >
        <Icon :name="item.icon" />
        <span>{{ item.title }}</span>
        <span class="preload-indicator idle">💤</span>
      </RouterLink>
    </div>

    <!-- 预加载统计 -->
    <div class="preload-stats">
      <h4>预加载统计</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">已预加载</span>
          <span class="stat-value">{{ preloadStats.loaded }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">缓存命中</span>
          <span class="stat-value">{{ preloadStats.hits }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">节省时间</span>
          <span class="stat-value">{{ preloadStats.timeSaved }}ms</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.smart-nav {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  text-decoration: none;
  color: #333;
  background: white;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.nav-link--important {
  border-left: 4px solid #f5222d;
}

.nav-link--common {
  border-left: 4px solid #1890ff;
}

.nav-link--secondary {
  border-left: 4px solid #52c41a;
}

.nav-link--archive {
  border-left: 4px solid #faad14;
}

.preload-indicator {
  margin-left: auto;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background: #f0f0f0;
}

.preload-indicator.immediate {
  background: #fff2f0;
  color: #f5222d;
}

.preload-indicator.hover {
  background: #f0f8ff;
  color: #1890ff;
}

.preload-indicator.visible {
  background: #f6ffed;
  color: #52c41a;
}

.preload-indicator.idle {
  background: #fffbe6;
  color: #faad14;
}

.hover-preview {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.hover-preview img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.hover-preview p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.visibility-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #52c41a;
  color: white;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.preload-stats {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
}

.preload-stats h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1890ff;
}
</style>
```

## 📊 预加载性能监控

```vue
<!-- components/PreloadMonitor.vue -->
<script setup>
import { useRouter } from '@ldesign/router'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'

const router = useRouter()
const isMonitoring = ref(false)
const chartCanvas = ref(null)

const preloadQueue = ref([])
const activePreloads = ref([])
const completedPreloads = ref([])
const preloadHistory = ref([])

const networkInfo = reactive({
  effectiveType: 'unknown',
  downlink: 0,
  rtt: 0,
})

// 开始/停止监控
function toggleMonitor() {
  isMonitoring.value = !isMonitoring.value

  if (isMonitoring.value) {
    startMonitoring()
  } else {
    stopMonitoring()
  }
}

// 开始监控
function startMonitoring() {
  // 监听预加载事件
  router.onPreloadStart((route, strategy) => {
    const preloadItem = {
      id: Date.now(),
      path: route.path,
      strategy,
      startTime: performance.now(),
      status: 'loading',
    }

    activePreloads.value.push(preloadItem)
    preloadHistory.value.unshift(preloadItem)

    // 限制历史记录数量
    if (preloadHistory.value.length > 50) {
      preloadHistory.value.pop()
    }
  })

  router.onPreloadComplete((route, duration, size) => {
    const item = activePreloads.value.find(p => p.path === route.path)
    if (item) {
      item.status = 'success'
      item.duration = duration
      item.size = size

      // 移动到已完成列表
      const index = activePreloads.value.indexOf(item)
      activePreloads.value.splice(index, 1)
      completedPreloads.value.push(item)

      // 更新图表
      updateChart()
    }
  })

  router.onPreloadError((route, error) => {
    const item = activePreloads.value.find(p => p.path === route.path)
    if (item) {
      item.status = 'error'
      item.error = error.message

      // 移出活跃列表
      const index = activePreloads.value.indexOf(item)
      activePreloads.value.splice(index, 1)
    }
  })

  // 更新网络信息
  updateNetworkInfo()

  // 定期更新
  monitorInterval = setInterval(() => {
    updateNetworkInfo()
    updateChart()
  }, 2000)
}

// 停止监控
let monitorInterval = null
function stopMonitoring() {
  if (monitorInterval) {
    clearInterval(monitorInterval)
    monitorInterval = null
  }
}

// 更新网络信息
function updateNetworkInfo() {
  if (navigator.connection) {
    networkInfo.effectiveType = navigator.connection.effectiveType
    networkInfo.downlink = navigator.connection.downlink
    networkInfo.rtt = navigator.connection.rtt
  }
}

// 格式化文件大小
function formatSize(bytes) {
  if (!bytes) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`
}

// 获取状态图标
function getStatusIcon(status) {
  switch (status) {
    case 'loading':
      return 'loader'
    case 'success':
      return 'check-circle'
    case 'error':
      return 'x-circle'
    default:
      return 'circle'
  }
}

// 更新性能图表
function updateChart() {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  const width = chartCanvas.value.width
  const height = chartCanvas.value.height

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  // 绘制预加载时间趋势
  const recentData = preloadHistory.value
    .filter(item => item.status === 'success')
    .slice(0, 20)
    .reverse()

  if (recentData.length < 2) return

  const maxDuration = Math.max(...recentData.map(item => item.duration))
  const stepX = width / (recentData.length - 1)

  // 绘制网格
  ctx.strokeStyle = '#f0f0f0'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const y = (height / 5) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 绘制数据线
  ctx.strokeStyle = '#1890ff'
  ctx.lineWidth = 2
  ctx.beginPath()

  recentData.forEach((item, index) => {
    const x = index * stepX
    const y = height - (item.duration / maxDuration) * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // 绘制数据点
  ctx.fillStyle = '#1890ff'
  recentData.forEach((item, index) => {
    const x = index * stepX
    const y = height - (item.duration / maxDuration) * height

    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fill()
  })
}

onMounted(() => {
  updateNetworkInfo()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<template>
  <div class="preload-monitor">
    <div class="monitor-header">
      <h3>预加载性能监控</h3>
      <button class="toggle-btn" @click="toggleMonitor">
        {{ isMonitoring ? '停止监控' : '开始监控' }}
      </button>
    </div>

    <div v-if="isMonitoring" class="monitor-content">
      <!-- 实时预加载状态 -->
      <div class="monitor-section">
        <h4>实时状态</h4>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">预加载队列</span>
            <span class="status-value">{{ preloadQueue.length }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">正在加载</span>
            <span class="status-value">{{ activePreloads.length }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">已完成</span>
            <span class="status-value">{{ completedPreloads.length }}</span>
          </div>
        </div>
      </div>

      <!-- 预加载历史 -->
      <div class="monitor-section">
        <h4>预加载历史</h4>
        <div class="preload-history">
          <div
            v-for="item in preloadHistory"
            :key="item.id"
            class="history-item"
            :class="[`history-item--${item.status}`]"
          >
            <div class="history-info">
              <span class="history-path">{{ item.path }}</span>
              <span class="history-strategy">{{ item.strategy }}</span>
            </div>
            <div class="history-metrics">
              <span class="history-duration">{{ item.duration }}ms</span>
              <span class="history-size">{{ formatSize(item.size) }}</span>
            </div>
            <div class="history-status">
              <Icon :name="getStatusIcon(item.status)" />
            </div>
          </div>
        </div>
      </div>

      <!-- 性能图表 -->
      <div class="monitor-section">
        <h4>性能趋势</h4>
        <div class="performance-chart">
          <canvas ref="chartCanvas" width="400" height="200" />
        </div>
      </div>

      <!-- 网络状况 -->
      <div class="monitor-section">
        <h4>网络状况</h4>
        <div class="network-info">
          <div class="network-item">
            <span>连接类型</span>
            <span>{{ networkInfo.effectiveType }}</span>
          </div>
          <div class="network-item">
            <span>下载速度</span>
            <span>{{ networkInfo.downlink }} Mbps</span>
          </div>
          <div class="network-item">
            <span>延迟</span>
            <span>{{ networkInfo.rtt }} ms</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preload-monitor {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.monitor-header h3 {
  margin: 0;
  color: #333;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.monitor-section {
  margin-bottom: 2rem;
}

.monitor-section h4 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 1rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.status-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.status-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.status-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1890ff;
}

.preload-history {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #d9d9d9;
}

.history-item--success {
  border-left-color: #52c41a;
}

.history-item--error {
  border-left-color: #f5222d;
}

.history-item--loading {
  border-left-color: #1890ff;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.history-path {
  font-weight: 500;
  color: #333;
}

.history-strategy {
  font-size: 0.8rem;
  color: #666;
}

.history-metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  margin-right: 1rem;
}

.history-duration,
.history-size {
  font-size: 0.8rem;
  color: #666;
}

.performance-chart {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
}

.network-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.network-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}
</style>
```

## 🎯 关键特性

### 1. 四种预加载策略

- **immediate** - 应用启动时立即预加载
- **hover** - 鼠标悬停时预加载，提供即时反馈
- **visible** - 元素可见时预加载，节省带宽
- **idle** - 浏览器空闲时预加载，不影响性能

### 2. 智能条件控制

- 根据网络状况调整策略
- 移动端优化
- 内存使用监控

### 3. 实时性能监控

- 预加载队列状态
- 加载时间统计
- 网络状况检测
- 可视化性能图表

### 4. 用户体验优化

- 悬停预览
- 可见性指示器
- 加载进度反馈
- 错误处理机制

这个示例展示了 LDesign Router 智能预加载功能的强大之处，通过合理的策略配置可以显著提升用户体验。
