<!--
  目录选择器组件
  通过后端API获取真实的文件系统目录结构
-->
<template>
  <div class="directory-picker">
    <!-- 头部 -->
    <div class="picker-header">
      <div class="header-title">
        <Folder :size="20" />
        <span>选择项目目录</span>
      </div>
      <button @click="$emit('close')" class="btn-close">
        <X :size="20" />
      </button>
    </div>

    <!-- 当前路径 -->
    <div class="current-path">
      <div class="path-label">
        <FolderOpen :size="16" />
        <span>当前路径:</span>
      </div>
      <div class="path-value">{{ selectedPath || '请选择目录' }}</div>
    </div>

    <!-- 快捷目录 -->
    <div class="special-dirs" v-if="specialDirs.length > 0">
      <button v-for="dir in specialDirs" :key="dir.path" @click="expandDirectory(dir.path)" class="special-dir-btn">
        <Home :size="16" />
        <span>{{ dir.name }}</span>
      </button>
    </div>

    <!-- 目录树 -->
    <div class="directory-tree">
      <div v-if="loading && directories.length === 0" class="loading-state">
        <Loader2 :size="24" class="spinning" />
        <span>加载中...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <AlertCircle :size="24" />
        <span>{{ error }}</span>
        <button @click="refresh" class="btn-retry">重试</button>
      </div>

      <div v-else class="tree-items">
        <DirectoryTreeItem v-for="dir in directories" :key="dir.path" :directory="dir" :selected-path="selectedPath"
          :expanded-paths="expandedPaths" :loading-paths="loadingPaths" @select="handleSelect"
          @toggle="toggleDirectory" />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="picker-footer">
      <div class="selected-info">
        <span v-if="selectedPath">已选择: {{ selectedPath }}</span>
        <span v-else class="hint">请选择一个目录</span>
      </div>
      <div class="footer-actions">
        <button @click="$emit('close')" class="btn-secondary">
          <X :size="16" />
          <span>取消</span>
        </button>
        <button @click="confirm" :disabled="!selectedPath" class="btn-primary">
          <Check :size="16" />
          <span>确认</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Folder, FolderOpen, Home, ChevronRight, RefreshCw,
  Loader2, AlertCircle, X, Check, HardDrive
} from 'lucide-vue-next'
import DirectoryTreeItem from './DirectoryTreeItem.vue'
import { useApi } from '../composables/useApi'
import { useMessage } from '../composables/useMessage'

/**
 * 目录项类型
 */
export interface DirectoryItem {
  name: string
  path: string
  type: 'drive' | 'directory' | 'special'
  children?: DirectoryItem[]
  hasChildren?: boolean
}

/**
 * Props
 */
const props = defineProps<{
  initialPath?: string
}>()

/**
 * Emits
 */
const emit = defineEmits<{
  (e: 'select', path: string): void
  (e: 'close'): void
}>()

/**
 * 组合式函数
 */
const api = useApi()
const message = useMessage()

/**
 * 状态
 */
const loading = ref(false)
const error = ref('')
const selectedPath = ref(props.initialPath || '')
const directories = ref<DirectoryItem[]>([])
const specialDirs = ref<DirectoryItem[]>([])
const expandedPaths = ref<Set<string>>(new Set())
const loadingPaths = ref<Set<string>>(new Set())
const directoryCache = ref<Map<string, DirectoryItem[]>>(new Map())

/**
 * 加载根目录列表（驱动器）
 */
const loadRootDirectories = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await api.post('/api/projects/list-directories', { path: '' })

    if (response.success && response.data) {
      directories.value = response.data.directories || []

      if (response.data.specialDirs) {
        specialDirs.value = response.data.specialDirs
      }
    } else {
      error.value = response.message || '加载目录失败'
    }
  } catch (err: any) {
    error.value = err.message || '加载目录失败'
    message.error('加载目录失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载子目录
 */
const loadSubDirectories = async (path: string): Promise<DirectoryItem[]> => {
  // 检查缓存
  if (directoryCache.value.has(path)) {
    return directoryCache.value.get(path)!
  }

  try {
    const response = await api.post('/api/projects/list-directories', { path })

    if (response.success && response.data) {
      const dirs = response.data.directories || []
      directoryCache.value.set(path, dirs)
      return dirs
    }
    return []
  } catch (err: any) {
    message.error('加载子目录失败')
    return []
  }
}

/**
 * 切换目录展开/折叠
 */
const toggleDirectory = async (dir: DirectoryItem) => {
  const path = dir.path

  if (expandedPaths.value.has(path)) {
    // 折叠
    expandedPaths.value.delete(path)
  } else {
    // 展开
    expandedPaths.value.add(path)

    // 如果没有加载过子目录，则加载
    if (!directoryCache.value.has(path)) {
      loadingPaths.value.add(path)
      const children = await loadSubDirectories(path)

      // 更新目录项的children
      const updateChildren = (items: DirectoryItem[]) => {
        for (const item of items) {
          if (item.path === path) {
            item.children = children
            item.hasChildren = children.length > 0
            break
          }
          if (item.children) {
            updateChildren(item.children)
          }
        }
      }

      updateChildren(directories.value)
      loadingPaths.value.delete(path)
    }
  }
}

/**
 * 展开到指定目录
 */
const expandDirectory = async (path: string) => {
  selectedPath.value = path
  expandedPaths.value.add(path)

  // 加载子目录
  if (!directoryCache.value.has(path)) {
    loadingPaths.value.add(path)
    const children = await loadSubDirectories(path)

    // 查找并更新目录项
    const findAndUpdate = (items: DirectoryItem[]): boolean => {
      for (const item of items) {
        if (item.path === path) {
          item.children = children
          item.hasChildren = children.length > 0
          return true
        }
        if (item.children && findAndUpdate(item.children)) {
          return true
        }
      }
      return false
    }

    if (!findAndUpdate(directories.value)) {
      // 如果在当前树中找不到，可能是快捷目录，添加到根级别
      directories.value.push({
        name: path,
        path: path,
        type: 'directory',
        children: children,
        hasChildren: children.length > 0
      })
    }

    loadingPaths.value.delete(path)
  }
}

/**
 * 刷新
 */
const refresh = async () => {
  directoryCache.value.clear()
  expandedPaths.value.clear()
  await loadRootDirectories()
}

/**
 * 处理选择
 */
const handleSelect = (path: string) => {
  selectedPath.value = path
}

/**
 * 确认选择
 */
const confirm = () => {
  if (selectedPath.value) {
    emit('select', selectedPath.value)
  } else {
    message.warning('请选择一个目录')
  }
}

/**
 * 取消
 */
const cancel = () => {
  emit('close')
}

/**
 * 初始化
 */
onMounted(async () => {
  await loadRootDirectories()

  if (props.initialPath) {
    await expandDirectory(props.initialPath)
  }
})
</script>

<style scoped lang="less">
.directory-picker {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 600px;
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  overflow: hidden;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);

  .header-title {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    font-size: var(--ls-font-size-lg);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
  }

  .btn-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: var(--ls-border-radius-base);
    cursor: pointer;
    color: var(--ldesign-text-color-secondary);
    transition: all 0.2s;

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      color: var(--ldesign-text-color-primary);
    }
  }
}

.current-path {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  background: var(--ldesign-bg-color-component);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);
  font-size: var(--ls-font-size-sm);

  .path-label {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    color: var(--ldesign-text-color-secondary);
    white-space: nowrap;
  }

  .path-value {
    flex: 1;
    color: var(--ldesign-text-color-primary);
    font-family: 'Consolas', 'Monaco', monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.special-dirs {
  display: flex;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);

  .special-dir-btn {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-padding-xs) var(--ls-padding-sm);
    border: 1px solid var(--ldesign-border-level-2-color);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-brand-color);
    }
  }
}

.navigation {
  display: flex;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);

  .nav-btn {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-padding-xs) var(--ls-padding-sm);
    border: 1px solid var(--ldesign-border-level-2-color);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: var(--ldesign-bg-color-component-hover);
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-brand-color);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.directory-tree {
  flex: 1;
  overflow-y: auto;
  padding: var(--ls-padding-sm);

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--ls-spacing-base);
    height: 100%;
    color: var(--ldesign-text-color-secondary);

    .spinning {
      animation: spin 1s linear infinite;
    }

    .btn-retry {
      padding: var(--ls-padding-xs) var(--ls-padding-base);
      border: 1px solid var(--ldesign-border-level-2-color);
      background: var(--ldesign-bg-color-component);
      border-radius: var(--ls-border-radius-base);
      color: var(--ldesign-brand-color);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--ldesign-brand-color-focus);
      }
    }
  }

  .tree-items {
    display: flex;
    flex-direction: column;
  }
}

.picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-level-1-color);
  background: var(--ldesign-bg-color-component);

  .selected-info {
    flex: 1;
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .hint {
      color: var(--ldesign-text-color-placeholder);
    }
  }

  .footer-actions {
    display: flex;
    gap: var(--ls-spacing-sm);
  }

  .btn-secondary,
  .btn-primary {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-padding-xs) var(--ls-padding-base);
    border: 1px solid var(--ldesign-border-level-2-color);
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-sm);
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary {
    background: var(--ldesign-bg-color-component);
    color: var(--ldesign-text-color-secondary);

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-brand-color);
    }
  }

  .btn-primary {
    background: var(--ldesign-brand-color);
    border-color: var(--ldesign-brand-color);
    color: var(--ldesign-font-white-1);

    &:hover:not(:disabled) {
      background: var(--ldesign-brand-color-hover);
      border-color: var(--ldesign-brand-color-hover);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
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
</style>
