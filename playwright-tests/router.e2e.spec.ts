import { test, expect } from '@playwright/test'

// 实用：断言页面包含文本（包含 emoji/前后缀时更稳健）
async function expectHasText(page: import('@playwright/test').Page, text: string) {
  await expect(page.locator('body')).toContainText(text, { timeout: 10000 })
}

// 尝试多个端口，返回第一个可用的 base URL（形如 http://localhost:PORT）
async function resolveBase(page: import('@playwright/test').Page, candidates: string[]): Promise<string> {
  for (const base of candidates) {
    try {
      const resp = await page.goto(`${base}/#/`, { waitUntil: 'domcontentloaded', timeout: 5000 })
      if (resp) return base
    }
    catch (_) {
      // 忽略，尝试下一个候选端口
    }
  }
  throw new Error(`无法连接到候选端口: ${candidates.join(', ')}`)
}

// Angular 示例（尝试 5179 → 5185 → 5184）
test('Angular example routing: home/about/user and reload', async ({ page }) => {
  const base = await resolveBase(page, [
    `http://localhost:${process.env.ANGULAR_PORT ?? '5179'}`,
    'http://localhost:5185',
    'http://localhost:5184',
  ])

  // 首页
  await page.goto(`${base}/#/`)
  await expectHasText(page, '首页')

  // 关于
  await page.goto(`${base}/#/about`)
  await expectHasText(page, '关于')

  // 用户 2
  await page.goto(`${base}/#/user/2`)
  await expectHasText(page, '当前用户 ID: 2')

  // 刷新应仍为 2
  await page.reload()
  await expectHasText(page, '当前用户 ID: 2')
})

// Preact 示例（尝试 5181 → 5186 → 5183）
test('Preact example routing: home/about/user and reload', async ({ page }) => {
  const base = await resolveBase(page, [
    `http://localhost:${process.env.PREACT_PORT ?? '5181'}`,
    'http://localhost:5186',
    'http://localhost:5183',
  ])

  // 首页
  await page.goto(`${base}/#/`)
  await expectHasText(page, '首页')

  // 关于
  await page.goto(`${base}/#/about`)
  await expectHasText(page, '关于')

  // 用户 3
  await page.goto(`${base}/#/user/3`)
  await expectHasText(page, '用户详情')
  await expectHasText(page, 'id = 3')

  // 刷新应仍为 3
  await page.reload()
  await expectHasText(page, 'id = 3')
})

