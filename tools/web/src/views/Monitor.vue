<template>
  <n-layout style="height: 100vh">
    <n-layout-header bordered style="height: 64px; padding: 0 24px; display: flex; align-items: center">
      <h2>系统监控</h2>
      <n-space style="margin-left: auto">
        <n-switch v-model:value="autoRefresh">
          <template #checked>自动刷新</template>
          <template #unchecked>手动刷新</template>
        </n-switch>
        <n-button @click="fetchMetrics">🔄 刷新</n-button>
      </n-space>
    </n-layout-header>

    <n-layout-content style="padding: 24px">
      <n-grid cols="2" x-gap="24" y-gap="24">
        <n-grid-item>
          <n-card title="CPU 使用率">
            <n-progress
              type="circle"
              :percentage="metrics.cpu"
              :color="getColor(metrics.cpu)"
              :height="24"
            >
              <div style="font-size: 24px">{{ metrics.cpu.toFixed(1) }}%</div>
            </n-progress>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card title="内存使用率">
            <n-progress
              type="circle"
              :percentage="metrics.memory"
              :color="getColor(metrics.memory)"
              :height="24"
            >
              <div style="font-size: 24px">{{ metrics.memory.toFixed(1) }}%</div>
            </n-progress>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card title="磁盘使用率">
            <n-progress
              type="circle"
              :percentage="metrics.disk"
              :color="getColor(metrics.disk)"
              :height="24"
            >
              <div style="font-size: 24px">{{ metrics.disk.toFixed(1) }}%</div>
            </n-progress>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card title="网络流量">
            <n-space vertical>
              <n-statistic label="接收" :value="formatBytes(metrics.network.rx)" />
              <n-statistic label="发送" :value="formatBytes(metrics.network.tx)" />
            </n-space>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-card title="更新时间" style="margin-top: 24px">
        <n-text>{{ new Date(metrics.timestamp).toLocaleString() }}</n-text>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NCard,
  NGrid,
  NGridItem,
  NSpace,
  NButton,
  NProgress,
  NStatistic,
  NText,
  NSwitch,
  useMessage,
} from 'naive-ui'
import { monitorApi, type SystemMetrics } from '../api/monitor'

const message = useMessage()
const autoRefresh = ref(true)
const metrics = ref<SystemMetrics>({
  cpu: 0,
  memory: 0,
  disk: 0,
  network: { rx: 0, tx: 0 },
  timestamp: Date.now(),
})

let refreshInterval: NodeJS.Timeout | null = null

async function fetchMetrics() {
  try {
    metrics.value = await monitorApi.getSystemMetrics()
  } catch (error: any) {
    message.error(error.message || '获取监控数据失败')
  }
}

function getColor(percentage: number): string {
  if (percentage < 50) return '#18a058'
  if (percentage < 80) return '#f0a020'
  return '#d03050'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

watch(autoRefresh, (value) => {
  if (value) {
    refreshInterval = setInterval(fetchMetrics, 3000)
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }
})

onMounted(() => {
  fetchMetrics()
  if (autoRefresh.value) {
    refreshInterval = setInterval(fetchMetrics, 3000)
  }
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
