---
title: Vue 3 项目
description: 完整的 Vue 3 + TypeScript + Router + Pinia 项目示例
---

# Vue 3 项目

完整的 Vue 3 + TypeScript + Router + Pinia 示例。

## 安装依赖
```bash
pnpm add vue vue-router pinia @vitejs/plugin-vue
```

## 目录结构
```
src/
├─ main.ts
├─ App.vue
├─ router/index.ts
└─ stores/app.ts
```

## 配置文件
```ts
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { port: 3000, open: true }
})
```

## 入口文件
```ts
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

createApp(App).use(createPinia()).use(router).mount('#app')
```

## 路由
```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
export default createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: () => import('../App.vue') }]
})
```

## 组件
```vue
<!-- src/App.vue -->
<template>
  <h1>Hello Vue 3</h1>
</template>
```
