import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>LDesign Launcher</h1>
        <p>React + TypeScript 示例项目</p>
        
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            计数: {count}
          </button>
          <p>
            编辑 <code>src/App.tsx</code> 并保存来测试热更新
          </p>
        </div>
        
        <div className="features">
          <h2>✨ 特性展示</h2>
          <ul>
            <li>🚀 快速热更新</li>
            <li>📦 TypeScript 支持</li>
            <li>🎨 CSS 模块化</li>
            <li>⚡ ESBuild 打包</li>
            <li>🔧 智能插件系统</li>
          </ul>
        </div>
      </header>
    </div>
  )
}

export default App
