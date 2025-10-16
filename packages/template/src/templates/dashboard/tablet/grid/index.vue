<script setup lang="ts">
interface Props {
  title?: string
}

// eslint-disable-next-line unused-imports/no-unused-vars, ts/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  title: '网格平板仪表板',
})
</script>

<template>
  <div class="dashboard-tablet-grid">
    <div class="container">
      <h1>{{ title }}</h1>
      <p class="subtitle">
        网格平板仪表板
      </p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dashboard-tablet-grid {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  border-radius: 12px;
}

h1 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #333;
}

.subtitle {
  margin: 0 0 24px;
  color: #666;
}
</style>
