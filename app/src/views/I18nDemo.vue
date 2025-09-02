<!--
  I18n 功能演示页面
  
  展示 @ldesign/i18n 的所有 Vue 组件和功能
-->

<template>
  <div class="i18n-demo">
    <div class="demo-header">
      <h1>{{ t('demo.title') }}</h1>
      <p>{{ t('demo.description') }}</p>
      
      <!-- 语言切换器 -->
      <div class="language-switcher-section">
        <h3>{{ t('demo.languageSwitcher') }}</h3>
        
        <!-- 下拉选择器模式 -->
        <div class="switcher-demo">
          <h4>{{ t('demo.dropdownMode') }}</h4>
          <LanguageSwitcher type="dropdown" show-flag />
        </div>
        
        <!-- 标签页模式 -->
        <div class="switcher-demo">
          <h4>{{ t('demo.tabsMode') }}</h4>
          <LanguageSwitcher type="tabs" show-flag />
        </div>
        
        <!-- 按钮组模式 -->
        <div class="switcher-demo">
          <h4>{{ t('demo.buttonsMode') }}</h4>
          <LanguageSwitcher type="buttons" show-flag />
        </div>
        
        <!-- 链接模式 -->
        <div class="switcher-demo">
          <h4>{{ t('demo.linksMode') }}</h4>
          <LanguageSwitcher type="links" show-flag />
        </div>
      </div>
    </div>

    <div class="demo-content">
      <!-- 基础翻译组件 -->
      <section class="demo-section">
        <h2>{{ t('demo.basicTranslation') }}</h2>
        
        <div class="demo-item">
          <h3>{{ t('demo.i18nTComponent') }}</h3>
          <div class="demo-example">
            <I18nT keypath="demo.welcome" :params="{ name: 'Vue' }" />
          </div>
          <div class="demo-code">
            <code>&lt;I18nT keypath="demo.welcome" :params="{ name: 'Vue' }" /&gt;</code>
          </div>
        </div>
        
        <div class="demo-item">
          <h3>{{ t('demo.withDifferentTags') }}</h3>
          <div class="demo-example">
            <I18nT keypath="demo.important" tag="strong" />
            <br>
            <I18nT keypath="demo.subtitle" tag="h4" />
          </div>
        </div>
      </section>

      <!-- 数字格式化组件 -->
      <section class="demo-section">
        <h2>{{ t('demo.numberFormatting') }}</h2>
        
        <div class="demo-item">
          <h3>{{ t('demo.basicNumber') }}</h3>
          <div class="demo-example">
            <I18nN :value="1234.56" />
          </div>
        </div>
        
        <div class="demo-item">
          <h3>{{ t('demo.currency') }}</h3>
          <div class="demo-example">
            <I18nN :value="1234.56" format="currency" currency="USD" />
            <br>
            <I18nN :value="9999.99" format="currency" currency="CNY" />
          </div>
        </div>
        
        <div class="demo-item">
          <h3>{{ t('demo.percentage') }}</h3>
          <div class="demo-example">
            <I18nN :value="0.85" format="percent" />
          </div>
        </div>
      </section>

      <!-- 日期格式化组件 -->
      <section class="demo-section">
        <h2>{{ t('demo.dateFormatting') }}</h2>
        
        <div class="demo-item">
          <h3>{{ t('demo.basicDate') }}</h3>
          <div class="demo-example">
            <I18nD :value="new Date()" />
          </div>
        </div>
        
        <div class="demo-item">
          <h3>{{ t('demo.longDate') }}</h3>
          <div class="demo-example">
            <I18nD :value="new Date()" format="long" />
          </div>
        </div>
        
        <div class="demo-item">
          <h3>{{ t('demo.shortDate') }}</h3>
          <div class="demo-example">
            <I18nD :value="new Date()" format="short" />
          </div>
        </div>
        
        <div class="demo-item">
          <h3>{{ t('demo.relativeDate') }}</h3>
          <div class="demo-example">
            <I18nD :value="new Date(Date.now() - 2 * 60 * 60 * 1000)" format="relative" />
          </div>
        </div>
      </section>

      <!-- 指令演示 -->
      <section class="demo-section">
        <h2>{{ t('demo.directives') }}</h2>
        
        <div class="demo-item">
          <h3>{{ t('demo.vTDirective') }}</h3>
          <div class="demo-example">
            <button v-t="'demo.clickMe'"></button>
            <span v-t="{ key: 'demo.welcome', params: { name: 'Directive' } }"></span>
          </div>
        </div>
        
        <div class="demo-item">
          <h3>{{ t('demo.vTTitleDirective') }}</h3>
          <div class="demo-example">
            <button v-t-title="'demo.tooltip'">{{ t('demo.hoverMe') }}</button>
          </div>
        </div>
      </section>

      <!-- 翻译提供者演示 -->
      <section class="demo-section">
        <h2>{{ t('demo.translationProvider') }}</h2>
        
        <TranslationProvider namespace="user" v-slot="{ t: scopedT }">
          <div class="demo-item">
            <h3>{{ t('demo.scopedTranslation') }}</h3>
            <div class="demo-example">
              <p>{{ scopedT('name') }}</p>
              <p>{{ scopedT('email') }}</p>
              <p>{{ scopedT('profile') }}</p>
            </div>
          </div>
        </TranslationProvider>
      </section>

      <!-- 状态信息 -->
      <section class="demo-section">
        <h2>{{ t('demo.status') }}</h2>
        
        <div class="demo-item">
          <div class="status-grid">
            <div class="status-card">
              <h4>{{ t('demo.currentLanguage') }}</h4>
              <p>{{ locale }}</p>
            </div>
            
            <div class="status-card">
              <h4>{{ t('demo.availableLanguages') }}</h4>
              <p>{{ availableLocales.join(', ') }}</p>
            </div>
            
            <div class="status-card">
              <h4>{{ t('demo.cacheStatus') }}</h4>
              <p>{{ t('demo.enabled') }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import {
  LanguageSwitcher,
  I18nT,
  I18nN,
  I18nD,
  TranslationProvider
} from '@ldesign/i18n/vue'

// 使用 I18n 组合式 API
const { t, locale, availableLocales } = useI18n()
</script>

<script lang="ts">
export default {
  name: 'I18nDemo'
}
</script>

<style scoped>
.i18n-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.language-switcher-section {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.switcher-demo {
  margin: 15px 0;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.switcher-demo h4 {
  margin-bottom: 10px;
  color: #495057;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.demo-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.demo-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.demo-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.demo-item h3 {
  color: #495057;
  margin-bottom: 10px;
}

.demo-example {
  margin: 10px 0;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #3498db;
}

.demo-code {
  margin-top: 10px;
  padding: 8px;
  background: #2c3e50;
  color: #ecf0f1;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.status-card {
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  text-align: center;
}

.status-card h4 {
  color: #495057;
  margin-bottom: 8px;
}

.status-card p {
  color: #3498db;
  font-weight: 500;
}

button {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

button:hover {
  background: #2980b9;
}
</style>
