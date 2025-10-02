<template>
  <div class="dependencies-tab">
    <div class="tab-header">
      <div class="header-left">
        <Package :size="20" />
        <h3>依赖管理</h3>
      </div>
      <div class="header-actions">
        <button @click="showAddDialog = true" class="btn-primary">
          <Plus :size="16" />
          <span>添加依赖</span>
        </button>
        <button @click="loadDependencies" :disabled="loading" class="btn-secondary">
          <RefreshCw :size="16" :class="{ spinning: loading }" />
          <span>刷新</span>
        </button>
        <button @click="() => checkUpdates(false)" :disabled="checking" class="btn-secondary">
          <Search :size="16" :class="{ spinning: checking }" />
          <span>{{ checking ? '检查中...' : '检查更新' }}</span>
        </button>
        <button 
          v-if="cacheInfo?.cached" 
          @click="clearCache" 
          class="btn-secondary btn-cache"
          :title="`缓存状态: ${cacheInfo.cached ? '已缓存' : '无缓存'}`"
        >
          <Trash2 :size="16" />
          <span>清除缓存</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <Loader2 :size="32" class="spinner" />
      <p>加载依赖信息...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <AlertCircle :size="32" />
      <p>{{ error }}</p>
      <button @click="loadDependencies" class="btn-secondary">重试</button>
    </div>

    <div v-else class="dependencies-content">
      <!-- 健康度面板（简化版本） -->
      <div v-if="healthData" class="health-panel-compact" @click="showHealthDialog = true">
        <div class="health-score-compact">
          <div class="score-circle-compact" :style="{ borderColor: healthData.score.color }">
            <div class="score-value-compact" :style="{ color: healthData.score.color }">
              {{ healthData.score.score }}
            </div>
            <div class="score-grade-compact">{{ healthData.score.grade }}</div>
          </div>
          <div class="score-info-compact">
            <h4>依赖健康度</h4>
            <p class="score-label-compact">{{ healthData.score.label }}</p>
          </div>
        </div>
        
        <div class="health-metrics-compact">
          <div class="metric-item-compact metric-success">
            <Check :size="16" />
            <span class="metric-value-compact">{{ healthData.metrics.upToDate }}</span>
            <span class="metric-label-compact">最新</span>
          </div>
          <div class="metric-item-compact metric-info">
            <ArrowUp :size="16" />
            <span class="metric-value-compact">{{ healthData.metrics.patchBehind }}</span>
            <span class="metric-label-compact">补丁</span>
          </div>
          <div class="metric-item-compact metric-warning">
            <TrendingUp :size="16" />
            <span class="metric-value-compact">{{ healthData.metrics.minorBehind }}</span>
            <span class="metric-label-compact">次版本</span>
          </div>
          <div class="metric-item-compact metric-danger">
            <AlertTriangle :size="16" />
            <span class="metric-value-compact">{{ healthData.metrics.majorBehind }}</span>
            <span class="metric-label-compact">主版本</span>
          </div>
        </div>
        
        <div class="view-details">
          <ChevronRight :size="16" />
          <span>点击查看详情</span>
        </div>
      </div>

      <div class="dependency-section">
        <div class="section-header">
          <h4>
            <GitBranch :size="18" />
            生产依赖 ({{ dependencies.length }})
          </h4>
        </div>
        <div v-if="dependencies.length === 0" class="empty-list">
          <p>暂无生产依赖</p>
        </div>
        <div v-else class="dependency-list">
          <div v-for="dep in dependencies" :key="dep.name" class="dependency-item">
            <div class="dep-info">
              <div class="dep-name">{{ dep.name }}</div>
              <div class="dep-versions-inline">
                <span class="version-label">当前:</span>
                <span class="version-value">{{ dep.version }}</span>
                <template v-if="dep.latestVersion">
                  <span class="version-separator">→</span>
                  <span class="version-label">最新:</span>
                  <span class="version-value latest">{{ dep.latestVersion }}</span>
                </template>
              </div>
            </div>
            <div class="dep-actions">
              <div v-if="dep.latestVersion" class="version-status" :title="getVersionComparison(dep.version, dep.latestVersion).message">
                <span 
                  class="status-indicator"
                  :style="{ backgroundColor: getVersionComparison(dep.version, dep.latestVersion).color }"
                >
                  {{ getVersionComparison(dep.version, dep.latestVersion).icon }}
                </span>
              </div>
              <button 
                v-if="dep.latestVersion && dep.latestVersion !== dep.version"
                @click="updateDependency(dep.name, dep.latestVersion, false)" 
                class="btn-icon btn-upgrade"
                title="升级到最新版本"
              >
                <ArrowUpCircle :size="16" />
              </button>
              <button @click="showVersionSelector(dep, false)" class="btn-icon" title="选择版本">
                <List :size="16" />
              </button>
              <button @click="removeDependency(dep.name, false)" class="btn-icon btn-danger" title="删除">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="dependency-section">
        <div class="section-header">
          <h4>
            <Wrench :size="18" />
            开发依赖 ({{ devDependencies.length }})
          </h4>
        </div>
        <div v-if="devDependencies.length === 0" class="empty-list">
          <p>暂无开发依赖</p>
        </div>
        <div v-else class="dependency-list">
          <div v-for="dep in devDependencies" :key="dep.name" class="dependency-item">
            <div class="dep-info">
              <div class="dep-name">{{ dep.name }}</div>
              <div class="dep-versions-inline">
                <span class="version-label">当前:</span>
                <span class="version-value">{{ dep.version }}</span>
                <template v-if="dep.latestVersion">
                  <span class="version-separator">→</span>
                  <span class="version-label">最新:</span>
                  <span class="version-value latest">{{ dep.latestVersion }}</span>
                </template>
              </div>
            </div>
            <div class="dep-actions">
              <div v-if="dep.latestVersion" class="version-status" :title="getVersionComparison(dep.version, dep.latestVersion).message">
                <span 
                  class="status-indicator"
                  :style="{ backgroundColor: getVersionComparison(dep.version, dep.latestVersion).color }"
                >
                  {{ getVersionComparison(dep.version, dep.latestVersion).icon }}
                </span>
              </div>
              <button 
                v-if="dep.latestVersion && dep.latestVersion !== dep.version"
                @click="updateDependency(dep.name, dep.latestVersion, true)" 
                class="btn-icon btn-upgrade"
                title="升级到最新版本"
              >
                <ArrowUpCircle :size="16" />
              </button>
              <button @click="showVersionSelector(dep, true)" class="btn-icon" title="选择版本">
                <List :size="16" />
              </button>
              <button @click="removeDependency(dep.name, true)" class="btn-icon btn-danger" title="删除">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 健康度详情对话框 -->
    <Modal v-model:visible="showHealthDialog" class="health-detail-modal">
      <template #title>
        <div class="health-modal-title">
          <Lightbulb :size="20" />
          <span>依赖健康度详情</span>
        </div>
      </template>
      <div class="health-dialog" v-if="healthData">
        <div class="health-detail-header">
          <div class="health-score-card-detail">
            <div class="score-circle-detail" :style="{ borderColor: healthData.score.color }">
              <div class="score-value-detail" :style="{ color: healthData.score.color }">
                {{ healthData.score.score }}
              </div>
              <div class="score-label-detail">{{ healthData.score.label }}</div>
              <div class="score-grade-detail">{{ healthData.score.grade }}</div>
            </div>
            <div class="score-info-detail">
              <h3>依赖健康度评分</h3>
              <p class="score-desc-detail">{{ getHealthDescription(healthData.score) }}</p>
              <div v-if="cacheInfo" class="cache-badge-detail" :class="{ cached: cacheInfo.cached }">
                {{ cacheInfo.cached ? '📦 使用缓存数据' : '✨ 实时数据' }}
              </div>
            </div>
          </div>
          
          <div class="health-metrics-detail">
            <div class="metric-item-detail metric-success">
              <Check :size="24" />
              <div class="metric-content-detail">
                <div class="metric-value-detail">{{ healthData.metrics.upToDate }}</div>
                <div class="metric-label-detail">最新版本</div>
              </div>
            </div>
            <div class="metric-item-detail metric-info">
              <ArrowUp :size="24" />
              <div class="metric-content-detail">
                <div class="metric-value-detail">{{ healthData.metrics.patchBehind }}</div>
                <div class="metric-label-detail">补丁落后</div>
              </div>
            </div>
            <div class="metric-item-detail metric-warning">
              <TrendingUp :size="24" />
              <div class="metric-content-detail">
                <div class="metric-value-detail">{{ healthData.metrics.minorBehind }}</div>
                <div class="metric-label-detail">次版本落后</div>
              </div>
            </div>
            <div class="metric-item-detail metric-danger">
              <AlertTriangle :size="24" />
              <div class="metric-content-detail">
                <div class="metric-value-detail">{{ healthData.metrics.majorBehind }}</div>
                <div class="metric-label-detail">主版本落后</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 优化建议 -->
        <div v-if="healthData.suggestions.length > 0" class="health-suggestions-detail">
          <h4>
            <Lightbulb :size="18" />
            优化建议
          </h4>
          <div class="suggestions-list-detail">
            <div 
              v-for="(suggestion, index) in healthData.suggestions" 
              :key="index"
              class="suggestion-item-detail"
              :class="`suggestion-${suggestion.type}`"
            >
              <div class="suggestion-icon-detail">{{ suggestion.icon }}</div>
              <div class="suggestion-content-detail">
                <div class="suggestion-title-detail">{{ suggestion.title }}</div>
                <div class="suggestion-desc-detail">{{ suggestion.description }}</div>
                <div v-if="suggestion.action" class="suggestion-action-detail">
                  <ChevronRight :size="14" />
                  {{ suggestion.action }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="showHealthDialog = false" class="btn-primary">关闭</button>
      </template>
    </Modal>

    <!-- 新增依赖对话框 -->
    <Modal v-model:visible="showAddDialog" class="add-dependency-modal">
      <template #title>
        <div class="add-modal-title">
          <Plus :size="20" />
          <span>添加依赖包</span>
        </div>
      </template>
      <div class="add-dialog">
        <div class="form-group">
          <label>搜索包</label>
          <div class="search-input-wrapper">
            <input 
              v-model="searchKeyword" 
              @input="onSearchInput"
              type="text" 
              placeholder="搜索npm包名..." 
              class="form-input"
            />
            <Search v-if="!searching" :size="16" class="search-icon" />
            <Loader2 v-else :size="16" class="search-icon spinning" />
          </div>
        </div>

        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0" class="search-results">
          <div class="results-header">
            <div class="results-title">
              <Search :size="16" />
              <span>找到 <strong>{{ searchResults.length }}</strong> 个包</span>
            </div>
            <div class="source-tags">
              <span 
                v-for="source in searchSources" 
                :key="source.name"
                class="source-tag"
                :class="{ error: !source.success }"
              >
                {{ source.name }} ({{ source.count }})
              </span>
            </div>
          </div>
          <div class="results-list">
            <div 
              v-for="pkg in searchResults.slice(0, 10)" 
              :key="pkg.name"
              class="result-item"
              :class="{ selected: selectedPackage?.name === pkg.name }"
              @click="selectPackage(pkg)"
            >
              <div class="result-main">
                <div class="result-header">
                  <div class="result-name">{{ pkg.name }}</div>
                  <div class="result-version-badge">v{{ pkg.version }}</div>
                </div>
                <div v-if="pkg.description" class="result-desc" :title="pkg.description">
                  {{ pkg.description }}
                </div>
                <div class="result-footer">
                  <div class="result-sources">
                    <span 
                      v-for="source in pkg.sources" 
                      :key="source"
                      class="source-badge"
                    >
                      {{ source }}
                    </span>
                  </div>
                  <div v-if="selectedPackage?.name === pkg.name" class="selected-indicator">
                    <Check :size="14" />
                    <span>已选择</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 选中的包 -->
        <div v-if="selectedPackage" class="selected-package">
          <div class="form-group">
            <label>已选择: {{ selectedPackage.name }}</label>
            <input 
              v-model="installVersion" 
              type="text" 
              :placeholder="`默认: ${selectedPackage.version}`" 
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="newDep.isDev" type="checkbox" />
              <span>安装为开发依赖</span>
            </label>
          </div>
        </div>

        <!-- 无搜索结果 -->
        <div v-else-if="searched && searchResults.length === 0" class="no-results">
          <p>未找到相关包</p>
        </div>
      </div>
      <template #footer>
        <button @click="closeAddDialog" class="btn-secondary">取消</button>
        <button 
          @click="installSelectedPackage" 
          :disabled="!selectedPackage || adding" 
          class="btn-primary"
        >
          {{ adding ? '安装中...' : '安装' }}
        </button>
      </template>
    </Modal>

    <!-- 版本选择对话框 -->
    <Modal v-model:visible="showVersionDialog" :show-footer="false">
      <template #title>选择版本 - {{ selectedDep?.name }}</template>
      <div class="version-dialog">
        <div v-if="loadingVersions" class="loading-versions">
          <Loader2 :size="24" class="spinner" />
          <p>加载版本列表...</p>
        </div>
        <div v-else-if="versions.length > 0" class="version-list">
          <div class="current-version">
            当前版本: <strong>{{ selectedDep?.version }}</strong>
          </div>
          <div class="version-options">
            <label 
              v-for="ver in versions.slice(0, 20)" 
              :key="ver" 
              class="version-option"
              :class="{ active: ver === selectedVersion }"
            >
              <input 
                v-model="selectedVersion" 
                type="radio" 
                :value="ver" 
                name="version"
              />
              <span>{{ ver }}</span>
              <span v-if="ver === selectedDep?.latestVersion" class="badge-latest">最新</span>
              <span v-if="ver === selectedDep?.version" class="badge-current">当前</span>
            </label>
          </div>
        </div>
        <div v-else class="empty-versions">
          <p>无法加载版本列表</p>
        </div>
      </div>
      <template #footer>
        <button @click="showVersionDialog = false" class="btn-secondary">取消</button>
        <button 
          @click="updateToSelectedVersion" 
          :disabled="!selectedVersion || selectedVersion === selectedDep?.version"
          class="btn-primary"
        >
          更新
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Package, RefreshCw, Search, Loader2, AlertCircle, 
  GitBranch, Wrench, Tag, ArrowUpCircle, Check, Plus,
  Settings2, Trash2, List, TrendingUp, ArrowUp,
  AlertTriangle, Lightbulb, ChevronRight
} from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { useMessage } from '../../composables/useMessage'
import { useConfirm } from '../../composables/useConfirm'
import Modal from '../Modal.vue'
import { compareVersions } from '../../utils/versionCompare'
import { 
  getHealthDescription,
  type DependencyHealth
} from '../../utils/dependencyHealth'

interface Props {
  projectPath: string
}

interface Dependency {
  name: string
  version: string
  latestVersion?: string
}

const props = defineProps<Props>()
const api = useApi()
const message = useMessage()
const confirm = useConfirm()

const loading = ref(true)
const checking = ref(false)
const error = ref('')
const dependencies = ref<Dependency[]>([])
const devDependencies = ref<Dependency[]>([])

// 健康度弹窗
const showHealthDialog = ref(false)

// 新增依赖
const showAddDialog = ref(false)
const adding = ref(false)
const newDep = ref({
  name: '',
  version: '',
  isDev: false
})

// 包搜索
const searchKeyword = ref('')
const searching = ref(false)
const searched = ref(false)
const searchResults = ref<any[]>([])
const searchSources = ref<any[]>([])
const selectedPackage = ref<any>(null)
const installVersion = ref('')
let searchTimer: any = null

// 健康度数据
const healthData = ref<DependencyHealth | null>(null)
const loadingHealth = ref(false)
const cacheInfo = ref<{ cached: boolean; cacheAge?: number; cacheExpiry?: string } | null>(null)

// 版本选择
const showVersionDialog = ref(false)
const loadingVersions = ref(false)
const versions = ref<string[]>([])
const selectedDep = ref<Dependency & { isDev: boolean } | null>(null)
const selectedVersion = ref('')

const loadDependencies = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get(`/api/package-json`, {
      params: { projectPath: props.projectPath }
    })
    
    if (response.success && response.data) {
      const pkg = response.data
      
      dependencies.value = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
        name,
        version: version as string
      }))
      
      devDependencies.value = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
        name,
        version: version as string
      }))
    } else {
      error.value = response.message || '加载失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

const checkUpdates = async (forceRefresh = false, silent = false) => {
  checking.value = true
  
  try {
    const allDeps = [
      ...dependencies.value.map(d => ({ ...d, isDev: false })),
      ...devDependencies.value.map(d => ({ ...d, isDev: true }))
    ]
    
    const response = await api.post('/api/dependencies/check-updates', {
      projectPath: props.projectPath,
      dependencies: allDeps.map(d => ({ name: d.name, version: d.version })),
      forceRefresh
    })
    
    if (response.success && response.data) {
      const updates = response.data.versions || response.data
      const fromCache = response.data.fromCache || false
      
      dependencies.value = dependencies.value.map(dep => ({
        ...dep,
        latestVersion: updates[dep.name] || dep.version
      }))
      
      devDependencies.value = devDependencies.value.map(dep => ({
        ...dep,
        latestVersion: updates[dep.name] || dep.version
      }))
      
      const updateCount = Object.keys(updates).filter(
        name => updates[name] !== (allDeps.find(d => d.name === name)?.version)
      ).length
      
      if (!silent) {
        if (updateCount > 0) {
          message.success(`发现 ${updateCount} 个依赖有新版本${fromCache ? ' (来自缓存)' : ''}`)
        } else {
          message.info(`所有依赖都是最新版本${fromCache ? ' (来自缓存)' : ''}`)
        }
      }
      
      // 获取健康度数据
      await loadHealthData()
    } else {
      if (!silent) {
        message.error(response.message || '检查更新失败')
      }
    }
  } catch (err) {
    if (!silent) {
      message.error(err instanceof Error ? err.message : '检查更新失败')
    }
  } finally {
    checking.value = false
  }
}

const updateDependency = async (name: string, version: string, isDev: boolean) => {
  try {
    const response = await api.post('/api/dependencies/update', {
      projectPath: props.projectPath,
      name,
      version,
      isDev
    })
    
    if (response.success) {
      message.success(`${name} 已升级到 ${version}`)
      await loadDependencies()
    } else {
      message.error(response.message || '升级失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '升级失败')
  }
}

const removeDependency = async (name: string, isDev: boolean) => {
  const confirmed = await confirm.show({
    title: '删除依赖',
    message: `确定要删除 ${name} 吗？`,
    type: 'warning'
  })
  
  if (!confirmed) return
  
  try {
    const response = await api.post('/api/dependencies/remove', {
      projectPath: props.projectPath,
      name,
      isDev
    })
    
    if (response.success) {
      message.success(`${name} 已删除`)
      await loadDependencies()
    } else {
      message.error(response.message || '删除失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

const addDependency = async () => {
  if (!newDep.value.name) return
  
  adding.value = true
  try {
    const response = await api.post('/api/dependencies/add', {
      projectPath: props.projectPath,
      name: newDep.value.name,
      version: newDep.value.version || 'latest',
      isDev: newDep.value.isDev
    })
    
    if (response.success) {
      message.success(`${newDep.value.name} 已安装`)
      showAddDialog.value = false
      newDep.value = { name: '', version: '', isDev: false }
      await loadDependencies()
    } else {
      message.error(response.message || '安装失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '安装失败')
  } finally {
    adding.value = false
  }
}

const showVersionSelector = async (dep: Dependency, isDev: boolean) => {
  selectedDep.value = { ...dep, isDev }
  selectedVersion.value = dep.version
  showVersionDialog.value = true
  loadingVersions.value = true
  
  try {
    const response = await api.post('/api/dependencies/versions', {
      projectPath: props.projectPath,
      name: dep.name
    })
    
    if (response.success && response.data) {
      versions.value = response.data
    } else {
      message.error(response.message || '获取版本列表失败')
      versions.value = []
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '获取版本列表失败')
    versions.value = []
  } finally {
    loadingVersions.value = false
  }
}

const updateToSelectedVersion = async () => {
  if (!selectedDep.value || !selectedVersion.value) return
  
  await updateDependency(
    selectedDep.value.name,
    selectedVersion.value,
    selectedDep.value.isDev
  )
  
  showVersionDialog.value = false
}

// 版本比较
const getVersionComparison = (currentVersion: string, latestVersion: string) => {
  return compareVersions(currentVersion, latestVersion)
}

// 从后端加载健康度数据
const loadHealthData = async () => {
  if (dependencies.value.length === 0 && devDependencies.value.length === 0) {
    return
  }
  
  loadingHealth.value = true
  
  try {
    const allDeps = [
      ...dependencies.value.map(d => ({ ...d, isDev: false })),
      ...devDependencies.value.map(d => ({ ...d, isDev: true }))
    ]
    
    const response = await api.post('/api/dependencies/analyze-health', {
      projectPath: props.projectPath,
      dependencies: allDeps
    })
    
    if (response.success && response.data) {
      healthData.value = response.data.health
      cacheInfo.value = response.data.cacheStatus
      
      // TODO: 未来集成 AI 建议
      // if (response.data.aiSuggestions) {
      //   healthData.value.suggestions.push(...response.data.aiSuggestions)
      // }
    }
  } catch (err) {
    console.error('加载健康度数据失败:', err)
  } finally {
    loadingHealth.value = false
  }
}

// 清除缓存
const clearCache = async () => {
  try {
    const response = await api.post('/api/dependencies/clear-cache', {
      projectPath: props.projectPath
    })
    
    if (response.success) {
      message.success('缓存已清除')
      await checkUpdates(true) // 强制刷新
    } else {
      message.error(response.message || '清除缓存失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '清除缓存失败')
  }
}

// 搜索包
const onSearchInput = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    searched.value = false
    return
  }
  
  searchTimer = setTimeout(() => {
    searchPackages()
  }, 500) // 500ms 防抖
}

const searchPackages = async () => {
  if (!searchKeyword.value.trim()) return
  
  searching.value = true
  searched.value = false
  
  try {
    const response = await api.post('/api/dependencies/search', {
      keyword: searchKeyword.value.trim(),
      registries: [] // 使用默认源
    })
    
    if (response.success && response.data) {
      searchResults.value = response.data.packages || []
      searchSources.value = response.data.sources || []
      searched.value = true
    } else {
      message.error(response.message || '搜索失败')
      searchResults.value = []
      searchSources.value = []
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '搜索失败')
    searchResults.value = []
    searchSources.value = []
  } finally {
    searching.value = false
    searched.value = true
  }
}

const selectPackage = (pkg: any) => {
  selectedPackage.value = pkg
  installVersion.value = ''
}

const closeAddDialog = () => {
  showAddDialog.value = false
  searchKeyword.value = ''
  searchResults.value = []
  searchSources.value = []
  selectedPackage.value = null
  installVersion.value = ''
  searched.value = false
  newDep.value = { name: '', version: '', isDev: false }
}

const installSelectedPackage = async () => {
  if (!selectedPackage.value) return
  
  adding.value = true
  try {
    const version = installVersion.value || selectedPackage.value.version
    
    const response = await api.post('/api/dependencies/add', {
      projectPath: props.projectPath,
      name: selectedPackage.value.name,
      version: version,
      isDev: newDep.value.isDev
    })
    
    if (response.success) {
      message.success(`${selectedPackage.value.name} 已安装`)
      closeAddDialog()
      await loadDependencies()
    } else {
      message.error(response.message || '安装失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '安装失败')
  } finally {
    adding.value = false
  }
}

onMounted(async () => {
  await loadDependencies()
  // 进入面板时自动检查更新（静默模式，使用缓存）
  if (dependencies.value.length > 0 || devDependencies.value.length > 0) {
    await checkUpdates(false, true)
  }
})
</script>

<style lang="less" scoped>
.dependencies-tab {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-color);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);

    svg {
      color: var(--ldesign-brand-color);
    }

    h3 {
      margin: 0;
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }
  }

  .header-actions {
    display: flex;
    gap: var(--ls-spacing-sm);
  }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ls-padding-xl) 0;
  gap: var(--ls-spacing-base);
  color: var(--ldesign-text-color-secondary);

  .spinner {
    animation: spin 1s linear infinite;
  }
}

.dependencies-content {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg);
}

.dependency-section {
  .section-header {
    margin-bottom: var(--ls-margin-base);

    h4 {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      margin: 0;
      font-size: var(--ls-font-size-base);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);

      svg {
        color: var(--ldesign-brand-color);
      }
    }
  }

  .empty-list {
    padding: var(--ls-padding-lg);
    text-align: center;
    color: var(--ldesign-text-color-placeholder);

    p {
      margin: 0;
    }
  }
}

.dependency-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
}

.dependency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  transition: all 0.2s ease;
  gap: var(--ls-spacing-base);

  &:hover {
    background: var(--ldesign-bg-color-container-hover);
    border-color: var(--ldesign-brand-color);
  }

  .dep-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;

    .dep-name {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }

    .dep-versions-inline {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: var(--ls-font-size-sm);

      .version-label {
        color: var(--ldesign-text-color-secondary);
        font-size: 12px;
      }

      .version-value {
        color: var(--ldesign-text-color-primary);
        font-weight: 500;

        &.latest {
          color: var(--ldesign-brand-color);
        }
      }

      .version-separator {
        color: var(--ldesign-text-color-placeholder);
        font-weight: bold;
        margin: 0 4px;
      }
    }
  }

  .dep-actions {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
  }

  .version-status {
    display: flex;
    align-items: center;

    .status-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: white;
      font-size: 14px;
      font-weight: bold;
      cursor: help;
    }
  }


  .dep-status {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    color: var(--ldesign-success-color);
    font-size: var(--ls-font-size-sm);

    .check-icon {
      flex-shrink: 0;
    }
  }
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border: 1px solid transparent;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinning {
    animation: spin 1s linear infinite;
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
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  border-color: var(--ldesign-border-color);

  &:hover:not(:disabled) {
    background: var(--ldesign-bg-color-container-hover);
    border-color: var(--ldesign-brand-color);
  }

  &.btn-cache {
    &:hover:not(:disabled) {
      background: var(--ldesign-warning-bg);
      border-color: var(--ldesign-warning-color);
      color: var(--ldesign-warning-color);
    }
  }
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  color: var(--ldesign-text-color-secondary);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--ldesign-bg-color-container-hover);
    color: var(--ldesign-brand-color);
    border-color: var(--ldesign-brand-color);
  }

  &.btn-upgrade {
    &:hover {
      background: var(--ldesign-brand-color-light);
      color: var(--ldesign-brand-color);
      border-color: var(--ldesign-brand-color);
    }
  }

  &.btn-danger {
    &:hover {
      background: var(--ldesign-danger-bg);
      color: var(--ldesign-danger-color);
      border-color: var(--ldesign-danger-color);
    }
  }
}

// 对话框样式
.add-dialog,
.version-dialog {
  padding: var(--ls-padding-base);
}

.form-group {
  margin-bottom: var(--ls-margin-base);

  label {
    display: block;
    margin-bottom: var(--ls-margin-xs);
    font-size: var(--ls-font-size-sm);
    font-weight: 500;
    color: var(--ldesign-text-color-primary);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    cursor: pointer;

    input[type="checkbox"] {
      cursor: pointer;
    }
  }
}

.form-input {
  width: 100%;
  padding: var(--ls-padding-sm);
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--ldesign-brand-color);
    box-shadow: 0 0 0 2px var(--ldesign-brand-color-light);
  }

  &::placeholder {
    color: var(--ldesign-text-color-placeholder);
  }
}

.loading-versions,
.empty-versions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ls-padding-xl);
  gap: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-secondary);

  .spinner {
    animation: spin 1s linear infinite;
  }
}

.version-list {
  .current-version {
    padding: var(--ls-padding-sm);
    margin-bottom: var(--ls-margin-base);
    background: var(--ldesign-bg-color-container);
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);

    strong {
      color: var(--ldesign-brand-color);
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
}

.version-options {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
  max-height: 400px;
  overflow-y: auto;
}

.version-option {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-sm);
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ldesign-bg-color-container-hover);
    border-color: var(--ldesign-brand-color);
  }

  &.active {
    background: var(--ldesign-brand-color-light);
    border-color: var(--ldesign-brand-color);
  }

  input[type="radio"] {
    cursor: pointer;
  }

  span {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-primary);
  }

  .badge-latest,
  .badge-current {
    margin-left: auto;
    padding: 2px 8px;
    border-radius: var(--ls-border-radius-sm);
    font-size: var(--ls-font-size-xs);
    font-weight: 500;
  }

  .badge-latest {
    background: var(--ldesign-success-bg);
    color: var(--ldesign-success-color);
  }

  .badge-current {
    background: var(--ldesign-info-bg);
    color: var(--ldesign-info-color);
  }
}

// 搜索样式
.search-input-wrapper {
  position: relative;

  .search-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ldesign-text-color-placeholder);
    pointer-events: none;
  }

  input {
    padding-right: 40px;
  }
}

.search-results {
  margin-top: var(--ls-margin-base);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ls-padding-sm) var(--ls-padding-base);
    background: var(--ldesign-bg-color-container);
    border-bottom: 1px solid var(--ldesign-border-color);
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);
  }

  .source-tags {
    display: flex;
    gap: var(--ls-spacing-xs);
  }

  .source-tag {
    padding: 2px 8px;
    background: var(--ldesign-brand-color-light);
    color: var(--ldesign-brand-color);
    border-radius: var(--ls-border-radius-sm);
    font-size: var(--ls-font-size-xs);

    &.error {
      background: var(--ldesign-danger-bg);
      color: var(--ldesign-danger-color);
    }
  }

  .results-list {
    overflow-y: auto;
    max-height: 300px;
  }
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-color);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ldesign-bg-color-container-hover);
  }

  &.selected {
    background: var(--ldesign-brand-color-light);
    border-left: 3px solid var(--ldesign-brand-color);
  }

  &:last-child {
    border-bottom: none;
  }

  .result-info {
    flex: 1;
    min-width: 0;

    .result-name {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: var(--ls-font-size-sm);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: 4px;
    }

    .result-version {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-secondary);
      margin-bottom: 4px;
    }

    .result-desc {
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-placeholder);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .result-sources {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-left: var(--ls-spacing-base);

    .source-badge {
      padding: 2px 6px;
      background: var(--ldesign-bg-color-container);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-sm);
      font-size: 10px;
      color: var(--ldesign-text-color-secondary);
    }
  }
}

.selected-package {
  margin-top: var(--ls-margin-base);
  padding: var(--ls-padding-base);
  background: var(--ldesign-brand-color-light);
  border: 1px solid var(--ldesign-brand-color);
  border-radius: var(--ls-border-radius-base);
}

.no-results {
  padding: var(--ls-padding-xl);
  text-align: center;
  color: var(--ldesign-text-color-placeholder);
}

.add-dependency-modal {
  :deep(.modal-content) {
    min-width: 600px;
    max-width: 800px;
    max-height: 80vh;
  }
  
  :deep(.modal-body) {
    max-height: 60vh;
    overflow-y: auto;
  }
}

.add-modal-title,
.health-modal-title {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  
  svg {
    color: var(--ldesign-brand-color);
  }
}

.results-title {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);
  
  strong {
    color: var(--ldesign-brand-color);
    font-weight: 600;
  }
}

.result-main {
  flex: 1;
  min-width: 0;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.result-version-badge {
  padding: 2px 8px;
  background: var(--ldesign-brand-color-light);
  color: var(--ldesign-brand-color);
  border-radius: var(--ls-border-radius-sm);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: var(--ls-font-size-xs);
  font-weight: 600;
}

.result-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.selected-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--ldesign-success-color);
  font-size: var(--ls-font-size-xs);
  font-weight: 500;
  
  svg {
    flex-shrink: 0;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 健康度面板样式（简化版）
.health-panel-compact {
  margin-bottom: var(--ls-margin-lg);
  padding: var(--ls-padding-lg);
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xl);
  
  &:hover {
    border-color: var(--ldesign-brand-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.health-score-compact {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-base);
  
  .score-circle-compact {
    position: relative;
    width: 80px;
    height: 80px;
    border: 6px solid;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--ldesign-bg-color-component);
    flex-shrink: 0;
    
    .score-value-compact {
      font-size: 24px;
      font-weight: bold;
      line-height: 1;
    }
    
    .score-grade-compact {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 24px;
      height: 24px;
      background: var(--ldesign-brand-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
  }
  
  .score-info-compact {
    h4 {
      margin: 0 0 4px 0;
      font-size: var(--ls-font-size-base);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }
    
    .score-label-compact {
      margin: 0;
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
    }
  }
}

.health-metrics-compact {
  display: flex;
  gap: var(--ls-spacing-lg);
  flex: 1;
  
  .metric-item-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-base);
    min-width: 70px;
    
    svg {
      flex-shrink: 0;
    }
    
    .metric-value-compact {
      font-size: 20px;
      font-weight: bold;
      line-height: 1;
    }
    
    .metric-label-compact {
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-secondary);
    }
    
    &.metric-success {
      svg, .metric-value-compact {
        color: #52c41a;
      }
    }
    
    &.metric-info {
      svg, .metric-value-compact {
        color: #1890ff;
      }
    }
    
    &.metric-warning {
      svg, .metric-value-compact {
        color: #fa8c16;
      }
    }
    
    &.metric-danger {
      svg, .metric-value-compact {
        color: #f5222d;
      }
    }
  }
}

.view-details {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  color: var(--ldesign-brand-color);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  
  svg {
    flex-shrink: 0;
  }
}

// 健康度详情弹窗
.health-detail-modal {
  :deep(.modal-content) {
    min-width: 700px;
    max-width: 900px;
  }
}

.health-dialog {
  padding: var(--ls-padding-base);
}

.health-detail-header {
  display: flex;
  gap: var(--ls-spacing-xl);
  margin-bottom: var(--ls-margin-xl);
  padding-bottom: var(--ls-padding-lg);
  border-bottom: 1px solid var(--ldesign-border-color);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.health-score-card-detail {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-lg);
  flex: 1;
  
  .score-circle-detail {
    position: relative;
    width: 120px;
    height: 120px;
    border: 8px solid;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--ldesign-bg-color-component);
    flex-shrink: 0;
    
    .score-value-detail {
      font-size: 36px;
      font-weight: bold;
      line-height: 1;
    }
    
    .score-label-detail {
      font-size: 12px;
      color: var(--ldesign-text-color-secondary);
      margin-top: 4px;
    }
    
    .score-grade-detail {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 32px;
      height: 32px;
      background: var(--ldesign-brand-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
  
  .score-info-detail {
    flex: 1;
    
    h3 {
      margin: 0 0 8px 0;
      font-size: var(--ls-font-size-xl);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }
    
    .score-desc-detail {
      margin: 0 0 12px 0;
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
      line-height: 1.6;
    }
    
    .cache-badge-detail {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: var(--ls-border-radius-base);
      font-size: var(--ls-font-size-xs);
      font-weight: 500;
      background: var(--ldesign-success-bg);
      color: var(--ldesign-success-color);
      border: 1px solid var(--ldesign-success-color);
      
      &.cached {
        background: var(--ldesign-info-bg);
        color: var(--ldesign-info-color);
        border: 1px solid var(--ldesign-info-color);
      }
    }
  }
}

.health-metrics-detail {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--ls-spacing-base);
  flex: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.metric-item-detail {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border: 2px solid transparent;
  
  svg {
    flex-shrink: 0;
  }
  
  .metric-content-detail {
    flex: 1;
  }
  
  .metric-value-detail {
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .metric-label-detail {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
  }
  
  &.metric-success {
    border-color: #52c41a;
    svg, .metric-value-detail {
      color: #52c41a;
    }
  }
  
  &.metric-info {
    border-color: #1890ff;
    svg, .metric-value-detail {
      color: #1890ff;
    }
  }
  
  &.metric-warning {
    border-color: #fa8c16;
    svg, .metric-value-detail {
      color: #fa8c16;
    }
  }
  
  &.metric-danger {
    border-color: #f5222d;
    svg, .metric-value-detail {
      color: #f5222d;
    }
  }
}

.health-suggestions-detail {
  h4 {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    margin: 0 0 var(--ls-margin-base) 0;
    font-size: var(--ls-font-size-base);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    
    svg {
      color: var(--ldesign-brand-color);
    }
  }
}

.suggestions-list-detail {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item-detail {
  display: flex;
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border-left: 4px solid;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .suggestion-icon-detail {
    font-size: 24px;
    line-height: 1;
    flex-shrink: 0;
  }
  
  .suggestion-content-detail {
    flex: 1;
    min-width: 0;
  }
  
  .suggestion-title-detail {
    font-size: var(--ls-font-size-sm);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin-bottom: 4px;
  }
  
  .suggestion-desc-detail {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    line-height: 1.5;
    margin-bottom: 4px;
  }
  
  .suggestion-action-detail {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-brand-color);
    font-weight: 500;
    
    svg {
      flex-shrink: 0;
    }
  }
  
  &.suggestion-success {
    border-left-color: #52c41a;
    background: rgba(82, 196, 26, 0.05);
  }
  
  &.suggestion-info {
    border-left-color: #1890ff;
    background: rgba(24, 144, 255, 0.05);
  }
  
  &.suggestion-warning {
    border-left-color: #fa8c16;
    background: rgba(250, 140, 22, 0.05);
  }
  
  &.suggestion-danger {
    border-left-color: #f5222d;
    background: rgba(245, 34, 45, 0.05);
  }
}

.health-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-margin-base);
  padding-bottom: var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-color);

  h3 {
    margin: 0;
    font-size: var(--ls-font-size-lg);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
  }

  .cache-status {
    display: flex;
    gap: var(--ls-spacing-xs);
  }

  .cache-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-xs);
    font-weight: 500;

    &.cached {
      background: var(--ldesign-info-bg);
      color: var(--ldesign-info-color);
      border: 1px solid var(--ldesign-info-color);
    }

    &.fresh {
      background: var(--ldesign-success-bg);
      color: var(--ldesign-success-color);
      border: 1px solid var(--ldesign-success-color);
    }
  }
}

.health-header {
  display: flex;
  gap: var(--ls-spacing-xl);
  margin-bottom: var(--ls-margin-lg);

  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

.health-score-card {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-lg);
  flex: 1;

  .score-circle {
    position: relative;
    width: 120px;
    height: 120px;
    border: 8px solid;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--ldesign-bg-color-component);
    flex-shrink: 0;

    .score-value {
      font-size: 32px;
      font-weight: bold;
      line-height: 1;
    }

    .score-label {
      font-size: 12px;
      color: var(--ldesign-text-color-secondary);
      margin-top: 4px;
    }

    .score-grade {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 32px;
      height: 32px;
      background: var(--ldesign-brand-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }

  .score-info {
    flex: 1;

    h3 {
      margin: 0 0 8px 0;
      font-size: var(--ls-font-size-xl);
      color: var(--ldesign-text-color-primary);
    }

    .score-desc {
      margin: 0;
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
      line-height: 1.6;
    }
  }
}

.health-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--ls-spacing-base);
  flex: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.metric-item {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  svg {
    flex-shrink: 0;
  }

  .metric-content {
    flex: 1;
  }

  .metric-value {
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 4px;
  }

  .metric-label {
    font-size: 12px;
    color: var(--ldesign-text-color-secondary);
  }

  &.metric-success {
    border-color: #52c41a;
    
    svg {
      color: #52c41a;
    }
    
    .metric-value {
      color: #52c41a;
    }
  }

  &.metric-info {
    border-color: #1890ff;
    
    svg {
      color: #1890ff;
    }
    
    .metric-value {
      color: #1890ff;
    }
  }

  &.metric-warning {
    border-color: #fa8c16;
    
    svg {
      color: #fa8c16;
    }
    
    .metric-value {
      color: #fa8c16;
    }
  }

  &.metric-danger {
    border-color: #f5222d;
    
    svg {
      color: #f5222d;
    }
    
    .metric-value {
      color: #f5222d;
    }
  }
}

.health-suggestions {
  h4 {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    margin: 0 0 var(--ls-margin-base) 0;
    font-size: var(--ls-font-size-base);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);

    svg {
      color: var(--ldesign-brand-color);
    }
  }
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
}

.suggestion-item {
  display: flex;
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border-left: 4px solid;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .suggestion-icon {
    font-size: 24px;
    line-height: 1;
    flex-shrink: 0;
  }

  .suggestion-content {
    flex: 1;
    min-width: 0;
  }

  .suggestion-title {
    font-size: var(--ls-font-size-sm);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin-bottom: 4px;
  }

  .suggestion-desc {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    line-height: 1.5;
    margin-bottom: 4px;
  }

  .suggestion-action {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-brand-color);
    font-weight: 500;

    svg {
      flex-shrink: 0;
    }
  }

  &.suggestion-success {
    border-left-color: #52c41a;
    background: rgba(82, 196, 26, 0.05);
  }

  &.suggestion-info {
    border-left-color: #1890ff;
    background: rgba(24, 144, 255, 0.05);
  }

  &.suggestion-warning {
    border-left-color: #fa8c16;
    background: rgba(250, 140, 22, 0.05);
  }

  &.suggestion-danger {
    border-left-color: #f5222d;
    background: rgba(245, 34, 45, 0.05);
  }
}
</style>
