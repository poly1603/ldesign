import React, { useState, useRef, useEffect } from 'react'
import { GridStack, GridStackItem } from '@ldesign/gridstack/react'
import type { GridItemOptions } from '@ldesign/gridstack/react'
import Materials from './Materials'

interface WidgetItem extends GridItemOptions {
  id: string
  title: string
  content: string
}

const ComponentExample: React.FC = () => {
  const gridRef = useRef<any>(null)
  const [isFloating, setIsFloating] = useState(false)
  const [isStatic, setIsStatic] = useState(false)
  const [items, setItems] = useState<WidgetItem[]>([
    { id: '1', x: 0, y: 0, w: 4, h: 2, title: '网格项 1', content: 'Component 1' },
    { id: '2', x: 4, y: 0, w: 4, h: 2, title: '网格项 2', content: 'Component 2' },
    { id: '3', x: 8, y: 0, w: 4, h: 2, title: '网格项 3', content: 'Component 3' },
    { id: '4', x: 0, y: 2, w: 6, h: 3, title: '网格项 4', content: 'Component 4' },
    { id: '5', x: 6, y: 2, w: 6, h: 3, title: '网格项 5', content: 'Component 5' }
  ])

  let widgetIdCounter = 6

  const addWidget = () => {
    const newItem: WidgetItem = {
      id: String(widgetIdCounter++),
      w: 4,
      h: 2,
      title: `网格项 ${widgetIdCounter - 1}`,
      content: `Component ${widgetIdCounter - 1}`
    }
    setItems([...items, newItem])
  }

  const addRandomWidget = () => {
    const newItem: WidgetItem = {
      id: String(widgetIdCounter++),
      w: Math.floor(Math.random() * 4) + 2,
      h: Math.floor(Math.random() * 3) + 1,
      title: `随机项 ${widgetIdCounter - 1}`,
      content: `Random ${widgetIdCounter - 1}`
    }
    setItems([...items, newItem])
  }

  const removeWidget = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const toggleFloat = () => {
    setIsFloating(!isFloating)
  }

  const toggleStatic = () => {
    setIsStatic(!isStatic)
  }

  const saveLayout = () => {
    if (gridRef.current) {
      const layout = gridRef.current.save()
      localStorage.setItem('reactGridLayout', JSON.stringify(layout))
      alert('布局已保存')
      console.log('Saved layout:', layout)
    }
  }

  const loadLayout = () => {
    const saved = localStorage.getItem('reactGridLayout')
    if (saved) {
      try {
        const layout = JSON.parse(saved)
        if (gridRef.current) {
          gridRef.current.load(layout)
          alert('布局已加载')
        }
      } catch (error) {
        alert('加载失败')
      }
    } else {
      alert('没有保存的布局')
    }
  }

  const clearAll = () => {
    if (window.confirm('确定要���空所有网格项吗？')) {
      setItems([])
    }
  }

  const handleGridReady = (instance: any) => {
    console.log('Grid ready:', instance)
    gridRef.current = instance
    
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
          const newId = String(widgetIdCounter++)
          
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
                // 更新 state
                setItems(prevItems => prevItems.filter(item => item.id !== newId))
              })
            }
          }
          
          // 添加到 items state
          const newItem: WidgetItem = {
            id: newId,
            x: newNode.x,
            y: newNode.y,
            w: newNode.w,
            h: newNode.h,
            title: `${material.name} ${newId}`,
            content: `${material.name}内容 ${newId}`
          }
          
          setItems(prevItems => [...prevItems, newItem])
          
          console.log('从物料面板添加:', type, newId)
        }
      })
    }
  }

  const handleGridChange = (changedItems: GridItemOptions[]) => {
    console.log('Grid changed:', changedItems)
  }

  return (
    <div>
      {/* 物料面板 */}
      <Materials />
      
      <div className="example-info">
        使用 GridStack 和 GridStackItem 组件，通过 state 管理网格项
      </div>

      <div className="controls">
        <button onClick={addWidget}>添加网格项</button>
        <button onClick={addRandomWidget}>添加随机项</button>
        <button onClick={toggleFloat}>切换浮动: {isFloating ? 'ON' : 'OFF'}</button>
        <button onClick={toggleStatic}>{isStatic ? '启用交互' : '静态模式'}</button>
        <button onClick={saveLayout}>保存布局</button>
        <button onClick={loadLayout}>加载布局</button>
        <button className="danger" onClick={clearAll}>清空所有</button>
      </div>

      <GridStack
        column={12}
        cellHeight={70}
        animate={true}
        float={isFloating}
        staticGrid={isStatic}
        onReady={handleGridReady}
        onChange={handleGridChange}
      >
        {items.map(item => (
          <GridStackItem key={item.id} {...item}>
            <div className="widget-content">
              <div className="widget-header">
                <span className="widget-title">{item.title}</span>
                <button className="widget-close" onClick={() => removeWidget(item.id)}>
                  ×
                </button>
              </div>
              <div className="widget-body">{item.content}</div>
            </div>
          </GridStackItem>
        ))}
      </GridStack>
    </div>
  )
}

export default ComponentExample
