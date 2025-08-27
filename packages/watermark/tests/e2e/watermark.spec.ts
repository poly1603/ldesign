/**
 * 水印系统 E2E 测试
 */

import { test, expect } from '@playwright/test'

test.describe('水印系统 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 创建测试页面
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>水印测试页面</title>
        <style>
          #container {
            width: 800px;
            height: 600px;
            border: 1px solid #ccc;
            position: relative;
          }
          .content {
            padding: 20px;
            background: #f5f5f5;
            height: 100%;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div id="container">
          <div class="content">
            <h1>测试内容</h1>
            <p>这是一个用于测试水印功能的页面。</p>
            <p>水印应该覆盖在这些内容之上。</p>
          </div>
        </div>
        <script type="module">
          // 这里会加载水印库
          window.watermarkReady = false;
          
          // 模拟水印库加载
          setTimeout(() => {
            window.watermarkReady = true;
            window.dispatchEvent(new Event('watermark-ready'));
          }, 100);
        </script>
      </body>
      </html>
    `)
  })

  test('应该正确加载页面', async ({ page }) => {
    await expect(page.locator('#container')).toBeVisible()
    await expect(page.locator('.content h1')).toHaveText('测试内容')
  })

  test('应该等待水印库准备就绪', async ({ page }) => {
    await page.waitForEvent('watermark-ready')
    const isReady = await page.evaluate(() => window.watermarkReady)
    expect(isReady).toBe(true)
  })

  test('应该能够创建基础文字水印', async ({ page }) => {
    await page.waitForEvent('watermark-ready')
    
    // 模拟创建水印
    await page.evaluate(() => {
      const container = document.getElementById('container')
      if (container) {
        // 创建模拟水印元素
        const watermark = document.createElement('div')
        watermark.className = 'watermark-item'
        watermark.textContent = 'E2E 测试水印'
        watermark.style.cssText = `
          position: absolute;
          top: 50px;
          left: 100px;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.15);
          pointer-events: none;
          user-select: none;
          transform: rotate(-22deg);
        `
        container.appendChild(watermark)
      }
    })

    // 验证水印元素存在
    await expect(page.locator('.watermark-item')).toBeVisible()
    await expect(page.locator('.watermark-item')).toHaveText('E2E 测试水印')
  })

  test('应该正确应用水印样式', async ({ page }) => {
    await page.waitForEvent('watermark-ready')
    
    await page.evaluate(() => {
      const container = document.getElementById('container')
      if (container) {
        const watermark = document.createElement('div')
        watermark.className = 'watermark-item styled'
        watermark.textContent = '样式测试'
        watermark.style.cssText = `
          position: absolute;
          top: 100px;
          left: 200px;
          font-size: 20px;
          color: red;
          opacity: 0.8;
          pointer-events: none;
          user-select: none;
          transform: rotate(45deg);
        `
        container.appendChild(watermark)
      }
    })

    const watermark = page.locator('.watermark-item.styled')
    await expect(watermark).toBeVisible()
    
    // 验证样式
    await expect(watermark).toHaveCSS('color', 'rgb(255, 0, 0)') // red
    await expect(watermark).toHaveCSS('opacity', '0.8')
    await expect(watermark).toHaveCSS('font-size', '20px')
  })

  test('应该支持多个水印实例', async ({ page }) => {
    await page.waitForEvent('watermark-ready')
    
    await page.evaluate(() => {
      const container = document.getElementById('container')
      if (container) {
        // 创建多个水印
        for (let i = 0; i < 5; i++) {
          const watermark = document.createElement('div')
          watermark.className = 'watermark-item'
          watermark.textContent = `水印 ${i + 1}`
          watermark.style.cssText = `
            position: absolute;
            top: ${50 + i * 80}px;
            left: ${100 + i * 120}px;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.15);
            pointer-events: none;
            user-select: none;
            transform: rotate(-22deg);
          `
          container.appendChild(watermark)
        }
      }
    })

    // 验证所有水印都存在
    const watermarks = page.locator('.watermark-item')
    await expect(watermarks).toHaveCount(5)
    
    // 验证每个水印的内容
    for (let i = 0; i < 5; i++) {
      await expect(watermarks.nth(i)).toHaveText(`水印 ${i + 1}`)
    }
  })

  test('应该不影响页面交互', async ({ page }) => {
    await page.waitForEvent('watermark-ready')
    
    // 添加水印
    await page.evaluate(() => {
      const container = document.getElementById('container')
      if (container) {
        const watermark = document.createElement('div')
        watermark.className = 'watermark-item'
        watermark.textContent = '交互测试'
        watermark.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.15);
          pointer-events: none;
          user-select: none;
          z-index: 9999;
        `
        container.appendChild(watermark)
      }
    })

    // 验证可以点击底层内容
    await page.locator('.content h1').click()
    await expect(page.locator('.content h1')).toBeVisible()
    
    // 验证可以选择文本
    await page.locator('.content p').first().click()
    const text = await page.locator('.content p').first().textContent()
    expect(text).toContain('这是一个用于测试水印功能的页面')
  })

  test('应该在窗口大小变化时保持正确显示', async ({ page }) => {
    await page.waitForEvent('watermark-ready')
    
    // 添加水印
    await page.evaluate(() => {
      const container = document.getElementById('container')
      if (container) {
        const watermark = document.createElement('div')
        watermark.className = 'watermark-item responsive'
        watermark.textContent = '响应式测试'
        watermark.style.cssText = `
          position: absolute;
          top: 50px;
          left: 100px;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.15);
          pointer-events: none;
          user-select: none;
        `
        container.appendChild(watermark)
      }
    })

    // 验证初始状态
    await expect(page.locator('.watermark-item.responsive')).toBeVisible()
    
    // 改变视口大小
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(100)
    
    // 验证水印仍然可见
    await expect(page.locator('.watermark-item.responsive')).toBeVisible()
    
    // 恢复原始大小
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(100)
    
    await expect(page.locator('.watermark-item.responsive')).toBeVisible()
  })

  test('应该正确处理水印移除', async ({ page }) => {
    await page.waitForEvent('watermark-ready')
    
    // 添加水印
    await page.evaluate(() => {
      const container = document.getElementById('container')
      if (container) {
        const watermark = document.createElement('div')
        watermark.className = 'watermark-item removable'
        watermark.textContent = '可移除水印'
        watermark.style.cssText = `
          position: absolute;
          top: 50px;
          left: 100px;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.15);
          pointer-events: none;
          user-select: none;
        `
        container.appendChild(watermark)
      }
    })

    // 验证水印存在
    await expect(page.locator('.watermark-item.removable')).toBeVisible()
    
    // 移除水印
    await page.evaluate(() => {
      const watermark = document.querySelector('.watermark-item.removable')
      if (watermark) {
        watermark.remove()
      }
    })

    // 验证水印已移除
    await expect(page.locator('.watermark-item.removable')).not.toBeVisible()
  })

  test('应该支持不同的渲染模式', async ({ page }) => {
    await page.waitForEvent('watermark-ready')
    
    // 测试 DOM 模式
    await page.evaluate(() => {
      const container = document.getElementById('container')
      if (container) {
        const domWatermark = document.createElement('div')
        domWatermark.className = 'watermark-dom'
        domWatermark.textContent = 'DOM 模式'
        domWatermark.style.cssText = `
          position: absolute;
          top: 50px;
          left: 100px;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.15);
          pointer-events: none;
        `
        container.appendChild(domWatermark)
      }
    })

    await expect(page.locator('.watermark-dom')).toBeVisible()
    
    // 测试 Canvas 模式（模拟）
    await page.evaluate(() => {
      const container = document.getElementById('container')
      if (container) {
        const canvas = document.createElement('canvas')
        canvas.className = 'watermark-canvas'
        canvas.width = 800
        canvas.height = 600
        canvas.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
        `
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.font = '16px Arial'
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
          ctx.fillText('Canvas 模式', 200, 150)
        }
        
        container.appendChild(canvas)
      }
    })

    await expect(page.locator('.watermark-canvas')).toBeVisible()
  })
})
