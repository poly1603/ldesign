<template>
  <n-card title="部署管理">
    <n-space vertical size="large">
      <n-alert type="info">
        部署功能页面 - 支持多环境部署配置和管理
      </n-alert>
      <n-button type="primary">创建部署</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSpace, NAlert, NButton } from 'naive-ui'
</script>
