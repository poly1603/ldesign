<template>
  <n-card title="安全检查">
    <n-space vertical size="large">
      <n-alert type="info">
        安全扫描 - 检测依赖漏洞和代码安全问题
      </n-alert>
      <n-button type="primary">开始扫描</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSpace, NAlert, NButton } from 'naive-ui'
</script>
