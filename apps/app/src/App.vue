<template>
  <div id="app" class="app">
    <!-- 全局加载指示器 -->
    <Transition name="loading">
      <div v-if="isLoading" class="global-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </Transition>

    <!-- 主布局 -->
    <router-view v-slot="{ Component, route }">
      <Transition :name="getTransitionName(route)" mode="out-in">
        <KeepAlive :include="keepAliveComponents">
          <component :is="Component" :key="route.fullPath" />
        </KeepAlive>
      </Transition>
    </router-view>

    <!-- 性能监控面板 -->
    <PerformanceMonitor v-if="showPerformanceMonitor" />

    <!-- 全局通知 -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from '@ldesign/router'
import { useAppStore } from './stores/app'
import PerformanceMonitor from './components/PerformanceMonitor.vue'
import NotificationContainer from './components/NotificationContainer.vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// 响应式状态
const isLoading = ref(false)
const loadingText = ref('正在加载...')

// 计算属性
const showPerformanceMonitor = computed(() => appStore.showPerformanceMonitor)
const keepAliveComponents = computed(() => appStore.keepAliveComponents)

// 获取路由过渡动画名称
const getTransitionName = (currentRoute: any) => {
  // 根据路由层级决定动画类型
  const depth = currentRoute.path.split('/').length
  if (depth <= 2) return 'fade'
  if (depth === 3) return 'slide-left'
  return 'slide-up'
}

// 路由加载状态管理
router.beforeEach((to, from, next) => {
  isLoading.value = true
  loadingText.value = `正在加载 ${to.meta?.title || to.name || '页面'}...`
  next()
})

router.afterEach(() => {
  // 模拟加载延迟，让用户看到加载动画
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

// 监听路由错误
router.onError(error => {
  console.error('路由错误:', error)
  isLoading.value = false
  appStore.addNotification({
    type: 'error',
    title: '路由错误',
    message: error.message,
  })
})

// 组件挂载时的初始化
onMounted(() => {
  console.log('🎉 LDesign Router 演示应用已加载完成')

  // 初始化应用状态
  appStore.initialize()

  // 开发环境下显示性能监控
  if (import.meta.env.DEV) {
    appStore.togglePerformanceMonitor(true)
  }
})

// 监听路由变化，更新页面标题
watch(
  () => route.meta?.title,
  title => {
    if (title) {
      document.title = `${title} - LDesign Router 演示`
    }
  },
  { immediate: true }
)
</script>

<style lang="less">
.app {
  min-height: 100vh;
  position: relative;
}

// 全局加载动画
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  .loading-text {
    font-size: 16px;
    font-weight: 500;
  }
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
