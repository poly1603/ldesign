import { defineComponent, onMounted, ref } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useEngine } from '@ldesign/engine/vue'
import './App.less'

export default defineComponent({
  name: 'App',
  setup() {
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
        try {
          // 获取各个管理器的统计信息
          const pluginStats = engine.plugins?.getStats?.() || { total: 0 }
          const eventStats = engine.events?.getStats?.() || { totalEvents: 0 }
          const cacheStats = engine.cache?.getStats?.() || { hitRate: 0 }

          engineStats.value = {
            plugins: pluginStats.total || 0,
            middleware: eventStats.totalEvents || 0,
            cacheHitRate: Math.round(cacheStats.hitRate || 0),
            performanceScore: 85, // 模拟性能分数
          }
        } catch (error) {
          console.warn('获取引擎统计信息失败:', error)
          // 使用默认值
          engineStats.value = {
            plugins: 0,
            middleware: 0,
            cacheHitRate: 0,
            performanceScore: 0,
          }
        }
      }
    }

    // 组件挂载后开始监控
    onMounted(() => {
      updateEngineStats()
      // 每秒更新一次统计信息
      setInterval(updateEngineStats, 1000)
    })

    return () => (
      <div id="app">
        {/* 导航栏 */}
        <nav class="navbar">
          <div class="nav-brand">
            🚀 Vue3 Engine 演示
          </div>
          <div class="nav-links">
            <RouterLink to="/" class="nav-link">
              首页
            </RouterLink>
            <RouterLink to="/plugins" class="nav-link">
              插件系统
            </RouterLink>
            <RouterLink to="/middleware" class="nav-link">
              中间件
            </RouterLink>
            <RouterLink to="/state" class="nav-link">
              状态管理
            </RouterLink>
            <RouterLink to="/cache" class="nav-link">
              缓存系统
            </RouterLink>
            <RouterLink to="/performance" class="nav-link">
              性能监控
            </RouterLink>
            <RouterLink to="/security" class="nav-link">
              安全防护
            </RouterLink>
            <RouterLink to="/notifications" class="nav-link">
              通知系统
            </RouterLink>
            <RouterLink to="/events" class="nav-link">
              事件系统
            </RouterLink>
            <RouterLink to="/errors" class="nav-link">
              错误处理
            </RouterLink>
            <RouterLink to="/logs" class="nav-link">
              日志系统
            </RouterLink>
            <RouterLink to="/optimization" class="nav-link">
              性能优化
            </RouterLink>
          </div>
        </nav>

        {/* 主要内容区域 */}
        <main class="main-content">
          <RouterView />
        </main>

        {/* 引擎状态栏 */}
        <div class="engine-status">
          <span class="status-item">
            🔌 插件: {engineStats.value.plugins}
          </span>
          <span class="status-item">
            🔄 中间件: {engineStats.value.middleware}
          </span>
          <span class="status-item">
            📊 缓存命中率: {engineStats.value.cacheHitRate}%
          </span>
          <span class="status-item">
            ⚡ 性能评分: {engineStats.value.performanceScore}
          </span>
        </div>
      </div>
    )
  },
})
