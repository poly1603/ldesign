<!--
  App 配置编辑器
  
  用于编辑 app.config.ts 配置文件
  
  @author LDesign Team
  @since 1.0.0
-->

<template>
  <div class="app-config-editor">
    <div class="editor-container">
      <div class="config-form">
        <h3>App 配置</h3>
        
        <!-- API 配置 -->
        <div class="config-section">
          <h4>API 配置</h4>
          <div class="form-group">
            <label class="form-label">基础 URL</label>
            <input 
              v-model="localConfig.api.baseURL"
              type="text"
              class="form-input"
              placeholder="请输入 API 基础 URL"
              @input="handleConfigChange"
            />
            <div class="form-help">API 请求的基础地址</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">超时时间（毫秒）</label>
            <input 
              v-model.number="localConfig.api.timeout"
              type="number"
              class="form-input"
              placeholder="请输入超时时间"
              @input="handleConfigChange"
            />
            <div class="form-help">API 请求的超时时间</div>
          </div>
        </div>
        
        <!-- 主题配置 -->
        <div class="config-section">
          <h4>主题配置</h4>
          <div class="form-group">
            <label class="form-label">默认主题</label>
            <select 
              v-model="localConfig.theme.default"
              class="form-select"
              @change="handleConfigChange"
            >
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
              <option value="auto">跟随系统</option>
            </select>
            <div class="form-help">应用的默认主题模式</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">主色调</label>
            <input 
              v-model="localConfig.theme.primaryColor"
              type="color"
              class="form-input color-input"
              @input="handleConfigChange"
            />
            <div class="form-help">应用的主色调</div>
          </div>
        </div>
        
        <!-- 国际化配置 -->
        <div class="config-section">
          <h4>国际化配置</h4>
          <div class="form-group">
            <label class="form-label">默认语言</label>
            <select 
              v-model="localConfig.i18n.defaultLocale"
              class="form-select"
              @change="handleConfigChange"
            >
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
            <div class="form-help">应用的默认语言</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <input 
                v-model="localConfig.i18n.fallbackLocale"
                type="checkbox"
                @change="handleConfigChange"
              />
              启用回退语言
            </label>
            <div class="form-help">当前语言缺失时是否使用回退语言</div>
          </div>
        </div>
        
        <!-- 功能配置 -->
        <div class="config-section">
          <h4>功能配置</h4>
          <div class="form-group">
            <label class="form-label">
              <input 
                v-model="localConfig.features.enablePWA"
                type="checkbox"
                @change="handleConfigChange"
              />
              启用 PWA
            </label>
            <div class="form-help">是否启用渐进式 Web 应用功能</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <input 
                v-model="localConfig.features.enableAnalytics"
                type="checkbox"
                @change="handleConfigChange"
              />
              启用数据分析
            </label>
            <div class="form-help">是否启用用户行为分析</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <input 
                v-model="localConfig.features.enableErrorReporting"
                type="checkbox"
                @change="handleConfigChange"
              />
              启用错误报告
            </label>
            <div class="form-help">是否启用自动错误报告</div>
          </div>
        </div>
      </div>
      
      <!-- 预览区域 -->
      <div class="config-preview">
        <h3>配置预览</h3>
        <pre class="config-code"><code>{{ configPreview }}</code></pre>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="editor-actions">
      <button 
        class="btn btn-secondary"
        @click="resetConfig"
        :disabled="!hasChanges"
      >
        重置
      </button>
      <button 
        class="btn btn-primary"
        @click="saveConfig"
        :disabled="!hasChanges"
      >
        保存配置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useConfigStore } from '../stores/config'
import type { AppConfig } from '../types/config'
import { DEFAULT_APP_CONFIG } from '../constants/defaults'

// 状态管理
const configStore = useConfigStore()

// 本地配置状态
const localConfig = ref<AppConfig>({ ...DEFAULT_APP_CONFIG })

// 计算属性
const hasChanges = computed(() => {
  const original = configStore.appConfig
  if (!original) return false
  return JSON.stringify(localConfig.value) !== JSON.stringify(original)
})

const configPreview = computed(() => {
  return JSON.stringify(localConfig.value, null, 2)
})

// 方法
const handleConfigChange = () => {
  // 更新 store 中的配置
  configStore.updateConfig('app', localConfig.value)
}

const resetConfig = () => {
  if (configStore.appConfig) {
    localConfig.value = { ...configStore.appConfig }
  } else {
    localConfig.value = { ...DEFAULT_APP_CONFIG }
  }
}

const saveConfig = async () => {
  try {
    await configStore.saveConfig('app')
    // 保存成功后的处理
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

// 监听 store 中的配置变化
watch(
  () => configStore.appConfig,
  (newConfig) => {
    if (newConfig) {
      localConfig.value = { ...newConfig }
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  // 组件挂载时初始化配置
  if (configStore.appConfig) {
    localConfig.value = { ...configStore.appConfig }
  }
})
</script>

<style lang="less" scoped>
.app-config-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  display: flex;
  gap: 24px;
  overflow: hidden;
}

.config-form {
  flex: 1;
  overflow-y: auto;
  .scrollbar();
  
  h3 {
    margin: 0 0 24px 0;
    font-size: 18px;
    font-weight: 600;
    color: @text-color-primary;
  }
}

.config-section {
  .card();
  margin-bottom: 24px;
  
  h4 {
    .card-header();
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .form-group {
    .form-group();
    padding: 0 20px;
    
    &:first-child {
      padding-top: 20px;
    }
    
    &:last-child {
      padding-bottom: 20px;
    }
  }
}

.form-label {
  .form-label();
  display: flex;
  align-items: center;
  gap: 8px;
  
  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }
}

.form-input,
.form-select {
  .input-base();
  
  &.color-input {
    width: 60px;
    height: 40px;
    padding: 4px;
    cursor: pointer;
  }
}

.form-help {
  .form-help();
}

.config-preview {
  width: 400px;
  .card();
  display: flex;
  flex-direction: column;
  
  h3 {
    .card-header();
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .config-code {
    .card-content();
    flex: 1;
    margin: 0;
    background-color: var(--ldesign-bg-color-component-hover);
    border-radius: var(--ls-border-radius-base);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.4;
    overflow: auto;
    .scrollbar();
    
    code {
      background: none;
      padding: 0;
      color: @text-color-primary;
    }
  }
}

.editor-actions {
  padding: 20px 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid @border-color;
}

.btn {
  .button-base();
  padding: 8px 16px;
  font-size: 14px;
  
  &.btn-primary {
    .button-primary();
  }
  
  &.btn-secondary {
    .button-secondary();
  }
}
</style>
