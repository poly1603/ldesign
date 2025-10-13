/**
 * 应用入口
 * 使用模块化的项目结构
 */

import { createEngineApp } from '@ldesign/engine'
import App from './App.vue'
import { createRouter } from './router'
import { engineConfig } from './config/app.config'
import { auth } from './composables/useAuth'
import { createI18nPlugin } from './i18n'

/**
 * 启动应用
 */
async function bootstrap() {
  try {
    console.log('🚀 启动应用...')
    
    // 初始化认证状态
    auth.initAuth()
    
    // 创建路由器插件
    const routerPlugin = createRouter()
    
    // 创建 i18n 插件
    const i18nPlugin = await createI18nPlugin()
    
    // 创建应用引擎
    const engine = await createEngineApp({
      // 根组件和挂载点
      rootComponent: App,
      mountElement: '#app',
      
      // 使用配置文件
      config: engineConfig,
      
      // 插件（路由器 + i18n）
      plugins: [routerPlugin, i18nPlugin],
      
      // 错误处理
      onError: (error, context) => {
        console.error(`[应用错误] ${context}:`, error)
      },
      
      // 引擎就绪
      onReady: (engine) => {
        console.log('✅ 引擎已就绪')
        if (import.meta.env.DEV) {
          // 开发环境暴露引擎实例
          ;(window as any).__ENGINE__ = engine
        }
      },
      
      // 应用挂载完成
      onMounted: () => {
        console.log('✅ 应用已挂载')
      }
    })
    
    return engine
    
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    throw error
  }
}

// 启动应用
bootstrap().catch(error => {
  console.error('❌ 应用启动失败:', error)
  
  // 在页面上显示错误信息
  const errorMessage = error.message || '未知错误'
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: system-ui;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="font-size: 48px; margin: 0 0 20px 0;">😔</h1>
      <h2 style="font-size: 24px; margin: 0 0 10px 0;">应用启动失败</h2>
      <p style="font-size: 16px; margin: 0 0 20px 0; opacity: 0.9;">${errorMessage}</p>
      <button 
        onclick="location.reload()" 
        style="
          padding: 12px 24px;
          font-size: 16px;
          border: 2px solid white;
          background: transparent;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        "
        onmouseover="this.style.background='white'; this.style.color='#667eea';"
        onmouseout="this.style.background='transparent'; this.style.color='white';"
      >
        重新加载
      </button>
    </div>
  `
})
