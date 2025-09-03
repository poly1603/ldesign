/**
 * 应用入口文件
 * 启动 LDesign 应用
 */

import { bootstrap } from './bootstrap'

// 启动应用
bootstrap().then(engine => {
  console.log('🎉 应用启动成功！')
  console.log('Engine实例:', engine)
}).catch(error => {
  console.error('❌ 应用启动失败:', error)
})
