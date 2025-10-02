<template>
  <div class="ai-settings-page">
    <div class="page-header">
      <h1>🤖 AI 设置</h1>
      <p>配置 DeepSeek AI 服务的相关参数</p>
    </div>

    <div class="settings-container">
      <!-- 配置表单 -->
      <div class="settings-form">
        <div class="form-section">
          <h3>🔑 API 配置</h3>
          
          <div class="form-item">
            <label for="apiKey">
              <span class="label-text">API 密钥 *</span>
              <span class="label-hint">您的 DeepSeek API Key</span>
            </label>
            <div class="input-wrapper">
              <input
                id="apiKey"
                v-model="formData.apiKey"
                :type="showApiKey ? 'text' : 'password'"
                placeholder="sk-..."
                class="form-input"
                :class="{ error: errors.apiKey }"
              />
              <button
                type="button"
                class="toggle-visibility"
                @click="showApiKey = !showApiKey"
              >
                {{ showApiKey ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="errors.apiKey" class="error-message">{{ errors.apiKey }}</span>
            <span class="help-text">
              获取密钥: <a href="https://platform.deepseek.com/api_keys" target="_blank">DeepSeek Platform</a>
            </span>
          </div>

          <div class="form-item">
            <label for="baseUrl">
              <span class="label-text">API 地址</span>
              <span class="label-hint">DeepSeek API 的基础 URL</span>
            </label>
            <input
              id="baseUrl"
              v-model="formData.baseUrl"
              type="text"
              placeholder="https://api.deepseek.com/v1"
              class="form-input"
            />
          </div>

          <div class="form-item">
            <label for="model">
              <span class="label-text">模型</span>
              <span class="label-hint">使用的 AI 模型</span>
            </label>
            <select id="model" v-model="formData.model" class="form-input">
              <option value="deepseek-chat">deepseek-chat</option>
              <option value="deepseek-coder">deepseek-coder</option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>⚙️ 高级设置</h3>
          
          <div class="form-item">
            <label for="timeout">
              <span class="label-text">超时时间（毫秒）</span>
              <span class="label-hint">API 请求的超时时间</span>
            </label>
            <input
              id="timeout"
              v-model.number="formData.timeout"
              type="number"
              min="1000"
              max="300000"
              step="1000"
              class="form-input"
            />
          </div>

          <div class="form-item">
            <label for="maxRetries">
              <span class="label-text">最大重试次数</span>
              <span class="label-hint">请求失败时的重试次数</span>
            </label>
            <input
              id="maxRetries"
              v-model.number="formData.maxRetries"
              type="number"
              min="0"
              max="10"
              class="form-input"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="saving"
            @click="handleSave"
          >
            {{ saving ? '保存中...' : '💾 保存配置' }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="handleTest"
            :disabled="testing || !isConfigValid"
          >
            {{ testing ? '测试中...' : '🧪 测试连接' }}
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="handleClear"
          >
            🗑️ 清除配置
          </button>
        </div>
      </div>

      <!-- 当前配置状态 -->
      <div class="config-status">
        <h3>📊 配置状态</h3>
        
        <div class="status-item">
          <span class="status-label">配置状态:</span>
          <span class="status-value" :class="statusClass">
            {{ configStatus }}
          </span>
        </div>

        <div class="status-item">
          <span class="status-label">API 密钥:</span>
          <span class="status-value">
            {{ currentConfig?.apiKey ? '已配置 ✅' : '未配置 ❌' }}
          </span>
        </div>

        <div class="status-item">
          <span class="status-label">模型:</span>
          <span class="status-value">{{ currentConfig?.model || '-' }}</span>
        </div>

        <div class="status-item">
          <span class="status-label">超时时间:</span>
          <span class="status-value">{{ currentConfig?.timeout || '-' }} ms</span>
        </div>

        <!-- 测试结果 -->
        <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
          <h4>{{ testResult.success ? '✅ 测试成功' : '❌ 测试失败' }}</h4>
          <p>{{ testResult.message }}</p>
          <pre v-if="testResult.response">{{ testResult.response }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AIConfig } from '../ai/types'
import { getAIConfig, saveAIConfig, clearAIConfig, validateApiKey, isConfigValid } from '../ai/config'
import { createDeepSeekClient } from '../ai/deepseek-client'

// 表单数据
const formData = ref<Partial<AIConfig>>({
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  timeout: 60000,
  maxRetries: 3
})

// 当前配置
const currentConfig = ref<AIConfig | null>(null)

// UI 状态
const showApiKey = ref(false)
const saving = ref(false)
const testing = ref(false)
const errors = ref<Record<string, string>>({})
const testResult = ref<{
  success: boolean
  message: string
  response?: string
} | null>(null)

// 计算属性
const configStatus = computed(() => {
  if (!currentConfig.value || !currentConfig.value.apiKey) {
    return '未配置'
  }
  return '已配置'
})

const statusClass = computed(() => {
  return currentConfig.value?.apiKey ? 'configured' : 'not-configured'
})

const isConfigValidComputed = computed(() => {
  return isConfigValid(currentConfig.value)
})

// 方法
const loadConfig = () => {
  const config = getAIConfig()
  if (config) {
    currentConfig.value = config
    formData.value = { ...config }
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  
  const apiKeyValidation = validateApiKey(formData.value.apiKey || '')
  if (!apiKeyValidation.valid) {
    errors.value.apiKey = apiKeyValidation.message || 'API 密钥无效'
    return false
  }
  
  return true
}

const handleSave = async () => {
  testResult.value = null
  
  if (!validateForm()) {
    return
  }
  
  saving.value = true
  
  try {
    const success = saveAIConfig(formData.value)
    if (success) {
      loadConfig()
      alert('✅ 配置已保存成功！')
    } else {
      alert('❌ 保存配置失败，请重试')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    alert('❌ 保存配置时出错')
  } finally {
    saving.value = false
  }
}

const handleTest = async () => {
  if (!validateForm()) {
    return
  }
  
  testing.value = true
  testResult.value = null
  
  try {
    // 使用表单数据创建临时客户端
    const client = createDeepSeekClient(formData.value as AIConfig)
    
    // 发送测试请求
    const response = await client.chat('你好，请回复"连接成功"')
    
    testResult.value = {
      success: true,
      message: 'API 连接测试成功！',
      response: response.substring(0, 200) + (response.length > 200 ? '...' : '')
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: `连接测试失败: ${error.message}`
    }
  } finally {
    testing.value = false
  }
}

const handleClear = () => {
  if (confirm('确定要清除所有 AI 配置吗？此操作不可恢复。')) {
    clearAIConfig()
    formData.value = {
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      timeout: 60000,
      maxRetries: 3
    }
    currentConfig.value = null
    testResult.value = null
    alert('🗑️ 配置已清除')
  }
}

// 生命周期
onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="less">
.ai-settings-page {
  padding: var(--ls-padding-base);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: var(--ls-margin-xl);

  h1 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-base);
  }
}

.settings-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--ls-spacing-xl);

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.settings-form,
.config-status {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-base);
  box-shadow: var(--ldesign-shadow-1);
  padding: var(--ls-padding-lg);
}

.form-section {
  margin-bottom: var(--ls-margin-xl);

  h3 {
    margin: 0 0 var(--ls-margin-base) 0;
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-lg);
    border-bottom: 2px solid var(--ldesign-border-level-1-color);
    padding-bottom: var(--ls-padding-sm);
  }
}

.form-item {
  margin-bottom: var(--ls-margin-lg);

  label {
    display: block;
    margin-bottom: var(--ls-margin-xs);

    .label-text {
      display: block;
      font-weight: 500;
      color: var(--ldesign-text-color-primary);
      margin-bottom: 4px;
    }

    .label-hint {
      display: block;
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-secondary);
    }
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .form-input {
    width: 100%;
    padding: var(--ls-padding-sm) var(--ls-padding-base);
    border: 1px solid var(--ldesign-border-level-2-color);
    border-radius: var(--ls-border-radius-base);
    background: var(--ldesign-bg-color-component);
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-base);
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--ldesign-brand-color);
      box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
    }

    &.error {
      border-color: var(--ldesign-error-color);
    }
  }

  .toggle-visibility {
    position: absolute;
    right: 8px;
    padding: 4px 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 18px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.7;
    }
  }

  .error-message {
    display: block;
    margin-top: 4px;
    color: var(--ldesign-error-color);
    font-size: var(--ls-font-size-xs);
  }

  .help-text {
    display: block;
    margin-top: 4px;
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);

    a {
      color: var(--ldesign-brand-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.form-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-level-1-color);
}

.btn {
  padding: var(--ls-padding-sm) var(--ls-padding-lg);
  border: none;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: var(--ldesign-brand-color);
  color: white;

  &:hover:not(:disabled) {
    background: var(--ldesign-brand-color-hover);
  }
}

.btn-secondary {
  background: var(--ldesign-success-color);
  color: white;

  &:hover:not(:disabled) {
    background: var(--ldesign-success-color-hover);
  }
}

.btn-danger {
  background: var(--ldesign-error-color);
  color: white;

  &:hover:not(:disabled) {
    background: var(--ldesign-error-color-hover);
  }
}

.config-status {
  h3 {
    margin: 0 0 var(--ls-margin-base) 0;
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-lg);
  }
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: var(--ls-padding-sm) 0;
  border-bottom: 1px solid var(--ldesign-border-level-1-color);

  .status-label {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
  }

  .status-value {
    font-weight: 500;
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-sm);

    &.configured {
      color: var(--ldesign-success-color);
    }

    &.not-configured {
      color: var(--ldesign-error-color);
    }
  }
}

.test-result {
  margin-top: var(--ls-margin-lg);
  padding: var(--ls-padding-base);
  border-radius: var(--ls-border-radius-base);

  &.success {
    background: var(--ldesign-success-color-1);
    border: 1px solid var(--ldesign-success-color-3);
  }

  &.error {
    background: var(--ldesign-error-color-1);
    border: 1px solid var(--ldesign-error-color-3);
  }

  h4 {
    margin: 0 0 var(--ls-margin-xs) 0;
  }

  p {
    margin: 0;
    font-size: var(--ls-font-size-sm);
  }

  pre {
    margin-top: var(--ls-margin-sm);
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-sm);
    font-size: var(--ls-font-size-xs);
    overflow-x: auto;
  }
}
</style>
