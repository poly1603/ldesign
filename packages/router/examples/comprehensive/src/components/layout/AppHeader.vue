<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo 和标题 -->
      <div class="header-left">
        <RouterLink to="/" class="logo-link">
          <img src="/logo.svg" alt="LDesign" class="logo" />
          <h1 class="title">LDesign Router</h1>
        </RouterLink>
      </div>
      
      <!-- 导航菜单（桌面端） -->
      <nav v-if="!isMobile" class="header-nav">
        <RouterLink
          v-for="route in mainRoutes"
          :key="route.path"
          :to="route.path"
          class="nav-link"
          :class="{ active: isActiveRoute(route.path) }"
        >
          <Icon :name="route.meta.icon" />
          <span>{{ route.meta.title }}</span>
        </RouterLink>
      </nav>
      
      <!-- 右侧操作区 -->
      <div class="header-right">
        <!-- 设备信息显示 -->
        <div class="device-info">
          <Icon :name="deviceIcon" />
          <span class="device-text">{{ deviceType }}</span>
        </div>
        
        <!-- 性能指标 -->
        <div v-if="showPerformanceMetrics" class="performance-metrics">
          <span class="metric">
            导航: {{ performanceMetrics.averageNavigationTime }}ms
          </span>
          <span class="metric">
            内存: {{ formatMemoryUsage(performanceMetrics.memoryUsage) }}
          </span>
        </div>
        
        <!-- 用户菜单 -->
        <div class="user-menu">
          <button class="user-button" @click="toggleUserMenu">
            <Icon name="user" />
            <span v-if="!isMobile">{{ currentUser?.name || '游客' }}</span>
          </button>
          
          <!-- 用户下拉菜单 -->
          <div v-if="showUserMenu" class="user-dropdown">
            <template v-if="currentUser">
              <RouterLink to="/profile" class="dropdown-item">
                <Icon name="profile" />
                个人资料
              </RouterLink>
              <RouterLink to="/settings" class="dropdown-item">
                <Icon name="settings" />
                设置
              </RouterLink>
              <button class="dropdown-item" @click="logout">
                <Icon name="logout" />
                退出登录
              </button>
            </template>
            <template v-else>
              <RouterLink to="/login" class="dropdown-item">
                <Icon name="login" />
                登录
              </RouterLink>
              <RouterLink to="/register" class="dropdown-item">
                <Icon name="register" />
                注册
              </RouterLink>
            </template>
          </div>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <button v-if="isMobile" class="mobile-menu-button" @click="toggleMobileMenu">
          <Icon name="menu" />
        </button>
      </div>
    </div>
    
    <!-- 移动端导航菜单 -->
    <nav v-if="isMobile && showMobileMenu" class="mobile-nav">
      <RouterLink
        v-for="route in mainRoutes"
        :key="route.path"
        :to="route.path"
        class="mobile-nav-link"
        @click="closeMobileMenu"
      >
        <Icon :name="route.meta.icon" />
        <span>{{ route.meta.title }}</span>
      </RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, useDeviceRoute } from '@ldesign/router'
import Icon from '../common/Icon.vue'

// 路由相关
const router = useRouter()
const route = useRoute()
const { deviceType, isMobile } = useDeviceRoute()

// 状态管理
const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const currentUser = ref(null) // 从状态管理或 API 获取
const performanceMetrics = ref({
  averageNavigationTime: 0,
  memoryUsage: 0
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

const mainRoutes = computed(() => {
  return router.getRoutes()
    .filter(route => route.meta?.showInMenu)
    .sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0))
})

const showPerformanceMetrics = computed(() => {
  return import.meta.env.DEV && !isMobile.value
})

// 方法
const isActiveRoute = (path: string) => {
  return route.path.startsWith(path)
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const logout = () => {
  localStorage.removeItem('auth-token')
  localStorage.removeItem('user-role')
  currentUser.value = null
  showUserMenu.value = false
  router.push('/login')
}

const formatMemoryUsage = (bytes: number) => {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)}MB`
}

// 性能指标更新
const updatePerformanceMetrics = () => {
  if (router.getPerformanceMetrics) {
    const metrics = router.getPerformanceMetrics()
    performanceMetrics.value = metrics
  }
}

// 点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
  if (!target.closest('.mobile-nav') && !target.closest('.mobile-menu-button')) {
    showMobileMenu.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // 定期更新性能指标
  if (showPerformanceMetrics.value) {
    const interval = setInterval(updatePerformanceMetrics, 2000)
    onUnmounted(() => clearInterval(interval))
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 0.5rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.header-nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-color-secondary);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
  background: var(--primary-color-light);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-color-secondary);
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.performance-metrics {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.user-button:hover {
  background: var(--bg-color-secondary);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: var(--shadow);
  min-width: 150px;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-color);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: var(--bg-color-secondary);
}

.mobile-menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 0.5rem;
}

.mobile-nav {
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  padding: 1rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  text-decoration: none;
  color: var(--text-color);
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.mobile-nav-link:hover {
  background: var(--bg-color-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 0.5rem;
  }
  
  .title {
    font-size: 1rem;
  }
  
  .device-text {
    display: none;
  }
}
</style>
