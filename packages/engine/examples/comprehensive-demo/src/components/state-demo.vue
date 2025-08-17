<script setup lang="ts">
import { inject, onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine?: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 获取引擎实例
const engine = inject('engine') as any || props.engine

// 响应式数据
const statePath = ref('user.profile.name')
const stateValue = ref('张三')
const stateResult = ref('')
const complexState = ref(`{
  "user": {
    "profile": {
      "name": "张三",
      "age": 25,
      "email": "zhangsan@example.com"
    },
    "preferences": {
      "theme": "dark",
      "language": "zh-CN"
    }
  },
  "app": {
    "isLoading": false,
    "currentPage": "dashboard"
  }
}`)
const watchPath = ref('user.profile')
const isWatching = ref(false)
const currentState = reactive({})
const historyInfo = ref<any>(null)
const changeLogs = reactive<any[]>([])

let unwatchState: (() => void) | null = null

// 预设状态
const presets = [
  {
    name: '用户登录状态',
    state: {
      user: {
        isLoggedIn: true,
        profile: { name: '李四', role: 'admin' },
        permissions: ['read', 'write', 'delete'],
      },
    },
  },
  {
    name: '应用加载状态',
    state: {
      app: {
        isLoading: true,
        loadingText: '正在加载数据...',
        progress: 45,
      },
    },
  },
  {
    name: '购物车状态',
    state: {
      cart: {
        items: [
          { id: 1, name: '商品A', price: 99.99, quantity: 2 },
          { id: 2, name: '商品B', price: 149.99, quantity: 1 },
        ],
        total: 349.97,
      },
    },
  },
]

// 方法
function setState() {
  try {
    if (!engine) {
      stateResult.value = '引擎未初始化'
      emit('log', 'error', '引擎未初始化')
      return
    }

    let value = stateValue.value
    // 尝试解析为 JSON
    try {
      value = JSON.parse(stateValue.value)
    }
    catch {
      // 保持原始字符串值
    }

    engine.state.set(statePath.value, value)
    stateResult.value = `设置成功: ${statePath.value} = ${JSON.stringify(value)}`
    emit('log', 'success', `设置状态: ${statePath.value}`, value)
    refreshState()
  }
  catch (error: any) {
    stateResult.value = `设置失败: ${error.message}`
    emit('log', 'error', '设置状态失败', error)
  }
}

function getState() {
  try {
    if (!engine) {
      stateResult.value = '引擎未初始化'
      emit('log', 'error', '引擎未初始化')
      return
    }

    const value = engine.state.get(statePath.value)
    stateResult.value = `获取结果: ${statePath.value} = ${JSON.stringify(value)}`
    emit('log', 'info', `获取状态: ${statePath.value}`, value)
  }
  catch (error: any) {
    stateResult.value = `获取失败: ${error.message}`
    emit('log', 'error', '获取状态失败', error)
  }
}

function deleteState() {
  try {
    if (!engine) {
      stateResult.value = '引擎未初始化'
      emit('log', 'error', '引擎未初始化')
      return
    }

    engine.state.delete(statePath.value)
    stateResult.value = `删除成功: ${statePath.value}`
    emit('log', 'warning', `删除状态: ${statePath.value}`)
    refreshState()
  }
  catch (error: any) {
    stateResult.value = `删除失败: ${error.message}`
    emit('log', 'error', '删除状态失败', error)
  }
}

function setComplexState() {
  try {
    const state = JSON.parse(complexState.value)
    Object.keys(state).forEach((key) => {
      props.engine.state.set(key, state[key])
    })
    emit('log', 'success', '设置复杂状态成功', state)
    refreshState()
  }
  catch (error: any) {
    emit('log', 'error', '设置复杂状态失败', error)
  }
}

function mergeState() {
  try {
    const state = JSON.parse(complexState.value)
    props.engine.state.merge(state)
    emit('log', 'success', '合并状态成功', state)
    refreshState()
  }
  catch (error: any) {
    emit('log', 'error', '合并状态失败', error)
  }
}

function startWatching() {
  try {
    unwatchState = props.engine.state.watch(watchPath.value, (newValue: any, oldValue: any, path: string) => {
      const change = {
        timestamp: Date.now(),
        path,
        type: 'update',
        newValue,
        oldValue,
      }
      changeLogs.push(change)
      emit('log', 'info', `状态变化: ${path}`, { newValue, oldValue })
    })
    isWatching.value = true
    emit('log', 'info', `开始监听状态: ${watchPath.value}`)
  }
  catch (error: any) {
    emit('log', 'error', '开始监听失败', error)
  }
}

function stopWatching() {
  if (unwatchState) {
    unwatchState()
    unwatchState = null
    isWatching.value = false
    emit('log', 'info', `停止监听状态: ${watchPath.value}`)
  }
}

function getHistory() {
  try {
    const history = props.engine.state.getHistory()
    historyInfo.value = {
      count: history.length,
      current: props.engine.state.getCurrentHistoryIndex(),
      canUndo: props.engine.state.canUndo(),
      canRedo: props.engine.state.canRedo(),
    }
    emit('log', 'info', '获取状态历史', history)
  }
  catch (error: any) {
    emit('log', 'error', '获取状态历史失败', error)
  }
}

function undo() {
  try {
    props.engine.state.undo()
    emit('log', 'info', '撤销状态变化')
    refreshState()
    getHistory()
  }
  catch (error: any) {
    emit('log', 'error', '撤销失败', error)
  }
}

function redo() {
  try {
    props.engine.state.redo()
    emit('log', 'info', '重做状态变化')
    refreshState()
    getHistory()
  }
  catch (error: any) {
    emit('log', 'error', '重做失败', error)
  }
}

function clearHistory() {
  try {
    props.engine.state.clearHistory()
    emit('log', 'warning', '清空状态历史')
    getHistory()
  }
  catch (error: any) {
    emit('log', 'error', '清空状态历史失败', error)
  }
}

function refreshState() {
  try {
    const allState = props.engine.state.getAll()
    Object.assign(currentState, allState)
  }
  catch (error: any) {
    emit('log', 'error', '刷新状态失败', error)
  }
}

function clearChangeLogs() {
  changeLogs.splice(0, changeLogs.length)
  emit('log', 'info', '清空状态变化日志')
}

function applyPreset(preset: any) {
  try {
    Object.keys(preset.state).forEach((key) => {
      props.engine.state.set(key, preset.state[key])
    })
    emit('log', 'success', `应用预设状态: ${preset.name}`, preset.state)
    refreshState()
  }
  catch (error: any) {
    emit('log', 'error', '应用预设状态失败', error)
  }
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  refreshState()
  getHistory()
  emit('log', 'info', '状态管理器演示已加载')
})

onUnmounted(() => {
  if (unwatchState) {
    unwatchState()
  }
})
</script>

<template>
  <div class="state-demo">
    <div class="demo-header">
      <h2>📊 状态管理器演示</h2>
      <p>StateManager 提供了响应式状态管理，支持嵌套状态、状态监听、状态历史等功能。</p>
    </div>

    <div class="demo-grid">
      <!-- 基础状态操作 -->
      <div class="card">
        <div class="card-header">
          <h3>基础状态操作</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>状态路径</label>
            <input
              v-model="statePath"
              type="text"
              placeholder="例如: user.profile.name"
            >
          </div>

          <div class="form-group">
            <label>状态值</label>
            <input
              v-model="stateValue"
              type="text"
              placeholder="例如: 张三"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="setState">
                设置状态
              </button>
              <button class="btn btn-secondary" @click="getState">
                获取状态
              </button>
              <button class="btn btn-warning" @click="deleteState">
                删除状态
              </button>
            </div>
          </div>

          <div v-if="stateResult" class="alert alert-info">
            <strong>结果:</strong> {{ stateResult }}
          </div>
        </div>
      </div>

      <!-- 复杂状态操作 -->
      <div class="card">
        <div class="card-header">
          <h3>复杂状态操作</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>JSON 状态</label>
            <textarea
              v-model="complexState"
              placeholder="输入 JSON 格式的状态"
              rows="6"
            />
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="setComplexState">
                设置复杂状态
              </button>
              <button class="btn btn-secondary" @click="mergeState">
                合并状态
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 状态监听 -->
      <div class="card">
        <div class="card-header">
          <h3>状态变化监听</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>监听路径</label>
            <input
              v-model="watchPath"
              type="text"
              placeholder="例如: user.profile"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button
                class="btn btn-primary"
                :disabled="isWatching"
                @click="startWatching"
              >
                开始监听
              </button>
              <button
                class="btn btn-secondary"
                :disabled="!isWatching"
                @click="stopWatching"
              >
                停止监听
              </button>
            </div>
          </div>

          <div class="watch-status">
            <span class="status-indicator" :class="{ active: isWatching }" />
            <span>{{ isWatching ? '正在监听' : '未监听' }}</span>
          </div>
        </div>
      </div>

      <!-- 状态历史 -->
      <div class="card">
        <div class="card-header">
          <h3>状态历史</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-secondary" @click="getHistory">
                获取历史
              </button>
              <button class="btn btn-warning" @click="undo">
                撤销
              </button>
              <button class="btn btn-info" @click="redo">
                重做
              </button>
              <button class="btn btn-error" @click="clearHistory">
                清空历史
              </button>
            </div>
          </div>

          <div v-if="historyInfo" class="history-info">
            <p>历史记录数: {{ historyInfo.count }}</p>
            <p>当前位置: {{ historyInfo.current }}</p>
            <p>可撤销: {{ historyInfo.canUndo ? '是' : '否' }}</p>
            <p>可重做: {{ historyInfo.canRedo ? '是' : '否' }}</p>
          </div>
        </div>
      </div>

      <!-- 当前状态展示 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>当前状态</h3>
          <button class="btn btn-secondary btn-sm" @click="refreshState">
            刷新
          </button>
        </div>
        <div class="card-body">
          <div class="state-tree">
            <pre>{{ JSON.stringify(currentState, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 状态变化日志 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>状态变化日志</h3>
          <button class="btn btn-secondary btn-sm" @click="clearChangeLogs">
            清空
          </button>
        </div>
        <div class="card-body">
          <div class="change-logs">
            <div
              v-for="(change, index) in changeLogs"
              :key="index"
              class="change-log-item"
            >
              <span class="change-time">{{ formatTime(change.timestamp) }}</span>
              <span class="change-path">{{ change.path }}</span>
              <span class="change-type">{{ change.type }}</span>
              <span class="change-value">{{ JSON.stringify(change.newValue) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 预设状态 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>预设状态模板</h3>
        </div>
        <div class="card-body">
          <div class="preset-buttons">
            <button
              v-for="preset in presets"
              :key="preset.name"
              class="btn btn-secondary"
              @click="applyPreset(preset)"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.state-demo {
  .demo-header {
    margin-bottom: var(--spacing-xl);

    h2 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-lg);

    .full-width {
      grid-column: 1 / -1;
    }
  }

  .button-group {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .watch-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--error-color);

      &.active {
        background: var(--success-color);
      }
    }
  }

  .history-info {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--border-radius);

    p {
      margin: var(--spacing-xs) 0;
      font-size: 14px;
    }
  }

  .state-tree {
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    max-height: 300px;
    overflow: auto;

    pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: var(--text-primary);
    }
  }

  .change-logs {
    max-height: 200px;
    overflow-y: auto;

    .change-log-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid var(--border-color);
      font-family: monospace;
      font-size: 12px;

      .change-time {
        color: var(--text-muted);
        min-width: 80px;
      }

      .change-path {
        color: var(--primary-color);
        min-width: 120px;
      }

      .change-type {
        color: var(--success-color);
        min-width: 60px;
      }

      .change-value {
        flex: 1;
        color: var(--text-primary);
      }
    }
  }

  .preset-buttons {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .state-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
