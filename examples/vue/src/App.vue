<template>
  <div class="app-container">
    <header class="app-header">
      <h1>{{ t('app.title') }}</h1>
      <p>{{ t('app.description') }}</p>
    </header>

    <main class="app-main">
      <section class="welcome-section">
        <h2>{{ t('app.welcome') }}</h2>
      </section>

      <section class="features-section">
        <h3>{{ t('features.i18n') }}</h3>
        <div class="feature-card">
          <p>Current Locale: <strong>{{ locale }}</strong></p>
          <button @click="switchLocale" class="btn">
            {{ t('actions.switchLocale') }}
          </button>
        </div>

        <h3>{{ t('features.theme') }}</h3>
        <div class="feature-card">
          <p>Current Theme: <strong>{{ theme }}</strong></p>
          <button @click="switchTheme" class="btn">
            {{ t('actions.switchTheme') }}
          </button>
        </div>

        <h3>{{ t('features.size') }}</h3>
        <div class="feature-card">
          <p>Current Size: <strong>{{ size }}</strong></p>
          <div class="size-buttons">
            <button @click="changeSize('small')" class="btn btn-sm">Small</button>
            <button @click="changeSize('medium')" class="btn btn-md">Medium</button>
            <button @click="changeSize('large')" class="btn btn-lg">Large</button>
          </div>
        </div>

        <h3>{{ t('features.state') }}</h3>
        <div class="feature-card">
          <p>Engine Status: <strong>{{ t(`status.${status}`) }}</strong></p>
        </div>

        <h3>{{ t('features.events') }}</h3>
        <div class="feature-card">
          <div class="event-log">
            <div v-for="(event, index) in eventLog" :key="index" class="event-item">
              {{ event }}
            </div>
            <div v-if="eventLog.length === 0" class="event-empty">
              No events yet...
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>Powered by @ldesign/engine</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useEngine, useEnginePlugin, useEngineEvent } from '@ldesign/engine-vue'

const engine = useEngine()
const i18nPlugin = useEnginePlugin('i18n')
const themePlugin = useEnginePlugin('theme')
const sizePlugin = useEnginePlugin('size')

// State
const locale = ref('en')
const theme = ref('light')
const size = ref('medium')
const status = ref('initialized')
const eventLog = ref<string[]>([])

// Watch plugin changes
watchEffect(() => {
  if (i18nPlugin.value?.api) {
    locale.value = i18nPlugin.value.api.getLocale()
  }
})

watchEffect(() => {
  if (themePlugin.value?.api) {
    theme.value = themePlugin.value.api.getTheme()
    applyTheme()
  }
})

watchEffect(() => {
  if (sizePlugin.value?.api) {
    size.value = sizePlugin.value.api.getSize()
  }
})

watchEffect(() => {
  if (engine.value) {
    const engineStatus = engine.value.getStatus()
    status.value = engineStatus.status || 'initialized'
  }
})

// Listen to all events
useEngineEvent('*', (event) => {
  eventLog.value.unshift(`[${event.type}] ${JSON.stringify(event.payload)}`)
  if (eventLog.value.length > 10) {
    eventLog.value = eventLog.value.slice(0, 10)
  }
})

// Actions
function switchTheme() {
  if (themePlugin.value?.api) {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    themePlugin.value.api.setTheme(newTheme)
  }
}

function switchLocale() {
  if (i18nPlugin.value?.api) {
    const newLocale = locale.value === 'en' ? 'zh' : 'en'
    i18nPlugin.value.api.setLocale(newLocale)
  }
}

function changeSize(newSize: string) {
  if (sizePlugin.value?.api) {
    sizePlugin.value.api.setSize(newSize)
  }
}

function applyTheme() {
  if (themePlugin.value?.api) {
    const currentTheme = themePlugin.value.api.getCurrentTheme()
    document.documentElement.style.setProperty('--primary-color', currentTheme.colors.primary)
    document.documentElement.style.setProperty('--bg-color', currentTheme.colors.background)
    document.documentElement.style.setProperty('--text-color', currentTheme.colors.text)
  }
}

function t(key: string): string {
  if (!i18nPlugin.value?.api) return key
  const keys = key.split('.')
  let value: any = i18nPlugin.value.api.messages[locale.value]
  for (const k of keys) {
    value = value?.[k]
  }
  return value || key
}
</script>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.app-header p {
  font-size: 1.1rem;
  opacity: 0.8;
}

.app-main {
  margin-bottom: 3rem;
}

.welcome-section {
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  margin-bottom: 2rem;
}

.welcome-section h2 {
  margin: 0;
  font-size: 2rem;
}

.features-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.features-section h3 {
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.feature-card {
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid var(--primary-color);
  background: var(--bg-color);
}

.feature-card p {
  margin-bottom: 1rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  background: var(--primary-color);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.8;
}

.size-buttons {
  display: flex;
  gap: 1rem;
}

.btn-sm {
  font-size: 0.875rem;
}

.btn-md {
  font-size: 1rem;
}

.btn-lg {
  font-size: 1.125rem;
}

.event-log {
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  font-family: monospace;
  font-size: 0.875rem;
}

.event-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-left: 3px solid var(--primary-color);
  background: var(--bg-color);
}

.event-empty {
  text-align: center;
  opacity: 0.5;
  padding: 2rem;
}

.app-footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid var(--primary-color);
  opacity: 0.6;
}
</style>
