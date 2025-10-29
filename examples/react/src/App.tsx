import { useState } from 'react'
import {
  useEngine,
  useEngineState,
  useEngineEvent,
  usePlugin
} from '@ldesign/engine-react'
import './App.css'

function App() {
  const engine = useEngine()
  const i18nPlugin = usePlugin('i18n')
  const themePlugin = usePlugin('theme')
  const sizePlugin = usePlugin('size')
  
  // 使用引擎状态
  const [count, setCount] = useEngineState<number>('app.count', 0)
  const [locale, setLocale] = useEngineState<string>('i18n.locale', 'en')
  const [theme, setTheme] = useEngineState<string>('theme.current', 'light')
  const [size, setSize] = useEngineState<string>('size.current', 'medium')
  
  const [eventLog, setEventLog] = useState<string[]>([])
  
  // 监听所有事件
  useEngineEvent('*', (data) => {
    const eventName = data.type || 'unknown'
    setEventLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${eventName}`,
      ...prev.slice(0, 9) // 保留最近10条
    ])
  })
  
  // 翻译函数
  const t = (key: string) => {
    if (!i18nPlugin) return key
    return (i18nPlugin as any).t(key)
  }
  
  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    themePlugin && (themePlugin as any).setTheme(newTheme)
    setTheme(newTheme)
  }
  
  // 切换语言
  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en'
    i18nPlugin && (i18nPlugin as any).setLocale(newLocale)
    setLocale(newLocale)
  }
  
  // 切换尺寸
  const cycleSize = () => {
    const sizes = ['small', 'medium', 'large']
    const currentIndex = sizes.indexOf(size)
    const newSize = sizes[(currentIndex + 1) % sizes.length]
    sizePlugin && (sizePlugin as any).setSize(newSize)
    setSize(newSize)
  }
  
  return (
    <div className="app" data-theme={theme} data-size={size}>
      <header className="app-header">
        <h1>{t('app.title')}</h1>
        <p>{t('app.description')}</p>
      </header>
      
      <main className="app-main">
        <section className="feature-section">
          <h2>{t('app.welcome')}</h2>
          
          <div className="controls">
            <button onClick={toggleTheme} className="btn btn-primary">
              {t('actions.switchTheme')} ({theme})
            </button>
            
            <button onClick={toggleLocale} className="btn btn-primary">
              {t('actions.switchLocale')} ({locale})
            </button>
            
            <button onClick={cycleSize} className="btn btn-primary">
              {t('actions.changeSize')} ({size})
            </button>
          </div>
          
          <div className="counter">
            <p>Counter: {count}</p>
            <button onClick={() => setCount(count + 1)} className="btn">
              +1
            </button>
            <button onClick={() => setCount(count - 1)} className="btn">
              -1
            </button>
            <button onClick={() => setCount(0)} className="btn">
              Reset
            </button>
          </div>
        </section>
        
        <section className="info-section">
          <h3>Features</h3>
          <ul>
            <li>✅ {t('features.i18n')}</li>
            <li>✅ {t('features.theme')}</li>
            <li>✅ {t('features.size')}</li>
            <li>✅ {t('features.state')}</li>
            <li>✅ {t('features.events')}</li>
          </ul>
        </section>
        
        <section className="event-log-section">
          <h3>Event Log</h3>
          <div className="event-log">
            {eventLog.length === 0 ? (
              <p className="empty">No events yet...</p>
            ) : (
              <ul>
                {eventLog.map((log, index) => (
                  <li key={index}>{log}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
        
        <section className="engine-info">
          <h3>Engine Info</h3>
          <pre>{JSON.stringify(engine.getStatus(), null, 2)}</pre>
        </section>
      </main>
      
      <footer className="app-footer">
        <p>Powered by @ldesign/engine</p>
      </footer>
    </div>
  )
}

export default App
