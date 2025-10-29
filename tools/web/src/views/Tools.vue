<template>
  <n-layout style="height: 100vh">
    <n-layout-header bordered style="height: 64px; padding: 0 24px">
      <h2>工具总览</h2>
    </n-layout-header>

    <n-layout-content style="padding: 24px">
      <n-spin :show="toolsStore.loading">
        <n-grid cols="3" x-gap="12" y-gap="12">
          <n-grid-item v-for="tool in toolsStore.tools" :key="tool.name">
            <n-card :title="tool.metadata.displayName">
              <template #header-extra>
                <n-tag :type="getStatusType(tool.status)">
                  {{ getStatusText(tool.status) }}
                </n-tag>
              </template>
              <n-text depth="3">{{ tool.metadata.description || '暂无描述' }}</n-text>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-spin>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NCard,
  NGrid,
  NGridItem,
  NSpin,
  NTag,
  NText,
} from 'naive-ui'
import { useToolsStore } from '../store/tools'

const toolsStore = useToolsStore()

function getStatusType(status: string) {
  const map: Record<string, any> = {
    active: 'success',
    inactive: 'default',
    error: 'error',
    busy: 'warning',
    initializing: 'info',
  }
  return map[status] || 'default'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    active: '运行中',
    inactive: '未激活',
    error: '错误',
    busy: '忙碌',
    initializing: '初始化中',
  }
  return map[status] || status
}

onMounted(() => {
  toolsStore.fetchTools()
})
</script>

