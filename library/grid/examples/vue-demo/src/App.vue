<template>
  <div class="container">
    <h1>🎯 GridStack Vue 3 Demo</h1>

    <!-- 物料面板 -->
    <Materials />

    <div class="tabs">
      <div class="tab-buttons">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'component' }"
          @click="activeTab = 'component'"
        >
          组件用法
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'hook' }"
          @click="activeTab = 'hook'"
        >
          Hook 用法
        </button>
      </div>

      <div class="tab-content">
        <!-- 组件用法示例 -->
        <div v-if="activeTab === 'component'">
          <div class="example-info">
            使用 GridStack 和 GridStackItem 组件，通过 v-for 渲染网格项
          </div>

          <div class="controls">
            <button @click="addComponentWidget">添加网格项</button>
            <button @click="addRandomWidget">添加随机项</button>
            <button @click="toggleFloat">切换浮动: {{ isFloating ? 'ON' : 'OFF' }}</button>
            <button @click="toggleStatic">{{ isStatic ? '启用交互' : '静态模式' }}</button>
            <button @click="saveLayout">保存布局</button>
            <button @click="loadLayout">加载布局</button>
            <button class="danger" @click="clearAll">清空所有</button>
          </div>

          <GridStack
            ref="gridRef"
            :column="12"
            :cell-height="70"
            :animate="true"
            :float="isFloating"
            :static-grid="isStatic"
            @ready="onGridReady"
            @change="onGridChange"
          >
            <GridStackItem
              v-for="item in componentItems"
              :key="item.id"
              v-bind="item"
            >
              <div class="widget-content">
                <div class="widget-header">
                  <span class="widget-title">{{ item.title }}</span>
                  <button class="widget-close" @click="removeWidget(item.id)">×</button>
                </div>
                <div class="widget-body">
                  {{ item.content }}
                </div>
              </div>
            </GridStackItem>
          </GridStack>
        </div>

        <!-- Hook 用法示例 -->
        <div v-if="activeTab === 'hook'">
          <div class="example-info">
            使用 useGridStack Hook，更灵活的编程方式
          </div>

          <div class="controls">
            <button @click="addHookWidget">添加网格项</button>
            <button @click="compactLayout">紧凑布局</button>
            <button @click="enableGrid">启用</button>
            <button @click="disableGrid">禁用</button>
            <button @click="saveHookLayout">保存布局</button>
            <button class="danger" @click="clearHookGrid">清空</button>
          </div>

          <div ref="hookGridRef" class="grid-stack">
            <div
              v-for="item in hookItems"
              :key="item.id"
              class="grid-stack-item"
              :gs-x="item.x"
              :gs-y="item.y"
              :gs-w="item.w"
              :gs-h="item.h"
            >
              <div class="grid-stack-item-content">
                <div class="widget-content">
                  <div class="widget-header">
                    <span class="widget-title">Hook Item {{ item.id }}</span>
                    <button class="widget-close" @click="removeHookWidget(item.id)">×</button>
                  </div>
                  <div class="widget-body">
                    {{ item.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { GridStack, GridStackItem, useGridStack } from '@ldesign/gridstack/vue'
import type { GridItemOptions } from '@ldesign/gridstack/vue'
import Materials from './components/Materials.vue'

// 当前标签页
const activeTab = ref<'component' | 'hook'>('component')

// ===== 组件用法 =====
const gridRef = ref()
const isFloating = ref(false)
const isStatic = ref(false)

interface WidgetItem extends GridItemOptions {
  id: number
  title: string
  content: string
}

const componentItems = ref<WidgetItem[]>([
  { id: 1, x: 0, y: 0, w: 4, h: 2, title: '网格项 1', content: 'Component 1' },
  { id: 2, x: 4, y: 0, w: 4, h: 2, title: '网格项 2', content: 'Component 2' },
  { id: 3, x: 8, y: 0, w: 4, h: 2, title: '网格项 3', content: 'Component 3' },
  { id: 4, x: 0, y: 2, w: 6, h: 3, title: '网格项 4', content: 'Component 4' },
  { id: 5, x: 6, y: 2, w: 6, h: 3, title: '网格项 5', content: 'Component 5' }
])

let widgetIdCounter = 6

const addComponentWidget = () => {
  componentItems.value.push({
    id: widgetIdCounter++,
    w: 4,
    h: 2,
    title: `网格项 ${widgetIdCounter - 1}`,
    content: `Component ${widgetIdCounter - 1}`
  })
}

const addRandomWidget = () => {
  componentItems.value.push({
    id: widgetIdCounter++,
    w: Math.floor(Math.random() * 4) + 2,
    h: Math.floor(Math.random() * 3) + 1,
    title: `随机项 ${widgetIdCounter - 1}`,
    content: `Random ${widgetIdCounter - 1}`
  })
}

const removeWidget = (id: number) => {
  const index = componentItems.value.findIndex(item => item.id === id)
  if (index > -1) {
    componentItems.value.splice(index, 1)
  }
}

const toggleFloat = () => {
  isFloating.value = !isFloating.value
}

const toggleStatic = () => {
  isStatic.value = !isStatic.value
}

const saveLayout = () => {
  if (gridRef.value) {
    const layout = gridRef.value.save()
    localStorage.setItem('vueGridLayout', JSON.stringify(layout))
    alert('布局已保存')
    console.log('Saved layout:', layout)
  }
}

const loadLayout = () => {
  const saved = localStorage.getItem('vueGridLayout')
  if (saved && gridRef.value) {
    try {
      const layout = JSON.parse(saved)
      gridRef.value.load(layout)
      alert('布局已加载')
    } catch (error) {
      alert('加载失败')
    }
  } else {
    alert('没有保存的布局')
  }
}

const clearAll = () => {
  if (confirm('确定要清空所有网格项吗？')) {
    componentItems.value = []
  }
}

const onGridReady = (instance: any) => {
  console.log('Grid ready:', instance)
  
  // 配置外部拖入
  setupMaterialsDragIn(instance)
}

// 配置物料面板拖入
const setupMaterialsDragIn = (grid: any) => {
  const materialItems = document.querySelectorAll('.material-item')
  
  if (materialItems.length > 0) {
    // 使用 GridStack 的 setupDragIn 方法
    grid.setupDragIn('.material-item', {
      appendTo: 'body',
      helper: 'clone'
    })
    
    // 监听拖放事件
    grid.on('dropped', (event: any, previousNode: any, newNode: any) => {
      const type = newNode.el?.querySelector('.material-item')?.getAttribute('data-type')
      
      if (type && newNode.el) {
        // 移除 helper 元素
        const materialItem = newNode.el.querySelector('.material-item')
        if (materialItem) {
          materialItem.remove()
        }
        
        // 创建新的 widget 内容
        const materialTypes: Record<string, { name: string; icon: string }> = {
          chart: { name: '图表', icon: '📊' },
          table: { name: '表格', icon: '📋' },
          form: { name: '表单', icon: '📝' },
          card: { name: '卡片', icon: '🎴' },
          stats: { name: '统计', icon: '📈' },
          calendar: { name: '日历', icon: '📅' }
        }
        
        const material = materialTypes[type] || materialTypes.chart
        const newId = widgetIdCounter++
        
        // 更新 grid-stack-item-content
        const content = newNode.el.querySelector('.grid-stack-item-content')
        if (content) {
          content.innerHTML = `
            <div class="widget-content">
              <div class="widget-header">
                <span class="widget-title">${material.icon} ${material.name} ${newId}</span>
                <button class="widget-close">×</button>
              </div>
              <div class="widget-body">
                ${material.icon} ${material.name}内容 ${newId}
              </div>
            </div>
          `
          
          // 添加删除事件
          const closeBtn = content.querySelector('.widget-close')
          if (closeBtn) {
            closeBtn.addEventListener('click', () => {
              grid.removeWidget(newNode.el)
            })
          }
        }
        
        // 添加到 componentItems 以保持状态同步
        componentItems.value.push({
          id: newId,
          x: newNode.x,
          y: newNode.y,
          w: newNode.w,
          h: newNode.h,
          title: `${material.name} ${newId}`,
          content: `${material.name}内容 ${newId}`
        })
        
        console.log('从物料面板添加:', type, newId)
      }
    })
  }
}

const onGridChange = (items: GridItemOptions[]) => {
  console.log('Grid changed:', items)
}

// ===== Hook 用法 =====
const hookGridRef = ref<HTMLElement | null>(null)
const {
  isReady,
  addWidget: addGridWidget,
  removeWidget: removeGridWidget,
  removeAll: removeAllWidgets,
  compact,
  enable,
  disable,
  save: saveGrid
} = useGridStack({
  column: 12,
  cellHeight: 70,
  animate: true
})

const hookItems = ref<WidgetItem[]>([
  { id: 1, x: 0, y: 0, w: 3, h: 2, title: 'Hook 1', content: 'Hook Widget 1' },
  { id: 2, x: 3, y: 0, w: 3, h: 2, title: 'Hook 2', content: 'Hook Widget 2' },
  { id: 3, x: 6, y: 0, w: 3, h: 2, title: 'Hook 3', content: 'Hook Widget 3' },
  { id: 4, x: 9, y: 0, w: 3, h: 2, title: 'Hook 4', content: 'Hook Widget 4' }
])

let hookIdCounter = 5

const addHookWidget = () => {
  const newItem: WidgetItem = {
    id: hookIdCounter++,
    w: 4,
    h: 2,
    title: `Hook ${hookIdCounter - 1}`,
    content: `Hook Widget ${hookIdCounter - 1}`
  }
  hookItems.value.push(newItem)
}

const removeHookWidget = (id: number) => {
  const index = hookItems.value.findIndex(item => item.id === id)
  if (index > -1) {
    hookItems.value.splice(index, 1)
  }
}

const compactLayout = () => {
  compact()
}

const enableGrid = () => {
  enable()
}

const disableGrid = () => {
  disable()
}

const saveHookLayout = () => {
  const layout = saveGrid()
  localStorage.setItem('vueHookLayout', JSON.stringify(layout))
  alert('Hook 布局已保存')
  console.log('Hook layout:', layout)
}

const clearHookGrid = () => {
  if (confirm('确定要清空所有网格项吗？')) {
    hookItems.value = []
  }
}
</script>
