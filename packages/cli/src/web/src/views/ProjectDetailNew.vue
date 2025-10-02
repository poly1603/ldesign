<template>
  <div class="project-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn-back">
          <ArrowLeft :size="18" />
          <span>返回</span>
        </button>
        <div v-if="project" class="project-title">
          <h1>{{ project.name }}</h1>
          <span class="project-type-badge">{{ projectTypeLabel }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button @click="refreshData" :disabled="loading" class="btn-secondary">
          <RefreshCw :size="18" :class="{ spinning: loading }" />
          <span>刷新</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <Loader2 :size="48" class="spinner" />
      <p>正在加载项目信息...</p>
    </div>

    <!-- 项目不存在 -->
    <div v-else-if="!project" class="error-state">
      <XCircle :size="48" />
      <h2>项目不存在</h2>
      <p>请检查项目ID是否正确</p>
      <button @click="goBack" class="btn-primary">返回项目列表</button>
    </div>

    <!-- 项目详情内容 -->
    <div v-else class="project-content">
      <!-- 快速操作卡片 -->
      <div class="quick-actions-card">
        <div class="card-header">
          <Zap :size="20" />
          <h2>快速操作</h2>
        </div>
        <div class="actions-grid">
          <button v-for="action in availableActions" :key="action.id" class="action-card"
            @click="navigateToAction(action)">
            <component :is="getActionIcon(action.icon)" :size="32" class="action-icon" />
            <div class="action-info">
              <h3>{{ action.name }}</h3>
              <p>{{ action.description }}</p>
            </div>
            <ChevronRight :size="20" class="action-arrow" />
          </button>
        </div>
      </div>

      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <Info :size="20" />
          <h2>基本信息</h2>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <label>
                <FolderOpen :size="16" />
                <span>项目名称</span>
              </label>
              <span class="value">{{ project.name }}</span>
            </div>
            <div class="info-item">
              <label>
                <MapPin :size="16" />
                <span>项目路径</span>
              </label>
              <span class="value path-text">{{ project.path }}</span>
            </div>
            <div class="info-item">
              <label>
                <FileText :size="16" />
                <span>项目描述</span>
              </label>
              <span class="value">{{ project.description || '暂无描述' }}</span>
            </div>
            <div class="info-item">
              <label>
                <Calendar :size="16" />
                <span>创建时间</span>
              </label>
              <span class="value">{{ formatDate(project.createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>
                <Clock :size="16" />
                <span>更新时间</span>
              </label>
              <span class="value">{{ formatDate(project.updatedAt) }}</span>
            </div>
            <div class="info-item">
              <label>
                <Tag :size="16" />
                <span>项目类型</span>
              </label>
              <span class="value">{{ projectTypeLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button v-for="tab in tabs" :key="tab.id" :class="['tab-button', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id">
            <component :is="tab.icon" :size="18" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <div class="tabs-content">
          <!-- README 标签 -->
          <div v-show="activeTab === 'readme'" class="tab-pane">
            <ReadmeTab :project-path="project.path" />
          </div>

          <!-- 依赖管理标签 -->
          <div v-show="activeTab === 'dependencies'" class="tab-pane">
            <DependenciesTab :project-path="project.path" />
          </div>

          <!-- Scripts 标签 -->
          <div v-show="activeTab === 'scripts'" class="tab-pane">
            <ScriptsTab :project-path="project.path" />
          </div>

          <!-- 产物配置标签 -->
          <div v-show="activeTab === 'build'" class="tab-pane">
            <BuildConfigTab :project-path="project.path" />
          </div>

          <!-- 其他配置标签 -->
          <div v-show="activeTab === 'other'" class="tab-pane">
            <OtherConfigTab :project-path="project.path" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, RefreshCw, Loader2, XCircle, Zap, ChevronRight,
  Info, FolderOpen, MapPin, FileText, Calendar, Clock, Tag,
  FileCode, Package, Terminal, Settings, MoreHorizontal,
  Code, Eye, Upload, Rocket, TestTube
} from 'lucide-vue-next'
import { useApi } from '../composables/useApi'
import { useProjectType } from '../composables/useProjectType'
import ReadmeTab from '../components/tabs/ReadmeTab.vue'
import DependenciesTab from '../components/tabs/DependenciesTab.vue'
import ScriptsTab from '../components/tabs/ScriptsTab.vue'
import BuildConfigTab from '../components/tabs/BuildConfigTab.vue'
import OtherConfigTab from '../components/tabs/OtherConfigTab.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()
const { getProjectTypeLabel } = useProjectType()

const project = ref<any>(null)
const loading = ref(true)
const activeTab = ref('readme')

const tabs = [
  { id: 'readme', label: 'README', icon: FileCode },
  { id: 'dependencies', label: '依赖管理', icon: Package },
  { id: 'scripts', label: 'Scripts', icon: Terminal },
  { id: 'build', label: '产物配置', icon: Settings },
  { id: 'other', label: '其他配置', icon: MoreHorizontal }
]

const projectTypeLabel = computed(() => {
  return project.value ? getProjectTypeLabel(project.value.type) : ''
})

const availableActions = computed(() => {
  if (!project.value) return []

  const actions = [
    { id: 'build', name: '打包', description: '构建生产版本', icon: Package },
    { id: 'publish', name: '发布', description: '发布到 npm', icon: Upload },
    { id: 'test', name: '测试', description: '运行测试用例', icon: TestTube }
  ]

  // 根据项目类型添加不同的操作
  if (project.value.type === 'app' || project.value.type === 'both') {
    actions.unshift(
      { id: 'dev', name: '开发', description: '启动开发服务器', icon: Code },
      { id: 'preview', name: '预览', description: '预览构建结果', icon: Eye }
    )
  }

  return actions
})

const goBack = () => {
  router.push('/projects')
}

const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getActionIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Package,
    Upload,
    TestTube,
    Code,
    Eye,
    Rocket
  }
  return iconMap[iconName] || Package
}

const navigateToAction = (action: any) => {
  router.push(`/projects/${project.value.id}/${action.id}`)
}

const loadProject = async () => {
  loading.value = true
  try {
    const projectId = route.params.id as string
    const response = await api.get(`/api/projects/${projectId}`)
    if (response.success) {
      project.value = response.data
    }
  } catch (error) {
    console.error('加载项目失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadProject()
}

onMounted(() => {
  loadProject()
})
</script>

<style lang="less" scoped>
.project-detail-page {
  padding: var(--ls-padding-lg);
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-margin-lg);
  padding-bottom: var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-color);
  position: sticky;
  top: 0;
  background-color: var(--ldesign-bg-color-container);
  z-index: 100;

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-lg);

    .project-title {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);

      h1 {
        margin: 0;
        font-size: var(--ls-font-size-h2);
        color: var(--ldesign-text-color-primary);
        font-weight: 600;
      }

      .project-type-badge {
        padding: 4px 12px;
        background: var(--ldesign-brand-bg);
        color: var(--ldesign-brand-color);
        border-radius: var(--ls-border-radius-md);
        font-size: var(--ls-font-size-sm);
        font-weight: 500;
      }
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

  h2 {
    margin: 0;
    color: var(--ldesign-text-color-primary);
  }

  p {
    margin: 0;
  }
}

.project-content {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg);
}

.quick-actions-card,
.info-card {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-lg);
  border: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-margin-base);

    svg {
      color: var(--ldesign-brand-color);
    }

    h2 {
      margin: 0;
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--ls-spacing-base);

  .action-card {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-base);
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-component);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--ldesign-bg-color-container-hover);
      border-color: var(--ldesign-brand-color);
      transform: translateY(-2px);
      box-shadow: var(--ldesign-shadow-2);
    }

    .action-icon {
      color: var(--ldesign-brand-color);
      flex-shrink: 0;
    }

    .action-info {
      flex: 1;
      text-align: left;

      h3 {
        margin: 0 0 4px 0;
        font-size: var(--ls-font-size-base);
        color: var(--ldesign-text-color-primary);
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
      }
    }

    .action-arrow {
      color: var(--ldesign-text-color-placeholder);
      flex-shrink: 0;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ls-spacing-base);

  .info-item {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-xs);

    label {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
      font-weight: 500;

      svg {
        color: var(--ldesign-brand-color);
      }
    }

    .value {
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-primary);

      &.path-text {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-brand-color);
      }
    }
  }
}

.tabs-container {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  border: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);
  overflow: hidden;

  .tabs-header {
    display: flex;
    border-bottom: 1px solid var(--ldesign-border-color);
    background: var(--ldesign-bg-color-component);

    .tab-button {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      padding: var(--ls-padding-base) var(--ls-padding-lg);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--ldesign-text-color-secondary);
      font-size: var(--ls-font-size-base);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: var(--ldesign-text-color-primary);
        background: var(--ldesign-bg-color-container-hover);
      }

      &.active {
        color: var(--ldesign-brand-color);
        border-bottom-color: var(--ldesign-brand-color);
        background: var(--ldesign-brand-color-focus);
      }

      svg {
        flex-shrink: 0;
      }
    }
  }

  .tabs-content {
    padding: var(--ls-padding-lg);

    .tab-pane {
      animation: fadeIn 0.3s ease;
    }
  }
}

.btn-back,
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
    transform: translateY(-1px);
    box-shadow: var(--ldesign-shadow-2);
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
}

.btn-back {
  background: none;
  color: var(--ldesign-text-color-secondary);
  padding: var(--ls-padding-xs) var(--ls-padding-sm);

  &:hover {
    color: var(--ldesign-text-color-primary);
    background: var(--ldesign-bg-color-component-hover);
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .tabs-header {
    overflow-x: auto;

    .tab-button {
      flex-shrink: 0;
    }
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>