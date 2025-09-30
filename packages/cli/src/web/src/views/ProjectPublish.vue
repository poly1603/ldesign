<template>
  <div class="project-publish-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn-back">
          <ArrowLeft :size="18" />
          <span>返回</span>
        </button>
        <div class="action-info">
          <div class="action-icon-wrapper">
            <Upload :size="32" class="action-icon" />
          </div>
          <div class="action-text">
            <h1>发布</h1>
            <p class="project-name">{{ project?.name }}</p>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button v-if="!running" @click="startPublish" :disabled="!selectedSource || running" class="btn-primary">
          <Play :size="18" />
          <span>开始发布</span>
        </button>
        <button v-else @click="stopPublish" class="btn-danger">
          <Square :size="18" />
          <span>停止</span>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="action-content">
      <!-- 左侧：NPM 源选择和包信息 -->
      <div class="left-panel">
        <!-- NPM 源选择 -->
        <div class="npm-sources-card">
          <div class="card-header">
            <Globe :size="20" />
            <h3>NPM 源</h3>
          </div>
          
          <div v-if="loadingSources" class="loading-state">
            <Loader2 :size="20" class="spin" />
            <span>加载中...</span>
          </div>
          
          <div v-else-if="loggedInSources.length === 0" class="empty-state">
            <AlertCircle :size="32" />
            <p>暂无已登录的 NPM 源</p>
            <button @click="goToNpmSources" class="btn-secondary">
              <Settings :size="16" />
              <span>前往配置</span>
            </button>
          </div>
          
          <div v-else class="sources-list">
            <div 
              v-for="source in loggedInSources" 
              :key="source.id"
              class="source-item"
              :class="{ 'selected': selectedSource?.id === source.id }"
              @click="selectSource(source)"
            >
              <div class="source-radio">
                <div class="radio-circle" :class="{ 'checked': selectedSource?.id === source.id }">
                  <div v-if="selectedSource?.id === source.id" class="radio-dot"></div>
                </div>
              </div>
              <div class="source-content">
                <div class="source-name">{{ source.name }}</div>
                <div class="source-url">{{ source.url }}</div>
                <div v-if="source.loginInfo" class="source-user">
                  <User :size="12" />
                  <span>{{ source.loginInfo.username }}</span>
                </div>
              </div>
              <div class="source-badge" :class="source.type">
                {{ source.type === 'public' ? '公共' : '私有' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 包信息 -->
        <div class="package-card" v-if="packageInfo">
          <div class="card-header">
            <Package :size="20" />
            <h3>包信息</h3>
          </div>
          <div class="package-content">
            <div class="package-item">
              <span class="label">包名:</span>
              <span class="value">{{ packageInfo.name }}</span>
            </div>
            <div class="package-item">
              <span class="label">当前版本:</span>
              <span class="version-badge">v{{ packageInfo.version }}</span>
            </div>
            <div v-if="packageInfo.description" class="package-item">
              <span class="label">描述:</span>
              <span class="value">{{ packageInfo.description }}</span>
            </div>
            <div v-if="packageInfo.isLibrary" class="package-item">
              <span class="library-badge">库项目</span>
            </div>
          </div>
        </div>

        <!-- 状态卡片 -->
        <div class="status-card">
          <div class="status-header">
            <component :is="statusIcon" :size="24" :class="['status-icon', statusClass]" />
            <div class="status-info">
              <h3>{{ statusText }}</h3>
              <p>{{ statusDescription }}</p>
            </div>
          </div>
          <div v-if="running || elapsedTime !== '00:00:00'" class="status-footer">
            <Clock :size="16" />
            <span class="elapsed-time">{{ elapsedTime }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：日志输出 -->
      <div class="right-panel" :style="{ width: logPanelCollapsed ? '48px' : `${logPanelWidth}%` }">
        <div class="log-card">
          <div class="log-header">
            <Terminal :size="20" />
            <h3 v-if="!logPanelCollapsed">输出日志</h3>
            <div class="log-actions">
              <button class="log-action-btn" @click="toggleLogPanel" :title="logPanelCollapsed ? '展开日志' : '收起日志'">
                <ChevronLeft v-if="!logPanelCollapsed" :size="16" />
                <ChevronRight v-if="logPanelCollapsed" :size="16" />
              </button>
              <button v-if="!logPanelCollapsed" class="log-action-btn" @click="clearLogs" title="清空日志">
                <Trash2 :size="16" />
              </button>
              <button v-if="!logPanelCollapsed" class="log-action-btn" @click="downloadLogs" title="下载日志">
                <Download :size="16" />
              </button>
            </div>
          </div>
          <div v-if="!logPanelCollapsed" class="log-content" ref="logContentRef">
            <div v-if="logs.length === 0" class="log-empty">
              <FileText :size="32" />
              <p>暂无日志输出</p>
              <p class="log-hint">选择 NPM 源后点击"开始发布"按钮开始执行</p>
            </div>
            <div v-for="(log, index) in logs" :key="index" class="log-line" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message" v-html="log.html"></span>
            </div>
          </div>
        </div>
        <!-- 拖拽调整宽度 -->
        <div v-if="!logPanelCollapsed" class="resize-handle" @mousedown="startResize"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Play, Square, Clock, Terminal, Trash2, Download, FileText, Settings,
  Upload, Package, Globe, User,
  Loader2, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { useApi } from '../composables/useApi'
import { useWebSocket } from '../composables/useWebSocket'
import { useMessage } from '../composables/useMessage'
import { formatLogMessage } from '../utils/logParser'

interface NpmSource {
  id: string
  name: string
  url: string
  type: 'public' | 'private'
  description?: string
  isLoggedIn: boolean
  loginInfo?: {
    username?: string
    email?: string
    lastLoginAt?: string
  }
}

// 路由
const route = useRoute()
const router = useRouter()

// API
const api = useApi()
const { subscribe } = useWebSocket()
const message = useMessage()

// 响应式数据
const project = ref<any>(null)
const packageInfo = ref<any>(null)
const npmSources = ref<NpmSource[]>([])
const selectedSource = ref<NpmSource | null>(null)
const loadingSources = ref(true)
const running = ref(false)
const logs = ref<Array<{ time: string; message: string; html: string; type: string }>>([])
const logContentRef = ref<HTMLElement | null>(null)
const startTime = ref<number>(0)
const elapsedTime = ref('00:00:00')
const currentProcessId = ref<string | null>(null)
const logPanelCollapsed = ref(false)
const logPanelWidth = ref(60)
let elapsedTimer: number | null = null
let unsubscribeList: (() => void)[] = []

// 计算属性
const loggedInSources = computed(() => {
  return npmSources.value.filter(source => source.isLoggedIn)
})

const statusIcon = computed(() => {
  if (running.value) return Loader2
  if (logs.value.some(log => log.type === 'error')) return XCircle
  if (logs.value.length > 0 && !running.value) return CheckCircle
  return AlertCircle
})

const statusClass = computed(() => {
  if (running.value) return 'running'
  if (logs.value.some(log => log.type === 'error')) return 'error'
  if (logs.value.length > 0 && !running.value) return 'success'
  return 'idle'
})

const statusText = computed(() => {
  if (running.value) return '发布中...'
  if (logs.value.some(log => log.type === 'error')) return '发布失败'
  if (logs.value.length > 0 && !running.value) return '发布完成'
  return '就绪'
})

const statusDescription = computed(() => {
  if (running.value) return '正在执行发布操作'
  if (logs.value.some(log => log.type === 'error')) return '发布过程中出现错误'
  if (logs.value.length > 0 && !running.value) return '发布已成功完成'
  if (!selectedSource.value) return '请选择 NPM 源后开始发布'
  return '点击开始按钮执行发布操作'
})

// 方法
const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  const formatted = formatLogMessage(message)

  logs.value.push({
    time,
    message: formatted.plain,
    html: formatted.html,
    type: formatted.type
  })

  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight
    }
  })
}

const clearLogs = () => {
  logs.value = []
}

const downloadLogs = () => {
  const content = logs.value.map(log => `[${log.time}] ${log.message}`).join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `publish-${Date.now()}.log`
  a.click()
  URL.revokeObjectURL(url)
}

const toggleLogPanel = () => {
  logPanelCollapsed.value = !logPanelCollapsed.value
}

const startResize = (e: MouseEvent) => {
  e.preventDefault()

  const startX = e.clientX
  const startWidth = logPanelWidth.value

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const containerWidth = (e.target as HTMLElement).parentElement?.parentElement?.offsetWidth || 1600
    const deltaPercent = (deltaX / containerWidth) * 100
    const newWidth = Math.max(30, Math.min(80, startWidth - deltaPercent))
    logPanelWidth.value = newWidth
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const updateElapsedTime = () => {
  const elapsed = Date.now() - startTime.value
  const hours = Math.floor(elapsed / 3600000)
  const minutes = Math.floor((elapsed % 3600000) / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)
  elapsedTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const selectSource = (source: NpmSource) => {
  selectedSource.value = source
}

const goToNpmSources = () => {
  router.push('/npm-sources')
}

const goBack = () => {
  const projectId = route.params.id as string
  router.push(`/projects/${projectId}`)
}

// 订阅进程事件
const subscribeToProcess = () => {
  unsubscribeList.forEach(unsubscribe => unsubscribe())
  unsubscribeList = []

  const unsubscribeLog = subscribe('process-log', (data: any) => {
    if (data.processId === currentProcessId.value) {
      const message = data.message.trim()
      if (message) {
        addLog(message, data.logType === 'stderr' ? 'error' : 'info')
      }
    }
  })

  const unsubscribeExit = subscribe('process-exit', (data: any) => {
    if (data.processId === currentProcessId.value) {
      running.value = false
      if (elapsedTimer) {
        clearInterval(elapsedTimer)
        elapsedTimer = null
      }
      addLog(`进程已退出 (退出码: ${data.code})`, data.code === 0 ? 'success' : 'error')
      
      if (data.code === 0) {
        message.success('发布成功')
      } else {
        message.error('发布失败')
      }
    }
  })

  const unsubscribeError = subscribe('process-error', (data: any) => {
    if (data.processId === currentProcessId.value) {
      running.value = false
      if (elapsedTimer) {
        clearInterval(elapsedTimer)
        elapsedTimer = null
      }
      addLog(`进程错误: ${data.error}`, 'error')
      message.error('发布失败')
    }
  })

  unsubscribeList.push(unsubscribeLog, unsubscribeExit, unsubscribeError)
}

const startPublish = async () => {
  if (!project.value || !selectedSource.value) {
    if (!selectedSource.value) {
      message.error('请先选择 NPM 源')
    }
    return
  }

  running.value = true
  startTime.value = Date.now()
  logs.value = []

  addLog('开始发布...', 'info')
  addLog(`包名: ${packageInfo.value?.name}`, 'info')
  addLog(`版本: ${packageInfo.value?.version}`, 'info')
  addLog(`发布到: ${selectedSource.value.name} (${selectedSource.value.url})`, 'info')

  elapsedTimer = window.setInterval(updateElapsedTime, 1000)

  try {
    const projectId = route.params.id as string

    const response = await api.post('/api/process/start', {
      projectPath: project.value.path,
      projectId,
      action: 'publish',
      registry: selectedSource.value.url
    })

    if (response.success) {
      currentProcessId.value = response.data.processId
      addLog(`进程已启动 (ID: ${response.data.processId})`, 'success')
      subscribeToProcess()
    } else {
      addLog(response.message || '启动发布进程失败', 'error')
      message.error(response.message || '启动发布进程失败')
      running.value = false
      if (elapsedTimer) {
        clearInterval(elapsedTimer)
        elapsedTimer = null
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '启动发布进程失败'
    addLog(errorMsg, 'error')
    message.error(errorMsg)
    running.value = false
    if (elapsedTimer) {
      clearInterval(elapsedTimer)
      elapsedTimer = null
    }
  }
}

const stopPublish = async () => {
  if (!currentProcessId.value) return

  try {
    const response = await api.post('/api/process/stop', {
      processId: currentProcessId.value
    })

    if (response.success) {
      running.value = false
      if (elapsedTimer) {
        clearInterval(elapsedTimer)
        elapsedTimer = null
      }
      addLog('进程已停止', 'warning')
      message.warning('发布已停止')
      currentProcessId.value = null
    } else {
      addLog(response.message || '停止进程失败', 'error')
      message.error(response.message || '停止进程失败')
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '停止进程失败'
    addLog(errorMsg, 'error')
    message.error(errorMsg)
  }
}

const loadProject = async () => {
  const projectId = route.params.id as string
  try {
    const response = await api.get(`/api/projects/${projectId}`)
    if (response.success) {
      project.value = response.data
      await loadPackageInfo()
    }
  } catch (error) {
    console.error('加载项目失败:', error)
  }
}

const loadPackageInfo = async () => {
  const projectId = route.params.id as string
  try {
    const response = await api.get(`/api/projects/${projectId}/package-info`)
    if (response.success) {
      packageInfo.value = response.data
    }
  } catch (error) {
    console.error('加载包信息失败:', error)
  }
}

const loadNpmSources = async () => {
  try {
    loadingSources.value = true
    const response = await api.get('/api/npm-sources')
    if (response.success && response.data) {
      npmSources.value = response.data
      // 自动选择第一个已登录的源
      if (loggedInSources.value.length > 0 && !selectedSource.value) {
        selectedSource.value = loggedInSources.value[0]
      }
    }
  } catch (error) {
    console.error('加载 NPM 源失败:', error)
    message.error('加载 NPM 源失败')
  } finally {
    loadingSources.value = false
  }
}

onMounted(() => {
  loadProject()
  loadNpmSources()
})

onUnmounted(() => {
  if (elapsedTimer) {
    clearInterval(elapsedTimer)
  }
  unsubscribeList.forEach(unsubscribe => unsubscribe())
})
</script>

<style lang="less" scoped>
.project-publish-page {
  padding: var(--ls-padding-lg);
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 128px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-margin-lg);
  padding-bottom: var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-color);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-lg);

    .action-info {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-base);

      .action-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #f3e5f5, #e1bee7);
        border-radius: var(--ls-border-radius-lg);
        box-shadow: var(--ldesign-shadow-2);

        .action-icon {
          color: #7b1fa2;
        }
      }

      .action-text {
        h1 {
          margin: 0 0 4px 0;
          font-size: var(--ls-font-size-h3);
          color: var(--ldesign-text-color-primary);
          font-weight: 600;
        }

        .project-name {
          margin: 0;
          font-size: var(--ls-font-size-sm);
          color: var(--ldesign-text-color-secondary);
        }
      }
    }
  }

  .header-actions {
    display: flex;
    gap: var(--ls-spacing-sm);
  }
}

.action-content {
  flex: 1;
  display: flex;
  gap: var(--ls-spacing-lg);
  min-height: 0;
  overflow: hidden;
}

.left-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
  overflow-y: auto;
  padding-right: var(--ls-padding-sm);
}

.right-panel {
  flex: 1;
  position: relative;
  display: flex;
  min-width: 0;
  transition: width 0.3s ease;
}

.npm-sources-card,
.package-card,
.status-card {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-lg);
  border: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-margin-base);

    svg {
      color: var(--ldesign-brand-color);
    }

    h3 {
      margin: 0;
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }
  }
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ls-padding-xl) 0;
  gap: var(--ls-spacing-base);
  color: var(--ldesign-text-color-secondary);

  svg {
    color: var(--ldesign-text-color-placeholder);
  }

  p {
    margin: 0;
    font-size: var(--ls-font-size-sm);
  }
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
}

.source-item {
  display: flex;
  align-items: flex-start;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-base);
  border: 2px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--ldesign-brand-color-hover);
    background: var(--ldesign-bg-color-container-hover);
  }

  &.selected {
    border-color: var(--ldesign-brand-color);
    background: var(--ldesign-brand-color-focus);
  }

  .source-radio {
    flex-shrink: 0;
    padding-top: 2px;

    .radio-circle {
      width: 18px;
      height: 18px;
      border: 2px solid var(--ldesign-border-level-2-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &.checked {
        border-color: var(--ldesign-brand-color);

        .radio-dot {
          width: 10px;
          height: 10px;
          background: var(--ldesign-brand-color);
          border-radius: 50%;
        }
      }
    }
  }

  .source-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .source-name {
      font-size: var(--ls-font-size-base);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }

    .source-url {
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-secondary);
      font-family: 'Consolas', 'Monaco', monospace;
      word-break: break-all;
    }

    .source-user {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-tertiary);

      svg {
        color: var(--ldesign-success-color);
      }
    }
  }

  .source-badge {
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: var(--ls-border-radius-sm);
    font-size: var(--ls-font-size-xs);
    font-weight: 500;

    &.public {
      background: var(--ldesign-brand-bg);
      color: var(--ldesign-brand-color);
    }

    &.private {
      background: var(--ldesign-warning-bg);
      color: var(--ldesign-warning-color);
    }
  }
}

.package-content {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);

  .package-item {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);

    .label {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
      font-weight: 500;
    }

    .value {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-primary);
    }

    .version-badge {
      padding: 4px 12px;
      background: linear-gradient(135deg, var(--ldesign-brand-color-light), var(--ldesign-brand-color-focus));
      border: 1px solid var(--ldesign-brand-color);
      border-radius: var(--ls-border-radius-md);
      font-size: var(--ls-font-size-sm);
      font-weight: 600;
      color: var(--ldesign-brand-color);
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .library-badge {
      padding: 2px 8px;
      background: var(--ldesign-success-bg);
      border-radius: var(--ls-border-radius-sm);
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-success-color);
      font-weight: 500;
    }
  }
}

.status-card {
  .status-header {
    display: flex;
    align-items: flex-start;
    gap: var(--ls-spacing-base);

    .status-icon {
      flex-shrink: 0;
      margin-top: 2px;

      &.running {
        color: var(--ldesign-brand-color);
        animation: spin 1s linear infinite;
      }

      &.success {
        color: var(--ldesign-success-color);
      }

      &.error {
        color: var(--ldesign-error-color);
      }

      &.idle {
        color: var(--ldesign-text-color-placeholder);
      }
    }

    .status-info {
      flex: 1;

      h3 {
        margin: 0 0 4px 0;
        font-size: var(--ls-font-size-lg);
        color: var(--ldesign-text-color-primary);
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
        line-height: 1.5;
      }
    }
  }

  .status-footer {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    margin-top: var(--ls-margin-base);
    padding-top: var(--ls-padding-base);
    border-top: 1px solid var(--ldesign-border-color);

    svg {
      color: var(--ldesign-brand-color);
    }

    .elapsed-time {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }
  }
}

.log-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  border: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);
  overflow: hidden;

  .log-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-base) var(--ls-padding-lg);
    border-bottom: 1px solid var(--ldesign-border-color);
    background: var(--ldesign-bg-color-component);

    svg {
      color: var(--ldesign-brand-color);
    }

    h3 {
      flex: 1;
      margin: 0;
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }

    .log-actions {
      display: flex;
      gap: var(--ls-spacing-xs);
    }

    .log-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      background: transparent;
      border: none;
      border-radius: var(--ls-border-radius-sm);
      color: var(--ldesign-text-color-secondary);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--ldesign-border-level-2-color);
        color: var(--ldesign-text-color-primary);
      }
    }
  }

  .log-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--ls-padding-base);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: var(--ls-font-size-sm);
    line-height: 1.6;
    background: var(--ldesign-bg-color-page);

    .log-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--ldesign-text-color-placeholder);

      svg {
        margin-bottom: var(--ls-spacing-base);
      }

      p {
        margin: 4px 0;
        color: var(--ldesign-text-color-secondary);
      }

      .log-hint {
        font-size: var(--ls-font-size-xs);
        color: var(--ldesign-text-color-placeholder);
      }
    }

    .log-line {
      display: flex;
      gap: var(--ls-spacing-sm);
      padding: 2px 0;

      .log-time {
        color: var(--ldesign-text-color-placeholder);
        flex-shrink: 0;
      }

      .log-message {
        flex: 1;
        color: var(--ldesign-text-color-primary);
        word-break: break-word;
        white-space: pre-wrap;
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

.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
  background: transparent;
  transition: background 0.2s;

  &:hover {
    background: var(--ldesign-brand-color);
  }
}

.btn-primary,
.btn-secondary,
.btn-back,
.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border: 1px solid transparent;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: var(--ldesign-brand-color);
  color: white;

  &:hover:not(:disabled) {
    background: var(--ldesign-brand-color-hover);
    transform: translateY(-1px);
    box-shadow: var(--ldesign-shadow-2);
  }
}

.btn-secondary {
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  border-color: var(--ldesign-border-color);

  &:hover:not(:disabled) {
    background: var(--ldesign-bg-color-container-hover);
    border-color: var(--ldesign-brand-color);
    transform: translateY(-1px);
    box-shadow: var(--ldesign-shadow-2);
  }
}

.btn-danger {
  background: var(--ldesign-error-color);
  color: white;

  &:hover:not(:disabled) {
    background: var(--ldesign-error-color-hover);
    transform: translateY(-1px);
    box-shadow: var(--ldesign-shadow-2);
  }
}

.btn-back {
  background: none;
  color: var(--ldesign-text-color-secondary);
  padding: var(--ls-padding-xs) var(--ls-padding-sm);

  &:hover {
    color: var(--ldesign-text-color-primary);
    background: var(--ldesign-bg-color-component-hover);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1200px) {
  .action-content {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    max-height: 400px;
  }

  .right-panel {
    width: 100% !important;
  }
}
</style>