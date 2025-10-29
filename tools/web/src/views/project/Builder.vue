<template>
  <n-space vertical size="large">
    <n-card title="构建管理">
      <template #header-extra>
        <n-space>
          <n-button type="primary" @click="handleBuild">
            <template #icon>
              <Play :size="16" />
            </template>
            开始构建
          </n-button>
          <n-button @click="fetchBuilds">
            <template #icon>
              <RefreshCw :size="16" />
            </template>
            刷新
          </n-button>
        </n-space>
      </template>

      <n-data-table
        :columns="columns"
        :data="builds"
        :loading="loading"
        :pagination="pagination"
      />
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NSpace, NCard, NButton, NDataTable, NTag, useMessage } from 'naive-ui'
import { Play, RefreshCw } from 'lucide-vue-next'
import { buildsApi, type Build } from '../../api/builds'

const route = useRoute()
const message = useMessage()

const builds = ref<Build[]>([])
const loading = ref(false)

const columns = [
  { title: 'ID', key: 'id', width: 100, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: Build) => {
      const statusMap: Record<string, { type: any; text: string }> = {
        pending: { type: 'info', text: '待处理' },
        running: { type: 'warning', text: '构建中' },
        success: { type: 'success', text: '成功' },
        failed: { type: 'error', text: '失败' },
        cancelled: { type: 'default', text: '已取消' },
      }
      const config = statusMap[row.status] || { type: 'default', text: row.status }
      return h(NTag, { type: config.type }, () => config.text)
    },
  },
  {
    title: '开始时间',
    key: 'startTime',
    render: (row: Build) => new Date(row.startTime).toLocaleString(),
  },
  {
    title: '耗时',
    key: 'duration',
    width: 100,
    render: (row: Build) => (row.duration ? `${Math.round(row.duration / 1000)}s` : '-'),
  },
]

const pagination = {
  pageSize: 10,
}

async function fetchBuilds() {
  const projectId = route.params.id as string
  loading.value = true
  try {
    builds.value = await buildsApi.getAll({ projectId })
  } catch (error: any) {
    message.error(error.message || '获取构建列表失败')
  } finally {
    loading.value = false
  }
}

async function handleBuild() {
  const projectId = route.params.id as string
  try {
    await buildsApi.create(projectId)
    message.success('构建任务已创建')
    await fetchBuilds()
  } catch (error: any) {
    message.error(error.message || '创建构建任务失败')
  }
}

onMounted(() => {
  fetchBuilds()
})
</script>
