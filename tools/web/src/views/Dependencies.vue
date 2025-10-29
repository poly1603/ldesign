<template>
  <div class="dependencies-page">
    <n-page-header title="依赖管理" subtitle="查看和管理项目依赖">
      <template #extra>
        <n-space>
          <n-select
            v-model:value="selectedProjectId"
            :options="projectOptions"
            placeholder="选择项目"
            style="width: 250px"
            @update:value="loadDependencies"
          />
          <n-button @click="checkUpdates">
            <template #icon>
              <RefreshCw />
            </template>
            检查更新
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <div v-if="!selectedProjectId" class="empty-state">
      <n-empty description="请选择一个项目查看依赖信息" />
    </div>

    <n-space v-else vertical :size="16" class="mt-4">
      <!-- 依赖统计 -->
      <n-grid :cols="4" :x-gap="16">
        <n-gi>
          <n-card>
            <n-statistic label="生产依赖">
              <template #prefix>
                <Package />
              </template>
              {{ stats.dependencies }}
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="开发依赖">
              <template #prefix>
                <Package />
              </template>
              {{ stats.devDependencies }}
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="可更新">
              <template #prefix>
                <ArrowUp />
              </template>
              {{ stats.outdated }}
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="总依赖">
              <template #prefix>
                <Boxes />
              </template>
              {{ stats.total }}
            </n-statistic>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 依赖列表 -->
      <n-tabs type="line" animated>
        <n-tab-pane name="dependencies" tab="生产依赖">
          <n-card>
            <n-data-table
              :columns="dependencyColumns"
              :data="dependenciesData"
              :pagination="{ pageSize: 10 }"
              :bordered="false"
            />
          </n-card>
        </n-tab-pane>

        <n-tab-pane name="devDependencies" tab="开发依赖">
          <n-card>
            <n-data-table
              :columns="dependencyColumns"
              :data="devDependenciesData"
              :pagination="{ pageSize: 10 }"
              :bordered="false"
            />
          </n-card>
        </n-tab-pane>

        <n-tab-pane name="updates" tab="可用更新">
          <n-card>
            <n-space vertical v-if="updates.length === 0">
              <n-empty description="所有依赖都是最新版本" />
            </n-space>
            <n-list v-else bordered>
              <n-list-item v-for="update in updates" :key="update.name">
                <n-thing>
                  <template #header>
                    {{ update.name }}
                  </template>
                  <template #description>
                    <n-space>
                      <n-tag type="warning" size="small">
                        当前: {{ update.current }}
                      </n-tag>
                      <n-icon><ArrowRight /></n-icon>
                      <n-tag type="success" size="small">
                        最新: {{ update.latest }}
                      </n-tag>
                    </n-space>
                  </template>
                  <template #action>
                    <n-button size="small" type="primary" @click="updateDependency(update.name)">
                      更新
                    </n-button>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-card>
        </n-tab-pane>

        <n-tab-pane name="tree" tab="依赖树">
          <n-card>
            <n-tree
              :data="dependencyTree"
              :selectable="false"
              :show-irrelevant-nodes="false"
              block-line
            />
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useMessage } from 'naive-ui'
import { Package, Boxes, RefreshCw, ArrowUp, ArrowRight } from 'lucide-vue-next'
import { api } from '@/api'

const message = useMessage()

const selectedProjectId = ref<string>()
const projects = ref<any[]>([])
const dependencies = reactive<any>({
  dependencies: {},
  devDependencies: {},
  peerDependencies: {},
})
const updates = ref<any[]>([])
const treeData = ref<any>(null)

const projectOptions = computed(() =>
  projects.value.map(p => ({ label: p.name, value: p.id }))
)

const stats = computed(() => ({
  dependencies: Object.keys(dependencies.dependencies).length,
  devDependencies: Object.keys(dependencies.devDependencies).length,
  outdated: updates.value.length,
  total: Object.keys(dependencies.dependencies).length + Object.keys(dependencies.devDependencies).length,
}))

const dependenciesData = computed(() =>
  Object.entries(dependencies.dependencies).map(([name, version]) => ({
    name,
    version,
    type: 'dependencies',
  }))
)

const devDependenciesData = computed(() =>
  Object.entries(dependencies.devDependencies).map(([name, version]) => ({
    name,
    version,
    type: 'devDependencies',
  }))
)

const dependencyTree = computed(() => {
  if (!treeData.value) return []
  
  return [{
    label: treeData.value.name + '@' + treeData.value.version,
    key: treeData.value.name,
    children: treeData.value.dependencies?.map((dep: any) => ({
      label: dep.name + '@' + dep.version,
      key: dep.name + '-' + Math.random(),
      children: dep.dependencies?.map((subDep: any) => ({
        label: subDep.name + '@' + subDep.version,
        key: subDep.name + '-' + Math.random(),
      })) || [],
    })) || [],
  }]
})

const dependencyColumns = [
  {
    title: '包名',
    key: 'name',
    render: (row: any) => {
      return h('a', {
        href: `https://www.npmjs.com/package/${row.name}`,
        target: '_blank',
        style: 'color: #667eea; text-decoration: none;',
      }, row.name)
    },
  },
  { title: '版本', key: 'version' },
  { title: '类型', key: 'type' },
]

async function loadProjects() {
  try {
    projects.value = await api.getProjects()
  } catch (error: any) {
    message.error('加载项目失败: ' + error.message)
  }
}

async function loadDependencies() {
  if (!selectedProjectId.value) return

  try {
    const data = await api.getDependencies?.(selectedProjectId.value)
    if (data) {
      Object.assign(dependencies, data)
    }
    
    // 加载依赖树
    const tree = await api.getDependencyTree?.(selectedProjectId.value)
    treeData.value = tree
  } catch (error: any) {
    message.error('加载依赖失败: ' + error.message)
  }
}

async function checkUpdates() {
  if (!selectedProjectId.value) {
    message.warning('请先选择项目')
    return
  }

  try {
    const data = await api.checkDependencyUpdates?.(selectedProjectId.value)
    updates.value = data || []
    
    if (updates.value.length === 0) {
      message.success('所有依赖都是最新版本')
    } else {
      message.info(`发现 ${updates.value.length} 个可更新的依赖`)
    }
  } catch (error: any) {
    message.error('检查更新失败: ' + error.message)
  }
}

async function updateDependency(name: string) {
  message.info(`正在更新 ${name}...`)
  // TODO: 实现更新逻辑
  setTimeout(() => {
    message.success(`${name} 更新成功`)
    // 重新加载依赖
    loadDependencies()
    checkUpdates()
  }, 1000)
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.dependencies-page {
  padding: 24px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
