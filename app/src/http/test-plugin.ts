/**
 * HTTP 插件重构测试
 * 
 * 验证重构后的 HTTP 插件是否正常工作
 */

import { httpPlugin } from './index'

/**
 * 测试插件基本属性
 */
export function testPluginProperties() {
  console.log('🧪 [HTTP Plugin Test] 测试插件基本属性')
  
  // 检查插件名称
  console.log('插件名称:', httpPlugin.name)
  console.assert(httpPlugin.name === 'http', '插件名称应该是 "http"')
  
  // 检查插件版本
  console.log('插件版本:', httpPlugin.version)
  console.assert(httpPlugin.version === '1.0.0', '插件版本应该是 "1.0.0"')
  
  // 检查插件依赖
  console.log('插件依赖:', httpPlugin.dependencies)
  console.assert(Array.isArray(httpPlugin.dependencies), '插件依赖应该是数组')
  
  // 检查安装方法
  console.log('安装方法存在:', typeof httpPlugin.install === 'function')
  console.assert(typeof httpPlugin.install === 'function', '应该有 install 方法')
  
  // 检查卸载方法
  console.log('卸载方法存在:', typeof httpPlugin.uninstall === 'function')
  console.assert(typeof httpPlugin.uninstall === 'function', '应该有 uninstall 方法')
  
  console.log('✅ [HTTP Plugin Test] 插件基本属性测试通过')
}

/**
 * 模拟引擎环境进行测试
 */
export function testPluginInstallation() {
  console.log('🧪 [HTTP Plugin Test] 测试插件安装')
  
  // 模拟引擎对象
  const mockEngine = {
    logger: {
      info: (message: string, data?: any) => console.log(`[Engine Logger] ${message}`, data),
      error: (message: string, error?: any) => console.error(`[Engine Logger] ${message}`, error),
    },
    events: {
      once: (event: string, callback: Function) => {
        console.log(`[Engine Events] 注册事件监听器: ${event}`)
        // 模拟 app:created 事件
        if (event === 'app:created') {
          setTimeout(() => {
            console.log(`[Engine Events] 触发事件: ${event}`)
            // 模拟 Vue 应用
            const mockVueApp = {
              use: (plugin: any, options: any) => {
                console.log('[Mock Vue App] 安装插件:', plugin.name || 'HttpPlugin', options)
              }
            }
            callback(mockVueApp)
          }, 100)
        }
      }
    },
    getApp: () => null, // 模拟应用还未创建
    httpClient: null,
  }
  
  // 测试插件安装
  httpPlugin.install(mockEngine)
    .then(() => {
      console.log('✅ [HTTP Plugin Test] 插件安装测试通过')
    })
    .catch((error) => {
      console.error('❌ [HTTP Plugin Test] 插件安装测试失败:', error)
    })
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('🚀 [HTTP Plugin Test] 开始运行重构测试')
  
  try {
    testPluginProperties()
    testPluginInstallation()
    
    console.log('🎉 [HTTP Plugin Test] 所有测试完成')
  } catch (error) {
    console.error('💥 [HTTP Plugin Test] 测试过程中出现错误:', error)
  }
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 浏览器环境
  (window as any).testHttpPlugin = runAllTests
  console.log('💡 在浏览器控制台中运行 testHttpPlugin() 来执行测试')
} else {
  // Node.js 环境
  runAllTests()
}
