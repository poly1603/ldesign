import React, { useState } from 'react'
import { useGridStack } from '@ldesign/gridstack/react'
import type { GridItemOptions } from '@ldesign/gridstack/react'

interface WidgetItem extends GridItemOptions {
  id: string
  title: string
  content: string
}

const HookExample: React.FC = () => {
  const {
    gridRef,
    isReady,
    addWidget,
    removeAll,
    compact,
    enable,
    disable,
    save
  } = useGridStack({
    column: 12,
    cellHeight: 70,
    animate: true
  })

  const [items, setItems] = useState<WidgetItem[]>([
    { id: '1', x: 0, y: 0, w: 3, h: 2, title: 'Hook 1', content: 'Hook Widget 1' },
    { id: '2', x: 3, y: 0, w: 3, h: 2, title: 'Hook 2', content: 'Hook Widget 2' },
    { id: '3', x: 6, y: 0, w: 3, h: 2, title: 'Hook 3', content: 'Hook Widget 3' },
    { id: '4', x: 9, y: 0, w: 3, h: 2, title: 'Hook 4', content: 'Hook Widget 4' }
  ])

  let widgetIdCounter = 5

  const handleAddWidget = () => {
    const newItem: WidgetItem = {
      id: String(widgetIdCounter++),
      w: 4,
      h: 2,
      title: `Hook ${widgetIdCounter - 1}`,
      content: `Hook Widget ${widgetIdCounter - 1}`
    }

    const el = document.createElement('div')
    el.className = 'grid-stack-item'
    el.setAttribute('gs-w', String(newItem.w))
    el.setAttribute('gs-h', String(newItem.h))
    el.innerHTML = `
      <div class="grid-stack-item-content">
        <div class="widget-content">
          <div class="widget-header">
            <span class="widget-title">${newItem.title}</span>
            <button class="widget-close" data-id="${newItem.id}">×</button>
          </div>
          <div class="widget-body">${newItem.content}</div>
        </div>
      </div>
    `

    addWidget({
      w: newItem.w,
      h: newItem.h,
      content: el.innerHTML
    })

    setItems([...items, newItem])
  }

  const handleRemoveWidget = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleCompact = () => {
    compact()
  }

  const handleEnable = () => {
    enable()
  }

  const handleDisable = () => {
    disable()
  }

  const handleSaveLayout = () => {
    const layout = save()
    localStorage.setItem('reactHookLayout', JSON.stringify(layout))
    alert('Hook 布局���保存')
    console.log('Hook layout:', layout)
  }

  const handleClearAll = () => {
    if (window.confirm('确定要清空所有网格项吗？')) {
      removeAll()
      setItems([])
    }
  }

  // 处理删除按钮点击
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('widget-close')) {
      const id = target.getAttribute('data-id')
      if (id) {
        handleRemoveWidget(id)
      }
    }
  }

  return (
    <div>
      <div className="example-info">
        使用 useGridStack Hook，更灵活的编程方式
      </div>

      <div className="controls">
        <button onClick={handleAddWidget} disabled={!isReady}>
          添加网格项
        </button>
        <button onClick={handleCompact}>紧凑布局</button>
        <button onClick={handleEnable}>启用</button>
        <button onClick={handleDisable}>禁用</button>
        <button onClick={handleSaveLayout}>保存布局</button>
        <button className="danger" onClick={handleClearAll}>
          清空
        </button>
      </div>

      <div ref={gridRef} className="grid-stack" onClick={handleClick}>
        {items.map(item => (
          <div
            key={item.id}
            className="grid-stack-item"
            gs-x={item.x}
            gs-y={item.y}
            gs-w={item.w}
            gs-h={item.h}
          >
            <div className="grid-stack-item-content">
              <div className="widget-content">
                <div className="widget-header">
                  <span className="widget-title">{item.title}</span>
                  <button
                    className="widget-close"
                    data-id={item.id}
                    onClick={() => handleRemoveWidget(item.id)}
                  >
                    ×
                  </button>
                </div>
                <div className="widget-body">{item.content}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isReady && <div style={{ padding: '20px', textAlign: 'center' }}>初始化中...</div>}
    </div>
  )
}

export default HookExample
