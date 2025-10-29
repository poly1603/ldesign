<template>
  <div class="tasks-page">
    <n-page-header title="任务中心" subtitle="管理和监控所有任务">
      <template #extra>
        <n-space>
          <n-button type="primary" @click="showCreateDialog = true">
            <template #icon>
              <Play />
            </template>
            创建任务
          </n-button>
          <n-button @click="refreshTasks">
            <template #icon>
              <RefreshCw />
            </template>
            刷新
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-space vertical :size="16" class="mt-4">
      <!-- 统计卡片 -->
      <n-grid :cols="4" :x-gap="16">
        <n-gi>
          <n-statistic label="总任务数" :value="tasks.length" />
        </n-gi>
        <n-gi>
          <n-statistic label="运行中" :value="runningCount" />
        </n-gi>
        <n-gi>
          <n-statistic label="已完成" :value="completedCount" />
        </n-gi>
        <n-gi>
          <n-statistic label="失败" :value="failedCount" />
        </n-gi>
      </n-grid>

      <!-- 筛选 -->
      <n-space>
        <n-select
          v-model:value="filterStatus"
          :options="statusOptions"
          placeholder="筛选状态"
          style="width: 200px"
          @update:value="refreshTasks"
        />
      </n-space>

      <!-- 任务列表 -->
      <n-card title="任务列表">
        <n-list bordered>
          <n-list-item v-for="task in tasks" :key="task.id">
            <template #prefix>
              <n-tag :type="getStatusType(task.status)">
                {{ getStatusText(task.status) }}
              </n-tag>
            </template>

            <n-thing>
              <template #header>
                {{ task.type }}
                <n-text depth="3" style="margin-left: 8px">
                  #{{ task.id.substring(0, 8) }}
                </n-text>
              </template>

              <template #description>
                <n-space vertical :size="4">
                  <n-text>{{ task.message }}</n-text>
                  <n-progress
                    v-if="task.status === 'running'"
                    type="line"
                    :percentage="task.progress"
                    :indicator-placement="'inside'"
                  />
                  <n-text depth="3" :size="'small'">
                    创建时间: {{ formatTime(task.createdAt) }}
                  </n-text>
                </n-space>
              </template>

              <template #action>
                <n-space>
                  <n-button
                    size="small"
                    @click="viewTaskDetail(task)"
                  >
                    查看详情
                  </n-button>
                  <n-button
                    v-if="task.status === 'running' || task.status === 'pending'"
                    size="small"
                    type="warning"
                    @click="cancelTask(task.id)"
                  >
                    取消
                  </n-button>
                  <n-button
                    v-if="task.status !== 'running' && task.status !== 'pending'"
                    size="small"
                    type="error"
                    @click="deleteTask(task.id)"
                  >
                    删除
                  </n-button>
                </n-space>
              </template>
            </n-thing>
          </n-list-item>

          <n-empty v-if="tasks.length === 0" description="暂无任务" />
        </n-list>
      </n-card>
    </n-space>

    <!-- 创建任务对话框 -->
    <n-modal v-model:show="showCreateDialog" preset="dialog" title="创建任务">
      <n-form :model="createForm">
        <n-form-item label="任务类型">
          <n-select
            v-model:value="createForm.type"
            :options="taskTypeOptions"
            placeholder="选择任务类型"
          />
        </n-form-item>
        <n-form-item label="项目">
          <n-select
            v-model:value="createForm.projectId"
            :options="projectOptions"
            placeholder="选择项目"
            clearable
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="showCreateDialog = false">取消</n-button>
          <n-button type="primary" @click="createTask">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 任务详情对话框 -->
    <n-modal v-model:show="showDetailDialog" preset="card" title="任务详情" style="width: 700px">
      <n-descriptions v-if="selectedTask" :column="2" bordered>
        <n-descriptions-item label="任务ID">
          {{ selectedTask.id }}
        </n-descriptions-item>
        <n-descriptions-item label="类型">
          {{ selectedTask.type }}
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="getStatusType(selectedTask.status)">
            {{ getStatusText(selectedTask.status) }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="进度">
          {{ selectedTask.progress }}%
        </n-descriptions-item>
        <n-descriptions-item label="消息">
          {{ selectedTask.message }}
        </n-descriptions-item>
        <n-descriptions-item v-if="selectedTask.error" label="错误">
          <n-text type="error">{{ selectedTask.error }}</n-text>
        </n-descriptions-item>
      </n-descriptions>

      <n-divider>执行日志</n-divider>

      <n-log :log="taskLogs" :rows="15" language="log" />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'
import { Play, RefreshCw } from 'lucide-vue-next'
import { api } from '@/api'

const message = useMessage()

const tasks = ref<any[]>([])
const filterStatus = ref<string>('')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const selectedTask = ref<any>(null)

const createForm = ref({
  type: 'build',
  projectId: undefined as string | undefined,
})

const projects = ref<any[]>([])

// 计算属性
const runningCount = computed(() => tasks.value.filter(t => t.status === 'running').length)
const completedCount = computed(() => tasks.value.filter(t => t.status === 'completed').length)
const failedCount = computed(() => tasks.value.filter(t => t.status === 'failed').length)

const taskLogs = computed(() => {
  if (!selectedTask.value?.logs) return ''
  return selectedTask.value.logs
    .map((log: any) => `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level.toUpperCase()}] ${log.message}`)
    .join('\n')
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '等待中', value: 'pending' },
  { label: '运行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' },
  { label: '已取消', value: 'cancelled' },
]

const taskTypeOptions = [
  { label: '构建', value: 'build' },
  { label: '测试', value: 'test' },
  { label: '部署', value: 'deploy' },
]

const projectOptions = computed(() => 
  projects.value.map(p => ({ label: p.name, value: p.id }))
)

// 方法
async function refreshTasks() {
  try {
    tasks.value = await api.getTasks(filterStatus.value || undefined)
  } catch (error: any) {
    message.error('获取任务列表失败: ' + error.message)
  }
}

async function createTask() {
  try {
    await api.createTask(createForm.value)
    message.success('任务已创建')
    showCreateDialog.value = false
    refreshTasks()
  } catch (error: any) {
    message.error('创建任务失败: ' + error.message)
  }
}

async function cancelTask(id: string) {
  try {
    await api.cancelTask(id)
    message.success('任务已取消')
    refreshTasks()
  } catch (error: any) {
    message.error('取消任务失败: ' + error.message)
  }
}

async function deleteTask(id: string) {
  try {
    await api.deleteTask(id)
    message.success('任务已删除')
    refreshTasks()
  } catch (error: any) {
    message.error('删除任务失败: ' + error.message)
  }
}

function viewTaskDetail(task: any) {
  selectedTask.value = task
  showDetailDialog.value = true
}

function getStatusType(status: string): any {
  const types: any = {
    pending: 'default',
    running: 'info',
    completed: 'success',
    failed: 'error',
    cancelled: 'warning',
  }
  return types[status] || 'default'
}

function getStatusText(status: string): string {
  const texts: any = {
    pending: '等待中',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 自动刷新
let refreshInterval: number | undefined

onMounted(async () => {
  refreshTasks()
  
  // 加载项目列表
  try {
    projects.value = await api.getProjects()
  } catch (error) {
    console.error('Failed to load projects', error)
  }
  
  // 每5秒自动刷新
  refreshInterval = window.setInterval(refreshTasks, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.tasks-page {
  padding: 24px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
