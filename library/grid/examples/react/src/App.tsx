import { useState, useRef } from 'react'
import { GridStack, GridItem, GridDragSource } from '@ldesign/grid/react'
import type { GridItemOptions } from '@ldesign/grid'

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

function App() {
  const gridRef = useRef<any>(null)
  const [items, setItems] = useState<GridItemOptions[]>([
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

  const gridOptions = {
    column: 12,
    cellHeight: 70,
    acceptWidgets: true,
    animate: true,
    float: true
  }

  const handleChange = (changedItems: GridItemOptions[]) => {
    console.log('Grid changed:', changedItems)
  }

  const handleDrop = (data: any) => {
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
    
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
    if (gridRef.current?.gridInstance) {
      gridRef.current.gridInstance.removeItem(id)
    }
  }

  const saveLayout = () => {
    if (!gridRef.current) return
    
    const layout = gridRef.current.save()
    localStorage.setItem('grid-layout', JSON.stringify(layout))
    alert('Layout saved!')
  }

  const loadLayout = () => {
    const saved = localStorage.getItem('grid-layout')
    if (!saved) {
      alert('No saved layout found')
      return
    }
    
    try {
      const layout = JSON.parse(saved)
      if (gridRef.current) {
        gridRef.current.load(layout)
        setItems(layout.items)
      }
      alert('Layout loaded!')
    } catch (e) {
      alert('Failed to load layout')
    }
  }

  const clearGrid = () => {
    if (window.confirm('Clear all items?')) {
      setItems([])
      if (gridRef.current) {
        gridRef.current.clear()
      }
    }
  }

  return (
    <div className="app">
      <header>
        <h1>@ldesign/grid React Example</h1>
        <div className="controls">
          <button onClick={saveLayout}>Save Layout</button>
          <button onClick={loadLayout}>Load Layout</button>
          <button onClick={clearGrid}>Clear Grid</button>
        </div>
      </header>

      <div className="main-content">
        {/* Widget Toolbar */}
        <aside className="sidebar">
          <h3>Widgets</h3>
          <p className="hint">Drag widgets to the grid</p>
          
          <div className="widget-list">
            {widgets.map((widget) => (
              <GridDragSource
                key={widget.id}
                data={widget}
                itemOptions={{ w: widget.w, h: widget.h }}
                className="widget-item"
              >
                <div className="widget-preview">
                  <span className="widget-icon">{widget.icon}</span>
                  <span className="widget-name">{widget.name}</span>
                </div>
              </GridDragSource>
            ))}
          </div>
        </aside>

        {/* Grid Container */}
        <main className="grid-container">
          <GridStack 
            ref={gridRef}
            options={gridOptions}
            onChange={handleChange}
            onDropped={handleDrop}
          >
            {items.map((item) => (
              <GridItem key={item.id} {...item}>
                <div className="grid-item-header">
                  <span>{item.title}</span>
                  <button 
                    className="remove-btn"
                    onClick={() => removeItem(item.id!)}
                  >
                    ×
                  </button>
                </div>
                <div className="grid-item-body">
                  {item.content}
                </div>
              </GridItem>
            ))}
          </GridStack>
        </main>
      </div>
    </div>
  )
}

export default App




