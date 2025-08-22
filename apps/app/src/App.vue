<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { RouterView, useRoute, useRouter } from '@ldesign/router'
import { computed, onMounted, ref, watch } from 'vue'
import NotificationContainer from './components/NotificationContainer.vue'
import { useAppStore } from './stores/app'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { t } = useI18n()

// 响应式状态
const isLoading = ref(false)
const loadingText = ref(t('welcome'))

// 计算属性
const keepAliveComponents = computed(() => appStore.keepAliveComponents)

// 获取路由过渡动画名称
function getTransitionName(currentRoute: any) {
  // 根据路由层级决定动画类型
  const path = currentRoute?.path || '/'
  const depth = path.split('/').length
  if (depth <= 2)
    return 'fade'
  if (depth === 3)
    return 'slide-left'
  return 'slide-up'
}

// 路由加载状态管理和认证守卫
router.beforeEach((to, _from, next) => {
  isLoading.value = true
  loadingText.value = `正在加载 ${
    to.meta?.title || String(to.name) || '页面'
  }...`

  // 检查是否需要认证
  if (to.meta?.requiresAuth) {
    // 获取认证状态
    const authData = localStorage.getItem('app_auth')
    let isAuthenticated = false

    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        isAuthenticated = parsed.isAuthenticated
      }
      catch (error) {
        console.error('解析认证数据失败:', error)
      }
    }

    if (!isAuthenticated) {
      console.warn('用户未认证，重定向到登录页面')
      isLoading.value = false
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  next()
})

router.afterEach(() => {
  // 模拟加载延迟，让用户看到加载动画
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

// 监听路由错误
router.onError((error) => {
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
})

// 监听路由变化，更新页面标题
watch(
  () => route.value?.meta?.title,
  (title) => {
    if (title) {
      document.title = `${title} - LDesign Router 演示`
    }
  },
  { immediate: true },
)
</script>

<template>
  <div id="app" class="app">
    <!-- 全局加载指示器 -->
    <Transition name="loading">
      <div v-if="isLoading" class="global-loading">
        <div class="loading-spinner" />
        <div class="loading-text">
          {{ t('welcome') }}
        </div>
      </div>
    </Transition>

    <!-- 主布局 -->
    <RouterView v-slot="{ Component, route }">
      <Transition :name="getTransitionName(route)" mode="out-in">
        <KeepAlive :include="keepAliveComponents">
          <component :is="Component" :key="route.fullPath" />
        </KeepAlive>
      </Transition>
    </RouterView>

    <!-- 全局通知 -->
    <NotificationContainer />
  </div>
</template>

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
