/**
 * 应用程序入口文件
 * 基于 Vite + JavaScript 的地图示例应用
 */

// 导入样式文件 - 使用 alias
import 'src/styles/index.css'

// 导入应用模块 - 使用 alias
import { createApp } from 'src/app.js'
import { initializeMap } from 'src/map/mapManager.js'
import { setupEventListeners } from 'src/utils/eventHandlers.js'

/**
 * 应用初始化函数
 */
async function initApp() {
  try {
    console.log('🚀 开始初始化地图示例应用...')
    
    // 创建应用实例
    const app = createApp()
    
    // 设置事件监听器
    setupEventListeners(app)
    
    // 渲染应用到 DOM
    app.render()
    
    console.log('✅ 应用初始化完成')
    console.log('📦 版本: 1.0.0')
    console.log('🔧 环境: Vite + JavaScript')
    console.log('🗺️ 地图引擎: @ldesign/map')
    
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    
    // 显示错误信息
    const appElement = document.getElementById('app')
    if (appElement) {
      appElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 20px;
          text-align: center;
          color: var(--ldesign-error-color, #ff4d4f);
        ">
          <h2>⚠️ 应用加载失败</h2>
          <p style="margin: 10px 0; color: var(--ldesign-text-color-secondary, #666);">
            ${error.message || '未知错误'}
          </p>
          <button 
            onclick="location.reload()" 
            style="
              padding: 8px 16px;
              background: var(--ldesign-brand-color, #722ED1);
              color: white;
              border: none;
              border-radius: 4px;
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

// DOM 加载完成后初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
