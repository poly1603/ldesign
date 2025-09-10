<template>
  <div id="app" class="app">
    <!-- 应用头部导航 -->
    <AppHeader />
    
    <!-- 主要内容区域 -->
    <main class="app-main">
      <!-- 侧边导航 -->
      <AppSidebar />
      
      <!-- 路由视图容器 -->
      <div class="app-content">
        <!-- 面包屑导航 -->
        <AppBreadcrumb />
        
        <!-- 路由视图 - 这里展示路由匹配的组件 -->
        <RouterView 
          v-slot="{ Component, route }"
          class="router-view"
        >
          <!-- 路由过渡动画 -->
          <Transition 
            :name="getTransitionName(route)"
            mode="out-in"
            appear
          >
            <!-- 错误边界包装 -->
            <ErrorBoundary :key="route.fullPath">
              <!-- 保持活跃的组件缓存 -->
              <KeepAlive :max="10">
                <component 
                  :is="Component" 
                  :key="route.fullPath"
                />
              </KeepAlive>
            </ErrorBoundary>
          </Transition>
        </RouterView>
      </div>
    </main>
    
    <!-- 应用底部 -->
    <AppFooter />
    
    <!-- 全局加载指示器 -->
    <LoadingIndicator v-if="isLoading" />
    
    <!-- 全局通知容器 -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from '@ldesign/router'
import { ErrorBoundary } from '@ldesign/router'

// 导入组件
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppBreadcrumb from './components/layout/AppBreadcrumb.vue'
import AppFooter from './components/layout/AppFooter.vue'
import LoadingIndicator from './components/common/LoadingIndicator.vue'
import NotificationContainer from './components/common/NotificationContainer.vue'

/**
 * 应用根组件
 * 
 * 功能特性：
 * 1. 响应式布局结构
 * 2. 路由过渡动画
 * 3. 错误边界处理
 * 4. 组件缓存管理
 * 5. 全局状态管理
 */

// 获取当前路由信息
const route = useRoute()

// 全局加载状态
const isLoading = ref(false)

/**
 * 根据路由配置获取过渡动画名称
 * @param route 当前路由对象
 * @returns 过渡动画名称
 */
const getTransitionName = (route: any) => {
  // 从路由元信息中获取动画配置
  const transition = route.meta?.transition
  
  if (typeof transition === 'string') {
    return transition
  }
  
  if (typeof transition === 'object') {
    return transition.name || 'fade'
  }
  
  // 默认动画
  return 'fade'
}

// 应用标题（响应式）
const appTitle = computed(() => {
  const title = route.meta?.title
  return title ? `${title} - @ldesign/router Examples` : '@ldesign/router Examples'
})

// 监听路由变化，更新页面标题
import { watch } from 'vue'
watch(appTitle, (newTitle) => {
  document.title = newTitle
}, { immediate: true })
</script>

<style lang="less" scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.app-main {
  flex: 1;
  display: flex;
  min-height: 0; // 重要：确保 flex 子项可以收缩
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // 重要：防止内容溢出
  background-color: #fff;
  margin: var(--ls-margin-base);
  .border-radius();
  .box-shadow();
}

.router-view {
  flex: 1;
  padding: var(--ls-padding-base);
  overflow-y: auto;
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

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
}

// 响应式设计
.mobile({
  .app-main {
    flex-direction: column;
  }
  
  .app-content {
    margin: var(--ls-margin-sm);
  }
  
  .router-view {
    padding: var(--ls-padding-sm);
  }
});
</style>
