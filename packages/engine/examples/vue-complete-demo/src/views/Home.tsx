import { defineComponent, computed, onMounted, ref } from 'vue'
import { useEngine } from '@ldesign/engine/vue'
import './Home.less'

export default defineComponent({
  name: 'Home',
  setup() {
    // 使用引擎组合式API
    const engine = useEngine()

    // 功能特性列表
    const features = ref([
      {
        id: 'plugins',
        icon: '🔌',
        title: '插件系统',
        description: '强大的插件架构，支持热重载、依赖管理、生命周期钩子',
        actionText: '查看插件',
        action: () => showFeatureDemo('plugins'),
      },
      {
        id: 'middleware',
        icon: '🔄',
        title: '中间件系统',
        description: '灵活的中间件机制，支持请求处理、错误捕获、性能监控',
        actionText: '查看中间件',
        action: () => showFeatureDemo('middleware'),
      },
      {
        id: 'state',
        icon: '📊',
        title: '状态管理',
        description: '响应式状态管理，支持嵌套状态、状态监听、状态持久化',
        actionText: '查看状态',
        action: () => showFeatureDemo('state'),
      },
      {
        id: 'cache',
        icon: '💾',
        title: '缓存系统',
        description: '智能缓存策略，支持LRU、LFU、TTL等多种缓存算法',
        actionText: '查看缓存',
        action: () => showFeatureDemo('cache'),
      },
      {
        id: 'performance',
        icon: '⚡',
        title: '性能监控',
        description: '实时性能监控，支持性能指标、性能报告、性能优化建议',
        actionText: '查看性能',
        action: () => showFeatureDemo('performance'),
      },
      {
        id: 'security',
        icon: '🔒',
        title: '安全防护',
        description: '全面的安全防护，支持XSS防护、CSRF防护、CSP策略',
        actionText: '查看安全',
        action: () => showFeatureDemo('security'),
      },
      {
        id: 'events',
        icon: '📡',
        title: '事件系统',
        description: '强大的事件发布订阅系统，支持事件统计和性能监控',
        actionText: '查看事件',
        action: () => showFeatureDemo('events'),
      },
      {
        id: 'optimization',
        icon: '🚀',
        title: '性能优化',
        description: '批处理器、对象池、防抖节流等性能优化工具',
        actionText: '查看优化',
        action: () => showFeatureDemo('optimization'),
      },
    ])

    // 代码示例
    const codeExample = ref(`import { createEngine, presets } from '@ldesign/engine'

// 创建引擎实例
const engine = createEngine(presets.development())

// 注册插件
engine.use(myPlugin)

// 使用中间件
engine.middleware.use(loggingMiddleware)

// 创建Vue应用
const app = engine.createApp(App)
app.mount('#app')`)

    // 引擎状态信息
    const engineStatus = computed(() => {
      if (!engine)
        return []

      try {
        // 安全地获取各个管理器的统计信息
        const pluginStats = engine.plugins?.getStats?.() || { total: 0 }
        const cacheStats = engine.cache?.getStats?.() || { hits: 0, total: 1 }
        const stats = {
          plugins: pluginStats,
          middleware: { total: 3 }, // 模拟中间件数量
          cache: cacheStats,
          performance: { score: 85 }, // 模拟性能分数
        }
        return [
          {
            key: 'plugins',
            icon: '🔌',
            label: '已加载插件',
            value: stats.plugins?.total || 0,
            description: '当前运行的插件数量',
          },
          {
            key: 'middleware',
            icon: '🔄',
            label: '已注册中间件',
            value: stats.middleware?.total || 0,
            description: '当前注册的中间件数量',
          },
          {
            key: 'cache',
            icon: '💾',
            label: '缓存命中率',
            value: `${Math.round((stats.cache?.hits || 0) / (stats.cache?.total || 1) * 100)}%`,
            description: '缓存系统的效率指标',
          },
          {
            key: 'performance',
            icon: '⚡',
            label: '性能评分',
            value: Math.round(stats.performance?.score || 0),
            description: '应用性能综合评分',
          },
        ]
      } catch (error) {
        console.warn('获取引擎状态失败:', error)
        return [
          { key: 'plugins', icon: '🔌', label: '已加载插件', value: 0, description: '当前运行的插件数量' },
          { key: 'middleware', icon: '🔄', label: '已注册中间件', value: 0, description: '当前注册的中间件数量' },
          { key: 'cache', icon: '💾', label: '缓存命中率', value: '0%', description: '缓存系统的效率指标' },
          { key: 'performance', icon: '⚡', label: '性能评分', value: 0, description: '应用性能综合评分' },
        ]
      }
    })

    // 显示欢迎通知
    function showWelcomeNotification() {
      if (engine?.notifications) {
        engine.notifications.show({
          title: '🎉 欢迎使用 Vue3 Engine!',
          message: '开始探索引擎的强大功能吧！',
          type: 'success',
          duration: 5000,
        })
      }
    }

    // 显示引擎信息
    function showEngineInfo() {
      if (engine?.notifications) {
        engine.notifications.show({
          title: 'ℹ️ 引擎信息',
          message: `版本: 0.1.0, 环境: development`,
          type: 'info',
          duration: 4000,
        })
      }
    }

    // 显示功能演示
    function showFeatureDemo(feature: string) {
      if (engine?.notifications) {
        engine.notifications.show({
          title: `✨ ${features.value.find(f => f.id === feature)?.title}`,
          message: '正在跳转到功能演示页面...',
          type: 'info',
          duration: 3000,
        })

        // 延迟跳转
        setTimeout(() => {
          window.location.hash = `#/${feature}`
        }, 1000)
      }
    }

    // 复制代码
    async function copyCode() {
      try {
        await navigator.clipboard.writeText(codeExample.value)
        if (engine?.notifications) {
          engine.notifications.show({
            title: '📋 复制成功',
            message: '代码已复制到剪贴板',
            type: 'success',
            duration: 2000,
          })
        }
      }
      catch (error) {
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 复制失败',
            message: '无法复制代码到剪贴板',
            type: 'error',
            duration: 3000,
          })
        }
      }
    }

    // 组件挂载后显示欢迎通知
    onMounted(() => {
      setTimeout(showWelcomeNotification, 1000)
    })

    return () => (
      <div class="home">
        {/* 欢迎区域 */}
        <section class="hero">
          <div class="hero-content">
            <h1 class="hero-title">
              🚀 欢迎使用 Vue3 Engine
            </h1>
            <p class="hero-subtitle">
              一个强大的Vue3应用引擎，提供插件系统、中间件支持、全局管理等核心功能
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary" onClick={showWelcomeNotification}>
                🎉 开始体验
              </button>
              <button class="btn btn-secondary" onClick={showEngineInfo}>
                ℹ️ 引擎信息
              </button>
            </div>
          </div>
        </section>

        {/* 功能特性展示 */}
        <section class="features">
          <h2 class="section-title">
            ✨ 核心功能特性
          </h2>
          <div class="features-grid">
            {features.value.map(feature => (
              <div key={feature.id} class="feature-card">
                <div class="feature-icon">
                  {feature.icon}
                </div>
                <h3 class="feature-title">
                  {feature.title}
                </h3>
                <p class="feature-description">
                  {feature.description}
                </p>
                <div class="feature-actions">
                  <button
                    class="btn btn-sm btn-outline"
                    onClick={feature.action}
                  >
                    {feature.actionText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 快速开始 */}
        <section class="quick-start">
          <h2 class="section-title">
            🚀 快速开始
          </h2>
          <div class="code-example">
            <div class="code-header">
              <span class="code-title">创建引擎实例</span>
              <button class="copy-btn" onClick={copyCode}>
                📋 复制
              </button>
            </div>
            <pre class="code-content">
              <code>{codeExample.value}</code>
            </pre>
          </div>
        </section>

        {/* 引擎状态 */}
        <section class="engine-status-section">
          <h2 class="section-title">
            📊 引擎实时状态
          </h2>
          <div class="status-grid">
            {engineStatus.value.map(status => (
              <div key={status.key} class="status-card">
                <div class="status-header">
                  <span class="status-icon">{status.icon}</span>
                  <span class="status-label">{status.label}</span>
                </div>
                <div class="status-value">
                  {status.value}
                </div>
                <div class="status-description">
                  {status.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  },
})
