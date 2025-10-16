<template>
  <div class="i18n-test-page">
    <!-- 头部 -->
    <header class="header">
      <h1>{{ t('i18n.test.title', '国际化测试页面') }}</h1>
      <p>{{ t('i18n.test.desc', '测试 Color 和 Size 包的响应式语言切换') }}</p>
    </header>

    <!-- 语言切换控制 -->
    <div class="language-control">
      <h2>{{ t('i18n.test.language', '语言切换') }}</h2>
      <div class="button-group">
        <button 
          v-for="locale in locales" 
          :key="locale.value"
          :class="{ active: currentLocale === locale.value }"
          @click="changeLocale(locale.value)"
        >
          {{ locale.label }}
        </button>
      </div>
      <p class="current-locale">
        {{ t('i18n.test.currentLocale', '当前语言') }}: <code>{{ currentLocale }}</code>
      </p>
    </div>

    <!-- 组件展示区域 -->
    <div class="components-showcase">
      <!-- 主题选择器 -->
      <div class="component-card">
        <h3>{{ t('i18n.test.themePicker', '主题选择器') }}</h3>
        <p class="hint">{{ t('i18n.test.themePickerHint', '点击下面的组件，查看语言是否自动切换') }}</p>
        <ThemePicker 
          showCustom
          showSearch
          showAddCustomTheme
        />
      </div>

      <!-- 主题模式切换器 -->
      <div class="component-card">
        <h3>{{ t('i18n.test.themeMode', '主题模式') }}</h3>
        <p class="hint">{{ t('i18n.test.themeModeHint', '浅色/深色/跟随系统') }}</p>
        <VueThemeModeSwitcher />
      </div>

      <!-- 尺寸选择器 -->
      <div class="component-card">
        <h3>{{ t('i18n.test.sizeSelector', '尺寸选择器') }}</h3>
        <p class="hint">{{ t('i18n.test.sizeSelectorHint', '紧凑/舒适/默认/宽松') }}</p>
        <SizeSelector />
      </div>
    </div>

    <!-- 状态监控 -->
    <div class="status-monitor">
      <h2>{{ t('i18n.test.status', '状态监控') }}</h2>
      <div class="status-grid">
        <div class="status-item">
          <span class="label">{{ t('i18n.test.language', '语言') }}:</span>
          <span class="value">{{ currentLocale }}</span>
        </div>
        <div class="status-item">
          <span class="label">{{ t('i18n.test.theme', '主题') }}:</span>
          <span class="value">{{ currentTheme }}</span>
        </div>
        <div class="status-item">
          <span class="label">{{ t('i18n.test.size', '尺寸') }}:</span>
          <span class="value">{{ currentSize }}</span>
        </div>
        <div class="status-item">
          <span class="label">{{ t('i18n.test.mode', '模式') }}:</span>
          <span class="value">{{ isDarkMode ? 'Dark' : 'Light' }}</span>
        </div>
      </div>
    </div>

    <!-- 测试列表 -->
    <div class="test-checklist">
      <h2>{{ t('i18n.test.checklist', '测试清单') }}</h2>
      <ul>
        <li>✓ {{ t('i18n.test.check1', '点击 "English" 按钮') }}</li>
        <li>✓ {{ t('i18n.test.check2', 'ThemePicker 应显示 "Select Theme Color"') }}</li>
        <li>✓ {{ t('i18n.test.check3', 'SizeSelector 应显示 "Adjust Size"') }}</li>
        <li>✓ {{ t('i18n.test.check4', 'VueThemeModeSwitcher 应显示 "Light/Dark/Follow System"') }}</li>
        <li>✓ {{ t('i18n.test.check5', '点击 "中文" 按钮，所有组件应切换回中文') }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useI18n } from '../composables/useI18n'
import ThemePicker from '@ldesign/color/vue/ThemePicker'
import VueThemeModeSwitcher from '@ldesign/color/vue/VueThemeModeSwitcher'
import SizeSelector from '@ldesign/size/vue/SizeSelector'

// 使用 i18n
const { t, locale: i18nLocale, changeLocale: changeI18nLocale } = useI18n()

// 获取全局 locale
const globalLocale = inject<any>('app-locale')
const currentLocale = computed(() => globalLocale?.value || i18nLocale.value)

// 可用语言列表
const locales = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
]

// 当前状态
const currentTheme = ref('blue')
const currentSize = ref('default')
const isDarkMode = ref(false)

// 切换语言
const changeLocale = async (locale: string) => {
  console.log('切换语言到:', locale)
  
  // 切换 i18n 语言
  await changeI18nLocale(locale)
  
  // 更新全局 locale（这会触发 color 和 size 组件更新）
  if (globalLocale) {
    globalLocale.value = locale
  }
  
  // 触发全局语言变化回调
  const onLocaleChange = (window as any).__ENGINE__?.app?.config?.globalProperties?.$onLocaleChange
  if (onLocaleChange) {
    onLocaleChange(locale)
  }
  
  console.log('语言切换完成:', locale)
}

// 监听主题变化
onMounted(() => {
  // 获取 color 插件实例
  const colorPlugin = (window as any).__ENGINE__?.app?.config?.globalProperties?.$color
  if (colorPlugin) {
    const theme = colorPlugin.getCurrentTheme()
    if (theme) {
      currentTheme.value = theme.themeName || 'custom'
    }
    
    colorPlugin.onChange((theme: any) => {
      currentTheme.value = theme.themeName || 'custom'
    })
  }
  
  // 获取 size 管理器
  const sizeManager = (window as any).__ENGINE__?.app?.config?.globalProperties?.$sizeManager
  if (sizeManager) {
    currentSize.value = sizeManager.getCurrentPreset() || 'default'
    
    // 监听尺寸变化
    const observer = new MutationObserver(() => {
      const newSize = sizeManager.getCurrentPreset()
      if (newSize) {
        currentSize.value = newSize
      }
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })
  }
  
  // 监听暗色模式
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.getAttribute('theme-mode') === 'dark'
  }
  checkDarkMode()
  
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['theme-mode', 'data-theme-mode', 'class']
  })
})
</script>

<style scoped>
.i18n-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.language-control {
  max-width: 600px;
  margin: 0 auto 2rem;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.language-control h2 {
  margin-bottom: 1rem;
  color: #333;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.button-group button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
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

.current-locale {
  text-align: center;
  color: #666;
}

.current-locale code {
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #667eea;
  font-family: monospace;
}

.components-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.component-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.component-card h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.hint {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.status-monitor {
  max-width: 800px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.status-monitor h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.status-item .label {
  color: #666;
  font-weight: 500;
}

.status-item .value {
  color: #667eea;
  font-weight: 600;
  font-family: monospace;
}

.test-checklist {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.test-checklist h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.test-checklist ul {
  list-style: none;
  padding: 0;
}

.test-checklist li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
  font-size: 0.95rem;
}

.test-checklist li:last-child {
  border-bottom: none;
}
</style>