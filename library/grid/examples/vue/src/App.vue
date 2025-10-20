<template>
  <div class="app">
    <header>
      <h1>@ldesign/grid Vue Example</h1>
      <div class="controls">
        <button @click="saveLayout">Save Layout</button>
        <button @click="loadLayout">Load Layout</button>
        <button @click="clearGrid">Clear Grid</button>
      </div>
    </header>

    <div class="main-content">
      <!-- Widget Toolbar -->
      <aside class="sidebar">
        <h3>Widgets</h3>
        <p class="hint">Drag widgets to the grid</p>
        
        <div class="widget-list">
          <GridDragSource 
            v-for="widget in widgets"
            :key="widget.id"
            :data="widget"
            :item-options="{ w: widget.w, h: widget.h }"
            class="widget-item"
          >
            <div class="widget-preview">
              <span class="widget-icon">{{ widget.icon }}</span>
              <span class="widget-name">{{ widget.name }}</span>
            </div>
          </GridDragSource>
        </div>
      </aside>

      <!-- Grid Container -->
      <main class="grid-container">
        <GridStack 
          ref="gridRef"
          :options="gridOptions"
          @change="handleChange"
          @dropped="handleDrop"
        >
          <GridItem 
            v-for="item in items"
            :key="item.id"
            v-bind="item"
          >
            <div class="grid-item-header">
              <span>{{ item.title }}</span>
              <button 
                class="remove-btn"
                @click="removeItem(item.id)"
              >
                ×
              </button>
            </div>
            <div class="grid-item-body">
              {{ item.content }}
            </div>
          </GridItem>
        </GridStack>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GridStack, GridItem, GridDragSource } from '@ldesign/grid/vue'
import type { GridItemOptions } from '@ldesign/grid'

const gridRef = ref()

const gridOptions = {
  column: 12,
  cellHeight: 70,
  acceptWidgets: true,
  animate: true,
  float: true
}

const widgets = [
  { id: 'chart-line', name: 'Line Chart', icon: '📈', w: 6, h: 4 },
  { id: 'chart-bar', name: 'Bar Chart', icon: '📊', w: 6, h: 4 },
  { id: 'chart-pie', name: 'Pie Chart', icon: '🥧', w: 4, h: 4 },
  { id: 'table', name: 'Data Table', icon: '📋', w: 8, h: 5 },
  { id: 'stats', name: 'Stats Card', icon: '📊', w: 3, h: 2 },
  { id: 'map', name: 'Map', icon: '🗺️', w: 6, h: 5 },
  { id: 'calendar', name: 'Calendar', icon: '📅', w: 4, h: 4 },
  { id: 'text', name: 'Text Block', icon: '📝', w: 4, h: 3 }
]

const items = ref<GridItemOptions[]>([
  {
    id: 'demo-1',
    x: 0,
    y: 0,
    w: 4,
    h: 3,
    title: 'Welcome',
    content: 'Drag widgets from the sidebar to add them to the grid!'
  }
])

let itemIdCounter = 1

function handleChange(changedItems: GridItemOptions[]) {
  console.log('Grid changed:', changedItems)
}

function handleDrop(data: any) {
  console.log('Widget dropped:', data)
  
  // Extract widget data
  const widget = data.data
  
  // Create new item
  const newItem: GridItemOptions = {
    id: `item-${itemIdCounter++}`,
    w: widget.w || 4,
    h: widget.h || 3,
    title: widget.name,
    content: `${widget.icon} This is a ${widget.name} widget`,
    autoPosition: true
  }
  
  items.value.push(newItem)
}

function removeItem(id: string) {
  items.value = items.value.filter(item => item.id !== id)
  if (gridRef.value?.gridInstance) {
    gridRef.value.gridInstance.removeItem(id)
  }
}

function saveLayout() {
  if (!gridRef.value) return
  
  const layout = gridRef.value.save()
  localStorage.setItem('grid-layout', JSON.stringify(layout))
  alert('Layout saved!')
}

function loadLayout() {
  const saved = localStorage.getItem('grid-layout')
  if (!saved) {
    alert('No saved layout found')
    return
  }
  
  try {
    const layout = JSON.parse(saved)
    if (gridRef.value) {
      gridRef.value.load(layout)
      items.value = layout.items
    }
    alert('Layout loaded!')
  } catch (e) {
    alert('Failed to load layout')
  }
}

function clearGrid() {
  if (confirm('Clear all items?')) {
    items.value = []
    if (gridRef.value) {
      gridRef.value.clear()
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: #1e40af;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
}

.controls button {
  padding: 0.5rem 1rem;
  background: white;
  color: #1e40af;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.controls button:hover {
  background: #e0e7ff;
}

.main-content {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px;
  background: #f3f4f6;
  padding: 1.5rem;
  border-right: 1px solid #e5e7eb;
}

.sidebar h3 {
  margin: 0 0 0.5rem 0;
}

.hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.widget-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.widget-item {
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  padding: 0.75rem;
  transition: all 0.2s;
}

.widget-item:hover {
  border-color: #1e40af;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.1);
}

.widget-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.widget-icon {
  font-size: 1.5rem;
}

.widget-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.grid-container {
  flex: 1;
  padding: 2rem;
  background: #fafafa;
}

:deep(.grid-stack-item) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

:deep(.grid-stack-item-content) {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.grid-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  width: 24px;
  height: 24px;
}

.remove-btn:hover {
  color: #ef4444;
}

.grid-item-body {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}
</style>













