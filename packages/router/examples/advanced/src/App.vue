<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { computed, onMounted, ref } from 'vue'
import FullScreenLoading from '@/components/FullScreenLoading.vue'
import PerformancePanel from '@/components/PerformancePanel.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import MinimalLayout from '@/layouts/MinimalLayout.vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式状态
const isLoading = ref(false)
const showPerformancePanel = ref(import.meta.env.DEV)

// 计算当前布局
const currentLayout = computed(() => {
  return route.meta.layout || 'default'
})

// 监听路由变化
router.beforeEach(() => {
  isLoading.value = true
})

router.afterEach(() => {
  // 延迟隐藏加载状态，让过渡动画更流畅
  setTimeout(() => {
    isLoading.value = false
  }, 100)
})

// 组件挂载时的初始化
onMounted(async () => {
  // 刷新用户信息
  if (userStore.isAuthenticated) {
    await userStore.refreshUser()
  }

  // 预加载关键路由
  if (router.preloadRoute) {
    const criticalRoutes = router
      .getRoutes()
      .filter(route => route.meta?.preload === 'immediate')

    criticalRoutes.forEach(route => {
      router.preloadRoute(route)
    })
  }

  console.log('🎉 应用初始化完成')
})

// 键盘快捷键
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    // Ctrl/Cmd + K 打开搜索
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      console.log('打开搜索功能')
    }

    // Ctrl/Cmd + / 显示快捷键帮助
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault()
      console.log('显示快捷键帮助')
    }

    // F12 切换性能面板
    if (event.key === 'F12' && import.meta.env.DEV) {
      event.preventDefault()
      showPerformancePanel.value = !showPerformancePanel.value
    }
  }

  document.addEventListener('keydown', handleKeydown)

  // 清理事件监听器
  return () => {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div id="app" class="app">
    <!-- 默认布局 -->
    <DefaultLayout v-if="currentLayout === 'default'" />

    <!-- 认证布局 -->
    <AuthLayout v-else-if="currentLayout === 'auth'" />

    <!-- 侧边栏布局 -->
    <SidebarLayout v-else-if="currentLayout === 'sidebar'" />

    <!-- 最小布局 -->
    <MinimalLayout v-else-if="currentLayout === 'minimal'" />

    <!-- 全屏加载 -->
    <FullScreenLoading v-if="isLoading" />

    <!-- 性能监控面板（开发环境） -->
    <PerformancePanel v-if="showPerformancePanel" />
  </div>
</template>

<style lang="less">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// 全局路由过渡动画
.router-view {
  position: relative;
}

// 路由过渡动画
.route-enter-active,
.route-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.route-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.route-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 淡入淡出过渡
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 滑动过渡
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

// 缩放过渡
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

// 响应式设计
@media (max-width: 768px) {
  .app {
    font-size: 14px;
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .app {
    background-color: #1a1a1a;
    color: #ffffff;
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .app {
    border: 2px solid;
  }
}

// 减少动画模式支持
@media (prefers-reduced-motion: reduce) {
  .route-enter-active,
  .route-leave-active,
  .fade-enter-active,
  .fade-leave-active,
  .slide-enter-active,
  .slide-leave-active,
  .scale-enter-active,
  .scale-leave-active {
    transition: none;
  }
}
</style>
