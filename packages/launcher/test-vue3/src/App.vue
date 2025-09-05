<template>
  <div class="container">
    <h1 class="title">Vue 3 + @ldesign/launcher</h1>

    <div class="counter-section">
      <button @click="increment" class="counter-btn">
        点击次数: {{ count }}
      </button>
    </div>

    <div class="info">
      <p>当前时间: {{ currentTime }}</p>
      <p>构建环境: {{ isDev ? '开发模式' : '生产模式' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const count = ref(0)
const currentTime = ref('')
const isDev = ref(import.meta.env.DEV)

const increment = () => {
  count.value++
}

let timeInterval: number
const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000) as unknown as number
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval as unknown as number)
})
</script>

<style scoped>
.container { max-width: 800px; margin: 0 auto; text-align: center; padding: 2rem; }
.title { font-size: 2rem; margin-bottom: 1rem; }
.counter-section { margin: 2rem 0; }
.counter-btn { background: #42b883; color: #fff; border: 0; padding: .75rem 1.5rem; border-radius: 8px; cursor: pointer; }
.counter-btn:hover { background: #369870; }
.info { margin-top: 1.5rem; font-family: monospace; }
</style>
