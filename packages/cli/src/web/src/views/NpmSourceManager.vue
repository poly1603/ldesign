<template>
  <div class="npm-sources">
    <div class="page-header">
      <h1>NPM 源管理</h1>
      <p class="page-description">管理和配置 NPM 镜像源，支持公共源和私有源</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="content">
      <!-- NPM 源管理区域 -->
      <div class="sources-section">
        <div class="section-header">
          <h2>🌐 NPM 源管理</h2>
          <p class="section-description">管理和切换不同的 NPM 注册表源</p>
        </div>

        <!-- 工具栏 -->
        <div class="toolbar">
          <button class="btn btn-primary" @click="showAddDialog">
            <span class="icon">+</span>
            添加源
          </button>
          <button class="btn btn-secondary" @click="loadSources">
            <span class="icon">⟳</span>
            刷新
          </button>
        </div>
      </div>

      <!-- 源列表 -->
      <div v-if="sources.length === 0" class="empty-state">
        <p>暂无 NPM 源</p>
        <button class="btn btn-primary" @click="showAddDialog">添加第一个源</button>
      </div>

      <div v-else class="sources-grid">
        <div 
          v-for="source in sources" 
          :key="source.id" 
          class="source-card"
          :class="{ 'logged-in': source.isLoggedIn }"
        >
          <div class="source-header" @click="goToSourceDetail(source)" style="cursor: pointer;">
            <div class="source-info">
              <h3>{{ source.name }}</h3>
              <span class="source-type" :class="source.type">{{ source.type === 'public' ? '公共' : '私有' }}</span>
            </div>
            <div class="source-status">
              <!-- 服务可用性状态 -->
              <span 
                v-if="source.isChecking" 
                class="status-badge checking"
                title="检测中"
              >
                <span class="status-spinner"></span>
                检测中
              </span>
              <span 
                v-else-if="source.isAvailable === true" 
                class="status-badge available"
                :title="`服务可用 - 延迟: ${source.latency}ms`"
              >
                ✓ 可用 <span v-if="source.latency" class="latency-text">({{ source.latency }}ms)</span>
              </span>
              <span 
                v-else-if="source.isAvailable === false" 
                class="status-badge unavailable"
                :title="`服务不可用 - 尝试时间: ${source.latency}ms`"
              >
                ✗ 不可用 <span v-if="source.latency" class="latency-text">({{ source.latency }}ms)</span>
              </span>
              <!-- 登录状态 -->
              <span v-if="source.isLoggedIn" class="status-badge logged-in">已登录</span>
              <span v-else class="status-badge">未登录</span>
            </div>
          </div>

          <div class="source-body">
            <div class="source-url">
              <span class="label">地址:</span>
              <span class="url">{{ source.url }}</span>
            </div>
            <div v-if="source.description" class="source-description">
              {{ source.description }}
            </div>
            <div v-if="source.isLoggedIn && source.loginInfo" class="login-info">
              <span class="label">用户:</span>
              <span>{{ source.loginInfo.username }}</span>
              <span class="label">最后登录:</span>
              <span>{{ formatDate(source.loginInfo.lastLoginAt) }}</span>
            </div>
          </div>

          <div class="source-actions">
            <button 
              class="btn btn-sm btn-secondary" 
              @click="switchSource(source)" 
              :disabled="operatingSourceId === source.id"
              title="切换到此源"
            >
              {{ operatingSourceId === source.id ? '处理中...' : '切换' }}
            </button>
            <button 
              class="btn btn-sm btn-secondary" 
              @click="checkSourceAvailability(source)" 
              :disabled="source.isChecking"
              title="重新检测服务可用性"
            >
              {{ source.isChecking ? '检测中...' : '重检' }}
            </button>
            <button 
              class="btn btn-sm btn-secondary" 
              @click="checkLoginStatus(source)" 
              :disabled="operatingSourceId === source.id"
              title="检测登录状态"
            >
              {{ operatingSourceId === source.id ? '检测中...' : '登录检测' }}
            </button>
            <button 
              v-if="!source.isLoggedIn" 
              class="btn btn-sm btn-primary" 
              @click="showLoginDialog(source)"
              :disabled="operatingSourceId === source.id"
              title="登录"
            >
              登录
            </button>
            <button 
              v-else 
              class="btn btn-sm btn-warning" 
              @click="logout(source)"
              :disabled="operatingSourceId === source.id"
              title="退出登录"
            >
              {{ operatingSourceId === source.id ? '退出中...' : '退出' }}
            </button>
            <button 
              class="btn btn-sm btn-secondary" 
              @click="showEditDialog(source)" 
              :disabled="operatingSourceId === source.id"
              title="编辑"
            >
              编辑
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              @click="deleteSource(source)" 
              :disabled="operatingSourceId === source.id"
              title="删除"
            >
              删除
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- 添加/编辑源对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2>{{ editingSource ? '编辑源' : '添加源' }}</h2>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label for="source-name">源名称 *</label>
            <input id="source-name" v-model="formData.name" type="text" placeholder="例如: npm 官方源" />
          </div>
          <div class="form-item">
            <label for="source-url">源地址 *</label>
            <input id="source-url" v-model="formData.url" type="text" placeholder="https://registry.npmjs.org/" />
          </div>
          <div class="form-item">
            <label for="source-type">类型 *</label>
            <select id="source-type" v-model="formData.type">
              <option value="public">公共源</option>
              <option value="private">私有源</option>
            </select>
          </div>
          <div class="form-item">
            <label for="source-description">描述</label>
            <textarea id="source-description" v-model="formData.description" rows="3" placeholder="可选的源描述"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeDialog">取消</button>
          <button class="btn btn-primary" @click="saveSource" :disabled="saving">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 登录对话框 -->
    <div v-if="showLoginForm" class="dialog-overlay" @click="closeLoginDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2>登录到 {{ loginTarget?.name }}</h2>
          <button class="close-btn" @click="closeLoginDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label for="login-username">用户名 *</label>
            <input id="login-username" v-model="loginFormData.username" type="text" placeholder="请输入用户名" />
          </div>
          <div class="form-item">
            <label for="login-password">密码 *</label>
            <input id="login-password" v-model="loginFormData.password" type="password" placeholder="请输入密码" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeLoginDialog">取消</button>
          <button class="btn btn-primary" @click="performLogin" :disabled="loggingIn">
            {{ loggingIn ? '登录中...' : '登录' }}
          </button>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '../composables/useApi'
import { useMessage } from '../composables/useMessage'

interface NpmSource {
  id: string
  name: string
  url: string
  type: 'public' | 'private'
  description?: string
  isLoggedIn: boolean
  loginInfo?: {
    username?: string
    email?: string
    lastLoginAt?: string
  }
  createdAt: string
  updatedAt: string
  // 服务可用性状态
  isAvailable?: boolean
  isChecking?: boolean
  latency?: number // 检测延迟（毫秒）
  lastCheckTime?: string // 最后检测时间
}

const { get, post, put, del } = useApi()
const message = useMessage()
const router = useRouter()

// Helper function to show message with type
const showMessage = (content: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  message[type](content)
}

// 状态
const loading = ref(true)
const saving = ref(false)
const loggingIn = ref(false)
const sources = ref<NpmSource[]>([])
const showDialog = ref(false)
const showLoginForm = ref(false)
const editingSource = ref<NpmSource | null>(null)
const loginTarget = ref<NpmSource | null>(null)
const operatingSourceId = ref<string | null>(null) // 正在操作的源ID

// Verdaccio 状态
const verdaccioStatus = ref<any>({
  isRunning: false,
  pid: null,
  port: null,
  host: null,
  url: null,
  uptime: null
})
const verdaccioLoading = ref(false)
const showVerdaccioConfig = ref(false)
const verdaccioConfig = reactive({
  port: 4873,
  host: '127.0.0.1'
})
const configTab = ref<'basic' | 'advanced' | 'file'>('basic')
const savingConfig = ref(false)
const loadingConfigFile = ref(false)
const configFileContent = ref('')

// 表单数据
const formData = reactive({
  name: '',
  url: '',
  type: 'public' as 'public' | 'private',
  description: ''
})

// 登录表单数据
const loginFormData = reactive({
  username: '',
  password: ''
})

// 服务可用性检测相关状态
const autoCheckInterval = ref<number | null>(null)
const autoCheckEnabled = ref(true) // 是否启用自动检测


/**
 * 跳转到源详情页
 */
function goToSourceDetail(source: NpmSource) {
  router.push(`/npm-sources/${source.id}`)
}

/**
 * 加载源列表
 */
async function loadSources() {
  try {
    loading.value = true
    const result = await get<NpmSource[]>('/api/npm-sources')
    if (result.success && result.data) {
      sources.value = result.data
      // 加载完成后自动检测所有源的可用性
      checkAllSourcesAvailability()
    }
  } catch (error: any) {
    showMessage('加载源列表失败: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

/**
 * 检测单个源的服务可用性
 */
async function checkSourceAvailability(source: NpmSource) {
  // 设置检测中状态
  source.isChecking = true
  source.isAvailable = undefined
  
  const startTime = Date.now()
  
  try {
    const result = await get<{ available: boolean; latency?: number }>(`/api/npm-sources/${source.id}/check-availability`)
    if (result.success && result.data) {
      source.isAvailable = result.data.available
      source.latency = result.data.latency || (Date.now() - startTime)
    } else {
      source.isAvailable = false
      source.latency = Date.now() - startTime
    }
  } catch (error: any) {
    // 出错说明服务不可用
    source.isAvailable = false
    source.latency = Date.now() - startTime
  } finally {
    source.isChecking = false
    source.lastCheckTime = new Date().toISOString()
  }
}

/**
 * 检测所有源的服务可用性
 */
async function checkAllSourcesAvailability() {
  // 并发检测所有源
  await Promise.all(sources.value.map(source => checkSourceAvailability(source)))
}

/**
 * 显示添加对话框
 */
function showAddDialog() {
  editingSource.value = null
  formData.name = ''
  formData.url = ''
  formData.type = 'public'
  formData.description = ''
  showDialog.value = true
}

/**
 * 显示编辑对话框
 */
function showEditDialog(source: NpmSource) {
  editingSource.value = source
  formData.name = source.name
  formData.url = source.url
  formData.type = source.type
  formData.description = source.description || ''
  showDialog.value = true
}

/**
 * 关闭对话框
 */
function closeDialog() {
  showDialog.value = false
  editingSource.value = null
}

/**
 * 保存源
 */
async function saveSource() {
  try {
    // 验证
    if (!formData.name.trim() || !formData.url.trim()) {
      showMessage('请填写源名称和地址', 'error')
      return
    }

    saving.value = true

    if (editingSource.value) {
      // 更新
      const result = await put<NpmSource>(`/api/npm-sources/${editingSource.value.id}`, formData)
      if (result.success) {
        showMessage('源更新成功', 'success')
        await loadSources()
        closeDialog()
      }
    } else {
      // 创建
      const result = await post<NpmSource>('/api/npm-sources', formData)
      if (result.success) {
        showMessage('源创建成功', 'success')
        await loadSources()
        closeDialog()
      }
    }
  } catch (error: any) {
    showMessage('保存失败: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

/**
 * 删除源
 */
async function deleteSource(source: NpmSource) {
  if (!confirm(`确定要删除源 "${source.name}" 吗？`)) {
    return
  }

  try {
    const result = await del(`/api/npm-sources/${source.id}`)
    if (result.success) {
      showMessage('源删除成功', 'success')
      await loadSources()
    }
  } catch (error: any) {
    showMessage('删除失败: ' + error.message, 'error')
  }
}

/**
 * 切换源
 */
async function switchSource(source: NpmSource) {
  try {
    const result = await post(`/api/npm-sources/${source.id}/switch`, {})
    if (result.success) {
      showMessage(`已切换到 ${source.name}`, 'success')
    }
  } catch (error: any) {
    showMessage('切换源失败: ' + error.message, 'error')
  }
}

/**
 * 检测登录状态
 */
async function checkLoginStatus(source: NpmSource) {
  try {
    operatingSourceId.value = source.id
    showMessage(`正在检测 ${source.name} 的登录状态...`, 'info')
    
    const result = await get<{ isLoggedIn: boolean; username?: string }>(`/api/npm-sources/${source.id}/login-status`)
    if (result.success && result.data) {
      if (result.data.isLoggedIn) {
        showMessage(`✓ ${source.name} 已登录，用户: ${result.data.username}`, 'success')
      } else {
        showMessage(`${source.name} 未登录`, 'warning')
      }
      await loadSources()
    }
  } catch (error: any) {
    showMessage(`检测 ${source.name} 状态失败: ` + error.message, 'error')
  } finally {
    operatingSourceId.value = null
  }
}

/**
 * 显示登录对话框
 */
function showLoginDialog(source: NpmSource) {
  loginTarget.value = source
  loginFormData.username = ''
  loginFormData.password = ''
  showLoginForm.value = true
}

/**
 * 关闭登录对话框
 */
function closeLoginDialog() {
  showLoginForm.value = false
  loginTarget.value = null
}

/**
 * 执行登录
 */
async function performLogin() {
  try {
    if (!loginFormData.username.trim() || !loginFormData.password.trim()) {
      showMessage('请输入用户名和密码', 'error')
      return
    }

    if (!loginTarget.value) {
      return
    }

    loggingIn.value = true
    const sourceName = loginTarget.value.name

    const result = await post(`/api/npm-sources/${loginTarget.value.id}/login`, {
      username: loginFormData.username,
      password: loginFormData.password
    })

    if (result.success) {
      // 显示详细的成功消息
      const username = result.data?.username || loginFormData.username
      showMessage(`✓ 成功登录到 ${sourceName}，用户: ${username}`, 'success')
      
      // 先关闭对话框
      closeLoginDialog()
      
      // 延迟一点再重新加载源列表，让用户看到成功消息
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadSources()
      
      // 再次确认提示
      showMessage(`${sourceName} 已登录`, 'info')
    }
  } catch (error: any) {
    showMessage('登录失败: ' + error.message, 'error')
  } finally {
    loggingIn.value = false
  }
}

/**
 * 退出登录
 */
async function logout(source: NpmSource) {
  if (!confirm(`确定要退出 "${source.name}" 的登录吗？`)) {
    return
  }

  try {
    operatingSourceId.value = source.id
    showMessage(`正在退出 ${source.name}...`, 'info')
    
    const result = await post(`/api/npm-sources/${source.id}/logout`, {})
    if (result.success) {
      showMessage(`✓ 已退出 ${source.name} 的登录`, 'success')
      await loadSources()
    }
  } catch (error: any) {
    showMessage(`${source.name} 退出失败: ` + error.message, 'error')
  } finally {
    operatingSourceId.value = null
  }
}

/**
 * 格式化日期
 */
function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 格式化运行时间
 */
function formatUptime(ms?: number): string {
  if (!ms) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天 ${hours % 24}小时`
  if (hours > 0) return `${hours}小时 ${minutes % 60}分钟`
  if (minutes > 0) return `${minutes}分钟 ${seconds % 60}秒`
  return `${seconds}秒`
}

/**
 * 获取 Verdaccio 状态
 */
async function loadVerdaccioStatus() {
  try {
    const result = await get<any>('/api/verdaccio/status')
    if (result.success && result.data) {
      verdaccioStatus.value = result.data
    }
  } catch (error: any) {
    console.error('获取 Verdaccio 状态失败:', error)
  }
}

/**
 * 启动 Verdaccio
 */
async function startVerdaccio() {
  try {
    verdaccioLoading.value = true
    showMessage('正在启动 Verdaccio 服务...', 'info')
    
    const result = await post('/api/verdaccio/start', verdaccioConfig)
    if (result.success) {
      showMessage(result.message || 'Verdaccio 服务已启动', 'success')
      await loadVerdaccioStatus()
    } else {
      showMessage(result.message || '启动失败', 'error')
    }
  } catch (error: any) {
    showMessage('启动 Verdaccio 失败: ' + error.message, 'error')
  } finally {
    verdaccioLoading.value = false
  }
}

/**
 * 停止 Verdaccio
 */
async function stopVerdaccio() {
  try {
    verdaccioLoading.value = true
    showMessage('正在停止 Verdaccio 服务...', 'info')
    
    const result = await post('/api/verdaccio/stop', {})
    if (result.success) {
      showMessage(result.message || 'Verdaccio 服务已停止', 'success')
      await loadVerdaccioStatus()
    } else {
      showMessage(result.message || '停止失败', 'error')
    }
  } catch (error: any) {
    showMessage('停止 Verdaccio 失败: ' + error.message, 'error')
  } finally {
    verdaccioLoading.value = false
  }
}

/**
 * 重启 Verdaccio
 */
async function restartVerdaccio() {
  try {
    verdaccioLoading.value = true
    showMessage('正在重启 Verdaccio 服务...', 'info')
    
    const result = await post('/api/verdaccio/restart', verdaccioConfig)
    if (result.success) {
      showMessage(result.message || 'Verdaccio 服务已重启', 'success')
      await loadVerdaccioStatus()
    } else {
      showMessage(result.message || '重启失败', 'error')
    }
  } catch (error: any) {
    showMessage('重启 Verdaccio 失败: ' + error.message, 'error')
  } finally {
    verdaccioLoading.value = false
  }
}

/**
 * 显示 Verdaccio 配置对话框
 */
async function showVerdaccioConfigDialog() {
  showVerdaccioConfig.value = true
  configTab.value = 'basic'
  
  // 加载当前配置
  try {
    const result = await get<any>('/api/verdaccio/config')
    if (result.success && result.data) {
      verdaccioConfig.port = result.data.port || 4873
      verdaccioConfig.host = result.data.host || '127.0.0.1'
    }
  } catch (error: any) {
    console.error('加载配置失败:', error)
  }
}

/**
 * 关闭 Verdaccio 配置对话框
 */
function closeVerdaccioConfigDialog() {
  showVerdaccioConfig.value = false
  configFileContent.value = ''
}

/**
 * 保存 Verdaccio 配置
 */
async function saveVerdaccioConfig() {
  try {
    // 验证
    if (!verdaccioConfig.port || verdaccioConfig.port < 1 || verdaccioConfig.port > 65535) {
      showMessage('请输入有效的端口号 (1-65535)', 'error')
      return
    }

    if (!verdaccioConfig.host || !verdaccioConfig.host.trim()) {
      showMessage('请输入有效的主机地址', 'error')
      return
    }

    savingConfig.value = true

    const result = await put('/api/verdaccio/config', {
      port: verdaccioConfig.port,
      host: verdaccioConfig.host
    })

    if (result.success) {
      showMessage('配置已保存，请重启服务以应用新配置', 'success')
      closeVerdaccioConfigDialog()
    } else {
      showMessage(result.message || '保存配置失败', 'error')
    }
  } catch (error: any) {
    showMessage('保存配置失败: ' + error.message, 'error')
  } finally {
    savingConfig.value = false
  }
}

/**
 * 加载配置文件
 */
async function loadConfigFile() {
  configTab.value = 'file'
  
  if (configFileContent.value) {
    return // 已经加载过
  }

  try {
    loadingConfigFile.value = true

    const result = await get<any>('/api/verdaccio/config-file')
    if (result.success && result.data) {
      configFileContent.value = result.data.content || ''
    } else {
      showMessage('配置文件不存在，请先启动 Verdaccio 服务', 'warning')
    }
  } catch (error: any) {
    showMessage('加载配置文件失败: ' + error.message, 'error')
  } finally {
    loadingConfigFile.value = false
  }
}

/**
 * 保存配置文件
 */
async function saveConfigFile() {
  try {
    if (!configFileContent.value.trim()) {
      showMessage('配置文件内容不能为空', 'error')
      return
    }

    savingConfig.value = true

    const result = await post('/api/verdaccio/config-file', {
      content: configFileContent.value
    })

    if (result.success) {
      showMessage('配置文件已保存，请重启服务以应用新配置', 'success')
    } else {
      showMessage(result.message || '保存失败', 'error')
    }
  } catch (error: any) {
    showMessage('保存配置文件失败: ' + error.message, 'error')
  } finally {
    savingConfig.value = false
  }
}





/**
 * 启动定时自动检测
 */
function startAutoCheck() {
  if (autoCheckInterval.value) {
    return // 已经在运行
  }
  
  // 每 60 秒检测一次
  autoCheckInterval.value = window.setInterval(() => {
    if (autoCheckEnabled.value && sources.value.length > 0) {
      checkAllSourcesAvailability()
    }
  }, 60000) // 60秒
}

/**
 * 停止定时自动检测
 */
function stopAutoCheck() {
  if (autoCheckInterval.value) {
    clearInterval(autoCheckInterval.value)
    autoCheckInterval.value = null
  }
}

/**
 * 切换自动检测状态
 */
function toggleAutoCheck() {
  autoCheckEnabled.value = !autoCheckEnabled.value
  if (autoCheckEnabled.value) {
    showMessage('已启用自动检测', 'success')
    checkAllSourcesAvailability() // 立即检测一次
  } else {
    showMessage('已禁用自动检测', 'info')
  }
}

// 加载数据
onMounted(() => {
  loadSources()
  loadVerdaccioStatus()
  // 启动定时检测
  startAutoCheck()
})

// 组件卸载时清理
onUnmounted(() => {
  stopAutoCheck()
})
</script>

<style lang="less" scoped>
.npm-sources {
  max-width: 1400px;
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
    margin: 0 auto var(--ls-spacing-md);
    border: 3px solid var(--ldesign-border-color);
    border-top-color: var(--ldesign-brand-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.toolbar {
  display: flex;
  gap: var(--ls-spacing-md);
  margin-bottom: var(--ls-spacing-lg);

  .icon {
    margin-right: var(--ls-spacing-xs);
  }
}

.empty-state {
  text-align: center;
  padding: var(--ls-spacing-xxl);
  color: var(--ldesign-text-color-secondary);

  p {
    margin-bottom: var(--ls-spacing-lg);
  }
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--ls-spacing-lg);
}

.source-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-lg);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--ldesign-brand-color-3);
  }

  &.logged-in {
    border-left: 4px solid var(--ldesign-success-color);
  }
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--ls-spacing-md);

  .source-info {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-md);

    h3 {
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-primary);
      margin: 0;
    }

    .source-type {
      font-size: var(--ls-font-size-sm);
      padding: 2px 8px;
      border-radius: 4px;
      
      &.public {
        background: var(--ldesign-brand-color-1);
        color: var(--ldesign-brand-color);
      }

      &.private {
        background: var(--ldesign-warning-color-1);
        color: var(--ldesign-warning-color);
      }
    }
  }

  .source-status {
    display: flex;
    gap: var(--ls-spacing-xs);
    align-items: center;
    flex-wrap: wrap;

    .status-badge {
      font-size: var(--ls-font-size-sm);
      padding: 4px 12px;
      border-radius: 12px;
      background: var(--ldesign-bg-color-component);
      color: var(--ldesign-text-color-secondary);
      display: inline-flex;
      align-items: center;
      gap: 4px;

      &.logged-in {
        background: var(--ldesign-success-color-1);
        color: var(--ldesign-success-color);
      }

      &.available {
        background: var(--ldesign-success-color-1);
        color: var(--ldesign-success-color);
        font-weight: 500;
      }

      &.unavailable {
        background: var(--ldesign-danger-color-1);
        color: var(--ldesign-danger-color);
        font-weight: 500;
      }

      &.checking {
        background: var(--ldesign-brand-color-1);
        color: var(--ldesign-brand-color);
        
        .status-spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      }

      .latency-text {
        font-size: 0.85em;
        opacity: 0.8;
        margin-left: 2px;
      }
    }
  }
}

.source-body {
  margin-bottom: var(--ls-spacing-lg);

  .source-url {
    margin-bottom: var(--ls-spacing-sm);
    font-size: var(--ls-font-size-sm);

    .label {
      color: var(--ldesign-text-color-secondary);
      margin-right: var(--ls-spacing-xs);
    }

    .url {
      color: var(--ldesign-brand-color);
      word-break: break-all;
    }
  }

  .source-description {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
    margin-bottom: var(--ls-spacing-sm);
  }

  .login-info {
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);
    display: flex;
    flex-wrap: wrap;
    gap: var(--ls-spacing-xs) var(--ls-spacing-md);

    .label {
      font-weight: 500;
    }
  }
}

.source-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
  flex-wrap: wrap;
}

// 对话框样式
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-base);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-spacing-lg);
  border-bottom: 1px solid var(--ldesign-border-color);

  h2 {
    margin: 0;
    font-size: var(--ls-font-size-lg);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--ldesign-text-color-secondary);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
    }
  }
}

.dialog-body {
  padding: var(--ls-spacing-lg);

  .form-item {
    margin-bottom: var(--ls-spacing-md);

    &:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      margin-bottom: var(--ls-spacing-xs);
      font-weight: 500;
      color: var(--ldesign-text-color-primary);
    }

    input, select, textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-page);
      color: var(--ldesign-text-color-primary);
      font-size: var(--ls-font-size-base);

      &:focus {
        outline: none;
        border-color: var(--ldesign-brand-color);
      }
    }

    textarea {
      resize: vertical;
      font-family: inherit;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-spacing-lg);
  border-top: 1px solid var(--ldesign-border-color);
}

// 按钮样式
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);

  &:hover:not(:disabled) {
    background: var(--ldesign-bg-color-component-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-primary {
    background: var(--ldesign-brand-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-brand-color-hover);
    }
  }

  &.btn-secondary {
    border: 1px solid var(--ldesign-border-color);
  }

  &.btn-danger {
    background: var(--ldesign-danger-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-danger-color-hover);
    }
  }

  &.btn-warning {
    background: var(--ldesign-warning-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-warning-color-hover);
    }
  }

.btn-sm {
    padding: 6px 12px;
    font-size: var(--ls-font-size-xs);
  }
}

// Verdaccio 管理区域样式
.verdaccio-section,
.sources-section {
  margin-bottom: var(--ls-spacing-xl);
}

.section-header {
  margin-bottom: var(--ls-spacing-lg);

  h2 {
    font-size: var(--ls-font-size-lg);
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-spacing-xs);
  }

  .section-description {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
  }
}

.section-divider {
  height: 1px;
  background: var(--ldesign-border-color);
  margin: var(--ls-spacing-xxl) 0;
}

.verdaccio-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-lg);
}

.verdaccio-status {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--ls-spacing-lg);

  .status-left {
    flex: 1;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-spacing-md);

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--ldesign-text-color-secondary);
      opacity: 0.3;
    }

    .status-text {
      font-size: var(--ls-font-size-lg);
      font-weight: 600;
      color: var(--ldesign-text-color-secondary);
    }

    &.running {
      .status-dot {
        background: var(--ldesign-success-color);
        opacity: 1;
        animation: pulse 2s ease-in-out infinite;
      }

      .status-text {
        color: var(--ldesign-success-color);
      }
    }
  }

  .status-info {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-xs);

    .info-item {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);

      .label {
        font-weight: 500;
        margin-right: var(--ls-spacing-xs);
      }

      .url-link {
        color: var(--ldesign-brand-color);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;

        &:hover {
          text-decoration: underline;
        }

        .icon {
          font-size: 12px;
        }
      }
    }
  }

  .status-actions {
    display: flex;
    gap: var(--ls-spacing-sm);
    flex-wrap: wrap;
  }
}

.verdaccio-quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--ls-spacing-md);
  margin-top: var(--ls-spacing-lg);
  padding-top: var(--ls-spacing-lg);
  border-top: 1px solid var(--ldesign-border-color);
}

.quick-action-card {
  h4 {
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-spacing-sm);
  }

  .command-block {
    background: var(--ldesign-bg-color-page);
    border: 1px solid var(--ldesign-border-color);
    border-radius: 4px;
    padding: var(--ls-spacing-sm);
    font-size: var(--ls-font-size-xs);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    color: var(--ldesign-brand-color);
    overflow-x: auto;
    white-space: nowrap;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 配置对话框样式
.dialog-large {
  max-width: 800px;
}

.config-tabs {
  display: flex;
  gap: var(--ls-spacing-xs);
  margin-bottom: var(--ls-spacing-lg);
  border-bottom: 1px solid var(--ldesign-border-color);

  .tab-btn {
    padding: var(--ls-spacing-sm) var(--ls-spacing-md);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: var(--ldesign-text-color-primary);
      background: var(--ldesign-bg-color-component-hover);
    }

    &.active {
      color: var(--ldesign-brand-color);
      border-bottom-color: var(--ldesign-brand-color);
      font-weight: 500;
    }
  }
}

.config-panel {
  min-height: 300px;

  h4 {
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-spacing-md);
    margin-top: var(--ls-spacing-lg);
  }

  .form-hint {
    display: block;
    margin-top: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
  }
}

.info-box {
  padding: var(--ls-spacing-md);
  border-radius: var(--ls-border-radius-base);
  margin-bottom: var(--ls-spacing-md);
  
  &.info {
    background: var(--ldesign-brand-color-1);
    border: 1px solid var(--ldesign-brand-color-3);
    color: var(--ldesign-text-color-primary);
  }

  &.warning {
    background: var(--ldesign-warning-color-1);
    border: 1px solid var(--ldesign-warning-color-3);
    color: var(--ldesign-warning-color);
  }

  strong {
    font-weight: 600;
  }
}

.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    padding: var(--ls-spacing-sm) 0;
    border-bottom: 1px solid var(--ldesign-border-color);

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: var(--ldesign-text-color-secondary);
    }

    .value {
      color: var(--ldesign-text-color-primary);
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: var(--ls-font-size-xs);
      word-break: break-all;
      text-align: right;
      max-width: 60%;
    }
  }
}

.config-file-editor {
  width: 100%;
  min-height: 400px;
  padding: var(--ls-spacing-md);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: var(--ls-font-size-sm);
  line-height: 1.6;
  background: var(--ldesign-bg-color-page);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  color: var(--ldesign-text-color-primary);
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--ldesign-brand-color);
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--ldesign-text-color-secondary);

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin-bottom: var(--ls-spacing-md);
    border: 3px solid var(--ldesign-border-color);
    border-top-color: var(--ldesign-brand-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

</style>
