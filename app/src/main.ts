/**
 * 应用入口文件
 * 启动 LDesign 应用
 */

import { bootstrap } from './bootstrap'

// 在开发环境加载 LDesign Launcher 客户端工具
if (import.meta.env.DEV) {
  // 动态加载客户端工具函数
  const script = document.createElement('script')
  script.src = '/__ldesign_client_utils.js'
  script.async = true
  document.head.appendChild(script)
}

// 启动应用
bootstrap().then(engine => {
  // 应用启动成功
  if (import.meta.env.DEV) {
    console.log('🚀 LDesign 应用启动成功')

    // 延迟输出配置信息，确保客户端工具已加载
    setTimeout(() => {
      if (window.__LDESIGN_LAUNCHER__) {
        window.__LDESIGN_LAUNCHER__.logConfig()
      }
    }, 100)
  }
}).catch(error => {
  console.error('❌ 应用启动失败:', error)
})
