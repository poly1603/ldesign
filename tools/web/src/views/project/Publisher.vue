<template>
  <n-card title="发布管理">
    <n-space vertical size="large">
      <n-alert type="info">
        版本发布 - 发布到 npm 或其他包管理平台
      </n-alert>
      <n-button type="primary">创建发布</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSpace, NAlert, NButton } from 'naive-ui'
</script>
