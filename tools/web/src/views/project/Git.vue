<template>
  <n-card title="Git 管理">
    <n-space vertical size="large">
      <n-alert type="info">
        Git版本控制 - 提交、分支、合并等操作
      </n-alert>
      <n-space>
        <n-button type="primary">查看状态</n-button>
        <n-button>提交更改</n-button>
        <n-button>推送</n-button>
      </n-space>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSpace, NAlert, NButton } from 'naive-ui'
</script>
