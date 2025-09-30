<!--
  项目管理页面
  功能：项目列表、导入、删除、搜索、筛选
-->
<template>
  <div class="project-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>项目管理</h1>
        <p class="header-subtitle">管理您的所有项目</p>
      </div>
      <div class="header-actions">
        <button @click="refreshProjects" :disabled="loading" class="btn-secondary">
          <RefreshCw :size="18" :class="{ 'spinning': loading }" />
          <span>刷新</span>
        </button>
        <button @click="showImportModal = true" class="btn-primary">
          <FolderPlus :size="18" />
          <span>导入项目</span>
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <!-- 搜索框 -->
      <div class="search-box">
        <Search :size="18" />
        <input v-model="searchQuery" type="text" placeholder="搜索项目名称..." class="search-input" />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
          <X :size="16" />
        </button>
      </div>

      <!-- Tab 切换 -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.value" :class="['tab-item', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value">
          <component :is="tab.icon" :size="16" />
          <span>{{ tab.label }}</span>
          <span class="tab-count">{{ getTabCount(tab.value) }}</span>
        </button>
      </div>
    </div>

    <!-- 项目列表 -->
    <div class="projects-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <Loader2 :size="48" class="loading-spinner" />
        <p>正在加载项目列表...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredProjects.length === 0" class="empty-state">
        <div class="empty-icon">
          <FolderOpen :size="64" />
        </div>
        <h2>{{ searchQuery ? '未找到匹配的项目' : '暂无项目' }}</h2>
        <p>{{ searchQuery ? '请尝试其他搜索关键词' : '点击"导入项目"按钮添加您的第一个项目' }}</p>
        <button v-if="!searchQuery" @click="showImportModal = true" class="btn-primary btn-large">
          <FolderPlus :size="20" />
          <span>导入项目</span>
        </button>
      </div>

      <!-- 项目网格 -->
      <div v-else class="projects-grid">
        <div v-for="project in filteredProjects" :key="project.id" class="project-card"
          @click="goToProject(project.id)">
          <div class="project-header">
            <div class="project-icon">
              <FolderGit2 :size="24" />
            </div>
            <div class="project-info">
              <h3 class="project-name">{{ project.name }}</h3>
              <div class="project-badges">
                <span v-if="project.type === 'project'" class="badge badge-project">
                  <Rocket :size="12" />
                  项目
                </span>
                <span v-else-if="project.type === 'library'" class="badge badge-library">
                  <Package :size="12" />
                  库
                </span>
                <span v-else-if="project.type === 'both'" class="badge badge-both">
                  <Layers :size="12" />
                  项目+库
                </span>
              </div>
            </div>
            <button @click.stop="handleDelete(project)" class="btn-delete" title="删除项目">
              <Trash2 :size="16" />
            </button>
          </div>

          <div class="project-description">
            <p>{{ project.description || '暂无描述' }}</p>
          </div>

          <div class="project-path">
            <FolderOpen :size="14" />
            <span>{{ project.path }}</span>
          </div>

          <div class="project-meta">
            <div class="meta-item">
              <Clock :size="14" />
              <span>导入于 {{ formatDate(project.importedAt) }}</span>
            </div>
            <div class="meta-item" v-if="project.packageJson?.version">
              <Tag :size="14" />
              <span>v{{ project.packageJson.version }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 目录选择器 Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDirectoryPicker" class="directory-picker-overlay" @click="showDirectoryPicker = false">
          <div class="directory-picker-modal" @click.stop>
            <DirectoryPicker :initial-path="importForm.path" @select="handleDirectorySelect"
              @close="showDirectoryPicker = false" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 导入项目 Modal -->
    <Modal v-model:visible="showImportModal" title="导入项目" :icon="FolderPlus" @confirm="importProject"
      @cancel="resetImportForm">
      <div class="import-form">
        <div class="form-group">
          <label>
            <Folder :size="16" />
            <span>项目目录</span>
          </label>
          <div class="input-group">
            <input type="text" v-model="importForm.path" placeholder="请输入项目完整路径，例如：D:\Projects\my-project"
              class="form-input" @input="handlePathInput" @blur="validateProjectPath" />
            <button @click="selectDirectory" class="btn-secondary" title="打开系统目录选择对话框" :disabled="validating">
              <FolderSearch :size="16" />
              <span>浏览</span>
            </button>
          </div>
          <div class="form-hint" v-if="!validating && !importError">
            <span>💡 提示：请输入项目的完整路径，或点击"浏览"按钮打开系统目录选择对话框</span>
          </div>
          <div class="form-hint validating" v-if="validating">
            <Loader2 :size="14" class="spinning" />
            <span>正在验证项目路径...</span>
          </div>
        </div>

        <div class="form-group" v-if="importForm.path && importForm.name">
          <label>
            <FileText :size="16" />
            <span>项目名称</span>
          </label>
          <input type="text" v-model="importForm.name" placeholder="自动从 package.json 读取" class="form-input" />
        </div>

        <div class="form-group" v-if="importForm.path && importForm.description">
          <label>
            <AlignLeft :size="16" />
            <span>项目描述</span>
          </label>
          <textarea v-model="importForm.description" placeholder="自动从 package.json 读取" class="form-textarea"
            rows="3"></textarea>
        </div>

        <div class="form-group" v-if="importForm.type">
          <label>
            <Tag :size="16" />
            <span>项目类型</span>
          </label>
          <div class="project-type-badge">
            <Rocket v-if="importForm.type === 'project'" :size="16" />
            <Package v-else-if="importForm.type === 'library'" :size="16" />
            <Layers v-else-if="importForm.type === 'both'" :size="16" />
            <span>{{ importForm.type === 'project' ? '项目' : importForm.type === 'library' ? '库' : '项目 + 库' }}</span>
          </div>
        </div>

        <div v-if="importError" class="error-message">
          <AlertCircle :size="16" />
          <span>{{ importError }}</span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, Teleport, Transition } from 'vue'
import { useRouter } from 'vue-router'
import {
  RefreshCw, FolderPlus, FolderOpen, FolderGit2, Trash2, Tag,
  Loader2, X, Folder, FolderSearch, FileText, AlignLeft, AlertCircle,
  Rocket, Package, Layers, Clock, Search, Grid
} from 'lucide-vue-next'
import Modal from '../components/Modal.vue'
import DirectoryPicker from '../components/DirectoryPicker.vue'
import { useApi } from '../composables/useApi'
import { useMessage } from '../composables/useMessage'
import { useConfirm } from '../composables/useConfirm'

// 路由
const router = useRouter()

// API 和消息
const api = useApi()
const message = useMessage()
const confirm = useConfirm()

// 项目列表
const projects = ref<any[]>([])
const loading = ref(false)

// 搜索和筛选
const searchQuery = ref('')
const activeTab = ref<'all' | 'project' | 'library'>('all')

// Tab 配置
const tabs = [
  { value: 'all', label: '全部', icon: Grid },
  { value: 'project', label: '项目', icon: Rocket },
  { value: 'library', label: '库', icon: Package }
]

// 导入表单
const showImportModal = ref(false)
const showDirectoryPicker = ref(false)
const importing = ref(false)
const importError = ref('')
const validating = ref(false)
const importForm = ref({
  path: '',
  name: '',
  description: '',
  type: '' as 'project' | 'library' | 'both' | '',
  exists: false
})

/**
 * 获取 Tab 数量
 */
const getTabCount = (tab: string) => {
  if (tab === 'all') return projects.value.length
  if (tab === 'project') return projects.value.filter(p => p.type === 'project' || p.type === 'both').length
  if (tab === 'library') return projects.value.filter(p => p.type === 'library' || p.type === 'both').length
  return 0
}

/**
 * 过滤后的项目列表
 */
const filteredProjects = computed(() => {
  let result = projects.value

  // 按 Tab 筛选
  if (activeTab.value === 'project') {
    result = result.filter(p => p.type === 'project' || p.type === 'both')
  } else if (activeTab.value === 'library') {
    result = result.filter(p => p.type === 'library' || p.type === 'both')
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.path.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    )
  }

  return result
})

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于 1 分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于 1 小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  }

  // 小于 1 天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  }

  // 小于 7 天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)} 天前`
  }

  // 显示完整日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 刷新项目列表
 */
const refreshProjects = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/projects')
    if (response.success) {
      projects.value = response.data
    }
  } catch (error) {
    message.error('加载项目列表失败')
    console.error('加载项目列表失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理路径输入
 */
const handlePathInput = async () => {
  // 清除错误信息
  importError.value = ''

  // 如果路径为空，清空表单
  if (!importForm.value.path.trim()) {
    importForm.value.name = ''
    importForm.value.description = ''
    importForm.value.type = ''
    importForm.value.exists = false
    return
  }

  // 延迟验证，避免频繁请求
  await validateProjectPath()
}

/**
 * 验证项目路径并自动填充信息
 */
const validateProjectPath = async () => {
  const path = importForm.value.path.trim()
  if (!path) return

  validating.value = true
  importError.value = ''

  try {
    const response = await api.post('/api/projects/validate', { path })

    if (response.success && response.data) {
      // 自动填充项目信息
      importForm.value.name = response.data.name || ''
      importForm.value.description = response.data.description || ''
      importForm.value.type = response.data.type || ''
      importForm.value.exists = response.data.exists || false

      if (response.data.exists) {
        importError.value = '该项目已存在'
      } else {
        message.success('项目路径验证成功')
      }
    } else {
      importError.value = response.message || '验证失败'
      importForm.value.name = ''
      importForm.value.description = ''
      importForm.value.type = ''
      importForm.value.exists = false
    }
  } catch (error: any) {
    importError.value = error.message || '验证项目路径失败'
    importForm.value.name = ''
    importForm.value.description = ''
    importForm.value.type = ''
    importForm.value.exists = false
  } finally {
    validating.value = false
  }
}

/**
 * 选择目录（打开目录选择器）
 */
const selectDirectory = () => {
  showDirectoryPicker.value = true
}

/**
 * 处理目录选择
 */
const handleDirectorySelect = async (path: string) => {
  showDirectoryPicker.value = false
  importForm.value.path = path
  importError.value = ''

  message.success('已选择目录，正在验证...')

  // 验证路径并自动填充
  await validateProjectPath()
}



/**
 * 导入项目
 */
const importProject = async () => {
  if (!importForm.value.path) {
    importError.value = '请选择项目目录'
    return
  }

  // 如果项目已存在，不允许导入
  if (importForm.value.exists) {
    importError.value = '该项目已存在，无法重复导入'
    return
  }

  importing.value = true
  importError.value = ''

  try {
    const response = await api.post('/api/projects', {
      path: importForm.value.path,
      name: importForm.value.name || undefined,
      description: importForm.value.description || undefined
    })

    if (response.success) {
      message.success('项目导入成功')
      showImportModal.value = false
      resetImportForm()
      await refreshProjects()
    } else {
      importError.value = response.message || '导入失败'
      message.error(response.message || '导入失败')
    }
  } catch (error: any) {
    importError.value = error.message || '导入失败'
    message.error('导入项目失败')
    console.error('导入项目失败:', error)
  } finally {
    importing.value = false
  }
}

/**
 * 重置导入表单
 */
const resetImportForm = () => {
  importForm.value = {
    path: '',
    name: '',
    description: '',
    type: '',
    exists: false
  }
  importError.value = ''
  validating.value = false
}

/**
 * 处理删除
 */
const handleDelete = async (project: any) => {
  const result = await confirm.show({
    title: '确认删除',
    content: `确定要删除项目"${project.name}"吗？此操作不会删除项目文件，只会从列表中移除。`,
    type: 'danger',
    confirmText: '删除',
    cancelText: '取消'
  })

  if (result) {
    await deleteProject(project.id)
  }
}

/**
 * 删除项目
 */
const deleteProject = async (id: string) => {
  try {
    const response = await api.delete(`/api/projects/${id}`)
    if (response.success) {
      message.success('项目删除成功')
      await refreshProjects()
    } else {
      message.error(response.message || '删除失败')
    }
  } catch (error) {
    message.error('删除项目失败')
    console.error('删除项目失败:', error)
  }
}

/**
 * 跳转到项目详情
 */
const goToProject = (id: string) => {
  router.push(`/projects/${id}`)
}

// 生命周期
onMounted(() => {
  refreshProjects()
})
</script>

<style scoped lang="less">
.project-manager {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
  height: 100%;
}

// 页面头部
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-1);

  .header-left {
    h1 {
      font-size: var(--ls-font-size-h4);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin: 0 0 4px 0;
    }

    .header-subtitle {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: var(--ls-spacing-sm);
  }
}

// 筛选栏
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-1);
}

// 搜索框
.search-box {
  flex: 1;
  max-width: 400px;
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: 0 var(--ls-padding-sm);
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  transition: all 0.2s;

  &:focus-within {
    border-color: var(--ldesign-brand-color);
    box-shadow: 0 0 0 3px var(--ldesign-brand-color-focus);
  }

  svg {
    color: var(--ldesign-text-color-placeholder);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    height: 40px;
    border: none;
    background: transparent;
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-primary);
    outline: none;

    &::placeholder {
      color: var(--ldesign-text-color-placeholder);
    }
  }

  .clear-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: var(--ls-border-radius-sm);
    color: var(--ldesign-text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      color: var(--ldesign-text-color-primary);
    }
  }
}

// Tab 切换
.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: var(--ls-border-radius-sm);
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
    color: var(--ldesign-text-color-primary);
  }

  &.active {
    background: var(--ldesign-brand-color);
    color: var(--ldesign-font-white-1);
  }

  .tab-count {
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
  }

  &.active .tab-count {
    background: rgba(255, 255, 255, 0.2);
  }
}

// 项目容器
.projects-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-1);
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: var(--ls-spacing-base);

  .loading-spinner {
    animation: spin 1s linear infinite;
    color: var(--ldesign-brand-color);
  }

  p {
    font-size: var(--ls-font-size-base);
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

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: var(--ls-spacing-base);

  .empty-icon {
    color: var(--ldesign-text-color-placeholder);
  }

  h2 {
    font-size: var(--ls-font-size-xl);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin: 0;
  }

  p {
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-secondary);
    margin: 0;
  }
}

// 项目网格
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--ls-spacing-base);
}

// 项目卡片
.project-card {
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-lg);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--ldesign-brand-color);
    box-shadow: var(--ldesign-shadow-2);
    transform: translateY(-2px);
  }
}

.project-header {
  display: flex;
  align-items: flex-start;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-spacing-sm);

  .project-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--ldesign-brand-color-focus);
    color: var(--ldesign-brand-color);
    border-radius: var(--ls-border-radius-base);
    flex-shrink: 0;
  }

  .project-info {
    flex: 1;
    min-width: 0;

    .project-name {
      font-size: var(--ls-font-size-lg);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin: 0 0 6px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .project-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
  }

  .btn-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: var(--ls-border-radius-base);
    color: var(--ldesign-text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      background: var(--ldesign-error-color-focus);
      color: var(--ldesign-error-color);
    }
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--ls-border-radius-sm);
  font-size: 12px;
  font-weight: 500;

  &.badge-project {
    background: var(--ldesign-brand-color-focus);
    color: var(--ldesign-brand-color);
  }

  &.badge-library {
    background: var(--ldesign-success-color-focus);
    color: var(--ldesign-success-color);
  }

  &.badge-both {
    background: var(--ldesign-warning-color-focus);
    color: var(--ldesign-warning-color);
  }
}

.project-description {
  margin-bottom: var(--ls-spacing-sm);

  p {
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.project-path {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-sm);
  margin-bottom: var(--ls-spacing-sm);

  svg {
    color: var(--ldesign-text-color-placeholder);
    flex-shrink: 0;
  }

  span {
    flex: 1;
    font-size: 12px;
    font-family: 'Consolas', 'Monaco', monospace;
    color: var(--ldesign-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.project-meta {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  flex-wrap: wrap;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--ldesign-text-color-placeholder);

    svg {
      flex-shrink: 0;
    }
  }
}

// 导入表单
.import-form {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--ls-font-size-sm);
    font-weight: 500;
    color: var(--ldesign-text-color-primary);

    svg {
      color: var(--ldesign-brand-color);
    }
  }
}

.input-group {
  display: flex;
  gap: var(--ls-spacing-sm);
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--ldesign-brand-color-focus);
  border-left: 3px solid var(--ldesign-brand-color);
  border-radius: var(--ls-border-radius-base);
  font-size: 13px;
  color: var(--ldesign-text-color-secondary);
  line-height: 1.5;

  &.validating {
    background: var(--ldesign-warning-color-focus);
    border-left-color: var(--ldesign-warning-color);

    .spinning {
      animation: spin 1s linear infinite;
    }
  }
}

.project-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--ldesign-brand-color-focus);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-brand-color);
  font-weight: 500;

  svg {
    flex-shrink: 0;
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

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-primary);
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

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--ldesign-error-color-focus);
  border-left: 4px solid var(--ldesign-error-color);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-error-color);

  svg {
    flex-shrink: 0;
  }
}

// 按钮样式
.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 var(--ls-padding-base);
  height: var(--ls-button-height-medium);
  border: none;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.9;
  }

  &:not(:disabled):active {
    transform: scale(0.98);
  }
}

.btn-primary {
  background: var(--ldesign-brand-color);
  color: var(--ldesign-font-white-1);
}

.btn-secondary {
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  border: 1px solid var(--ldesign-border-level-2-color);

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
    border-color: var(--ldesign-border-level-3-color);
  }
}

.btn-large {
  height: var(--ls-button-height-large);
  padding: 0 var(--ls-padding-lg);
  font-size: var(--ls-font-size-base);
}

.spinning {
  animation: spin 1s linear infinite;
}

// 目录选择器遮罩层
.directory-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.directory-picker-modal {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-3);
  overflow: hidden;
}

// Modal 过渡动画
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
