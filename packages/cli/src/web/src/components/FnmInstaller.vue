<template>
  <div class="fnm-installer">
    <div class="installer-card">
      <!-- 头部 -->
      <div class="installer-header">
        <div class="header-icon">
          <Package :size="48" />
        </div>
        <h2>安装 Fast Node Manager (fnm)</h2>
        <p class="description">fnm 是一个快速简单的 Node.js 版本管理器，使用 Rust 构建</p>
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
          <span class="label">安装方式:</span>
          <span class="value">{{ installMethod }}</span>
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
            <div v-for="(log, index) in logs" :key="index" class="log-line" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 安装按钮 -->
      <div class="installer-actions">
        <button v-if="!installing && !installSuccess" class="install-btn" @click="startInstall" :disabled="installing">
          <Rocket :size="20" />
          <span>开始安装</span>
        </button>

        <button v-if="installSuccess && !verifying" class="verify-btn" @click="verifyInstallation">
          <Shield :size="20" />
          <span>校验安装</span>
        </button>

        <button v-if="verifying" class="verifying-btn" disabled>
          <Loader2 :size="20" class="spinner" />
          <span>校验中...</span>
        </button>

        <button v-if="verified" class="success-btn" @click="$emit('installed')">
          <CheckCircle2 :size="20" />
          <span>验证通过，继续</span>
        </button>

        <button v-if="installing" class="cancel-btn" @click="cancelInstall">
          <XCircle :size="20" />
          <span>取消安装</span>
        </button>
      </div>

      <!-- 功能特性 -->
      <div v-if="!installing" class="features">
        <h3>主要特性</h3>
        <div class="feature-list">
          <div class="feature-item">
            <Zap :size="18" />
            <div class="feature-content">
              <h4>极速性能</h4>
              <p>使用 Rust 构建，速度比其他版本管理器快数倍</p>
            </div>
          </div>
          <div class="feature-item">
            <Layers :size="18" />
            <div class="feature-content">
              <h4>多版本管理</h4>
              <p>轻松安装和切换不同的 Node.js 版本</p>
            </div>
          </div>
          <div class="feature-item">
            <Settings :size="18" />
            <div class="feature-content">
              <h4>自动切换</h4>
              <p>根据项目 .nvmrc 或 .node-version 文件自动切换版本</p>
            </div>
          </div>
          <div class="feature-item">
            <Shield :size="18" />
            <div class="feature-content">
              <h4>跨平台支持</h4>
              <p>支持 Windows、macOS 和 Linux</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 安装说明 -->
      <div v-if="installSuccess" class="install-instructions">
        <h3>
          <CheckCircle2 :size="20" />
          <span>安装成功！</span>
        </h3>
        <div class="instructions-list">
          <div v-for="(instruction, index) in instructions" :key="index" class="instruction-item">
            <span class="instruction-icon">{{ instruction.startsWith('✓') ? '✓' : '→' }}</span>
            <span>{{ instruction.replace(/^[✓→]\s*/, '') }}</span>
          </div>
        </div>
        <div class="next-steps">
          <p class="next-steps-title">👉 下一步：</p>
          <p>请点击上方的 <strong>"校验安装"</strong> 按钮验证 fnm 是否正常工作。</p>
          <p class="warning-text">⚠️ 如果校验失败，请重启终端或 IDE，然后刷新页面。</p>
        </div>
      </div>

      <!-- 校验结果 -->
      <div v-if="verifyError" class="verify-error">
        <h3>
          <XCircle :size="20" />
          <span>校验失败</span>
        </h3>
        <p class="error-message">{{ verifyError }}</p>
        <div class="error-actions">
          <button class="retry-btn" @click="verifyInstallation">
            <RefreshCw :size="16" />
            <span>重新校验</span>
          </button>
          <button class="manual-btn" @click="showManualInstructions = !showManualInstructions">
            <FileText :size="16" />
            <span>查看手动配置</span>
          </button>
        </div>
        <div v-if="showManualInstructions" class="manual-instructions">
          <h4>手动配置指南：</h4>
          <ol>
            <li>重启终端或 IDE</li>
            <li>运行 <code>fnm --version</code> 验证安装</li>
            <li>如果仍然失败，检查环境变量配置</li>
            <li>刷新此页面查看 fnm 状态</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Package, Monitor, Download, Loader2, Terminal, Trash2,
  Rocket, CheckCircle2, XCircle, Zap, Layers, Settings, Shield,
  RefreshCw, FileText
} from 'lucide-vue-next'
import { useApi } from '../composables/useApi'
import { useWebSocket } from '../composables/useWebSocket'

/**
 * fnm 安装器组件
 * 提供 fnm 的一键安装功能
 */

// Props
interface Props {
  platform: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  installed: []
}>()

// API 和 WebSocket
const api = useApi()
const { subscribe } = useWebSocket()

// 响应式数据
const installing = ref(false)
const installSuccess = ref(false)
const verifying = ref(false)
const verified = ref(false)
const verifyError = ref<string | null>(null)
const showManualInstructions = ref(false)
const progressPercentage = ref(0)
const currentStep = ref('')
const logs = ref<Array<{ time: string, message: string, type: string }>>([])
const logContentRef = ref<HTMLElement | null>(null)
const instructions = ref<string[]>([])
let unsubscribeList: (() => void)[] = []

// 计算属性
const platformName = computed(() => {
  switch (props.platform) {
    case 'win32':
      return 'Windows'
    case 'darwin':
      return 'macOS'
    case 'linux':
      return 'Linux'
    default:
      return props.platform
  }
})

const installMethod = computed(() => {
  switch (props.platform) {
    case 'win32':
      return 'winget'
    case 'darwin':
      return 'curl 脚本'
    case 'linux':
      return 'curl 脚本'
    default:
      return '自动检测'
  }
})

// 添加日志
const addLog = (message: string, type: string = 'info') => {
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

// 清空日志
const clearLogs = () => {
  logs.value = []
}

// 开始安装
const startInstall = async () => {
  installing.value = true
  installSuccess.value = false
  progressPercentage.value = 0
  currentStep.value = '准备安装...'
  logs.value = []
  instructions.value = []

  addLog('开始安装 fnm...', 'info')

  try {
    const response = await api.postLongOperation('/api/fnm/install', {})

    if (response.success) {
      installSuccess.value = true
      progressPercentage.value = 100
      currentStep.value = '安装完成！'
      instructions.value = response.data.instructions || []
      addLog('fnm 安装成功！', 'success')
    } else {
      throw new Error(response.message || '安装失败')
    }
  } catch (error) {
    addLog(`安装失败: ${error instanceof Error ? error.message : String(error)}`, 'error')
    currentStep.value = '安装失败'
  } finally {
    installing.value = false
  }
}

// 取消安装
const cancelInstall = () => {
  installing.value = false
  currentStep.value = '安装已取消'
  addLog('用户取消了安装', 'warning')
}

// 校验安装
const verifyInstallation = async () => {
  verifying.value = true
  verifyError.value = null
  verified.value = false
  showManualInstructions.value = false
  
  addLog('开始校验 fnm 安装...', 'info')
  
  try {
    const response = await api.post('/api/fnm/verify', {})
    
    if (response.success && response.data.installed) {
      verified.value = true
      addLog(`校验成功: ${response.data.message}`, 'success')
      addLog(`fnm 版本: ${response.data.version}`, 'info')
      
      // 稍后自动进入下一步
      setTimeout(() => {
        emit('installed')
      }, 2000)
    } else {
      verifyError.value = response.data?.message || 'fnm 未正确安装'
      addLog(`校验失败: ${verifyError.value}`, 'error')
    }
  } catch (error) {
    verifyError.value = error instanceof Error ? error.message : '校验请求失败'
    addLog(`校验失败: ${verifyError.value}`, 'error')
  } finally {
    verifying.value = false
  }
}

// 设置WebSocket消息监听
const setupWebSocketListeners = () => {
  // Node安装相关消息（注意：事件名是 node-install-* 而非 fnm-install-*）
  unsubscribeList.push(subscribe('node-install-start', (data) => {
    currentStep.value = data.message
    progressPercentage.value = 10
    addLog(data.message, 'info')
  }))

  unsubscribeList.push(subscribe('node-install-progress', (data) => {
    currentStep.value = data.message
    if (data.progress !== undefined) {
      progressPercentage.value = data.progress
    }
    addLog(data.message, 'info')
  }))

  unsubscribeList.push(subscribe('node-install-complete', (data) => {
    currentStep.value = data.message
    progressPercentage.value = 100
    installSuccess.value = data.success
    addLog(data.message, 'success')
  }))

  unsubscribeList.push(subscribe('node-install-error', (data) => {
    currentStep.value = '安装失败'
    addLog(data.message, 'error')
  }))
}

// 生命周期
onMounted(() => {
  setupWebSocketListeners()
})

onUnmounted(() => {
  // 清理所有订阅
  unsubscribeList.forEach(unsubscribe => unsubscribe())
  unsubscribeList = []
})
</script>

<style scoped lang="less">
@import '../styles/fnm-installer.less';
</style>
