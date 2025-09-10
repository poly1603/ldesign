import './style.css'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/index.css'
import '@logicflow/extension/lib/style/index.css'
// 注意：@logicflow/extension 的部分插件（如 Menu/ContextMenu 等）依赖 vue-demi，会与纯 JS 示例产生打包冲突。
// 这里不启用扩展插件，示例提供了导出 PNG/SVG 的降级方案，其他能力以核心 API 为主。

const editorEl = document.getElementById('editor')
const previewEl = document.getElementById('preview')

// 初始化编辑器实例
const lfEditor = new LogicFlow({
  container: editorEl,
  grid: { size: 20, visible: true },
  background: { color: '#ffffff' },
})
lfEditor.setDefaultEdgeType && lfEditor.setDefaultEdgeType('polyline')

// 初始化预览实例（只读）
const lfPreview = new LogicFlow({
  container: previewEl,
  grid: { size: 20, visible: false },
  background: { color: '#fafafa' },
})

// 简单示例数据
const sampleData = {
  nodes: [
    { id: 'n1', type: 'rect', x: 220, y: 140, text: '开始' },
    { id: 'n2', type: 'diamond', x: 420, y: 140, text: '条件' },
    { id: 'n3', type: 'rect', x: 620, y: 140, text: '处理' },
  ],
  edges: [
    { id: 'e1', type: 'polyline', sourceNodeId: 'n1', targetNodeId: 'n2', text: '进入' },
    { id: 'e2', type: 'polyline', sourceNodeId: 'n2', targetNodeId: 'n3', text: '是' },
  ],
}

function randomPos() {
  return {
    x: 150 + Math.round(Math.random() * 300),
    y: 120 + Math.round(Math.random() * 240),
  }
}

// 同步预览
let lastHash = ''
function getGraphData() {
  return lfEditor.getGraphData ? lfEditor.getGraphData() : { nodes: [], edges: [] }
}
function hashData(d) {
  try { return JSON.stringify(d) } catch { return '' }
}
function syncPreview(force = false) {
  const data = getGraphData()
  const h = hashData(data)
  if (force || h !== lastHash) {
    lastHash = h
    lfPreview.render(data)
  }
}

// 连接模式
let connectMode = false
let connectStartId = null
lfEditor.on('node:click', ({ data }) => {
  if (!connectMode) return
  const id = data?.id
  if (!id) return
  if (!connectStartId) {
    connectStartId = id
    lfEditor.selectElementById(id, false, true)
  } else if (connectStartId !== id) {
    lfEditor.addEdge({ type: 'polyline', sourceNodeId: connectStartId, targetNodeId: id })
    connectStartId = null
    syncPreview(true)
  } else {
    connectStartId = null
  }
})

// 迷你地图：未启用扩展插件，这里仅做占位提示
const miniMap = undefined

// 绑定工具栏事件
const btnAddRect = document.getElementById('btnAddRect')
const btnAddDiamond = document.getElementById('btnAddDiamond')
const btnAddCircle = document.getElementById('btnAddCircle')
const btnAddEllipse = document.getElementById('btnAddEllipse')
const btnAddText = document.getElementById('btnAddText')
const btnConnectMode = document.getElementById('btnConnectMode')
const btnClear = document.getElementById('btnClear')
const btnSample = document.getElementById('btnSample')
const btnExport = document.getElementById('btnExport')
const btnExportPNG = document.getElementById('btnExportPNG')
const btnExportSVG = document.getElementById('btnExportSVG')
const btnSync = document.getElementById('btnSync')
const btnDelete = document.getElementById('btnDelete')
const btnUndo = document.getElementById('btnUndo')
const btnRedo = document.getElementById('btnRedo')
const btnFit = document.getElementById('btnFit')
const btnResetZoom = document.getElementById('btnResetZoom')
const chkLive = document.getElementById('chkLive')
const chkMiniMap = document.getElementById('chkMiniMap')
const fileImport = document.getElementById('fileImport')

btnAddRect?.addEventListener('click', () => {
  const { x, y } = randomPos()
  lfEditor.addNode({ type: 'rect', x, y, text: '矩形' })
  syncPreview(true)
})

btnAddDiamond?.addEventListener('click', () => {
  const { x, y } = randomPos()
  lfEditor.addNode({ type: 'diamond', x, y, text: '菱形' })
  syncPreview(true)
})

btnAddCircle?.addEventListener('click', () => {
  const { x, y } = randomPos()
  lfEditor.addNode({ type: 'circle', x, y, text: '开始/结束' })
  syncPreview(true)
})

btnAddEllipse?.addEventListener('click', () => {
  const { x, y } = randomPos()
  lfEditor.addNode({ type: 'ellipse', x, y, text: '步骤' })
  syncPreview(true)
})

btnAddText?.addEventListener('click', () => {
  const { x, y } = randomPos()
  lfEditor.addNode({ type: 'text', x, y, text: '注释' })
  syncPreview(true)
})

btnConnectMode?.addEventListener('click', () => {
  connectMode = !connectMode
  connectStartId = null
  btnConnectMode.classList.toggle('active', connectMode)
})

btnClear?.addEventListener('click', () => {
  lfEditor.render({ nodes: [], edges: [] })
  syncPreview(true)
})

btnSample?.addEventListener('click', () => {
  lfEditor.render(sampleData)
  syncPreview(true)
})

// JSON 导出
btnExport?.addEventListener('click', () => {
  const data = getGraphData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `flow-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
  a.remove()
})

// 快照导出（带插件优先，失败则降级）
async function exportSVG() {
  // 直接序列化 svg
  const svg = editorEl.querySelector('svg')
  if (!svg) return alert('未找到画布SVG')
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(svg)
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `flow-${Date.now()}.svg`
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
  a.remove()
}

async function exportImage(type = 'png') {
  const svg = editorEl.querySelector('svg')
  if (!svg) return alert('未找到画布SVG')
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(svg)
  const img = new Image()
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = url
  })
  const canvas = document.createElement('canvas')
  const bbox = svg.getBBox?.() || { width: editorEl.clientWidth, height: editorEl.clientHeight }
  canvas.width = Math.max(1, Math.ceil(bbox.width))
  canvas.height = Math.max(1, Math.ceil(bbox.height))
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0)
  URL.revokeObjectURL(url)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, `image/${type}`))
  if (!blob) return
  const dl = document.createElement('a')
  dl.href = URL.createObjectURL(blob)
  dl.download = `flow-${Date.now()}.${type}`
  document.body.appendChild(dl)
  dl.click()
  URL.revokeObjectURL(dl.href)
  dl.remove()
}

btnExportPNG?.addEventListener('click', () => exportImage('png'))
btnExportSVG?.addEventListener('click', () => exportSVG())

btnSync?.addEventListener('click', () => syncPreview(true))

btnDelete?.addEventListener('click', () => {
  const sel = lfEditor.getSelectElements?.(true)
  const toDeleteEdges = sel?.edges || []
  const toDeleteNodes = sel?.nodes || []
  toDeleteEdges.forEach((e) => lfEditor.deleteEdge?.(e.id))
  toDeleteNodes.forEach((n) => lfEditor.deleteNode?.(n.id))
  syncPreview(true)
})

btnUndo?.addEventListener('click', () => lfEditor.undo?.())
btnRedo?.addEventListener('click', () => lfEditor.redo?.())
btnFit?.addEventListener('click', () => lfEditor.fitView?.())
btnResetZoom?.addEventListener('click', () => lfEditor.resetZoom?.())

let live = chkLive?.checked ?? true
chkLive?.addEventListener('change', (e) => {
  live = e.target.checked
  if (live) syncPreview(true)
})

chkMiniMap?.addEventListener('change', (e) => {
  // 未启用扩展插件，提示并还原勾选
  alert('迷你地图功能未启用（扩展插件在纯 JS 示例中可能产生打包冲突，已临时关闭）')
  e.target.checked = false
})

fileImport?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const json = JSON.parse(text)
    lfEditor.render(json)
    syncPreview(true)
  } catch (err) {
    alert('导入失败：不是有效的 JSON 文件')
  } finally {
    e.target.value = ''
  }
})

// 快捷键
window.addEventListener('keydown', (e) => {
  const ctrl = e.ctrlKey || e.metaKey
  if (ctrl && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault(); lfEditor.undo?.(); return
  }
  if (ctrl && (e.key === 'y' || e.key === 'Y')) {
    e.preventDefault(); lfEditor.redo?.(); return
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault(); btnDelete?.click(); return
  }
  if (e.key === 'Escape') {
    connectMode = false; connectStartId = null; btnConnectMode?.classList.remove('active')
  }
})

// 定时增量同步
setInterval(() => { if (live) syncPreview(false) }, 600)

// 初始化
lfEditor.render(sampleData)
syncPreview(true)
