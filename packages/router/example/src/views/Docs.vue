<script setup lang="ts">
// Documentation page component
</script>

<template>
  <div data-testid="page-content">
    <h1>Documentation</h1>
    <div id="section1">
      <h2>Section 1</h2>
      <p>This is section 1 content</p>
    </div>
    <div id="section2">
      <h2>Section 2</h2>
      <p>This is section 2 content</p>
    </div>
    <router-link to="/"> Back to Home </router-link>
  </div>
</template>

<style scoped>
h1,
h2 {
  color: #2c3e50;
}

#section1,
#section2 {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #eee;
}
</style>
