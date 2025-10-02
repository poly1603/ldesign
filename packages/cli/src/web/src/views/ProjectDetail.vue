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
          <button
            v-for="action in availableActions"
            :key="action.id"
            class="action-card"
            @click="navigateToAction(action)"
          >
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
      <div class="info-card-enhanced">
        <div class="card-header">
          <div class="header-title">
            <Info :size="20" />
            <h2>基本信息</h2>
          </div>
        </div>
        <div class="card-body">
          <!-- 主要信息区域 -->
          <div class="primary-info">
            <div class="info-row">
              <div class="info-icon-wrapper">
                <FolderOpen :size="24" />
              </div>
              <div class="info-content">
                <label>项目名称</label>
                <div class="value-primary">{{ project.name }}</div>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-icon-wrapper">
                <MapPin :size="24" />
              </div>
              <div class="info-content">
                <label>项目路径</label>
                <div class="value-path">
                  <code>{{ project.path }}</code>
                  <button 
                    class="btn-open-folder" 
                    :class="{ opening: isOpeningFolder }"
                    @click="openFolder" 
                    :title="'打开文件夹'"
                    :disabled="isOpeningFolder"
                  >
                    <FolderOpen :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="project.description" class="info-row description-row">
              <div class="info-icon-wrapper">
                <FileText :size="24" />
              </div>
              <div class="info-content">
                <label>项目描述</label>
                <div class="value-description">{{ project.description }}</div>
              </div>
            </div>
          </div>

          <!-- 元数据网格 -->
          <div class="metadata-grid">
            <div class="meta-item">
              <div class="meta-icon">
                <Tag :size="18" />
              </div>
              <div class="meta-content">
                <label>项目类型</label>
                <span class="badge-type">{{ projectTypeLabel }}</span>
              </div>
            </div>
            
            <div class="meta-item">
              <div class="meta-icon">
                <Calendar :size="18" />
              </div>
              <div class="meta-content">
                <label>创建时间</label>
                <span class="meta-value">{{ formatDate(project.createdAt) }}</span>
              </div>
            </div>
            
            <div class="meta-item">
              <div class="meta-icon">
                <Clock :size="18" />
              </div>
              <div class="meta-content">
                <label>更新时间</label>
                <span class="meta-value">{{ formatDate(project.updatedAt) }}</span>
              </div>
            </div>

            <!-- 可以添加更多元数据 -->
            <div class="meta-item" v-if="project.version">
              <div class="meta-icon">
                <Package :size="18" />
              </div>
              <div class="meta-content">
                <label>版本号</label>
                <span class="meta-value">{{ project.version }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" :size="18" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <div class="tabs-content">
          <!-- README 标签 -->
          <div v-show="activeTab === 'readme'" class="tab-pane">
            <ReadmeTab :project-id="project.id" />
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

    <!-- Back to Top Button -->
    <transition name="fade-slide">
      <button v-if="showBackToTop" @click="scrollToTop" class="back-to-top">
        <ArrowUp :size="20" />
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, RefreshCw, Loader2, XCircle, Zap, ChevronRight,
  Info, FolderOpen, MapPin, FileText, Calendar, Clock, Tag,
  FileCode, Package, Terminal, Settings, MoreHorizontal,
  Code, Eye, Upload, Rocket, TestTube, ArrowUp
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
const showBackToTop = ref(false)

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

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 打开文件夹状态
const isOpeningFolder = ref(false)

const openFolder = async () => {
  if (!project.value?.id || isOpeningFolder.value) return
  
  isOpeningFolder.value = true
  try {
    const response = await api.post(`/api/projects/${project.value.id}/open-folder`)
    if (response.success) {
      console.log('文件夹已打开')
    } else {
      console.error('打开文件夹失败:', response.message)
    }
  } catch (error) {
    console.error('打开文件夹失败:', error)
  } finally {
    isOpeningFolder.value = false
  }
}

onMounted(() => {
  loadProject()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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

.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ldesign-brand-color);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--ldesign-shadow-3);
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    background: var(--ldesign-brand-color-hover);
    transform: translateY(-4px);
    box-shadow: var(--ldesign-shadow-4);
  }

  &:active {
    transform: translateY(-2px);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
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

  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
  }
}

/* 基本信息卡片增强样式 */
.info-card-enhanced {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  border: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);
  overflow: hidden;

  .card-header {
    padding: var(--ls-padding-lg);
    background: var(--ldesign-bg-color-component);
    border-bottom: 1px solid var(--ldesign-border-color);

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);

      svg {
        color: var(--ldesign-brand-color);
        flex-shrink: 0;
      }

      h2 {
        margin: 0;
        font-size: var(--ls-font-size-lg);
        color: var(--ldesign-text-color-primary);
        font-weight: 600;
      }
    }
  }

  .card-body {
    padding: var(--ls-padding-lg);
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-xl);
  }

  /* 主要信息区 */
  .primary-info {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-lg);

    .info-row {
      display: flex;
      gap: var(--ls-spacing-base);
      align-items: flex-start;

      &.description-row {
        padding-top: var(--ls-padding-sm);
        border-top: 1px dashed var(--ldesign-border-color);
      }

      .info-icon-wrapper {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ldesign-brand-bg);
        border-radius: var(--ls-border-radius-base);
        flex-shrink: 0;

        svg {
          color: var(--ldesign-brand-color);
        }
      }

      .info-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ls-spacing-xs);

        label {
          font-size: var(--ls-font-size-sm);
          color: var(--ldesign-text-color-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value-primary {
          font-size: var(--ls-font-size-h3);
          color: var(--ldesign-text-color-primary);
          font-weight: 600;
          line-height: 1.4;
        }

        .value-path {
          display: flex;
          align-items: center;
          gap: var(--ls-spacing-sm);
          padding: var(--ls-padding-sm) var(--ls-padding-base);
          background: var(--ldesign-bg-color-component);
          border: 1px solid var(--ldesign-border-color);
          border-radius: var(--ls-border-radius-base);
          transition: all 0.2s ease;

          &:hover {
            border-color: var(--ldesign-brand-color-hover);
            background: var(--ldesign-bg-color-container-hover);
          }

          code {
            flex: 1;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: var(--ls-font-size-sm);
            color: var(--ldesign-brand-color);
            word-break: break-all;
            line-height: 1.6;
          }

          .btn-open-folder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            padding: 0;
            background: transparent;
            border: 1px solid var(--ldesign-border-color);
            border-radius: var(--ls-border-radius-sm);
            color: var(--ldesign-text-color-secondary);
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;

            &:hover:not(:disabled) {
              background: var(--ldesign-brand-bg);
              border-color: var(--ldesign-brand-color);
              color: var(--ldesign-brand-color);
            }

            &:active:not(:disabled) {
              transform: scale(0.95);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            &.opening {
              svg {
                animation: pulse 1s ease-in-out infinite;
              }
            }

            svg {
              display: block;
            }
          }
        }

        .value-description {
          font-size: var(--ls-font-size-base);
          color: var(--ldesign-text-color-primary);
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }
  }

  /* 元数据网格 */
  .metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--ls-spacing-base);
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-base);
    border: 1px solid var(--ldesign-border-color);

    .meta-item {
      display: flex;
      gap: var(--ls-spacing-sm);
      align-items: flex-start;

      .meta-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ldesign-bg-color-container);
        border-radius: var(--ls-border-radius-sm);
        flex-shrink: 0;

        svg {
          color: var(--ldesign-brand-color);
        }
      }

      .meta-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;

        label {
          font-size: 12px;
          color: var(--ldesign-text-color-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .meta-value {
          font-size: var(--ls-font-size-sm);
          color: var(--ldesign-text-color-primary);
          font-weight: 500;
        }

        .badge-type {
          display: inline-block;
          padding: 4px 10px;
          background: var(--ldesign-brand-bg);
          color: var(--ldesign-brand-color);
          border-radius: var(--ls-border-radius-sm);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }
  }
}

/* 打开文件夹脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .info-card-enhanced {
    .primary-info {
      .info-row {
        .info-icon-wrapper {
          width: 36px;
          height: 36px;
        }

        .info-content {
          .value-primary {
            font-size: var(--ls-font-size-h4);
          }

          .value-path {
            flex-direction: column;
            align-items: stretch;

            code {
              font-size: 12px;
            }

            .btn-open-folder {
              width: 100%;
              height: 36px;
            }
          }
        }
      }
    }

    .metadata-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
