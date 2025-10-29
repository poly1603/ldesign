<template>
  <n-card title="依赖管理">
    <n-space vertical size="large">
      <n-alert type="info">
        依赖管理 - 查看、更新和分析项目依赖
      </n-alert>
      <n-space>
        <n-button type="primary">检查更新</n-button>
        <n-button>安装依赖</n-button>
        <n-button>依赖分析</n-button>
      </n-space>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSpace, NAlert, NButton } from 'naive-ui'
</script>
