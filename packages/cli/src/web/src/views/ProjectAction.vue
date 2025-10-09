<template>
  <div class="project-action-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn-back">
          <ArrowLeft :size="18" />
          <span>返回</span>
        </button>
        <div class="action-info">
          <div class="action-icon-wrapper">
            <component :is="actionIcon" :size="32" class="action-icon" />
          </div>
          <div class="action-text">
            <h1>{{ actionTitle }}</h1>
            <p class="project-name">{{ project?.name }}</p>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <!-- 如果是 both 类型且是 build 操作，显示产物构建按钮 -->
        <button
          v-if="actionType === 'build' && project?.type === 'both' && !running"
          @click="buildLibrary"
          class="btn-secondary"
          title="构建库产物"
        >
          <Package :size="18" />
          <span>产物构建</span>
        </button>

        <!-- 发布到npm按钮（打包完成且产物存在时显示） -->
        <button
          v-if="actionType === 'build' && !running && buildSummary?.exists"
          @click="openPublish"
          class="btn-publish"
          title="发布到npm"
        >
          <Upload :size="18" />
          <span>发布到npm</span>
        </button>

        <!-- 产物分析按钮（打包完成且产物存在时显示） -->
        <button
          v-if="actionType === 'build' && !running && buildSummary?.exists"
          @click="openBuildAnalysis"
          class="btn-info"
          title="产物分析"
        >
          <BarChart :size="18" />
          <span>产物分析</span>
        </button>

        <button v-if="!running" @click="startAction" :disabled="running" class="btn-primary">
          <Play :size="18" />
          <span>开始{{ actionTitle }}</span>
        </button>
        <button v-else @click="stopAction" class="btn-danger">
          <Square :size="18" />
          <span>停止</span>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="action-content">
      <!-- 左侧：环境选择和状态 -->
      <div class="left-panel">
        <!-- 产物摘要卡片（优先显示，仅在打包页面且产物存在时显示） -->
        <div class="build-summary-card" v-if="actionType === 'build' && buildSummary?.exists">
          <div class="card-header">
            <BarChart :size="20" />
            <h3>产物信息</h3>
          </div>
          <div class="build-summary-content">
            <div class="summary-item">
              <span class="label">上次打包:</span>
              <span class="value">{{ formatBuildTime(buildSummary.lastBuildTime) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">产物目录:</span>
              <div class="value">
                <div v-if="buildSummary.distDirectories && buildSummary.distDirectories.length > 0" class="dist-directories">
                  <span v-for="(dir, index) in buildSummary.distDirectories" :key="index" class="directory-badge">
                    {{ dir }}
                  </span>
                </div>
                <span v-else class="directory">{{ buildSummary.distPath }}</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="label">文件数量:</span>
              <span class="value">{{ buildSummary.totalFiles }} 个</span>
            </div>
            <div class="summary-item">
              <span class="label">总大小:</span>
              <span class="value size">{{ formatSize(buildSummary.totalSize) }}</span>
            </div>
            <div v-if="buildSummary.largestFile" class="summary-item">
              <span class="label">最大文件:</span>
              <span class="value file">{{ buildSummary.largestFile.name }} ({{ formatSize(buildSummary.largestFile.size) }})</span>
            </div>
          </div>
        </div>

        <!-- 环境选择器 -->
        <div class="environment-card" v-if="showEnvironmentSelector">
          <EnvironmentSelector v-model="selectedEnvironment" />
        </div>

        <!-- 版本管理（仅在打包页面显示） -->
        <div class="version-card" v-if="actionType === 'build' && packageInfo">
          <div class="version-header">
            <Package :size="20" />
            <div class="version-info">
              <h3>包信息</h3>
              <div class="package-name">{{ packageInfo.name }}</div>
            </div>
          </div>
          <div class="version-current">
            <span class="label">当前版本:</span>
            <span class="version-badge">v{{ packageInfo.version }}</span>
            <span v-if="packageInfo.isLibrary" class="library-badge">库项目</span>
          </div>
          <div class="version-selector-wrapper">
            <VersionSelector v-model="selectedVersionBump" :current-version="packageInfo.version" :disabled="running" />
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
          <!-- 构建完成时间信息 -->
          <div v-if="actionType === 'build' && !running && buildEndTime" class="build-time-info">
            <div class="build-time-item">
              <span class="build-time-label">完成时间:</span>
              <span class="build-time-value">{{ buildEndTime }}</span>
            </div>
            <div class="build-time-item">
              <span class="build-time-label">耗时:</span>
              <span class="build-time-value">{{ buildDuration }}</span>
            </div>
          </div>
        </div>


        <!-- 服务地址卡片 -->
        <div v-if="serverUrls.local.length > 0 || serverUrls.network.length > 0" class="server-card">
          <div class="server-header">
            <Globe :size="20" />
            <h3>服务地址</h3>
          </div>
          <div class="server-content">
            <!-- 本地地址 -->
            <div v-if="serverUrls.local.length > 0" class="url-item">
              <div class="url-label">本地访问</div>
              <div class="url-value">
                <a :href="serverUrls.local[0]" target="_blank" class="url-link">
                  {{ serverUrls.local[0] }}
                </a>
                <button @click="copyUrl(serverUrls.local[0])" class="btn-copy" title="复制">
                  <Copy :size="14" />
                </button>
              </div>
            </div>

            <!-- 网络地址 -->
            <div v-if="serverUrls.network.length > 0" class="url-item">
              <div class="url-label">网络访问</div>
              <div class="url-value">
                <a :href="serverUrls.network[0]" target="_blank" class="url-link">
                  {{ serverUrls.network[0] }}
                </a>
                <button @click="copyUrl(serverUrls.network[0])" class="btn-copy" title="复制">
                  <Copy :size="14" />
                </button>
              </div>
            </div>

            <!-- 二维码 -->
            <div v-if="serverUrls.network.length > 0" class="qrcode-section">
              <div class="qrcode-label">扫码访问</div>
              <div class="qrcode-container">
                <canvas ref="qrcodeCanvas" class="qrcode-canvas"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- 配置信息 -->
        <div class="config-card" v-if="configInfo">
          <div class="config-header">
            <Settings :size="20" />
            <h3>配置信息</h3>
          </div>
          <div class="config-content">
            <div class="config-item">
              <span class="config-label">环境:</span>
              <span class="config-value">{{ selectedEnvironment }}</span>
            </div>
            <div class="config-item" v-if="configInfo.port">
              <span class="config-label">端口:</span>
              <span class="config-value">{{ configInfo.port }}</span>
            </div>
            <div class="config-item" v-if="configInfo.outDir">
              <span class="config-label">输出目录:</span>
              <span class="config-value">{{ configInfo.outDir }}</span>
            </div>
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
              <p class="log-hint">点击"开始{{ actionTitle }}"按钮开始执行</p>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Play, Square, Clock, Terminal, Trash2, Download, FileText, Settings,
  Code, Package, Eye, Upload, Rocket, TestTube,
  Loader2, CheckCircle, XCircle, AlertCircle, Globe, Copy, ChevronLeft, ChevronRight, BarChart
} from 'lucide-vue-next'
import EnvironmentSelector from '../components/EnvironmentSelector.vue'
import VersionSelector from '../components/VersionSelector.vue'
import type { VersionBumpType } from '../components/VersionSelector.vue'
import { useApi } from '../composables/useApi'
import { useWebSocket } from '../composables/useWebSocket'
import { useMessage } from '../composables/useMessage'
import { useConfirm } from '../composables/useConfirm'
import { formatLogMessage, extractUrls, type ExtractedUrls } from '../utils/logParser'
import QRCode from 'qrcode'

// 路由
const route = useRoute()
const router = useRouter()

// API
const api = useApi()
const { subscribe } = useWebSocket()
const message = useMessage()
const confirm = useConfirm()

// 响应式数据
const project = ref<any>(null)
const running = ref(false)
const logs = ref<Array<{ time: string; message: string; html: string; type: string }>>([])
const logContentRef = ref<HTMLElement | null>(null)
const qrcodeCanvas = ref<HTMLCanvasElement | null>(null)
const startTime = ref<number>(0)
const elapsedTime = ref('00:00:00')
// 从 URL 读取环境参数，默认为 development
const selectedEnvironment = ref((route.query.env as string) || 'development')
const configInfo = ref<any>(null)
const currentProcessId = ref<string | null>(null)
const serverUrls = ref<ExtractedUrls>({ local: [], network: [], all: [] })
const logPanelCollapsed = ref(false)
const logPanelWidth = ref(60) // 日志面板宽度百分比
const packageInfo = ref<any>(null) // 包信息
const selectedVersionBump = ref<VersionBumpType>('none') // 选择的版本升级方式
const buildSummary = ref<any>(null) // 产物摘要
const buildEndTime = ref<string>('') // 构建完成时间
const buildDuration = ref<string>('') // 构建耗时
let elapsedTimer: number | null = null
let unsubscribeList: (() => void)[] = []

// 状态持久化 key
const getStorageKey = () => {
  const projectId = route.params.id as string
  const action = route.params.action as string
  return `project-action-${projectId}-${action}-${selectedEnvironment.value}`
}

// 操作类型映射
const actionMap: Record<string, any> = {
  dev: { title: '开发', icon: Code, endpoint: '/dev', supportsEnv: true },
  build: { title: '打包', icon: Package, endpoint: '/build', supportsEnv: true },
  preview: { title: '预览', icon: Eye, endpoint: '/preview', supportsEnv: true },
  publish: { title: '发布', icon: Upload, endpoint: '/publish', supportsEnv: false },
  deploy: { title: '部署', icon: Rocket, endpoint: '/deploy', supportsEnv: true },
  test: { title: '测试', icon: TestTube, endpoint: '/test', supportsEnv: false }
}

// 计算属性
const actionType = computed(() => route.params.action as string)
const actionConfig = computed(() => actionMap[actionType.value] || actionMap.dev)
const actionTitle = computed(() => actionConfig.value.title)
const actionIcon = computed(() => actionConfig.value.icon)

// 根据项目类型和操作类型决定是否显示环境选择器
const showEnvironmentSelector = computed(() => {
  // 如果操作本身不支持环境选择，直接返回 false
  if (!actionConfig.value.supportsEnv) {
    return false
  }

  // 如果是 build 操作
  if (actionType.value === 'build') {
    // 如果是纯库项目，不显示环境选择器
    if (project.value?.type === 'library') {
      return false
    }
  }

  return true
})

const statusIcon = computed(() => {
  // 如果有服务地址，说明启动成功
  const hasServerUrl = serverUrls.value.local.length > 0 || serverUrls.value.network.length > 0

  if (running.value && !hasServerUrl) return Loader2
  if (logs.value.some(log => log.type === 'error')) return XCircle
  if (hasServerUrl || logs.value.length > 0) return CheckCircle
  return AlertCircle
})

const statusClass = computed(() => {
  const hasServerUrl = serverUrls.value.local.length > 0 || serverUrls.value.network.length > 0

  if (running.value && !hasServerUrl) return 'running'
  if (logs.value.some(log => log.type === 'error')) return 'error'
  if (hasServerUrl || logs.value.length > 0) return 'success'
  return 'idle'
})

const statusText = computed(() => {
  const hasServerUrl = serverUrls.value.local.length > 0 || serverUrls.value.network.length > 0

  if (running.value && !hasServerUrl) return '运行中...'
  if (logs.value.some(log => log.type === 'error')) return '执行失败'
  if (hasServerUrl) return '运行中'
  if (logs.value.length > 0) return '执行完成'
  return '就绪'
})

const statusDescription = computed(() => {
  const hasServerUrl = serverUrls.value.local.length > 0 || serverUrls.value.network.length > 0

  if (running.value && !hasServerUrl) return `正在执行${actionTitle.value}操作`
  if (logs.value.some(log => log.type === 'error')) return '操作执行过程中出现错误'
  if (hasServerUrl) return '服务已启动'
  if (logs.value.length > 0) return '操作已成功完成'
  return `点击开始按钮执行${actionTitle.value}操作`
})

// 方法
const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  // 格式化日志消息
  const formatted = formatLogMessage(message)

  logs.value.push({
    time,
    message: formatted.plain,
    html: formatted.html,
    type: formatted.type
  })

  // 提取 URL
  if (formatted.urls.all.length > 0) {
    serverUrls.value = formatted.urls
    // 生成二维码
    nextTick(() => {
      generateQRCode()
    })
  }

  // 保存状态
  saveState()

  // 自动滚动到底部
  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight
    }
  })
}

// 生成二维码
const generateQRCode = async () => {
  const url = serverUrls.value.network[0] || serverUrls.value.local[0]
  if (!url || !qrcodeCanvas.value) return

  try {
    await QRCode.toCanvas(qrcodeCanvas.value, url, {
      width: 140,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
}

// 复制 URL
const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    console.log('已复制:', url)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 切换日志面板
const toggleLogPanel = () => {
  logPanelCollapsed.value = !logPanelCollapsed.value
}

// 调整日志面板宽度
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

const clearLogs = () => {
  logs.value = []
  serverUrls.value = { local: [], network: [], all: [] }
  saveState()
}

const downloadLogs = () => {
  const content = logs.value.map(log => `[${log.time}] ${log.message}`).join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${actionType.value}-${selectedEnvironment.value}-${Date.now()}.log`
  a.click()
  URL.revokeObjectURL(url)
}

// 保存状态到 localStorage
const saveState = () => {
  const state = {
    running: running.value,
    logs: logs.value,
    startTime: startTime.value,
    elapsedTime: elapsedTime.value,
    currentProcessId: currentProcessId.value,
    serverUrls: serverUrls.value,
    timestamp: Date.now()
  }
  localStorage.setItem(getStorageKey(), JSON.stringify(state))
}

// 从 localStorage 恢复状态
const restoreState = () => {
  const key = getStorageKey()
  const saved = localStorage.getItem(key)

  if (!saved) return

  try {
    const state = JSON.parse(saved)

    // 只恢复 5 分钟内的状态
    if (Date.now() - state.timestamp > 5 * 60 * 1000) {
      localStorage.removeItem(key)
      return
    }

    logs.value = state.logs || []
    serverUrls.value = state.serverUrls || { local: [], network: [], all: [] }

    // 如果有服务地址，生成二维码
    if (serverUrls.value.local.length > 0 || serverUrls.value.network.length > 0) {
      nextTick(() => {
        generateQRCode()
      })
    }

    // 如果进程还在运行，尝试重新连接
    if (state.running && state.currentProcessId) {
      currentProcessId.value = state.currentProcessId
      running.value = true
      startTime.value = state.startTime
      elapsedTime.value = state.elapsedTime

      // 重新订阅 WebSocket
      subscribeToProcess()

      // 重启计时器
      elapsedTimer = window.setInterval(updateElapsedTime, 1000)
    }
  } catch (error) {
    console.error('恢复状态失败:', error)
    localStorage.removeItem(key)
  }
}

// 标记是否已经处理过退出事件，防止重复处理
let isExitHandled = false

// 订阅进程事件
const subscribeToProcess = () => {
  // 清理旧的订阅
  unsubscribeList.forEach(unsubscribe => unsubscribe())
  unsubscribeList = []
  
  // 重置退出处理标记
  isExitHandled = false

  const unsubscribeLog = subscribe('process-log', (data: any) => {
    if (data.processId === currentProcessId.value) {
      const message = data.message.trim()
      if (message) {
        addLog(message, data.logType === 'stderr' ? 'error' : 'info')
      }
    }
  })

  const unsubscribeExit = subscribe('process-exit', (data: any) => {
    if (data.processId === currentProcessId.value && !isExitHandled) {
      // 标记已处理，防止重复触发
      isExitHandled = true
      
      running.value = false
      if (elapsedTimer) {
        clearInterval(elapsedTimer)
        elapsedTimer = null
      }
      
      // 基于退出码判断成功/失败
      const isSuccess = data.code === 0
      addLog(`进程已退出 (退出码: ${data.code})`, isSuccess ? 'success' : 'error')
      
      // 只在成功时显示成功消息
      if (isSuccess) {
        message.success('执行成功')
        
        // 记录构建完成时间和耗时
        if (actionType.value === 'build') {
          const now = new Date()
          buildEndTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
          buildDuration.value = elapsedTime.value
        }
      } else {
        // 失败时显示错误消息
        message.error('执行失败')
      }
      
      saveState()
      
      // 如果是打包操作且成功，加载产物摘要
      if (actionType.value === 'build' && isSuccess) {
        setTimeout(() => {
          loadBuildSummary()
        }, 500) // 等待文件写入完成
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
      message.error('进程错误')
      saveState()
    }
  })

  unsubscribeList.push(unsubscribeLog, unsubscribeExit, unsubscribeError)
}

const updateElapsedTime = () => {
  const elapsed = Date.now() - startTime.value
  const hours = Math.floor(elapsed / 3600000)
  const minutes = Math.floor((elapsed % 3600000) / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)
  elapsedTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const startAction = async () => {
  // 防止重复执行
  if (running.value) {
    message.warning('任务正在执行中，请稍候...')
    return
  }
  
  if (!project.value) {
    addLog('项目信息未加载', 'error')
    return
  }

  // 如果是打包操作，且选择了版本升级，先升级版本
  if (actionType.value === 'build' && selectedVersionBump.value !== 'none') {
    try {
      addLog(`正在升级版本号 (${selectedVersionBump.value})...`, 'info')
      const projectId = route.params.id as string
      const versionResult = await api.post(`/api/projects/${projectId}/update-version`, {
        bumpType: selectedVersionBump.value
      })

      if (versionResult.success) {
        addLog(`✓ 版本已更新: ${versionResult.data.oldVersion} → ${versionResult.data.newVersion}`, 'success')
        // 重新加载包信息
        await loadPackageInfo()
      } else {
        addLog(`版本更新失败: ${versionResult.message}`, 'error')
        message.error('版本更新失败，打包已取消')
        return
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '版本更新失败'
      addLog(errorMsg, 'error')
      message.error('版本更新失败，打包已取消')
      return
    }
  }

  running.value = true
  startTime.value = Date.now()
  logs.value = []
  serverUrls.value = { local: [], network: [], all: [] }

  addLog(`开始${actionTitle.value}...`, 'info')
  if (showEnvironmentSelector.value) {
    addLog(`环境: ${selectedEnvironment.value}`, 'info')
  }
  if (actionType.value === 'build' && packageInfo.value) {
    addLog(`包名: ${packageInfo.value.name}`, 'info')
    addLog(`版本: ${packageInfo.value.version}`, 'info')
  }

  // 启动计时器
  elapsedTimer = window.setInterval(updateElapsedTime, 1000)

  try {
    const projectId = route.params.id as string

    // 调用进程管理 API 启动进程
    const response = await api.post('/api/process/start', {
      projectPath: project.value.path,
      projectId,
      action: actionType.value,
      environment: selectedEnvironment.value
    })

    if (response.success) {
      currentProcessId.value = response.data.processId
      addLog(`进程已启动 (ID: ${response.data.processId})`, 'success')

      // 订阅进程事件
      subscribeToProcess()

      // 保存状态
      saveState()
    } else {
      running.value = false
      if (elapsedTimer) {
        clearInterval(elapsedTimer)
        elapsedTimer = null
      }
      addLog(response.message || `${actionTitle.value}失败`, 'error')
    }
  } catch (error) {
    running.value = false
    if (elapsedTimer) {
      clearInterval(elapsedTimer)
      elapsedTimer = null
    }
    addLog(error instanceof Error ? error.message : `${actionTitle.value}失败`, 'error')
  }
}

/**
 * 构建库产物（执行 build:lib 命令）
 */
const buildLibrary = async () => {
  if (!project.value) {
    addLog('项目信息未加载', 'error')
    return
  }

  if (running.value) {
    message.warning('已有任务正在运行，请先停止')
    return
  }

  running.value = true
  startTime.value = Date.now()
  logs.value = []
  serverUrls.value = { local: [], network: [], all: [] }

  addLog('开始构建库产物...', 'info')
  addLog('执行命令: pnpm run build:lib', 'info')

  // 启动计时器
  elapsedTimer = window.setInterval(updateElapsedTime, 1000)

  try {
    const projectId = route.params.id as string

    // 调用进程管理 API 启动进程，使用特殊的 action 类型
    const response = await api.post('/api/process/start', {
      projectPath: project.value.path,
      projectId,
      action: 'build:lib', // 特殊的 action 类型
      environment: 'production' // 库构建通常使用 production 环境
    })

    if (response.success) {
      currentProcessId.value = response.data.processId
      addLog(`进程已启动 (ID: ${response.data.processId})`, 'success')

      // 订阅进程事件
      subscribeToProcess()

      // 保存状态
      saveState()
    } else {
      running.value = false
      if (elapsedTimer) {
        clearInterval(elapsedTimer)
        elapsedTimer = null
      }
      addLog(response.message || '构建库产物失败', 'error')
    }
  } catch (error) {
    running.value = false
    if (elapsedTimer) {
      clearInterval(elapsedTimer)
      elapsedTimer = null
    }
    addLog(error instanceof Error ? error.message : '构建库产物失败', 'error')
  }
}

const stopAction = async () => {
  if (!currentProcessId.value) {
    addLog('没有正在运行的进程', 'warning')
    return
  }

  // 使用 Confirm 组件确认
  const result = await confirm.show({
    title: '确认停止',
    content: `确定要停止当前${actionTitle.value}操作吗？`,
    type: 'warning',
    confirmText: '停止',
    cancelText: '取消'
  })

  if (!result) {
    return
  }

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
      message.warning('进程已停止')
      currentProcessId.value = null
      serverUrls.value = { local: [], network: [], all: [] }
      saveState()
      // 重新加载产物摘要
      if (actionType.value === 'build') {
        await loadBuildSummary()
      }
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

const goBack = () => {
  const projectId = route.params.id as string
  router.push(`/projects/${projectId}`)
}

const loadProject = async () => {
  const projectId = route.params.id as string
  try {
    const response = await api.get(`/api/projects/${projectId}`)
    if (response.success) {
      project.value = response.data
      // 如果是打包页面，加载包信息和产物摘要
      if (actionType.value === 'build') {
        await loadPackageInfo()
        await loadBuildSummary()
      }
    }
  } catch (error) {
    console.error('加载项目失败:', error)
  }
}

/**
 * 加载包信息
 */
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

/**
 * 加载产物摘要
 */
const loadBuildSummary = async () => {
  const projectId = route.params.id as string
  try {
    const response = await api.get(`/api/projects/${projectId}/build-summary`)
    if (response.success) {
      buildSummary.value = response.data
    }
  } catch (error) {
    console.error('加载产物摘要失败:', error)
  }
}

/**
 * 打开产物分析页面
 */
const openBuildAnalysis = () => {
  const projectId = route.params.id as string
  // 使用路由导航到产物分析页面
  router.push(`/projects/${projectId}/build-analysis`)
}

/**
 * 打开发布页面
 */
const openPublish = () => {
  const projectId = route.params.id as string
  // 使用路由导航到发布页面
  router.push(`/projects/${projectId}/publish`)
}

/**
 * 格式化构建时间
 */
const formatBuildTime = (timestamp: number) => {
  if (!timestamp) return '未知'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 如果是今天，只显示时间
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 如果是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 其他，显示完整日期
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化文件大小
 */
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 监听环境变化，更新 URL 并重新加载状态
watch(selectedEnvironment, (newEnv, oldEnv) => {
  // 如果是初始化，不执行清除操作
  if (oldEnv === undefined) return

  // 更新 URL 查询参数
  router.replace({
    query: {
      ...route.query,
      env: newEnv
    }
  })

  // 清除当前状态
  if (running.value) {
    // 如果有正在运行的进程，先停止
    stopAction()
  }

  // 清除日志和状态
  logs.value = []
  serverUrls.value = { local: [], network: [], all: [] }
  running.value = false
  currentProcessId.value = null
  startTime.value = 0
  elapsedTime.value = '00:00:00'
  buildEndTime.value = ''
  buildDuration.value = ''

  if (elapsedTimer) {
    clearInterval(elapsedTimer)
    elapsedTimer = null
  }

  // 清除旧的订阅
  unsubscribeList.forEach(unsubscribe => unsubscribe())
  unsubscribeList = []

  // 恢复新环境的状态
  restoreState()
})

// 生命周期
onMounted(() => {
  loadProject()
  restoreState()
})

onUnmounted(() => {
  if (elapsedTimer) {
    clearInterval(elapsedTimer)
  }
  unsubscribeList.forEach(unsubscribe => unsubscribe())
  saveState()
})
</script>

<style lang="less" scoped>
.project-action-page {
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
        background: linear-gradient(135deg, var(--ldesign-brand-color-focus), var(--ldesign-brand-color-hover));
        border-radius: var(--ls-border-radius-lg);
        box-shadow: var(--ldesign-shadow-2);

        .action-icon {
          color: var(--ldesign-brand-color);
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
  overflow: hidden;
  min-height: 0;
}

.left-panel {
  width: 400px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg);
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease, flex 0.3s ease;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--ldesign-bg-color-component);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ldesign-border-level-2-color);
    border-radius: 3px;

    &:hover {
      background: var(--ldesign-border-level-3-color);
    }
  }
}

// 当日志面板收起时，左侧面板铺满
.action-content:has(.right-panel[style*="width: 48px"]) .left-panel {
  flex: 1;
  width: auto;
}

.right-panel {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  min-width: 0;
  transition: width 0.3s ease;

  .resize-handle {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: ew-resize;
    background: transparent;
    transition: background 0.2s;
    z-index: 10;

    &:hover {
      background: var(--ldesign-brand-color);
    }
  }
}

.environment-card,
.status-card,
.config-card,
.server-card,
.version-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-lg);
  box-shadow: var(--ldesign-shadow-1);
}

// 版本卡片样式
.version-card {
  .version-header {
    display: flex;
    align-items: flex-start;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-margin-base);
    padding-bottom: var(--ls-padding-base);
    border-bottom: 1px solid var(--ldesign-border-color);

    svg {
      color: var(--ldesign-brand-color);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .version-info {
      flex: 1;
      min-width: 0;

      h3 {
        margin: 0 0 4px 0;
        font-size: var(--ls-font-size-base);
        color: var(--ldesign-text-color-primary);
        font-weight: 600;
      }

      .package-name {
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
        font-family: 'Consolas', 'Monaco', monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .version-current {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-margin-base);

    .label {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
    }

    .version-badge {
      display: inline-flex;
      align-items: center;
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
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background: var(--ldesign-success-bg);
      border-radius: var(--ls-border-radius-sm);
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-success-color);
      font-weight: 500;
    }
  }

  .version-selector-wrapper {
    margin-top: var(--ls-margin-base);
  }
}

.status-card,
.build-summary-card {
  .status-header,
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

.status-card {
  .status-header {
    display: flex;
    align-items: flex-start;
    gap: var(--ls-spacing-base);
    margin-bottom: 0;

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

  .build-time-info {
    margin-top: var(--ls-margin-sm);
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-sm);
    border: 1px solid var(--ldesign-border-level-1-color);

    .build-time-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--ls-padding-xs) 0;

      &:not(:last-child) {
        border-bottom: 1px solid var(--ldesign-border-color);
      }

      .build-time-label {
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
        font-weight: 500;
      }

      .build-time-value {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-primary);
        font-weight: 600;
      }
    }
  }
}

.build-summary-card {
  // 使用与包信息相同的样式结构
  .card-header {
    display: flex;
    align-items: flex-start;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-margin-base);
    padding-bottom: var(--ls-padding-base);
    border-bottom: 1px solid var(--ldesign-border-color);

    svg {
      color: var(--ldesign-brand-color);
      flex-shrink: 0;
      margin-top: 2px;
    }

    h3 {
      margin: 0;
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }
  }

  .build-summary-content {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-base);

    .summary-item {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);

      .label {
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
      }

      .value {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--ls-spacing-xs);
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-primary);
        font-weight: 500;

        &.size {
          font-family: 'Consolas', 'Monaco', monospace;
          font-weight: 600;
          color: var(--ldesign-success-color);
        }

        &.file {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: var(--ls-font-size-xs);
        }

        .dist-directories {
          display: flex;
          flex-wrap: wrap;
          gap: var(--ls-spacing-xs);

          .directory-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            background: linear-gradient(135deg, var(--ldesign-brand-color-light), var(--ldesign-brand-color-focus));
            border: 1px solid var(--ldesign-brand-color);
            border-radius: var(--ls-border-radius-base);
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: var(--ls-font-size-xs);
            font-weight: 600;
            color: var(--ldesign-brand-color);
            transition: all 0.2s ease;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(94, 42, 167, 0.2);
            }
          }
        }

        .directory {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: var(--ls-font-size-sm);
          color: var(--ldesign-brand-color);
        }
      }
    }
  }
}

.server-card {
  .server-header {
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

  .server-content {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-base);
  }

  .url-item {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-xs);
  }

  .url-label {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    font-weight: 500;
  }

  .url-value {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-component);
    border: 1px solid var(--ldesign-border-level-1-color);
    border-radius: var(--ls-border-radius-sm);
  }

  .url-link {
    flex: 1;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-brand-color);
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      color: var(--ldesign-brand-color-hover);
      text-decoration: underline;
    }
  }

  .btn-copy {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    background: transparent;
    border: none;
    border-radius: var(--ls-border-radius-sm);
    cursor: pointer;
    color: var(--ldesign-text-color-secondary);
    transition: all 0.2s;

    &:hover {
      background: var(--ldesign-bg-color-container-hover);
      color: var(--ldesign-brand-color);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .qrcode-section {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-xs);
    padding-top: var(--ls-padding-sm);
    border-top: 1px solid var(--ldesign-border-level-1-color);
  }

  .qrcode-label {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    font-weight: 500;
  }

  .qrcode-container {
    display: flex;
    justify-content: center;
    padding: var(--ls-padding-sm);
    background: #ffffff;
    border-radius: var(--ls-border-radius-sm);
  }

  .qrcode-canvas {
    display: block;
    border-radius: var(--ls-border-radius-sm);
  }
}

.config-card {
  .config-header {
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

  .config-content {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-sm);
  }

  .config-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-base);

    .config-label {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
    }

    .config-value {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-primary);
      font-weight: 500;
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
}

.log-card {
  flex: 1;
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--ldesign-shadow-1);

  .log-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-component);
    border-bottom: 1px solid var(--ldesign-border-color);

    svg {
      color: var(--ldesign-brand-color);
    }

    h3 {
      margin: 0;
      flex: 1;
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }

    .log-actions {
      display: flex;
      gap: var(--ls-spacing-xs);
    }

    .log-action-btn {
      padding: 6px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--ldesign-text-color-secondary);
      border-radius: var(--ls-border-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: var(--ldesign-bg-color-component-hover);
        color: var(--ldesign-text-color-primary);
      }
    }
  }

  .log-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-component);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    min-height: 0;

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: var(--ldesign-bg-color-container);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--ldesign-border-level-2-color);
      border-radius: 4px;

      &:hover {
        background: var(--ldesign-border-level-3-color);
      }
    }

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
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;

        // 支持 ANSI 颜色
        :deep(span) {
          font-family: inherit;
        }
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

/* 按钮样式 */
.btn-primary,
.btn-secondary,
.btn-info,
.btn-publish,
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

.btn-info {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1565c0;
  border-color: #90caf9;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #bbdefb, #90caf9);
    color: #0d47a1;
    border-color: #42a5f5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  }
}

.btn-publish {
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  color: #7b1fa2;
  border-color: #ce93d8;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #e1bee7, #ce93d8);
    color: #4a148c;
    border-color: #ba68c8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .action-content {
    grid-template-columns: 350px 1fr;
  }
}

@media (max-width: 968px) {
  .action-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .left-panel {
    overflow-y: visible;
  }
}

@media (max-width: 768px) {
  .project-action-page {
    padding: var(--ls-padding-base);
  }

  .page-header {
    flex-direction: column;
    gap: var(--ls-spacing-base);
    align-items: stretch;

    .header-left {
      flex-direction: column;
      align-items: flex-start;
    }

    .header-actions {
      justify-content: stretch;

      button {
        flex: 1;
      }
    }
  }
}
</style>
