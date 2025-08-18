<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  inject,
  onMounted,
  reactive,
  ref,
} from 'vue'

// 从注入中获取引擎实例
const engine = inject('engine') as any
const engineReady = ref(!!engine)

// 主题
const theme = ref<'light' | 'dark'>('light')

// 侧边栏
const sidebarCollapsed = ref(false)
const activeManager = ref('config')

// 日志
const logPanelExpanded = ref(false)
const logs = reactive<
  Array<{
    timestamp: number
    level: string
    message: string
    data?: any
  }>
>([])

// 管理器列表
const managers = [
  { key: 'config', name: '配置管理', icon: '⚙️' },
  { key: 'state', name: '状态管理', icon: '📊' },
  { key: 'events', name: '事件系统', icon: '📡' },
  { key: 'plugins', name: '插件系统', icon: '🔌' },
  { key: 'middleware', name: '中间件', icon: '🔗' },
  { key: 'environment', name: '环境检测', icon: '🌍' },
  { key: 'performance', name: '性能监控', icon: '⚡' },
  { key: 'security', name: '安全管理', icon: '🔒' },
  { key: 'notifications', name: '通知系统', icon: '🔔' },
  { key: 'errors', name: '错误处理', icon: '🚨' },
  { key: 'cache', name: '缓存管理', icon: '💾' },
  { key: 'directives', name: '指令系统', icon: '📝' },
  { key: 'logger', name: '日志系统', icon: '📋' },
  { key: 'lifecycle', name: '生命周期', icon: '🔄' },
]

// 动态组件
const currentManagerComponent = computed(() => {
  const componentName = `${activeManager.value}-demo`
  return defineAsyncComponent({
    loader: () => import(`./components/${componentName}.vue`),
    errorComponent: {
      template: `<div class="error-component">
        <h3>组件加载失败</h3>
        <p>无法加载组件: ${componentName}.vue</p>
      </div>`,
    },
    loadingComponent: {
      template: `<div class="loading-component">
        <p>正在加载组件...</p>
      </div>`,
    },
  })
})

// 方法
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  addLog('info', `切换到${theme.value === 'light' ? '亮色' : '暗色'}主题`)
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function setActiveManager(key: string) {
  activeManager.value = key
  addLog('info', `切换到${managers.find(m => m.key === key)?.name}演示`)
}

function toggleLogPanel() {
  logPanelExpanded.value = !logPanelExpanded.value
}

function addLog(level: string, message: string, data?: any) {
  logs.push({
    timestamp: Date.now(),
    level,
    message,
    data,
  })

  // 限制日志数量
  if (logs.length > 100) {
    logs.splice(0, logs.length - 100)
  }
}

function clearLogs() {
  logs.splice(0, logs.length)
  addLog('info', '日志已清空')
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 初始化引擎
async function initEngine() {
  try {
    addLog('info', '开始初始化 LDesign Engine...')

    if (engine) {
      addLog('success', 'LDesign Engine 已经初始化')

      // 展示引擎配置
      const appName = engine.config.get('app.name', 'Unknown App')
      const version = engine.config.get('app.version', '1.0.0')
      const environment = engine.config.get('environment', 'development')

      addLog('info', `应用名称: ${appName}`)
      addLog('info', `应用版本: ${version}`)
      addLog('info', `运行环境: ${environment}`)

      // 监听引擎事件
      engine.events.on('app:mounted', (data: any) => {
        addLog('success', '应用挂载完成', data)
      })

      engine.events.on('config:changed', (data: any) => {
        addLog('info', '配置已更改', data)
      })

      // 测试各种管理器
      testEngineFeatures()

      engineReady.value = true
      addLog('success', 'LDesign Engine 初始化完成')
    } else {
      addLog('error', '未找到 LDesign Engine 实例')
    }
  } catch (error) {
    addLog('error', '引擎初始化失败', error)
    console.error('Engine initialization failed:', error)
  }
}

// 测试引擎功能
function testEngineFeatures() {
  if (!engine) return

  // 测试配置管理
  engine.config.set('demo.testValue', 'Hello from LDesign Engine!')
  const testValue = engine.config.get('demo.testValue')
  addLog('info', `配置测试: ${testValue}`)

  // 测试事件系统
  engine.events.emit('demo:test', { message: '事件系统测试' })

  // 测试状态管理
  engine.state.set('demo.counter', 0)
  const counter = engine.state.get('demo.counter')
  addLog('info', `状态测试: counter = ${counter}`)

  // 测试缓存
  if (engine.cache) {
    engine.cache.set('demo.cache', {
      data: 'cached data',
      timestamp: Date.now(),
    })
    const cached = engine.cache.get('demo.cache')
    addLog('info', '缓存测试:', cached)
  }

  // 测试性能监控
  if (engine.performance) {
    engine.performance.mark('demo-start')
    setTimeout(() => {
      engine.performance.mark('demo-end')
      engine.performance.measure('demo-duration', 'demo-start', 'demo-end')
      addLog('info', '性能监控测试完成')
    }, 100)
  }

  // 测试通知系统
  if (engine.notifications) {
    engine.notifications.show({
      type: 'info',
      title: '功能测试',
      message: 'LDesign Engine 各项功能测试完成',
      duration: 3000,
    })
  }
}

// 生命周期
onMounted(() => {
  initEngine()
})
</script>

<template>
  <div class="app" :data-theme="theme">
    <!-- 顶部导航 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>🚀 LDesign Engine</h1>
          <span class="subtitle">综合功能演示</span>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary btn-sm" @click="toggleTheme">
            {{ theme === 'light' ? '🌙' : '☀️' }}
            {{ theme === 'light' ? '暗色' : '亮色' }}
          </button>

          <div class="engine-status">
            <span class="status-indicator" :class="{ active: engineReady }" />
            <span>{{ engineReady ? '引擎已就绪' : '引擎加载中...' }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="app-main">
      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <button class="btn btn-secondary btn-sm" @click="toggleSidebar">
            {{ sidebarCollapsed ? '展开' : '收起' }}
          </button>
        </div>

        <nav class="sidebar-nav">
          <div
            v-for="manager in managers"
            :key="manager.key"
            class="nav-item"
            :class="{ active: activeManager === manager.key }"
            @click="setActiveManager(manager.key)"
          >
            <span class="nav-icon">{{ manager.icon }}</span>
            <span v-if="!sidebarCollapsed" class="nav-label">{{
              manager.name
            }}</span>
          </div>
        </nav>
      </aside>

      <!-- 内容区域 -->
      <div class="content-area">
        <div v-if="!engineReady" class="loading-container">
          <div class="loading">正在初始化 LDesign Engine...</div>
        </div>

        <div v-else class="manager-demo">
          <component
            :is="currentManagerComponent"
            :engine="engine"
            @log="addLog"
          />
        </div>
      </div>
    </main>

    <!-- 日志面板 -->
    <div class="log-panel" :class="{ expanded: logPanelExpanded }">
      <div class="log-header">
        <h3>系统日志</h3>
        <div class="log-actions">
          <button class="btn btn-secondary btn-sm" @click="clearLogs">
            清空
          </button>
          <button class="btn btn-secondary btn-sm" @click="toggleLogPanel">
            {{ logPanelExpanded ? '收起' : '展开' }}
          </button>
        </div>
      </div>

      <div class="log-content">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="log-entry"
          :class="log.level"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">{{ log.level.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
          <span v-if="log.data" class="log-data">{{
            JSON.stringify(log.data)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

.app-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--box-shadow);
  z-index: 100;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) var(--spacing-lg);
    max-width: 1400px;
    margin: 0 auto;
  }

  .logo {
    h1 {
      margin: 0;
      font-size: 24px;
      background: linear-gradient(
        135deg,
        var(--primary-color),
        var(--secondary-color)
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin-left: var(--spacing-sm);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .engine-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 14px;
    color: var(--text-secondary);

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--error-color);

      &.active {
        background: var(--success-color);
      }
    }
  }
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;

  &.collapsed {
    width: 60px;
  }

  .sidebar-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
  }

  .sidebar-nav {
    padding: var(--spacing-sm);

    .nav-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-xs);
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-secondary);
      }

      &.active {
        background: linear-gradient(
          135deg,
          var(--primary-color),
          var(--secondary-color)
        );
        color: white;
      }

      .nav-icon {
        font-size: 18px;
        margin-right: var(--spacing-sm);
      }

      .nav-label {
        font-weight: 500;
      }
    }
  }
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.manager-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.log-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-dark);
  color: white;
  transition: height 0.3s ease;
  z-index: 50;

  &.expanded {
    height: 300px;
  }

  .log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    h3 {
      margin: 0;
      font-size: 16px;
    }

    .log-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .log-content {
    height: calc(100% - 60px);
    overflow-y: auto;
    padding: var(--spacing-sm) var(--spacing-lg);

    .log-entry {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
      font-family: monospace;
      font-size: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      .log-time {
        color: #888;
        min-width: 80px;
      }

      .log-level {
        min-width: 60px;
        font-weight: bold;

        &.info {
          color: var(--info-color);
        }
        &.success {
          color: var(--success-color);
        }
        &.warning {
          color: var(--warning-color);
        }
        &.error {
          color: var(--error-color);
        }
      }

      .log-message {
        flex: 1;
      }

      .log-data {
        color: #ccc;
        font-style: italic;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-header .header-content {
    padding: var(--spacing-sm) var(--spacing-md);

    .logo h1 {
      font-size: 20px;
    }

    .subtitle {
      display: none;
    }
  }

  .sidebar {
    width: 60px;

    &.collapsed {
      width: 0;
      overflow: hidden;
    }
  }

  .content-area {
    padding: var(--spacing-md);
  }

  .log-panel {
    .log-header {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .log-content {
      padding: var(--spacing-xs) var(--spacing-md);
    }
  }
}
</style>
