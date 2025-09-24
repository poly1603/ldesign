import { expect, test } from '@playwright/test'

test.describe('设备检测功能', () => {
  test.beforeEach(async ({ page }) => {
    // 访问测试页面
    await page.goto('/')
  })

  test('应该正确检测桌面设备', async ({ page }) => {
    // 设置桌面设备视口
    await page.setViewportSize({ width: 1920, height: 1080 })

    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 检查设备类型
    const deviceType = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()
      return detector.getDeviceType()
    })

    expect(deviceType).toBe('desktop')
  })

  test('应该正确检测移动设备', async ({ page }) => {
    // 设置移动设备视口
    await page.setViewportSize({ width: 375, height: 667 })

    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 检查设备类型
    const deviceType = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()
      return detector.getDeviceType()
    })

    expect(deviceType).toBe('mobile')
  })

  test('应该正确检测平板设备', async ({ page }) => {
    // 设置平板设备视口
    await page.setViewportSize({ width: 768, height: 1024 })

    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 检查设备类型
    const deviceType = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()
      return detector.getDeviceType()
    })

    expect(deviceType).toBe('tablet')
  })

  test('应该正确检测屏幕方向', async ({ page }) => {
    // 横屏
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForLoadState('networkidle')

    let orientation = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()
      return detector.getOrientation()
    })

    expect(orientation).toBe('landscape')

    // 竖屏
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(100) // 等待方向变化

    orientation = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()
      return detector.getOrientation()
    })

    expect(orientation).toBe('portrait')
  })

  test('应该响应窗口大小变化', async ({ page }) => {
    // 初始为桌面设备
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForLoadState('networkidle')

    // 创建设备检测器并监听变化
    await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()

        // 存储到 window 对象供后续使用
        ; (window as any).testDetector = detector
      ; (window as any).deviceChanges = []

      detector.on('deviceChange', (info: any) => {
        ; (window as any).deviceChanges.push(info)
      })
    })

    // 改变窗口大小为移动设备
    await page.setViewportSize({ width: 375, height: 667 })

    // 等待防抖完成
    await page.waitForTimeout(300)

    // 检查是否触发了设备变化事件
    const deviceChanges = await page.evaluate(() => {
      return (window as any).deviceChanges
    })

    expect(deviceChanges.length).toBeGreaterThan(0)

    // 检查最新的设备类型
    const currentDeviceType = await page.evaluate(() => {
      return (window as any).testDetector.getDeviceType()
    })

    expect(currentDeviceType).toBe('mobile')
  })

  test('应该正确获取设备信息', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForLoadState('networkidle')

    const deviceInfo = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()
      return detector.getDeviceInfo()
    })

    expect(deviceInfo).toMatchObject({
      type: 'desktop',
      orientation: 'landscape',
      width: 1920,
      height: 1080,
      isTouchDevice: expect.any(Boolean),
      userAgent: expect.any(String),
      os: {
        name: expect.any(String),
        version: expect.any(String),
      },
      browser: {
        name: expect.any(String),
        version: expect.any(String),
      },
    })
  })

  test('应该支持自定义断点', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 500 })
    await page.waitForLoadState('networkidle')

    // 使用默认断点
    const defaultDeviceType = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()
      return detector.getDeviceType()
    })

    // 使用自定义断点
    const customDeviceType = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector({
        breakpoints: {
          mobile: 600,
          tablet: 900,
        },
      })
      return detector.getDeviceType()
    })

    expect(defaultDeviceType).toBe('tablet')
    expect(customDeviceType).toBe('tablet')
  })
})

test.describe('扩展模块功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('应该能够加载网络模块', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { DeviceDetector, NetworkModule } = window as any
      const detector = new DeviceDetector()

      try {
        await detector.loadModule('network', NetworkModule)
        const isLoaded = detector.isModuleLoaded('network')
        const networkModule = detector.getModule('network')
        const networkInfo = networkModule?.getNetworkInfo()

        return {
          isLoaded,
          hasNetworkInfo: !!networkInfo,
          isOnline: networkInfo?.isOnline,
        }
      }
      catch (error) {
        return { error: error instanceof Error ? error.message : String(error) }
      }
    })

    expect(result.isLoaded).toBe(true)
    expect(result.hasNetworkInfo).toBe(true)
    expect(typeof result.isOnline).toBe('boolean')
  })

  test('应该能够卸载模块', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { DeviceDetector, NetworkModule } = window as any
      const detector = new DeviceDetector()

      // 加载模块
      await detector.loadModule('network', NetworkModule)
      const isLoadedBefore = detector.isModuleLoaded('network')

      // 卸载模块
      await detector.unloadModule('network')
      const isLoadedAfter = detector.isModuleLoaded('network')

      return {
        isLoadedBefore,
        isLoadedAfter,
      }
    })

    expect(result.isLoadedBefore).toBe(true)
    expect(result.isLoadedAfter).toBe(false)
  })

  test('应该正确处理模块加载错误', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()

      try {
        // 尝试加载不存在的模块
        await detector.loadModule('invalid', null)
        return { success: true }
      }
      catch (error) {
        return { error: error instanceof Error ? error.message : String(error) }
      }
    })

    expect(result.error).toBeDefined()
  })
})

test.describe('事件系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('应该支持事件监听和移除', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()

      let callCount = 0
      const callback = () => callCount++

      // 添加监听器
      detector.on('deviceChange', callback)
      const listenerCountAfterAdd = detector.listenerCount('deviceChange')

      // 触发事件
      detector.emit('deviceChange', detector.getDeviceInfo())

      // 移除监听器
      detector.off('deviceChange', callback)
      const listenerCountAfterRemove = detector.listenerCount('deviceChange')

      // 再次触发事件
      detector.emit('deviceChange', detector.getDeviceInfo())

      return {
        listenerCountAfterAdd,
        listenerCountAfterRemove,
        callCount,
      }
    })

    expect(result.listenerCountAfterAdd).toBe(1)
    expect(result.listenerCountAfterRemove).toBe(0)
    expect(result.callCount).toBe(1)
  })

  test('应该支持一次性事件监听', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()

      let callCount = 0
      const callback = () => callCount++

      // 添加一次性监听器
      detector.once('deviceChange', callback)

      // 触发事件两次
      detector.emit('deviceChange', detector.getDeviceInfo())
      detector.emit('deviceChange', detector.getDeviceInfo())

      const listenerCount = detector.listenerCount('deviceChange')

      return {
        callCount,
        listenerCount,
      }
    })

    expect(result.callCount).toBe(1)
    expect(result.listenerCount).toBe(0)
  })
})

test.describe('生命周期管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('应该正确销毁检测器', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { DeviceDetector } = window as any
      const detector = new DeviceDetector()

      // 添加事件监听器
      detector.on('deviceChange', () => { })
      const listenerCountBefore = detector.listenerCount('deviceChange')

      // 销毁检测器
      await detector.destroy()

      // 检查是否清理了监听器
      const listenerCountAfter = detector.listenerCount('deviceChange')

      return {
        listenerCountBefore,
        listenerCountAfter,
      }
    })

    expect(result.listenerCountBefore).toBe(1)
    expect(result.listenerCountAfter).toBe(0)
  })
})
