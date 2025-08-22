<template>
  <div id="app" class="app">
    <!-- 顶部导航栏 -->
    <AppHeader />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 侧边导航 -->
      <AppSidebar v-if="!isMobile" />
      
      <!-- 路由视图容器 -->
      <div class="router-container">
        <!-- 面包屑导航 -->
        <AppBreadcrumb />
        
        <!-- 路由视图 -->
        <RouterView 
          :key="$route.fullPath"
          class="router-view"
          :keep-alive="true"
          :max-cache="10"
          :animation="routeAnimation"
          :animation-duration="300"
          :loading="LoadingComponent"
          :error="ErrorComponent"
          @before-enter="onRouteEnter"
          @after-enter="onRouteEntered"
          @before-leave="onRouteLeave"
          @error="onRouteError"
        />
      </div>
    </main>
    
    <!-- 底部导航（移动端） -->
    <AppBottomNav v-if="isMobile" />
    
    <!-- 全局加载指示器 -->
    <GlobalLoading v-if="isNavigating" />
    
    <!-- 全局通知 -->
    <GlobalNotification />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute, useDeviceRoute } from '@ldesign/router'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppBottomNav from './components/layout/AppBottomNav.vue'
import AppBreadcrumb from './components/layout/AppBreadcrumb.vue'
import GlobalLoading from './components/common/GlobalLoading.vue'
import GlobalNotification from './components/common/GlobalNotification.vue'
import LoadingComponent from './components/common/LoadingComponent.vue'
import ErrorComponent from './components/common/ErrorComponent.vue'

// 路由相关
const router = useRouter()
const route = useRoute()
const { deviceType, isMobile } = useDeviceRoute()

// 导航状态
const isNavigating = ref(false)

// 路由动画配置
const routeAnimation = computed(() => {
  // 根据设备类型和路由层级决定动画
  if (isMobile.value) {
    return 'slide-left'
  }
  
  // 根据路由深度决定动画方向
  const fromDepth = router.previousRoute?.matched.length || 0
  const toDepth = route.matched.length
  
  if (toDepth > fromDepth) {
    return 'slide-left' // 前进
  } else if (toDepth < fromDepth) {
    return 'slide-right' // 后退
  } else {
    return 'fade' // 同级切换
  }
})

// 路由事件处理
const onRouteEnter = () => {
  isNavigating.value = true
  console.log('🔄 路由进入:', route.path)
}

const onRouteEntered = () => {
  isNavigating.value = false
  console.log('✅ 路由进入完成:', route.path)
  
  // 更新页面标题
  if (route.meta.title) {
    document.title = `${route.meta.title} - LDesign Router 示例`
  }
}

const onRouteLeave = () => {
  console.log('👋 路由离开:', route.path)
}

const onRouteError = (error: Error) => {
  isNavigating.value = false
  console.error('❌ 路由错误:', error)
}

// 全局导航守卫
router.beforeEach((to, from, next) => {
  console.log(`🧭 导航: ${from.path} -> ${to.path}`)
  
  // 检查权限
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
    return
  }
  
  // 检查设备支持
  if (to.meta.supportedDevices && !to.meta.supportedDevices.includes(deviceType.value)) {
    next('/device-not-supported')
    return
  }
  
  next()
})

// 简单的认证检查
function isAuthenticated(): boolean {
  return localStorage.getItem('auth-token') !== null
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  color: var(--text-color);
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.router-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.router-view {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .router-view {
    padding: 0.5rem;
  }
}

/* 路由动画 */
.router-view {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 滑动动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
