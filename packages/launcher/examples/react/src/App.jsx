import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const increment = () => setCount(count + 1)
  const decrement = () => setCount(count - 1)

  return (
    <div id="app">
      <header className="header">
        <h1>React 示例项目</h1>
        <p className="subtitle">使用 @ldesign/launcher 构建</p>
      </header>

      <main className="main">
        <section className="counter-section">
          <h2>交互式计数器</h2>
          <div className="counter">
            <button onClick={decrement} className="btn btn-secondary">-</button>
            <span className="count">{count}</span>
            <button onClick={increment} className="btn btn-primary">+</button>
          </div>
          <p className="counter-info">点击按钮来增减计数</p>
        </section>

        <section className="features">
          <h2>React 特性</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🎣 Hooks</h3>
              <p>强大的状态管理和副作用处理</p>
            </div>
            <div className="feature-card">
              <h3>🔄 Virtual DOM</h3>
              <p>高效的 DOM 更新机制</p>
            </div>
            <div className="feature-card">
              <h3>🧩 组件化</h3>
              <p>可复用的 UI 组件</p>
            </div>
            <div className="feature-card">
              <h3>🚀 生态丰富</h3>
              <p>庞大的社区和工具链</p>
            </div>
          </div>
        </section>

        <section className="launcher-info">
          <h2>@ldesign/launcher</h2>
          <p>这个项目使用 <strong>@ldesign/launcher</strong> 构建和开发</p>
          <div className="commands">
            <code>npm run dev</code> - 启动开发服务器<br/>
            <code>npm run build</code> - 构建项目<br/>
            <code>npm run preview</code> - 预览构建结果
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built with ❤️ using React + @ldesign/launcher</p>
      </footer>
    </div>
  )
}

export default App
