import './style.css'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/index.css'
import '@logicflow/extension/lib/style/index.css'

const editorEl = document.getElementById('editor')
const previewEl = document.getElementById('preview')

// 初始化编辑器实例
const lfEditor = new LogicFlow({
  container: editorEl,
  grid: {
    size: 20,
    visible: true,
  },
  background: { color: '#ffffff' },
})
lfEditor.setDefaultEdgeType && lfEditor.setDefaultEdgeType('polyline')

// 初始化预览实例（通过禁用指针事件实现只读）
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
  try {
    return JSON.stringify(d)
  } catch (e) {
    return ''
  }
}
function syncPreview(force = false) {
  const data = getGraphData()
  const h = hashData(data)
  if (force || h !== lastHash) {
    lastHash = h
    lfPreview.render(data)
  }
}

// 绑定工具栏事件
const btnAddRect = document.getElementById('btnAddRect')
const btnAddDiamond = document.getElementById('btnAddDiamond')
const btnClear = document.getElementById('btnClear')
const btnSample = document.getElementById('btnSample')
const btnExport = document.getElementById('btnExport')
const btnSync = document.getElementById('btnSync')
const chkLive = document.getElementById('chkLive')
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

btnClear?.addEventListener('click', () => {
  lfEditor.render({ nodes: [], edges: [] })
  syncPreview(true)
})

btnSample?.addEventListener('click', () => {
  lfEditor.render(sampleData)
  syncPreview(true)
})

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

btnSync?.addEventListener('click', () => syncPreview(true))

let live = chkLive?.checked ?? true
chkLive?.addEventListener('change', (e) => {
  live = e.target.checked
  if (live) syncPreview(true)
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
    // 允许再次选择同一文件
    e.target.value = ''
  }
})

// 定时增量同步，避免依赖具体事件名（更通用）
setInterval(() => {
  if (live) syncPreview(false)
}, 600)

// 初始化
lfEditor.render(sampleData)
syncPreview(true)
