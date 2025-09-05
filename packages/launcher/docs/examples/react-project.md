---
title: React 项目
description: 完整的 React + TypeScript + React Router 项目示例
---

# React 项目

完整的 React + TypeScript + React Router 示例。

## 安装依赖
```bash
pnpm add react react-dom react-router-dom @vitejs/plugin-react
```

## 配置文件
```ts
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, open: true }
})
```

## 入口文件
```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <h1>Hello React</h1> }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
```

## HTML
```html
<!-- index.html -->
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```
