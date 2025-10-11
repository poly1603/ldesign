import React, { useEffect, useRef, useState } from 'react'
import { GridStack } from 'gridstack'
import './index.css'

const App: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null)
  const gridInstanceRef = useRef<GridStack | null>(null)
  const [isFloating, setIsFloating] = useState(false)
  const widgetCountRef = useRef(0)

  useEffect(() => {
    if (gridRef.current && !gridInstanceRef.current) {
      // 初始化 GridStack
      const grid = GridStack.init({
        column: 12,
        cellHeight: 70,
        animate: true,
        float: false,
        margin: 5
      }, gridRef.current)

      gridInstanceRef.current = grid

      // 添加初始网格项
      const initialItems = [
        { x: 0, y: 0, w: 4, h: 2 },
        { x: 4, y: 0, w: 4, h: 2 },
        { x: 8, y: 0, w: 4, h: 2 },
        { x: 0, y: 2, w: 6, h: 3 },
        { x: 6, y: 2, w: 6, h: 3 }
      ]

      initialItems.forEach((item) => {
        widgetCountRef.current++
        grid.addWidget({
          ...item,
          content: createWidgetContent(`网格项 ${widgetCountRef.current}`, widgetCountRef.current)
        })
      })

      // 监听变化事件
      grid.on('change', (event, items) => {
        console.log('Grid changed:', items)
      })
      
      // 监听物料拖入事件
      grid.on('dropped', (event, previousWidget, newWidget) => {
        widgetCountRef.current++
        const type = (newWidget.el as HTMLElement)?.getAttribute('data-type') || 'chart'
        
        // 更新拖入的 widget 内容
        if (newWidget.el) {
          const contentEl = newWidget.el.querySelector('.grid-stack-item-content')
          if (contentEl) {
            contentEl.innerHTML = createWidgetContent(`${type} 组件`, widgetCountRef.current)
          }
        }
        
        console.log('物料已拖入:', type, '位置:', newWidget.x, newWidget.y)
      })

      console.log('GridStack initialized:', grid)
      console.log('✅ 支持从物料面板拖动 React 组件！')
    }

    return () => {
      // 清理
      if (gridInstanceRef.current) {
        gridInstanceRef.current.destroy(false)
        gridInstanceRef.current = null
      }
    }
  }, [])

  const createWidgetContent = (title: string, id: number): string => {
    return `
      <div class="widget-content">
        <div class="widget-header">
          <span class="widget-title">${title}</span>
          <button class="widget-close" onclick="window.removeWidget(this)">×</button>
        </div>
        <div class="widget-body">
          内容 ${id}
        </div>
      </div>
    `
  }

  const addWidget = () => {
    if (gridInstanceRef.current) {
      widgetCountRef.current++
      gridInstanceRef.current.addWidget({
        w: 4,
        h: 2,
        content: createWidgetContent(`网格项 ${widgetCountRef.current}`, widgetCountRef.current)
      })
    }
  }

  const addRandomWidget = () => {
    if (gridInstanceRef.current) {
      widgetCountRef.current++
      gridInstanceRef.current.addWidget({
        w: Math.floor(Math.random() * 4) + 2,
        h: Math.floor(Math.random() * 3) + 1,
        content: createWidgetContent(`随机项 ${widgetCountRef.current}`, widgetCountRef.current)
      })
    }
  }

  const toggleFloat = () => {
    if (gridInstanceRef.current) {
      const newFloating = !isFloating
      setIsFloating(newFloating)
      gridInstanceRef.current.float(newFloating)
    }
  }

  const saveLayout = () => {
    if (gridInstanceRef.current) {
      const layout = gridInstanceRef.current.save()
      localStorage.setItem('reactGridLayout', JSON.stringify(layout))
      alert('布局已保存到 localStorage')
      console.log('Saved layout:', layout)
    }
  }

  const loadLayout = () => {
    const saved = localStorage.getItem('reactGridLayout')
    if (saved && gridInstanceRef.current) {
      try {
        const layout = JSON.parse(saved)
        gridInstanceRef.current.load(layout)
        alert('布局已加载')
      } catch (error) {
        alert('加载失败：布局数据格式错误')
      }
    } else {
      alert('没有保存的布局')
    }
  }

  const clearAll = () => {
    if (confirm('确定要清空所有网格项吗？') && gridInstanceRef.current) {
      gridInstanceRef.current.removeAll()
      widgetCountRef.current = 0
    }
  }

  // 全局删除函数
  useEffect(() => {
    (window as any).removeWidget = (button: HTMLElement) => {
      const item = button.closest('.grid-stack-item') as HTMLElement
      if (item && gridInstanceRef.current) {
        gridInstanceRef.current.removeWidget(item)
      }
    }
  }, [])

  return (
    <div className="container">
      <h1>🎯 GridStack React Demo</h1>
      
      <div className="controls">
        <button onClick={addWidget}>添加网格项</button>
        <button onClick={addRandomWidget}>添加随机项</button>
        <button onClick={toggleFloat}>切换浮动: {isFloating ? 'ON' : 'OFF'}</button>
        <button onClick={saveLayout}>保存布局</button>
        <button onClick={loadLayout}>加载布局</button>
        <button className="danger" onClick={clearAll}>清空所有</button>
      </div>

      <div ref={gridRef} className="grid-stack"></div>
    </div>
  )
}

export default App
