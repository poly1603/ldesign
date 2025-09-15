/**
 * 基础浏览器兼容性测试
 * 测试WebSocket客户端库在不同浏览器中的基本功能
 */

import { test, expect } from '@playwright/test'

// 测试配置
const TEST_CONFIG = {
  /** 测试超时时间 */
  TIMEOUT: 10000,
  /** 测试消息 */
  TEST_MESSAGE: 'Hello WebSocket Test!'
}

/**
 * 创建简单的测试页面
 */
function createSimpleTestPage(): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WebSocket基础兼容性测试</title>
</head>
<body>
    <h1>WebSocket基础兼容性测试</h1>
    <div id="status">初始化中...</div>
    <div id="results"></div>
    
    <script>
        // 测试结果对象
        window.testResults = {
            webSocketSupported: false,
            canCreateWebSocket: false,
            hasRequiredMethods: false,
            hasRequiredEvents: false,
            canSetEventHandlers: false,
            errors: []
        }
        
        function updateStatus(message) {
            document.getElementById('status').textContent = message
            console.log('Status:', message)
        }
        
        function addError(error) {
            window.testResults.errors.push(error)
            console.error('Test Error:', error)
        }
        
        // 运行基础兼容性测试
        function runBasicTests() {
            updateStatus('开始基础兼容性测试...')
            
            try {
                // 1. 检查WebSocket是否存在
                updateStatus('检查WebSocket支持...')
                if (typeof WebSocket !== 'undefined') {
                    window.testResults.webSocketSupported = true
                    updateStatus('✓ WebSocket支持检测通过')
                } else {
                    addError('WebSocket不被支持')
                    updateStatus('✗ WebSocket不被支持')
                    return
                }
                
                // 2. 尝试创建WebSocket实例
                updateStatus('测试WebSocket实例创建...')
                try {
                    const ws = new WebSocket('ws://echo.websocket.org')
                    window.testResults.canCreateWebSocket = true
                    updateStatus('✓ WebSocket实例创建成功')
                    
                    // 3. 检查必需的方法
                    updateStatus('检查WebSocket方法...')
                    if (typeof ws.send === 'function' && 
                        typeof ws.close === 'function') {
                        window.testResults.hasRequiredMethods = true
                        updateStatus('✓ WebSocket方法检查通过')
                    } else {
                        addError('WebSocket缺少必需的方法')
                        updateStatus('✗ WebSocket方法检查失败')
                    }
                    
                    // 4. 检查必需的事件属性
                    updateStatus('检查WebSocket事件属性...')
                    if ('onopen' in ws && 'onclose' in ws && 
                        'onmessage' in ws && 'onerror' in ws) {
                        window.testResults.hasRequiredEvents = true
                        updateStatus('✓ WebSocket事件属性检查通过')
                    } else {
                        addError('WebSocket缺少必需的事件属性')
                        updateStatus('✗ WebSocket事件属性检查失败')
                    }
                    
                    // 5. 测试事件处理器设置
                    updateStatus('测试事件处理器设置...')
                    try {
                        ws.onopen = function() { console.log('onopen works') }
                        ws.onclose = function() { console.log('onclose works') }
                        ws.onmessage = function() { console.log('onmessage works') }
                        ws.onerror = function() { console.log('onerror works') }
                        
                        window.testResults.canSetEventHandlers = true
                        updateStatus('✓ 事件处理器设置成功')
                    } catch (error) {
                        addError('无法设置事件处理器: ' + error.message)
                        updateStatus('✗ 事件处理器设置失败')
                    }
                    
                    // 关闭WebSocket连接
                    ws.close()
                    
                } catch (error) {
                    addError('无法创建WebSocket实例: ' + error.message)
                    updateStatus('✗ WebSocket实例创建失败')
                }
                
                updateStatus('基础兼容性测试完成')
                
            } catch (error) {
                addError('测试过程中发生错误: ' + error.message)
                updateStatus('✗ 测试失败')
            }
        }
        
        // 页面加载完成后运行测试
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runBasicTests)
        } else {
            runBasicTests()
        }
    </script>
</body>
</html>
  `
}

// 为每个主要浏览器运行测试
const browsers = [
  { name: 'chromium', displayName: 'Chrome' },
  { name: 'firefox', displayName: 'Firefox' },
  { name: 'webkit', displayName: 'Safari' }
] as const

browsers.forEach(({ name: browserName, displayName }) => {
  test.describe(`${displayName} 浏览器兼容性`, () => {
    
    test(`${displayName} - WebSocket基础支持检测`, async ({ page }) => {
      // 设置测试页面
      const testPageContent = createSimpleTestPage()
      await page.setContent(testPageContent)
      
      // 等待测试完成
      await page.waitForTimeout(3000)
      
      // 获取测试结果
      const testResults = await page.evaluate(() => window.testResults)
      
      // 验证WebSocket支持
      expect(testResults.webSocketSupported).toBe(true)
      
      console.log(`${displayName} WebSocket支持:`, testResults.webSocketSupported)
    })

    test(`${displayName} - WebSocket实例创建测试`, async ({ page }) => {
      const testPageContent = createSimpleTestPage()
      await page.setContent(testPageContent)
      
      await page.waitForTimeout(3000)
      
      const testResults = await page.evaluate(() => window.testResults)
      
      // 验证WebSocket实例创建
      expect(testResults.canCreateWebSocket).toBe(true)
      
      console.log(`${displayName} WebSocket实例创建:`, testResults.canCreateWebSocket)
    })

    test(`${displayName} - WebSocket方法检查`, async ({ page }) => {
      const testPageContent = createSimpleTestPage()
      await page.setContent(testPageContent)
      
      await page.waitForTimeout(3000)
      
      const testResults = await page.evaluate(() => window.testResults)
      
      // 验证WebSocket方法
      expect(testResults.hasRequiredMethods).toBe(true)
      
      console.log(`${displayName} WebSocket方法:`, testResults.hasRequiredMethods)
    })

    test(`${displayName} - WebSocket事件属性检查`, async ({ page }) => {
      const testPageContent = createSimpleTestPage()
      await page.setContent(testPageContent)
      
      await page.waitForTimeout(3000)
      
      const testResults = await page.evaluate(() => window.testResults)
      
      // 验证WebSocket事件属性
      expect(testResults.hasRequiredEvents).toBe(true)
      
      console.log(`${displayName} WebSocket事件属性:`, testResults.hasRequiredEvents)
    })

    test(`${displayName} - 事件处理器设置测试`, async ({ page }) => {
      const testPageContent = createSimpleTestPage()
      await page.setContent(testPageContent)
      
      await page.waitForTimeout(3000)
      
      const testResults = await page.evaluate(() => window.testResults)
      
      // 验证事件处理器设置
      expect(testResults.canSetEventHandlers).toBe(true)
      
      console.log(`${displayName} 事件处理器设置:`, testResults.canSetEventHandlers)
    })

    test(`${displayName} - 综合兼容性评估`, async ({ page }) => {
      const testPageContent = createSimpleTestPage()
      await page.setContent(testPageContent)
      
      await page.waitForTimeout(5000)
      
      const testResults = await page.evaluate(() => window.testResults)
      
      // 计算兼容性得分
      const tests = [
        'webSocketSupported',
        'canCreateWebSocket',
        'hasRequiredMethods',
        'hasRequiredEvents',
        'canSetEventHandlers'
      ]
      
      const passedTests = tests.filter(test => testResults[test]).length
      const compatibilityScore = (passedTests / tests.length) * 100
      
      console.log(`${displayName} 兼容性测试结果:`)
      console.log(`- WebSocket支持: ${testResults.webSocketSupported}`)
      console.log(`- 实例创建: ${testResults.canCreateWebSocket}`)
      console.log(`- 方法检查: ${testResults.hasRequiredMethods}`)
      console.log(`- 事件属性: ${testResults.hasRequiredEvents}`)
      console.log(`- 事件处理器: ${testResults.canSetEventHandlers}`)
      console.log(`- 通过测试: ${passedTests}/${tests.length}`)
      console.log(`- 兼容性得分: ${compatibilityScore.toFixed(2)}%`)
      
      if (testResults.errors.length > 0) {
        console.log(`- 错误信息:`, testResults.errors)
      }
      
      // 要求100%兼容性（所有基础功能都应该支持）
      expect(compatibilityScore).toBe(100)
    })
  })
})
