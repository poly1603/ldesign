/**
 * 示例主入口
 * 包含多个完整的富文本编辑器示例
 */

import './styles/main.css'
import { createApp } from './app'

// 创建应用
const app = createApp()

// 挂载到 DOM
const root = document.getElementById('app')
if (root) {
  root.appendChild(app)
}

console.log('%c@ldesign/editor%c 示例项目已加载', 'color: #3b82f6; font-weight: bold; font-size: 18px;', 'color: #6b7280;')
console.log('访问以下示例：')
console.log('1. 基础示例')
console.log('2. Vue 3 示例')
console.log('3. React 示例')
console.log('4. 高级功能示例')
