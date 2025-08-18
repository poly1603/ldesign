<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const currentPhase = ref('stopped')
const uptime = ref(0)
const hookPhase = ref('beforeStart')
const hookName = ref('cleanup')
const hookPriority = ref(50)
const dependencyName = ref('database')
const dependencyType = ref('service')

const executedHooks = reactive<any[]>([])
const registeredHooks = reactive<any[]>([])
const lifecycleLogs = reactive<any[]>([])
const dependencies = reactive<any[]>([])

let startTime = 0
let uptimeInterval: number | null = null
let hookIdCounter = 0

// 生命周期阶段
const lifecyclePhases = reactive([
  {
    name: 'initializing',
    icon: '🔧',
    description: '初始化阶段',
    completed: false,
    pending: false,
  },
  {
    name: 'starting',
    icon: '🚀',
    description: '启动阶段',
    completed: false,
    pending: false,
  },
  {
    name: 'running',
    icon: '⚡',
    description: '运行阶段',
    completed: false,
    pending: false,
  },
  {
    name: 'paused',
    icon: '⏸️',
    description: '暂停阶段',
    completed: false,
    pending: false,
  },
  {
    name: 'stopping',
    icon: '🛑',
    description: '停止阶段',
    completed: false,
    pending: false,
  },
  {
    name: 'stopped',
    icon: '⭕',
    description: '已停止',
    completed: true,
    pending: false,
  },
])

// 方法
async function startLifecycle() {
  try {
    addLifecycleLog(
      'info',
      'initializing',
      'LIFECYCLE_START',
      '开始启动生命周期'
    )

    // 初始化阶段
    await executePhase('initializing', async () => {
      await executeHooks('beforeStart')
      await checkDependencies()
    })

    // 启动阶段
    await executePhase('starting', async () => {
      startTime = Date.now()
      startUptimeCounter()
    })

    // 运行阶段
    await executePhase('running', async () => {
      await executeHooks('afterStart')
    })

    emit('log', 'success', '生命周期启动完成')
  } catch (error: any) {
    addLifecycleLog(
      'error',
      currentPhase.value,
      'LIFECYCLE_ERROR',
      `启动失败: ${error.message}`
    )
    emit('log', 'error', '生命周期启动失败', error)
  }
}

async function pauseLifecycle() {
  try {
    addLifecycleLog('info', 'running', 'LIFECYCLE_PAUSE', '暂停生命周期')

    await executePhase('paused', async () => {
      stopUptimeCounter()
      await executeHooks('onPause')
    })

    emit('log', 'warning', '生命周期已暂停')
  } catch (error: any) {
    emit('log', 'error', '暂停生命周期失败', error)
  }
}

async function resumeLifecycle() {
  try {
    addLifecycleLog('info', 'paused', 'LIFECYCLE_RESUME', '恢复生命周期')

    await executePhase('running', async () => {
      startUptimeCounter()
      await executeHooks('onResume')
    })

    emit('log', 'success', '生命周期已恢复')
  } catch (error: any) {
    emit('log', 'error', '恢复生命周期失败', error)
  }
}

async function stopLifecycle() {
  try {
    addLifecycleLog(
      'info',
      currentPhase.value,
      'LIFECYCLE_STOP',
      '停止生命周期'
    )

    // 停止阶段
    await executePhase('stopping', async () => {
      await executeHooks('beforeStop')
      stopUptimeCounter()
    })

    // 已停止
    await executePhase('stopped', async () => {
      await executeHooks('afterStop')
      uptime.value = 0
    })

    emit('log', 'warning', '生命周期已停止')
  } catch (error: any) {
    addLifecycleLog(
      'error',
      currentPhase.value,
      'LIFECYCLE_ERROR',
      `停止失败: ${error.message}`
    )
    emit('log', 'error', '停止生命周期失败', error)
  }
}

async function restartLifecycle() {
  await stopLifecycle()
  setTimeout(() => {
    startLifecycle()
  }, 1000)
}

function resetLifecycle() {
  stopLifecycle()
  executedHooks.splice(0, executedHooks.length)
  lifecycleLogs.splice(0, lifecycleLogs.length)
  uptime.value = 0

  // 重置阶段状态
  lifecyclePhases.forEach(phase => {
    phase.completed = phase.name === 'stopped'
    phase.pending = false
  })

  emit('log', 'info', '生命周期已重置')
}

async function executePhase(phaseName: string, callback: () => Promise<void>) {
  const phase = lifecyclePhases.find(p => p.name === phaseName)
  if (!phase) return

  const startTime = Date.now()

  try {
    // 设置当前阶段
    currentPhase.value = phaseName
    phase.pending = true

    addLifecycleLog(
      'info',
      phaseName,
      'PHASE_START',
      `进入${phase.description}`
    )

    // 执行阶段逻辑
    await callback()

    // 标记完成
    phase.completed = true
    phase.pending = false

    const duration = Date.now() - startTime
    addLifecycleLog(
      'success',
      phaseName,
      'PHASE_COMPLETE',
      `${phase.description}完成`,
      duration
    )
  } catch (error: any) {
    phase.pending = false
    addLifecycleLog(
      'error',
      phaseName,
      'PHASE_ERROR',
      `${phase.description}失败: ${error.message}`
    )
    throw error
  }
}

async function executeHooks(phase: string) {
  const hooks = registeredHooks
    .filter(hook => hook.phase === phase)
    .sort((a, b) => b.priority - a.priority)

  for (const hook of hooks) {
    try {
      const startTime = Date.now()

      addLifecycleLog('info', phase, 'HOOK_EXECUTE', `执行钩子: ${hook.name}`)

      // 模拟钩子执行
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))

      const duration = Date.now() - startTime
      executedHooks.push({
        ...hook,
        executedAt: Date.now(),
        duration,
      })

      addLifecycleLog(
        'success',
        phase,
        'HOOK_COMPLETE',
        `钩子执行完成: ${hook.name}`,
        duration
      )
    } catch (error: any) {
      addLifecycleLog(
        'error',
        phase,
        'HOOK_ERROR',
        `钩子执行失败: ${hook.name} - ${error.message}`
      )
      await executeHooks('onError')
    }
  }
}

function addHook() {
  const hook = {
    id: ++hookIdCounter,
    name: hookName.value,
    phase: hookPhase.value,
    priority: hookPriority.value,
    createdAt: Date.now(),
  }

  registeredHooks.push(hook)
  emit('log', 'success', `添加钩子: ${hook.name} (${hook.phase})`)
}

function removeHook() {
  const index = registeredHooks.findIndex(hook => hook.name === hookName.value)
  if (index !== -1) {
    registeredHooks.splice(index, 1)
    emit('log', 'warning', `移除钩子: ${hookName.value}`)
  } else {
    emit('log', 'warning', '钩子不存在')
  }
}

function removeSpecificHook(id: number) {
  const index = registeredHooks.findIndex(hook => hook.id === id)
  if (index !== -1) {
    const hook = registeredHooks[index]
    registeredHooks.splice(index, 1)
    emit('log', 'warning', `删除钩子: ${hook.name}`)
  }
}

function listHooks() {
  emit('log', 'info', '已注册钩子列表', registeredHooks)
}

function addDependency() {
  const dependency = {
    name: dependencyName.value,
    type: dependencyType.value,
    ready: false,
    failed: false,
    createdAt: Date.now(),
  }

  dependencies.push(dependency)
  emit('log', 'success', `添加依赖: ${dependency.name} (${dependency.type})`)
}

function removeDependency(name: string) {
  const index = dependencies.findIndex(dep => dep.name === name)
  if (index !== -1) {
    dependencies.splice(index, 1)
    emit('log', 'warning', `删除依赖: ${name}`)
  }
}

function toggleDependency(name: string) {
  const dependency = dependencies.find(dep => dep.name === name)
  if (dependency) {
    dependency.ready = !dependency.ready
    dependency.failed = false
    emit('log', 'info', `${dependency.ready ? '连接' : '断开'}依赖: ${name}`)
  }
}

async function checkDependencies() {
  addLifecycleLog(
    'info',
    currentPhase.value,
    'DEPENDENCY_CHECK',
    '检查依赖状态'
  )

  for (const dependency of dependencies) {
    // 模拟依赖检查
    const success = Math.random() > 0.2 // 80% 成功率

    if (success) {
      dependency.ready = true
      dependency.failed = false
      addLifecycleLog(
        'success',
        currentPhase.value,
        'DEPENDENCY_READY',
        `依赖就绪: ${dependency.name}`
      )
    } else {
      dependency.ready = false
      dependency.failed = true
      addLifecycleLog(
        'error',
        currentPhase.value,
        'DEPENDENCY_FAILED',
        `依赖失败: ${dependency.name}`
      )
    }
  }

  const failedDeps = dependencies.filter(dep => dep.failed)
  if (failedDeps.length > 0) {
    throw new Error(
      `依赖检查失败: ${failedDeps.map(dep => dep.name).join(', ')}`
    )
  }
}

function startUptimeCounter() {
  if (uptimeInterval) return

  uptimeInterval = window.setInterval(() => {
    uptime.value = Date.now() - startTime
  }, 1000)
}

function stopUptimeCounter() {
  if (uptimeInterval) {
    clearInterval(uptimeInterval)
    uptimeInterval = null
  }
}

function addLifecycleLog(
  type: string,
  phase: string,
  event: string,
  message: string,
  duration?: number
) {
  lifecycleLogs.push({
    timestamp: Date.now(),
    type,
    phase,
    event,
    message,
    duration,
  })

  // 限制日志数量
  if (lifecycleLogs.length > 100) {
    lifecycleLogs.splice(0, lifecycleLogs.length - 100)
  }
}

function clearLifecycleLogs() {
  lifecycleLogs.splice(0, lifecycleLogs.length)
  emit('log', 'info', '清空生命周期日志')
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  // 添加一些默认钩子
  const defaultHooks = [
    { name: 'initConfig', phase: 'beforeStart', priority: 90 },
    { name: 'connectDB', phase: 'beforeStart', priority: 80 },
    { name: 'startServer', phase: 'afterStart', priority: 70 },
    { name: 'cleanup', phase: 'beforeStop', priority: 60 },
  ]

  defaultHooks.forEach(hook => {
    registeredHooks.push({
      id: ++hookIdCounter,
      ...hook,
      createdAt: Date.now(),
    })
  })

  // 添加一些默认依赖
  const defaultDependencies = [
    { name: 'database', type: 'service', ready: true, failed: false },
    { name: 'redis', type: 'service', ready: false, failed: false },
    { name: 'config', type: 'config', ready: true, failed: false },
  ]

  defaultDependencies.forEach(dep => {
    dependencies.push({
      ...dep,
      createdAt: Date.now(),
    })
  })

  emit('log', 'info', '生命周期管理器演示已加载')
})

onUnmounted(() => {
  stopUptimeCounter()
})
</script>

<template>
  <div class="lifecycle-demo">
    <div class="demo-header">
      <h2>🔄 生命周期管理器演示</h2>
      <p>
        LifecycleManager
        提供了完整的生命周期管理，支持钩子函数、状态跟踪、依赖管理等功能。
      </p>
    </div>

    <div class="demo-grid">
      <!-- 生命周期状态 -->
      <div class="card">
        <div class="card-header">
          <h3>生命周期状态</h3>
        </div>
        <div class="card-body">
          <div class="lifecycle-status">
            <div class="status-item">
              <label>当前阶段:</label>
              <span class="status-value" :class="currentPhase">{{
                currentPhase
              }}</span>
            </div>
            <div class="status-item">
              <label>运行时间:</label>
              <span class="status-value">{{ formatDuration(uptime) }}</span>
            </div>
            <div class="status-item">
              <label>已执行钩子:</label>
              <span class="status-value">{{ executedHooks.length }}</span>
            </div>
          </div>

          <div class="lifecycle-phases">
            <div
              v-for="phase in lifecyclePhases"
              :key="phase.name"
              class="phase-item"
              :class="{
                active: currentPhase === phase.name,
                completed: phase.completed,
                pending: phase.pending,
              }"
            >
              <div class="phase-icon">
                {{ phase.icon }}
              </div>
              <div class="phase-info">
                <h4>{{ phase.name }}</h4>
                <p>{{ phase.description }}</p>
              </div>
              <div class="phase-status">
                <span v-if="phase.completed">✅</span>
                <span v-else-if="phase.pending">⏳</span>
                <span v-else>⭕</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 生命周期控制 -->
      <div class="card">
        <div class="card-header">
          <h3>生命周期控制</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <div class="button-group">
              <button
                class="btn btn-success"
                :disabled="currentPhase !== 'stopped'"
                @click="startLifecycle"
              >
                启动
              </button>
              <button
                class="btn btn-warning"
                :disabled="currentPhase !== 'running'"
                @click="pauseLifecycle"
              >
                暂停
              </button>
              <button
                class="btn btn-info"
                :disabled="currentPhase !== 'paused'"
                @click="resumeLifecycle"
              >
                恢复
              </button>
              <button
                class="btn btn-error"
                :disabled="currentPhase === 'stopped'"
                @click="stopLifecycle"
              >
                停止
              </button>
            </div>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-secondary" @click="restartLifecycle">
                重启
              </button>
              <button class="btn btn-secondary" @click="resetLifecycle">
                重置
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 钩子管理 -->
      <div class="card">
        <div class="card-header">
          <h3>钩子管理</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>钩子阶段</label>
            <select v-model="hookPhase">
              <option value="beforeStart">启动前</option>
              <option value="afterStart">启动后</option>
              <option value="beforeStop">停止前</option>
              <option value="afterStop">停止后</option>
              <option value="onError">错误时</option>
            </select>
          </div>

          <div class="form-group">
            <label>钩子名称</label>
            <input v-model="hookName" type="text" placeholder="例如: cleanup" />
          </div>

          <div class="form-group">
            <label>钩子优先级</label>
            <input
              v-model.number="hookPriority"
              type="number"
              min="0"
              max="100"
            />
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="addHook">添加钩子</button>
              <button class="btn btn-warning" @click="removeHook">
                移除钩子
              </button>
              <button class="btn btn-secondary" @click="listHooks">
                列出钩子
              </button>
            </div>
          </div>

          <div class="hooks-list">
            <h4>已注册钩子</h4>
            <div
              v-for="hook in registeredHooks"
              :key="hook.id"
              class="hook-item"
            >
              <div class="hook-info">
                <span class="hook-name">{{ hook.name }}</span>
                <span class="hook-phase">{{ hook.phase }}</span>
                <span class="hook-priority">优先级: {{ hook.priority }}</span>
              </div>
              <button
                class="btn btn-error btn-sm"
                @click="removeSpecificHook(hook.id)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 生命周期日志 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>生命周期日志</h3>
          <button class="btn btn-secondary btn-sm" @click="clearLifecycleLogs">
            清空
          </button>
        </div>
        <div class="card-body">
          <div class="lifecycle-logs">
            <div
              v-for="(log, index) in lifecycleLogs"
              :key="index"
              class="lifecycle-log-item"
              :class="log.type"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-phase">{{ log.phase }}</span>
              <span class="log-event">{{ log.event }}</span>
              <span class="log-message">{{ log.message }}</span>
              <span v-if="log.duration" class="log-duration"
                >{{ log.duration }}ms</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 依赖管理 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>依赖管理</h3>
        </div>
        <div class="card-body">
          <div class="dependencies-section">
            <div class="dependency-input">
              <div class="form-group">
                <label>依赖名称</label>
                <input
                  v-model="dependencyName"
                  type="text"
                  placeholder="例如: database"
                />
              </div>

              <div class="form-group">
                <label>依赖类型</label>
                <select v-model="dependencyType">
                  <option value="service">服务</option>
                  <option value="resource">资源</option>
                  <option value="config">配置</option>
                  <option value="external">外部依赖</option>
                </select>
              </div>

              <div class="form-group">
                <div class="button-group">
                  <button class="btn btn-primary" @click="addDependency">
                    添加依赖
                  </button>
                  <button class="btn btn-secondary" @click="checkDependencies">
                    检查依赖
                  </button>
                </div>
              </div>
            </div>

            <div class="dependencies-list">
              <h4>依赖列表</h4>
              <div
                v-for="dependency in dependencies"
                :key="dependency.name"
                class="dependency-item"
                :class="{ ready: dependency.ready, failed: dependency.failed }"
              >
                <div class="dependency-info">
                  <span class="dependency-name">{{ dependency.name }}</span>
                  <span class="dependency-type">{{ dependency.type }}</span>
                  <span class="dependency-status">
                    {{
                      dependency.ready
                        ? '就绪'
                        : dependency.failed
                        ? '失败'
                        : '等待中'
                    }}
                  </span>
                </div>
                <div class="dependency-actions">
                  <button
                    class="btn btn-secondary btn-sm"
                    @click="toggleDependency(dependency.name)"
                  >
                    {{ dependency.ready ? '断开' : '连接' }}
                  </button>
                  <button
                    class="btn btn-error btn-sm"
                    @click="removeDependency(dependency.name)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.lifecycle-demo {
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

  .lifecycle-status {
    margin-bottom: var(--spacing-lg);

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);

      label {
        font-weight: 500;
      }

      .status-value {
        font-family: monospace;
        font-weight: bold;

        &.running {
          color: var(--success-color);
        }

        &.paused {
          color: var(--warning-color);
        }

        &.stopped {
          color: var(--error-color);
        }

        &.initializing,
        &.starting,
        &.stopping {
          color: var(--info-color);
        }
      }
    }
  }

  .lifecycle-phases {
    .phase-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      border-left: 4px solid var(--border-color);

      &.active {
        border-left-color: var(--primary-color);
        background: rgba(102, 126, 234, 0.1);
      }

      &.completed {
        border-left-color: var(--success-color);
        opacity: 0.7;
      }

      &.pending {
        border-left-color: var(--warning-color);

        .phase-icon {
          animation: pulse 2s infinite;
        }
      }

      .phase-icon {
        font-size: 24px;
        min-width: 40px;
        text-align: center;
      }

      .phase-info {
        flex: 1;

        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 16px;
          text-transform: capitalize;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }
      }

      .phase-status {
        font-size: 20px;
      }
    }
  }

  .hooks-list {
    margin-top: var(--spacing-md);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    .hook-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);

      .hook-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .hook-name {
          font-weight: 500;
          color: var(--primary-color);
          font-family: monospace;
        }

        .hook-phase {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--bg-primary);
          color: var(--text-secondary);
        }

        .hook-priority {
          font-size: 12px;
          color: var(--text-muted);
        }
      }
    }
  }

  .lifecycle-logs {
    max-height: 300px;
    overflow-y: auto;
    background: #1e1e1e;
    border-radius: var(--border-radius);
    padding: var(--spacing-sm);
    font-family: 'Courier New', monospace;

    .lifecycle-log-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 12px;

      &.success {
        color: #28a745;
      }

      &.error {
        color: #dc3545;
      }

      &.info {
        color: #17a2b8;
      }

      .log-time {
        color: #888;
        min-width: 80px;
      }

      .log-phase {
        color: #ffc107;
        min-width: 100px;
        text-transform: uppercase;
      }

      .log-event {
        color: #6f42c1;
        min-width: 120px;
      }

      .log-message {
        flex: 1;
      }

      .log-duration {
        color: #fd7e14;
        min-width: 60px;
        text-align: right;
      }
    }
  }

  .dependencies-section {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: var(--spacing-lg);

    .dependencies-list {
      h4 {
        margin-bottom: var(--spacing-sm);
        font-size: 16px;
      }

      .dependency-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
        background: var(--bg-secondary);
        border-radius: var(--border-radius);
        border-left: 4px solid var(--border-color);

        &.ready {
          border-left-color: var(--success-color);
        }

        &.failed {
          border-left-color: var(--error-color);
        }

        .dependency-info {
          flex: 1;

          .dependency-name {
            font-weight: 500;
            color: var(--primary-color);
            font-family: monospace;
            margin-right: var(--spacing-md);
          }

          .dependency-type {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 4px;
            background: var(--bg-primary);
            color: var(--text-secondary);
            margin-right: var(--spacing-md);
          }

          .dependency-status {
            font-size: 12px;
            color: var(--text-muted);
          }
        }

        .dependency-actions {
          display: flex;
          gap: var(--spacing-xs);
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .lifecycle-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .dependencies-section {
    grid-template-columns: 1fr !important;
  }

  .hook-item,
  .dependency-item {
    flex-direction: column;
    align-items: flex-start !important;

    .hook-info,
    .dependency-info {
      margin-bottom: var(--spacing-sm);
    }

    .dependency-actions {
      align-self: stretch;
    }
  }
}
</style>
