<template>
  <n-card title="项目概览">
    <n-space vertical size="large">
      <n-descriptions :column="2" bordered>
        <n-descriptions-item label="项目名称">
          {{ project?.name }}
        </n-descriptions-item>
        <n-descriptions-item label="项目类型">
          {{ project?.type }}
        </n-descriptions-item>
        <n-descriptions-item label="框架">
          {{ project?.framework || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="包管理器">
          {{ project?.packageManager || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="项目路径" :span="2">
          {{ project?.path }}
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">
          {{ formatTime(project?.createdAt) }}
        </n-descriptions-item>
        <n-descriptions-item label="更新时间">
          {{ formatTime(project?.updatedAt) }}
        </n-descriptions-item>
      </n-descriptions>

      <n-divider />

      <n-grid cols="3" x-gap="16" y-gap="16">
        <n-grid-item>
          <n-statistic label="文件数量" :value="stats.files">
            <template #prefix>
              <FileText :size="20" />
            </template>
          </n-statistic>
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="代码行数" :value="stats.lines">
            <template #prefix>
              <Code :size="20" />
            </template>
          </n-statistic>
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="依赖数量" :value="stats.dependencies">
            <template #prefix>
              <Package :size="20" />
            </template>
          </n-statistic>
        </n-grid-item>
      </n-grid>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NCard, NSpace, NDescriptions, NDescriptionsItem, NDivider, NGrid, NGridItem, NStatistic, useMessage } from 'naive-ui'
import { FileText, Code, Package } from 'lucide-vue-next'
import { projectsApi, type Project } from '../../api/projects'

const route = useRoute()
const message = useMessage()

const project = ref<Project | null>(null)
const stats = ref({
  files: 0,
  lines: 0,
  dependencies: 0,
})

function formatTime(timestamp?: number) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString()
}

async function fetchProjectStats() {
  const id = route.params.id as string
  try {
    const [projectData, statsData] = await Promise.all([
      projectsApi.getById(id),
      projectsApi.getStats(id),
    ])
    project.value = projectData
    stats.value = statsData
  } catch (error: any) {
    message.error(error.message || '加载项目信息失败')
  }
}

onMounted(() => {
  fetchProjectStats()
})
</script>
