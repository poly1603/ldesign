/*
Validate offset gaps on the VitePress docs page for Popup component
Assumes docs dev server is running (npm run docs:dev) and available on localhost
*/
import puppeteer from 'puppeteer'

const base = process.env.DOCS_URL || 'http://localhost:5175/ldesign-webcomponent'
const url = `${base}/components/popup.html`

function fmt(n){return typeof n==='number'?`${n.toFixed(1)}px`:String(n)}

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2' })

  await page.waitForFunction(() => customElements.get('ldesign-popup'))

  // In docs, 12-direction grid lives inside a .placement-sandbox
  const results = await page.evaluate(async () => {
    const sandbox = document.querySelector('.placement-sandbox')
    const pops = sandbox ? Array.from(sandbox.querySelectorAll('ldesign-popup')) : []
    const rows = []

    for (const p of pops) {
      p.visible = true
      await new Promise(r => requestAnimationFrame(() => r()))
      await new Promise(r => setTimeout(r, 30))

      const trigger = p.querySelector('.ldesign-popup__trigger') || p
      const content = p.querySelector('.ldesign-popup__content')
      const arrowEl = content ? content.querySelector('.ldesign-popup__arrow') : null
      const placement = content ? content.getAttribute('data-placement') || p.getAttribute('placement') || '' : (p.getAttribute('placement') || '')

      const tr = trigger.getBoundingClientRect()
      const co = content?.getBoundingClientRect()
      const ar = arrowEl?.getBoundingClientRect()

      let gap = null
      const base = (placement || '').split('-')[0]
      if (ar && ['top','bottom','left','right'].includes(base)) {
        if (base === 'top') gap = tr.top - ar.bottom
        if (base === 'bottom') gap = ar.top - tr.bottom
        if (base === 'left') gap = tr.left - ar.right
        if (base === 'right') gap = ar.left - tr.right
      } else if (co && ['top','bottom','left','right'].includes(base)) {
        if (base === 'top') gap = tr.top - co.bottom
        if (base === 'bottom') gap = co.top - tr.bottom
        if (base === 'left') gap = tr.left - co.right
        if (base === 'right') gap = co.left - tr.right
      }

      rows.push({ placement: p.getAttribute('placement'), resolved: placement, gap })
      p.visible = false
    }

    return rows
  })

  const byPlacement = {}
  for (const r of results) byPlacement[r.placement] = r

  const order = ['top-start','top','top-end','left-start','left','left-end','right-start','right','right-end','bottom-start','bottom','bottom-end']
  console.log(`\nDocs page: ${url}`)
  for (const k of order) {
    const r = byPlacement[k]
    if (!r) continue
    console.log(`- ${k.padEnd(12)} => gap = ${fmt(r.gap)} (resolved: ${r.resolved})`)
  }

  await browser.close()
})().catch(err => { console.error('validate-offsets-docs error:', err); process.exit(1) })
