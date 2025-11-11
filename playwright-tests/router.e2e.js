'use strict'

const { chromium } = require('playwright')

async function expectHasText(page, text, timeout = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const content = await page.content()
    if (content.includes(text)) return
    await page.waitForTimeout(200)
  }
  throw new Error(`页面未出现文本: ${text}`)
}

async function resolveBase(page, candidates) {
  for (const base of candidates) {
    try {
      const resp = await page.goto(`${base}/#/`, { waitUntil: 'domcontentloaded', timeout: 5000 })
      if (resp) return base
    } catch (_) {}
  }
  throw new Error(`无法连接到候选端口: ${candidates.join(', ')}`)
}

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  const angularErrors = []
  const preactErrors = []

  // Angular
  const pageA = await context.newPage()
  pageA.on('console', (msg) => { if (msg.type() === 'error') angularErrors.push(msg.text()) })
  const angularBase = await resolveBase(pageA, [
    `http://localhost:${process.env.ANGULAR_PORT ?? '5179'}`,
    'http://localhost:5185',
    'http://localhost:5184',
  ])
  await pageA.goto(`${angularBase}/#/`)
  await expectHasText(pageA, '首页')
  await pageA.goto(`${angularBase}/#/about`)
  await expectHasText(pageA, '关于')
  await pageA.goto(`${angularBase}/#/user/2`)
  await expectHasText(pageA, '当前用户 ID: 2')
  await pageA.reload()
  await expectHasText(pageA, '当前用户 ID: 2')

  // Preact
  const pageP = await context.newPage()
  pageP.on('console', (msg) => { if (msg.type() === 'error') preactErrors.push(msg.text()) })
  const preactBase = await resolveBase(pageP, [
    `http://localhost:${process.env.PREACT_PORT ?? '5181'}`,
    'http://localhost:5186',
    'http://localhost:5183',
  ])
  await pageP.goto(`${preactBase}/#/`)
  await expectHasText(pageP, '首页')
  await pageP.goto(`${preactBase}/#/about`)
  await expectHasText(pageP, '关于')
  await pageP.goto(`${preactBase}/#/user/3`)
  await expectHasText(pageP, '用户详情')
  await expectHasText(pageP, 'id = 3')
  await pageP.reload()
  await expectHasText(pageP, 'id = 3')

  await browser.close()

  console.log('Angular 控制台错误数:', angularErrors.length)
  if (angularErrors.length) console.log(angularErrors.join('\n'))
  console.log('Preact 控制台错误数:', preactErrors.length)
  if (preactErrors.length) console.log(preactErrors.join('\n'))
}

run().then(() => {
  console.log('E2E 测试通过: Angular + Preact 路由验证成功')
  process.exit(0)
}).catch((err) => {
  console.error('E2E 测试失败:', err && err.message ? err.message : err)
  process.exit(1)
})

