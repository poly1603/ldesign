<script setup lang="ts">
import { useEngine } from '@ldesign/engine/vue'
import { computed, onMounted, ref } from 'vue'

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

  const stats = engine.getManagerStats() as any
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
    const info = engine.getManagerStats()
    engine.notifications.show({
      title: 'ℹ️ 引擎信息',
      message: `版本: ${info.version || '0.1.0'}, 环境: ${info.environment || 'development'}`,
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
</script>

<template>
  <div class="home">
    <!-- 欢迎区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          🚀 欢迎使用 Vue3 Engine
        </h1>
        <p class="hero-subtitle">
          一个强大的Vue3应用引擎，提供插件系统、中间件支持、全局管理等核心功能
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="showWelcomeNotification">
            🎉 开始体验
          </button>
          <button class="btn btn-secondary" @click="showEngineInfo">
            ℹ️ 引擎信息
          </button>
        </div>
      </div>
    </section>

    <!-- 功能特性展示 -->
    <section class="features">
      <h2 class="section-title">
        ✨ 核心功能特性
      </h2>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.id" class="feature-card">
          <div class="feature-icon">
            {{ feature.icon }}
          </div>
          <h3 class="feature-title">
            {{ feature.title }}
          </h3>
          <p class="feature-description">
            {{ feature.description }}
          </p>
          <div class="feature-actions">
            <button
              class="btn btn-sm btn-outline"
              @click="feature.action"
            >
              {{ feature.actionText }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start">
      <h2 class="section-title">
        🚀 快速开始
      </h2>
      <div class="code-example">
        <div class="code-header">
          <span class="code-title">创建引擎实例</span>
          <button class="copy-btn" @click="copyCode">
            📋 复制
          </button>
        </div>
        <pre class="code-content"><code>{{ codeExample }}</code></pre>
      </div>
    </section>

    <!-- 引擎状态 -->
    <section class="engine-status">
      <h2 class="section-title">
        📊 引擎实时状态
      </h2>
      <div class="status-grid">
        <div v-for="status in engineStatus" :key="status.key" class="status-card">
          <div class="status-header">
            <span class="status-icon">{{ status.icon }}</span>
            <span class="status-label">{{ status.label }}</span>
          </div>
          <div class="status-value">
            {{ status.value }}
          </div>
          <div class="status-description">
            {{ status.description }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.quick-start {
  margin-bottom: 3rem;
}

.code-example {
  background: #2c3e50;
  border-radius: 12px;
  overflow: hidden;
}

.code-header {
  background: #34495e;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-title {
  color: white;
  font-weight: bold;
}

.copy-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.copy-btn:hover {
  background: #2980b9;
}

.code-content {
  padding: 1.5rem;
  margin: 0;
  color: #ecf0f1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow-x: auto;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.status-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.status-icon {
  font-size: 1.5rem;
}

.status-label {
  font-weight: bold;
  color: #2c3e50;
}

.status-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.status-description {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
