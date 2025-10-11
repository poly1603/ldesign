import React from 'react'
import './Materials.css'

interface Material {
  type: string
  name: string
  icon: string
  width: number
  height: number
  component: string
}

const materials: Material[] = [
  { type: 'chart', name: '图表组件', icon: '📊', width: 6, height: 4, component: 'ChartWidget' },
  { type: 'table', name: '表格组件', icon: '📋', width: 8, height: 4, component: 'TableWidget' },
  { type: 'form', name: '表单组件', icon: '📝', width: 6, height: 5, component: 'FormWidget' },
  { type: 'card', name: '卡片组件', icon: '🎴', width: 4, height: 3, component: 'CardWidget' },
  { type: 'stats', name: '统计组件', icon: '📈', width: 3, height: 2, component: 'StatsWidget' },
  { type: 'calendar', name: '日历组件', icon: '📅', width: 6, height: 5, component: 'CalendarWidget' }
]

const Materials: React.FC = () => {
  return (
    <div className="materials-panel">
      <h3>📦 物料组件库 - 拖动 React 组件到网格</h3>
      <div className="materials-list">
        {materials.map((material) => (
          <div
            key={material.type}
            className="material-item"
            data-type={material.type}
            gs-w={material.width}
            gs-h={material.height}
            draggable="true"
          >
            <span className="material-icon">{material.icon}</span>
            <span className="material-name">{material.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Materials
