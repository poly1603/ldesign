import { GridManager } from '@ldesign/grid'
import type { GridItemOptions, IGridInstance } from '@ldesign/grid'

// Import styles
import 'gridstack/dist/gridstack.min.css'
import './style.css'

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

let itemIdCounter = 1
let gridInstance: IGridInstance

// Initialize grid
function initGrid() {
  const container = document.getElementById('grid')!
  const manager = GridManager.getInstance()
  
  gridInstance = manager.create(container, {
    column: 12,
    cellHeight: 70,
    acceptWidgets: true,
    animate: true,
    float: true
  })

  // Add initial item
  addGridItem({
    id: 'demo-1',
    x: 0,
    y: 0,
    w: 4,
    h: 3,
    title: 'Welcome',
    content: 'Drag widgets from the sidebar to add them to the grid!'
  })

  // Listen to grid events
  gridInstance.on('change', (items) => {
    console.log('Grid changed:', items)
  })

  gridInstance.on('dropped', (item, data) => {
    console.log('Widget dropped:', data)
    
    if (data && data.data) {
      const widget = data.data
      const newItem: GridItemOptions = {
        id: `item-${itemIdCounter++}`,
        w: widget.w || 4,
        h: widget.h || 3,
        title: widget.name,
        content: `${widget.icon} This is a ${widget.name} widget`,
        autoPosition: true
      }
      
      addGridItem(newItem)
    }
  })
}

// Add grid item
function addGridItem(item: GridItemOptions) {
  const element = document.createElement('div')
  element.className = 'grid-stack-item'
  element.innerHTML = `
    <div class="grid-stack-item-content">
      <div class="grid-item-header">
        <span>${item.title}</span>
        <button class="remove-btn" data-id="${item.id}">×</button>
      </div>
      <div class="grid-item-body">
        ${item.content}
      </div>
    </div>
  `
  
  // Add remove button handler
  const removeBtn = element.querySelector('.remove-btn')
  removeBtn?.addEventListener('click', () => {
    gridInstance.removeItem(item.id!)
    element.remove()
  })
  
  gridInstance.addItem(element, item)
}

// Initialize widgets
function initWidgets() {
  const widgetList = document.getElementById('widgetList')!
  
  widgets.forEach(widget => {
    const element = document.createElement('div')
    element.className = 'widget-item'
    element.draggable = true
    element.innerHTML = `
      <div class="widget-preview">
        <span class="widget-icon">${widget.icon}</span>
        <span class="widget-name">${widget.name}</span>
      </div>
    `
    
    // Add drag event listeners
    element.addEventListener('dragstart', (e) => {
      element.classList.add('is-dragging')
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'copy'
        e.dataTransfer.setData('application/json', JSON.stringify({
          data: widget,
          itemOptions: { w: widget.w, h: widget.h }
        }))
      }
    })
    
    element.addEventListener('dragend', () => {
      element.classList.remove('is-dragging')
    })
    
    widgetList.appendChild(element)
  })
}

// Button handlers
function initButtons() {
  const saveBtn = document.getElementById('saveBtn')
  const loadBtn = document.getElementById('loadBtn')
  const clearBtn = document.getElementById('clearBtn')
  
  saveBtn?.addEventListener('click', () => {
    const layout = gridInstance.save()
    localStorage.setItem('grid-layout', JSON.stringify(layout))
    alert('Layout saved!')
  })
  
  loadBtn?.addEventListener('click', () => {
    const saved = localStorage.getItem('grid-layout')
    if (!saved) {
      alert('No saved layout found')
      return
    }
    
    try {
      const layout = JSON.parse(saved)
      
      // Clear existing items
      const container = document.getElementById('grid')!
      container.innerHTML = ''
      
      // Load layout
      gridInstance.load(layout)
      
      // Re-add items with proper UI
      layout.items.forEach((item: GridItemOptions) => {
        addGridItem(item)
      })
      
      alert('Layout loaded!')
    } catch (e) {
      alert('Failed to load layout')
    }
  })
  
  clearBtn?.addEventListener('click', () => {
    if (confirm('Clear all items?')) {
      gridInstance.clear()
      const container = document.getElementById('grid')!
      container.innerHTML = ''
    }
  })
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  initGrid()
  initWidgets()
  initButtons()
})




