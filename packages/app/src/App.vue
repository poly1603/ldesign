<template>
  <div id="app" class="ldesign-app">
    <!-- 水印组件 -->
    <!-- <Watermark
      v-if="showWatermark"
      :text="watermarkText"
      :options="watermarkOptions"
    /> -->
    
    <!-- 路由视图 -->
    <router-view v-slot="{ Component, route }">
      <transition
        :name="route.meta?.transition || 'fade'"
        mode="out-in"
        appear
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    
    <!-- 全局通知 -->
    <LNotificationContainer />
    
    <!-- 全局加载指示器 -->
    <LGlobalLoading v-if="globalLoading" />
    
    <!-- 错误边界 -->
    <LErrorBoundary>
      <template #fallback="{ error, retry }">
        <div class="error-fallback">
          <h2>应用出现错误</h2>
          <p>{{ error.message }}</p>
          <button @click="retry">重试</button>
        </div>
      </template>
    </LErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEngine } from '@ldesign/engine/vue'
// import { useWatermark } from '@ldesign/watermark/vue'
import { useGlobalState } from './stores/global'
// import { Watermark } from '@ldesign/watermark/vue'
import LNotificationContainer from './components/LNotificationContainer.vue'
import LGlobalLoading from './components/LGlobalLoading.vue'
import LErrorBoundary from './components/LErrorBoundary.vue'

// 使用引擎
const engine = useEngine()

// 使用全局状态
const globalStore = useGlobalState()

// 水印配置
// const {
//   showWatermark,
//   watermarkText,
//   watermarkOptions
// } = useWatermark()

// 全局加载状态
const globalLoading = computed(() => globalStore.loading)

// 组件挂载时的初始化
onMounted(async () => {
  try {
    // 初始化应用
    await globalStore.initialize()
    
    // 记录应用启动日志
    engine.logger.info('App component mounted successfully')
    
    // 发送应用启动事件
    engine.events.emit('app:mounted')
  } catch (error) {
    engine.logger.error('Failed to initialize app:', error)
    engine.notifications.show({
      type: 'error',
      title: '初始化失败',
      message: '应用初始化过程中出现错误，请刷新页面重试'
    })
  }
})
</script>

<style lang="less">
.ldesign-app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  
  // 路由过渡动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.3s ease;
  }
  
  .slide-enter-from {
    transform: translateX(100%);
  }
  
  .slide-leave-to {
    transform: translateX(-100%);
  }
  
  // 错误回退样式
  .error-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 20px;
    text-align: center;
    
    h2 {
      color: #ff4757;
      margin-bottom: 16px;
    }
    
    p {
      color: #666;
      margin-bottom: 24px;
      max-width: 500px;
    }
    
    button {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background: #0056b3;
      }
    }
  }
}
</style>
