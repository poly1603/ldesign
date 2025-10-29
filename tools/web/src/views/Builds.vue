<template>
  <n-layout style="height: 100vh">
    <n-layout-header bordered style="height: 64px; padding: 0 24px; display: flex; align-items: center">
      <h2>构建管理</h2>
      <n-space style="margin-left: auto">
        <n-button @click="handleRefresh">🔄 刷新</n-button>
      </n-space>
    </n-layout-header>

    <n-layout-content style="padding: 24px">
      <n-spin :show="loading">
        <n-data-table
          :columns="columns"
          :data="builds"
          :pagination="pagination"
          :bordered="false"
        />
      </n-spin>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NLayout, NLayoutHeader, NLayoutContent, NSpace, NButton, NDataTable, NSpin, NTag } from 'naive-ui'
import { buildsApi, type Build } from '../api/builds'
import { useMessage } from 'naive-ui'

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const builds = ref<Build[]>([])

const columns = [
  { title: 'ID', key: 'id', width: 100, ellipsis: { tooltip: true } },
  { title: '项目ID', key: 'projectId', width: 100, ellipsis: { tooltip: true } },
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
    width: 180,
    render: (row: Build) => new Date(row.startTime).toLocaleString(),
  },
  {
    title: '耗时',
    key: 'duration',
    width: 100,
    render: (row: Build) => (row.duration ? `${Math.round(row.duration / 1000)}s` : '-'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row: Build) => {
      return h(NSpace, {}, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleView(row.id),
          },
          () => '查看'
        ),
        row.status === 'running' &&
          h(
            NButton,
            {
              size: 'small',
              type: 'warning',
              onClick: () => handleCancel(row.id),
            },
            () => '取消'
          ),
      ])
    },
  },
]

const pagination = {
  pageSize: 20,
}

async function fetchBuilds() {
  loading.value = true
  try {
    builds.value = await buildsApi.getAll()
  } catch (error: any) {
    message.error(error.message || '获取构建列表失败')
  } finally {
    loading.value = false
  }
}

function handleView(id: string) {
  router.push(`/builds/${id}`)
}

async function handleCancel(id: string) {
  try {
    await buildsApi.cancel(id)
    message.success('构建已取消')
    await fetchBuilds()
  } catch (error: any) {
    message.error(error.message || '取消失败')
  }
}

function handleRefresh() {
  fetchBuilds()
}

onMounted(() => {
  fetchBuilds()
})
</script>
