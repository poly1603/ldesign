<template>
  <div class="settings">
    <div class="page-header">
      <h1>系统设置</h1>
      <p class="page-description">配置系统参数和偏好设置</p>
    </div>

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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import { useMessage } from '../composables/useMessage'

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

const { get, post } = useApi()
const { showMessage } = useMessage()

// 状态
const loading = ref(true)
const saving = ref(false)
const config = ref<ServerConfig | null>(null)

// 表单数据
const formData = reactive({
  defaultPort: 3000,
  defaultHost: 'localhost',
  autoOpen: true,
  debug: false
})

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
    showMessage('加载配置失败: ' + error.message, 'error')
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
      showMessage('端口号必须在 1-65535 之间', 'error')
      return
    }

    // 验证主机
    if (!formData.defaultHost.trim()) {
      showMessage('主机地址不能为空', 'error')
      return
    }

    saving.value = true
    const result = await post<ServerConfig>('/api/config', formData)
    if (result.success && result.data) {
      config.value = { ...config.value, ...result.data }
      showMessage('设置已保存，重启服务器后生效', 'success')
    }
  } catch (error: any) {
    showMessage('保存设置失败: ' + error.message, 'error')
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

// 加载配置
onMounted(() => {
  loadConfig()
})
</script>

<style lang="less" scoped>
.settings {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--ls-spacing-xl);

  h1 {
    font-size: var(--ls-font-size-xl);
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-spacing-xs);
  }

  .page-description {
    color: var(--ldesign-text-color-secondary);
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
    border-radius: var(--ls-border-radius-base);
    padding: var(--ls-padding-lg);
    margin-bottom: var(--ls-spacing-lg);

    h2 {
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-spacing-base);
      padding-bottom: var(--ls-spacing-sm);
      border-bottom: 1px solid var(--ldesign-border-level-1-color);
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
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-primary);
        margin-bottom: var(--ls-spacing-xs);
        font-weight: 500;
      }

      input[type="text"],
      input[type="number"] {
        width: 100%;
        max-width: 400px;
        height: var(--ls-input-height-medium);
        padding: 0 var(--ls-padding-sm);
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-primary);
        background: var(--ldesign-bg-color-component);
        border: 1px solid var(--ldesign-border-level-1-color);
        border-radius: var(--ls-border-radius-base);
        transition: all 0.2s;

        &:hover {
          border-color: var(--ldesign-border-level-2-color);
        }

        &:focus {
          outline: none;
          border-color: var(--ldesign-brand-color);
          box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
        }

        &::placeholder {
          color: var(--ldesign-text-color-placeholder);
        }
      }

      &.checkbox {
        label {
          display: flex;
          align-items: center;
          cursor: pointer;

          input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: var(--ls-spacing-xs);
            cursor: pointer;
          }

          span {
            font-weight: normal;
          }
        }
      }

      .form-hint {
        margin-top: var(--ls-spacing-xs);
        font-size: var(--ls-font-size-xs);
        color: var(--ldesign-text-color-secondary);
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
    gap: var(--ls-spacing-base);
    margin-top: var(--ls-spacing-xl);

    .btn {
      height: var(--ls-button-height-medium);
      padding: 0 var(--ls-padding-lg);
      font-size: var(--ls-font-size-sm);
      border: none;
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      transition: all 0.2s;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &.btn-primary {
        background: var(--ldesign-brand-color);
        color: var(--ldesign-font-white-1);

        &:hover:not(:disabled) {
          background: var(--ldesign-brand-color-hover);
        }

        &:active:not(:disabled) {
          background: var(--ldesign-brand-color-active);
        }
      }

      &.btn-secondary {
        background: var(--ldesign-bg-color-component);
        color: var(--ldesign-text-color-primary);
        border: 1px solid var(--ldesign-border-level-1-color);

        &:hover:not(:disabled) {
          background: var(--ldesign-bg-color-component-hover);
          border-color: var(--ldesign-border-level-2-color);
        }

        &:active:not(:disabled) {
          background: var(--ldesign-bg-color-component-active);
        }
      }
    }
  }
}
</style>
