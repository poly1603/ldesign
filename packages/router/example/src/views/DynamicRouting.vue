<script setup lang="ts">
import {
  useHash,
  useParams,
  useQuery,
  useRoute,
  useRouter,
} from '@ldesign/router'
import { computed, onMounted, ref, watch } from 'vue'

interface Props {
  id?: string
}

const props = defineProps<Props>()

const route = useRoute()
const router = useRouter()
const params = useParams()
const query = useQuery()
const hash = useHash()

// 响应式数据
const customId = ref('')
const customQuery = ref('')
const paramHistory = ref<
  Array<{
    time: string
    from: string
    to: string
    type: string
  }>
>([])

// 测试数据
const numericIds = [1, 42, 123, 999, 2024]
const stringIds = ['user', 'admin', 'guest', 'test-user', 'demo']

// 计算属性
const routeId = computed(() => props.id || route.value?.params?.id || '')

const paramType = computed(() => {
  const id = routeId.value
  if (!id) return '无'
  if (/^\d+$/.test(id)) return '数字'
  if (/^[a-z][\w-]*$/i.test(id)) return '标识符'
  return '其他'
})

const isNumericId = computed(() => /^\d+$/.test(routeId.value))

const routeInfo = computed(() => ({
  path: route.value?.path || '',
  name: route.value?.name || '',
  params: route.value?.params || {},
  query: route.value?.query || {},
  hash: route.value?.hash || '',
  fullPath: route.value?.fullPath || '',
}))

// 验证计算属性
const idValidation = computed(() => {
  const id = routeId.value
  if (!id) {
    return { message: 'ID 不能为空', class: 'error' }
  }
  if (/^\d+$/.test(id)) {
    const numId = Number.parseInt(id)
    if (numId < 1 || numId > 9999) {
      return { message: 'ID 超出有效范围 (1-9999)', class: 'warning' }
    }
    return { message: '数字 ID 格式正确', class: 'success' }
  }
  if (/^[a-z][\w-]*$/i.test(id)) {
    return { message: '标识符格式正确', class: 'success' }
  }
  return { message: 'ID 格式不符合规范', class: 'error' }
})

const completenessValidation = computed(() => {
  const hasId = !!routeId.value
  const hasValidPath = (route.value?.path || '').includes('/dynamic/')

  if (hasId && hasValidPath) {
    return { message: '参数完整', class: 'success' }
  }
  return { message: '参数不完整', class: 'error' }
})

const queryValidation = computed(() => {
  const queryKeys = Object.keys(route.value?.query || {})
  if (queryKeys.length === 0) {
    return { message: '无查询参数', class: 'info' }
  }

  const hasInvalidKeys = queryKeys.some(key => !/^[a-z]\w*$/i.test(key))
  if (hasInvalidKeys) {
    return { message: '查询参数键名不规范', class: 'warning' }
  }

  return { message: `查询参数正常 (${queryKeys.length} 个)`, class: 'success' }
})

// 组合式 API 信息
const paramsInfo = computed(() => ({
  'params.value': params.value,
  'route.params': route.value?.params || {},
}))

const queryInfo = computed(() => ({
  'query.value': query.value,
  'route.query': route.value?.query || {},
}))

const hashInfo = computed(() => ({
  'hash.value': hash.value,
  'route.hash': route.value?.hash || '',
}))

// 方法
function navigateToId(id: string | number) {
  router.push(`/dynamic/${id}`)
}

function navigateCustom() {
  if (!customId.value) return

  const queryParams: Record<string, string> = {}
  if (customQuery.value) {
    customQuery.value.split('&').forEach(pair => {
      const [key, value] = pair.split('=')
      if (key && value) {
        queryParams[key] = decodeURIComponent(value)
      }
    })
  }

  router.push({
    path: `/dynamic/${customId.value}`,
    query: queryParams,
  })
}

function clearHistory() {
  paramHistory.value = []
}

// 监听参数变化
watch(
  () => routeId.value,
  (newId, oldId) => {
    if (oldId !== undefined) {
      paramHistory.value.unshift({
        time: new Date().toLocaleTimeString(),
        from: oldId || '无',
        to: newId || '无',
        type: 'ID 参数',
      })

      // 只保留最近 10 条记录
      if (paramHistory.value.length > 10) {
        paramHistory.value = paramHistory.value.slice(0, 10)
      }
    }
  }
)

watch(
  () => route.value?.query || {},
  (newQuery, oldQuery) => {
    if (oldQuery && JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
      paramHistory.value.unshift({
        time: new Date().toLocaleTimeString(),
        from: JSON.stringify(oldQuery),
        to: JSON.stringify(newQuery),
        type: '查询参数',
      })

      if (paramHistory.value.length > 10) {
        paramHistory.value = paramHistory.value.slice(0, 10)
      }
    }
  },
  { deep: true }
)

onMounted(() => {
  // DynamicRouting 组件已挂载
  // 当前参数可用: id 和 query
})
</script>

<template>
  <div class="dynamic-routing">
    <div class="card">
      <h1>动态路由演示</h1>
      <p>
        这里演示了 @ldesign/router
        的动态路由功能，包括路径参数、查询参数和参数验证。
      </p>
    </div>

    <div class="card">
      <h2>当前路由参数</h2>
      <div class="params-display">
        <div class="param-section">
          <h3>路径参数 (Path Params)</h3>
          <div class="param-grid">
            <div class="param-item"><strong>ID:</strong> {{ routeId }}</div>
            <div class="param-item"><strong>类型:</strong> {{ paramType }}</div>
            <div class="param-item">
              <strong>是否为数字:</strong> {{ isNumericId ? '是' : '否' }}
            </div>
          </div>
        </div>

        <div class="param-section">
          <h3>查询参数 (Query Params)</h3>
          <div class="query-display">
            <pre>{{ JSON.stringify(route.value?.query || {}, null, 2) }}</pre>
          </div>
        </div>

        <div class="param-section">
          <h3>完整路由信息</h3>
          <div class="route-display">
            <pre>{{ routeInfo }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>动态导航测试</h2>
      <div class="navigation-tests">
        <div class="test-group">
          <h3>数字 ID 导航</h3>
          <div class="nav-buttons">
            <button
              v-for="numId in numericIds"
              :key="numId"
              class="btn btn-primary"
              :class="{ active: routeId === numId.toString() }"
              @click="navigateToId(numId)"
            >
              ID: {{ numId }}
            </button>
          </div>
        </div>

        <div class="test-group">
          <h3>字符串 ID 导航</h3>
          <div class="nav-buttons">
            <button
              v-for="strId in stringIds"
              :key="strId"
              class="btn btn-secondary"
              :class="{ active: routeId === strId }"
              @click="navigateToId(strId)"
            >
              ID: {{ strId }}
            </button>
          </div>
        </div>

        <div class="test-group">
          <h3>自定义导航</h3>
          <div class="custom-nav">
            <div class="form-group">
              <label>自定义 ID:</label>
              <input v-model="customId" class="input" placeholder="输入 ID" />
            </div>
            <div class="form-group">
              <label>查询参数:</label>
              <input
                v-model="customQuery"
                class="input"
                placeholder="key1=value1&key2=value2"
              />
            </div>
            <button class="btn btn-info" @click="navigateCustom">导航</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>参数监听演示</h2>
      <div class="param-watcher">
        <h3>参数变化历史</h3>
        <div class="history-list">
          <div
            v-for="(change, index) in paramHistory"
            :key="index"
            class="history-item"
          >
            <span class="history-time">{{ change.time }}</span>
            <span class="history-change">
              {{ change.from }} → {{ change.to }}
            </span>
            <span class="history-type">{{ change.type }}</span>
          </div>
        </div>
        <button class="btn btn-warning btn-sm" @click="clearHistory">
          清空历史
        </button>
      </div>
    </div>

    <div class="card">
      <h2>参数验证演示</h2>
      <div class="validation-demo">
        <div class="validation-results">
          <div class="validation-item">
            <span class="validation-label">ID 格式验证:</span>
            <span class="validation-status" :class="idValidation.class">
              {{ idValidation.message }}
            </span>
          </div>
          <div class="validation-item">
            <span class="validation-label">参数完整性:</span>
            <span
              class="validation-status"
              :class="completenessValidation.class"
            >
              {{ completenessValidation.message }}
            </span>
          </div>
          <div class="validation-item">
            <span class="validation-label">查询参数验证:</span>
            <span class="validation-status" :class="queryValidation.class">
              {{ queryValidation.message }}
            </span>
          </div>
        </div>

        <div class="validation-rules">
          <h4>验证规则</h4>
          <ul>
            <li>ID 必须存在且不为空</li>
            <li>数字 ID 应该在 1-9999 范围内</li>
            <li>字符串 ID 应该是有效的标识符格式</li>
            <li>查询参数应该是有效的键值对</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>组合式 API 演示</h2>
      <div class="composables-demo">
        <div class="demo-section">
          <h3>useParams</h3>
          <pre class="code-block">{{ paramsInfo }}</pre>
        </div>

        <div class="demo-section">
          <h3>useQuery</h3>
          <pre class="code-block">{{ queryInfo }}</pre>
        </div>

        <div class="demo-section">
          <h3>useHash</h3>
          <pre class="code-block">{{ hashInfo }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.dynamic-routing {
  max-width: 1200px;
  margin: 0 auto;
}

.params-display {
  display: grid;
  gap: @spacing-lg;
}

.param-section {
  h3 {
    color: @gray-700;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: @spacing-md;
}

.param-item {
  background: @gray-50;
  padding: @spacing-sm;
  border-radius: @border-radius-sm;
  border-left: 4px solid @primary-color;

  strong {
    color: @gray-700;
    margin-right: @spacing-sm;
  }
}

.query-display,
.route-display {
  background: @gray-900;
  color: @gray-100;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  overflow-x: auto;

  pre {
    margin: 0;
    font-size: @font-size-sm;
    line-height: 1.5;
  }
}

.navigation-tests {
  display: grid;
  gap: @spacing-lg;
}

.test-group {
  h3 {
    color: @gray-700;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.nav-buttons {
  display: flex;
  gap: @spacing-sm;
  flex-wrap: wrap;

  .btn {
    &.active {
      box-shadow: 0 0 0 2px @gray-800;
    }
  }
}

.custom-nav {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: @spacing-md;
  align-items: end;
}

.param-watcher {
  h3 {
    color: @gray-700;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: @spacing-md;
}

.history-item {
  display: flex;
  align-items: center;
  gap: @spacing-md;
  padding: @spacing-sm;
  margin-bottom: @spacing-xs;
  background: @gray-50;
  border-radius: @border-radius-sm;
  font-size: @font-size-sm;

  .history-time {
    color: @gray-500;
    min-width: 80px;
    font-family: monospace;
  }

  .history-change {
    flex: 1;
    color: @gray-700;
    font-family: monospace;
  }

  .history-type {
    color: @info-color;
    font-weight: 500;
    min-width: 80px;
    text-align: right;
  }
}

.validation-demo {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: @spacing-lg;
}

.validation-results {
  display: grid;
  gap: @spacing-md;
}

.validation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: @spacing-sm;
  background: @gray-50;
  border-radius: @border-radius-sm;

  .validation-label {
    font-weight: 500;
    color: @gray-700;
  }

  .validation-status {
    font-weight: 500;
    padding: @spacing-xs @spacing-sm;
    border-radius: @border-radius-sm;
    font-size: @font-size-sm;

    &.success {
      background: fade(@success-color, 20%);
      color: @success-color;
    }

    &.warning {
      background: fade(@warning-color, 20%);
      color: @warning-color;
    }

    &.error {
      background: fade(@error-color, 20%);
      color: @error-color;
    }

    &.info {
      background: fade(@info-color, 20%);
      color: @info-color;
    }
  }
}

.validation-rules {
  h4 {
    color: @gray-700;
    margin-bottom: @spacing-md;
    font-size: @font-size-base;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: @spacing-xs 0;
      color: @gray-600;
      font-size: @font-size-sm;
      border-bottom: 1px solid @gray-200;

      &:last-child {
        border-bottom: none;
      }

      &:before {
        content: '•';
        color: @primary-color;
        margin-right: @spacing-sm;
      }
    }
  }
}

.composables-demo {
  display: grid;
  gap: @spacing-lg;
}

.demo-section {
  h3 {
    color: @gray-700;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.code-block {
  background: @gray-900;
  color: @gray-100;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  overflow-x: auto;
  font-size: @font-size-sm;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .param-grid {
    grid-template-columns: 1fr;
  }

  .custom-nav {
    grid-template-columns: 1fr;
  }

  .validation-demo {
    grid-template-columns: 1fr;
  }

  .nav-buttons {
    justify-content: center;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: @spacing-xs;

    .history-type {
      text-align: left;
      min-width: auto;
    }
  }
}
</style>
