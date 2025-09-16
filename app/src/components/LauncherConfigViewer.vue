<template>
  <div class="launcher-config-viewer">
    <div class="config-header">
      <h3>🚀 LDesign Launcher 配置</h3>
      <div class="environment-badge" :class="`env-${environment}`">
        {{ environment }}
      </div>
    </div>

    <div class="config-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
        class="tab-button"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="config-content">
      <!-- 基本信息 -->
      <div v-if="activeTab === 'basic'" class="config-section">
        <div class="info-grid">
          <div class="info-item">
            <label>环境</label>
            <span class="value">{{ environment }}</span>
          </div>
          <div class="info-item">
            <label>启动命令</label>
            <span class="value">{{ command }}</span>
          </div>
          <div class="info-item">
            <label>启动时间</label>
            <span class="value">{{ startTime }}</span>
          </div>
          <div class="info-item">
            <label>服务器端口</label>
            <span class="value">{{ serverInfo.port }}</span>
          </div>
          <div class="info-item">
            <label>服务器地址</label>
            <span class="value">{{ serverInfo.host }}</span>
          </div>
          <div class="info-item">
            <label>HTTPS</label>
            <span class="value">{{ serverInfo.https ? '是' : '否' }}</span>
          </div>
        </div>
      </div>

      <!-- 代理配置 -->
      <div v-if="activeTab === 'proxy'" class="config-section">
        <div v-if="proxyConfig" class="proxy-list">
          <div v-for="(proxy, key) in proxyConfig" :key="key" class="proxy-item">
            <h4>{{ getProxyTitle(key) }}</h4>
            <div class="proxy-details">
              <div v-if="proxy.target" class="proxy-field">
                <label>目标地址:</label>
                <span>{{ proxy.target }}</span>
              </div>
              <div v-if="proxy.pathPrefix" class="proxy-field">
                <label>路径前缀:</label>
                <span>{{ proxy.pathPrefix }}</span>
              </div>
              <div v-if="proxy.timeout" class="proxy-field">
                <label>超时时间:</label>
                <span>{{ proxy.timeout }}ms</span>
              </div>
              <div v-if="proxy.headers" class="proxy-field">
                <label>请求头:</label>
                <div class="headers-list">
                  <div v-for="(value, header) in proxy.headers" :key="header" class="header-item">
                    <code>{{ header }}: {{ value }}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-config">
          未配置代理
        </div>
      </div>

      <!-- 完整配置 -->
      <div v-if="activeTab === 'full'" class="config-section">
        <pre class="config-json">{{ JSON.stringify(fullConfig, null, 2) }}</pre>
      </div>
    </div>

    <div class="config-actions">
      <button @click="refreshConfig" class="refresh-btn">
        🔄 刷新配置
      </button>
      <button @click="copyConfig" class="copy-btn">
        📋 复制配置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Props
interface Props {
  autoRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: false
})

// 响应式数据
const activeTab = ref('basic')
const fullConfig = ref<any>({})
const environment = ref('development')
const command = ref('serve')
const startTime = ref('')
const serverInfo = ref({ port: 3011, host: 'localhost', https: false })
const refreshInterval = ref<number | null>(null)

// 标签页配置
const tabs = [
  { key: 'basic', label: '基本信息' },
  { key: 'proxy', label: '代理配置' },
  { key: 'full', label: '完整配置' }
]

// 计算属性
const proxyConfig = computed(() => {
  return fullConfig.value?.proxy || null
})

// 方法
const getProxyTitle = (key: string) => {
  const titles: Record<string, string> = {
    api: 'API 服务',
    assets: '静态资源',
    websocket: 'WebSocket',
    upload: '上传服务',
    custom: '自定义规则',
    global: '全局配置'
  }
  return titles[key] || key
}

const refreshConfig = async () => {
  try {
    if (window.__LDESIGN_LAUNCHER__) {
      const config = await window.__LDESIGN_LAUNCHER__.getFullConfig()
      fullConfig.value = config.config || {}
      environment.value = config.environment || 'development'
      startTime.value = new Date(config.timestamp).toLocaleString()
      serverInfo.value = config.server || serverInfo.value
    }
  } catch (error) {
    console.error('刷新配置失败:', error)
  }
}

const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(fullConfig.value, null, 2))
    alert('配置已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制')
  }
}

// 生命周期
onMounted(async () => {
  // 等待客户端工具加载
  const checkLauncher = () => {
    if (window.__LDESIGN_LAUNCHER__) {
      environment.value = window.__LDESIGN_LAUNCHER__.getEnvironment()
      command.value = window.__LDESIGN_LAUNCHER__.getCommand()
      startTime.value = new Date(window.__LDESIGN_LAUNCHER__.getTimestamp()).toLocaleString()
      refreshConfig()
    } else {
      setTimeout(checkLauncher, 100)
    }
  }
  
  checkLauncher()
})

// 自动刷新功能
const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }

  refreshInterval.value = setInterval(() => {
    if (props.autoRefresh) {
      refreshConfig()
      console.log('🔄 Launcher 配置已自动刷新')
    }
  }, 3000) // 每3秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 监听 autoRefresh 属性变化
watch(() => props.autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}, { immediate: true })

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="less">
.launcher-config-viewer {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-base);
  box-shadow: var(--ldesign-shadow-1);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-margin-base);
  
  h3 {
    margin: 0;
    color: var(--ldesign-text-color-primary);
  }
}

.environment-badge {
  padding: 4px 12px;
  border-radius: var(--ls-border-radius-sm);
  font-size: var(--ls-font-size-xs);
  font-weight: 500;
  text-transform: uppercase;
  
  &.env-development {
    background: var(--ldesign-success-color-2);
    color: var(--ldesign-success-color-7);
  }
  
  &.env-production {
    background: var(--ldesign-error-color-2);
    color: var(--ldesign-error-color-7);
  }
  
  &.env-staging {
    background: var(--ldesign-warning-color-2);
    color: var(--ldesign-warning-color-7);
  }
}

.config-tabs {
  display: flex;
  border-bottom: 1px solid var(--ldesign-border-level-1-color);
  margin-bottom: var(--ls-margin-base);
}

.tab-button {
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border: none;
  background: none;
  cursor: pointer;
  color: var(--ldesign-text-color-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--ldesign-text-color-primary);
  }
  
  &.active {
    color: var(--ldesign-brand-color);
    border-bottom-color: var(--ldesign-brand-color);
  }
}

.config-content {
  min-height: 300px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ls-spacing-base);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  label {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    font-weight: 500;
  }
  
  .value {
    color: var(--ldesign-text-color-primary);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
}

.proxy-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
}

.proxy-item {
  padding: var(--ls-padding-base);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  
  h4 {
    margin: 0 0 var(--ls-margin-sm) 0;
    color: var(--ldesign-brand-color);
  }
}

.proxy-details {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
}

.proxy-field {
  display: flex;
  gap: var(--ls-spacing-sm);
  
  label {
    min-width: 80px;
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
  }
  
  span {
    color: var(--ldesign-text-color-primary);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
}

.headers-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-item code {
  background: var(--ldesign-bg-color-component);
  padding: 2px 6px;
  border-radius: var(--ls-border-radius-sm);
  font-size: var(--ls-font-size-xs);
}

.config-json {
  background: var(--ldesign-bg-color-component);
  padding: var(--ls-padding-base);
  border-radius: var(--ls-border-radius-base);
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--ls-font-size-xs);
  line-height: 1.5;
  color: var(--ldesign-text-color-primary);
}

.no-config {
  text-align: center;
  color: var(--ldesign-text-color-placeholder);
  padding: var(--ls-padding-xl);
}

.config-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
  margin-top: var(--ls-margin-base);
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-level-1-color);
}

.refresh-btn,
.copy-btn {
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--ldesign-brand-color);
    color: var(--ldesign-brand-color);
  }
}
</style>
