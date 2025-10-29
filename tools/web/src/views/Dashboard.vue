<template>
  <n-card title="欢迎使用 LDesign CLI" class="welcome-card">
      <n-space vertical size="large">
        <n-grid cols="4" x-gap="16" y-gap="16">
          <n-grid-item>
            <n-statistic label="项目数量" :value="projectsStore.projects.length">
              <template #prefix>
                <span style="font-size: 24px">📁</span>
              </template>
            </n-statistic>
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="构建次数" :value="stats.builds">
              <template #prefix>
                <span style="font-size: 24px">🔨</span>
              </template>
            </n-statistic>
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="部署次数" :value="stats.deployments">
              <template #prefix>
                <span style="font-size: 24px">🚀</span>
              </template>
            </n-statistic>
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="活跃工具" :value="stats.activeTools">
              <template #prefix>
                <span style="font-size: 24px">🔧</span>
              </template>
            </n-statistic>
          </n-grid-item>
        </n-grid>

        <n-divider />

        <h3>快速操作</h3>
        <n-grid cols="3" x-gap="16" y-gap="16">
          <n-grid-item>
            <n-card class="action-card" hoverable @click="handleImport">
              <div class="action-content">
                <span class="action-icon">📁</span>
                <h4>导入项目</h4>
                <n-text depth="3">导入现有项目到管理器</n-text>
              </div>
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card class="action-card" hoverable @click="handleCreate">
              <div class="action-content">
                <span class="action-icon">➕</span>
                <h4>创建项目</h4>
                <n-text depth="3">从模板创建新项目</n-text>
              </div>
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card class="action-card" hoverable @click="handleTools">
              <div class="action-content">
                <span class="action-icon">🔧</span>
                <h4>工具管理</h4>
                <n-text depth="3">查看和管理所有工具</n-text>
              </div>
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card class="action-card" hoverable @click="handleTasks">
              <div class="action-content">
                <span class="action-icon">✅</span>
                <h4>任务中心</h4>
                <n-text depth="3">管理和监控所有任务</n-text>
              </div>
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card class="action-card" hoverable @click="handlePerformance">
              <div class="action-content">
                <span class="action-icon">📊</span>
                <h4>性能监控</h4>
                <n-text depth="3">实时系统性能监控</n-text>
              </div>
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card class="action-card" hoverable @click="handleSettings">
              <div class="action-content">
                <span class="action-icon">⚙️</span>
                <h4>系统设置</h4>
                <n-text depth="3">配置和管理系统</n-text>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-space>
    </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NSpace, NStatistic, NGrid, NGridItem, NText, NDivider } from 'naive-ui'
import { useProjectsStore } from '../store/projects'

const router = useRouter()
const projectsStore = useProjectsStore()

const stats = ref({
  builds: 0,
  deployments: 0,
  activeTools: 6,
})

function handleImport() {
  router.push('/projects?action=import')
}

function handleCreate() {
  router.push('/projects?action=create')
}

function handleTools() {
  router.push('/tools')
}

function handleTasks() {
  router.push('/tasks')
}

function handlePerformance() {
  router.push('/performance')
}

function handleSettings() {
  router.push('/settings')
}

onMounted(() => {
  projectsStore.fetchProjects()
})
</script>

<style scoped>
.welcome-card {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(100, 126, 234, 0.3);
  border-color: #667eea;
}

.action-content {
  text-align: center;
  padding: 20px;
}

.action-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.action-content h4 {
  margin: 8px 0;
  font-size: 18px;
  font-weight: 600;
}
</style>

