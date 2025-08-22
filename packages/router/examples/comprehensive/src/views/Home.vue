<template>
  <div class="home">
    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          🚀 LDesign Router
          <span class="hero-subtitle">综合功能演示</span>
        </h1>
        <p class="hero-description">
          探索现代化、高性能、类型安全的 Vue 路由器的强大功能！
        </p>
        
        <!-- 设备信息展示 -->
        <div class="device-badge">
          <Icon :name="deviceIcon" />
          <span>当前设备: {{ deviceType }}</span>
          <span class="device-size">{{ screenSize }}</span>
        </div>
        
        <!-- 快速开始按钮 -->
        <div class="hero-actions">
          <RouterLink to="/dashboard" class="btn btn-primary">
            <Icon name="dashboard" />
            查看仪表板
          </RouterLink>
          <RouterLink to="/demos" class="btn btn-secondary">
            <Icon name="demo" />
            功能演示
          </RouterLink>
        </div>
      </div>
    </section>
    
    <!-- 功能特性展示 -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">✨ 核心特性</h2>
        <div class="features-grid">
          <div
            v-for="feature in features"
            :key="feature.name"
            class="feature-card"
            @click="navigateToFeature(feature)"
          >
            <div class="feature-icon">
              <Icon :name="feature.icon" />
            </div>
            <h3 class="feature-title">{{ feature.name }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
            <div class="feature-status">
              <span :class="['status-badge', feature.status]">
                {{ getStatusText(feature.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 性能指标展示 -->
    <section v-if="showPerformanceSection" class="performance">
      <div class="container">
        <h2 class="section-title">📊 实时性能指标</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics.navigationCount }}</div>
            <div class="metric-label">页面导航次数</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics.averageNavigationTime }}ms</div>
            <div class="metric-label">平均导航时间</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ formatMemoryUsage(performanceMetrics.memoryUsage) }}</div>
            <div class="metric-label">内存使用量</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics.cacheHitRate }}%</div>
            <div class="metric-label">缓存命中率</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 快速导航 -->
    <section class="quick-nav">
      <div class="container">
        <h2 class="section-title">🧭 快速导航</h2>
        <div class="nav-grid">
          <RouterLink
            v-for="route in quickNavRoutes"
            :key="route.path"
            :to="route.path"
            class="nav-card"
            :class="{ disabled: !route.enabled }"
          >
            <div class="nav-icon">
              <Icon :name="route.meta.icon" />
            </div>
            <div class="nav-content">
              <h3 class="nav-title">{{ route.meta.title }}</h3>
              <p class="nav-description">{{ route.description }}</p>
            </div>
            <div class="nav-arrow">
              <Icon name="arrow-right" />
            </div>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useDeviceRoute } from '@ldesign/router'
import Icon from '../components/common/Icon.vue'

// 路由相关
const router = useRouter()
const { deviceType, isMobile, isTablet, isDesktop } = useDeviceRoute()

// 响应式数据
const performanceMetrics = ref({
  navigationCount: 0,
  averageNavigationTime: 0,
  memoryUsage: 0,
  cacheHitRate: 0
})

// 计算属性
const deviceIcon = computed(() => {
  switch (deviceType.value) {
    case 'mobile': return 'mobile'
    case 'tablet': return 'tablet'
    case 'desktop': return 'desktop'
    default: return 'device'
  }
})

const screenSize = computed(() => {
  return `${window.innerWidth}x${window.innerHeight}`
})

const showPerformanceSection = computed(() => {
  return import.meta.env.DEV && !isMobile.value
})

// 功能特性数据
const features = [
  {
    name: '设备适配',
    description: '智能检测设备类型，自动选择最适合的组件和布局',
    icon: 'device',
    status: 'active',
    path: '/demos/device-adaptation'
  },
  {
    name: '路由动画',
    description: '丰富的页面切换动画效果，提升用户体验',
    icon: 'animation',
    status: 'active',
    path: '/demos/animations'
  },
  {
    name: '组件缓存',
    description: '智能缓存策略，提高应用性能和响应速度',
    icon: 'cache',
    status: 'active',
    path: '/demos/caching'
  },
  {
    name: '性能监控',
    description: '实时监控路由性能，及时发现和解决问题',
    icon: 'performance',
    status: 'active',
    path: '/demos/performance'
  },
  {
    name: '预加载策略',
    description: '智能预加载机制，减少用户等待时间',
    icon: 'preload',
    status: 'active',
    path: '/demos/preloading'
  },
  {
    name: '类型安全',
    description: '完整的 TypeScript 支持，编译时错误检查',
    icon: 'typescript',
    status: 'active',
    path: '/demos/typescript'
  }
]

// 快速导航路由
const quickNavRoutes = computed(() => [
  {
    path: '/dashboard',
    meta: { title: '仪表板', icon: 'dashboard' },
    description: '查看应用概览和关键指标',
    enabled: true
  },
  {
    path: '/users',
    meta: { title: '用户管理', icon: 'users' },
    description: '管理系统用户和权限',
    enabled: isAuthenticated()
  },
  {
    path: '/products',
    meta: { title: '产品管理', icon: 'products' },
    description: '管理产品信息和分类',
    enabled: isAuthenticated()
  },
  {
    path: '/settings',
    meta: { title: '系统设置', icon: 'settings' },
    description: '配置应用参数和偏好',
    enabled: isAuthenticated()
  }
])

// 方法
const navigateToFeature = (feature: any) => {
  if (feature.path) {
    router.push(feature.path)
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '已启用'
    case 'beta': return '测试版'
    case 'coming-soon': return '即将推出'
    default: return '未知'
  }
}

const formatMemoryUsage = (bytes: number) => {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)}MB`
}

const isAuthenticated = () => {
  return localStorage.getItem('auth-token') !== null
}

const updatePerformanceMetrics = () => {
  if (router.getPerformanceMetrics) {
    const metrics = router.getPerformanceMetrics()
    performanceMetrics.value = {
      navigationCount: metrics.navigationCount || 0,
      averageNavigationTime: Math.round(metrics.averageNavigationTime || 0),
      memoryUsage: metrics.memoryUsage || 0,
      cacheHitRate: Math.round((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100) || 0
    }
  }
}

// 生命周期
onMounted(() => {
  // 定期更新性能指标
  if (showPerformanceSection.value) {
    updatePerformanceMetrics()
    setInterval(updatePerformanceMetrics, 3000)
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
  color: white;
  padding: 4rem 1rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  display: block;
  font-size: 1.5rem;
  font-weight: 400;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.hero-description {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.device-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.device-size {
  opacity: 0.8;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: white;
  color: var(--primary-color);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 3rem;
  color: var(--text-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.features {
  padding: 4rem 0;
  background: var(--bg-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--bg-color-secondary);
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.feature-description {
  color: var(--text-color-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: var(--success-color-light);
  color: var(--success-color);
}

.performance {
  padding: 4rem 0;
  background: var(--bg-color-secondary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: var(--bg-color);
  padding: 2rem;
  border-radius: 0.5rem;
  text-align: center;
  border: 1px solid var(--border-color);
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.metric-label {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.quick-nav {
  padding: 4rem 0;
}

.nav-grid {
  display: grid;
  gap: 1rem;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-color-secondary);
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}

.nav-card:hover:not(.disabled) {
  background: var(--primary-color-light);
  transform: translateX(4px);
}

.nav-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.nav-content {
  flex: 1;
}

.nav-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.nav-description {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.nav-arrow {
  color: var(--text-color-secondary);
  transition: transform 0.2s ease;
}

.nav-card:hover .nav-arrow {
  transform: translateX(4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
