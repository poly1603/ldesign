<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <h1>@ldesign/i18n</h1>
      <p>Vue 3 Example</p>
      
      <!-- Language Switcher -->
      <div class="language-switcher">
        <button
          :class="['lang-btn', { active: 'en' === locale }]"
          :disabled="isChanging"
          @click="handleLanguageSwitch('en')"
        >
          English
          <span v-if="isChanging && 'en' === locale" class="loading-spinner"></span>
        </button>
        <button
          :class="['lang-btn', { active: 'zh-CN' === locale }]"
          :disabled="isChanging"
          @click="handleLanguageSwitch('zh-CN')"
        >
          中文
          <span v-if="isChanging && 'zh-CN' === locale" class="loading-spinner"></span>
        </button>
        <button
          :class="['lang-btn', { active: 'ja' === locale }]"
          :disabled="isChanging"
          @click="handleLanguageSwitch('ja')"
        >
          日本語
          <span v-if="isChanging && 'ja' === locale" class="loading-spinner"></span>
        </button>
      </div>
      
      <!-- Current Language Display -->
      <div class="current-language">
        Current Language: {{ currentLanguageInfo?.nativeName }} ({{ locale }})
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Translation Keys Section -->
      <div class="translation-keys">
        <h2>Translation Keys</h2>
        <div class="keys-container">
          <div 
            v-for="(keys, category) in translationKeysByCategory" 
            :key="category"
            class="key-category"
          >
            <div 
              class="category-header"
              @click="toggleCategory(category)"
            >
              {{ category.toUpperCase() }} ({{ keys.length }} keys)
              <span>{{ expandedCategories[category] ? '▼' : '▶' }}</span>
            </div>
            <div 
              v-show="expandedCategories[category]"
              class="category-content"
            >
              <div 
                v-for="key in keys" 
                :key="key"
                class="key-item"
              >
                <span class="key-name">{{ key }}</span>
                <span class="key-value">{{ getTranslationValue(key) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Examples Section -->
      <div class="usage-examples">
        <h2>Usage Examples</h2>
        
        <!-- Basic Translation -->
        <div class="example-section">
          <div class="example-header">Basic Translation</div>
          <div class="example-content">
            <div class="example-item">
              <div class="code-block">t('common.ok')</div>
              <div class="result-block">{{ t('common.ok') }}</div>
            </div>
            <div class="example-item">
              <div class="code-block">t('common.cancel')</div>
              <div class="result-block">{{ t('common.cancel') }}</div>
            </div>
            <div class="example-item">
              <div class="code-block">t('common.loading')</div>
              <div class="result-block">{{ t('common.loading') }}</div>
            </div>
          </div>
        </div>

        <!-- Parameter Interpolation -->
        <div class="example-section">
          <div class="example-header">Parameter Interpolation</div>
          <div class="example-content">
            <div class="example-item">
              <div class="code-block">t('common.pageOf', { current: 1, total: 10 })</div>
              <div class="result-block">{{ t('common.pageOf', { current: 1, total: 10 }) }}</div>
            </div>
            <div class="example-item">
              <div class="code-block">t('common.showingItems', { start: 1, end: 20, total: 100 })</div>
              <div class="result-block">{{ t('common.showingItems', { start: 1, end: 20, total: 100 }) }}</div>
            </div>
          </div>
        </div>

        <!-- Pluralization -->
        <div class="example-section">
          <div class="example-header">Pluralization</div>
          <div class="example-content">
            <div class="example-item">
              <div class="code-block">t('date.duration.minutes', { count: 1 })</div>
              <div class="result-block">{{ t('date.duration.minutes', { count: 1 }) }}</div>
            </div>
            <div class="example-item">
              <div class="code-block">t('date.duration.minutes', { count: 5 })</div>
              <div class="result-block">{{ t('date.duration.minutes', { count: 5 }) }}</div>
            </div>
          </div>
        </div>

        <!-- Vue Directive -->
        <div class="example-section">
          <div class="example-header">Vue v-t Directive</div>
          <div class="example-content">
            <div class="example-item">
              <div class="code-block">&lt;div v-t="'common.save'"&gt;&lt;/div&gt;</div>
              <div class="result-block" v-t="'common.save'"></div>
            </div>
            <div class="example-item">
              <div class="code-block">&lt;input v-t="{ key: 'common.searchPlaceholder' }" /&gt;</div>
              <input v-t="{ key: 'common.searchPlaceholder' }" class="input-example" />
            </div>
          </div>
        </div>

        <!-- Nested Keys -->
        <div class="example-section">
          <div class="example-header">Nested Keys</div>
          <div class="example-content">
            <div class="example-item">
              <div class="code-block">t('menu.file.new')</div>
              <div class="result-block">{{ t('menu.file.new') }}</div>
            </div>
            <div class="example-item">
              <div class="code-block">t('menu.edit.copy')</div>
              <div class="result-block">{{ t('menu.edit.copy') }}</div>
            </div>
            <div class="example-item">
              <div class="code-block">t('validation.username.required')</div>
              <div class="result-block">{{ t('validation.username.required') }}</div>
            </div>
          </div>
        </div>

        <!-- Batch Translation -->
        <div class="example-section">
          <div class="example-header">Batch Translation</div>
          <div class="example-content">
            <div class="example-item">
              <div class="code-block">batchTranslations</div>
              <div class="result-block">
                <pre>{{ JSON.stringify(batchTranslations, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Conditional Translation -->
        <div class="example-section">
          <div class="example-header">Conditional Translation</div>
          <div class="example-content">
            <div class="example-item">
              <label class="checkbox-label">
                <input v-model="isOnline" type="checkbox" />
                {{ t('common.online') }} / {{ t('common.offline') }}
              </label>
              <div class="result-block">
                Status: {{ conditionalStatus }}
              </div>
            </div>
          </div>
        </div>

        <!-- Language Information -->
        <div class="example-section">
          <div class="example-header">Language Information</div>
          <div class="example-content">
            <div class="example-item">
              <div class="code-block">getCurrentLanguageInfo()</div>
              <div class="result-block">
                <pre>{{ JSON.stringify(currentLanguageInfo, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  useI18n,
  useLanguageSwitcher,
  useBatchTranslation,
  useConditionalTranslation
} from '../../es/vue/index.js'

// 使用 I18n 组合式 API
const { t, i18n } = useI18n()
const { locale, availableLanguages, isChanging, switchLanguage } = useLanguageSwitcher()

// 添加语言切换的调试信息
const handleLanguageSwitch = async (lang: string) => {
  console.log('Switching to language:', lang)
  try {
    await switchLanguage(lang)
    console.log('Language switched successfully to:', lang)
  } catch (error) {
    console.error('Failed to switch language:', error)
  }
}

// 错误状态
const error = ref<string>('')

// 当前语言信息
const currentLanguageInfo = computed(() => i18n.getCurrentLanguageInfo())

// 批量翻译示例
const batchTranslations = useBatchTranslation([
  'common.save',
  'common.delete',
  'common.edit'
])

// 条件翻译示例
const isOnline = ref(true)
const conditionalStatus = useConditionalTranslation(
  isOnline,
  'common.online',
  'common.offline'
)

// 翻译键分类展开状态
const expandedCategories = reactive({
  common: true,
  menu: false,
  validation: false,
  date: false
})

// 按分类组织的翻译键
const translationKeysByCategory = computed(() => {
  const categories: Record<string, string[]> = {
    common: [],
    menu: [],
    validation: [],
    date: []
  }

  try {
    // 手动定义所有可用的翻译键
    const allKeys = [
      // Common keys
      'common.ok',
      'common.cancel',
      'common.save',
      'common.delete',
      'common.edit',
      'common.loading',
      'common.online',
      'common.offline',
      'common.searchPlaceholder',
      'common.pageOf',
      'common.showingItems',

      // Menu keys
      'menu.file.new',
      'menu.file.open',
      'menu.file.save',
      'menu.edit.copy',
      'menu.edit.paste',
      'menu.edit.cut',

      // Validation keys
      'validation.username.required',
      'validation.password.required',
      'validation.email.invalid',

      // Date keys
      'date.duration.minutes',
      'date.duration.hours',
      'date.duration.days'
    ]

    allKeys.forEach(key => {
      const category = key.split('.')[0]
      if (categories[category]) {
        categories[category].push(key)
      }
    })
  } catch (error) {
    console.error('Error getting translation keys:', error)
  }

  return categories
})

// 切换分类展开状态
const toggleCategory = (category: string) => {
  expandedCategories[category] = !expandedCategories[category]
}

// 获取翻译值
const getTranslationValue = (key: string) => {
  try {
    const translation = t(key)
    return translation === key ? '[Missing]' : translation
  } catch (error) {
    return '[Error]'
  }
}

// 组件挂载时的初始化
onMounted(() => {
  console.log('Vue I18n example mounted')
  console.log('Current locale:', locale.value)
  console.log('Available languages:', availableLanguages.value)
  console.log('I18n instance:', i18n)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
  padding: 20px;
}

/* Header Styles */
.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 3em;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  color: #666;
  font-size: 1.3em;
  margin-bottom: 30px;
}

/* Language Switcher */
.language-switcher {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.lang-btn {
  padding: 15px 30px;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 600;
  min-width: 140px;
  position: relative;
  overflow: hidden;
}

.lang-btn:hover:not(:disabled) {
  background: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.lang-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.lang-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.lang-btn.active:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.current-language {
  font-size: 18px;
  color: #667eea;
  font-weight: 600;
  margin-top: 15px;
}

/* Main Content Layout */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

/* Translation Keys Section */
.translation-keys {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.translation-keys h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 2em;
  text-align: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.key-category {
  margin-bottom: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.category-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 15px 20px;
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-header:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
}

.category-content {
  background: white;
  max-height: 300px;
  overflow-y: auto;
}

.key-item {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.key-item:last-child {
  border-bottom: none;
}

.key-item:hover {
  background: #f8f9ff;
}

.key-name {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  flex: 1;
  margin-right: 15px;
}

.key-value {
  color: #333;
  font-weight: 500;
  flex: 2;
  text-align: right;
}

/* Usage Examples Section */
.usage-examples {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.usage-examples h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 2em;
  text-align: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.example-section {
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.example-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 15px 20px;
  font-weight: 600;
  font-size: 1.1em;
}

.example-content {
  background: white;
  padding: 20px;
}

.example-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9ff;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.example-item:last-child {
  margin-bottom: 0;
}

.code-block {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
}

.result-block {
  font-weight: 600;
  color: #667eea;
  font-size: 16px;
  padding: 10px 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.result-block pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
}

.input-example {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  max-width: 300px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

/* Error Handling */
.error {
  color: #dc3545;
  background: #f8d7da;
  padding: 15px 20px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #f5c6cb;
  border-left: 4px solid #dc3545;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .app {
    padding: 10px;
  }

  .header h1 {
    font-size: 2.2em;
  }

  .language-switcher {
    flex-direction: column;
    align-items: center;
  }

  .lang-btn {
    width: 100%;
    max-width: 250px;
  }
}

/* Scrollbar Styling */
.category-content::-webkit-scrollbar {
  width: 6px;
}

.category-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.category-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.category-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
