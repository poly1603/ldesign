<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template/vue'
import LoginPanel from '@/components/LoginPanel.vue'
</script>

<template>
  <TemplateRenderer category="login">
    <template #login-panel>
      <LoginPanel />
    </template>
  </TemplateRenderer>
</template>
