<template>
  <div class="project-detail">
    <!-- 项目信息头部 -->
    <n-card class="project-header" :bordered="false">
      <div class="project-info">
        <div class="project-title">
          <h2>{{ project?.name || '加载中...' }}</h2>
          <n-tag :type="project ? 'success' : 'default'">
            {{ project?.framework || project?.type || 'Unknown' }}
          </n-tag>
        </div>
        <n-text depth="3">{{ project?.path }}</n-text>
      </div>
    </n-card>

    <!-- 功能导航菜单 -->
    <n-card class="project-nav" :bordered="false">
      <n-menu
        mode="horizontal"
        :value="currentTab"
        :options="menuOptions"
        @update:value="handleTabChange"
      />
    </n-card>

    <!-- 子路由内容区 -->
    <div class="project-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NTag, NText, NMenu } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  FileText,
  Hammer,
  Rocket,
  TestTube,
  GitBranch,
  Package,
  Sparkles,
  Shield,
  Zap,
  Activity,
  BookOpen,
  Upload,
  Languages,
} from 'lucide-vue-next'
import { projectsApi, type Project } from '../api/projects'
import { useMessage } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const project = ref<Project | null>(null)
const loading = ref(false)

const currentTab = computed(() => {
  const path = route.path
  const id = route.params.id as string
  if (path === `/projects/${id}`) return 'overview'
  return path.split('/').pop() || 'overview'
})

const menuOptions: MenuOption[] = [
  {
    label: '概览',
    key: 'overview',
    icon: () => h(FileText, { size: 18 }),
  },
  {
    label: '构建',
    key: 'builder',
    icon: () => h(Hammer, { size: 18 }),
  },
  {
    label: '部署',
    key: 'deployer',
    icon: () => h(Rocket, { size: 18 }),
  },
  {
    label: '测试',
    key: 'testing',
    icon: () => h(TestTube, { size: 18 }),
  },
  {
    label: 'Git',
    key: 'git',
    icon: () => h(GitBranch, { size: 18 }),
  },
  {
    label: '依赖管理',
    key: 'deps',
    icon: () => h(Package, { size: 18 }),
  },
  {
    label: '代码格式化',
    key: 'formatter',
    icon: () => h(Sparkles, { size: 18 }),
  },
  {
    label: '安全检查',
    key: 'security',
    icon: () => h(Shield, { size: 18 }),
  },
  {
    label: '性能分析',
    key: 'performance',
    icon: () => h(Zap, { size: 18 }),
  },
  {
    label: '监控',
    key: 'monitor',
    icon: () => h(Activity, { size: 18 }),
  },
  {
    label: '变更日志',
    key: 'changelog',
    icon: () => h(BookOpen, { size: 18 }),
  },
  {
    label: '文档生成',
    key: 'docs',
    icon: () => h(BookOpen, { size: 18 }),
  },
  {
    label: '发布',
    key: 'publisher',
    icon: () => h(Upload, { size: 18 }),
  },
  {
    label: '国际化',
    key: 'translator',
    icon: () => h(Languages, { size: 18 }),
  },
]

async function fetchProject() {
  const id = route.params.id as string
  if (!id) return

  loading.value = true
  try {
    project.value = await projectsApi.getById(id)
  } catch (error: any) {
    message.error(error.message || '获取项目信息失败')
  } finally {
    loading.value = false
  }
}

function handleTabChange(key: string) {
  const id = route.params.id
  if (key === 'overview') {
    router.push(`/projects/${id}`)
  } else {
    router.push(`/projects/${id}/${key}`)
  }
}

onMounted(() => {
  fetchProject()
})
</script>

<style scoped>
.project-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-header {
  background: linear-gradient(135deg, rgba(100, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.project-nav {
  padding: 0;
}

.project-nav :deep(.n-card__content) {
  padding: 0;
}

.project-content {
  flex: 1;
}
</style>

