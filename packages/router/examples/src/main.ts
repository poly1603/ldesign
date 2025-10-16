/**
 * @ldesign/router 示例项目主入口文件
 * 
 * 本文件展示了如何使用 @ldesign/router 的各种功能：
 * 1. 基础路由配置
 * 2. Engine 集成
 * 3. 插件系统
 * 4. 设备适配
 */

import { createApp } from 'vue'
import App from './App.vue'
import { setupRouter } from './router'
import { setupPlugins } from './plugins'

// 导入全局样式
import './styles/global.less'

/**
 * 创建并配置 Vue 应用实例
 */
async function createApplication() {
  // 创建 Vue 应用实例
  const app = createApp(App)

  try {
    // 设置路由器
    const router = await setupRouter()
    app.use(router)

    // 设置插件
    await setupPlugins(app, router)

    // 挂载应用
    app.mount('#app')

    // 开发环境下的调试信息
    if (import.meta.env?.DEV) {
                        
      // 将路由器实例挂载到全局，方便调试
      ;(window as any).__ROUTER__ = router
    }

    return { app, router }
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    
    // 显示错误信息
    const errorDiv = document.createElement('div')
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        text-align: center;
        max-width: 400px;
        z-index: 9999;
      ">
        <h2 style="color: #e54848; margin-bottom: 1rem;">应用启动失败</h2>
        <p style="color: #666; margin-bottom: 1rem;">${error instanceof Error ? error.message : '未知错误'}</p>
        <button onclick="location.reload()" style="
          background: #722ED1;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        ">重新加载</button>
      </div>
    `
    document.body.appendChild(errorDiv)
    
    throw error
  }
}

// 启动应用
createApplication().catch(error => {
  console.error('💥 应用启动过程中发生致命错误:', error)
})
