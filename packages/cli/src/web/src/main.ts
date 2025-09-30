/**
 * Vue 应用主入口文件
 * 初始化 Vue 应用和相关配置
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './router/routes'
import { setupWebSocket, useWebSocket } from './composables/useWebSocket'
import './styles/index.less'

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * 路由守卫
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - LDesign UI`
  } else {
    document.title = 'LDesign UI 管理界面'
  }

  next()
})

/**
 * 创建 Vue 应用
 */
const app = createApp(App)

// 使用路由
app.use(router)

// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue 应用错误:', error)
  console.error('错误信息:', info)
  console.error('组件实例:', instance)
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue 警告:', msg)
  console.warn('组件追踪:', trace)
}

/**
 * 清除所有进程状态
 */
function clearAllProcessStates() {
  console.log('🧹 清除所有进程状态...')

  // 获取所有 localStorage 的键
  const keys = Object.keys(localStorage)

  // 清除所有以 'process-' 开头的键
  keys.forEach(key => {
    if (key.startsWith('process-')) {
      localStorage.removeItem(key)
      console.log(`  - 已清除: ${key}`)
    }
  })

  console.log('✅ 进程状态清除完成')
}

/**
 * 应用初始化
 */
async function initApp() {
  try {
    // 设置 WebSocket 连接
    setupWebSocket()

    // 监听服务器关闭事件
    const { subscribe } = useWebSocket()
    subscribe('server-shutdown', (data) => {
      console.log('🔴 服务器正在关闭:', data)
      clearAllProcessStates()
    })

    // 挂载应用
    app.mount('#app')

    console.log('✅ LDesign UI 应用已启动')
  } catch (error) {
    console.error('❌ 应用启动失败:', error)

    // 显示错误信息
    const appElement = document.getElementById('app')
    if (appElement) {
      appElement.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          flex-direction: column;
          color: var(--ldesign-text-color-primary);
          text-align: center;
          padding: 2rem;
        ">
          <h1 style="color: var(--ldesign-error-color-5); margin-bottom: 1rem;">
            应用启动失败
          </h1>
          <p style="color: var(--ldesign-text-color-secondary); margin-bottom: 1rem;">
            ${error instanceof Error ? error.message : '未知错误'}
          </p>
          <button 
            onclick="location.reload()" 
            style="
              padding: 0.5rem 1rem;
              background: var(--ldesign-brand-color);
              color: white;
              border: none;
              border-radius: var(--ls-border-radius-base);
              cursor: pointer;
            "
          >
            重新加载
          </button>
        </div>
      `
    }
  }
}

// 启动应用
initApp()
