<template>
  <div class="app">
    <!-- 头部 -->
    <header class="app-header">
      <h1>{{ t('app.title') }}</h1>
      <p>{{ t('app.description') }}</p>
    </header>

    <!-- 控制面板 -->
    <div class="controls">
      <!-- 语言切换 -->
      <div class="control-group">
        <label>{{ t('app.language') }}:</label>
        <div class="button-group">
          <button 
            :class="{ active: currentLocale === 'zh-CN' }"
            @click="changeLocale('zh-CN')"
          >
            中文
          </button>
          <button 
            :class="{ active: currentLocale === 'en-US' }"
            @click="changeLocale('en-US')"
          >
            English
          </button>
        </div>
      </div>

      <!-- 主题选择器（自动响应语言） -->
      <div class="control-group">
        <label>{{ t('app.theme') }}:</label>
        <ThemePicker 
          showCustom
          showSearch
          showAddCustomTheme
        />
      </div>

      <!-- 尺寸选择器（自动响应语言） -->
      <div class="control-group">
        <label>{{ t('app.size') }}:</label>
        <SizeSelector />
      </div>
    </div>

    <!-- 演示内容 -->
    <main class="main-content">
      <div class="card">
        <h2>{{ t('app.welcome') }}</h2>
        <p>{{ t('app.description') }}</p>
        
        <div class="demo-text">
          <h3>{{ t('buttons.switchLang') }}</h3>
          <div class="button-group">
            <button>{{ t('buttons.save') }}</button>
            <button>{{ t('buttons.cancel') }}</button>
            <button>{{ t('buttons.reset') }}</button>
          </div>
        </div>
      </div>

      <!-- 状态显示 -->
      <div class="status-panel">
        <h3>{{ t('app.settings') }}</h3>
        <div class="status-item">
          <span>{{ t('app.language') }}:</span>
          <code>{{ currentLocale }}</code>
        </div>
        <div class="status-item">
          <span>{{ t('app.theme') }}:</span>
          <code>{{ currentTheme }}</code>
        </div>
        <div class="status-item">
          <span>{{ t('app.size') }}:</span>
          <code>{{ currentSize }}</code>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, watch } from 'vue'
import { useI18n } from '@ldesign/i18n/adapters/vue'
import ThemePicker from '@ldesign/color/vue/ThemePicker'
import SizeSelector from '@ldesign/size/vue/SizeSelector'

// 使用 i18n
const { t } = useI18n()

// 获取 engine 实例
const engine = inject<any>('engine')

// 当前语言（响应式）
const appLocale = inject<any>('app-locale', null)
const currentLocale = computed(() => appLocale?.value || 'zh-CN')

// 当前主题
const currentTheme = ref('blue')
const currentSize = ref('default')

// 监听主题变化
if (engine?.color) {
  engine.color.onChange((theme: any) => {
    currentTheme.value = theme.themeName || 'custom'
  })
}

// 监听尺寸变化
watch(() => engine?.size?.getCurrentPreset(), (newSize) => {
  if (newSize) currentSize.value = newSize
}, { immediate: true })

// 切换语言
const changeLocale = async (locale: string) => {
  try {
    await engine?.i18n?.setLocale(locale)
    console.log('✓ 语言切换成功:', locale)
  } catch (error) {
    console.error('✗ 语言切换失败:', error)
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.app-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.app-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.controls {
  max-width: 800px;
  margin: 0 auto 2rem;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.control-group {
  margin-bottom: 1.5rem;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.button-group button {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.button-group button:hover {
  border-color: #667eea;
  color: #667eea;
}

.button-group button.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.card h2 {
  color: #667eea;
  margin-bottom: 1rem;
}

.demo-text {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.demo-text h3 {
  margin-bottom: 1rem;
  color: #333;
}

.status-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.status-panel h3 {
  color: #667eea;
  margin-bottom: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-item span {
  font-weight: 500;
  color: #666;
}

.status-item code {
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  color: #667eea;
  font-size: 0.9rem;
}
</style>
