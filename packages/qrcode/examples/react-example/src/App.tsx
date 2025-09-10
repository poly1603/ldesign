/**
 * React + TypeScript 示例应用主组件
 * 展示 @ldesign/qrcode 在 React 环境中的完整功能
 */

import React, { useState } from 'react'
import BasicExample from './pages/BasicExample'
import AdvancedExample from './pages/AdvancedExample'
import StyleExample from './pages/StyleExample'
import DataTypeExample from './pages/DataTypeExample'
import PerformanceExample from './pages/PerformanceExample'

// 标签配置
const tabs = [
  { id: 'basic', label: '基础示例', component: BasicExample },
  { id: 'advanced', label: '高级功能', component: AdvancedExample },
  { id: 'style', label: '样式定制', component: StyleExample },
  { id: 'datatype', label: '数据类型', component: DataTypeExample },
  { id: 'performance', label: '性能测试', component: PerformanceExample }
]

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic')

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || BasicExample

  return (
    <div id="app">
      {/* 页面头部 */}
      <header className="header">
        <div className="container">
          <h1 className="title">@ldesign/qrcode React 示例</h1>
          <p className="subtitle">展示二维码生成库在 React + TypeScript 环境中的完整功能</p>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="main">
        <div className="container">
          {/* 导航标签 */}
          <nav className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* 标签内容 */}
          <div className="tab-content">
            <ActiveComponent />
          </div>
        </div>
      </main>

      {/* 页面底部 */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 LDesign Team. 基于 @ldesign/qrcode v1.0.0</p>
        </div>
      </footer>
    </div>
  )
}

export default App
