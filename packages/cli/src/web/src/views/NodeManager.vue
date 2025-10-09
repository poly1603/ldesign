<template>
  <div class="node-manager">
    <div class="page-header">
      <h1>Node.js 管理</h1>
      <div class="header-actions">
        <button class="action-btn" @click="refreshData" :disabled="loading">
          <RefreshCw :size="18" :class="{ spinning: loading }" />
          <span>刷新</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 - 骨架屏（仅初次加载时显示）-->
    <NodeManagerSkeleton v-if="loading && initialLoading" />

    <!-- fnm 未安装 -->
    <div v-else-if="!fnmStatus.installed && !loading" class="fnm-install-section">
      <FnmInstaller :platform="fnmStatus.platform" @installed="handleFnmInstalled" />
    </div>

    <!-- Node 版本管理 -->
    <div v-else-if="!loading || !initialLoading" class="node-versions">
      <!-- 当前版本信息 -->
      <div class="current-version-card">
        <h2>
          <CheckCircle :size="20" />
          <span>当前版本</span>
        </h2>
        <div class="version-info">
          <div class="version-number">{{ displayCurrentVersion }}</div>
          <div class="version-status">
            <span class="status-dot active"></span>
            <span>正在使用</span>
            <span v-if="!nodeVersions.current && systemNodeVersion" class="system-badge">(系统)</span>
          </div>
        </div>
      </div>

      <!-- 已安装版本 -->
      <div class="installed-versions-card">
        <h2>
          <Download :size="20" />
          <span>已安装版本</span>
        </h2>
        <div v-if="nodeVersions.installed.length === 0" class="empty-state">
          <p>暂无已安装的版本</p>
        </div>
        <div v-else class="versions-grid">
          <div v-for="version in nodeVersions.installed" :key="version" class="version-item"
            :class="{ active: version === nodeVersions.current }">
            <div class="version-info">
              <div class="version-number">{{ version }}</div>
              <div class="version-actions">
                <button v-if="version !== nodeVersions.current" class="switch-btn" @click="switchVersion(version)"
                  :disabled="switching">
                  切换
                </button>
                <span v-else class="current-badge">当前</span>
                <button class="delete-btn" 
                  @click="uninstallVersion(version)"
                  :disabled="version === nodeVersions.current"
                  :title="version === nodeVersions.current ? '无法删除当前使用的版本' : '删除此版本'">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐版本 -->
      <div class="recommended-versions-card">
        <h2>
          <Star :size="20" />
          <span>推荐版本</span>
        </h2>
        <div v-if="loadingRecommended" class="skeleton-recommended-grid">
          <div v-for="i in 3" :key="`skeleton-rec-${i}`" class="skeleton-recommended-item">
            <div class="skeleton-badge"></div>
            <div class="skeleton-text skeleton-label"></div>
            <div class="skeleton-text skeleton-version-num"></div>
            <div class="skeleton-text skeleton-desc"></div>
            <div class="skeleton-btn"></div>
          </div>
        </div>
        <div v-else-if="recommendedVersions.length > 0" class="versions-grid">
          <div v-for="version in recommendedVersions" :key="version.version" 
            class="recommended-version-item"
            :class="{ installed: isVersionInstalled(version.version), recommended: version.recommended }">
            <div class="version-header">
              <div class="version-badge" :class="{ lts: version.lts, current: !version.lts }">
                {{ version.lts ? 'LTS' : 'Current' }}
              </div>
              <div v-if="version.recommended" class="recommended-badge">
                <Star :size="12" />
                推荐
              </div>
            </div>
            <div class="version-label">{{ version.label }}</div>
            <div class="version-number">{{ version.version }}</div>
            <div class="version-description">{{ version.description }}</div>
            <div class="version-actions">
              <template v-if="isVersionInstalling(version.version)">
                <button class="installing-btn" disabled>
                  <Loader2 :size="14" class="spinner" />
                  <span>安装中 {{ getVersionProgress(version.version)?.progress }}%</span>
                </button>
                <button class="view-progress-btn" @click="showInstallProgress(version.version)">
                  <Eye :size="14" />
                </button>
              </template>
              <template v-else-if="!isVersionInstalled(version.version)">
                <button class="install-recommended-btn" 
                  @click="installVersion(version.version)"
                  :disabled="installing">
                  <Download :size="14" />
                  <span>安装</span>
                </button>
              </template>
              <template v-else-if="version.version !== nodeVersions.current">
                <button class="switch-recommended-btn" 
                  @click="switchVersion(version.version)"
                  :disabled="switching">
                  <RefreshCw :size="14" />
                  <span>切换</span>
                </button>
              </template>
              <div v-else class="current-indicator">
                <CheckCircle :size="14" />
                <span>当前版本</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安装自定义版本 -->
      <div class="install-version-card">
        <h2>
          <CircleIcon :size="20" />
          <span>安装自定义版本</span>
        </h2>
        
        <!-- 搜索栏 -->
        <div class="search-bar">
          <div class="search-input-group">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索版本号，如: 18, 20.11, lts..." 
              class="version-search-input"
              @input="handleSearch"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">
              <XCircle :size="14" />
            </button>
          </div>
          
          <!-- 筛选按钮 -->
          <div class="filter-buttons">
            <button 
              :class="['filter-btn', { active: !showOnlyLTS }]"
              @click="toggleFilter(false)"
            >
              全部版本
            </button>
            <button 
              :class="['filter-btn', { active: showOnlyLTS }]"
              @click="toggleFilter(true)"
            >
              <Star :size="14" />
              仅 LTS
            </button>
            <button 
              class="sync-versions-btn"
              @click="syncVersions"
              :disabled="syncing"
              :title="syncing ? '同步中...' : '同步最新版本列表'"
            >
              <RefreshCw :size="14" :class="{ spinning: syncing }" />
              <span>同步</span>
            </button>
          </div>
        </div>
        
        <!-- 版本列表 -->
        <div class="available-versions-list">
          <!-- 加载状态 - 骨架表格 -->
          <div v-if="loadingAvailable" class="skeleton-table">
            <div class="skeleton-table-header">
              <div class="skeleton-text" style="width: 100px;"></div>
              <div class="skeleton-text" style="width: 80px;"></div>
              <div class="skeleton-text" style="width: 120px;"></div>
              <div class="skeleton-text" style="width: 100px;"></div>
              <div class="skeleton-text" style="width: 150px;"></div>
              <div class="skeleton-text" style="width: 80px;"></div>
              <div class="skeleton-text" style="width: 100px;"></div>
            </div>
            <div class="skeleton-table-body">
              <div v-for="i in 5" :key="`skeleton-row-${i}`" class="skeleton-table-row">
                <div class="skeleton-text" style="width: 90px;"></div>
                <div class="skeleton-text" style="width: 60px;"></div>
                <div class="skeleton-text" style="width: 100px;"></div>
                <div class="skeleton-text" style="width: 80px;"></div>
                <div class="skeleton-text" style="width: 120px;"></div>
                <div class="skeleton-text" style="width: 70px;"></div>
                <div class="skeleton-btn" style="width: 80px;"></div>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="availableVersions.length === 0 && !searchQuery && !loadingAvailable" class="empty-state">
            <div class="empty-icon">🚀</div>
            <h3>快速开始</h3>
            <p class="empty-main-text">上方“<strong>推荐版本</strong>”区域已展示常用 Node.js 版本，可直接安装</p>
            <div class="empty-actions">
              <p class="empty-hint">🔍 如需安装特定版本，请：</p>
              <ul class="empty-list">
                <li>在搜索框输入版本号（如 <code>18</code>, <code>20.11</code>, <code>lts</code>）</li>
                <li>或点击 <strong>“同步”</strong> 按钮获取所有可用版本</li>
              </ul>
            </div>
          </div>
          
          <div v-else-if="paginatedVersions.length === 0" class="empty-state">
            <p>未找到匹配的版本</p>
          </div>
          
          <!-- 版本表格 -->
          <div v-else class="versions-table">
            <div class="table-header">
              <div class="col-version">版本</div>
              <div class="col-type">类型</div>
              <div class="col-release">发布信息</div>
              <div class="col-engines">引擎版本</div>
              <div class="col-features">特性</div>
              <div class="col-status">状态</div>
              <div class="col-action">操作</div>
            </div>
            
            <div class="table-body">
              <div 
                v-for="item in paginatedVersions" 
                :key="item.version" 
                class="table-row"
                :class="{ 
                  installed: isVersionInstalled(item.version),
                  current: item.version === nodeVersions.current 
                }"
              >
                <!-- 版本号 -->
                <div class="col-version">
                  <div class="version-main">
                    <code class="version-number">{{ item.version }}</code>
                    <span v-if="item.majorVersion" class="major-version">v{{ item.majorVersion }}</span>
                  </div>
                </div>
                
                <!-- 类型 -->
                <div class="col-type">
                  <span v-if="item.lts" class="badge badge-lts">
                    <Star :size="10" />
                    LTS
                  </span>
                  <span v-else-if="item.status === 'Current'" class="badge badge-current">
                    Current
                  </span>
                  <span v-else class="badge badge-maintenance">
                    Maintenance
                  </span>
                  <div v-if="item.lts" class="lts-name">{{ item.lts }}</div>
                  <div v-if="item.maintenanceStatus" class="maintenance-status" :class="`status-${item.maintenanceStatus.toLowerCase()}`">
                    {{ item.maintenanceStatus }}
                  </div>
                </div>
                
                <!-- 发布信息 -->
                <div class="col-release">
                  <div v-if="item.releaseDate" class="release-date">
                    📅 {{ formatDate(item.releaseDate) }}
                  </div>
                  <div v-if="item.releaseDate" class="release-relative">
                    {{ getRelativeTime(item.releaseDate) }}
                  </div>
                  <div v-else class="release-unknown">
                    -
                  </div>
                </div>
                
                <!-- 引擎版本 -->
                <div class="col-engines">
                  <div v-if="item.npm" class="engine-item">
                    <span class="engine-label">npm</span>
                    <span class="engine-version">{{ item.npm }}</span>
                  </div>
                  <div v-if="item.v8" class="engine-item">
                    <span class="engine-label">V8</span>
                    <span class="engine-version">{{ item.v8 }}</span>
                  </div>
                  <div v-if="!item.npm && !item.v8" class="engine-unknown">
                    -
                  </div>
                </div>
                
                <!-- 特性 -->
                <div class="col-features">
                  <div class="features-list">
                    <span v-if="item.features?.fetch" class="feature-tag" title="Fetch API 支持">
                      Fetch
                    </span>
                    <span v-if="item.features?.esm" class="feature-tag" title="ES Modules 支持">
                      ESM
                    </span>
                    <span v-if="item.features?.corepack" class="feature-tag" title="Corepack 支持">
                      Corepack
                    </span>
                    <span v-if="item.features?.testRunner" class="feature-tag" title="原生测试运行器">
                      Test
                    </span>
                    <span v-if="item.features?.webStreams" class="feature-tag" title="Web Streams 支持">
                      Streams
                    </span>
                    <span v-if="item.features?.watchMode" class="feature-tag" title="Watch 模式支持">
                      Watch
                    </span>
                  </div>
                </div>
                
                <!-- 安装状态 -->
                <div class="col-status">
                  <span v-if="item.version === nodeVersions.current" class="status-current">
                    <CheckCircle :size="14" />
                    当前版本
                  </span>
                  <span v-else-if="isVersionInstalled(item.version)" class="status-installed">
                    <CheckCircle :size="14" />
                    已安装
                  </span>
                  <span v-else class="status-available">
                    未安装
                  </span>
                </div>
                
                <!-- 操作按钮 -->
                <div class="col-action">
                  <template v-if="isVersionInstalling(item.version)">
                    <button class="action-btn installing" disabled>
                      <Loader2 :size="14" class="spinner" />
                      安装中 {{ getVersionProgress(item.version)?.progress }}%
                    </button>
                  </template>
                  <template v-else-if="item.version === nodeVersions.current">
                    <span class="current-label">使用中</span>
                  </template>
                  <template v-else-if="isVersionInstalled(item.version)">
                    <button 
                      class="action-btn switch" 
                      @click="switchVersion(item.version)"
                      :disabled="switching"
                    >
                      <RefreshCw :size="14" />
                      切换
                    </button>
                  </template>
                  <template v-else>
                    <button 
                      class="action-btn install" 
                      @click="installVersion(item.version)"
                      :disabled="installing"
                    >
                      <Download :size="14" />
                      安装
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="prevPage"
            >
              上一页
            </button>
            
            <span class="page-info">
              第 {{ currentPage }} / {{ totalPages }} 页
              （共 {{ totalVersions }} 个版本）
            </span>
            
            <button 
              class="page-btn" 
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              下一页
            </button>
          </div>
        </div>
        
        <!-- 提示 -->
        <div class="install-tips">
          <p>💡 提示：</p>
          <ul>
            <li>LTS 版本适合生产环境，更稳定</li>
            <li>Current 版本包含最新特性</li>
            <li>可以搜索主版本号（如 18）或精确版本（如 20.11.0）</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-section">
      <XCircle :size="48" class="error-icon" />
      <h3>操作失败</h3>
      <p>{{ error }}</p>
      <button @click="clearError" class="retry-btn">确定</button>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-section">
      <CheckCircle :size="48" class="success-icon" />
      <h3>操作成功</h3>
      <p>{{ successMessage }}</p>
      <button @click="clearSuccess" class="ok-btn">确定</button>
    </div>

    <!-- 安装进度弹窗 -->
    <InstallProgressModal
      v-if="currentProgress"
      v-model:visible="showProgressModal"
      :title="`安装 Node.js ${currentProgressVersion}`"
      :progress-percentage="currentProgress.progress"
      :current-step="currentProgress.step"
      :logs="currentProgress.logs"
      :is-complete="currentProgress.isComplete"
      @cancel="cancelInstall"
      @close="showProgressModal = false"
      @clear-logs="clearProgressLogs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RefreshCw, Loader2, CheckCircle, XCircle, Download, Circle as CircleIcon, Star, Eye, Trash2 } from 'lucide-vue-next'
import FnmInstaller from '../components/FnmInstaller.vue'
import InstallProgressModal from '../components/InstallProgressModal.vue'
import NodeManagerSkeleton from '../components/NodeManagerSkeleton.vue'
import { useApi } from '../composables/useApi'
import { useWebSocket } from '../composables/useWebSocket'

// 安装进度数据结构
interface InstallProgress {
  version: string
  progress: number
  step: string
  logs: Array<{ time: string; message: string; type: string }>
  isComplete: boolean
}

// 响应式数据
const loading = ref(true) // 页面初次加载状态
const initialLoading = ref(true) // 初次加载标记
const installing = ref(false)
const switching = ref(false)
const loadingRecommended = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const installingVersion = ref<string | null>(null)
const versionFilter = ref<'lts' | 'latest' | 'all'>('lts')
const newVersionInput = ref('')

// 安装进度管理
const installProgressMap = ref<Map<string, InstallProgress>>(new Map())
const showProgressModal = ref(false)
const currentProgressVersion = ref<string | null>(null)

// fnm 状态
const fnmStatus = ref({
  installed: false,
  version: null,
  platform: 'unknown'
})

// Node 版本信息
const nodeVersions = ref({
  installed: [] as string[],
  current: null as string | null,
  available: [] as any[]
})

// 系统 Node 版本
const systemNodeVersion = ref<string | null>(null)

// 可用版本列表
const availableVersions = ref<Array<{ version: string; lts: string | null }>>([])
const loadingAvailable = ref(false)
const syncing = ref(false) // 同步状态
const searchQuery = ref('')
const showOnlyLTS = ref(false)
const currentPage = ref(1)
const pageSize = ref(10) // 减少到 10 个，初始加载更快
const totalVersions = ref(0)
const totalPages = ref(0)

// 推荐版本列表
const recommendedVersions = ref<any[]>([])

// 推荐版本缓存
const recommendedVersionsCache = ref<{ data: any[], timestamp: number } | null>(null)
const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

// 分页后的版本列表（后端已分页，直接使用）
const paginatedVersions = computed(() => {
  return availableVersions.value
})

// 检查版本是否已安装
const isVersionInstalled = (version: string) => {
  return nodeVersions.value.installed.some(v => v.includes(version) || version.includes(v))
}

// 检查版本是否正在安装
const isVersionInstalling = (version: string) => {
  const progress = installProgressMap.value.get(version)
  return progress && !progress.isComplete
}

// 获取版本安装进度
const getVersionProgress = (version: string) => {
  return installProgressMap.value.get(version)
}

// 当前进度数据（用于弹窗）
const currentProgress = computed(() => {
  if (!currentProgressVersion.value) return null
  return installProgressMap.value.get(currentProgressVersion.value)
})

// 显示的当前版本（优先显示管理工具版本，否则显示系统版本）
const displayCurrentVersion = computed(() => {
  return nodeVersions.value.current || systemNodeVersion.value || 'N/A'
})

// API 实例
const api = useApi()

// WebSocket 实例
const { subscribe } = useWebSocket()

// WebSocket 消息监听
let unsubscribeList: (() => void)[] = []

// 检查 fnm 状态
const checkFnmStatus = async () => {
  try {
    const response = await api.get('/api/fnm/status')
    if (response.success) {
      fnmStatus.value = response.data
    }
  } catch (err) {
    console.error('检查 fnm 状态失败:', err)
  }
}

// 获取系统 Node 版本
const getSystemNodeVersion = async () => {
  try {
    const response = await api.get('/api/system/node-version')
    if (response.success && response.data.version) {
      systemNodeVersion.value = response.data.version
    }
  } catch (err) {
    console.error('获取系统 Node 版本失败:', err)
  }
}

// 获取 Node 版本信息
const getNodeVersions = async () => {
  try {
    const response = await api.get('/api/fnm/versions')
    if (response.success) {
      nodeVersions.value = response.data
    }
    // 同时获取系统版本
    await getSystemNodeVersion()
  } catch (err) {
    console.error('获取 Node 版本失败:', err)
  }
}

// 获取可用版本列表
const fetchAvailableVersions = async (resetPage: boolean = true) => {
  loadingAvailable.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 添加调试日志
    console.log('[fetchAvailableVersions] searchQuery.value:', searchQuery.value)
    console.log('[fetchAvailableVersions] searchQuery.value.trim():', searchQuery.value.trim())
    
    if (searchQuery.value.trim()) {
      params.filter = searchQuery.value.trim()
      console.log('[fetchAvailableVersions] 添加 filter 参数:', params.filter)
    } else {
      console.log('[fetchAvailableVersions] 搜索关键词为空，不添加 filter 参数')
    }
    
    if (showOnlyLTS.value) {
      params.lts = 'true'
    }
    
    console.log('[fetchAvailableVersions] 最终请求参数:', params)
    
    const response = await api.get('/api/fnm/available-versions', { params })
    
    if (response.success) {
      const data = response.data
      availableVersions.value = data.versions || []
      totalVersions.value = data.total || 0
      totalPages.value = data.totalPages || 0
      
      // 调试：检查第一个版本的数据结构
      if (data.versions && data.versions.length > 0) {
        console.log('[fetchAvailableVersions] 第一个版本数据:', data.versions[0])
        console.log('[fetchAvailableVersions] releaseDate:', data.versions[0].releaseDate)
        console.log('[fetchAvailableVersions] npm:', data.versions[0].npm)
        console.log('[fetchAvailableVersions] features:', data.versions[0].features)
      }
      
      // 如果需要重置页码
      if (resetPage && currentPage.value !== data.page) {
        currentPage.value = data.page
      }
    }
  } catch (err) {
    console.error('获取可用版本失败:', err)
    error.value = '获取版本列表失败'
    availableVersions.value = []
    totalVersions.value = 0
    totalPages.value = 0
  } finally {
    loadingAvailable.value = false
  }
}

// 搜索处理
let searchTimer: any = null
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1 // 搜索时重置到第一页
    fetchAvailableVersions()
  }, 500) // 500ms 防抖
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchAvailableVersions()
}

// 切换筛选
const toggleFilter = (ltsOnly: boolean) => {
  showOnlyLTS.value = ltsOnly
  currentPage.value = 1 // 切换筛选时重置到第一页
  fetchAvailableVersions()
}

// 同步版本列表（清理缓存并重新获取）
const syncVersions = async () => {
  syncing.value = true
  try {
    // 清理后端缓存
    const response = await api.post('/api/fnm/clear-cache')
    if (response.success) {
      // 重置状态
      searchQuery.value = ''
      currentPage.value = 1
      availableVersions.value = []
      totalVersions.value = 0
      totalPages.value = 0
      
      // 重新获取版本列表
      await fetchAvailableVersions()
      
      successMessage.value = '版本列表已更新'
    } else {
      error.value = response.message || '同步失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '同步失败'
  } finally {
    syncing.value = false
  }
}

// 分页控制
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchAvailableVersions(false) // 不重置页码
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchAvailableVersions(false)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchAvailableVersions(false)
  }
}

// 获取推荐版本列表（带缓存）
const getRecommendedVersions = async (useCache = true) => {
  // 检查缓存
  if (useCache && recommendedVersionsCache.value) {
    const now = Date.now()
    const age = now - recommendedVersionsCache.value.timestamp
    if (age < CACHE_TTL) {
      console.log('[getRecommendedVersions] 使用缓存数据')
      recommendedVersions.value = recommendedVersionsCache.value.data
      return
    }
  }
  
  loadingRecommended.value = true
  try {
    const response = await api.get('/api/fnm/recommended-versions')
    if (response.success) {
      recommendedVersions.value = response.data
      // 更新缓存
      recommendedVersionsCache.value = {
        data: response.data,
        timestamp: Date.now()
      }
      console.log('[getRecommendedVersions] 缓存已更新')
    }
  } catch (err) {
    console.error('获取推荐版本失败:', err)
  } finally {
    loadingRecommended.value = false
  }
}

// 刷新数据（并行请求优化）
const refreshData = async () => {
  loading.value = true
  error.value = null

  try {
    await checkFnmStatus()
    if (fnmStatus.value.installed) {
      // 并行执行所有请求，提高加载速度
      await Promise.all([
        getNodeVersions(),
        getRecommendedVersions(),
        fetchAvailableVersions()
      ])
      console.log('[refreshData] 所有数据已并行加载完成')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '刷新数据失败'
  } finally {
    loading.value = false
    // 初次加载完成后，标记为非初次加载
    if (initialLoading.value) {
      initialLoading.value = false
    }
  }
}

// fnm 安装完成处理
const handleFnmInstalled = async () => {
  await refreshData()
}

// 切换版本
const switchVersion = async (version: string) => {
  switching.value = true
  error.value = null

  try {
    const response = await api.postLongOperation('/api/fnm/use', { version })
    if (response.success) {
      successMessage.value = response.data.message
      await getNodeVersions() // 刷新版本信息
    } else {
      error.value = response.message || '切换失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '切换失败'
  } finally {
    switching.value = false
  }
}

// 删除版本
const uninstallVersion = async (version: string) => {
  // 不能删除当前使用的版本
  if (version === nodeVersions.value.current) {
    error.value = '无法删除当前正在使用的版本'
    return
  }

  // 确认删除
  if (!confirm(`确定要删除 Node.js ${version} 吗？`)) {
    return
  }

  try {
    const response = await api.post('/api/fnm/uninstall-node', { version })
    if (response.success) {
      successMessage.value = response.data.message
      await getNodeVersions() // 刷新版本信息
    } else {
      error.value = response.message || '删除失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '删除失败'
  }
}

// 安装版本
const installVersion = async (version?: string) => {
  const versionToInstall = version || newVersionInput.value.trim()
  if (!versionToInstall) return

  installing.value = true
  installingVersion.value = versionToInstall
  error.value = null

  // 初始化安装进度
  const progress: InstallProgress = {
    version: versionToInstall,
    progress: 0,
    step: '准备安装...',
    logs: [{
      time: new Date().toLocaleTimeString(),
      message: `开始安装 Node.js ${versionToInstall}`,
      type: 'info'
    }],
    isComplete: false
  }
  installProgressMap.value.set(versionToInstall, progress)

  try {
    const response = await api.postLongOperation('/api/fnm/install-node', { version: versionToInstall })
    if (response.success) {
      successMessage.value = response.data.message
      if (!version) newVersionInput.value = '' // 只有手动输入时才清空
      
      // 标记安装完成
      const finalProgress = installProgressMap.value.get(versionToInstall)
      if (finalProgress) {
        finalProgress.isComplete = true
        finalProgress.progress = 100
        finalProgress.step = '安装完成'
        finalProgress.logs.push({
          time: new Date().toLocaleTimeString(),
          message: response.data.message || '安装成功',
          type: 'success'
        })
      }
      
      await getNodeVersions() // 刷新版本信息
    } else {
      error.value = response.message || '安装失败'
      
      // 标记安装失败
      const failedProgress = installProgressMap.value.get(versionToInstall)
      if (failedProgress) {
        failedProgress.isComplete = true
        failedProgress.step = '安装失败'
        failedProgress.logs.push({
          time: new Date().toLocaleTimeString(),
          message: response.message || '安装失败',
          type: 'error'
        })
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '安装失败'
    
    // 标记安装失败
    const failedProgress = installProgressMap.value.get(versionToInstall)
    if (failedProgress) {
      failedProgress.isComplete = true
      failedProgress.step = '安装失败'
      failedProgress.logs.push({
        time: new Date().toLocaleTimeString(),
        message: err instanceof Error ? err.message : '安装失败',
        type: 'error'
      })
    }
  } finally {
    installing.value = false
    installingVersion.value = null
  }
}

// 打开安装进度弹窗
const showInstallProgress = (version: string) => {
  currentProgressVersion.value = version
  showProgressModal.value = true
}

// 取消安装
const cancelInstall = async () => {
  if (!currentProgressVersion.value) return

  try {
    const response = await api.post('/api/fnm/cancel-install', { 
      version: currentProgressVersion.value 
    })
    
    if (response.success) {
      const progress = installProgressMap.value.get(currentProgressVersion.value)
      if (progress) {
        progress.isComplete = true
        progress.step = '已取消'
        progress.logs.push({
          time: new Date().toLocaleTimeString(),
          message: response.data.message || '安装已取消',
          type: 'warning'
        })
      }
      
      successMessage.value = response.data.message
      showProgressModal.value = false
      currentProgressVersion.value = null
      installing.value = false
      installingVersion.value = null
    } else {
      error.value = response.message || '取消安装失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '取消安装失败'
  }
}

// 清空日志
const clearProgressLogs = () => {
  if (currentProgressVersion.value) {
    const progress = installProgressMap.value.get(currentProgressVersion.value)
    if (progress) {
      progress.logs = []
    }
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 获取相对时间
const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 1) {
    return '今天'
  } else if (diffInDays < 7) {
    return `${diffInDays} 天前`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} 周前`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months} 月前`
  } else {
    const years = Math.floor(diffInDays / 365)
    return `${years} 年前`
  }
}

// 清除错误
const clearError = () => {
  error.value = null
}

// 清除成功消息
const clearSuccess = () => {
  successMessage.value = null
}

// 设置WebSocket消息监听
const setupWebSocketListeners = () => {
  // fnm安装相关消息
  unsubscribeList.push(subscribe('fnm-install-start', (data) => {
    installing.value = true
    console.log('fnm 安装开始:', data.message)
  }))

  unsubscribeList.push(subscribe('fnm-install-progress', (data) => {
    console.log('fnm 安装进度:', data.message)
  }))

  unsubscribeList.push(subscribe('fnm-install-complete', (data) => {
    installing.value = false
    successMessage.value = data.message
    console.log('fnm 安装完成:', data.message)
    // 刷新fnm状态
    setTimeout(() => {
      refreshData()
    }, 2000)
  }))

  unsubscribeList.push(subscribe('fnm-install-error', (data) => {
    installing.value = false
    error.value = data.message
    console.error('fnm 安装失败:', data.message)
  }))

  // Node版本安装相关消息
  unsubscribeList.push(subscribe('node-install-start', (data) => {
    installing.value = true
    installingVersion.value = data.version
    
    const progress = installProgressMap.value.get(data.version)
    if (progress) {
      progress.step = '开始下载...'
      progress.progress = 10
      progress.logs.push({
        time: new Date().toLocaleTimeString(),
        message: data.message,
        type: 'info'
      })
    }
    console.log('Node安装开始:', data.message)
  }))

  unsubscribeList.push(subscribe('node-install-progress', (data) => {
    if (data.version) {
      const progress = installProgressMap.value.get(data.version)
      if (progress) {
        progress.step = data.step || '安装中...'
        progress.progress = data.progress || progress.progress + 10
        progress.logs.push({
          time: new Date().toLocaleTimeString(),
          message: data.message,
          type: 'info'
        })
      }
    }
    console.log('Node安装进度:', data.message)
  }))

  unsubscribeList.push(subscribe('node-install-complete', (data) => {
    installing.value = false
    installingVersion.value = null
    successMessage.value = data.message
    
    if (data.version) {
      const progress = installProgressMap.value.get(data.version)
      if (progress) {
        progress.isComplete = true
        progress.progress = 100
        progress.step = '安装完成'
        progress.logs.push({
          time: new Date().toLocaleTimeString(),
          message: data.message,
          type: 'success'
        })
      }
    }
    
    console.log('Node安装完成:', data.message)
    // 刷新版本列表
    setTimeout(() => {
      getNodeVersions()
    }, 1000)
  }))

  unsubscribeList.push(subscribe('node-install-error', (data) => {
    installing.value = false
    installingVersion.value = null
    error.value = data.message
    
    if (data.version) {
      const progress = installProgressMap.value.get(data.version)
      if (progress) {
        progress.isComplete = true
        progress.step = '安装失败'
        progress.logs.push({
          time: new Date().toLocaleTimeString(),
          message: data.message,
          type: 'error'
        })
      }
    }
    
    console.error('Node安装失败:', data.message)
  }))

  // Node版本切换相关消息
  unsubscribeList.push(subscribe('node-switch-start', (data) => {
    switching.value = true
    console.log('Node切换开始:', data.message)
  }))

  unsubscribeList.push(subscribe('node-switch-complete', (data) => {
    switching.value = false
    successMessage.value = data.message
    console.log('Node切换完成:', data.message)
    // 刷新版本列表
    setTimeout(() => {
      getNodeVersions()
    }, 1000)
  }))

  unsubscribeList.push(subscribe('node-switch-error', (data) => {
    switching.value = false
    error.value = data.message
    console.error('Node切换失败:', data.message)
  }))

  // Node版本安装取消相关消息
  unsubscribeList.push(subscribe('node-install-cancelled', (data) => {
    installing.value = false
    installingVersion.value = null
    
    if (data.version) {
      const progress = installProgressMap.value.get(data.version)
      if (progress) {
        progress.isComplete = true
        progress.step = '已取消'
        progress.logs.push({
          time: new Date().toLocaleTimeString(),
          message: data.message,
          type: 'warning'
        })
      }
    }
    
    console.log('Node安装已取消:', data.message)
  }))

  // Shell 重启提示
  unsubscribeList.push(subscribe('shell-restart-needed', (data) => {
    successMessage.value = data.message + '\n\n请重新打开终端窗口以使 FNM 环境生效'
    console.log('Shell 重启提示:', data.message)
  }))
}

// 组件挂载时加载数据
onMounted(() => {
  refreshData()
  setupWebSocketListeners()
})

// 组件卸载时清理WebSocket监听
onUnmounted(() => {
  unsubscribeList.forEach(unsubscribe => unsubscribe())
  unsubscribeList = []
})
</script>

<style lang="less" scoped>
.node-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--ls-spacing-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-spacing-xl);
  padding-bottom: var(--ls-spacing-base);
  border-bottom: 1px solid var(--ldesign-border-color);

  h1 {
    font-size: var(--ls-font-size-h2);
    color: var(--ldesign-text-color-primary);
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: var(--ls-spacing-sm);

    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      padding: var(--ls-spacing-sm) var(--ls-spacing-base);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-component);
      color: var(--ldesign-text-color-primary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--ldesign-bg-color-component-hover);
        border-color: var(--ldesign-border-color-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .icon {
        font-size: 16px;
      }
    }
  }
}

.loading-section {
  text-align: center;
  padding: var(--ls-spacing-xxl);

  .loading-spinner {
    color: var(--ldesign-brand-color);
    margin-bottom: var(--ls-spacing-base);
    animation: spin 1s linear infinite;
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-base);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

.nvm-install-section {
  // 使用 NvmInstaller 组件，不需要额外样式
}

.node-versions {
  display: grid;
  gap: var(--ls-spacing-xl);
}

.current-version-card,
.installed-versions-card,
.recommended-versions-card,
.install-version-card {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-lg);

  h2 {
    font-size: var(--ls-font-size-lg);
    color: var(--ldesign-text-color-primary);
    margin: 0 0 var(--ls-spacing-base) 0;
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);

    svg {
      color: var(--ldesign-brand-color);
    }
  }
}

.current-version-card {
  .version-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .version-number {
      font-size: var(--ls-font-size-xl);
      font-weight: bold;
      color: var(--ldesign-success-color);
      font-family: 'Consolas', 'Monaco', monospace;
    }

  .version-status {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      color: var(--ldesign-success-color);
      font-size: var(--ls-font-size-sm);

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ldesign-success-color);
      }

      .system-badge {
        margin-left: var(--ls-spacing-xs);
        padding: 2px 6px;
        background: var(--ldesign-gray-color-1);
        color: var(--ldesign-text-color-secondary);
        border-radius: var(--ls-border-radius-sm);
        font-size: 10px;
      }
    }
  }
}

.versions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--ls-spacing-base);
}

.version-item {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-base);
  transition: all 0.2s ease;

  &.active {
    border-color: var(--ldesign-success-color);
    background: var(--ldesign-success-color-1);
  }

  &:hover {
    border-color: var(--ldesign-border-color-hover);
  }

  .version-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .version-number {
      font-family: 'Consolas', 'Monaco', monospace;
      font-weight: 500;
      color: var(--ldesign-text-color-primary);
    }

    .switch-btn {
      padding: 4px 12px;
      background: var(--ldesign-brand-color);
      color: white;
      border: none;
      border-radius: var(--ls-border-radius-sm);
      cursor: pointer;
      font-size: var(--ls-font-size-xs);
      transition: background-color 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--ldesign-brand-color-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .current-badge {
      padding: 4px 12px;
      background: var(--ldesign-success-color);
      color: white;
      border-radius: var(--ls-border-radius-sm);
      font-size: var(--ls-font-size-xs);
      font-weight: 500;
    }

    .delete-btn {
      padding: 4px 8px;
      background: transparent;
      color: var(--ldesign-error-color);
      border: 1px solid var(--ldesign-error-color);
      border-radius: var(--ls-border-radius-sm);
      cursor: pointer;
      font-size: var(--ls-font-size-xs);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) {
        background: var(--ldesign-error-color);
        color: white;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        border-color: var(--ldesign-border-color);
        color: var(--ldesign-text-color-disabled);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: var(--ls-spacing-xl);
  color: var(--ldesign-text-color-secondary);
}

// 推荐版本样式
.loading-versions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-spacing-xl);
  color: var(--ldesign-text-color-secondary);

  .spinner {
    animation: spin 1s linear infinite;
  }
}

.recommended-version-item {
  background: var(--ldesign-bg-color-container);
  border: 2px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-base);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);

  &.recommended {
    border-color: var(--ldesign-brand-color-2);
    background: linear-gradient(135deg, 
      var(--ldesign-brand-color-1) 0%, 
      var(--ldesign-bg-color-container) 100%);
  }

  &.installed {
    background: var(--ldesign-success-color-1);
  }

  &:hover {
    border-color: var(--ldesign-brand-color);
    box-shadow: var(--ldesign-shadow-2);
    transform: translateY(-2px);
  }

  .version-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--ls-spacing-xs);

    .version-badge {
      padding: 2px 8px;
      border-radius: var(--ls-border-radius-sm);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.lts {
        background: var(--ldesign-success-color);
        color: white;
      }

      &.current {
        background: var(--ldesign-warning-color);
        color: white;
      }
    }

    .recommended-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: var(--ldesign-brand-color);
      color: white;
      border-radius: var(--ls-border-radius-sm);
      font-size: 10px;
      font-weight: 600;
    }
  }

  .version-label {
    font-size: var(--ls-font-size-sm);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
  }

  .version-number {
    font-size: var(--ls-font-size-lg);
    font-weight: 700;
    font-family: 'Consolas', 'Monaco', monospace;
    color: var(--ldesign-brand-color);
    margin: var(--ls-spacing-xs) 0;
  }

  .version-description {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    line-height: 1.5;
    margin-bottom: var(--ls-spacing-sm);
    min-height: 36px;
  }

  .version-actions {
    display: flex;
    gap: var(--ls-spacing-xs);
    margin-top: auto;

    button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--ls-spacing-xs);
      padding: var(--ls-spacing-xs) var(--ls-spacing-sm);
      border: none;
      border-radius: var(--ls-border-radius-base);
      font-size: var(--ls-font-size-xs);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &.install-recommended-btn {
        background: var(--ldesign-brand-color);
        color: white;

        &:hover:not(:disabled) {
          background: var(--ldesign-brand-color-hover);
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &.switch-recommended-btn {
        background: var(--ldesign-success-color);
        color: white;

        &:hover:not(:disabled) {
          background: var(--ldesign-success-color-hover);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &.installing-btn {
        background: var(--ldesign-warning-color);
        color: white;
        cursor: not-allowed;

        .spinner {
          animation: spin 1s linear infinite;
        }
      }

      &.view-progress-btn {
        flex: 0 0 auto;
        padding: var(--ls-spacing-xs);
        background: var(--ldesign-bg-color-component);
        border: 1px solid var(--ldesign-border-color);
        color: var(--ldesign-brand-color);

        &:hover {
          background: var(--ldesign-bg-color-component-hover);
          border-color: var(--ldesign-brand-color);
        }
      }
    }

    .current-indicator {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--ls-spacing-xs);
      padding: var(--ls-spacing-xs) var(--ls-spacing-sm);
      background: var(--ldesign-success-color-1);
      color: var(--ldesign-success-color);
      border-radius: var(--ls-border-radius-base);
      font-size: var(--ls-font-size-xs);
      font-weight: 600;
    }
  }
}

// 搜索框和筛选按钮
.search-bar {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
  margin-bottom: var(--ls-spacing-lg);

  .search-input-group {
    position: relative;
    display: flex;
    align-items: center;

    .version-search-input {
      width: 100%;
      padding: 12px 40px 12px 16px;
      border: 2px solid var(--ldesign-border-color);
      border-radius: 10px;
      background: var(--ldesign-bg-color-container);
      color: var(--ldesign-text-color-primary);
      font-size: 14px;
      font-family: 'Consolas', 'Monaco', monospace;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      &:hover {
        border-color: var(--ldesign-brand-color-2);
      }

      &:focus {
        outline: none;
        border-color: var(--ldesign-brand-color);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        transform: translateY(-1px);
      }

      &::placeholder {
        color: var(--ldesign-text-color-placeholder);
        font-family: system-ui, -apple-system, sans-serif;
      }
    }

    .clear-search-btn {
      position: absolute;
      right: 12px;
      background: var(--ldesign-gray-color-1);
      border: none;
      color: var(--ldesign-text-color-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 6px;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        background: var(--ldesign-error-color-1);
        color: var(--ldesign-error-color);
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .filter-buttons {
    display: flex;
    gap: var(--ls-spacing-sm);
    align-items: center;
    flex-wrap: wrap;

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 2px solid var(--ldesign-border-color);
      background: var(--ldesign-bg-color-container);
      color: var(--ldesign-text-color-primary);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: var(--ldesign-brand-color-1);
        transform: translate(-50%, -50%);
        transition: width 0.4s ease, height 0.4s ease;
      }

      &:hover:not(:disabled) {
        border-color: var(--ldesign-brand-color);
        color: var(--ldesign-brand-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);

        &::before {
          width: 300px;
          height: 300px;
        }
      }

      &.active {
        background: linear-gradient(135deg, var(--ldesign-brand-color) 0%, var(--ldesign-brand-color-hover) 100%);
        color: white;
        border-color: var(--ldesign-brand-color);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);

        svg {
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
        }
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }

    .refresh-versions-btn,
    .sync-versions-btn {
      padding: 8px 10px;
      border: 2px solid var(--ldesign-border-color);
      background: var(--ldesign-bg-color-container);
      color: var(--ldesign-brand-color);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.3s ease;
      font-size: 13px;
      font-weight: 500;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, var(--ldesign-brand-color) 0%, var(--ldesign-brand-color-hover) 100%);
        color: white;
        border-color: var(--ldesign-brand-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &:active:not(:disabled) {
        transform: scale(0.95);
      }

      svg.spinning {
        animation: spin 1s linear infinite;
      }
    }
    
    .sync-versions-btn {
      padding: 8px 14px;
      background: linear-gradient(135deg, var(--ldesign-success-color-1) 0%, var(--ldesign-bg-color-container) 100%);
      border-color: var(--ldesign-success-color-2);
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, var(--ldesign-success-color) 0%, var(--ldesign-success-color-hover) 100%);
        border-color: var(--ldesign-success-color);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
    }
  }
}

// 版本表格
.available-versions-list {
  margin-top: var(--ls-spacing-base);

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--ls-spacing-base);
    padding: var(--ls-spacing-xxl);
    color: var(--ldesign-text-color-secondary);
    background: var(--ldesign-bg-color-container);
    border-radius: 12px;
    border: 2px dashed var(--ldesign-border-color);
    
    .spinner {
      animation: spin 1s linear infinite;
      color: var(--ldesign-brand-color);
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }
  
  .empty-state {
    padding: 48px 32px;
    text-align: center;
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      animation: float 3s ease-in-out infinite;
    }
    
    h3 {
      font-size: 24px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin: 0 0 12px 0;
    }
    
    .empty-main-text {
      font-size: 16px;
      color: var(--ldesign-text-color-secondary);
      margin-bottom: 24px;
      line-height: 1.6;
      
      strong {
        color: var(--ldesign-brand-color);
        font-weight: 600;
      }
    }
    
    .empty-actions {
      margin-top: 24px;
      padding: 20px;
      background: var(--ldesign-bg-color-component);
      border-radius: 8px;
      border: 1px solid var(--ldesign-border-color);
      
      .empty-hint {
        font-size: 14px;
        color: var(--ldesign-text-color-primary);
        margin: 0 0 12px 0;
        font-weight: 500;
      }
      
      .empty-list {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: left;
        
        li {
          padding: 8px 0;
          font-size: 14px;
          color: var(--ldesign-text-color-secondary);
          display: flex;
          align-items: center;
          
          &::before {
            content: '•';
            color: var(--ldesign-brand-color);
            font-weight: bold;
            display: inline-block;
            width: 1em;
            margin-right: 8px;
          }
          
          code {
            background: var(--ldesign-brand-color-1);
            color: var(--ldesign-brand-color);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;
          }
          
          strong {
            color: var(--ldesign-brand-color);
            font-weight: 600;
          }
        }
      }
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .versions-table {
    border: 2px solid var(--ldesign-border-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    background: var(--ldesign-bg-color-component);

    .table-header {
      display: grid;
      grid-template-columns: 1.5fr 1.2fr 1.3fr 1.3fr 1.8fr 1fr 1.3fr;
      gap: var(--ls-spacing-base);
      padding: 14px 20px;
      background: linear-gradient(135deg, var(--ldesign-brand-color-1) 0%, var(--ldesign-bg-color-container) 100%);
      border-bottom: 2px solid var(--ldesign-border-color);
      font-size: 12px;
      font-weight: 700;
      color: var(--ldesign-text-color-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-body {
      .table-row {
        display: grid;
        grid-template-columns: 1.5fr 1.2fr 1.3fr 1.3fr 1.8fr 1fr 1.3fr;
        gap: var(--ls-spacing-base);
        padding: 12px 20px;
        border-bottom: 1px solid var(--ldesign-border-color);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        align-items: center;
        background: var(--ldesign-bg-color-component);
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0;
          background: linear-gradient(90deg, var(--ldesign-brand-color-1), transparent);
          transition: width 0.3s ease;
        }

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: var(--ldesign-bg-color-container);
          transform: translateX(4px);

          &::before {
            width: 4px;
          }
        }

        &.installed {
          background: linear-gradient(90deg, var(--ldesign-success-color-1) 0%, var(--ldesign-bg-color-component) 100%);
          
          &::before {
            background: var(--ldesign-success-color);
            width: 3px;
          }
        }

        &.current {
          background: linear-gradient(90deg, var(--ldesign-brand-color-1) 0%, var(--ldesign-bg-color-component) 100%);
          border-left: 4px solid var(--ldesign-brand-color);
          padding-left: 16px;
          box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.1);

          &::before {
            display: none;
          }

          .col-version code {
            color: var(--ldesign-brand-color);
            font-weight: 700;
            font-size: 15px;
          }
        }

        .col-version {
          .version-main {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .version-number {
              font-family: 'Consolas', 'Monaco', monospace;
              font-size: 14px;
              color: var(--ldesign-brand-color);
              font-weight: 600;
              background: var(--ldesign-brand-color-1);
              padding: 4px 10px;
              border-radius: 6px;
              display: inline-block;
            }
            
            .major-version {
              font-size: 10px;
              color: var(--ldesign-text-color-secondary);
              background: var(--ldesign-bg-color-container);
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 500;
            }
          }
        }

        .col-type {
          display: flex;
          flex-direction: column;
          gap: 4px;
          
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            width: fit-content;
            
            &.badge-lts {
              background: linear-gradient(135deg, var(--ldesign-success-color) 0%, #10b981 100%);
              color: white;
              box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
              
              svg {
                filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
              }
            }
            
            &.badge-current {
              background: linear-gradient(135deg, var(--ldesign-warning-color) 0%, #f59e0b 100%);
              color: white;
              box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
            }
            
            &.badge-maintenance {
              background: var(--ldesign-bg-color-container);
              color: var(--ldesign-text-color-secondary);
              border: 1px solid var(--ldesign-border-color);
            }
          }
          
          .lts-name {
            font-size: 11px;
            color: var(--ldesign-text-color-secondary);
            font-weight: 500;
          }
          
          .maintenance-status {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            width: fit-content;
            
            &.status-active {
              background: var(--ldesign-success-color-1);
              color: var(--ldesign-success-color);
              border: 1px solid var(--ldesign-success-color-2);
            }
            
            &.status-current {
              background: var(--ldesign-warning-color-1);
              color: var(--ldesign-warning-color);
              border: 1px solid var(--ldesign-warning-color-2);
            }
            
            &.status-maintenance {
              background: var(--ldesign-bg-color-container);
              color: var(--ldesign-text-color-tertiary);
              border: 1px solid var(--ldesign-border-color);
            }
            
            &.status-eol {
              background: var(--ldesign-error-color-1);
              color: var(--ldesign-error-color);
              border: 1px solid var(--ldesign-error-color-2);
            }
          }
        }
        
        .col-release {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 12px;
          
          .release-date {
            color: var(--ldesign-text-color-primary);
            font-weight: 500;
          }
          
          .release-relative {
            color: var(--ldesign-text-color-secondary);
            font-size: 11px;
          }
          
          .release-unknown {
            color: var(--ldesign-text-color-tertiary);
          }
        }
        
        .col-engines {
          display: flex;
          flex-direction: column;
          gap: 3px;
          
          .engine-item {
            display: flex;
            align-items: center;
            gap: 6px;
            
            .engine-label {
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              color: var(--ldesign-text-color-secondary);
              background: var(--ldesign-bg-color-container);
              padding: 2px 4px;
              border-radius: 3px;
              min-width: 32px;
              text-align: center;
            }
            
            .engine-version {
              font-size: 11px;
              font-family: 'Consolas', 'Monaco', monospace;
              color: var(--ldesign-text-color-primary);
              font-weight: 500;
            }
          }
          
          .engine-unknown {
            color: var(--ldesign-text-color-tertiary);
            font-size: 12px;
          }
        }
        
        .col-features {
          .features-list {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            
            .feature-tag {
              display: inline-block;
              padding: 2px 6px;
              background: var(--ldesign-brand-color-1);
              color: var(--ldesign-brand-color);
              border-radius: 4px;
              font-size: 9px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              border: 1px solid var(--ldesign-brand-color-2);
              cursor: help;
              transition: all 0.2s ease;
              
              &:hover {
                background: var(--ldesign-brand-color);
                color: white;
                transform: translateY(-1px);
              }
            }
          }
        }

        .col-lts {
          display: flex;
          align-items: center;

          .lts-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            background: linear-gradient(135deg, var(--ldesign-success-color) 0%, #10b981 100%);
            color: white;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);

            svg {
              filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
            }
          }

          .current-version-badge {
            display: inline-flex;
            padding: 4px 10px;
            background: linear-gradient(135deg, var(--ldesign-warning-color) 0%, #f59e0b 100%);
            color: white;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
          }
        }

        .col-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;

          .status-current {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--ldesign-brand-color);
            font-weight: 600;

            svg {
              animation: pulse 2s ease-in-out infinite;
            }
          }

          .status-installed {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--ldesign-success-color);
            font-weight: 500;
          }

          .status-available {
            color: var(--ldesign-text-color-secondary);
            font-style: italic;
          }
        }

        .col-action {
          display: flex;
          gap: 6px;

          .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 14px;
            border: none;
            border-radius: 7px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            white-space: nowrap;
            position: relative;
            overflow: hidden;

            &::before {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 0;
              height: 0;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.3);
              transform: translate(-50%, -50%);
              transition: width 0.6s ease, height 0.6s ease;
            }

            &:hover::before {
              width: 300px;
              height: 300px;
            }

            &.install {
              background: linear-gradient(135deg, var(--ldesign-brand-color) 0%, var(--ldesign-brand-color-hover) 100%);
              color: white;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

              &:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
              }

              &:active:not(:disabled) {
                transform: scale(0.95);
              }
            }

            &.switch {
              background: linear-gradient(135deg, var(--ldesign-success-color) 0%, #10b981 100%);
              color: white;
              box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);

              &:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
              }

              &:active:not(:disabled) {
                transform: scale(0.95);
              }
            }

            &.installing {
              background: linear-gradient(135deg, var(--ldesign-warning-color) 0%, #f59e0b 100%);
              color: white;
              cursor: not-allowed;
              box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);

              .spinner {
                animation: spin 1s linear infinite;
              }
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
              transform: none;
            }
          }

          .current-label {
            display: inline-flex;
            align-items: center;
            padding: 6px 14px;
            background: var(--ldesign-brand-color-1);
            color: var(--ldesign-brand-color);
            border-radius: 7px;
            font-size: 12px;
            font-weight: 700;
            border: 2px solid var(--ldesign-brand-color-2);
          }
        }
      }
    }
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

// 分页
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ls-spacing-base);
  margin-top: var(--ls-spacing-lg);
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-bg-color-container);
  border-radius: 10px;
  border: 2px solid var(--ldesign-border-color);

  .page-btn {
    padding: 8px 18px;
    border: 2px solid var(--ldesign-border-color);
    background: var(--ldesign-bg-color-component);
    color: var(--ldesign-text-color-primary);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--ldesign-brand-color) 0%, var(--ldesign-brand-color-hover) 100%);
      color: white;
      border-color: var(--ldesign-brand-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

      &::before {
        left: 100%;
      }
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }
  }

  .page-info {
    font-size: 13px;
    color: var(--ldesign-text-color-secondary);
    font-weight: 500;
    padding: 8px 16px;
    background: var(--ldesign-bg-color-component);
    border-radius: 8px;
    border: 2px solid var(--ldesign-border-color);
  }
}

.install-form {
  .input-group {
    display: flex;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-spacing-base);

    .version-input {
      flex: 1;
      padding: var(--ls-spacing-sm) var(--ls-spacing-base);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-container);
      color: var(--ldesign-text-color-primary);
      font-family: 'Consolas', 'Monaco', monospace;

      &:focus {
        outline: none;
        border-color: var(--ldesign-brand-color);
      }

      &::placeholder {
        color: var(--ldesign-text-color-placeholder);
      }
    }

    .install-version-btn {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
      background: var(--ldesign-brand-color);
      color: white;
      border: none;
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s ease;

      .spinner {
        animation: spin 1s linear infinite;
      }

      &:hover:not(:disabled) {
        background: var(--ldesign-brand-color-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .install-tips {
    background: linear-gradient(135deg, var(--ldesign-warning-color-1) 0%, var(--ldesign-bg-color-container) 100%);
    border-radius: 12px;
    padding: 16px 20px;
    font-size: 13px;
    color: var(--ldesign-text-color-secondary);
    border: 2px solid var(--ldesign-warning-color-2);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
    margin-top: var(--ls-spacing-lg);

    p {
      margin: 0 0 var(--ls-spacing-sm) 0;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }

    ul {
      margin: 0;
      padding-left: 24px;

      li {
        margin: 8px 0;
        line-height: 1.6;
        position: relative;

        &::marker {
          color: var(--ldesign-warning-color);
        }

        code {
          background: var(--ldesign-gray-color-1);
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 12px;
          color: var(--ldesign-brand-color);
          font-weight: 600;
          border: 1px solid var(--ldesign-border-color);
        }
      }
    }
  }
}

.error-section,
.success-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-xl);
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 300px;

  .error-icon {
    color: var(--ldesign-error-color);
    margin-bottom: var(--ls-spacing-base);
  }

  .success-icon {
    color: var(--ldesign-success-color);
    margin-bottom: var(--ls-spacing-base);
  }

  h3 {
    margin: 0 0 var(--ls-spacing-sm) 0;
    color: var(--ldesign-text-color-primary);
  }

  p {
    margin: 0 0 var(--ls-spacing-lg) 0;
    color: var(--ldesign-text-color-secondary);
  }

  .retry-btn,
  .ok-btn {
    padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
    border: none;
    border-radius: var(--ls-border-radius-base);
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .retry-btn {
    background: var(--ldesign-error-color);
    color: white;

    &:hover {
      background: var(--ldesign-error-color-hover);
    }
  }

  .ok-btn {
    background: var(--ldesign-success-color);
    color: white;

    &:hover {
      background: var(--ldesign-success-color-hover);
    }
  }
}

// 骨架屏样式
.skeleton-text,
.skeleton-badge,
.skeleton-btn {
  background: linear-gradient(
    90deg,
    var(--ldesign-gray-color-1) 25%,
    var(--ldesign-gray-color-2) 50%,
    var(--ldesign-gray-color-1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  height: 20px;
}

.skeleton-badge {
  width: 50px;
  height: 20px;
  border-radius: 12px;
}

.skeleton-btn {
  height: 28px;
  border-radius: var(--ls-border-radius-base);
}

.skeleton-label {
  width: 140px;
}

.skeleton-version-num {
  width: 100px;
  height: 24px;
}

.skeleton-desc {
  width: 100%;
  height: 16px;
  margin-top: var(--ls-spacing-xs);
}

.skeleton-recommended-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--ls-spacing-base);
}

.skeleton-recommended-item {
  padding: var(--ls-spacing-base);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-container);
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
}

.skeleton-table {
  border: 2px solid var(--ldesign-border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--ldesign-bg-color-component);
}

.skeleton-table-header {
  display: grid;
  grid-template-columns: 1.5fr 1.2fr 1.3fr 1.3fr 1.8fr 1fr 1.3fr;
  gap: var(--ls-spacing-base);
  padding: 14px 20px;
  background: var(--ldesign-bg-color-container);
  border-bottom: 2px solid var(--ldesign-border-color);
}

.skeleton-table-body {
  .skeleton-table-row {
    display: grid;
    grid-template-columns: 1.5fr 1.2fr 1.3fr 1.3fr 1.8fr 1fr 1.3fr;
    gap: var(--ls-spacing-base);
    padding: 12px 20px;
    border-bottom: 1px solid var(--ldesign-border-color);
    align-items: center;

    &:last-child {
      border-bottom: none;
    }
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .node-manager {
    padding: var(--ls-spacing-base);
  }

  .page-header {
    flex-direction: column;
    gap: var(--ls-spacing-base);
    text-align: center;
  }

  .versions-grid {
    grid-template-columns: 1fr;
  }

  .install-form .input-group {
    flex-direction: column;
  }
}
</style>
