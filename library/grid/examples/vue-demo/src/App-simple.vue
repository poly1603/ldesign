<template>
  <div class="container">
    <h1>🎯 GridStack Vue 3 Demo</h1>
    
    <div class="controls">
      <button @click="addWidget">添加网格项</button>
      <button @click="addRandomWidget">添加随机项</button>
      <button @click="toggleFloat">切换浮动: {{ isFloating ? 'ON' : 'OFF' }}</button>
      <button @click="saveLayout">保存布局</button>
      <button @click="loadLayout">加载布局</button>
      <button class="danger" @click="clearAll">清空所有</button>
    </div>

    <div ref="gridRef" class="grid-stack"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { GridStack } from 'gridstack'

const gridRef = ref<HTMLElement | null>(null)
let grid: GridStack | null = null
const isFloating = ref(false)
let widgetCount = 0

onMounted(() => {
  if (gridRef.value) {
    grid = GridStack.init({
      column: 12,
      cellHeight: 70,
      animate: true,
      float: false,
      margin: 5
    }, gridRef.value)

    // 添加初始网格项
    const initialItems = [
      { x: 0, y: 0, w: 4, h: 2 },
      { x: 4, y: 0, w: 4, h: 2 },
      { x: 8, y: 0, w: 4, h: 2 },
      { x: 0, y: 2, w: 6, h: 3 },
      { x: 6, y: 2, w: 6, h: 3 }
    ]

    initialItems.forEach((item, index) => {
      widgetCount++
      grid?.addWidget({
        ...item,
        content: createWidgetContent(`网格项 ${widgetCount}`, widgetCount)
      })
    })

    // 监听变化事件
    grid.on('change', (event, items) => {
      console.log('Grid changed:', items)
    })
    
    // 监听物料拖入事件
    grid.on('dropped', (event, previousWidget, newWidget) => {
      widgetCount++
      const type = (newWidget.el as HTMLElement)?.getAttribute('data-type') || 'chart'
      
      // 更新拖入的 widget 内容
      if (newWidget.el) {
        const contentEl = newWidget.el.querySelector('.grid-stack-item-content')
        if (contentEl) {
          contentEl.innerHTML = createWidgetContent(`${type} 组件`, widgetCount)
        }
      }
      
      console.log('物料已拖入:', type, '位置:', newWidget.x, newWidget.y)
    })

    console.log('GridStack initialized:', grid)
    console.log('✅ 支持从物料面板拖动 Vue 组件！')
  }
})

onBeforeUnmount(() => {
  grid?.destroy(false)
})

function createWidgetContent(title: string, id: number): string {
  return `
    <div class="widget-content">
      <div class="widget-header">
        <span class="widget-title">${title}</span>
        <button class="widget-close" onclick="removeWidget(this)">×</button>
      </div>
      <div class="widget-body">
        内容 ${id}
      </div>
    </div>
  `
}

const addWidget = () => {
  if (grid) {
    widgetCount++
    grid.addWidget({
      w: 4,
      h: 2,
      content: createWidgetContent(`网格项 ${widgetCount}`, widgetCount)
    })
  }
}

const addRandomWidget = () => {
  if (grid) {
    widgetCount++
    grid.addWidget({
      w: Math.floor(Math.random() * 4) + 2,
      h: Math.floor(Math.random() * 3) + 1,
      content: createWidgetContent(`随机项 ${widgetCount}`, widgetCount)
    })
  }
}

const toggleFloat = () => {
  if (grid) {
    isFloating.value = !isFloating.value
    grid.float(isFloating.value)
  }
}

const saveLayout = () => {
  if (grid) {
    const layout = grid.save()
    localStorage.setItem('vueGridLayout', JSON.stringify(layout))
    alert('布局已保存到 localStorage')
    console.log('Saved layout:', layout)
  }
}

const loadLayout = () => {
  const saved = localStorage.getItem('vueGridLayout')
  if (saved && grid) {
    try {
      const layout = JSON.parse(saved)
      grid.load(layout)
      alert('布局已加载')
    } catch (error) {
      alert('加载失败：布局数据格式错误')
    }
  } else {
    alert('没有保存的布局')
  }
}

const clearAll = () => {
  if (confirm('确定要清空所有网格项吗？') && grid) {
    grid.removeAll()
    widgetCount = 0
  }
}

// 全局删除函数
;(window as any).removeWidget = (button: HTMLElement) => {
  const item = button.closest('.grid-stack-item') as HTMLElement
  if (item && grid) {
    grid.removeWidget(item)
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.controls button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.controls button:hover {
  background: #45a049;
}

.controls button.danger {
  background: #f44336;
}

.controls button.danger:hover {
  background: #da190b;
}

.grid-stack {
  background: #fafafa;
  min-height: 600px;
}
</style>

<style>
/* 全局样式 */
.widget-content {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.widget-header {
  padding: 10px;
  background: #2196F3;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.widget-title {
  font-weight: bold;
  font-size: 14px;
}

.widget-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.widget-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.widget-body {
  flex: 1;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
}
</style>
