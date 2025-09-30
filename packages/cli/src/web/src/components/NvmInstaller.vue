<template>
  <div class="nvm-installer">
    <div class="installer-card">
      <!-- 头部 -->
      <div class="installer-header">
        <div class="header-icon">
          <Package :size="48" />
        </div>
        <h2>安装 Node Version Manager</h2>
        <p class="description">NVM 是管理多个 Node.js 版本的强大工具</p>
      </div>

      <!-- 系统信息 -->
      <div class="system-info">
        <div class="info-item">
          <Monitor :size="18" />
          <span class="label">当前平台:</span>
          <span class="value">{{ platformName }}</span>
        </div>
        <div class="info-item">
          <Download :size="18" />
          <span class="label">推荐安装:</span>
          <span class="value">{{ recommendedPackage }}</span>
        </div>
      </div>

      <!-- 安装状态 -->
      <div v-if="installing" class="install-progress">
        <div class="progress-header">
          <h3>安装进度</h3>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
        
        <div class="progress-status">
          <Loader2 :size="16" class="spinner" />
          <span>{{ currentStep }}</span>
        </div>

        <!-- 日志输出 -->
        <div class="log-container">
          <div class="log-header">
            <Terminal :size="16" />
            <span>安装日志</span>
            <button class="clear-log-btn" @click="clearLogs" title="清空日志">
              <Trash2 :size="14" />
            </button>
          </div>
          <div class="log-content" ref="logContentRef">
            <div 
              v-for="(log, index) in logs" 
              :key="index"
              class="log-line"
              :class="log.type"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 安装按钮 -->
      <div class="installer-actions">
        <button 
          v-if="!installing && !installSuccess"
          class="install-btn"
          @click="startInstall"
          :disabled="installing"
        >
          <Rocket :size="20" />
          <span>开始安装</span>
        </button>

        <button 
          v-if="installSuccess"
          class="success-btn"
          @click="$emit('installed')"
        >
          <CheckCircle2 :size="20" />
          <span>安装完成</span>
        </button>

        <button 
          v-if="installing"
          class="cancel-btn"
          @click="cancelInstall"
        >
          <XCircle :size="20" />
          <span>取消安装</span>
        </button>
      </div>

      <!-- 功能特性 -->
      <div v-if="!installing" class="features">
        <h3>主要特性</h3>
        <div class="feature-list">
          <div class="feature-item">
            <CheckCircle :size="18" />
            <span>轻松切换 Node.js 版本</span>
          </div>
          <div class="feature-item">
            <CheckCircle :size="18" />
            <span>支持多版本并存</span>
          </div>
          <div class="feature-item">
            <CheckCircle :size="18" />
            <span>自动下载和安装</span>
          </div>
          <div class="feature-item">
            <CheckCircle :size="18" />
            <span>项目级版本管理</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  Package, Monitor, Download, Loader2, Terminal, 
  Trash2, Rocket, CheckCircle2, XCircle, CheckCircle 
} from 'lucide-vue-next'
import { useWebSocket } from '../composables/useWebSocket'

// Props
interface Props {
  platform: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  installed: []
}>()

// 响应式数据
const installing = ref(false)
const installSuccess = ref(false)
const progressPercentage = ref(0)
const currentStep = ref('')
const logs = ref<Array<{ time: string; message: string; type: string }>>([])
const logContentRef = ref<HTMLElement | null>(null)

// WebSocket
const { subscribe } = useWebSocket()
let unsubscribeList: (() => void)[] = []

// 计算属性
const platformName = computed(() => {
  const platformMap: Record<string, string> = {
    'win32': 'Windows',
    'darwin': 'macOS',
    'linux': 'Linux'
  }
  return platformMap[props.platform] || props.platform
})

const recommendedPackage = computed(() => {
  return props.platform === 'win32' ? 'nvm-windows' : 'nvm'
})

// 方法
const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  
  logs.value.push({ time, message, type })
  
  // 自动滚动到底部
  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight
    }
  })
}

const clearLogs = () => {
  logs.value = []
}

const startInstall = async () => {
  installing.value = true
  installSuccess.value = false
  progressPercentage.value = 0
  currentStep.value = '准备安装...'
  logs.value = []

  addLog('开始安装 NVM...', 'info')

  try {
    // 调用后端 API 开始真实的安装过程
    const response = await fetch('/api/node/nvm/install', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (result.success) {
      addLog('安装请求已发送，等待安装完成...', 'info')
      // 安装过程会通过 WebSocket 实时推送进度
    } else {
      addLog(result.message || '安装失败', 'error')
      installing.value = false
    }
  } catch (error) {
    addLog(error instanceof Error ? error.message : '安装失败', 'error')
    installing.value = false
  }
}

const cancelInstall = () => {
  installing.value = false
  progressPercentage.value = 0
  currentStep.value = ''
  addLog('安装已取消', 'warning')
}



// 设置 WebSocket 监听
const setupWebSocketListeners = () => {
  unsubscribeList.push(subscribe('nvm-install-start', (data) => {
    installing.value = true
    addLog(data.message, 'info')
  }))

  unsubscribeList.push(subscribe('nvm-install-progress', (data) => {
    if (data.progress !== undefined) {
      progressPercentage.value = data.progress
    }
    if (data.step) {
      currentStep.value = data.step
    }
    addLog(data.message, 'info')
  }))

  unsubscribeList.push(subscribe('nvm-install-complete', (data) => {
    installing.value = false
    installSuccess.value = true
    progressPercentage.value = 100
    addLog(data.message, 'success')
  }))

  unsubscribeList.push(subscribe('nvm-install-error', (data) => {
    installing.value = false
    addLog(data.message, 'error')
  }))
}

// 生命周期
onMounted(() => {
  setupWebSocketListeners()
})

onUnmounted(() => {
  unsubscribeList.forEach(unsubscribe => unsubscribe())
  unsubscribeList = []
})
</script>

<style lang="less" scoped>
.nvm-installer {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  padding: var(--ls-spacing-xl);
}

.installer-card {
  max-width: 700px;
  width: 100%;
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-xxl);
  box-shadow: var(--ldesign-shadow-2);
}

.installer-header {
  text-align: center;
  margin-bottom: var(--ls-spacing-xl);

  .header-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--ldesign-brand-color-2), var(--ldesign-brand-color-4));
    border-radius: var(--ls-border-radius-lg);
    color: var(--ldesign-brand-color);
    margin-bottom: var(--ls-spacing-base);
  }

  h2 {
    margin: 0 0 var(--ls-spacing-sm) 0;
    font-size: var(--ls-font-size-xl);
    color: var(--ldesign-text-color-primary);
    font-weight: 600;
  }

  .description {
    margin: 0;
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-base);
  }
}

.system-info {
  display: grid;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-spacing-xl);
  padding: var(--ls-spacing-base);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);

  .info-item {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);

    .label {
      font-weight: 500;
    }

    .value {
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }
  }
}

.install-progress {
  margin-bottom: var(--ls-spacing-xl);

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--ls-spacing-sm);

    h3 {
      margin: 0;
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }

    .progress-percentage {
      font-size: var(--ls-font-size-lg);
      font-weight: 700;
      color: var(--ldesign-brand-color);
    }
  }

  .progress-bar {
    height: 8px;
    background: var(--ldesign-bg-color-component);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--ls-spacing-base);

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--ldesign-brand-color), var(--ldesign-brand-color-hover));
      transition: width 0.3s ease;
      border-radius: 4px;
    }
  }

  .progress-status {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
    margin-bottom: var(--ls-spacing-base);

    .spinner {
      animation: spin 1s linear infinite;
    }
  }
}

.log-container {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;

  .log-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-spacing-sm) var(--ls-spacing-base);
    background: var(--ldesign-bg-color-container);
    border-bottom: 1px solid var(--ldesign-border-color);
    font-size: var(--ls-font-size-sm);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);

    .clear-log-btn {
      margin-left: auto;
      padding: 4px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--ldesign-text-color-secondary);
      border-radius: var(--ls-border-radius-sm);
      transition: all 0.2s ease;

      &:hover {
        background: var(--ldesign-bg-color-component-hover);
        color: var(--ldesign-error-color);
      }
    }
  }

  .log-content {
    max-height: 300px;
    overflow-y: auto;
    padding: var(--ls-spacing-sm);
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 12px;
    line-height: 1.6;

    .log-line {
      display: flex;
      gap: var(--ls-spacing-sm);
      padding: 2px 0;

      .log-time {
        color: var(--ldesign-text-color-placeholder);
        flex-shrink: 0;
      }

      .log-message {
        color: var(--ldesign-text-color-secondary);
      }

      &.success .log-message {
        color: var(--ldesign-success-color);
      }

      &.error .log-message {
        color: var(--ldesign-error-color);
      }

      &.warning .log-message {
        color: var(--ldesign-warning-color);
      }
    }
  }
}

.installer-actions {
  display: flex;
  justify-content: center;
  margin-bottom: var(--ls-spacing-xl);

  button {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-spacing-base) var(--ls-spacing-xl);
    border: none;
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .install-btn {
    background: var(--ldesign-brand-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-brand-color-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .success-btn {
    background: var(--ldesign-success-color);
    color: white;

    &:hover {
      background: var(--ldesign-success-color-hover);
    }
  }

  .cancel-btn {
    background: var(--ldesign-error-color);
    color: white;

    &:hover {
      background: var(--ldesign-error-color-hover);
    }
  }
}

.features {
  h3 {
    margin: 0 0 var(--ls-spacing-base) 0;
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-primary);
    font-weight: 600;
  }

  .feature-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--ls-spacing-sm);
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-spacing-sm);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-base);
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);

    svg {
      color: var(--ldesign-success-color);
      flex-shrink: 0;
    }
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

// 响应式设计
@media (max-width: 768px) {
  .nvm-installer {
    padding: var(--ls-spacing-base);
  }

  .installer-card {
    padding: var(--ls-spacing-lg);
  }

  .features .feature-list {
    grid-template-columns: 1fr;
  }
}
</style>

