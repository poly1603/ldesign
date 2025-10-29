<template>
  <n-card title="变更日志">
    <n-space vertical size="large">
      <n-alert type="info">
        变更日志管理 - 自动生成和管理项目变更记录
      </n-alert>
      <n-button type="primary">生成变更日志</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSpace, NAlert, NButton } from 'naive-ui'
</script>
