import { expect, test } from '@playwright/test'

test.describe('性能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005')
  })

  test('页面加载性能', async ({ page }) => {
    // 测试首屏加载时间
    const startTime = Date.now()
    await page.goto('http://localhost:3005')
    await page.waitForSelector('h1')
    const loadTime = Date.now() - startTime

    // 首屏加载应该在 3 秒内完成
    expect(loadTime).toBeLessThan(3000)

    // 检查关键资源是否加载
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0]
    })

    expect((performanceEntries as any).loadEventEnd - (performanceEntries as any).loadEventStart).toBeLessThan(1000)
  })

  test('模板切换性能', async ({ page }) => {
    await page.click('text=组件演示')
    await page.waitForSelector('[data-testid="template-selector"]')

    // 测试多次模板切换的性能
    const switchTimes = []
    const templates = ['classic', 'modern', 'default']

    for (let i = 0; i < 5; i++) {
      for (const template of templates) {
        const startTime = performance.now()
        await page.selectOption('[data-testid="template-selector"]', template)
        await page.waitForSelector('.template-content')
        const endTime = performance.now()

        switchTimes.push(endTime - startTime)
      }
    }

    // 平均切换时间应该在 500ms 内
    const averageTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length
    expect(averageTime).toBeLessThan(500)

    // 最慢的切换也应该在 1 秒内
    const maxTime = Math.max(...switchTimes)
    expect(maxTime).toBeLessThan(1000)
  })

  test('内存使用监控', async ({ page }) => {
    await page.click('text=性能演示')
    await page.waitForSelector('[data-testid="performance-monitor"]')

    // 获取初始内存使用
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    // 执行一些操作
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="load-template-btn"]')
      await page.waitForTimeout(100)
    }

    // 检查内存使用
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    // 内存增长应该在合理范围内（不超过 50MB）
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024
    expect(memoryIncrease).toBeLessThan(50)
  })

  test('虚拟滚动性能', async ({ page }) => {
    await page.click('text=虚拟滚动演示')
    await page.waitForSelector('[data-testid="virtual-scroll"]')

    // 测试大量数据的滚动性能
    const container = page.locator('[data-testid="virtual-scroll"]')

    // 快速滚动测试
    const scrollStartTime = performance.now()
    for (let i = 0; i < 10; i++) {
      await container.evaluate((el, scrollTop) => (el.scrollTop = scrollTop), i * 1000)
      await page.waitForTimeout(50)
    }
    const scrollEndTime = performance.now()

    // 滚动操作应该流畅（总时间不超过 2 秒）
    expect(scrollEndTime - scrollStartTime).toBeLessThan(2000)

    // 检查 DOM 节点数量是否保持在合理范围
    const nodeCount = await page.evaluate(() => {
      return document.querySelectorAll('.virtual-item').length
    })

    // 虚拟滚动应该只渲染可见项目（不超过 50 个）
    expect(nodeCount).toBeLessThan(50)
  })

  test('缓存效率测试', async ({ page }) => {
    await page.click('text=组件演示')

    // 预热缓存
    const templates = ['classic', 'modern', 'default']
    for (const template of templates) {
      await page.selectOption('[data-testid="template-selector"]', template)
      await page.waitForSelector('.template-content')
    }

    // 测试缓存命中性能
    const cacheHitTimes = []
    for (let i = 0; i < 10; i++) {
      const template = templates[i % templates.length]
      const startTime = performance.now()
      await page.selectOption('[data-testid="template-selector"]', template)
      await page.waitForSelector('.template-content')
      const endTime = performance.now()

      cacheHitTimes.push(endTime - startTime)
    }

    // 缓存命中的平均时间应该很快（不超过 100ms）
    const averageCacheTime = cacheHitTimes.reduce((a, b) => a + b, 0) / cacheHitTimes.length
    expect(averageCacheTime).toBeLessThan(100)
  })

  test('并发加载性能', async ({ page }) => {
    await page.click('text=组件演示')

    // 并发触发多个模板加载
    const promises = []
    const templates = ['classic', 'modern', 'default']

    const startTime = performance.now()
    for (let i = 0; i < 5; i++) {
      promises.push(
        page.evaluate((template) => {
          // 模拟并发加载
          return new Promise((resolve) => {
            setTimeout(() => {
              const event = new CustomEvent('load-template', { detail: { template } })
              window.dispatchEvent(event)
              resolve(template)
            }, Math.random() * 100)
          })
        }, templates[i % templates.length]),
      )
    }

    await Promise.all(promises)
    const endTime = performance.now()

    // 并发加载应该在合理时间内完成
    expect(endTime - startTime).toBeLessThan(1000)
  })

  test('FPS 监控', async ({ page }) => {
    await page.click('text=性能演示')
    await page.waitForSelector('[data-testid="performance-monitor"]')

    // 启动 FPS 监控
    await page.evaluate(() => {
      let frameCount = 0
      let lastTime = performance.now()

      function countFrames() {
        frameCount++
        const currentTime = performance.now()

        if (currentTime - lastTime >= 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))

          // 将 FPS 数据存储到页面中
          const fpsElement = document.querySelector('[data-testid="fps-value"]')
          if (fpsElement) {
            fpsElement.textContent = fps.toString()
          }

          frameCount = 0
          lastTime = currentTime
        }

        requestAnimationFrame(countFrames)
      }

      requestAnimationFrame(countFrames)
    })

    // 等待 FPS 数据收集
    await page.waitForTimeout(2000)

    // 检查 FPS 是否在合理范围内
    const fpsText = await page.locator('[data-testid="fps-value"]').textContent()
    const fps = Number.parseInt(fpsText || '0')

    // FPS 应该大于 30（流畅体验的最低要求）
    expect(fps).toBeGreaterThan(30)

    // FPS 不应该超过 60（浏览器限制）
    expect(fps).toBeLessThanOrEqual(60)
  })

  test('网络性能测试', async ({ page }) => {
    // 模拟慢速网络
    await page.route('**/*.js', (route) => {
      setTimeout(() => route.continue(), 200)
    })

    await page.click('text=组件演示')

    // 测试在慢速网络下的加载性能
    const startTime = performance.now()
    await page.selectOption('[data-testid="template-selector"]', 'modern')
    await page.waitForSelector('.template-content')
    const endTime = performance.now()

    // 即使在慢速网络下，加载时间也应该在可接受范围内
    expect(endTime - startTime).toBeLessThan(5000)

    // 检查是否有适当的加载状态显示
    await expect(page.locator('.loading-indicator')).toBeVisible()
  })

  test('资源使用优化', async ({ page }) => {
    // 监控网络请求
    const requests: any[] = []
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      })
    })

    await page.click('text=组件演示')
    await page.waitForSelector('[data-testid="template-selector"]')

    // 切换几个模板
    const templates = ['classic', 'modern', 'default']
    for (const template of templates) {
      await page.selectOption('[data-testid="template-selector"]', template)
      await page.waitForSelector('.template-content')
    }

    // 分析网络请求
    const jsRequests = requests.filter(req => req.resourceType === 'script')
    const cssRequests = requests.filter(req => req.resourceType === 'stylesheet')

    // 检查是否有不必要的重复请求
    const uniqueJsUrls = new Set(jsRequests.map(req => req.url))
    const uniqueCssUrls = new Set(cssRequests.map(req => req.url))

    // 重复请求应该很少（缓存生效）
    expect(jsRequests.length - uniqueJsUrls.size).toBeLessThan(5)
    expect(cssRequests.length - uniqueCssUrls.size).toBeLessThan(3)
  })
})
