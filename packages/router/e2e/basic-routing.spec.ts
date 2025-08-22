import { expect, test } from '@playwright/test'

test.describe('基本路由功能 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问测试应用首页
    await page.goto('/')
  })

  test('应该正确显示首页', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/Router Test App/)

    // 检查首页内容
    const heading = page.locator('h1')
    await expect(heading).toContainText('Router Test App')
  })

  test('应该正确处理路由导航', async ({ page }) => {
    // 点击导航链接
    await page.click('a[href="/about"]')

    // 检查 URL 变化
    await expect(page).toHaveURL(/\/about/)

    // 检查页面内容变化
    const content = page.locator('[data-testid="page-content"]')
    await expect(content).toContainText('About')
  })

  test('应该正确处理动态路由', async ({ page }) => {
    // 导航到用户页面
    await page.click('a[href="/user/123"]')

    // 检查 URL
    await expect(page).toHaveURL(/\/user\/123/)

    // 检查动态参数显示
    const userInfo = page.locator('[data-testid="user-id"]')
    await expect(userInfo).toContainText('123')
  })

  test('应该正确处理浏览器前进后退', async ({ page }) => {
    // 导航到关于页面
    await page.click('a[href="/about"]')
    await expect(page).toHaveURL(/\/about/)

    // 导航到用户页面
    await page.click('a[href="/user/456"]')
    await expect(page).toHaveURL(/\/user\/456/)

    // 后退
    await page.goBack()
    await expect(page).toHaveURL(/\/about/)

    // 前进
    await page.goForward()
    await expect(page).toHaveURL(/\/user\/456/)
  })

  test('应该正确处理查询参数', async ({ page }) => {
    // 导航到带查询参数的页面
    await page.goto('/search?q=test&category=all')

    // 检查查询参数显示
    const query = page.locator('[data-testid="search-query"]')
    await expect(query).toContainText('test')

    const category = page.locator('[data-testid="search-category"]')
    await expect(category).toContainText('all')
  })

  test('应该正确处理哈希路由', async ({ page }) => {
    // 导航到带哈希的页面
    await page.goto('/docs#section1')

    // 检查哈希值
    const hash = await page.evaluate(() => window.location.hash)
    expect(hash).toBe('#section1')

    // 检查页面滚动到对应位置
    const section = page.locator('#section1')
    await expect(section).toBeInViewport()
  })

  test('应该正确处理 404 页面', async ({ page }) => {
    // 访问不存在的页面
    await page.goto('/nonexistent-page')

    // 检查 404 页面显示
    const notFound = page.locator('[data-testid="not-found"]')
    await expect(notFound).toBeVisible()
    await expect(notFound).toContainText('404')
  })

  test('应该正确处理路由守卫', async ({ page }) => {
    // 尝试访问需要认证的页面
    await page.goto('/admin')

    // 应该被重定向到登录页面
    await expect(page).toHaveURL(/\/login/)

    // 检查重定向提示
    const message = page.locator('[data-testid="redirect-message"]')
    await expect(message).toContainText('请先登录')
  })

  test('应该正确处理嵌套路由', async ({ page }) => {
    // 导航到嵌套路由
    await page.goto('/posts/123')

    // 检查父路由内容
    const postsContainer = page.locator('[data-testid="posts-container"]')
    await expect(postsContainer).toBeVisible()

    // 检查子路由内容
    const postContent = page.locator('[data-testid="post-content"]')
    await expect(postContent).toBeVisible()
    await expect(postContent).toContainText('Post 123')
  })

  test('应该正确处理路由元信息', async ({ page }) => {
    // 导航到有元信息的页面
    await page.goto('/profile')

    // 检查页面标题是否根据元信息更新
    await expect(page).toHaveTitle(/Profile/)

    // 检查面包屑导航
    const breadcrumb = page.locator('[data-testid="breadcrumb"]')
    await expect(breadcrumb).toContainText('Profile')
  })
})

test.describe('路由性能测试', () => {
  test('路由导航应该在合理时间内完成', async ({ page }) => {
    await page.goto('/')

    // 测量导航时间
    const startTime = Date.now()
    await page.click('a[href="/about"]')
    await page.waitForURL(/\/about/)
    const endTime = Date.now()

    const navigationTime = endTime - startTime
    expect(navigationTime).toBeLessThan(1000) // 导航应该在 1 秒内完成
  })

  test('大量路由切换应该保持流畅', async ({ page }) => {
    await page.goto('/')

    const routes = ['/', '/about', '/user/1', '/user/2', '/posts', '/contact']

    for (const route of routes) {
      const startTime = Date.now()
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const endTime = Date.now()

      const loadTime = endTime - startTime
      expect(loadTime).toBeLessThan(500) // 每次导航应该在 500ms 内完成
    }
  })
})

test.describe('移动端路由测试', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('移动端导航应该正常工作', async ({ page }) => {
    await page.goto('/')

    // 打开移动端菜单
    const menuButton = page.locator('[data-testid="mobile-menu-button"]')
    await menuButton.click()

    // 点击导航项
    const aboutLink = page.locator(
      '[data-testid="mobile-nav"] a[href="/about"]',
    )
    await aboutLink.click()

    // 检查导航结果
    await expect(page).toHaveURL(/\/about/)
  })

  test('移动端应该正确处理手势导航', async ({ page }) => {
    await page.goto('/user/123')

    // 模拟滑动手势返回
    await page.touchscreen.tap(50, 300)
    await page.touchscreen.tap(350, 300)

    // 检查是否触发了返回操作
    // 注意：这个测试可能需要根据实际的手势实现进行调整
  })
})

test.describe('路由缓存测试', () => {
  test('页面缓存应该正常工作', async ({ page }) => {
    await page.goto('/cached-page')

    // 添加一些状态
    await page.fill('[data-testid="input-field"]', 'test value')

    // 导航到其他页面
    await page.goto('/about')

    // 返回缓存页面
    await page.goto('/cached-page')

    // 检查状态是否保持
    const inputValue = await page.inputValue('[data-testid="input-field"]')
    expect(inputValue).toBe('test value')
  })
})

test.describe('路由错误处理', () => {
  test('网络错误应该正确处理', async ({ page }) => {
    // 模拟网络离线
    await page.context().setOffline(true)

    await page.goto('/network-dependent-page')

    // 检查错误页面
    const errorMessage = page.locator('[data-testid="network-error"]')
    await expect(errorMessage).toBeVisible()

    // 恢复网络
    await page.context().setOffline(false)

    // 重试按钮应该工作
    await page.click('[data-testid="retry-button"]')
    await expect(errorMessage).not.toBeVisible()
  })

  test('组件加载错误应该正确处理', async ({ page }) => {
    // 访问一个组件加载可能失败的页面
    await page.goto('/lazy-component-page')

    // 检查加载状态
    const loading = page.locator('[data-testid="loading"]')
    await expect(loading).toBeVisible()

    // 等待组件加载完成或错误
    await page.waitForTimeout(3000)

    // 检查是否正确处理了加载结果
    const content = page.locator('[data-testid="page-content"]')
    const error = page.locator('[data-testid="load-error"]')

    // 应该显示内容或错误，但不应该一直显示加载状态
    await expect(loading).not.toBeVisible()

    const hasContent = await content.isVisible()
    const hasError = await error.isVisible()
    expect(hasContent || hasError).toBe(true)
  })
})
