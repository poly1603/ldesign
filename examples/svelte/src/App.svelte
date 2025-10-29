<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import {
    getEngine,
    createPluginStore,
    createEngineStateStore,
    createEngineStatusStore
  } from '@ldesign/engine-svelte'

  const engine = getEngine()
  const i18nPlugin = createPluginStore('i18n')
  const themePlugin = createPluginStore('theme')
  const sizePlugin = createPluginStore('size')
  
  // 使用引擎状态
  const count = createEngineStateStore<number>('app.count', 0)
  const locale = createEngineStateStore<string>('i18n.locale', 'en')
  const theme = createEngineStateStore<string>('theme.current', 'light')
  const size = createEngineStateStore<string>('size.current', 'medium')
  const status = createEngineStatusStore()
  
  let eventLog: string[] = []
  
  // 监听所有事件
  onMount(() => {
    const unsubscribe = engine.events.on('*', (data: any) => {
      const eventName = data.type || 'unknown'
      eventLog = [
        `[${new Date().toLocaleTimeString()}] ${eventName}`,
        ...eventLog.slice(0, 9) // 保留最近10条
      ]
    })
    
    return unsubscribe
  })
  
  // 翻译函数
  function t(key: string): string {
    if (!$i18nPlugin) return key
    return ($i18nPlugin as any).t(key)
  }
  
  // 切换主题
  function toggleTheme() {
    const newTheme = $theme === 'light' ? 'dark' : 'light'
    $themePlugin && ($themePlugin as any).setTheme(newTheme)
    $theme = newTheme
  }
  
  // 切换语言
  function toggleLocale() {
    const newLocale = $locale === 'en' ? 'zh' : 'en'
    $i18nPlugin && ($i18nPlugin as any).setLocale(newLocale)
    $locale = newLocale
  }
  
  // 切换尺寸
  function cycleSize() {
    const sizes = ['small', 'medium', 'large']
    const currentIndex = sizes.indexOf($size)
    const newSize = sizes[(currentIndex + 1) % sizes.length]
    $sizePlugin && ($sizePlugin as any).setSize(newSize)
    $size = newSize
  }
</script>

<div class="app" data-theme={$theme} data-size={$size}>
  <header class="app-header">
    <h1>{t('app.title')}</h1>
    <p>{t('app.description')}</p>
  </header>
  
  <main class="app-main">
    <section class="feature-section">
      <h2>{t('app.welcome')}</h2>
      
      <div class="controls">
        <button on:click={toggleTheme} class="btn btn-primary">
          {t('actions.switchTheme')} ({$theme})
        </button>
        
        <button on:click={toggleLocale} class="btn btn-primary">
          {t('actions.switchLocale')} ({$locale})
        </button>
        
        <button on:click={cycleSize} class="btn btn-primary">
          {t('actions.changeSize')} ({$size})
        </button>
      </div>
      
      <div class="counter">
        <p>Counter: {$count}</p>
        <button on:click={() => $count++} class="btn">+1</button>
        <button on:click={() => $count--} class="btn">-1</button>
        <button on:click={() => $count = 0} class="btn">Reset</button>
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
        {#if eventLog.length === 0}
          <p class="empty">No events yet...</p>
        {:else}
          <ul>
            {#each eventLog as log (log)}
              <li>{log}</li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>
    
    <section class="engine-info">
      <h3>Engine Info</h3>
      <pre>{JSON.stringify($status, null, 2)}</pre>
    </section>
  </main>
  
  <footer class="app-footer">
    <p>Powered by @ldesign/engine</p>
  </footer>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }
  
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
  }
  
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
  }

  .app[data-theme='light'] {
    background: var(--theme-background, #ffffff);
    color: var(--theme-text, #000000);
  }

  .app[data-theme='dark'] {
    background: var(--theme-background, #1f1f1f);
    color: var(--theme-text, #ffffff);
  }

  .app[data-size='small'] {
    font-size: calc(16px * 0.875);
  }

  .app[data-size='medium'] {
    font-size: 16px;
  }

  .app[data-size='large'] {
    font-size: calc(16px * 1.125);
  }

  .app-header {
    padding: 2rem;
    text-align: center;
    border-bottom: 1px solid var(--theme-primary, #1890ff);
  }

  .app-header h1 {
    margin: 0 0 0.5rem;
    color: var(--theme-primary, #1890ff);
  }

  .app-header p {
    margin: 0;
    opacity: 0.8;
  }

  .app-main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border-radius: 8px;
    background: var(--section-bg, rgba(0, 0, 0, 0.02));
  }

  .app[data-theme='dark'] section {
    background: rgba(255, 255, 255, 0.05);
  }

  h2, h3 {
    margin-top: 0;
  }

  .controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--theme-primary, #1890ff);
    background: transparent;
    color: var(--theme-text, #000000);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1em;
  }

  .btn:hover {
    background: var(--theme-primary, #1890ff);
    color: white;
  }

  .btn-primary {
    background: var(--theme-primary, #1890ff);
    color: white;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .counter {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .counter p {
    margin: 0;
    font-size: 1.2em;
    font-weight: bold;
  }

  .info-section ul {
    list-style: none;
    padding: 0;
  }

  .info-section li {
    padding: 0.5rem 0;
    font-size: 1.1em;
  }

  .event-log {
    max-height: 300px;
    overflow-y: auto;
    background: var(--log-bg, rgba(0, 0, 0, 0.05));
    padding: 1rem;
    border-radius: 4px;
  }

  .app[data-theme='dark'] .event-log {
    background: rgba(255, 255, 255, 0.03);
  }

  .event-log ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .event-log li {
    padding: 0.25rem 0;
    font-family: monospace;
    font-size: 0.9em;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  }

  .event-log .empty {
    text-align: center;
    opacity: 0.5;
    margin: 0;
  }

  .engine-info pre {
    background: var(--code-bg, rgba(0, 0, 0, 0.05));
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.9em;
  }

  .app[data-theme='dark'] .engine-info pre {
    background: rgba(255, 255, 255, 0.03);
  }

  .app-footer {
    padding: 1rem;
    text-align: center;
    border-top: 1px solid var(--theme-primary, #1890ff);
    opacity: 0.7;
  }

  .app-footer p {
    margin: 0;
  }
</style>
