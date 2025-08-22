<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')
</script>

<template>
  <div data-testid="page-content">
    <h1>Cached Page</h1>
    <p>This page tests caching functionality</p>
    <input
      v-model="inputValue"
      data-testid="input-field"
      placeholder="Type something to test caching"
    >
    <p>Input value: {{ inputValue }}</p>
    <router-link to="/">
      Back to Home
    </router-link>
  </div>
</template>

<style scoped>
h1 {
  color: #2c3e50;
}

input {
  padding: 0.5rem;
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
