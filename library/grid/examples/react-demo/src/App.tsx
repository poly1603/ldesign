import React, { useState } from 'react'
import ComponentExample from './components/ComponentExample'
import HookExample from './components/HookExample'

type TabType = 'component' | 'hook'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('component')

  return (
    <div className="container">
      <h1>🎯 GridStack React Demo</h1>

      <div className="tabs">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'component' ? 'active' : ''}`}
            onClick={() => setActiveTab('component')}
          >
            组件用法
          </button>
          <button
            className={`tab-button ${activeTab === 'hook' ? 'active' : ''}`}
            onClick={() => setActiveTab('hook')}
          >
            Hook 用法
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'component' && <ComponentExample />}
          {activeTab === 'hook' && <HookExample />}
        </div>
      </div>
    </div>
  )
}

export default App
