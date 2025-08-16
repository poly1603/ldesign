<script setup lang="ts">
interface Props {
  id: string
}

defineProps<Props>()
</script>

<template>
  <div data-testid="post-content">
    <h2>Post {{ id }}</h2>
    <p>This is the content for post {{ id }}</p>
    <router-link to="/posts"> Back to Posts </router-link>
  </div>
</template>

<style scoped>
h2 {
  color: #2c3e50;
}
</style>
