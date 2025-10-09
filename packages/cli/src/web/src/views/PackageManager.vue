<template>
  <div class="package-manager">
    <div class="page-header">
      <h1>📦 私有包管理</h1>
      <p class="page-description">管理 Verdaccio 本地私有 NPM 包</p>
    </div>

    <!-- Verdaccio 服务状态卡片 -->
    <div class="service-status-card">
      <div class="service-header">
        <div class="service-info">
          <h3>📦 Verdaccio 服务</h3>
          <div class="status-indicator" :class="{ 'running': verdaccioStatus.isRunning }">
            <span class="status-dot"></span>
            <span class="status-text">{{ verdaccioStatus.isRunning ? '运行中' : '已停止' }}</span>
          </div>
        </div>
        <div class="service-actions">
          <button 
            v-if="!verdaccioStatus.isRunning" 
            class="btn btn-primary btn-sm" 
            @click="startVerdaccio"
            :disabled="verdaccioLoading"
          >
            <span v-if="verdaccioLoading">
              <svg class="loading-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              启动中...
            </span>
            <span v-else>启动服务</span>
          </button>
          <button 
            v-else 
            class="btn btn-danger btn-sm" 
            @click="stopVerdaccio"
            :disabled="verdaccioLoading"
          >
            {{ verdaccioLoading ? '停止中...' : '停止服务' }}
          </button>
          <button 
            class="btn btn-secondary btn-sm" 
            @click="restartVerdaccio"
            :disabled="verdaccioLoading || !verdaccioStatus.isRunning"
          >
            <span v-if="verdaccioLoading">
              <svg class="loading-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              重启中...
            </span>
            <span v-else>重启</span>
          </button>
        </div>
      </div>
      <div v-if="verdaccioStatus.isRunning" class="service-details">
        <div class="detail-item">
          <span class="label">访问地址:</span>
          <a :href="verdaccioStatus.url" target="_blank" class="value link">
            {{ verdaccioStatus.url }}
          </a>
        </div>
        <div class="detail-item">
          <span class="label">PID:</span>
          <span class="value">{{ verdaccioStatus.pid || '外部管理' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">运行时间:</span>
          <span class="value">{{ formatVerdaccioUptime(verdaccioStatus.uptime) }}</span>
        </div>
      </div>
      <div v-else class="service-tip">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        <span>请先启动 Verdaccio 服务才能管理私有包</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalPackages }}</div>
          <div class="stat-label">总包数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📑</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalVersions }}</div>
          <div class="stat-label">总版本数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.recentlyUpdated.length }}</div>
          <div class="stat-label">最近更新</div>
        </div>
      </div>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索包名..." 
          class="search-input"
        />
      </div>
      <button class="btn btn-secondary" @click="loadPackages" :disabled="loading">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
        刷新
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载包列表...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredPackages.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>{{ searchQuery ? '未找到匹配的包' : '暂无私有包' }}</h3>
      <p>{{ searchQuery ? '尝试使用其他关键词搜索' : '开始发布你的第一个私有包' }}</p>
    </div>

    <!-- 包列表 -->
    <div v-else class="packages-grid">
      <div 
        v-for="pkg in filteredPackages" 
        :key="pkg.name" 
        class="package-card"
      >
        <div class="package-header">
          <div class="package-title">
            <h3>{{ pkg.name }}</h3>
            <span class="package-version">v{{ pkg.latestVersion }}</span>
          </div>
          <div class="package-actions">
            <button 
              class="btn-icon" 
              @click="showPackageDetails(pkg)"
              title="查看详情"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </button>
            <button 
              class="btn-icon btn-danger" 
              @click="confirmDelete(pkg)"
              title="删除包"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="package-body">
          <p class="package-description">{{ pkg.description || '暂无描述' }}</p>
          
          <div class="package-meta">
            <div class="meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>{{ pkg.author || '未知' }}</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ pkg.versions.length }} 个版本</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{{ formatDate(pkg.modified) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户管理区域 -->
    <div v-if="verdaccioStatus.isRunning" class="user-management-section">
      <div class="section-header">
        <h2>👥 用户管理</h2>
        <p class="section-description">管理 Verdaccio 服务器的用户和权限</p>
      </div>

      <div class="toolbar">
        <button class="btn btn-primary" @click="showAddUserDialog">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          添加用户
        </button>
        <button class="btn btn-secondary" @click="loadVerdaccioUsers" :disabled="loadingUsers">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          刷新用户列表
        </button>
      </div>

      <div v-if="loadingUsers" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载用户列表中...</p>
      </div>

      <div v-else-if="verdaccioUsers.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h3>暂无用户</h3>
        <p>添加第一个 Verdaccio 用户来开始</p>
        <button class="btn btn-primary" @click="showAddUserDialog">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          添加第一个用户
        </button>
      </div>

      <div v-else class="users-grid">
        <div v-for="user in verdaccioUsers" :key="user.username" class="user-card">
          <div class="user-header">
            <div class="user-avatar">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="user-info">
              <h3>{{ user.username }}</h3>
              <span v-if="user.email" class="user-email">{{ user.email }}</span>
            </div>
          </div>
          <div class="user-actions">
            <button 
              class="btn btn-sm btn-secondary" 
              @click="showChangePasswordDialog(user)"
              :disabled="operatingUser === user.username"
              title="修改密码"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              {{ operatingUser === user.username ? '处理中...' : '修改密码' }}
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              @click="deleteVerdaccioUser(user)"
              :disabled="operatingUser === user.username"
              title="删除用户"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              {{ operatingUser === user.username ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 包详情对话框 -->
    <div v-if="selectedPackage" class="dialog-overlay" @click="closeDetails">
      <div class="dialog dialog-large" @click.stop>
        <div class="dialog-header">
          <h2>{{ selectedPackage.name }}</h2>
          <button class="close-btn" @click="closeDetails">×</button>
        </div>

        <div class="dialog-body">
          <div class="package-details">
            <div class="detail-section">
              <h3>基本信息</h3>
              <div class="detail-item">
                <span class="label">包名:</span>
                <span class="value">{{ packageDetails?.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">最新版本:</span>
                <span class="value">{{ packageDetails?.version }}</span>
              </div>
              <div class="detail-item">
                <span class="label">描述:</span>
                <span class="value">{{ packageDetails?.description || '暂无' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">作者:</span>
                <span class="value">{{ packageDetails?.author || '未知' }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h3>版本列表</h3>
              <div class="versions-list">
                <div 
                  v-for="ver in packageDetails?.versions" 
                  :key="ver.version"
                  class="version-item"
                >
                  <div class="version-info">
                    <span class="version-number">v{{ ver.version }}</span>
                    <span class="version-date">{{ formatDate(ver.modified) }}</span>
                    <span class="version-size">{{ formatSize(ver.size) }}</span>
                  </div>
                  <button 
                    class="btn-icon btn-danger" 
                    @click="confirmDeleteVersion(selectedPackage.name, ver.version)"
                    title="删除此版本"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeDetails">关闭</button>
        </div>
      </div>
    </div>

    <!-- 添加用户对话框 -->
    <div v-if="showAddUser" class="dialog-overlay" @click="closeAddUserDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2>添加 Verdaccio 用户</h2>
          <button class="close-btn" @click="closeAddUserDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label for="user-username">用户名 *</label>
            <input 
              id="user-username" 
              v-model="userFormData.username" 
              type="text" 
              placeholder="只能包含字母、数字、下划线和连字符" 
              maxlength="50"
            />
          </div>
          <div class="form-item">
            <label for="user-password">密码 *</label>
            <input 
              id="user-password" 
              v-model="userFormData.password" 
              type="password" 
              placeholder="至少 4 个字符" 
              minlength="4"
            />
          </div>
          <div class="form-item">
            <label for="user-email">邮箱 (可选)</label>
            <input 
              id="user-email" 
              v-model="userFormData.email" 
              type="email" 
              placeholder="user@example.com" 
            />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeAddUserDialog">取消</button>
          <button class="btn btn-primary" @click="addVerdaccioUser" :disabled="savingUser">
            {{ savingUser ? '添加中...' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <div v-if="showChangePassword" class="dialog-overlay" @click="closeChangePasswordDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2>修改密码 - {{ changePasswordTarget?.username }}</h2>
          <button class="close-btn" @click="closeChangePasswordDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label for="new-password">新密码 *</label>
            <input 
              id="new-password" 
              v-model="changePasswordData.password" 
              type="password" 
              placeholder="至少 4 个字符" 
              minlength="4"
            />
          </div>
          <div class="form-item">
            <label for="confirm-password">确认密码 *</label>
            <input 
              id="confirm-password" 
              v-model="changePasswordData.confirmPassword" 
              type="password" 
              placeholder="再次输入新密码" 
              minlength="4"
            />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeChangePasswordDialog">取消</button>
          <button class="btn btn-primary" @click="changeUserPassword" :disabled="savingUser">
            {{ savingUser ? '修改中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import { useMessage } from '../composables/useMessage'

interface Package {
  name: string
  versions: string[]
  latestVersion: string
  description?: string
  author?: string
  modified: number
}

interface PackageDetails {
  name: string
  version: string
  description?: string
  author?: string | { name: string }
  versions: Array<{
    version: string
    file: string
    size: number
    modified: number
  }>
}

interface Stats {
  totalPackages: number
  totalVersions: number
  recentlyUpdated: Array<{
    name: string
    version: string
    modified: number
  }>
}

const { get, del, post, put } = useApi()
const message = useMessage()

const loading = ref(false)
const packages = ref<Package[]>([])
const searchQuery = ref('')
const selectedPackage = ref<Package | null>(null)
const packageDetails = ref<PackageDetails | null>(null)
const stats = ref<Stats>({
  totalPackages: 0,
  totalVersions: 0,
  recentlyUpdated: []
})

// 用户管理状态
const verdaccioUsers = ref<any[]>([])
const loadingUsers = ref(false)
const showAddUser = ref(false)
const showChangePassword = ref(false)
const savingUser = ref(false)
const operatingUser = ref<string | null>(null)
const changePasswordTarget = ref<any | null>(null)
const userFormData = ref({
  username: '',
  password: '',
  email: ''
})
const changePasswordData = ref({
  password: '',
  confirmPassword: ''
})

// Verdaccio 服务状态
const verdaccioStatus = ref({
  isRunning: false,
  pid: null as number | null,
  port: null as number | null,
  host: null as string | null,
  url: null as string | null,
  uptime: null as number | null
})
const verdaccioLoading = ref(false)
let statusInterval: number | null = null

const filteredPackages = computed(() => {
  if (!searchQuery.value) return packages.value
  const query = searchQuery.value.toLowerCase()
  return packages.value.filter(pkg => 
    pkg.name.toLowerCase().includes(query) ||
    (pkg.description && pkg.description.toLowerCase().includes(query))
  )
})

const loadPackages = async () => {
  try {
    loading.value = true
    const result = await get<Package[]>('/api/packages')
    if (result.success && result.data) {
      packages.value = result.data
    } else {
      // API 调用失败，但不阻塞页面显示
      console.warn('加载包列表失败:', result.message)
      packages.value = []
    }
    await loadStats()
  } catch (error: any) {
    console.error('加载包列表异常:', error)
    // 即使出错，也要设置为空数组，让页面正常显示
    packages.value = []
    message.error('加载包列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const result = await get<Stats>('/api/packages/stats/summary')
    if (result.success && result.data) {
      stats.value = result.data
    }
  } catch (error: any) {
    console.error('加载统计信息失败:', error)
  }
}

const showPackageDetails = async (pkg: Package) => {
  selectedPackage.value = pkg
  try {
    const result = await get<PackageDetails>(`/api/packages/${encodeURIComponent(pkg.name)}`)
    if (result.success && result.data) {
      packageDetails.value = result.data
    }
  } catch (error: any) {
    message.error('加载包详情失败: ' + error.message)
  }
}

const closeDetails = () => {
  selectedPackage.value = null
  packageDetails.value = null
}

const confirmDelete = async (pkg: Package) => {
  if (!confirm(`确定要删除包 ${pkg.name} 吗？这将删除所有版本，此操作不可恢复。`)) {
    return
  }

  try {
    const result = await del(`/api/packages/${encodeURIComponent(pkg.name)}`)
    if (result.success) {
      message.success('包已删除')
      await loadPackages()
      if (selectedPackage.value?.name === pkg.name) {
        closeDetails()
      }
    } else {
      message.error(result.message || '删除失败')
    }
  } catch (error: any) {
    message.error('删除失败: ' + error.message)
  }
}

const confirmDeleteVersion = async (packageName: string, version: string) => {
  if (!confirm(`确定要删除版本 ${version} 吗？此操作不可恢复。`)) {
    return
  }

  try {
    const result = await del(`/api/packages/${encodeURIComponent(packageName)}/versions/${version}`)
    if (result.success) {
      message.success('版本已删除')
      await loadPackages()
      if (selectedPackage.value) {
        await showPackageDetails(selectedPackage.value)
      }
    } else {
      message.error(result.message || '删除失败')
    }
  } catch (error: any) {
    message.error('删除失败: ' + error.message)
  }
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`

  return date.toLocaleDateString('zh-CN')
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
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

// Verdaccio 服务管理
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

const startVerdaccio = async () => {
  if (verdaccioLoading.value) {
    console.warn('Verdaccio 正在启动中，忽略重复请求')
    return
  }
  
  try {
    verdaccioLoading.value = true
    console.log('[启动服务] 开始启动 Verdaccio...')
    
    const result = await post('/api/verdaccio/start', {})
    console.log('[启动服务] API 响应:', result)
    
    if (result.success) {
      // 如果返回数据中包含状态信息，直接使用
      if (result.data) {
        console.log('[启动服务] 使用返回的状态数据:', result.data)
        verdaccioStatus.value = result.data
      }
      
      message.success('服务启动成功')
      
      // 如果已经获取到完整状态（说明是外部实例或已成功启动），直接跳过重试
      if (verdaccioStatus.value.isRunning && verdaccioStatus.value.url) {
        console.log('[启动服务] 已检测到运行中的实例，URL:', verdaccioStatus.value.url)
      } else {
        // 多次尝试获取服务状态，确保 URL 显示出来
        let retries = 0
        const maxRetries = 5
        
        while (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500))
          await loadVerdaccioStatus()
          console.log(`[启动服务] 重试 ${retries + 1}/${maxRetries}, 当前状态:`, verdaccioStatus.value)
          
          // 如果已经获取到完整状态信息（包括 URL），退出循环
          if (verdaccioStatus.value.isRunning && verdaccioStatus.value.url) {
            console.log('[启动服务] 状态确认成功，URL:', verdaccioStatus.value.url)
            break
          }
          
          retries++
        }
      }
      
      // 重新加载包列表
      await loadPackages()
      
      // 启动状态轮询
      startStatusPolling()
    } else {
      console.error('[启动服务] 失败:', result.message)
      message.error(result.message || '启动失败')
    }
  } catch (error: any) {
    console.error('[启动服务] 异常:', error)
    message.error('启动失败: ' + error.message)
  } finally {
    console.log('[启动服务] 重置 loading 状态')
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
      
      // 重新加载包列表
      await loadPackages()
    } else {
      message.error(result.message || '重启失败')
    }
  } catch (error: any) {
    message.error('重启失败: ' + error.message)
  } finally {
    verdaccioLoading.value = false
  }
}

const startStatusPolling = () => {
  if (statusInterval) return
  statusInterval = window.setInterval(() => {
    if (verdaccioStatus.value.isRunning) {
      loadVerdaccioStatus()
    }
  }, 5000)
}

const stopStatusPolling = () => {
  if (statusInterval) {
    clearInterval(statusInterval)
    statusInterval = null
  }
}

// 用户管理函数
const loadVerdaccioUsers = async () => {
  try {
    loadingUsers.value = true
    const result = await get<any[]>('/api/verdaccio/users')
    if (result.success && result.data) {
      verdaccioUsers.value = result.data
    }
  } catch (error: any) {
    message.error('加载用户列表失败: ' + error.message)
  } finally {
    loadingUsers.value = false
  }
}

const showAddUserDialog = () => {
  userFormData.value = {
    username: '',
    password: '',
    email: ''
  }
  showAddUser.value = true
}

const closeAddUserDialog = () => {
  showAddUser.value = false
}

const addVerdaccioUser = async () => {
  try {
    if (!userFormData.value.username.trim() || !userFormData.value.password.trim()) {
      message.error('请填写用户名和密码')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(userFormData.value.username)) {
      message.error('用户名只能包含字母、数字、下划线和连字符')
      return
    }

    if (userFormData.value.password.length < 4) {
      message.error('密码长度至少为 4 个字符')
      return
    }

    savingUser.value = true

    const result = await post('/api/verdaccio/users', {
      username: userFormData.value.username,
      password: userFormData.value.password,
      email: userFormData.value.email || undefined
    })

    if (result.success) {
      message.success(result.message || '用户添加成功')
      closeAddUserDialog()
      await loadVerdaccioUsers()
    } else {
      message.error(result.message || '添加用户失败')
    }
  } catch (error: any) {
    message.error('添加用户失败: ' + error.message)
  } finally {
    savingUser.value = false
  }
}

const deleteVerdaccioUser = async (user: any) => {
  if (!confirm(`确定要删除用户 "${user.username}" 吗？`)) {
    return
  }

  try {
    operatingUser.value = user.username
    const result = await del(`/api/verdaccio/users/${user.username}`)
    
    if (result.success) {
      message.success(result.message || '用户删除成功')
      await loadVerdaccioUsers()
    } else {
      message.error(result.message || '删除用户失败')
    }
  } catch (error: any) {
    message.error('删除用户失败: ' + error.message)
  } finally {
    operatingUser.value = null
  }
}

const showChangePasswordDialog = (user: any) => {
  changePasswordTarget.value = user
  changePasswordData.value = {
    password: '',
    confirmPassword: ''
  }
  showChangePassword.value = true
}

const closeChangePasswordDialog = () => {
  showChangePassword.value = false
  changePasswordTarget.value = null
}

const changeUserPassword = async () => {
  try {
    if (!changePasswordTarget.value) {
      return
    }

    if (!changePasswordData.value.password.trim()) {
      message.error('请输入新密码')
      return
    }

    if (changePasswordData.value.password.length < 4) {
      message.error('密码长度至少为 4 个字符')
      return
    }

    if (changePasswordData.value.password !== changePasswordData.value.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }

    savingUser.value = true
    operatingUser.value = changePasswordTarget.value.username

    const result = await put(`/api/verdaccio/users/${changePasswordTarget.value.username}/password`, {
      password: changePasswordData.value.password
    })

    if (result.success) {
      message.success(result.message || '密码修改成功')
      closeChangePasswordDialog()
    } else {
      message.error(result.message || '修改密码失败')
    }
  } catch (error: any) {
    message.error('修改密码失败: ' + error.message)
  } finally {
    savingUser.value = false
    operatingUser.value = null
  }
}

onMounted(async () => {
  try {
    // 先加载 Verdaccio 状态
    await loadVerdaccioStatus()
    
    // 并行加载包列表和用户列表
    await Promise.all([
      loadPackages(),
      loadVerdaccioUsers()
    ])
    
    // 如果服务正在运行，启动状态轮询
    if (verdaccioStatus.value.isRunning) {
      startStatusPolling()
    }
  } catch (error) {
    console.error('初始化页面失败:', error)
  }
})
</script>

<style lang="less" scoped>
.package-manager {
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
    margin: 0 0 8px 0;
  }

  .page-description {
    color: var(--ldesign-text-color-secondary);
    font-size: 16px;
    margin: 0;
  }
}

.service-status-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: var(--ls-spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .service-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .service-info {
      display: flex;
      align-items: center;
      gap: 16px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--ldesign-text-color-primary);
        margin: 0;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--ldesign-border-level-2-color);
          transition: all 0.3s;
        }

        .status-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--ldesign-text-color-secondary);
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
    }

    .service-actions {
      display: flex;
      gap: 8px;
    }
  }

  .service-details {
    display: flex;
    gap: 24px;
    padding: 16px;
    background: var(--ldesign-bg-color-component);
    border-radius: 8px;
    border: 1px solid var(--ldesign-border-level-1-color);

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        font-size: 13px;
        color: var(--ldesign-text-color-secondary);
      }

      .value {
        font-size: 13px;
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

  .service-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid #f59e0b;
    border-radius: 8px;
    color: var(--ldesign-text-color-secondary);
    font-size: 14px;

    svg {
      flex-shrink: 0;
      color: #f59e0b;
    }
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

.btn-sm {
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .loading-icon {
    animation: spin 0.8s linear infinite;
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
    background: var(--ldesign-bg-color-container);
    color: var(--ldesign-text-color-primary);
    border: 1.5px solid var(--ldesign-border-level-1-color);

    &:hover:not(:disabled) {
      background: var(--ldesign-bg-color-container-hover);
      border-color: var(--ldesign-brand-color);
    }
  }

  &.btn-danger {
    background: var(--ldesign-error-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-error-color-hover);
    }
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--ls-spacing-lg);
  margin-bottom: var(--ls-spacing-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .stat-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--ldesign-text-color-secondary);
    }
  }
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: var(--ls-spacing-lg);

  .search-box {
    flex: 1;
    position: relative;

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      color: var(--ldesign-text-color-secondary);
    }

    .search-input {
      width: 100%;
      height: 42px;
      padding: 0 14px 0 44px;
      font-size: 14px;
      color: var(--ldesign-text-color-primary);
      background: var(--ldesign-bg-color-container);
      border: 1.5px solid var(--ldesign-border-level-1-color);
      border-radius: 8px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: var(--ldesign-brand-color);
        box-shadow: 0 0 0 3px var(--ldesign-brand-color-focus);
      }

      &::placeholder {
        color: var(--ldesign-text-color-placeholder);
      }
    }
  }

  .btn {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 42px;
    padding: 0 20px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    svg {
      flex-shrink: 0;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.btn-secondary {
      background: var(--ldesign-bg-color-container);
      color: var(--ldesign-text-color-primary);
      border: 1.5px solid var(--ldesign-border-level-1-color);

      &:hover:not(:disabled) {
        background: var(--ldesign-bg-color-container-hover);
        border-color: var(--ldesign-brand-color);
      }
    }
  }
}

.loading {
  text-align: center;
  padding: 60px 20px;

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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    color: var(--ldesign-text-color-secondary);
    opacity: 0.5;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin: 0 0 8px 0;
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: 14px;
    margin: 0;
  }
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--ls-spacing-lg);
}

.package-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .package-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .package-title {
      flex: 1;
      min-width: 0;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--ldesign-text-color-primary);
        margin: 0 0 4px 0;
        word-break: break-all;
      }

      .package-version {
        display: inline-block;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 500;
        color: var(--ldesign-brand-color);
        background: rgba(0, 102, 255, 0.1);
        border-radius: 4px;
      }
    }

    .package-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }
  }

  .package-body {
    .package-description {
      font-size: 14px;
      color: var(--ldesign-text-color-secondary);
      line-height: 1.5;
      margin: 0 0 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .package-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--ldesign-text-color-secondary);

        svg {
          flex-shrink: 0;
        }
      }
    }
  }
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ldesign-text-color-primary);

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
    border-color: var(--ldesign-brand-color);
  }

  &.btn-danger {
    color: var(--ldesign-error-color);

    &:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--ldesign-error-color);
    }
  }
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
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog {
  background: var(--ldesign-bg-color-container);
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;

  &.dialog-large {
    max-width: 800px;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--ldesign-border-level-1-color);

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin: 0;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      font-size: 24px;
      color: var(--ldesign-text-color-secondary);
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        background: var(--ldesign-bg-color-component-hover);
        color: var(--ldesign-text-color-primary);
      }
    }
  }

  .dialog-body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  .dialog-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--ldesign-border-level-1-color);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.package-details {
  .detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--ldesign-border-level-1-color);
    }

    .detail-item {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid var(--ldesign-border-level-1-color);

      &:last-child {
        border-bottom: none;
      }

      .label {
        flex: 0 0 100px;
        font-size: 14px;
        color: var(--ldesign-text-color-secondary);
      }

      .value {
        flex: 1;
        font-size: 14px;
        color: var(--ldesign-text-color-primary);
        word-break: break-all;
      }
    }
  }

  .versions-list {
    .version-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--ldesign-bg-color-component);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: 8px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .version-info {
        flex: 1;
        display: flex;
        gap: 16px;
        align-items: center;

        .version-number {
          font-size: 14px;
          font-weight: 600;
          color: var(--ldesign-brand-color);
        }

        .version-date,
        .version-size {
          font-size: 13px;
          color: var(--ldesign-text-color-secondary);
        }
      }
    }
  }
}

// 用户管理样式
.user-management-section {
  margin: var(--ls-spacing-xxl) 0;
  padding: var(--ls-spacing-xl);
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 12px;
}

.section-header {
  margin-bottom: var(--ls-spacing-lg);

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin: 0 0 8px 0;
  }

  .section-description {
    color: var(--ldesign-text-color-secondary);
    font-size: 14px;
    margin: 0;
  }
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--ls-spacing-lg);
}

.user-card {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: var(--ldesign-brand-color-3);
  }

  .user-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .user-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--ldesign-brand-color-1), var(--ldesign-brand-color-2));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ldesign-brand-color);
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--ldesign-text-color-primary);
        margin: 0 0 4px 0;
        word-break: break-all;
      }

      .user-email {
        font-size: 13px;
        color: var(--ldesign-text-color-secondary);
        display: block;
      }
    }
  }

  .user-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ls-spacing-xxl);
  color: var(--ldesign-text-color-secondary);

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin-bottom: var(--ls-spacing-md);
    border: 3px solid var(--ldesign-border-level-1-color);
    border-top-color: var(--ldesign-brand-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-item {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ldesign-text-color-primary);
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    color: var(--ldesign-text-color-primary);
    background: var(--ldesign-bg-color-page);
    border: 1px solid var(--ldesign-border-level-1-color);
    border-radius: 6px;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;

    &:focus {
      border-color: var(--ldesign-brand-color);
      box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
    }

    &::placeholder {
      color: var(--ldesign-text-color-placeholder);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }
}
</style>
