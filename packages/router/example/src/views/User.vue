<script setup lang="ts">
interface Props {
  id: string
}

defineProps<Props>()
</script>

<template>
  <div data-testid="page-content">
    <h1>User Profile</h1>
    <p data-testid="user-id">
      User ID: {{ id }}
    </p>
    <p>This is the user profile page</p>
    <router-link to="/">
      Back to Home
    </router-link>
  </div>
</template>

<style scoped>
h1 {
  color: #2c3e50;
}
</style>
