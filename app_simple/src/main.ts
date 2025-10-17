/**
 * 应用入口
 * 使用模块化的项目结构
 */

import { bootstrap } from './bootstrap'
import { showErrorPage } from './bootstrap/error-handler'


// 启动应用
bootstrap().catch(error => {
  console.error('❌ 应用启动失败:', error)
  showErrorPage(error)
})
