<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from '@ldesign/router'
import { onMounted, ref } from 'vue'

const showPerformance = ref(false)
const performanceMetrics = ref({
  navigationTime: 0,
  componentLoadTime: 0,
})

const router = useRouter()

onMounted(() => {
  // 监听性能事件
  router.afterEach((_to, _from) => {
    // 模拟性能数据收集
    performanceMetrics.value.navigationTime = Math.random() * 100
    performanceMetrics.value.componentLoadTime = Math.random() * 50
  })
})
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="navbar-brand">
        <h1>@ldesign/router 示例</h1>
      </div>
      <div class="navbar-nav">
        <RouterLink to="/" class="nav-link"> 首页 </RouterLink>
        <RouterLink to="/basic" class="nav-link"> 基础路由 </RouterLink>
        <RouterLink to="/nested" class="nav-link"> 嵌套路由 </RouterLink>
        <RouterLink to="/dynamic/123" class="nav-link"> 动态路由 </RouterLink>
        <RouterLink to="/guards" class="nav-link"> 路由守卫 </RouterLink>
        <RouterLink to="/lazy" class="nav-link"> 懒加载 </RouterLink>
        <RouterLink to="/plugins" class="nav-link"> 插件演示 </RouterLink>
      </div>
    </nav>

    <!-- 路由视图 -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- 性能监控面板 -->
    <div v-if="showPerformance" class="performance-panel">
      <h3>性能监控</h3>
      <div class="metrics">
        <div class="metric">
          <span>导航时间:</span>
          <span>{{ performanceMetrics.navigationTime }}ms</span>
        </div>
        <div class="metric">
          <span>组件加载时间:</span>
          <span>{{ performanceMetrics.componentLoadTime }}ms</span>
        </div>
      </div>
      <button @click="showPerformance = false">关闭</button>
    </div>

    <!-- 性能监控切换按钮 -->
    <button
      class="performance-toggle"
      @click="showPerformance = !showPerformance"
    >
      性能监控
    </button>
  </div>
</template>

<style lang="less">
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &-brand h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  &-nav {
    display: flex;
    gap: 1rem;
  }

  .nav-link {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    &.router-link-active {
      background: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }

    &.router-link-exact-active {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.performance-panel {
  position: fixed;
  top: 100px;
  right: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
  }

  .metrics {
    margin-bottom: 1rem;
  }

  .metric {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  button {
    background: #f56565;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;

    &:hover {
      background: #e53e3e;
    }
  }
}

.performance-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: #3182ce;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(66, 153, 225, 0.4);
  }
}

// 路由动画
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

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
