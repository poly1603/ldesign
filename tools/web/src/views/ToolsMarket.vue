<template>
  <div class="tools-market">
    <n-page-header title="工具包市场" subtitle="浏览和管理开发工具包">
      <template #extra>
        <n-space>
          <n-input
            v-model:value="searchQuery"
            placeholder="搜索工具包..."
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <n-icon :component="SearchOutline" />
            </template>
          </n-input>
          <n-button type="primary" @click="refreshTools">
            <template #icon>
              <n-icon :component="RefreshOutline" />
            </template>
            刷新
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-spin :show="loading">
      <n-grid :cols="3" :x-gap="16" :y-gap="16" style="margin-top: 20px">
        <n-grid-item v-for="tool in filteredTools" :key="tool.name">
          <n-card :title="tool.metadata.displayName" hoverable>
            <template #header-extra>
              <n-tag :type="tool.status === 'active' ? 'success' : 'default'">
                {{ tool.status === 'active' ? '已激活' : '未激活' }}
              </n-tag>
            </template>

            <n-space vertical>
              <div class="tool-icon">{{ tool.metadata.icon }}</div>
              <n-text>{{ tool.metadata.description }}</n-text>

              <n-divider style="margin: 12px 0" />

              <n-space>
                <n-button
                  v-if="tool.status === 'active'"
                  size="small"
                  @click="handleConfigure(tool)"
                >
                  <template #icon>
                    <n-icon :component="SettingsOutline" />
                  </template>
                  配置
                </n-button>
                <n-button
                  v-else
                  type="primary"
                  size="small"
                  @click="handleLoad(tool)"
                >
                  <template #icon>
                    <n-icon :component="DownloadOutline" />
                  </template>
                  加载
                </n-button>

                <n-button
                  size="small"
                  @click="handleExecute(tool)"
                  :disabled="tool.status !== 'active'"
                >
                  <template #icon>
                    <n-icon :component="PlayOutline" />
                  </template>
                  执行
                </n-button>
              </n-space>
            </n-space>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-spin>

    <!-- 配置弹窗 -->
    <n-modal
      v-model:show="configModalVisible"
      preset="card"
      title="工具配置"
      :style="{ width: '600px' }"
    >
      <n-form v-if="selectedTool" label-placement="left" label-width="120px">
        <n-form-item label="工具名称">
          <n-input :value="selectedTool.metadata.displayName" disabled />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="toolConfig.enabled" />
        </n-form-item>
        <n-form-item label="自动运行">
          <n-switch v-model:value="toolConfig.autoRun" />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="configModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveConfig">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import {
  SearchOutline,
  RefreshOutline,
  SettingsOutline,
  DownloadOutline,
  PlayOutline,
} from '@vicons/ionicons5'

const message = useMessage()

interface Tool {
  name: string
  status: string
  metadata: {
    name: string
    displayName: string
    description: string
    icon: string
  }
}

const loading = ref(false)
const searchQuery = ref('')
const tools = ref<Tool[]>([])
const selectedTool = ref<Tool | null>(null)
const configModalVisible = ref(false)
const toolConfig = ref({
  enabled: true,
  autoRun: false,
})

const filteredTools = computed(() => {
  if (!searchQuery.value) return tools.value
  const query = searchQuery.value.toLowerCase()
  return tools.value.filter(
    (tool) =>
      tool.metadata.displayName.toLowerCase().includes(query) ||
      tool.metadata.description.toLowerCase().includes(query)
  )
})

async function fetchTools() {
  loading.value = true
  try {
    const response = await fetch('http://127.0.0.1:3000/api/tools')
    const result = await response.json()
    if (result.success) {
      tools.value = result.data
    }
  } catch (error) {
    message.error('获取工具列表失败')
  } finally {
    loading.value = false
  }
}

function refreshTools() {
  fetchTools()
}

function handleConfigure(tool: Tool) {
  selectedTool.value = tool
  toolConfig.value = {
    enabled: tool.status === 'active',
    autoRun: false,
  }
  configModalVisible.value = true
}

async function saveConfig() {
  if (!selectedTool.value) return

  try {
    const response = await fetch(
      `http://127.0.0.1:3000/api/tools/${selectedTool.value.name}/config`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolConfig.value),
      }
    )
    const result = await response.json()
    if (result.success) {
      message.success('配置保存成功')
      configModalVisible.value = false
    }
  } catch (error) {
    message.error('保存配置失败')
  }
}

async function handleLoad(tool: Tool) {
  loading.value = true
  try {
    const response = await fetch(`http://127.0.0.1:3000/api/tools/${tool.name}/load`, {
      method: 'POST',
    })
    const result = await response.json()
    if (result.success) {
      message.success(`${tool.metadata.displayName} 加载成功`)
      await fetchTools()
    }
  } catch (error) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function handleExecute(tool: Tool) {
  try {
    const response = await fetch(
      `http://127.0.0.1:3000/api/tools/${tool.name}/execute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', params: {} }),
      }
    )
    const result = await response.json()
    if (result.success) {
      message.success(`${tool.metadata.displayName} 执行成功`)
    }
  } catch (error) {
    message.error('执行失败')
  }
}

onMounted(() => {
  fetchTools()
})
</script>

<style scoped>
.tools-market {
  padding: 20px;
}

.tool-icon {
  font-size: 48px;
  text-align: center;
  padding: 20px 0;
}
</style>
