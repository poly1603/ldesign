/* Simple docs link checker: scans built HTML and ensures internal links exist. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.resolve(__dirname, '..', 'docs', '.vitepress', 'dist')

function listHtmlFiles(dir) {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const stat = fs.statSync(p)
    if (stat.isDirectory()) out.push(...listHtmlFiles(p))
    else if (name.endsWith('.html')) out.push(p)
  }
  return out
}

function extractLinks(html) {
  const links = []
  const hrefRe = /href\s*=\s*"([^"]+)"/gi
  let m
  while ((m = hrefRe.exec(html))) links.push(m[1])
  return links
}

function isInternal(link) {
  if (!link) return false
  if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:') || link.startsWith('#')) return false
  return true
}

function normalize(link) {
  // remove hash
  const [p] = link.split('#')
  return p
}

function check() {
  if (!fs.existsSync(distDir)) {
    console.error(`[docs-check-links] dist not found: ${distDir}`)
    process.exit(1)
  }

  const files = listHtmlFiles(distDir)
  const missing = []

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf-8')
    const links = extractLinks(html)
    for (const l of links) {
      if (!isInternal(l)) continue
      const p = normalize(l)
      // map to file
      let target
      let abs = p
      // Strip VitePress base (e.g., "/cache/") from absolute URLs
      if (abs === '/cache' || abs === '/cache/') abs = '/'
      else if (abs.startsWith('/cache/')) abs = `/${abs.slice('/cache/'.length)}`

      if (abs.startsWith('/')) target = path.join(distDir, abs.slice(1))
      else target = path.join(path.dirname(file), abs)

      // handle pretty URLs
      const candidates = [target]
      if (target.endsWith('/')) candidates.push(path.join(target, 'index.html'))
      else if (!target.endsWith('.html')) candidates.push(`${target}.html`, path.join(target, 'index.html'))

      const exists = candidates.some(c => fs.existsSync(c))
      if (!exists) missing.push({ from: path.relative(distDir, file), to: p })
    }
  }

  if (missing.length) {
    console.error('[docs-check-links] Broken links found:')
    for (const m of missing) console.error(`- ${m.from} -> ${m.to}`)
    process.exit(1)
  }

  console.log('[docs-check-links] All links OK')
}

check()
