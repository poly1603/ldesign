<template>
  <div class="project-detail">
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
        <h1 v-else>项目详情</h1>
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

      <!-- Package.json 信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <Package :size="20" />
          <h2>Package.json 信息</h2>
          <button @click="refreshPackageJson" :disabled="packageLoading" class="btn-small">
            <RefreshCw :size="14" :class="{ spinning: packageLoading }" />
          </button>
        </div>
        <div class="card-body">
          <div v-if="packageLoading" class="loading-state-small">
            <Loader2 :size="16" class="spinner" />
            <span>正在读取 package.json...</span>
          </div>
          
          <div v-else-if="!packageJson" class="error-state-small">
            <AlertCircle :size="16" />
            <span>无法读取 package.json 文件</span>
          </div>
          
          <div v-else class="package-info">
            <div class="info-grid">
              <div class="info-item">
                <label>包名</label>
                <span class="value">{{ packageJson.name || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>版本</label>
                <span class="value">{{ packageJson.version || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>描述</label>
                <span class="value">{{ packageJson.description || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>作者</label>
                <span class="value">{{ formatAuthor(packageJson.author) || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>许可证</label>
                <span class="value">{{ packageJson.license || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>主入口</label>
                <span class="value">{{ packageJson.main || '未设置' }}</span>
              </div>
            </div>

            <!-- 脚本命令 -->
            <div v-if="packageJson.scripts && Object.keys(packageJson.scripts).length > 0" class="scripts-section">
              <h3>
                <Terminal :size="18" />
                <span>脚本命令</span>
              </h3>
              <div class="scripts-grid">
                <div 
                  v-for="(script, name) in packageJson.scripts" 
                  :key="name"
                  class="script-item"
                >
                  <div class="script-name">{{ name }}</div>
                  <div class="script-command">{{ script }}</div>
                </div>
              </div>
            </div>

            <!-- 依赖信息 -->
            <div class="dependencies-section">
              <div v-if="packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0" class="dep-group">
                <h3>
                  <Box :size="18" />
                  <span>生产依赖 ({{ Object.keys(packageJson.dependencies).length }})</span>
                </h3>
                <div class="dependencies-grid">
                  <div 
                    v-for="(version, name) in packageJson.dependencies" 
                    :key="name"
                    class="dependency-item"
                  >
                    <span class="dep-name">{{ name }}</span>
                    <span class="dep-version">{{ version }}</span>
                  </div>
                </div>
              </div>

              <div v-if="packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0" class="dep-group">
                <h3>
                  <Wrench :size="18" />
                  <span>开发依赖 ({{ Object.keys(packageJson.devDependencies).length }})</span>
                </h3>
                <div class="dependencies-grid">
                  <div 
                    v-for="(version, name) in packageJson.devDependencies" 
                    :key="name"
                    class="dependency-item dev-dep"
                  >
                    <span class="dep-name">{{ name }}</span>
                    <span class="dep-version">{{ version }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-toast">
      <AlertCircle :size="20" />
      <span>{{ error }}</span>
      <button @click="error = ''" class="btn-close">
        <X :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, RefreshCw, Loader2, XCircle, Zap, ChevronRight,
  Info, FolderOpen, MapPin, FileText, Calendar, Clock, Tag,
  Package, AlertCircle, Terminal, Box, Wrench, X,
  Code, Eye, Upload, Rocket, TestTube
} from 'lucide-vue-next'
import { useApi } from '../composables/useApi'
import { useProjectType } from '../composables/useProjectType'

// 路由
const route = useRoute()
const router = useRouter()

// API 实例
const api = useApi()

// 响应式数据
const loading = ref(false)
const packageLoading = ref(false)
const project = ref<any>(null)
const packageJson = ref<any>(null)
const error = ref('')

// 使用项目类型 Hook
const { projectType, availableActions, projectTypeLabel } = useProjectType(packageJson)

// 图标映射
const iconMap: Record<string, any> = {
  Code,
  Package,
  Eye,
  Upload,
  Rocket,
  TestTube
}

// 获取操作图标
const getActionIcon = (iconName: string) => {
  return iconMap[iconName] || Code
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 格式化作者信息
const formatAuthor = (author: any) => {
  if (!author) return ''
  if (typeof author === 'string') return author
  if (typeof author === 'object') {
    const parts = []
    if (author.name) parts.push(author.name)
    if (author.email) parts.push(`<${author.email}>`)
    return parts.join(' ')
  }
  return ''
}

// 获取项目详情
const getProjectDetail = async () => {
  const projectId = route.params.id as string
  if (!projectId) return

  loading.value = true
  error.value = ''

  try {
    const response = await api.get(`/api/projects/${projectId}`)
    if (response.success) {
      project.value = response.data
    } else {
      error.value = response.message || '获取项目详情失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取项目详情失败'
  } finally {
    loading.value = false
  }
}

// 获取 package.json 信息
const getPackageJson = async () => {
  const projectId = route.params.id as string
  if (!projectId) return

  packageLoading.value = true

  try {
    const response = await api.get(`/api/projects/${projectId}/package`)
    if (response.success) {
      packageJson.value = response.data
    } else {
      console.warn('获取package.json失败:', response.message)
      packageJson.value = null
    }
  } catch (err) {
    console.warn('获取package.json失败:', err)
    packageJson.value = null
  } finally {
    packageLoading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([
    getProjectDetail(),
    getPackageJson()
  ])
}

// 刷新 package.json
const refreshPackageJson = () => {
  getPackageJson()
}

// 返回上一页
const goBack = () => {
  router.push('/projects')
}

// 导航到操作页面
const navigateToAction = (action: any) => {
  const projectId = route.params.id as string
  router.push(`/projects/${projectId}${action.path}`)
}

// 组件挂载时加载数据
onMounted(() => {
  refreshData()
})
</script>

<style lang="less" scoped>
.project-detail {
  padding: var(--ls-padding-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-margin-lg);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-base);

    .project-title {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);

      h1 {
        margin: 0;
        color: var(--ldesign-text-color-primary);
        font-size: var(--ls-font-size-h2);
      }

      .project-type-badge {
        padding: 4px 12px;
        background: var(--ldesign-brand-color-1);
        color: var(--ldesign-brand-color);
        border-radius: var(--ls-border-radius-base);
        font-size: var(--ls-font-size-xs);
        font-weight: 600;
      }
    }

    h1 {
      margin: 0;
      color: var(--ldesign-text-color-primary);
      font-size: var(--ls-font-size-h2);
    }
  }

  .header-actions {
    display: flex;
    gap: var(--ls-spacing-sm);
  }
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ls-padding-xxl);
  text-align: center;

  .spinner {
    color: var(--ldesign-brand-color);
    margin-bottom: var(--ls-margin-base);
    animation: spin 1s linear infinite;
  }

  svg {
    color: var(--ldesign-error-color);
    margin-bottom: var(--ls-margin-base);
  }

  h2 {
    margin: 0 0 var(--ls-margin-sm) 0;
    color: var(--ldesign-text-color-primary);
  }

  p {
    margin: 0 0 var(--ls-margin-lg) 0;
    color: var(--ldesign-text-color-secondary);
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

.project-content {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg);
}

.quick-actions-card,
.info-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-lg);
  background: var(--ldesign-bg-color-component);
  border-bottom: 1px solid var(--ldesign-border-color);

  svg {
    color: var(--ldesign-brand-color);
    flex-shrink: 0;
  }

  h2 {
    margin: 0;
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-lg);
    font-weight: 600;
    flex: 1;
  }

  .btn-small {
    padding: 6px;
    background: none;
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    cursor: pointer;
    color: var(--ldesign-text-color-secondary);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background: var(--ldesign-bg-color-component-hover);
      border-color: var(--ldesign-border-color-hover);
      color: var(--ldesign-text-color-primary);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-lg);
}

.action-card {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-lg);
  background: var(--ldesign-bg-color-component);
  border: 2px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  .action-icon {
    flex-shrink: 0;
    color: var(--ldesign-brand-color);
  }

  .action-info {
    flex: 1;

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
    flex-shrink: 0;
    color: var(--ldesign-text-color-placeholder);
    transition: transform 0.2s ease;
  }

  &:hover {
    border-color: var(--ldesign-brand-color);
    background: var(--ldesign-brand-color-1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .action-arrow {
      transform: translateX(4px);
      color: var(--ldesign-brand-color);
    }
  }
}

.card-body {
  padding: var(--ls-padding-lg);
}

.loading-state-small, .error-state-small {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-secondary);
  font-size: var(--ls-font-size-sm);

  .spinner {
    animation: spin 1s linear infinite;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--ls-spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);

  label {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
    font-weight: 500;

    svg {
      color: var(--ldesign-brand-color);
    }
  }

  .value {
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-sm);

    &.path-text {
      font-family: 'Consolas', 'Monaco', monospace;
      word-break: break-all;
      background: var(--ldesign-bg-color-component);
      padding: var(--ls-padding-xs);
      border-radius: var(--ls-border-radius-sm);
    }
  }
}

.scripts-section, .dependencies-section {
  margin-top: var(--ls-margin-lg);

  h3 {
    margin: 0 0 var(--ls-margin-base) 0;
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-base);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);

    svg {
      color: var(--ldesign-brand-color);
    }
  }
}

.scripts-grid {
  display: grid;
  gap: var(--ls-spacing-sm);
}

.script-item {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-sm);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border: 1px solid var(--ldesign-border-color);

  .script-name {
    min-width: 100px;
    color: var(--ldesign-brand-color);
    font-weight: 500;
    font-size: var(--ls-font-size-sm);
  }

  .script-command {
    flex: 1;
    color: var(--ldesign-text-color-secondary);
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: var(--ls-font-size-xs);
    word-break: break-all;
  }
}

.dep-group {
  margin-bottom: var(--ls-margin-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.dependencies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--ls-spacing-xs);
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-sm);
}

.dependency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-padding-xs);
  border-radius: var(--ls-border-radius-sm);
  transition: background 0.2s ease;

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
  }

  &.dev-dep {
    opacity: 0.8;
  }

  .dep-name {
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-xs);
    font-weight: 500;
  }

  .dep-version {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-xs);
    font-family: 'Consolas', 'Monaco', monospace;
  }
}

/* 按钮样式 */
.btn-primary, .btn-secondary, .btn-back {
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
  text-decoration: none;

  &:disabled {
    opacity: 0.6;
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
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  border-color: var(--ldesign-border-color);

  &:hover:not(:disabled) {
    background: var(--ldesign-bg-color-component-hover);
    border-color: var(--ldesign-border-color-hover);
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

/* 错误提示样式 */
.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-base);
  border-radius: var(--ls-border-radius-base);
  box-shadow: var(--ldesign-shadow-2);
  z-index: 1001;
  background: var(--ldesign-error-color-focus);
  color: var(--ldesign-error-color-8);
  border: 1px solid var(--ldesign-error-color-3);

  .btn-close {
    background: none;
    border: none;
    cursor: pointer;
    color: currentColor;
    opacity: 0.7;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--ls-border-radius-sm);
    transition: all 0.2s ease;

    &:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.1);
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-detail {
    padding: var(--ls-padding-base);
  }

  .page-header {
    flex-direction: column;
    gap: var(--ls-spacing-base);
    align-items: stretch;

    .header-left {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--ls-spacing-sm);
    }

    .header-actions {
      justify-content: center;
    }
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .dependencies-grid {
    grid-template-columns: 1fr;
  }

  .script-item {
    flex-direction: column;
    align-items: flex-start;

    .script-name {
      min-width: auto;
    }
  }
}
</style>

