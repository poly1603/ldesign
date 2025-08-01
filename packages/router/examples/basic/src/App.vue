<script setup lang="ts">
import { RouterLink, RouterView } from '@ldesign/router'
</script>

<template>
  <div id="app">
    <header class="header">
      <h1>LDesign Router - Basic Example</h1>
      <p>A simple demonstration of @ldesign/router functionality</p>
    </header>

    <nav class="nav">
      <RouterLink to="/">
        Home
      </RouterLink>
      <RouterLink to="/about">
        About
      </RouterLink>
      <RouterLink to="/users">
        Users
      </RouterLink>
      <RouterLink to="/user/123">
        User 123
      </RouterLink>
      <RouterLink to="/products?category=electronics">
        Products
      </RouterLink>
      <RouterLink to="/contact#form">
        Contact
      </RouterLink>
    </nav>

    <main class="content">
      <Transition name="fade" mode="out-in">
        <RouterView />
      </Transition>
    </main>

    <footer style="text-align: center; margin-top: 2rem; color: #666;">
      <p>Current Route: {{ $route.fullPath }}</p>
      <p>Route Name: {{ $route.name || 'N/A' }}</p>
    </footer>
  </div>
</template>

<style scoped>
/* Component-specific styles can go here */
</style>
