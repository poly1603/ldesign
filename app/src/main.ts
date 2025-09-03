/**
 * 应用入口文件
 * 启动 LDesign 应用
 */

import { bootstrap } from './bootstrap'

// 启动应用
bootstrap().then(engine => {
  // 应用启动成功，减少控制台输出
}).catch(error => {
  console.error('❌ 应用启动失败:', error)
})
