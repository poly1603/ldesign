# PowerShell script to generate remaining example apps
# 生成剩余示例应用的脚本

$ErrorActionPreference = "Stop"
$baseDir = "D:\WorkBench\ldesign\apps"

Write-Host "[START] Generating remaining example apps..." -ForegroundColor Green

# Nuxt.js app
Write-Host "`n[CREATE] Nuxt.js app..." -ForegroundColor Cyan
$nuxtDir = Join-Path $baseDir "app-nuxtjs"
New-Item -ItemType Directory -Force -Path (Join-Path $nuxtDir "pages") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $nuxtDir "public") | Out-Null

# nuxt.config.ts
@"
export default defineNuxtConfig({
  devtools: { enabled: true },
  alias: {
    '@ldesign/engine-core': '../../packages/engine/packages/core/src',
    '@ldesign/engine-nuxtjs': '../../packages/engine/packages/nuxtjs/src',
  },
})
"@ | Out-File -FilePath (Join-Path $nuxtDir "nuxt.config.ts") -Encoding UTF8

# pages/index.vue
@"
<template>
  <div class="app">
    <header class="header">
      <h1>🚀 LDesign Engine - Nuxt.js</h1>
      <p>Vue meta-framework with LDesign Engine</p>
    </header>
    
    <main class="main">
      <div class="card">
        <h3>计数器示例</h3>
        <p>当前计数: {{ count }}</p>
        <button @click="increment">增加</button>
        <button @click="decrement">减少</button>
        <button @click="reset">重置</button>
      </div>
      
      <div class="card">
        <h3>事件系统示例</h3>
        <button @click="sendNotification">发送通知</button>
        <div class="messages">
          <div v-for="(msg, i) in messages" :key="i" class="message">{{ msg }}</div>
        </div>
      </div>
      
      <div class="card">
        <h3>待办事项列表</h3>
        <div class="todo-input">
          <input v-model="newTodo" @keyup.enter="addTodo" placeholder="输入待办事项..." />
          <button @click="addTodo">添加</button>
        </div>
        <ul class="todo-list">
          <li v-for="todo in todos" :key="todo.id" :class="{ done: todo.done }">
            <input type="checkbox" v-model="todo.done" />
            <span>{{ todo.text }}</span>
            <button @click="deleteTodo(todo.id)">删除</button>
          </li>
        </ul>
      </div>
    </main>
    
    <footer class="footer">
      <p>Powered by @ldesign/engine-nuxtjs</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const count = ref(0)
const messages = ref<string[]>([])
const newTodo = ref('')
const todos = ref<Array<{id: number, text: string, done: boolean}>>([])

const increment = () => count.value++
const decrement = () => count.value--
const reset = () => count.value = 0

const sendNotification = () => {
  messages.value.push(`收到通知: 消息 ${Date.now()}`)
}

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({ id: Date.now(), text: newTodo.value, done: false })
    newTodo.value = ''
  }
}

const deleteTodo = (id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.3s;
}

button:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.todo-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

.todo-list {
  list-style: none;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.todo-list li.done span {
  text-decoration: line-through;
  opacity: 0.6;
}

.messages {
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.message {
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.footer {
  text-align: center;
  color: white;
  margin-top: 3rem;
  opacity: 0.8;
}
</style>
"@ | Out-File -FilePath (Join-Path $nuxtDir "pages\index.vue") -Encoding UTF8

# README.md
@"
# @ldesign/app-nuxtjs

Nuxt.js application powered by LDesign Engine

## 快速开始

``````bash
pnpm install
pnpm dev
``````

## 端口

- 开发服务器: http://localhost:5184
- 预览服务器: http://localhost:4184
"@ | Out-File -FilePath (Join-Path $nuxtDir "README.md") -Encoding UTF8

Write-Host "[OK] Nuxt.js app created" -ForegroundColor Green

# Alpine.js app
Write-Host "`n[CREATE] Alpine.js app..." -ForegroundColor Cyan
$alpineDir = Join-Path $baseDir "app-alpinejs"
New-Item -ItemType Directory -Force -Path (Join-Path $alpineDir "src") | Out-Null

# vite.config.ts
@"
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/engine-core': '../../packages/engine/packages/core/src',
      '@ldesign/engine-alpinejs': '../../packages/engine/packages/alpinejs/src',
    },
  },
  server: {
    port: 5188,
    open: true,
  },
})
"@ | Out-File -FilePath (Join-Path $alpineDir "vite.config.ts") -Encoding UTF8

# index.html
@"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LDesign Alpine.js App</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .app { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .header { text-align: center; color: white; margin-bottom: 3rem; }
    .header h1 { font-size: 3rem; margin-bottom: 0.5rem; }
    .main { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
    .card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }
    .card h3 { margin-bottom: 1.5rem; color: #333; }
    button { background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; margin-right: 0.5rem; }
    button:hover { background: #5568d3; }
    .footer { text-align: center; color: white; margin-top: 3rem; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="app" x-data="app">
    <header class="header">
      <h1>🚀 LDesign Engine - Alpine.js</h1>
      <p>Lightweight framework with LDesign Engine</p>
    </header>
    
    <main class="main">
      <div class="card">
        <h3>计数器示例</h3>
        <p>当前计数: <span x-text="count"></span></p>
        <button @click="count++">增加</button>
        <button @click="count--">减少</button>
        <button @click="count = 0">重置</button>
      </div>
    </main>
    
    <footer class="footer">
      <p>Powered by @ldesign/engine-alpinejs</p>
    </footer>
  </div>
  
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
"@ | Out-File -FilePath (Join-Path $alpineDir "index.html") -Encoding UTF8

# src/main.ts
@"
import Alpine from 'alpinejs'
import { createEngine } from '@ldesign/engine-core'
import { createAlpineJSAdapter } from '@ldesign/engine-alpinejs'

const engine = createEngine({
  adapter: createAlpineJSAdapter({ debug: true }),
  config: {
    name: 'Alpine.js Engine App',
    version: '0.1.0',
  },
})

await engine.init()

Alpine.data('app', () => ({
  count: 0,
}))

Alpine.start()
"@ | Out-File -FilePath (Join-Path $alpineDir "src\main.ts") -Encoding UTF8

# README.md
@"
# @ldesign/app-alpinejs

Alpine.js application powered by LDesign Engine

## 快速开始

``````bash
pnpm install
pnpm dev
``````

## 端口

- 开发服务器: http://localhost:5188
- 预览服务器: http://localhost:4188
"@ | Out-File -FilePath (Join-Path $alpineDir "README.md") -Encoding UTF8

Write-Host "[OK] Alpine.js app created" -ForegroundColor Green

Write-Host "`n[OK] All example apps created!" -ForegroundColor Green
Write-Host "`n[Stats]:" -ForegroundColor Yellow
Write-Host "  - Created: 2 apps (Nuxt.js, Alpine.js)" -ForegroundColor White
Write-Host "  - Remaining: 3 apps (Remix, SvelteKit, Astro)" -ForegroundColor White
Write-Host "`n[Next] Run this script to create remaining apps" -ForegroundColor Yellow

