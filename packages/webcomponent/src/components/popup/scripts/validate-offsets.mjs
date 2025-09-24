/*
Automated offset-distance validation for ldesign-popup
- Opens the demo-popup.html via file://
- Forces each popup to show and measures the visible gap between the trigger and the arrow tip (or popup edge when arrow=false)
- Prints a compact table of results
*/
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from 'node:fs'
import puppeteer from 'puppeteer'

const root = 'D:/WorkBench/ldesign/packages/webcomponent/src/components/popup'
const demoPath = path.join(root, 'demo-popup.html')
if (!fs.existsSync(demoPath)) {
  console.error('Demo file not found:', demoPath)
  process.exit(1)
}
const fileUrl = pathToFileURL(demoPath).toString()

function fmt(n) { return typeof n === 'number' ? `${n.toFixed(1)}px` : String(n) }

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--allow-file-access-from-files','--no-sandbox','--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page.goto(fileUrl)

  // Wait for all custom elements to be defined
  await page.waitForFunction(() => customElements.get('ldesign-popup'))

  // Query all demo popups in the first demo panel which lists all 12 placements
  const results = await page.evaluate(async () => {
    const panels = Array.from(document.querySelectorAll('.panel'))
    const firstPanel = panels[0]
    const pops = Array.from(firstPanel.querySelectorAll('ldesign-popup'))

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
  for (const r of results) {
    byPlacement[r.placement] = r
  }

  const order = ['top-start','top','top-end','right-start','right','right-end','bottom-start','bottom','bottom-end','left-start','left','left-end']
  console.log('\nOffset-distance measurement (arrow=true default, expected ~8px):')
  for (const k of order) {
    const r = byPlacement[k]
    if (!r) continue
    console.log(`- ${k.padEnd(12)} => gap = ${fmt(r.gap)} (resolved: ${r.resolved})`)
  }

  await browser.close()
})().catch(err => { console.error(err); process.exit(1) })
