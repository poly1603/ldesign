<template>
  <n-layout style="height: 100vh">
    <n-layout-header bordered style="height: 64px; padding: 0 24px">
      <h2>项目管理</h2>
    </n-layout-header>

    <n-layout-content style="padding: 24px">
      <n-space vertical size="large">
        <n-space>
          <n-button type="primary" @click="showImportModal = true">
            📁 导入项目
          </n-button>
          <n-button @click="showCreateModal = true">
            ➕ 创建项目
          </n-button>
          <n-button @click="projectsStore.fetchProjects()">
            🔄 刷新
          </n-button>
        </n-space>

        <n-spin :show="projectsStore.loading">
          <n-grid cols="3" x-gap="12" y-gap="12">
            <n-grid-item v-for="project in projectsStore.projects" :key="project.id">
              <n-card :title="project.name" hoverable @click="handleProjectClick(project.id)">
                <template #header-extra>
                  {{ project.framework || project.type }}
                </template>
                <n-text depth="3">{{ project.path }}</n-text>
              </n-card>
            </n-grid-item>
          </n-grid>

          <n-empty v-if="projectsStore.projects.length === 0" description="暂无项目">
            <template #extra>
              <n-button @click="showImportModal = true">导入项目</n-button>
            </template>
          </n-empty>
        </n-spin>
      </n-space>

      <!-- 导入项目对话框 -->
      <n-modal v-model:show="showImportModal" preset="dialog" title="导入项目">
        <n-form>
          <n-form-item label="项目路径">
            <n-input v-model:value="importPath" placeholder="请输入项目路径" />
          </n-form-item>
        </n-form>
        <template #action>
          <n-button @click="showImportModal = false">取消</n-button>
          <n-button type="primary" @click="handleImport">导入</n-button>
        </template>
      </n-modal>

      <!-- 创建项目对话框 -->
      <n-modal v-model:show="showCreateModal" preset="dialog" title="创建项目">
        <n-form>
          <n-form-item label="项目名称">
            <n-input v-model:value="createForm.name" />
          </n-form-item>
          <n-form-item label="项目路径">
            <n-input v-model:value="createForm.path" />
          </n-form-item>
        </n-form>
        <template #action>
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="handleCreate">创建</n-button>
        </template>
      </n-modal>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  NCard,
  NSpace,
  NButton,
  NGrid,
  NGridItem,
  NSpin,
  NEmpty,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NTag,
  NDivider,
  NEllipsis,
} from 'naive-ui'
import {
  Search,
  FolderInput,
  Plus,
  RefreshCw,
  FolderOpen,
  Folder,
  Package,
  Clock,
} from 'lucide-vue-next'
import { useProjectsStore } from '../store/projects'

const router = useRouter()
const message = useMessage()
const projectsStore = useProjectsStore()

const showImportModal = ref(false)
const showCreateModal = ref(false)
const importPath = ref('')
const searchKeyword = ref('')
const createForm = ref({
  name: '',
  path: '',
})

// 过滤项目
const filteredProjects = computed(() => {
  if (!searchKeyword.value) {
    return projectsStore.projects
  }
  const keyword = searchKeyword.value.toLowerCase()
  return projectsStore.projects.filter(
    (p) =>
      p.name.toLowerCase().includes(keyword) ||
      p.path.toLowerCase().includes(keyword) ||
      p.framework?.toLowerCase().includes(keyword)
  )
})

function handleProjectClick(id: string) {
  router.push(`/projects/${id}`)
}

function handleRefresh() {
  projectsStore.fetchProjects()
}

function getFrameworkType(framework?: string): any {
  const typeMap: Record<string, any> = {
    vue: 'success',
    react: 'info',
    angular: 'error',
    svelte: 'warning',
  }
  return typeMap[framework || ''] || 'default'
}

function formatTime(timestamp: number) {
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    return `${Math.floor(diff / minute)} 分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)} 小时前`
  } else if (diff < 30 * day) {
    return `${Math.floor(diff / day)} 天前`
  } else {
    return new Date(timestamp).toLocaleDateString()
  }
}

async function handleImport() {
  if (!importPath.value) {
    message.error('请输入项目路径')
    return
  }

  try {
    await projectsStore.importProject(importPath.value)
    message.success('项目导入成功')
    showImportModal.value = false
    importPath.value = ''
  } catch (error: any) {
    message.error(error.message || '导入失败')
  }
}

async function handleCreate() {
  message.info('创建项目功能开发中...')
}

onMounted(() => {
  projectsStore.fetchProjects()
})
</script>

<style scoped>
.projects-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.empty-state {
  padding: 60px 0;
}

.project-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--n-border-color);
  height: 100%;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(100, 126, 234, 0.15);
  border-color: #667eea;
}

.project-card-content {
  display: flex;
  flex-direction: column;
}

.project-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.project-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(100, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
  flex-shrink: 0;
}

.project-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--n-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-details {
  color: var(--n-text-color-3);
  font-size: 13px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

/* 暗黑模式优化 */
:global(.dark) .project-card:hover {
  box-shadow: 0 8px 24px rgba(100, 126, 234, 0.25);
}

:global(.dark) .project-icon {
  background: linear-gradient(135deg, rgba(100, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
}
</style>

