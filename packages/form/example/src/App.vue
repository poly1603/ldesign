<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航菜单
const navigation = computed(() => [
  { name: '基础示例', path: '/' },
  { name: '表单验证', path: '/validation' },
  { name: '动态表单', path: '/dynamic' },
  { name: '复杂布局', path: '/layout' },
])
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">LDesign Form</h1>
          </div>
          <div class="flex items-center space-x-8">
            <router-link
              v-for="route in navigation"
              :key="route.path"
              :to="route.path"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 bg-blue-50"
            >
              {{ route.name }}
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
</style>
