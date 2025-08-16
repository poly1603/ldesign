<script setup lang="ts">
// Search page component
</script>

<template>
  <div data-testid="page-content">
    <h1>Search</h1>
    <p data-testid="search-query">Query: {{ $route.query.q || '' }}</p>
    <p data-testid="search-category">
      Category: {{ $route.query.category || '' }}
    </p>
    <router-link to="/"> Back to Home </router-link>
  </div>
</template>

<style scoped>
h1 {
  color: #2c3e50;
}
</style>
