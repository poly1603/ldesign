<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { useColorPlugin } from '@ldesign/color/plugin/useColorPlugin'
import { useSize } from '@ldesign/size/vue'
import ThemePicker from '@ldesign/color/vue/ThemePicker.vue'
import SizeSelector from '@ldesign/size/vue/SizeSelector.vue'

// 使用 i18n
const { t, locale } = useI18n()

// 获取 engine 实例
const instance = getCurrentInstance()
const app = instance?.appContext?.app

// 获取当前语言
const currentLocale = computed(() => {
  if (app?.config?.globalProperties?.$getLocale) {
    return app.config.globalProperties.$getLocale()
  }
  return locale.value
})

// 切换语言
const toggleLanguage = () => {
  const newLocale = currentLocale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  
  // 通过 engine.state 设置全局语言
  if ((window as any).__ENGINE__?.state) {
    (window as any).__ENGINE__.state.set('locale', newLocale)
  } else if (app?.config?.globalProperties?.$setLocale) {
    // 备用：使用全局方法
    app.config.globalProperties.$setLocale(newLocale)
  } else {
    // 最后备用：直接更新 vue-i18n
    locale.value = newLocale
  }
}

// 使用 color 和 size 插件
const colorPlugin = useColorPlugin()
const { manager: sizeManager } = useSize()

// 测试数据
const testItems = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
])
</script>

<template>
  <div class="i18n-test-container">
    <div class="header">
      <h1>{{ t('i18n.title') }}</h1>
      <div class="language-switcher">
        <button @click="toggleLanguage" class="language-btn">
          <span>🌐</span>
          <span>{{ currentLocale === 'zh-CN' ? '中文' : 'English' }}</span>
        </button>
        <span class="current-locale">当前语言: {{ currentLocale }}</span>
      </div>
    </div>

    <div class="content">
      <!-- 主题选择器 -->
      <section class="section">
        <h2>{{ t('color.title') }}</h2>
        <ThemePicker />
        <div class="info" v-if="colorPlugin">
          <p>当前主题: {{ colorPlugin.getCurrentTheme()?.themeName || 'default' }}</p>
          <p>主题语言: {{ colorPlugin.currentLocale.value }}</p>
        </div>
      </section>

      <!-- 尺寸选择器 -->
      <section class="section">
        <h2>{{ t('size.title') }}</h2>
        <SizeSelector />
        <div class="info" v-if="sizeManager">
          <p>当前尺寸: {{ sizeManager.getCurrentSize() }}</p>
        </div>
      </section>

      <!-- 测试列表 -->
      <section class="section">
        <h2>{{ t('home.welcome') }}</h2>
        <ul class="test-list">
          <li v-for="item in testItems" :key="item.id">
            {{ item.name }} - {{ currentLocale }}
          </li>
        </ul>
      </section>

      <!-- 调试信息 -->
      <section class="section debug">
        <h2>调试信息</h2>
        <div class="debug-info">
          <p><strong>Vue I18n Locale:</strong> {{ locale }}</p>
          <p><strong>Engine Locale:</strong> {{ currentLocale }}</p>
          <p v-if="colorPlugin">
            <strong>Color Plugin Locale:</strong> {{ colorPlugin.currentLocale.value }}
          </p>
          <p><strong>Engine Available:</strong> {{ !!app?.config?.globalProperties?.$setLocale }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="less">
.i18n-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--ld-color-gray-200);

  h1 {
    margin: 0;
    color: var(--ld-color-primary-600);
  }
}

.language-switcher {
  display: flex;
  align-items: center;
  gap: 20px;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--ld-color-primary-500);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: var(--ld-color-primary-600);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.current-locale {
  color: var(--ld-color-gray-600);
  font-size: 14px;
}

.content {
  display: grid;
  gap: 30px;
}

.section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 20px 0;
    color: var(--ld-color-gray-800);
    font-size: 18px;
  }

  &.debug {
    background: var(--ld-color-gray-50);
  }
}

.info {
  margin-top: 20px;
  padding: 15px;
  background: var(--ld-color-gray-50);
  border-radius: 6px;

  p {
    margin: 8px 0;
    color: var(--ld-color-gray-700);
    font-size: 14px;
  }
}

.test-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 10px;
    margin: 5px 0;
    background: var(--ld-color-gray-50);
    border-radius: 4px;
    color: var(--ld-color-gray-700);
  }
}

.debug-info {
  font-family: 'Courier New', monospace;
  font-size: 13px;

  p {
    margin: 8px 0;
    
    strong {
      color: var(--ld-color-primary-600);
    }
  }
}
</style>