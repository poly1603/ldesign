/**
 * 分析命令实现
 */

import { Command } from 'commander'
import path from 'path'
import fs from 'fs-extra'
import { existsSync } from 'fs'
import { logger } from '../../utils/logger'
import { formatFileSize } from '../../utils/format-utils'

interface AnalyzeOptions {
  report?: string
  output?: string
  format?: 'md' | 'html'
  open?: boolean
  compare?: string
}

export const analyzeCommand = new Command('analyze')
  .description('分析构建结果（读取 build-report.json 并输出 Markdown/HTML 报告）')
  .option('-r, --report <file>', '指定输入的构建报告 JSON，默认 dist/build-report.json')
  .option('-o, --output <file>', '指定输出文件，默认与输入同目录下的 build-report.md 或 .html')
  .option('-f, --format <format>', '输出格式：md|html（默认 md）', 'md')
  .option('--compare <file>', '与另一份报告比较，生成差异分析（当前 - 基线）')
  .option('--open', '输出 HTML 后自动在系统默认浏览器中打开')
  .action(async (options: AnalyzeOptions) => {
    try {
      const reportPath = resolveReportPath(options.report)
      const report = await loadReport(reportPath)

      if (options.compare) {
        const baselinePath = path.resolve(process.cwd(), options.compare)
        const baseline = await loadReport(baselinePath)
        if (options.format === 'html') {
          const html = renderHTMLDiff(report, baseline, { currentLabel: path.basename(reportPath), baselineLabel: path.basename(baselinePath) })
          const outPath = options.output && options.output.trim()
            ? path.resolve(process.cwd(), options.output)
            : path.join(path.dirname(reportPath), 'build-report-diff.html')
          await fs.mkdir(path.dirname(outPath), { recursive: true })
          await fs.writeFile(outPath, html, 'utf8')
          logger.success(`差异 HTML 报告已输出: ${outPath}`)
          if (options.open) await openInBrowser(outPath)
        } else {
          const md = renderMarkdownDiff(report, baseline, { currentLabel: path.basename(reportPath), baselineLabel: path.basename(baselinePath) })
          const outPath = options.output && options.output.trim()
            ? path.resolve(process.cwd(), options.output)
            : path.join(path.dirname(reportPath), 'build-report-diff.md')
          await fs.mkdir(path.dirname(outPath), { recursive: true })
          await fs.writeFile(outPath, md, 'utf8')
          logger.success(`差异 Markdown 报告已输出: ${outPath}`)
        }
        return
      }

      if (options.format === 'html') {
        const html = renderHTML(report)
        const outPath = resolveOutputPath(reportPath, options.output, 'html')
        await fs.mkdir(path.dirname(outPath), { recursive: true })
        await fs.writeFile(outPath, html, 'utf8')

        logger.success(`分析 HTML 报告已输出: ${outPath}`)
        if (options.open) await openInBrowser(outPath)
      } else {
        const md = renderMarkdown(report)
        const outPath = resolveOutputPath(reportPath, options.output, 'md')
        await fs.mkdir(path.dirname(outPath), { recursive: true })
        await fs.writeFile(outPath, md, 'utf8')
        logger.success(`分析 Markdown 报告已输出: ${outPath}`)
      }
    } catch (err) {
      logger.error('分析失败:', err)
      process.exit(1)
    }
  })

function resolveReportPath(input?: string): string {
  if (input && input.trim()) return path.resolve(process.cwd(), input)
  const fallback = path.resolve(process.cwd(), 'dist', 'build-report.json')
  if (existsSync(fallback)) return fallback
  throw new Error('未指定 --report 且未找到 dist/build-report.json，请先执行 `build --report`')
}

async function loadReport(file: string): Promise<any> {
  const text = await fs.readFile(file, 'utf8')
  return JSON.parse(text)
}

function formatMs(ms: any): string {
  const n = typeof ms === 'number' ? ms : Number(ms)
  if (!isFinite(n) || n < 0) return '-'
  const parts: string[] = []
  const d = Math.floor(n / 86400000)
  const h = Math.floor((n % 86400000) / 3600000)
  const m = Math.floor((n % 3600000) / 60000)
  const s = Math.floor((n % 60000) / 1000)
  const r = Math.floor(n % 1000)
  if (d) parts.push(`${d}d`)
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  if (s) parts.push(`${s}s`)
  if (!parts.length) parts.push(`${r}ms`)
  return parts.join(' ')
}


function renderMarkdown(report: any): string {
  const { meta = {}, totals = {}, files = [] } = report || {}
  const lines: string[] = []
  lines.push(`# 构建分析报告`)
  lines.push('')
  lines.push(`- 打包器: ${meta.bundler || '-'}  `)
  lines.push(`- 模式: ${meta.mode || '-'}  `)
  if (meta.duration) lines.push(`- 耗时: ${formatMs(meta.duration)}  `)
  lines.push(`- 时间: ${new Date(meta.timestamp || Date.now()).toLocaleString()}  `)
  if (meta.cache) {
    lines.push('')
    lines.push('## 缓存')
    lines.push('')
    lines.push(`- 启用: ${meta.cache.enabled ? '是' : '否'}  `)
    if (typeof meta.cache.hit === 'boolean') lines.push(`- 命中: ${meta.cache.hit ? '是' : '否'}  `)
    if (typeof meta.cache.lookupMs === 'number') lines.push(`- 查询耗时: ${formatMs(meta.cache.lookupMs)}  `)
    if (typeof meta.cache.savedMs === 'number') lines.push(`- 预计节省: ${formatMs(meta.cache.savedMs)}  `)
    if (meta.cache.dir) lines.push(`- 目录: ${meta.cache.dir}  `)
    if (typeof meta.cache.ttl === 'number') lines.push(`- TTL: ${formatMs(meta.cache.ttl)}  `)
    if (typeof meta.cache.maxSize === 'number') lines.push(`- 最大体积: ${formatFileSize(meta.cache.maxSize)}  `)
  }
  lines.push('')

  lines.push(`## 总览`)
  lines.push('')
  lines.push(`- 文件数: ${totals.fileCount ?? files.length}`)
  if (typeof totals.raw === 'number') lines.push(`- 原始大小: ${formatFileSize(totals.raw)}`)
  if (typeof totals.gzip === 'number') lines.push(`- Gzip: ${formatFileSize(totals.gzip)}`)
  lines.push('')

  // Top 10 by gzip/raw
  const sorted = [...files].sort((a, b) => (b.gzipSize || b.size || 0) - (a.gzipSize || a.size || 0))
  const top = sorted.slice(0, 10)
  if (top.length) {
    lines.push('## Top 文件 (按 gzip 优先)')
    lines.push('')
    for (const f of top) {
      lines.push(`- ${f.fileName}${f.format ? ` (${f.format})` : ''}: ${formatFileSize(f.gzipSize || f.size)} `)
    }
    lines.push('')
  }

  // Files table
  lines.push('## 所有产物')
  lines.push('')
  lines.push('| 文件 | 格式 | 原始 | gzip | 类型 |')
  lines.push('| --- | --- | ---: | ---: | --- |')
  for (const f of files) {
    lines.push(`| ${f.fileName} | ${f.format || ''} | ${formatFileSize(f.size || 0)} | ${f.gzipSize ? formatFileSize(f.gzipSize) : '-'} | ${f.type || ''} |`)
  }

  return lines.join('\n')
}

function renderHTML(report: any): string {
  const { meta = {}, totals = {}, files = [] } = report || {}
  const rows = files.map((f: any) => `
    <tr>
      <td>${escapeHtml(f.fileName)}</td>
      <td>${escapeHtml(f.format || '')}</td>
      <td style="text-align:right">${escapeHtml(formatFileSize(f.size || 0))}</td>
      <td style="text-align:right">${f.gzipSize ? escapeHtml(formatFileSize(f.gzipSize)) : '-'}</td>
      <td>${escapeHtml(f.type || '')}</td>
    </tr>`).join('\n')

  const top = [...files].sort((a, b) => (b.gzipSize || b.size || 0) - (a.gzipSize || a.size || 0)).slice(0, 10)
  const topLis = top.map((f: any) => `<li>${escapeHtml(f.fileName)}${f.format ? ` (${escapeHtml(f.format)})` : ''}: ${escapeHtml(formatFileSize(f.gzipSize || f.size))}</li>`).join('\n')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>构建分析报告</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,Apple Color Emoji,Segoe UI Emoji; padding:24px;}
    h1,h2{margin:0 0 12px}
    table{border-collapse:collapse;width:100%;margin:12px 0}
    th,td{border:1px solid #ddd;padding:8px}
    th{background:#fafafa;text-align:left}
    code{background:#f5f5f5;padding:2px 4px;border-radius:4px}
    .kv{display:grid;grid-template-columns:120px 1fr;gap:6px 12px;max-width:760px}
    .muted{color:#666}
    .bars{max-width:960px}
    .bar-row{display:flex;align-items:center;gap:10px;margin:6px 0}
    .bar-label{flex:0 0 320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .bar{flex:1;background:#f1f3f5;height:10px;border-radius:5px;position:relative}
    .bar-inner{height:100%;background:#4F46E5;border-radius:5px}
    .bar-val{flex:0 0 110px;text-align:right;color:#555;font-variant-numeric:tabular-nums}
    .diff-bars{max-width:960px;margin:16px 0}
    .diff-bar-row{display:flex;align-items:center;gap:10px;margin:8px 0}
    .diff-bar-label{flex:0 0 280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px}
    .diff-bar{flex:1;height:12px;position:relative;background:#f8f9fa;border-radius:6px}
    .diff-bar-positive{background:#10b981;border-radius:6px;height:100%}
    .diff-bar-negative{background:#ef4444;border-radius:6px;height:100%}
    .diff-bar-val{flex:0 0 120px;text-align:right;color:#555;font-variant-numeric:tabular-nums;font-size:14px}
    .summary-bars{max-width:600px;margin:16px 0}
    .summary-bar-row{display:flex;align-items:center;gap:12px;margin:10px 0}
    .summary-bar-label{flex:0 0 140px;font-weight:500}
    .summary-bar{flex:1;height:16px;position:relative;background:#f1f3f5;border-radius:8px}
    .summary-bar-inner{height:100%;border-radius:8px}
  </style>
</head>
<body>
  <h1>构建分析报告</h1>
  <p>
    <strong>打包器:</strong> <code>${escapeHtml(meta.bundler || '-')}</code>
    &nbsp;&nbsp;<strong>模式:</strong> <code>${escapeHtml(meta.mode || '-')}</code>
    &nbsp;&nbsp;<strong>耗时:</strong> <code>${escapeHtml(formatMs(meta.duration))}</code>
    &nbsp;&nbsp;<strong>时间:</strong> <code>${new Date(meta.timestamp || Date.now()).toLocaleString()}</code>
  </p>

  ${meta.cache ? `
  <h2>缓存</h2>
  <div class="kv">
    <div class="muted">启用</div><div>${meta.cache.enabled ? '是' : '否'}</div>
    ${typeof meta.cache.hit === 'boolean' ? `<div class="muted">命中</div><div>${meta.cache.hit ? '是' : '否'}</div>` : ''}
    ${typeof meta.cache.lookupMs === 'number' ? `<div class="muted">查询耗时</div><div>${escapeHtml(formatMs(meta.cache.lookupMs))}</div>` : ''}
    ${typeof meta.cache.savedMs === 'number' ? `<div class="muted">预估节省</div><div>${escapeHtml(formatMs(meta.cache.savedMs))}</div>` : ''}
    ${meta.cache.dir ? `<div class="muted">目录</div><div><code>${escapeHtml(meta.cache.dir)}</code></div>` : ''}
    ${typeof meta.cache.ttl === 'number' ? `<div class="muted">TTL</div><div>${escapeHtml(formatMs(meta.cache.ttl))}</div>` : ''}
    ${typeof meta.cache.maxSize === 'number' ? `<div class="muted">最大体积</div><div>${escapeHtml(formatFileSize(meta.cache.maxSize))}</div>` : ''}
  </div>
  ` : ''}

  <h2>总览</h2>
  <ul>
    <li>文件数: ${totals.fileCount ?? files.length}</li>
    ${typeof totals.raw === 'number' ? `<li>原始大小: ${escapeHtml(formatFileSize(totals.raw))}</li>` : ''}
    ${typeof totals.gzip === 'number' ? `<li>Gzip: ${escapeHtml(formatFileSize(totals.gzip))}</li>` : ''}
  </ul>

  ${top.length ? `<h2>Top 文件 (按 gzip 优先)</h2><ul>${topLis}</ul>` : ''}
  ${(() => { if (!top.length) return ''; const max = Math.max(...top.map(f => (f.gzipSize || f.size || 0)), 1); const bars = top.map(f => { const v = (f.gzipSize || f.size || 0); const pct = Math.max(0, Math.min(100, (v / max) * 100)); return `<div class=\"bar-row\"><div class=\"bar-label\" title=\"${escapeHtml(f.fileName)}\">${escapeHtml(f.fileName)}</div><div class=\"bar\"><div class=\"bar-inner\" style=\"width:${pct.toFixed(1)}%\"></div></div><div class=\"bar-val\">${escapeHtml(formatFileSize(v))}</div></div>` }).join('\n'); return `<h2>Top 大小可视化</h2><div class=\"bars\">${bars}</div>` })()}

  <h2>所有产物</h2>
  <table>
    <thead>
      <tr><th>文件</th><th>格式</th><th style=\"text-align:right\">原始</th><th style=\"text-align:right\">gzip</th><th>类型</th></tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`
}


// -------- Diff helpers --------
interface DiffOptions { currentLabel?: string; baselineLabel?: string }

function computeDiff(current: any, baseline: any) {
  const cFiles: any[] = current?.files || []
  const bFiles: any[] = baseline?.files || []
  const cMap = new Map<string, any>(cFiles.map((f: any) => [f.fileName, f]))
  const bMap = new Map<string, any>(bFiles.map((f: any) => [f.fileName, f]))

  const common: Array<{ fileName: string; format?: string; rawDelta: number; gzipDelta: number; curr?: any; base?: any }> = []
  const added: any[] = []
  const removed: any[] = []

  // common & added
  for (const [name, cf] of cMap.entries()) {
    const bf = bMap.get(name)
    if (bf) {
      common.push({
        fileName: name,
        format: cf.format || bf.format,
        rawDelta: (cf.size || 0) - (bf.size || 0),
        gzipDelta: (cf.gzipSize || 0) - (bf.gzipSize || 0),
        curr: cf,
        base: bf,
      })
    } else {
      added.push(cf)
    }
  }
  // removed
  for (const [name, bf] of bMap.entries()) {
    if (!cMap.has(name)) removed.push(bf)
  }

  const totals = {
    rawDelta: (current?.totals?.raw || sum(cFiles, 'size')) - (baseline?.totals?.raw || sum(bFiles, 'size')),
    gzipDelta: (current?.totals?.gzip || sum(cFiles, 'gzipSize')) - (baseline?.totals?.gzip || sum(bFiles, 'gzipSize')),
    fileCountDelta: (current?.totals?.fileCount ?? cFiles.length) - (baseline?.totals?.fileCount ?? bFiles.length),
  }

  // sort common by abs gzipDelta desc
  common.sort((a, b) => Math.abs((b.gzipDelta || 0)) - Math.abs((a.gzipDelta || 0)))

  return { common, added, removed, totals }
}

function sum(arr: any[], key: string): number { return arr.reduce((n, x) => n + (x?.[key] || 0), 0) }

function renderMarkdownDiff(current: any, baseline: any, opts: DiffOptions = {}): string {
  const { common, added, removed, totals } = computeDiff(current, baseline)
  const lines: string[] = []
  lines.push(`# 构建差异报告`)
  lines.push('')
  lines.push(`- 当前: ${opts.currentLabel || 'current'}  `)
  lines.push(`- 基线: ${opts.baselineLabel || 'baseline'}  `)
  lines.push('')

  lines.push(`## 总览差异`)
  lines.push('')
  lines.push(`- 文件数变化: ${totals.fileCountDelta >= 0 ? '+' : ''}${totals.fileCountDelta}`)
  lines.push(`- 原始大小变化: ${formatSignedSize(totals.rawDelta)}`)
  lines.push(`- Gzip 大小变化: ${formatSignedSize(totals.gzipDelta)}`)
  lines.push('')

  const cCache = current?.meta?.cache
  const bCache = baseline?.meta?.cache
  if (cCache || bCache) {
    lines.push('## 缓存差异')
    lines.push('')
    if (cCache && bCache) {
      lines.push(`- 启用: 当前 ${cCache.enabled ? '是' : '否'}，基线 ${bCache.enabled ? '是' : '否'}  `)
      if (typeof cCache.hit === 'boolean' || typeof bCache.hit === 'boolean') {
        lines.push(`- 命中: 当前 ${cCache?.hit ? '是' : '否'}，基线 ${bCache?.hit ? '是' : '否'}  `)
      }
      if (typeof cCache.lookupMs === 'number' || typeof bCache.lookupMs === 'number') {
        const delta = (cCache?.lookupMs || 0) - (bCache?.lookupMs || 0)
        lines.push(`- 查询耗时: 当前 ${formatMs(cCache?.lookupMs)}（Δ${formatSignedMs(delta)}，基线 ${formatMs(bCache?.lookupMs)}）  `)
      }
      if (typeof cCache.savedMs === 'number' || typeof bCache.savedMs === 'number') {
        const delta = (cCache?.savedMs || 0) - (bCache?.savedMs || 0)
        lines.push(`- 预计节省: 当前 ${formatMs(cCache?.savedMs)}（Δ${formatSignedMs(delta)}，基线 ${formatMs(bCache?.savedMs)}）  `)
      }
      if (typeof cCache.ttl === 'number' || typeof bCache.ttl === 'number') {
        lines.push(`- TTL: 当前 ${formatMs(cCache?.ttl)}，基线 ${formatMs(bCache?.ttl)}  `)
      }
      if (typeof cCache.maxSize === 'number' || typeof bCache.maxSize === 'number') {
        lines.push(`- 最大体积: 当前 ${formatFileSize(cCache?.maxSize || 0)}，基线 ${formatFileSize(bCache?.maxSize || 0)}  `)
      }
      if (cCache?.dir || bCache?.dir) {
        lines.push(`- 目录: 当前 ${cCache?.dir || '-'}，基线 ${bCache?.dir || '-'}  `)
      }
    } else {
      const cc = cCache || {}
      const bc = bCache || {}
      lines.push(`- 启用: 当前 ${cc.enabled ? '是' : '否'}，基线 ${bc.enabled ? '是' : '否'}  `)
      if (typeof cc.hit === 'boolean' || typeof bc.hit === 'boolean') {
        lines.push(`- 命中: 当前 ${cc?.hit ? '是' : '否'}，基线 ${bc?.hit ? '是' : '否'}  `)
      }
      if (typeof cc.lookupMs === 'number' || typeof bc.lookupMs === 'number') {
        lines.push(`- 查询耗时: 当前 ${formatMs(cc?.lookupMs)}，基线 ${formatMs(bc?.lookupMs)}  `)
      }
      if (typeof cc.savedMs === 'number' || typeof bc.savedMs === 'number') {
        lines.push(`- 预计节省: 当前 ${formatMs(cc?.savedMs)}，基线 ${formatMs(bc?.savedMs)}  `)
      }
      if (typeof cc.ttl === 'number' || typeof bc.ttl === 'number') {
        lines.push(`- TTL: 当前 ${formatMs(cc?.ttl)}，基线 ${formatMs(bc?.ttl)}  `)
      }
      if (typeof cc.maxSize === 'number' || typeof bc.maxSize === 'number') {
        lines.push(`- 最大体积: 当前 ${formatFileSize(cc?.maxSize || 0)}，基线 ${formatFileSize(bc?.maxSize || 0)}  `)
      }
      if (cc?.dir || bc?.dir) {
        lines.push(`- 目录: 当前 ${cc?.dir || '-'}，基线 ${bc?.dir || '-'}  `)
      }
    }
    lines.push('')
  }

  if (common.length) {
    lines.push('## 共同文件变化（按 |Δgzip| 降序）')
    lines.push('')
    lines.push('| 文件 | 格式 | 原始Δ | gzipΔ | 当前gzip | 基线gzip |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: |')
    for (const x of common.slice(0, 50)) {
      lines.push(`| ${x.fileName} | ${x.format || ''} | ${formatSignedSize(x.rawDelta)} | ${formatSignedSize(x.gzipDelta)} | ${fmtSize(x.curr?.gzipSize)} | ${fmtSize(x.base?.gzipSize)} |`)
    }
    lines.push('')
  }

  if (added.length) {
    lines.push('## 新增文件')
    for (const f of added) {
      lines.push(`- ${f.fileName}${f.format ? ` (${f.format})` : ''}: ${fmtSize(f.gzipSize || f.size)}`)
    }
    lines.push('')
  }

  if (removed.length) {
    lines.push('## 移除文件')
    for (const f of removed) {
      lines.push(`- ${f.fileName}${f.format ? ` (${f.format})` : ''}: ${fmtSize(f.gzipSize || f.size)}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function renderHTMLDiff(current: any, baseline: any, opts: DiffOptions = {}): string {
  const { common, added, removed, totals } = computeDiff(current, baseline)
  const commonRows = common.slice(0, 100).map(x => `
    <tr>
      <td>${escapeHtml(x.fileName)}</td>
      <td>${escapeHtml(x.format || '')}</td>

      <td style="text-align:right">${escapeHtml(formatSignedSize(x.rawDelta))}</td>
      <td style="text-align:right">${escapeHtml(formatSignedSize(x.gzipDelta))}</td>
      <td style="text-align:right">${escapeHtml(fmtSize(x.curr?.gzipSize))}</td>
      <td style="text-align:right">${escapeHtml(fmtSize(x.base?.gzipSize))}</td>
    </tr>`).join('\n')

  const addedLis = added.map((f: any) => `<li>${escapeHtml(f.fileName)}${f.format ? ` (${escapeHtml(f.format)})` : ''}: ${escapeHtml(fmtSize(f.gzipSize || f.size))}</li>`).join('\n')
  const removedLis = removed.map((f: any) => `<li>${escapeHtml(f.fileName)}${f.format ? ` (${escapeHtml(f.format)})` : ''}: ${escapeHtml(fmtSize(f.gzipSize || f.size))}</li>`).join('\n')
  const cCache = current?.meta?.cache
  const bCache = baseline?.meta?.cache
  const cacheBlock = (cCache || bCache) ? `
  <h2>缓存差异</h2>
  <div class="kv">
    <div class="muted">启用</div><div>当前 ${cCache?.enabled ? '是' : '否'}，基线 ${bCache?.enabled ? '是' : '否'}</div>
    ${typeof (cCache?.hit) === 'boolean' || typeof (bCache?.hit) === 'boolean' ? `<div class="muted">命中</div><div>当前 ${cCache?.hit ? '是' : '否'}，基线 ${bCache?.hit ? '是' : '否'}</div>` : ''}
    ${typeof (cCache?.lookupMs) === 'number' || typeof (bCache?.lookupMs) === 'number' ? `<div class="muted">查询耗时</div><div>当前 ${escapeHtml(formatMs(cCache?.lookupMs))}（Δ${escapeHtml(formatSignedMs((cCache?.lookupMs || 0) - (bCache?.lookupMs || 0)))}，基线 ${escapeHtml(formatMs(bCache?.lookupMs))}）</div>` : ''}
    ${typeof (cCache?.savedMs) === 'number' || typeof (bCache?.savedMs) === 'number' ? `<div class="muted">预估节省</div><div>当前 ${escapeHtml(formatMs(cCache?.savedMs))}（Δ${escapeHtml(formatSignedMs((cCache?.savedMs || 0) - (bCache?.savedMs || 0)))}，基线 ${escapeHtml(formatMs(bCache?.savedMs))}）</div>` : ''}
    ${typeof (cCache?.ttl) === 'number' || typeof (bCache?.ttl) === 'number' ? `<div class="muted">TTL</div><div>当前 ${escapeHtml(formatMs(cCache?.ttl))}，基线 ${escapeHtml(formatMs(bCache?.ttl))}</div>` : ''}
    ${typeof (cCache?.maxSize) === 'number' || typeof (bCache?.maxSize) === 'number' ? `<div class="muted">最大体积</div><div>当前 ${escapeHtml(formatFileSize(cCache?.maxSize || 0))}，基线 ${escapeHtml(formatFileSize(bCache?.maxSize || 0))}</div>` : ''}
    ${(cCache?.dir || bCache?.dir) ? `<div class="muted">目录</div><div>当前 ${escapeHtml(cCache?.dir || '-')}，基线 ${escapeHtml(bCache?.dir || '-')}</div>` : ''}
  </div>` : ''


  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>构建差异报告</title>
  <style>

    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,Apple Color Emoji,Segoe UI Emoji; padding:24px;}
    h1,h2{margin:0 0 12px}
    table{border-collapse:collapse;width:100%;margin:12px 0}
    th,td{border:1px solid #ddd;padding:8px}
    th{background:#fafafa;text-align:left}
    code{background:#f5f5f5;padding:2px 4px;border-radius:4px}
    .kv{display:grid;grid-template-columns:160px 1fr;gap:6px 12px;max-width:920px}
    .muted{color:#666}
    .diff-bars{max-width:960px;margin:16px 0}
    .diff-bar-row{display:flex;align-items:center;gap:10px;margin:8px 0}
    .diff-bar-label{flex:0 0 280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px}
    .diff-bar{flex:1;height:12px;position:relative;background:#f8f9fa;border-radius:6px}
    .diff-bar-positive{background:#10b981;border-radius:6px;height:100%}
    .diff-bar-negative{background:#ef4444;border-radius:6px;height:100%}
    .diff-bar-val{flex:0 0 120px;text-align:right;color:#555;font-variant-numeric:tabular-nums;font-size:14px}
    .summary-bars{max-width:600px;margin:16px 0}
    .summary-bar-row{display:flex;align-items:center;gap:12px;margin:10px 0}
    .summary-bar-label{flex:0 0 140px;font-weight:500}
    .summary-bar{flex:1;height:16px;position:relative;background:#f1f3f5;border-radius:8px}
    .summary-bar-inner{height:100%;border-radius:8px}
  </style>
</head>
<body>
  <h1>构建差异报告</h1>
  <p>
    <strong>当前:</strong> <code>${escapeHtml(opts.currentLabel || 'current')}</code>
    &nbsp;&nbsp;<strong>基线:</strong> <code>${escapeHtml(opts.baselineLabel || 'baseline')}</code>
  </p>


  ${cacheBlock}

  <h2>总览差异</h2>

  <ul>
    <li>文件数变化: ${totals.fileCountDelta >= 0 ? '+' : ''}${totals.fileCountDelta}</li>
    <li>原始大小变化: ${escapeHtml(formatSignedSize(totals.rawDelta))}</li>
    <li>Gzip 大小变化: ${escapeHtml(formatSignedSize(totals.gzipDelta))}</li>
  </ul>

  ${(() => {
    const maxDelta = Math.max(Math.abs(totals.rawDelta), Math.abs(totals.gzipDelta), 1)
    const rawPct = Math.min(100, (Math.abs(totals.rawDelta) / maxDelta) * 100)
    const gzipPct = Math.min(100, (Math.abs(totals.gzipDelta) / maxDelta) * 100)
    const rawColor = totals.rawDelta >= 0 ? '#10b981' : '#ef4444'
    const gzipColor = totals.gzipDelta >= 0 ? '#10b981' : '#ef4444'
    return `<h3>大小变化可视化</h3>
    <div class="summary-bars">
      <div class="summary-bar-row">
        <div class="summary-bar-label">原始大小</div>
        <div class="summary-bar">
          <div class="summary-bar-inner" style="width:${rawPct.toFixed(1)}%;background:${rawColor}"></div>
        </div>
        <div class="diff-bar-val">${escapeHtml(formatSignedSize(totals.rawDelta))}</div>
      </div>
      <div class="summary-bar-row">
        <div class="summary-bar-label">Gzip 大小</div>
        <div class="summary-bar">
          <div class="summary-bar-inner" style="width:${gzipPct.toFixed(1)}%;background:${gzipColor}"></div>
        </div>
        <div class="diff-bar-val">${escapeHtml(formatSignedSize(totals.gzipDelta))}</div>
      </div>
    </div>`
  })()}

  ${common.length ? `<h2>共同文件变化（按 |Δgzip| 降序）</h2>
  <table>
    <thead>
      <tr><th>文件</th><th>格式</th><th style="text-align:right">原始Δ</th><th style="text-align:right">gzipΔ</th><th style="text-align:right">当前gzip</th><th style="text-align:right">基线gzip</th></tr>
    </thead>
    <tbody>
      ${commonRows}
    </tbody>
  </table>
  ${(() => {
    const topChanges = common.slice(0, 10)
    if (!topChanges.length) return ''
    const maxDelta = Math.max(...topChanges.map(f => Math.abs(f.gzipDelta || 0)), 1)
    const bars = topChanges.map(f => {
      const delta = f.gzipDelta || 0
      const pct = Math.min(100, (Math.abs(delta) / maxDelta) * 100)
      // const color = delta >= 0 ? '#10b981' : '#ef4444' // 暂时不需要
      return `<div class="diff-bar-row">
        <div class="diff-bar-label" title="${escapeHtml(f.fileName)}">${escapeHtml(f.fileName)}</div>
        <div class="diff-bar">
          <div class="${delta >= 0 ? 'diff-bar-positive' : 'diff-bar-negative'}" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="diff-bar-val">${escapeHtml(formatSignedSize(delta))}</div>
      </div>`
    }).join('\n')
    return `<h3>Top 变化可视化</h3><div class="diff-bars">${bars}</div>`
  })()}` : ''}

  ${added.length ? `<h2>新增文件</h2><ul>${addedLis}</ul>
  ${(() => {
    const sortedAdded = [...added].sort((a, b) => (b.gzipSize || b.size || 0) - (a.gzipSize || a.size || 0)).slice(0, 10)
    if (!sortedAdded.length) return ''
    const maxSize = Math.max(...sortedAdded.map(f => (f.gzipSize || f.size || 0)), 1)
    const bars = sortedAdded.map(f => {
      const size = f.gzipSize || f.size || 0
      const pct = Math.min(100, (size / maxSize) * 100)
      return `<div class="diff-bar-row">
        <div class="diff-bar-label" title="${escapeHtml(f.fileName)}">${escapeHtml(f.fileName)}</div>
        <div class="diff-bar">
          <div class="diff-bar-positive" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="diff-bar-val">${escapeHtml(formatFileSize(size))}</div>
      </div>`
    }).join('\n')
    return `<h3>新增文件大小可视化</h3><div class="diff-bars">${bars}</div>`
  })()}` : ''}
  ${removed.length ? `<h2>移除文件</h2><ul>${removedLis}</ul>
  ${(() => {
    const sortedRemoved = [...removed].sort((a, b) => (b.gzipSize || b.size || 0) - (a.gzipSize || a.size || 0)).slice(0, 10)
    if (!sortedRemoved.length) return ''
    const maxSize = Math.max(...sortedRemoved.map(f => (f.gzipSize || f.size || 0)), 1)
    const bars = sortedRemoved.map(f => {
      const size = f.gzipSize || f.size || 0
      const pct = Math.min(100, (size / maxSize) * 100)
      return `<div class="diff-bar-row">
        <div class="diff-bar-label" title="${escapeHtml(f.fileName)}">${escapeHtml(f.fileName)}</div>
        <div class="diff-bar">
          <div class="diff-bar-negative" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="diff-bar-val">${escapeHtml(formatFileSize(size))}</div>
      </div>`
    }).join('\n')
    return `<h3>移除文件大小可视化</h3><div class="diff-bars">${bars}</div>`
  })()}` : ''}
</body>
</html>`
}

function fmtSize(n?: number): string { return typeof n === 'number' && n >= 0 ? formatFileSize(n) : '-' }
function formatSignedSize(delta: number): string {
  const sign = delta > 0 ? '+' : ''
  return `${sign}${formatFileSize(Math.abs(delta))}`
}

function formatSignedMs(delta: number): string {
  const sign = delta > 0 ? '+' : ''
  return `${sign}${formatMs(Math.abs(delta))}`
}

function escapeHtml(s: any): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function resolveOutputPath(reportPath: string, output: string | undefined, ext: 'md' | 'html'): string {
  if (output && output.trim()) return path.resolve(process.cwd(), output)
  const dir = path.dirname(reportPath)
  return path.join(dir, `build-report.${ext}`)
}

async function openInBrowser(filePath: string): Promise<void> {
  const { exec } = await import('child_process')
  const abs = path.resolve(filePath)
  const cmd = process.platform === 'win32' ? `start "" "${abs}"`
    : process.platform === 'darwin' ? `open "${abs}"`
    : `xdg-open "${abs}"`
  await new Promise<void>((resolve, reject) => {
    exec(cmd, (err) => err ? reject(err) : resolve())
  })
}
