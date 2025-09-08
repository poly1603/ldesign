/**
 * React + TypeScript 示例应用入口文件
 * 展示 @ldesign/qrcode 在 React 环境中的使用
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
