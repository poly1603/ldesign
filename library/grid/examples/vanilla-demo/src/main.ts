import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import './style.css'

// 初始化网格 - 启用从外部拖入
const grid = GridStack.init({
  column: 12,
  cellHeight: 70,
  animate: true,
  float: false,
  margin: 5,
  acceptWidgets: true, // 关键：允许从外部拖入
  removable: false
}, '#grid')

// 物料类型配置
const materialTypes: Record<string, { name: string; icon: string; color: string }> = {
  chart: { name: '图表', icon: '📊', color: '#667eea' },
  table: { name: '表格', icon: '📋', color: '#f093fb' },
  form: { name: '表单', icon: '📝', color: '#4facfe' },
  text: { name: '文本', icon: '📄', color: '#43e97b' },
  image: { name: '图片', icon: '🖼️', color: '#fa709a' },
  video: { name: '视频', icon: '🎬', color: '#30cfd0' }
}

// 初始网格项
const initialItems = [
  { x: 0, y: 0, w: 4, h: 2, type: 'chart' },
  { x: 4, y: 0, w: 4, h: 2, type: 'table' },
  { x: 8, y: 0, w: 4, h: 2, type: 'form' }
]

let widgetCount = 0

// 加载初始项
initialItems.forEach((item) => {
  widgetCount++
  grid.addWidget({
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    content: createWidgetContent(item.type, widgetCount)
  })
})

// 创建网格项内容
function createWidgetContent(type: string, id: number): string {
  const material = materialTypes[type] || materialTypes.chart
  return `
    <div class="widget-header">
      <span>${material.icon} ${material.name} ${id}</span>
      <button class="widget-close" onclick="window.removeWidget(this)">×</button>
    </div>
    <div class="widget-body">
      ${material.icon} ${material.name}内容 ${id}
    </div>
  `
}

// 使用 GridStack setupDragIn 配置外部拖入
function setupMaterialsDragIn() {
  // 使用 GridStack 的 setupDragIn 方法
  grid.setupDragIn('.material-item', {
    appendTo: 'body',
    helper: 'clone'
  })
  
  // 监听拖放事件
  grid.on('dropped', (event: any, previousNode: any, newNode: any) => {
    const type = newNode.el?.querySelector('.material-item')?.getAttribute('data-type')
    
    if (type && newNode.el && materialTypes[type]) {
      widgetCount++
      
      // 移除 helper 元素（被拖入的物料项副本）
      const materialItem = newNode.el.querySelector('.material-item')
      if (materialItem) {
        materialItem.remove()
      }
      
      // 更新 grid-stack-item-content
      const content = newNode.el.querySelector('.grid-stack-item-content')
      if (content) {
        content.innerHTML = createWidgetContent(type, widgetCount)
      }
      
      console.log('从物料面板添加:', type, widgetCount, 'at', newNode.x, newNode.y)
    }
  })
}

// 初始化拖拽功能
setupMaterialsDragIn()

// 监听变化事件
grid.on('change', (event, items) => {
  console.log('Grid changed:', items)
})

// 全局删除函数
;(window as any).removeWidget = (button: HTMLElement) => {
  const item = button.closest('.grid-stack-item') as HTMLElement
  if (item && grid) {
    grid.removeWidget(item)
  }
}

// 控制按钮事件
document.getElementById('addWidget')?.addEventListener('click', () => {
  widgetCount++
  grid.addWidget({
    w: 4,
    h: 2,
    content: createWidgetContent('chart', widgetCount)
  })
})

document.getElementById('addRandom')?.addEventListener('click', () => {
  widgetCount++
  const types = Object.keys(materialTypes)
  const randomType = types[Math.floor(Math.random() * types.length)]
  grid.addWidget({
    w: Math.floor(Math.random() * 4) + 2,
    h: Math.floor(Math.random() * 3) + 1,
    content: createWidgetContent(randomType, widgetCount)
  })
})

document.getElementById('compact')?.addEventListener('click', () => {
  grid.compact()
})

let isFloating = false
document.getElementById('toggleFloat')?.addEventListener('click', () => {
  isFloating = !isFloating
  grid.float(isFloating)
  console.log('Float mode:', isFloating)
})

document.getElementById('save')?.addEventListener('click', () => {
  const layout = grid.save()
  localStorage.setItem('gridLayout', JSON.stringify(layout))
  alert('布局已保存到 localStorage')
  console.log('Saved layout:', layout)
})

document.getElementById('load')?.addEventListener('click', () => {
  const savedLayout = localStorage.getItem('gridLayout')
  if (savedLayout) {
    try {
      const layout = JSON.parse(savedLayout)
      grid.load(layout, true)
      alert('布局已加载')
    } catch (error) {
      alert('加载失败：布局数据格式错误')
    }
  } else {
    alert('没有保存的布局')
  }
})

let isStatic = false
document.getElementById('toggleStatic')?.addEventListener('click', () => {
  isStatic = !isStatic
  grid.setStatic(isStatic)
  const btn = document.getElementById('toggleStatic')
  if (btn) {
    btn.textContent = isStatic ? '启用交互' : '切换静态模式'
  }
})

document.getElementById('clearAll')?.addEventListener('click', () => {
  if (confirm('确定要清空所有网格项吗？')) {
    grid.removeAll()
    widgetCount = 0
  }
})

console.log('GridStack instance:', grid)
console.log('Column count:', grid.getColumn())
console.log('Cell height:', grid.getCellHeight())
console.log('✅ 支持从物料候选栏拖拽到Grid！')
