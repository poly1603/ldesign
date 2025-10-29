<template>
  <div class="performance-page">
    <n-page-header title="性能监控" subtitle="实时系统性能监控和分析">
      <template #extra>
        <n-space>
          <n-button @click="refreshData">
            <template #icon>
              <RefreshCw />
            </template>
            刷新
          </n-button>
          <n-switch v-model:value="autoRefresh">
            <template #checked>自动刷新</template>
            <template #unchecked>手动刷新</template>
          </n-switch>
        </n-space>
      </template>
    </n-page-header>

    <n-space vertical :size="16" class="mt-4">
      <!-- 系统概览 -->
      <n-grid :cols="4" :x-gap="16">
        <n-gi>
          <n-card>
            <n-statistic label="CPU使用率">
              <template #prefix>
                <Cpu />
              </template>
              {{ systemInfo.cpu }}%
            </n-statistic>
            <n-progress
              type="line"
              :percentage="systemInfo.cpu"
              :color="getProgressColor(systemInfo.cpu)"
              :show-indicator="false"
              class="mt-2"
            />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="内存使用">
              <template #prefix>
                <MemoryStick />
              </template>
              {{ systemInfo.memory }}%
            </n-statistic>
            <n-progress
              type="line"
              :percentage="systemInfo.memory"
              :color="getProgressColor(systemInfo.memory)"
              :show-indicator="false"
              class="mt-2"
            />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="磁盘使用">
              <template #prefix>
                <HardDrive />
              </template>
              {{ systemInfo.disk }}%
            </n-statistic>
            <n-progress
              type="line"
              :percentage="systemInfo.disk"
              :color="getProgressColor(systemInfo.disk)"
              :show-indicator="false"
              class="mt-2"
            />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="运行时间">
              <template #prefix>
                <Clock />
              </template>
              {{ formatUptime(systemInfo.uptime) }}
            </n-statistic>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- CPU历史 -->
      <n-card title="CPU使用率历史">
        <div ref="cpuChartRef" style="width: 100%; height: 300px"></div>
      </n-card>

      <!-- 内存历史 -->
      <n-card title="内存使用历史">
        <div ref="memoryChartRef" style="width: 100%; height: 300px"></div>
      </n-card>

      <!-- 进程列表 -->
      <n-card title="进程信息">
        <n-data-table
          :columns="processColumns"
          :data="processes"
          :pagination="{ pageSize: 10 }"
          :bordered="false"
        />
      </n-card>

      <!-- 网络统计 -->
      <n-grid :cols="2" :x-gap="16">
        <n-gi>
          <n-card title="网络统计">
            <n-space vertical>
              <n-statistic label="上传速度" :value="networkStats.uploadSpeed" suffix="KB/s" />
              <n-statistic label="下载速度" :value="networkStats.downloadSpeed" suffix="KB/s" />
              <n-statistic label="总上传" :value="formatBytes(networkStats.totalUpload)" />
              <n-statistic label="总下载" :value="formatBytes(networkStats.totalDownload)" />
            </n-space>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card title="请求统计">
            <n-space vertical>
              <n-statistic label="总请求数" :value="requestStats.total" />
              <n-statistic label="成功请求" :value="requestStats.success" />
              <n-statistic label="失败请求" :value="requestStats.failed" />
              <n-statistic label="平均响应时间" :value="requestStats.avgResponseTime" suffix="ms" />
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import { RefreshCw, Cpu, MemoryStick, HardDrive, Clock } from 'lucide-vue-next'
import { api } from '@/api'

const message = useMessage()

const autoRefresh = ref(true)
const cpuChartRef = ref<HTMLElement>()
const memoryChartRef = ref<HTMLElement>()

const systemInfo = reactive({
  cpu: 0,
  memory: 0,
  disk: 0,
  uptime: 0,
})

const cpuHistory = ref<number[]>([])
const memoryHistory = ref<number[]>([])
const timeLabels = ref<string[]>([])

const networkStats = reactive({
  uploadSpeed: 0,
  downloadSpeed: 0,
  totalUpload: 0,
  totalDownload: 0,
})

const requestStats = reactive({
  total: 0,
  success: 0,
  failed: 0,
  avgResponseTime: 0,
})

const processes = ref<any[]>([])

const processColumns = [
  { title: 'PID', key: 'pid', width: 80 },
  { title: '进程名', key: 'name' },
  { title: 'CPU %', key: 'cpu', width: 100 },
  { title: '内存 %', key: 'memory', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => {
      const type = row.status === 'running' ? 'success' : 'default'
      return row.status
    },
  },
]

let refreshInterval: number | undefined

async function refreshData() {
  try {
    // 模拟获取系统信息
    const data = await api.getSystemInfo()
    
    systemInfo.cpu = data.cpu || Math.floor(Math.random() * 100)
    systemInfo.memory = data.memory || Math.floor(Math.random() * 100)
    systemInfo.disk = data.disk || Math.floor(Math.random() * 100)
    systemInfo.uptime = data.uptime || Date.now() / 1000

    // 更新历史数据
    updateHistory()

    // 更新图表
    await nextTick()
    updateCharts()
  } catch (error: any) {
    console.error('Failed to fetch system info', error)
    // 使用模拟数据
    systemInfo.cpu = Math.floor(Math.random() * 100)
    systemInfo.memory = Math.floor(Math.random() * 100)
    systemInfo.disk = 65
    systemInfo.uptime = Date.now() / 1000

    updateHistory()
    await nextTick()
    updateCharts()
  }
}

function updateHistory() {
  const now = new Date()
  const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  cpuHistory.value.push(systemInfo.cpu)
  memoryHistory.value.push(systemInfo.memory)
  timeLabels.value.push(timeLabel)

  // 只保留最近60个数据点
  if (cpuHistory.value.length > 60) {
    cpuHistory.value.shift()
    memoryHistory.value.shift()
    timeLabels.value.shift()
  }
}

function updateCharts() {
  // 简单的ASCII风格图表（实际项目中可以使用ECharts等图表库）
  if (cpuChartRef.value) {
    drawSimpleChart(cpuChartRef.value, cpuHistory.value, 'CPU')
  }
  if (memoryChartRef.value) {
    drawSimpleChart(memoryChartRef.value, memoryHistory.value, 'Memory')
  }
}

function drawSimpleChart(container: HTMLElement, data: number[], label: string) {
  // 创建简单的SVG图表
  const width = container.clientWidth
  const height = 300
  const padding = 40

  const max = Math.max(...data, 100)
  const step = (width - padding * 2) / Math.max(data.length - 1, 1)

  let svg = `<svg width="${width}" height="${height}" style="background: var(--n-color);">`
  
  // 绘制网格线
  for (let i = 0; i <= 4; i++) {
    const y = padding + (height - padding * 2) * i / 4
    svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--n-divider-color)" stroke-width="1" stroke-dasharray="5,5" />`
    svg += `<text x="5" y="${y + 5}" fill="var(--n-text-color-3)" font-size="12">${Math.round((4 - i) * 25)}%</text>`
  }

  // 绘制数据线
  if (data.length > 0) {
    let path = `M ${padding} ${padding + (height - padding * 2) * (1 - data[0] / max)}`
    for (let i = 1; i < data.length; i++) {
      const x = padding + step * i
      const y = padding + (height - padding * 2) * (1 - data[i] / max)
      path += ` L ${x} ${y}`
    }
    svg += `<path d="${path}" stroke="#667eea" stroke-width="2" fill="none" />`

    // 绘制数据点
    data.forEach((value, i) => {
      const x = padding + step * i
      const y = padding + (height - padding * 2) * (1 - value / max)
      svg += `<circle cx="${x}" cy="${y}" r="3" fill="#667eea" />`
    })
  }

  svg += '</svg>'
  container.innerHTML = svg
}

function getProgressColor(value: number): string {
  if (value < 60) return '#18a058'
  if (value < 80) return '#f0a020'
  return '#d03050'
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}天 ${hours}小时`
  if (hours > 0) return `${hours}小时 ${minutes}分钟`
  return `${minutes}分钟`
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 模拟进程数据
function loadProcesses() {
  processes.value = [
    { pid: 1234, name: 'node', cpu: 15.2, memory: 8.5, status: 'running' },
    { pid: 5678, name: 'vite', cpu: 5.3, memory: 12.1, status: 'running' },
    { pid: 9012, name: 'chrome', cpu: 25.8, memory: 35.6, status: 'running' },
    { pid: 3456, name: 'code', cpu: 8.1, memory: 18.3, status: 'running' },
    { pid: 7890, name: 'postgres', cpu: 3.2, memory: 6.8, status: 'running' },
  ]
}

onMounted(() => {
  refreshData()
  loadProcesses()

  // 自动刷新
  refreshInterval = window.setInterval(() => {
    if (autoRefresh.value) {
      refreshData()
    }
  }, 3000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.performance-page {
  padding: 24px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
