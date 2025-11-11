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
    } catch (_) { }
  }
  throw new Error(`无法连接到候选端口: ${candidates.join(', ')}`)
}

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  const angularErrors = []
  const preactErrors = []

  // 运行状态标记
  let angularOk = true
  let preactOk = true

  // Angular
  const pageA = await context.newPage()
  pageA.on('console', (msg) => { if (msg.type() === 'error') angularErrors.push(msg.text()) })
  const angularBase = await resolveBase(pageA, [
    `http://localhost:${process.env.ANGULAR_PORT ?? '5179'}`,
    'http://localhost:5185',
    'http://localhost:5184',
  ])
  console.log('Angular base:', angularBase)

  try {
    await pageA.goto(`${angularBase}/#/`)
    await expectHasText(pageA, '首页')
    await pageA.goto(`${angularBase}/#/about`)
    await expectHasText(pageA, '关于')
    await pageA.goto(`${angularBase}/#/user/2`)
    // 调试：打印引擎与路由当前状态
    const routeInfo = await pageA.evaluate(() => {
      const w = window
      const eng = (w && w.__ENGINE__) || (w && w.__ldesignEngine)
      const hasEngine = !!eng
      const hasRouter = !!(eng && eng.router)
      const current = hasRouter ? eng.router.getCurrentRoute() : null
      return {
        hasEngine,
        hasRouter,
        url: w.location.href,
        hash: w.location.hash,
        pathname: w.location.pathname,
        current,
      }
    })
    console.log('Angular routeInfo:', JSON.stringify(routeInfo))
    await expectHasText(pageA, '当前用户 ID: 2')
    await pageA.reload()
    await expectHasText(pageA, '当前用户 ID: 2')
  } catch (e) {
    try {
      console.error('Angular 调试: 当前 URL =', await pageA.url())
      const text = await pageA.locator('body').innerText()
      console.error('Angular body 文本前 1000 字符:', text.slice(0, 1000))
    } catch { }
    angularOk = false
  }

  // Preact
  const pageP = await context.newPage()
  pageP.on('console', (msg) => { if (msg.type() === 'error') preactErrors.push(msg.text()) })
  const preactBase = await resolveBase(pageP, [
    `http://localhost:${process.env.PREACT_PORT ?? '5181'}`,
    'http://localhost:5186',
    'http://localhost:5183',
  ])
  console.log('Preact base:', preactBase)
  try {
    await pageP.goto(`${preactBase}/#/`)
    await expectHasText(pageP, '首页')
    await pageP.goto(`${preactBase}/#/about`)
    await expectHasText(pageP, '关于')
    await pageP.goto(`${preactBase}/#/user/3`)
    await expectHasText(pageP, '用户详情')
    await expectHasText(pageP, 'id = 3')
    await pageP.reload()
    await expectHasText(pageP, 'id = 3')

  } catch (e) {
    preactOk = false
    try {
      console.error('Preact 调试: 当前 URL =', await pageP.url())
      const text2 = await pageP.locator('body').innerText()
      console.error('Preact body 文本前 1000 字符:', text2.slice(0, 1000))
    } catch { }
  }

  await browser.close()

  console.log('Angular 控制台错误数:', angularErrors.length)
  if (angularErrors.length) console.log(angularErrors.join('\n'))
  console.log('Preact 控制台错误数:', preactErrors.length)
  if (preactErrors.length) console.log(preactErrors.join('\n'))
  return { angularOk, preactOk }

  run().then((result) => {
    const { angularOk, preactOk } = result
    if (angularOk && preactOk) {
      console.log('E2E 测试通过: Angular + Preact 路由验证成功')
      process.exit(0)
    } else {
      if (!angularOk) console.error('E2E: Angular 路由验证失败')
      if (!preactOk) console.error('E2E: Preact 路由验证失败')
      process.exit(1)
    }
  }).catch((err) => {
    console.error('E2E 测试失败:', err && err.message ? err.message : err)
    process.exit(1)
  })

