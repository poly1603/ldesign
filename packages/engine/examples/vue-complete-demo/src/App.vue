<script setup lang="ts">
import { useEngine } from '@ldesign/engine/vue'
import { onMounted, ref } from 'vue'

// 使用引擎组合式API
const engine = useEngine()

// 引擎统计信息
const engineStats = ref({
  plugins: 0,
  middleware: 0,
  cacheHitRate: 0,
  performanceScore: 0,
})

// 更新引擎统计信息
function updateEngineStats() {
  if (engine) {
    const stats = engine.getManagerStats() as any
    engineStats.value = {
      plugins: stats.plugins?.total || 0,
      middleware: stats.middleware?.total || 0,
      cacheHitRate: Math.round((stats.cache?.hits || 0) / (stats.cache?.total || 1) * 100),
      performanceScore: Math.round(stats.performance?.score || 0),
    }
  }
}

// 组件挂载后开始监控
onMounted(() => {
  updateEngineStats()
  // 每秒更新一次统计信息
  setInterval(updateEngineStats, 1000)
})
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-brand">
        🚀 Vue3 Engine 演示
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">
          首页
        </router-link>
        <router-link to="/plugins" class="nav-link">
          插件系统
        </router-link>
        <router-link to="/middleware" class="nav-link">
          中间件
        </router-link>
        <router-link to="/state" class="nav-link">
          状态管理
        </router-link>
        <router-link to="/cache" class="nav-link">
          缓存系统
        </router-link>
        <router-link to="/performance" class="nav-link">
          性能监控
        </router-link>
        <router-link to="/security" class="nav-link">
          安全防护
        </router-link>
        <router-link to="/notifications" class="nav-link">
          通知系统
        </router-link>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 引擎状态栏 -->
    <div class="engine-status">
      <span class="status-item">
        🔌 插件: {{ engineStats.plugins }}
      </span>
      <span class="status-item">
        🔄 中间件: {{ engineStats.middleware }}
      </span>
      <span class="status-item">
        📊 缓存命中率: {{ engineStats.cacheHitRate }}%
      </span>
      <span class="status-item">
        ⚡ 性能评分: {{ engineStats.performanceScore }}
      </span>
    </div>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
}

.engine-status {
  background: #2c3e50;
  color: white;
  padding: 0.5rem 2rem;
  display: flex;
  justify-content: space-around;
  font-size: 0.9rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .engine-status {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
