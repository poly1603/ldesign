<template>
  <n-layout style="height: 100vh">
    <n-layout-header bordered style="height: 64px; padding: 0 24px; display: flex; align-items: center">
      <h2>部署管理</h2>
      <n-space style="margin-left: auto">
        <n-button type="primary" @click="showCreateModal = true">➕ 新建部署</n-button>
        <n-button @click="handleRefresh">🔄 刷新</n-button>
      </n-space>
    </n-layout-header>

    <n-layout-content style="padding: 24px">
      <n-spin :show="loading">
        <n-data-table
          :columns="columns"
          :data="deployments"
          :pagination="pagination"
          :bordered="false"
        />
      </n-spin>

      <!-- 新建部署对话框 -->
      <n-modal v-model:show="showCreateModal" preset="dialog" title="新建部署">
        <n-form>
          <n-form-item label="项目ID">
            <n-input v-model:value="createForm.projectId" />
          </n-form-item>
          <n-form-item label="环境">
            <n-select
              v-model:value="createForm.environment"
              :options="envOptions"
            />
          </n-form-item>
          <n-form-item label="版本">
            <n-input v-model:value="createForm.version" />
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
import { ref, h, onMounted } from 'vue'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NSpace,
  NButton,
  NDataTable,
  NSpin,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  useMessage,
} from 'naive-ui'
import { deploymentsApi, type Deployment } from '../api/deployments'

const message = useMessage()
const loading = ref(false)
const deployments = ref<Deployment[]>([])
const showCreateModal = ref(false)
const createForm = ref({
  projectId: '',
  environment: 'development',
  version: '',
})

const envOptions = [
  { label: '开发环境', value: 'development' },
  { label: '测试环境', value: 'staging' },
  { label: '生产环境', value: 'production' },
]

const columns = [
  { title: 'ID', key: 'id', width: 100, ellipsis: { tooltip: true } },
  { title: '项目ID', key: 'projectId', width: 100, ellipsis: { tooltip: true } },
  { title: '环境', key: 'environment', width: 100 },
  { title: '版本', key: 'version', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: Deployment) => {
      const statusMap: Record<string, { type: any; text: string }> = {
        pending: { type: 'info', text: '待处理' },
        deploying: { type: 'warning', text: '部署中' },
        success: { type: 'success', text: '成功' },
        failed: { type: 'error', text: '失败' },
        rolled_back: { type: 'default', text: '已回滚' },
      }
      const config = statusMap[row.status] || { type: 'default', text: row.status }
      return h(NTag, { type: config.type }, () => config.text)
    },
  },
  {
    title: '开始时间',
    key: 'startTime',
    width: 180,
    render: (row: Deployment) => new Date(row.startTime).toLocaleString(),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row: Deployment) => {
      return h(
        NButton,
        {
          size: 'small',
          type: 'warning',
          onClick: () => handleRollback(row.id),
          disabled: row.status === 'rolled_back',
        },
        () => '回滚'
      )
    },
  },
]

const pagination = {
  pageSize: 20,
}

async function fetchDeployments() {
  loading.value = true
  try {
    deployments.value = await deploymentsApi.getAll()
  } catch (error: any) {
    message.error(error.message || '获取部署列表失败')
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!createForm.value.projectId) {
    message.error('请输入项目ID')
    return
  }

  try {
    await deploymentsApi.create(createForm.value)
    message.success('部署已创建')
    showCreateModal.value = false
    createForm.value = { projectId: '', environment: 'development', version: '' }
    await fetchDeployments()
  } catch (error: any) {
    message.error(error.message || '创建失败')
  }
}

async function handleRollback(id: string) {
  try {
    await deploymentsApi.rollback(id)
    message.success('部署已回滚')
    await fetchDeployments()
  } catch (error: any) {
    message.error(error.message || '回滚失败')
  }
}

function handleRefresh() {
  fetchDeployments()
}

onMounted(() => {
  fetchDeployments()
})
</script>
