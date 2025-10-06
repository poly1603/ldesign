<template>
  <div class="settings">
    <div class="page-header">
      <h1>设置</h1>
    </div>

    <!-- 标签页导航 -->
    <div class="tabs-nav">
      <button 
        :class="['tab-button', { active: activeTab === 'system' }]"
        @click="switchTab('system')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m6-12h-6m6 0h6m-6 6h6m-6 6h6M1 12h6m6 0H1m6-6H1m6 6H1"></path>
        </svg>
        <span>系统设置</span>
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'ai' }]"
        @click="switchTab('ai')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>AI 设置</span>
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'verdaccio' }]"
        @click="switchTab('verdaccio')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2v20M2 12h20"></path>
        </svg>
        <span>NPM 服务器</span>
      </button>
    </div>

    <!-- 系统设置标签页 -->
    <div v-show="activeTab === 'system'" class="tab-content">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载配置中...</p>
      </div>

      <div v-else class="settings-content">
      <!-- 服务器配置 -->
      <div class="settings-section">
        <h2>服务器配置</h2>
        <div class="settings-form">
          <div class="form-item">
            <label for="defaultPort">默认端口</label>
            <input id="defaultPort" v-model.number="formData.defaultPort" type="number" min="1" max="65535"
              placeholder="3000" />
            <p class="form-hint">服务器启动时使用的默认端口（1-65535）</p>
          </div>

          <div class="form-item">
            <label for="defaultHost">默认主机</label>
            <input id="defaultHost" v-model="formData.defaultHost" type="text" placeholder="localhost" />
            <p class="form-hint">服务器绑定的主机地址</p>
          </div>

          <div class="form-item checkbox">
            <label>
              <input v-model="formData.autoOpen" type="checkbox" />
              <span>自动打开浏览器</span>
            </label>
            <p class="form-hint">启动服务器后自动在浏览器中打开</p>
          </div>

          <div class="form-item checkbox">
            <label>
              <input v-model="formData.debug" type="checkbox" />
              <span>调试模式</span>
            </label>
            <p class="form-hint">启用详细的调试日志输出</p>
          </div>
        </div>
      </div>

      <!-- 当前运行状态 -->
      <div class="settings-section">
        <h2>当前运行状态</h2>
        <div class="status-info">
          <div class="status-item">
            <span class="status-label">当前端口:</span>
            <span class="status-value">{{ config?.currentPort || '-' }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">当前主机:</span>
            <span class="status-value">{{ config?.currentHost || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="settings-actions">
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving">
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
        <button class="btn btn-secondary" @click="resetSettings" :disabled="saving">
          重置为默认值
        </button>
      </div>
      </div>
    </div>

    <!-- AI 设置标签页 -->
    <div v-show="activeTab === 'ai'" class="tab-content">
      <div class="ai-settings-container">
        <!-- 配置表单 -->
        <div class="ai-settings-form">
          <div class="form-section">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <h3>API 配置</h3>
            </div>
            
            <div class="form-item">
              <label for="apiKey">
                <span class="label-text">API 密钥 *</span>
                <span class="label-hint">您的 DeepSeek API Key</span>
              </label>
              <div class="input-wrapper">
                <input
                  id="apiKey"
                  v-model="aiFormData.apiKey"
                  :type="showApiKey ? 'text' : 'password'"
                  placeholder="sk-..."
                  class="form-input"
                  :class="{ error: aiErrors.apiKey }"
                />
                <button
                  type="button"
                  class="toggle-visibility"
                  @click="showApiKey = !showApiKey"
                  :title="showApiKey ? '隐藏密钥' : '显示密钥'"
                >
                  <svg v-if="showApiKey" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <span v-if="aiErrors.apiKey" class="error-message">{{ aiErrors.apiKey }}</span>
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
                v-model="aiFormData.baseUrl"
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
              <select id="model" v-model="aiFormData.model" class="form-input">
                <option value="deepseek-chat">deepseek-chat</option>
                <option value="deepseek-coder">deepseek-coder</option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m6-12h-6m6 0h6m-6 6h6m-6 6h6M1 12h6m6 0H1m6-6H1m6 6H1"></path>
              </svg>
              <h3>高级设置</h3>
            </div>
            
            <div class="form-item">
              <label for="timeout">
                <span class="label-text">超时时间（毫秒）</span>
                <span class="label-hint">API 请求的超时时间</span>
              </label>
              <input
                id="timeout"
                v-model.number="aiFormData.timeout"
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
                v-model.number="aiFormData.maxRetries"
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
              :disabled="aiSaving"
              @click="handleAISave"
            >
              <svg v-if="!aiSaving" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{{ aiSaving ? '保存中...' : '保存配置' }}</span>
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleAITest"
              :disabled="aiTesting || !isAIConfigValid"
            >
              <svg v-if="!aiTesting" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              <span>{{ aiTesting ? '测试中...' : '测试连接' }}</span>
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="handleAIClear"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>清除配置</span>
            </button>
          </div>
        </div>

        <!-- 当前配置状态 -->
        <div class="ai-config-status">
          <div class="status-header">
            <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <h3>配置状态</h3>
          </div>
          
          <div class="status-item">
            <span class="status-label">配置状态:</span>
            <span class="status-value" :class="aiStatusClass">
              {{ aiConfigStatus }}
            </span>
          </div>

          <div class="status-item">
            <span class="status-label">API 密钥:</span>
            <span class="status-value" :class="aiCurrentConfig?.apiKey ? 'status-success' : 'status-error'">
              {{ aiCurrentConfig?.apiKey ? '已配置' : '未配置' }}
            </span>
          </div>

          <div class="status-item">
            <span class="status-label">模型:</span>
            <span class="status-value">{{ aiCurrentConfig?.model || '-' }}</span>
          </div>

          <div class="status-item">
            <span class="status-label">超时时间:</span>
            <span class="status-value">{{ aiCurrentConfig?.timeout || '-' }} ms</span>
          </div>

          <!-- 测试结果 -->
          <transition name="slide-fade">
            <div v-if="aiTestResult" class="test-result" :class="aiTestResult.success ? 'success' : 'error'">
              <div class="result-header">
                <svg v-if="aiTestResult.success" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <h4>{{ aiTestResult.success ? '测试成功' : '测试失败' }}</h4>
              </div>
              <p>{{ aiTestResult.message }}</p>
              <pre v-if="aiTestResult.response">{{ aiTestResult.response }}</pre>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Verdaccio 设置标签页 -->
    <div v-show="activeTab === 'verdaccio'" class="tab-content">
      <div class="verdaccio-settings-container">
        <!-- 左侧配置表单 -->
        <div class="verdaccio-settings-form">
          <!-- 服务控制区域 -->
          <div class="form-section">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2v20M2 12h20"></path>
              </svg>
              <h3>服务控制</h3>
            </div>

            <div class="verdaccio-status-card">
              <div class="status-indicator" :class="{ 'running': verdaccioStatus.isRunning }">
                <span class="status-dot"></span>
                <span class="status-text">{{ verdaccioStatus.isRunning ? '运行中' : '已停止' }}</span>
              </div>

              <div v-if="verdaccioStatus.isRunning" class="status-details">
                <div class="status-item">
                  <span class="label">访问地址:</span>
                  <a :href="verdaccioStatus.url" target="_blank" class="value link">
                    {{ verdaccioStatus.url }}
                  </a>
                </div>
                <div class="status-item">
                  <span class="label">PID:</span>
                  <span class="value">{{ verdaccioStatus.pid || '外部管理' }}</span>
                </div>
                <div class="status-item">
                  <span class="label">运行时间:</span>
                  <span class="value">{{ formatVerdaccioUptime(verdaccioStatus.uptime) }}</span>
                </div>
              </div>

              <div class="status-actions">
                <button 
                  v-if="!verdaccioStatus.isRunning" 
                  class="btn btn-primary" 
                  @click="startVerdaccio"
                  :disabled="verdaccioLoading"
                >
                  {{ verdaccioLoading ? '启动中...' : '启动服务' }}
                </button>
                <button 
                  v-else 
                  class="btn btn-warning" 
                  @click="stopVerdaccio"
                  :disabled="verdaccioLoading"
                >
                  {{ verdaccioLoading ? '停止中...' : '停止服务' }}
                </button>
                <button 
                  class="btn btn-secondary" 
                  @click="restartVerdaccio"
                  :disabled="verdaccioLoading || !verdaccioStatus.isRunning"
                >
                  {{ verdaccioLoading ? '重启中...' : '重启' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 配置编辑区域 -->
          <div class="form-section">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m6-12h-6m6 0h6m-6 6h6m-6 6h6M1 12h6m6 0H1m6-6H1m6 6H1"></path>
              </svg>
              <h3>基本配置</h3>
            </div>

            <div class="form-item">
              <label for="verdaccio-port">
                <span class="label-text">监听端口 *</span>
                <span class="label-hint">Verdaccio 服务监听的端口号</span>
              </label>
              <input
                id="verdaccio-port"
                v-model.number="verdaccioConfig.port"
                type="number"
                min="1"
                max="65535"
                placeholder="4873"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label for="verdaccio-host">
                <span class="label-text">监听地址 *</span>
                <span class="label-hint">127.0.0.1（本地访问），0.0.0.0（允许外部访问）</span>
              </label>
              <input
                id="verdaccio-host"
                v-model="verdaccioConfig.host"
                type="text"
                placeholder="127.0.0.1"
                class="form-input"
              />
            </div>

            <div class="info-box info">
              <strong>提示：</strong> 修改配置后需要重启 Verdaccio 服务才能生效
            </div>

            <div class="form-actions">
              <button
                class="btn btn-primary"
                @click="saveVerdaccioConfig"
                :disabled="verdaccioConfigSaving"
              >
                {{ verdaccioConfigSaving ? '保存中...' : '保存配置' }}
              </button>
            </div>
          </div>

          <!-- 配置文件编辑区域 -->
          <div class="form-section">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h3>配置文件编辑</h3>
            </div>

            <div v-if="loadingConfigFile" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载配置文件...</p>
            </div>
            <div v-else>
              <div class="info-box info">
                直接编辑 Verdaccio 的 YAML 配置文件。修改后记得保存并重启服务。
              </div>
              <textarea 
                v-model="configFileContent" 
                class="config-file-editor"
                spellcheck="false"
                placeholder="配置文件内容..."
              ></textarea>
              <button
                class="btn btn-primary"
                @click="saveConfigFile"
                :disabled="verdaccioConfigSaving"
                style="margin-top: 16px;"
              >
                {{ verdaccioConfigSaving ? '保存中...' : '保存文件' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧信息面板 -->
        <div class="verdaccio-info-panel">
          <div class="info-section">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <h3>配置信息</h3>
            </div>

            <div class="info-item">
              <span class="label">配置文件路径:</span>
              <span class="value">{{ verdaccioStatus.configPath || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">存储路径:</span>
              <span class="value">{{ verdaccioStatus.storageePath || '-' }}</span>
            </div>
          </div>

          <div class="info-section" v-if="verdaccioStatus.isRunning">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              <h3>快速命令</h3>
            </div>

            <div class="quick-command-card">
              <h4>📤 发布包到本地源</h4>
              <pre class="command-block">npm publish --registry {{ verdaccioStatus.url }}</pre>
            </div>
            <div class="quick-command-card">
              <h4>🔗 设置为默认源</h4>
              <pre class="command-block">npm config set registry {{ verdaccioStatus.url }}</pre>
            </div>
            <div class="quick-command-card">
              <h4>👥 创建用户</h4>
              <pre class="command-block">npm adduser --registry {{ verdaccioStatus.url }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '../composables/useApi'
import { useMessage } from '../composables/useMessage'
import type { AIConfig } from '../ai/types'
import { getAIConfig, saveAIConfig, clearAIConfig, validateApiKey, isConfigValid } from '../ai/config'
import { createDeepSeekClient } from '../ai/deepseek-client'

/**
 * 服务器配置接口
 */
interface ServerConfig {
  defaultPort: number
  defaultHost: string
  autoOpen: boolean
  debug: boolean
  currentPort?: number
  currentHost?: string
}

const route = useRoute()
const { get, post } = useApi()
const message = useMessage()

// 标签页状态
const activeTab = ref<'system' | 'ai' | 'verdaccio'>('system')

// 监听 URL 参数改变
watch(() => route.query.tab, (tab) => {
  if (tab === 'ai') {
    activeTab.value = 'ai'
  } else if (tab === 'verdaccio') {
    activeTab.value = 'verdaccio'
  } else {
    activeTab.value = 'system'
  }
}, { immediate: true })

// 系统设置状态
const loading = ref(true)
const saving = ref(false)
const config = ref<ServerConfig | null>(null)

// 系统表单数据
const formData = reactive({
  defaultPort: 3000,
  defaultHost: 'localhost',
  autoOpen: true,
  debug: false
})

// AI 设置状态
const aiFormData = ref<Partial<AIConfig>>({
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  timeout: 60000,
  maxRetries: 3
})

const aiCurrentConfig = ref<AIConfig | null>(null)
const showApiKey = ref(false)
const aiSaving = ref(false)
const aiTesting = ref(false)
const aiErrors = ref<Record<string, string>>({})
const aiTestResult = ref<{
  success: boolean
  message: string
  response?: string
} | null>(null)

// AI 计算属性
const aiConfigStatus = computed(() => {
  if (!aiCurrentConfig.value || !aiCurrentConfig.value.apiKey) {
    return '未配置'
  }
  return '已配置'
})

const aiStatusClass = computed(() => {
  return aiCurrentConfig.value?.apiKey ? 'configured' : 'not-configured'
})

const isAIConfigValid = computed(() => {
  return isConfigValid(aiCurrentConfig.value)
})

// Verdaccio 设置状态
const verdaccioStatus = ref({
  isRunning: false,
  pid: null as number | null,
  port: null as number | null,
  host: null as string | null,
  url: null as string | null,
  uptime: null as number | null,
  configPath: null as string | null,
  storageePath: null as string | null
})

const verdaccioConfig = ref({
  port: 4873,
  host: '127.0.0.1'
})

const verdaccioLoading = ref(false)
const verdaccioConfigSaving = ref(false)
const loadingConfigFile = ref(false)
const configFileContent = ref('')
let verdaccioStatusInterval: number | null = null

/**
 * 加载配置
 */
async function loadConfig() {
  try {
    loading.value = true
    const result = await get<ServerConfig>('/api/config')
    if (result.success && result.data) {
      config.value = result.data
      formData.defaultPort = result.data.defaultPort
      formData.defaultHost = result.data.defaultHost
      formData.autoOpen = result.data.autoOpen
      formData.debug = result.data.debug
    }
  } catch (error: any) {
    message.error('加载配置失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

/**
 * 保存设置
 */
async function saveSettings() {
  try {
    // 验证端口
    if (formData.defaultPort < 1 || formData.defaultPort > 65535) {
      message.error('端口号必须在 1-65535 之间')
      return
    }

    // 验证主机
    if (!formData.defaultHost.trim()) {
      message.error('主机地址不能为空')
      return
    }

    saving.value = true
    const result = await post<ServerConfig>('/api/config', formData)
    if (result.success && result.data) {
      config.value = { ...config.value, ...result.data }
      message.success('设置已保存，重启服务器后生效')
    }
  } catch (error: any) {
    message.error('保存设置失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

/**
 * 重置设置
 */
function resetSettings() {
  formData.defaultPort = 3000
  formData.defaultHost = 'localhost'
  formData.autoOpen = true
  formData.debug = false
}

// AI 设置方法
const loadAIConfig = () => {
  const config = getAIConfig()
  if (config) {
    aiCurrentConfig.value = config
    aiFormData.value = { ...config }
  }
}

const validateAIForm = (): boolean => {
  aiErrors.value = {}
  
  const apiKeyValidation = validateApiKey(aiFormData.value.apiKey || '')
  if (!apiKeyValidation.valid) {
    aiErrors.value.apiKey = apiKeyValidation.message || 'API 密钥无效'
    return false
  }
  
  return true
}

const handleAISave = async () => {
  aiTestResult.value = null
  
  if (!validateAIForm()) {
    return
  }
  
  aiSaving.value = true
  
  try {
    const success = saveAIConfig(aiFormData.value)
    if (success) {
      loadAIConfig()
      message.success('AI 配置已保存成功！')
    } else {
      message.error('保存 AI 配置失败，请重试')
    }
  } catch (error) {
    console.error('保存 AI 配置失败:', error)
    message.error('保存 AI 配置时出错')
  } finally {
    aiSaving.value = false
  }
}

const handleAITest = async () => {
  if (!validateAIForm()) {
    return
  }
  
  aiTesting.value = true
  aiTestResult.value = null
  
  try {
    const client = createDeepSeekClient(aiFormData.value as AIConfig)
    const response = await client.chat('你好，请回复"连接成功"')
    
    aiTestResult.value = {
      success: true,
      message: 'API 连接测试成功！',
      response: response.substring(0, 200) + (response.length > 200 ? '...' : '')
    }
  } catch (error: any) {
    aiTestResult.value = {
      success: false,
      message: `连接测试失败: ${error.message}`
    }
  } finally {
    aiTesting.value = false
  }
}

const handleAIClear = () => {
  if (confirm('确定要清除所有 AI 配置吗？此操作不可恢复。')) {
    clearAIConfig()
    aiFormData.value = {
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      timeout: 60000,
      maxRetries: 3
    }
    aiCurrentConfig.value = null
    aiTestResult.value = null
    message.success('AI 配置已清除')
  }
}

// Tab 切换方法
const switchTab = (tab: 'system' | 'ai' | 'verdaccio') => {
  activeTab.value = tab
  
  // 切换到 Verdaccio 标签页时，加载状态和配置
  if (tab === 'verdaccio') {
    loadVerdaccioStatus()
    loadVerdaccioConfig()
  }
}

// Verdaccio 相关方法
const loadVerdaccioStatus = async () => {
  try {
    const result = await get<typeof verdaccioStatus.value>('/api/verdaccio/status')
    if (result.success && result.data) {
      verdaccioStatus.value = result.data
    }
  } catch (error: any) {
    console.error('获取 Verdaccio 状态失败:', error)
  }
}

const loadVerdaccioConfig = async () => {
  try {
    const result = await get<{port: number, host: string}>('/api/verdaccio/config')
    if (result.success && result.data) {
      verdaccioConfig.value = result.data
    }
  } catch (error: any) {
    console.error('获取 Verdaccio 配置失败:', error)
  }
}

const startVerdaccio = async () => {
  try {
    verdaccioLoading.value = true
    const result = await post('/api/verdaccio/start', {})
    if (result.success) {
      // 如果返回数据中包含状态信息，直接使用
      if (result.data) {
        verdaccioStatus.value = result.data
      }
      
      message.success('服务启动成功')
      
      // 多次尝试获取服务状态，确保 URL 显示出来
      let retries = 0
      const maxRetries = 5
      
      while (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500))
        await loadVerdaccioStatus()
        
        // 如果已经获取到完整状态信息（包括 URL），退出循环
        if (verdaccioStatus.value.isRunning && verdaccioStatus.value.url) {
          break
        }
        
        retries++
      }
      
      startStatusPolling()
    } else {
      message.error(result.message || '启动失败')
    }
  } catch (error: any) {
    message.error('启动失败: ' + error.message)
  } finally {
    verdaccioLoading.value = false
  }
}

const stopVerdaccio = async () => {
  try {
    verdaccioLoading.value = true
    const result = await post('/api/verdaccio/stop', {})
    if (result.success) {
      message.success('服务已停止')
      await loadVerdaccioStatus()
      stopStatusPolling()
    } else {
      message.error(result.message || '停止失败')
    }
  } catch (error: any) {
    message.error('停止失败: ' + error.message)
  } finally {
    verdaccioLoading.value = false
  }
}

const restartVerdaccio = async () => {
  try {
    verdaccioLoading.value = true
    const result = await post('/api/verdaccio/restart', {})
    if (result.success) {
      // 如果返回数据中包含状态信息，直接使用
      if (result.data) {
        verdaccioStatus.value = result.data
      }
      
      message.success('服务重启成功')
      
      // 多次尝试获取服务状态，确保 URL 显示出来
      let retries = 0
      const maxRetries = 5
      
      while (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500))
        await loadVerdaccioStatus()
        
        // 如果已经获取到完整状态信息（包括 URL），退出循环
        if (verdaccioStatus.value.isRunning && verdaccioStatus.value.url) {
          break
        }
        
        retries++
      }
    } else {
      message.error(result.message || '重启失败')
    }
  } catch (error: any) {
    message.error('重启失败: ' + error.message)
  } finally {
    verdaccioLoading.value = false
  }
}

const saveVerdaccioConfig = async () => {
  try {
    // 验证
    if (verdaccioConfig.value.port < 1 || verdaccioConfig.value.port > 65535) {
      message.error('端口号必须在 1-65535 之间')
      return
    }
    if (!verdaccioConfig.value.host.trim()) {
      message.error('监听地址不能为空')
      return
    }

    verdaccioConfigSaving.value = true
    const result = await post('/api/verdaccio/config', verdaccioConfig.value)
    if (result.success) {
      message.success('配置已保存，重启服务后生效')
      await loadVerdaccioConfig()
    } else {
      message.error(result.message || '保存失败')
    }
  } catch (error: any) {
    message.error('保存配置失败: ' + error.message)
  } finally {
    verdaccioConfigSaving.value = false
  }
}

const loadConfigFileFunc = async () => {
  try {
    loadingConfigFile.value = true
    const result = await get<{content: string}>('/api/verdaccio/config-file')
    if (result.success && result.data) {
      configFileContent.value = result.data.content
    }
  } catch (error: any) {
    message.error('加载配置文件失败: ' + error.message)
  } finally {
    loadingConfigFile.value = false
  }
}

const saveConfigFile = async () => {
  try {
    verdaccioConfigSaving.value = true
    const result = await post('/api/verdaccio/config-file', { content: configFileContent.value })
    if (result.success) {
      message.success('配置文件已保存，重启服务后生效')
    } else {
      message.error(result.message || '保存失败')
    }
  } catch (error: any) {
    message.error('保存配置文件失败: ' + error.message)
  } finally {
    verdaccioConfigSaving.value = false
  }
}

const formatVerdaccioUptime = (uptime: number | null | undefined) => {
  if (!uptime) return '外部启动'
  const seconds = Math.floor(uptime / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} 天`
  if (hours > 0) return `${hours} 小时`
  if (minutes > 0) return `${minutes} 分钟`
  return `${seconds} 秒`
}

const startStatusPolling = () => {
  if (verdaccioStatusInterval) return
  verdaccioStatusInterval = window.setInterval(() => {
    if (verdaccioStatus.value.isRunning) {
      loadVerdaccioStatus()
    }
  }, 5000)
}

const stopStatusPolling = () => {
  if (verdaccioStatusInterval) {
    clearInterval(verdaccioStatusInterval)
    verdaccioStatusInterval = null
  }
}

// 监听 Verdaccio 标签页的可见性
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'verdaccio') {
    loadVerdaccioStatus()
    loadConfigFileFunc()
    if (verdaccioStatus.value.isRunning) {
      startStatusPolling()
    }
  } else {
    stopStatusPolling()
  }
})

// 加载配置
onMounted(() => {
  loadConfig()
  loadAIConfig()
})
</script>

<style lang="less" scoped>
.settings {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--ls-padding-xl) var(--ls-padding-lg);
}

.page-header {
  margin-bottom: var(--ls-spacing-xl);
  text-align: center;

  h1 {
    font-size: 32px;
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin: 0;
    letter-spacing: -0.5px;
  }
}

// 标签页导航
.tabs-nav {
  display: flex;
  gap: 8px;
  margin-bottom: var(--ls-spacing-xl);
  padding: 6px;
  background: var(--ldesign-bg-color-component);
  border-radius: 12px;
  border: 1px solid var(--ldesign-border-level-1-color);

  .tab-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--ldesign-text-color-secondary);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    .tab-icon {
      width: 20px;
      height: 20px;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    span {
      position: relative;
      z-index: 1;
    }

    &:hover:not(.active) {
      color: var(--ldesign-text-color-primary);
      background: var(--ldesign-bg-color-container-hover);

      .tab-icon {
        transform: translateY(-2px);
      }
    }

    &.active {
      color: var(--ldesign-brand-color);
      background: var(--ldesign-bg-color-container);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08),
                  0 1px 2px rgba(0, 0, 0, 0.04);

      .tab-icon {
        animation: tabIconBounce 0.5s ease;
      }
    }
  }
}

@keyframes tabIconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.tab-content {
  animation: tabFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes tabFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.loading {
  text-align: center;
  padding: var(--ls-spacing-xxl);

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto var(--ls-spacing-base);
    border: 3px solid var(--ldesign-border-level-1-color);
    border-top-color: var(--ldesign-brand-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  p {
    color: var(--ldesign-text-color-secondary);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.settings-content {
.settings-section {
    background: var(--ldesign-bg-color-container);
    border: 1px solid var(--ldesign-border-level-1-color);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: var(--ls-spacing-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04),
                0 1px 2px rgba(0, 0, 0, 0.02);

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-spacing-base);
      padding-bottom: var(--ls-spacing-sm);
      border-bottom: 2px solid var(--ldesign-border-level-1-color);
    }
  }

  .settings-form {
    .form-item {
      margin-bottom: var(--ls-spacing-lg);

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        font-size: 14px;
        color: var(--ldesign-text-color-primary);
        margin-bottom: 8px;
        font-weight: 500;

        .label-text {
          display: block;
          margin-bottom: 4px;
        }

        .label-hint {
          display: block;
          font-size: 13px;
          color: var(--ldesign-text-color-secondary);
          font-weight: 400;
        }
      }

      input[type="text"],
      input[type="number"],
      input[type="password"],
      select {
        display: block;
        width: 100%;
        max-width: 500px;
        height: 42px;
        padding: 0 14px;
        font-size: 14px;
        color: var(--ldesign-text-color-primary);
        background: var(--ldesign-bg-color-container);
        border: 1.5px solid var(--ldesign-border-level-1-color);
        border-radius: 8px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          border-color: var(--ldesign-border-level-2-color);
        }

        &:focus {
          outline: none;
          border-color: var(--ldesign-brand-color);
          box-shadow: 0 0 0 3px var(--ldesign-brand-color-focus);
          transform: translateY(-1px);
        }

        &::placeholder {
          color: var(--ldesign-text-color-placeholder);
        }
      }

      select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 40px;
      }

      &.checkbox {
        label {
          display: flex;
          align-items: center;
          cursor: pointer;

          input[type="checkbox"] {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            cursor: pointer;
            accent-color: var(--ldesign-brand-color);
          }

          span {
            font-weight: normal;
          }
        }
      }

      .form-hint {
        margin-top: 6px;
        font-size: 13px;
        color: var(--ldesign-text-color-secondary);
        line-height: 1.5;
      }
    }
  }

  .status-info {
    .status-item {
      display: flex;
      align-items: center;
      padding: var(--ls-padding-sm) 0;
      border-bottom: 1px solid var(--ldesign-border-level-1-color);

      &:last-child {
        border-bottom: none;
      }

      .status-label {
        flex: 0 0 120px;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
      }

      .status-value {
        flex: 1;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-primary);
        font-weight: 500;
      }
    }
  }

  .settings-actions {
    display: flex;
    gap: 12px;
    margin-top: var(--ls-spacing-xl);

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 42px;
      padding: 0 20px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      svg {
        flex-shrink: 0;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      &:not(:disabled):hover {
        transform: translateY(-2px);
      }

      &:not(:disabled):active {
        transform: translateY(0);
      }

      .spinning {
        animation: spin 1s linear infinite;
      }
    }

    .btn-primary {
      background: var(--ldesign-brand-color);
      color: white;
      box-shadow: 0 2px 8px rgba(0, 102, 255, 0.2);

      &:hover:not(:disabled) {
        background: var(--ldesign-brand-color-hover);
        box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
      }

      &:active:not(:disabled) {
        background: var(--ldesign-brand-color-active);
      }
    }

    .btn-secondary {
      background: var(--ldesign-bg-color-container);
      color: var(--ldesign-text-color-primary);
      border: 1.5px solid var(--ldesign-border-level-1-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

      &:hover:not(:disabled) {
        background: var(--ldesign-bg-color-container-hover);
        border-color: var(--ldesign-brand-color);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
      }

      &:active:not(:disabled) {
        background: var(--ldesign-bg-color-component-active);
      }
    }
  }
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--ls-spacing-xl);

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.ai-settings-form,
.ai-config-status {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04),
              0 1px 2px rgba(0, 0, 0, 0.02);
}

// AI 设置表单样式
.ai-settings-form {
  .form-item {
    margin-bottom: var(--ls-spacing-lg);

    &:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      font-size: 14px;
      color: var(--ldesign-text-color-primary);
      margin-bottom: 8px;
      font-weight: 500;

      .label-text {
        display: block;
        margin-bottom: 4px;
      }

      .label-hint {
        display: block;
        font-size: 13px;
        color: var(--ldesign-text-color-secondary);
        font-weight: 400;
      }
    }

    input[type="text"],
    input[type="number"],
    input[type="password"],
    select {
      display: block;
      width: 100%;
      max-width: 500px;
      height: 42px;
      padding: 0 14px;
      font-size: 14px;
      color: var(--ldesign-text-color-primary);
      background: var(--ldesign-bg-color-container);
      border: 1.5px solid var(--ldesign-border-level-1-color);
      border-radius: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: var(--ldesign-border-level-2-color);
      }

      &:focus {
        outline: none;
        border-color: var(--ldesign-brand-color);
        box-shadow: 0 0 0 3px var(--ldesign-brand-color-focus);
        transform: translateY(-1px);
      }

      &::placeholder {
        color: var(--ldesign-text-color-placeholder);
      }

      &.error {
        border-color: var(--ldesign-error-color);
      }
    }

    select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 40px;
    }

    .form-hint {
      margin-top: 6px;
      font-size: 13px;
      color: var(--ldesign-text-color-secondary);
      line-height: 1.5;
    }
  }

  .input-wrapper {
    position: relative;
    display: block;
    max-width: 500px;

    .form-input {
      width: 100%;
      padding-right: 48px;
    }

    .toggle-visibility {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      color: var(--ldesign-text-color-secondary);

      &:hover {
        background: var(--ldesign-bg-color-component-hover);
        color: var(--ldesign-text-color-primary);
      }

      &:active {
        transform: translateY(-50%) scale(0.95);
      }
    }
  }
}

.form-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    padding-bottom: 14px;
    border-bottom: 2px solid var(--ldesign-border-level-1-color);

    .section-icon {
      width: 22px;
      height: 22px;
      color: var(--ldesign-brand-color);
      flex-shrink: 0;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      letter-spacing: -0.2px;
    }
  }
}

.input-wrapper {
  position: relative;
  display: block;
  max-width: 500px;

  .form-input {
    width: 100%;
    padding-right: 48px;
  }

  .toggle-visibility {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--ldesign-text-color-secondary);

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      color: var(--ldesign-text-color-primary);
    }

    &:active {
      transform: translateY(-50%) scale(0.95);
    }
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

.form-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-level-1-color);
  flex-wrap: wrap;
}

.btn-danger {
  background: var(--ldesign-error-color);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);

  &:hover:not(:disabled) {
    background: var(--ldesign-error-color-hover);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  &:active:not(:disabled) {
    background: var(--ldesign-error-color-active);
  }
}

.ai-config-status {
  .status-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--ldesign-border-level-1-color);

    .status-icon {
      width: 22px;
      height: 22px;
      color: var(--ldesign-brand-color);
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }
  }

  .status-value {
    &.configured {
      color: var(--ldesign-success-color);
      font-weight: 600;
    }

    &.not-configured {
      color: var(--ldesign-error-color);
      font-weight: 600;
    }

    &.status-success {
      color: var(--ldesign-success-color);
      font-weight: 500;
    }

    &.status-error {
      color: var(--ldesign-error-color);
      font-weight: 500;
    }
  }
}

.test-result {
  margin-top: var(--ls-margin-lg);
  padding: 16px;
  border-radius: 10px;
  border: 1.5px solid;

  &.success {
    background: rgba(16, 185, 129, 0.08);
    border-color: var(--ldesign-success-color);
  }

  &.error {
    background: rgba(239, 68, 68, 0.08);
    border-color: var(--ldesign-error-color);
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    svg {
      flex-shrink: 0;
    }

    h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--ldesign-text-color-secondary);
    line-height: 1.6;
  }

  pre {
    margin-top: 12px;
    padding: 12px;
    background: var(--ldesign-bg-color-component);
    border-radius: 6px;
    font-size: 12px;
    line-height: 1.6;
    overflow-x: auto;
    color: var(--ldesign-text-color-primary);
    border: 1px solid var(--ldesign-border-level-1-color);
  }
}

// 测试结果动画
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// Verdaccio 设置样式
.verdaccio-settings-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--ls-spacing-xl);

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.verdaccio-settings-form,
.verdaccio-info-panel {
  .info-section {
    background: var(--ldesign-bg-color-container);
    border: 1px solid var(--ldesign-border-level-1-color);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: var(--ls-spacing-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.verdaccio-status-card {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 10px;
  padding: 20px;

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--ldesign-border-level-2-color);
      transition: all 0.3s;
    }

    .status-text {
      font-size: 16px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }

    &.running {
      .status-dot {
        background: var(--ldesign-success-color);
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        animation: statusPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      .status-text {
        color: var(--ldesign-success-color);
      }
    }
  }

  .status-details {
    padding: 16px 0;
    border-top: 1px solid var(--ldesign-border-level-1-color);
    border-bottom: 1px solid var(--ldesign-border-level-1-color);
    margin-bottom: 16px;

    .status-item {
      display: flex;
      align-items: center;
      padding: 8px 0;

      .label {
        flex: 0 0 100px;
        font-size: 14px;
        color: var(--ldesign-text-color-secondary);
      }

      .value {
        flex: 1;
        font-size: 14px;
        color: var(--ldesign-text-color-primary);
        font-weight: 500;

        &.link {
          color: var(--ldesign-brand-color);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .status-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.btn-warning {
  background: var(--ldesign-warning-color, #f59e0b);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);

  &:hover:not(:disabled) {
    background: #d97706;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  &:active:not(:disabled) {
    background: #b45309;
  }
}

.info-box {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;

  &.info {
    background: rgba(0, 102, 255, 0.08);
    border: 1px solid var(--ldesign-brand-color);
    color: var(--ldesign-text-color-primary);
  }

  &.warning {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid #f59e0b;
    color: var(--ldesign-text-color-primary);
  }

  strong {
    font-weight: 600;
  }
}

.config-file-editor {
  width: 100%;
  min-height: 300px;
  padding: 14px;
  font-family: 'Cascadia Code', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ldesign-text-color-primary);
  background: var(--ldesign-bg-color-component);
  border: 1.5px solid var(--ldesign-border-level-1-color);
  border-radius: 8px;
  resize: vertical;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--ldesign-border-level-2-color);
  }

  &:focus {
    outline: none;
    border-color: var(--ldesign-brand-color);
    box-shadow: 0 0 0 3px var(--ldesign-brand-color-focus);
  }
}

.loading-state {
  text-align: center;
  padding: 40px 20px;

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 16px;
    border: 3px solid var(--ldesign-border-level-1-color);
    border-top-color: var(--ldesign-brand-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: 14px;
  }
}

.verdaccio-info-panel {
  .info-item {
    padding: 10px 0;
    border-bottom: 1px solid var(--ldesign-border-level-1-color);

    &:last-child {
      border-bottom: none;
    }

    .label {
      display: block;
      font-size: 13px;
      color: var(--ldesign-text-color-secondary);
      margin-bottom: 4px;
    }

    .value {
      display: block;
      font-size: 14px;
      color: var(--ldesign-text-color-primary);
      word-break: break-all;
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
}

.quick-command-card {
  padding: 16px;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 8px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
  }

  .command-block {
    margin: 0;
    padding: 10px 12px;
    background: var(--ldesign-bg-color-page);
    border: 1px solid var(--ldesign-border-level-1-color);
    border-radius: 6px;
    font-family: 'Cascadia Code', 'Consolas', 'Monaco', monospace;
    font-size: 12px;
    color: var(--ldesign-text-color-primary);
    overflow-x: auto;
    user-select: all;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      border-color: var(--ldesign-brand-color);
    }
  }
}
</style>
