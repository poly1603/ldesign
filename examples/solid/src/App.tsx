import { Component, createSignal, For, Show } from 'solid-js'
import {
  getEngine,
  usePlugin,
  useEngineState,
  useEngineEvent,
  useEngineStatus
} from '@ldesign/engine-solid'
import './App.css'

const App: Component = () => {
  const engine = getEngine()
  const i18nPlugin = usePlugin('i18n')
  const themePlugin = usePlugin('theme')
  const sizePlugin = usePlugin('size')
  
  const [count, setCount] = useEngineState<number>('app.count', 0)
  const [locale, setLocale] = useEngineState<string>('i18n.locale', 'en')
  const [theme, setTheme] = useEngineState<string>('theme.current', 'light')
  const [size, setSize] = useEngineState<string>('size.current', 'medium')
  const status = useEngineStatus()
  
  const [eventLog, setEventLog] = createSignal<string[]>([])
  
  // 监听所有事件
  useEngineEvent('*', (data: any) => {
    const eventName = data.type || 'unknown'
    setEventLog(prev => [
      `[${new Date().toLocaleTimeString()}] ${eventName}`,
      ...prev.slice(0, 9)
    ])
  })
  
  const t = (key: string): string => {
    const plugin = i18nPlugin()
    if (!plugin) return key
    return (plugin as any).t(key)
  }
  
  const toggleTheme = () => {
    const newTheme = theme() === 'light' ? 'dark' : 'light'
    const plugin = themePlugin()
    plugin && (plugin as any).setTheme(newTheme)
    setTheme(newTheme)
  }
  
  const toggleLocale = () => {
    const newLocale = locale() === 'en' ? 'zh' : 'en'
    const plugin = i18nPlugin()
    plugin && (plugin as any).setLocale(newLocale)
    setLocale(newLocale)
  }
  
  const cycleSize = () => {
    const sizes = ['small', 'medium', 'large']
    const currentIndex = sizes.indexOf(size())
    const newSize = sizes[(currentIndex + 1) % sizes.length]
    const plugin = sizePlugin()
    plugin && (plugin as any).setSize(newSize)
    setSize(newSize)
  }
  
  return (
    <div class="app" data-theme={theme()} data-size={size()}>
      <header class="app-header">
        <h1>{t('app.title')}</h1>
        <p>{t('app.description')}</p>
      </header>
      
      <main class="app-main">
        <section class="feature-section">
          <h2>{t('app.welcome')}</h2>
          
          <div class="controls">
            <button onClick={toggleTheme} class="btn btn-primary">
              {t('actions.switchTheme')} ({theme()})
            </button>
            
            <button onClick={toggleLocale} class="btn btn-primary">
              {t('actions.switchLocale')} ({locale()})
            </button>
            
            <button onClick={cycleSize} class="btn btn-primary">
              {t('actions.changeSize')} ({size()})
            </button>
          </div>
          
          <div class="counter">
            <p>Counter: {count()}</p>
            <button onClick={() => setCount(count() + 1)} class="btn">+1</button>
            <button onClick={() => setCount(count() - 1)} class="btn">-1</button>
            <button onClick={() => setCount(0)} class="btn">Reset</button>
          </div>
        </section>
        
        <section class="info-section">
          <h3>Features</h3>
          <ul>
            <li>✅ {t('features.i18n')}</li>
            <li>✅ {t('features.theme')}</li>
            <li>✅ {t('features.size')}</li>
            <li>✅ {t('features.state')}</li>
            <li>✅ {t('features.events')}</li>
          </ul>
        </section>
        
        <section class="event-log-section">
          <h3>Event Log</h3>
          <div class="event-log">
            <Show when={eventLog().length === 0} fallback={
              <ul>
                <For each={eventLog()}>{(log) => <li>{log}</li>}</For>
              </ul>
            }>
              <p class="empty">No events yet...</p>
            </Show>
          </div>
        </section>
        
        <section class="engine-info">
          <h3>Engine Info</h3>
          <pre>{JSON.stringify(status(), null, 2)}</pre>
        </section>
      </main>
      
      <footer class="app-footer">
        <p>Powered by @ldesign/engine</p>
      </footer>
    </div>
  )
}

export default App
