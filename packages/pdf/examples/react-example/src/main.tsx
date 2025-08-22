import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * React应用入口文件
 * 负责渲染主应用组件到DOM
 */

// 获取根DOM元素
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('根元素未找到！请确保HTML中存在id为"root"的元素。')
}

// 创建React根实例
const root = ReactDOM.createRoot(rootElement)

// 渲染应用
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// 开发环境下的热更新支持
if (import.meta.hot) {
  import.meta.hot.accept()
}

// 错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})
