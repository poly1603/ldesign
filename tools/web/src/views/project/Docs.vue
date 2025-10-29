<template>
  <n-card title="文档生成">
    <n-space vertical size="large">
      <n-alert type="info">
        文档生成工具 - 自动生成 API 文档
      </n-alert>
      <n-button type="primary">生成文档</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSpace, NAlert, NButton } from 'naive-ui'
</script>
