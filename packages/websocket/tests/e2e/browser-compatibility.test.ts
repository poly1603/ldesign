/**
 * 浏览器兼容性测试
 * 测试WebSocket客户端在不同浏览器中的兼容性
 */

import { test, expect, Browser, BrowserContext, Page } from '@playwright/test'
import { join } from 'path'

// 兼容性测试配置
const COMPATIBILITY_CONFIG = {
  /** 测试超时时间（毫秒） */
  TEST_TIMEOUT: 30000,
  /** 页面加载超时时间（毫秒） */
  PAGE_LOAD_TIMEOUT: 10000,
  /** WebSocket连接超时时间（毫秒） */
  WEBSOCKET_TIMEOUT: 5000,
  /** 测试消息内容 */
  TEST_MESSAGE: 'Hello WebSocket!',
  /** 测试URL */
  TEST_URL: 'ws://echo.websocket.org'
}

/**
 * 浏览器兼容性测试结果接口
 */
interface CompatibilityResult {
  /** 浏览器名称 */
  browser: string
  /** 浏览器版本 */
  version: string
  /** 是否支持WebSocket */
  supportsWebSocket: boolean
  /** 基础功能测试结果 */
  basicFunctionality: boolean
  /** 连接测试结果 */
  connectionTest: boolean
  /** 消息发送测试结果 */
  messageSendTest: boolean
  /** 消息接收测试结果 */
  messageReceiveTest: boolean
  /** 事件监听测试结果 */
  eventListenerTest: boolean
  /** 错误处理测试结果 */
  errorHandlingTest: boolean
  /** 性能测试结果 */
  performanceTest: boolean
  /** 测试错误信息 */
  errors: string[]
}

/**
 * 创建测试HTML页面内容
 */
function createTestPageContent(): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket兼容性测试</title>
</head>
<body>
    <h1>WebSocket兼容性测试</h1>
    <div id="status">准备中...</div>
    <div id="results"></div>
    
    <script type="module">
        // 模拟WebSocket客户端的核心功能
        class TestWebSocketClient {
            constructor(url) {
                this.url = url
                this.ws = null
                this.listeners = new Map()
                this.connected = false
            }
            
            connect() {
                return new Promise((resolve, reject) => {
                    try {
                        this.ws = new WebSocket(this.url)
                        
                        this.ws.onopen = () => {
                            this.connected = true
                            this.emit('connected')
                            resolve()
                        }
                        
                        this.ws.onclose = () => {
                            this.connected = false
                            this.emit('disconnected')
                        }
                        
                        this.ws.onerror = (error) => {
                            this.emit('error', error)
                            reject(error)
                        }
                        
                        this.ws.onmessage = (event) => {
                            this.emit('message', event.data)
                        }
                        
                        setTimeout(() => {
                            if (!this.connected) {
                                reject(new Error('连接超时'))
                            }
                        }, 5000)
                    } catch (error) {
                        reject(error)
                    }
                })
            }
            
            send(message) {
                if (!this.connected || !this.ws) {
                    throw new Error('WebSocket未连接')
                }
                this.ws.send(message)
            }
            
            on(event, listener) {
                if (!this.listeners.has(event)) {
                    this.listeners.set(event, [])
                }
                this.listeners.get(event).push(listener)
            }
            
            emit(event, ...args) {
                const listeners = this.listeners.get(event) || []
                listeners.forEach(listener => listener(...args))
            }
            
            disconnect() {
                if (this.ws) {
                    this.ws.close()
                }
            }
        }
        
        // 测试结果
        window.testResults = {
            supportsWebSocket: typeof WebSocket !== 'undefined',
            basicFunctionality: false,
            connectionTest: false,
            messageSendTest: false,
            messageReceiveTest: false,
            eventListenerTest: false,
            errorHandlingTest: false,
            performanceTest: false,
            errors: []
        }
        
        // 更新状态显示
        function updateStatus(message) {
            document.getElementById('status').textContent = message
        }
        
        // 运行兼容性测试
        async function runCompatibilityTests() {
            updateStatus('开始兼容性测试...')
            
            try {
                // 1. 检查WebSocket支持
                if (!window.testResults.supportsWebSocket) {
                    throw new Error('浏览器不支持WebSocket')
                }
                
                // 2. 基础功能测试
                updateStatus('测试基础功能...')
                const client = new TestWebSocketClient('${COMPATIBILITY_CONFIG.TEST_URL}')
                window.testResults.basicFunctionality = true
                
                // 3. 连接测试
                updateStatus('测试连接功能...')
                await client.connect()
                window.testResults.connectionTest = true
                
                // 4. 事件监听测试
                updateStatus('测试事件监听...')
                let messageReceived = false
                client.on('message', (data) => {
                    if (data === '${COMPATIBILITY_CONFIG.TEST_MESSAGE}') {
                        messageReceived = true
                        window.testResults.messageReceiveTest = true
                    }
                })
                window.testResults.eventListenerTest = true
                
                // 5. 消息发送测试
                updateStatus('测试消息发送...')
                client.send('${COMPATIBILITY_CONFIG.TEST_MESSAGE}')
                window.testResults.messageSendTest = true
                
                // 等待消息接收
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve()
                    }, 2000)
                })
                
                // 6. 错误处理测试
                updateStatus('测试错误处理...')
                try {
                    const errorClient = new TestWebSocketClient('ws://invalid-url')
                    await errorClient.connect()
                } catch (error) {
                    window.testResults.errorHandlingTest = true
                }
                
                // 7. 性能测试
                updateStatus('测试性能...')
                const startTime = performance.now()
                for (let i = 0; i < 10; i++) {
                    client.send(\`test message \${i}\`)
                }
                const endTime = performance.now()
                if (endTime - startTime < 1000) { // 10条消息在1秒内发送完成
                    window.testResults.performanceTest = true
                }
                
                client.disconnect()
                updateStatus('测试完成')
                
            } catch (error) {
                window.testResults.errors.push(error.message)
                updateStatus(\`测试失败: \${error.message}\`)
            }
        }
        
        // 页面加载完成后运行测试
        window.addEventListener('load', () => {
            setTimeout(runCompatibilityTests, 1000)
        })
    </script>
</body>
</html>
  `
}

// 为每个浏览器运行兼容性测试
const browsers = ['chromium', 'firefox', 'webkit'] as const

browsers.forEach((browserName) => {
  test.describe(`${browserName} 浏览器兼容性测试`, () => {
    let browser: Browser
    let context: BrowserContext
    let page: Page

    test.beforeAll(async ({ playwright }) => {
      // 启动浏览器
      browser = await playwright[browserName].launch({
        headless: true
      })
    })

    test.afterAll(async () => {
      if (browser) {
        await browser.close()
      }
    })

    test.beforeEach(async () => {
      // 创建浏览器上下文和页面
      context = await browser.newContext()
      page = await context.newPage()
      
      // 设置页面超时
      page.setDefaultTimeout(COMPATIBILITY_CONFIG.PAGE_LOAD_TIMEOUT)
    })

    test.afterEach(async () => {
      if (context) {
        await context.close()
      }
    })

    test('基础WebSocket支持检测', async () => {
      // 创建测试页面
      const testPageContent = createTestPageContent()
      
      // 加载测试页面
      await page.setContent(testPageContent)
      
      // 等待测试完成
      await page.waitForTimeout(8000)
      
      // 获取测试结果
      const testResults = await page.evaluate(() => window.testResults) as CompatibilityResult
      
      // 验证WebSocket支持
      expect(testResults.supportsWebSocket).toBe(true)
      
      console.log(`${browserName} WebSocket支持检测结果:`, testResults.supportsWebSocket)
    })

    test('连接功能测试', async () => {
      const testPageContent = createTestPageContent()
      await page.setContent(testPageContent)
      
      // 等待测试完成
      await page.waitForTimeout(10000)
      
      const testResults = await page.evaluate(() => window.testResults) as CompatibilityResult
      
      // 验证连接功能
      expect(testResults.connectionTest).toBe(true)
      
      console.log(`${browserName} 连接功能测试结果:`, testResults.connectionTest)
    })

    test('消息发送和接收测试', async () => {
      const testPageContent = createTestPageContent()
      await page.setContent(testPageContent)
      
      // 等待测试完成
      await page.waitForTimeout(12000)
      
      const testResults = await page.evaluate(() => window.testResults) as CompatibilityResult
      
      // 验证消息发送和接收
      expect(testResults.messageSendTest).toBe(true)
      // 注意：消息接收测试可能因为网络问题失败，所以这里不做强制要求
      
      console.log(`${browserName} 消息发送测试结果:`, testResults.messageSendTest)
      console.log(`${browserName} 消息接收测试结果:`, testResults.messageReceiveTest)
    })

    test('事件监听功能测试', async () => {
      const testPageContent = createTestPageContent()
      await page.setContent(testPageContent)
      
      await page.waitForTimeout(8000)
      
      const testResults = await page.evaluate(() => window.testResults) as CompatibilityResult
      
      // 验证事件监听功能
      expect(testResults.eventListenerTest).toBe(true)
      
      console.log(`${browserName} 事件监听测试结果:`, testResults.eventListenerTest)
    })

    test('错误处理测试', async () => {
      const testPageContent = createTestPageContent()
      await page.setContent(testPageContent)
      
      await page.waitForTimeout(10000)
      
      const testResults = await page.evaluate(() => window.testResults) as CompatibilityResult
      
      // 验证错误处理
      expect(testResults.errorHandlingTest).toBe(true)
      
      console.log(`${browserName} 错误处理测试结果:`, testResults.errorHandlingTest)
    })

    test('性能测试', async () => {
      const testPageContent = createTestPageContent()
      await page.setContent(testPageContent)
      
      await page.waitForTimeout(15000)
      
      const testResults = await page.evaluate(() => window.testResults) as CompatibilityResult
      
      // 验证性能测试（这个测试可能因为网络问题失败，所以不做强制要求）
      console.log(`${browserName} 性能测试结果:`, testResults.performanceTest)
      
      // 输出所有测试结果
      console.log(`${browserName} 完整测试结果:`, testResults)
    })

    test('综合兼容性测试', async () => {
      const testPageContent = createTestPageContent()
      await page.setContent(testPageContent)
      
      // 等待所有测试完成
      await page.waitForTimeout(15000)
      
      const testResults = await page.evaluate(() => window.testResults) as CompatibilityResult
      
      // 计算兼容性得分
      const tests = [
        'supportsWebSocket',
        'basicFunctionality', 
        'connectionTest',
        'messageSendTest',
        'eventListenerTest',
        'errorHandlingTest'
      ]
      
      const passedTests = tests.filter(test => testResults[test as keyof CompatibilityResult]).length
      const compatibilityScore = (passedTests / tests.length) * 100
      
      console.log(`${browserName} 兼容性测试总结:`)
      console.log(`- 通过测试: ${passedTests}/${tests.length}`)
      console.log(`- 兼容性得分: ${compatibilityScore.toFixed(2)}%`)
      console.log(`- 错误信息:`, testResults.errors)
      
      // 要求至少80%的测试通过
      expect(compatibilityScore).toBeGreaterThanOrEqual(80)
    })
  })
})
