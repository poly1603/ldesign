import { useState, useEffect } from 'react'
import './App.css'

// 获取应用配置
const appConfig = (import.meta.env.appConfig as any) || {}

function App() {
  const [count, setCount] = useState(0)
  const [configUpdateTime, setConfigUpdateTime] = useState(Date.now())

  // 监听配置更新（用于测试热更新）
  useEffect(() => {
    const interval = setInterval(() => {
      if (appConfig.buildInfo?.buildTime) {
        setConfigUpdateTime(Date.now())
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>{appConfig.appName || 'LDesign Launcher'}</h1>
        <p>React + TypeScript 示例项目 v{appConfig.version || '1.0.0'}</p>
        
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            计数: {count}
          </button>
          <p>
            编辑 <code>src/App.tsx</code> 带<code>.ldesign/app.config.ts</code> 测试热更新
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
            <li>🔄 App Config 热更新</li>
          </ul>
        </div>

        <div className="app-config" style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: appConfig.ui?.primaryColor ? `${appConfig.ui.primaryColor}22` : '#00000022',
          borderRadius: '8px',
          border: `1px solid ${appConfig.ui?.primaryColor || '#007bff'}`,
          textAlign: 'left',
          fontSize: '0.9rem'
        }}>
          <h3>📄 应用配置 (import.meta.env.appConfig)</h3>
          <pre style={{ margin: 0, fontSize: '0.8rem' }}>
            {JSON.stringify(appConfig, null, 2)}
          </pre>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
            修改 .ldesign/app.config.ts 文件后保存，配置会自动热更新
          </p>
        </div>
      </header>
    </div>
  )
}

export default App
