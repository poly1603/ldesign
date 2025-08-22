<script setup lang="ts">
// Admin page component
</script>

<template>
  <div data-testid="page-content">
    <h1>Admin Panel</h1>
    <p>This is the admin panel - requires authentication</p>
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
