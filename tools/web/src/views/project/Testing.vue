<template>
  <n-card title="测试管理">
    <n-space vertical size="large">
      <n-alert type="info">
        测试管理页面 - 运行单元测试、集成测试和E2E测试
      </n-alert>
      <n-space>
        <n-button type="primary">运行测试</n-button>
        <n-button>查看覆盖率</n-button>
      </n-space>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSpace, NAlert, NButton } from 'naive-ui'
</script>
