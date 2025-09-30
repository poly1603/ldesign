<template>
  <div class="node-manager">
    <div class="page-header">
      <h1>Node.js 管理</h1>
      <div class="header-actions">
        <button class="action-btn" @click="refreshData" :disabled="loading">
          <RefreshCw :size="18" :class="{ spinning: loading }" />
          <span>刷新</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <Loader2 :size="48" class="loading-spinner" />
      <p>正在加载 Node.js 信息...</p>
    </div>

    <!-- NVM 未安装 -->
    <div v-else-if="!nvmStatus.installed" class="nvm-install-section">
      <NvmInstaller :platform="nvmStatus.platform" @installed="handleNvmInstalled" />
    </div>

    <!-- Node 版本管理 -->
    <div v-else class="node-versions">
      <!-- 当前版本信息 -->
      <div class="current-version-card">
        <h2>
          <CheckCircle :size="20" />
          <span>当前版本</span>
        </h2>
        <div class="version-info">
          <div class="version-number">{{ nodeVersions.current || 'N/A' }}</div>
          <div class="version-status">
            <span class="status-dot active"></span>
            <span>正在使用</span>
          </div>
        </div>
      </div>

      <!-- 已安装版本 -->
      <div class="installed-versions-card">
        <h2>
          <Download :size="20" />
          <span>已安装版本</span>
        </h2>
        <div v-if="nodeVersions.installed.length === 0" class="empty-state">
          <p>暂无已安装的版本</p>
        </div>
        <div v-else class="versions-grid">
          <div 
            v-for="version in nodeVersions.installed" 
            :key="version"
            class="version-item"
            :class="{ active: version === nodeVersions.current }"
          >
            <div class="version-info">
              <div class="version-number">{{ version }}</div>
              <div class="version-actions">
                <button 
                  v-if="version !== nodeVersions.current"
                  class="switch-btn"
                  @click="switchVersion(version)"
                  :disabled="switching"
                >
                  切换
                </button>
                <span v-else class="current-badge">当前</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安装新版本 -->
      <div class="install-version-card">
        <h2>
          <CircleIcon :size="20" />
          <span>安装新版本</span>
        </h2>
        <div class="install-form">
          <div class="input-group">
            <input
              v-model="newVersionInput"
              type="text"
              placeholder="输入版本号，如: 18.17.0 或 lts"
              class="version-input"
            />
            <button
              class="install-version-btn"
              @click="installVersion"
              :disabled="!newVersionInput.trim() || installing"
            >
              <Loader2 v-if="installing" :size="16" class="spinner" />
              <Download v-else :size="16" />
              <span v-if="installing">安装中...</span>
              <span v-else>安装</span>
            </button>
          </div>
          <div class="install-tips">
            <p>💡 提示：</p>
            <ul>
              <li>可以输入具体版本号，如: <code>18.17.0</code></li>
              <li>可以使用别名，如: <code>lts</code>, <code>latest</code></li>
              <li>安装完成后会自动切换到新版本</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-section">
      <XCircle :size="48" class="error-icon" />
      <h3>操作失败</h3>
      <p>{{ error }}</p>
      <button @click="clearError" class="retry-btn">确定</button>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-section">
      <CheckCircle :size="48" class="success-icon" />
      <h3>操作成功</h3>
      <p>{{ successMessage }}</p>
      <button @click="clearSuccess" class="ok-btn">确定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RefreshCw, Loader2, CheckCircle, XCircle, Download, Circle as CircleIcon } from 'lucide-vue-next'
import NvmInstaller from '../components/NvmInstaller.vue'
import { useApi } from '../composables/useApi'
import { useWebSocket } from '../composables/useWebSocket'

// 响应式数据
const loading = ref(true)
const installing = ref(false)
const switching = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const installingVersion = ref<string | null>(null)
const versionFilter = ref<'lts' | 'latest' | 'all'>('lts')
const newVersionInput = ref('')

// NVM 状态
const nvmStatus = ref({
  installed: false,
  version: null,
  platform: 'unknown'
})

// Node 版本信息
const nodeVersions = ref({
  installed: [] as string[],
  current: null as string | null,
  available: [] as any[]
})

// 可用版本列表
const availableVersions = ref<any[]>([])

// 过滤版本列表
const filteredVersions = computed(() => {
  if (versionFilter.value === 'lts') {
    return availableVersions.value.filter(v => v.lts)
  } else if (versionFilter.value === 'latest') {
    return availableVersions.value.filter(v => v.latest)
  }
  return availableVersions.value
})

// API 实例
const api = useApi()

// WebSocket 实例
const { subscribe } = useWebSocket()

// WebSocket 消息监听
let unsubscribeList: (() => void)[] = []

// 检查 NVM 状态
const checkNVMStatus = async () => {
  try {
    const response = await api.get('/api/node/nvm/status')
    if (response.success) {
      nvmStatus.value = response.data
    }
  } catch (err) {
    console.error('检查NVM状态失败:', err)
  }
}

// 获取 Node 版本信息
const getNodeVersions = async () => {
  try {
    const response = await api.get('/api/node/versions')
    if (response.success) {
      nodeVersions.value = response.data
    }
  } catch (err) {
    console.error('获取Node版本失败:', err)
  }
}

// 获取可用版本列表
const getAvailableVersions = async () => {
  try {
    const response = await api.get('/api/node/available')
    if (response.success) {
      availableVersions.value = response.data
    }
  } catch (err) {
    console.error('获取可用版本失败:', err)
  }
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  error.value = null

  try {
    await checkNVMStatus()
    await getAvailableVersions() // 总是获取可用版本
    if (nvmStatus.value.installed) {
      await getNodeVersions()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '刷新数据失败'
  } finally {
    loading.value = false
  }
}

// 安装 NVM
const installNVM = async () => {
  installing.value = true
  error.value = null

  try {
    // 使用长时间操作的API方法，超时时间为5分钟
    const response = await api.postLongOperation('/api/node/nvm/install')
    if (response.success) {
      successMessage.value = response.data.message
    } else {
      error.value = response.message || '安装失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '安装失败'
  } finally {
    installing.value = false
  }
}

// 切换版本
const switchVersion = async (version: string) => {
  switching.value = true
  error.value = null

  try {
    const response = await api.postLongOperation('/api/node/switch', { version })
    if (response.success) {
      successMessage.value = response.data.message
      await getNodeVersions() // 刷新版本信息
    } else {
      error.value = response.message || '切换失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '切换失败'
  } finally {
    switching.value = false
  }
}

// 安装版本
const installVersion = async (version?: string) => {
  const versionToInstall = version || newVersionInput.value.trim()
  if (!versionToInstall) return

  installing.value = true
  installingVersion.value = versionToInstall
  error.value = null

  try {
    const response = await api.postLongOperation('/api/node/install', { version: versionToInstall })
    if (response.success) {
      successMessage.value = response.data.message
      if (!version) newVersionInput.value = '' // 只有手动输入时才清空
      await getNodeVersions() // 刷新版本信息
    } else {
      error.value = response.message || '安装失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '安装失败'
  } finally {
    installing.value = false
    installingVersion.value = null
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 清除错误
const clearError = () => {
  error.value = null
}

// 清除成功消息
const clearSuccess = () => {
  successMessage.value = null
}

// 处理 NVM 安装完成
const handleNvmInstalled = () => {
  successMessage.value = 'NVM 安装成功！'
  setTimeout(() => {
    refreshData()
  }, 2000)
}

// 设置WebSocket消息监听
const setupWebSocketListeners = () => {
  // NVM安装相关消息
  unsubscribeList.push(subscribe('nvm-install-start', (data) => {
    installing.value = true
    console.log('NVM安装开始:', data.message)
  }))

  unsubscribeList.push(subscribe('nvm-install-progress', (data) => {
    console.log('NVM安装进度:', data.message)
  }))

  unsubscribeList.push(subscribe('nvm-install-complete', (data) => {
    installing.value = false
    successMessage.value = data.message
    console.log('NVM安装完成:', data.message)
    // 刷新NVM状态
    setTimeout(() => {
      refreshData()
    }, 2000)
  }))

  unsubscribeList.push(subscribe('nvm-install-error', (data) => {
    installing.value = false
    error.value = data.message
    console.error('NVM安装失败:', data.message)
  }))

  // Node版本安装相关消息
  unsubscribeList.push(subscribe('node-install-start', (data) => {
    installing.value = true
    installingVersion.value = data.version
    console.log('Node安装开始:', data.message)
  }))

  unsubscribeList.push(subscribe('node-install-progress', (data) => {
    console.log('Node安装进度:', data.message)
  }))

  unsubscribeList.push(subscribe('node-install-complete', (data) => {
    installing.value = false
    installingVersion.value = null
    successMessage.value = data.message
    console.log('Node安装完成:', data.message)
    // 刷新版本列表
    setTimeout(() => {
      getNodeVersions()
    }, 1000)
  }))

  unsubscribeList.push(subscribe('node-install-error', (data) => {
    installing.value = false
    installingVersion.value = null
    error.value = data.message
    console.error('Node安装失败:', data.message)
  }))

  // Node版本切换相关消息
  unsubscribeList.push(subscribe('node-switch-start', (data) => {
    switching.value = true
    console.log('Node切换开始:', data.message)
  }))

  unsubscribeList.push(subscribe('node-switch-complete', (data) => {
    switching.value = false
    successMessage.value = data.message
    console.log('Node切换完成:', data.message)
    // 刷新版本列表
    setTimeout(() => {
      getNodeVersions()
    }, 1000)
  }))

  unsubscribeList.push(subscribe('node-switch-error', (data) => {
    switching.value = false
    error.value = data.message
    console.error('Node切换失败:', data.message)
  }))
}

// 组件挂载时加载数据
onMounted(() => {
  refreshData()
  setupWebSocketListeners()
})

// 组件卸载时清理WebSocket监听
onUnmounted(() => {
  unsubscribeList.forEach(unsubscribe => unsubscribe())
  unsubscribeList = []
})
</script>

<style lang="less" scoped>
.node-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--ls-spacing-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-spacing-xl);
  padding-bottom: var(--ls-spacing-base);
  border-bottom: 1px solid var(--ldesign-border-color);

  h1 {
    font-size: var(--ls-font-size-h2);
    color: var(--ldesign-text-color-primary);
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: var(--ls-spacing-sm);

    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      padding: var(--ls-spacing-sm) var(--ls-spacing-base);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-component);
      color: var(--ldesign-text-color-primary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--ldesign-bg-color-component-hover);
        border-color: var(--ldesign-border-color-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .icon {
        font-size: 16px;
      }
    }
  }
}

.loading-section {
  text-align: center;
  padding: var(--ls-spacing-xxl);

  .loading-spinner {
    color: var(--ldesign-brand-color);
    margin-bottom: var(--ls-spacing-base);
    animation: spin 1s linear infinite;
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-base);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

.nvm-install-section {
  // 使用 NvmInstaller 组件，不需要额外样式
}

.node-versions {
  display: grid;
  gap: var(--ls-spacing-xl);
}

.current-version-card,
.installed-versions-card,
.install-version-card {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-lg);

  h2 {
    font-size: var(--ls-font-size-lg);
    color: var(--ldesign-text-color-primary);
    margin: 0 0 var(--ls-spacing-base) 0;
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);

    svg {
      color: var(--ldesign-brand-color);
    }
  }
}

.current-version-card {
  .version-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .version-number {
      font-size: var(--ls-font-size-xl);
      font-weight: bold;
      color: var(--ldesign-success-color);
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .version-status {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      color: var(--ldesign-success-color);
      font-size: var(--ls-font-size-sm);

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ldesign-success-color);
      }
    }
  }
}

.versions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--ls-spacing-base);
}

.version-item {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-base);
  transition: all 0.2s ease;

  &.active {
    border-color: var(--ldesign-success-color);
    background: var(--ldesign-success-color-1);
  }

  &:hover {
    border-color: var(--ldesign-border-color-hover);
  }

  .version-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .version-number {
      font-family: 'Consolas', 'Monaco', monospace;
      font-weight: 500;
      color: var(--ldesign-text-color-primary);
    }

    .switch-btn {
      padding: 4px 12px;
      background: var(--ldesign-brand-color);
      color: white;
      border: none;
      border-radius: var(--ls-border-radius-sm);
      cursor: pointer;
      font-size: var(--ls-font-size-xs);
      transition: background-color 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--ldesign-brand-color-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .current-badge {
      padding: 4px 12px;
      background: var(--ldesign-success-color);
      color: white;
      border-radius: var(--ls-border-radius-sm);
      font-size: var(--ls-font-size-xs);
      font-weight: 500;
    }
  }
}

.empty-state {
  text-align: center;
  padding: var(--ls-spacing-xl);
  color: var(--ldesign-text-color-secondary);
}

.install-form {
  .input-group {
    display: flex;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-spacing-base);

    .version-input {
      flex: 1;
      padding: var(--ls-spacing-sm) var(--ls-spacing-base);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-container);
      color: var(--ldesign-text-color-primary);
      font-family: 'Consolas', 'Monaco', monospace;

      &:focus {
        outline: none;
        border-color: var(--ldesign-brand-color);
      }

      &::placeholder {
        color: var(--ldesign-text-color-placeholder);
      }
    }

    .install-version-btn {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
      background: var(--ldesign-brand-color);
      color: white;
      border: none;
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s ease;

      .spinner {
        animation: spin 1s linear infinite;
      }

      &:hover:not(:disabled) {
        background: var(--ldesign-brand-color-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .install-tips {
    background: var(--ldesign-bg-color-container);
    border-radius: var(--ls-border-radius-base);
    padding: var(--ls-spacing-base);
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);

    p {
      margin: 0 0 var(--ls-spacing-xs) 0;
      font-weight: 500;
    }

    ul {
      margin: 0;
      padding-left: var(--ls-spacing-base);

      li {
        margin: var(--ls-spacing-xs) 0;

        code {
          background: var(--ldesign-gray-color-1);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 11px;
        }
      }
    }
  }
}

.error-section,
.success-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-xl);
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 300px;

  .error-icon {
    color: var(--ldesign-error-color);
    margin-bottom: var(--ls-spacing-base);
  }

  .success-icon {
    color: var(--ldesign-success-color);
    margin-bottom: var(--ls-spacing-base);
  }

  h3 {
    margin: 0 0 var(--ls-spacing-sm) 0;
    color: var(--ldesign-text-color-primary);
  }

  p {
    margin: 0 0 var(--ls-spacing-lg) 0;
    color: var(--ldesign-text-color-secondary);
  }

  .retry-btn,
  .ok-btn {
    padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
    border: none;
    border-radius: var(--ls-border-radius-base);
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .retry-btn {
    background: var(--ldesign-error-color);
    color: white;

    &:hover {
      background: var(--ldesign-error-color-hover);
    }
  }

  .ok-btn {
    background: var(--ldesign-success-color);
    color: white;

    &:hover {
      background: var(--ldesign-success-color-hover);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .node-manager {
    padding: var(--ls-spacing-base);
  }

  .page-header {
    flex-direction: column;
    gap: var(--ls-spacing-base);
    text-align: center;
  }

  .versions-grid {
    grid-template-columns: 1fr;
  }

  .install-form .input-group {
    flex-direction: column;
  }
}
</style>
