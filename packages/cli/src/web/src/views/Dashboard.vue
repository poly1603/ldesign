<template>
  <div class="dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1>仪表盘</h1>
        <p class="header-subtitle">系统概览与快速访问</p>
      </div>
      <div class="header-actions">
        <button class="action-btn" title="刷新" @click="refreshData">
          <RefreshCw :size="18" />
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <Loader2 :size="48" class="loading-spinner" />
      <p>正在加载系统信息...</p>
    </div>

    <!-- 主内容 -->
    <div v-else class="dashboard-content">
      <!-- 欢迎卡片 -->
      <div class="welcome-card">
        <div class="welcome-icon">
          <Sparkles :size="32" />
        </div>
        <div class="welcome-text">
          <h2>欢迎使用 LDesign CLI</h2>
          <p>强大的设计系统开发工具，助力您的项目开发</p>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon node">
            <Cpu :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ systemInfo?.node?.version || 'N/A' }}</div>
            <div class="stat-label">Node.js 版本</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon memory">
            <HardDrive :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatBytes(systemInfo?.system?.totalMemory) }}</div>
            <div class="stat-label">系统内存</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon cpu">
            <Zap :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ systemInfo?.capabilities?.cpu?.cores || 'N/A' }} 核</div>
            <div class="stat-label">CPU 核心</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon network">
            <Wifi :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ systemInfo?.network?.interfaces?.length || 0 }}</div>
            <div class="stat-label">网络接口</div>
          </div>
        </div>
      </div>

      <!-- 信息卡片网格 -->
      <div class="info-cards-grid">
        <!-- 网络信息 -->
        <div class="info-card">
          <div class="card-header">
            <Wifi :size="20" />
            <h3>网络信息</h3>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">主机名</span>
              <span class="info-value">{{ systemInfo?.network?.hostname || 'N/A' }}</span>
            </div>
            <div v-for="(iface, index) in systemInfo?.network?.interfaces?.slice(0, 3)" :key="index" class="info-item">
              <span class="info-label">{{ iface.name }} ({{ iface.family }})</span>
              <span class="info-value">{{ iface.address }}</span>
            </div>
          </div>
        </div>

        <!-- 显示器信息 -->
        <div class="info-card">
          <div class="card-header">
            <Monitor :size="20" />
            <h3>显示器信息</h3>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">显示器数量</span>
              <span class="info-value">{{ systemInfo?.display?.count || 0 }}</span>
            </div>
            <div v-for="(display, index) in systemInfo?.display?.displays" :key="index" class="info-item">
              <span class="info-label">{{ display.name }}</span>
              <span class="info-value">{{ display.resolution }} @ {{ display.refreshRate }}</span>
            </div>
            <div v-if="!systemInfo?.display?.displays?.length" class="info-item">
              <span class="info-label">状态</span>
              <span class="info-value">{{ systemInfo?.display?.message || '无法获取' }}</span>
            </div>
          </div>
        </div>

        <!-- Node.js 信息 -->
        <div class="info-card">
          <div class="card-header">
            <Hexagon :size="20" />
            <h3>Node.js 信息</h3>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">版本</span>
              <span class="info-value">{{ systemInfo?.node?.version || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">平台</span>
              <span class="info-value">{{ systemInfo?.node?.platform || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">架构</span>
              <span class="info-value">{{ systemInfo?.node?.arch || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- 设备能力 -->
        <div class="info-card">
          <div class="card-header">
            <Cpu :size="20" />
            <h3>设备能力</h3>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">CPU 型号</span>
              <span class="info-value">{{ systemInfo?.capabilities?.cpu?.model || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">CPU 核心</span>
              <span class="info-value">{{ systemInfo?.capabilities?.cpu?.cores || 'N/A' }} 核</span>
            </div>
            <div class="info-item">
              <span class="info-label">CPU 频率</span>
              <span class="info-value">{{ systemInfo?.capabilities?.cpu?.speed || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">内存使用</span>
              <span class="info-value">{{ formatBytes(systemInfo?.capabilities?.memory?.used) }} / {{
                formatBytes(systemInfo?.capabilities?.memory?.total) }}</span>
            </div>
          </div>
        </div>

        <!-- 系统信息 -->
        <div class="info-card">
          <div class="card-header">
            <Monitor :size="20" />
            <h3>系统信息</h3>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">主机名</span>
              <span class="info-value">{{ systemInfo?.system?.hostname || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">操作系统</span>
              <span class="info-value">{{ systemInfo?.system?.type || 'N/A' }} {{ systemInfo?.system?.release || ''
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">平台架构</span>
              <span class="info-value">{{ systemInfo?.system?.arch || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">系统运行时间</span>
              <span class="info-value">{{ formatUptime(systemInfo?.system?.uptime) }}</span>
            </div>
          </div>
        </div>

        <!-- Git 信息 -->
        <div class="info-card" v-if="systemInfo?.git?.isRepository">
          <div class="card-header">
            <GitBranch :size="20" />
            <h3>Git 信息</h3>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">当前分支</span>
              <span class="info-value">{{ systemInfo?.git?.branch || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最新提交</span>
              <span class="info-value">{{ systemInfo?.git?.lastCommit || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">远程仓库</span>
              <span class="info-value">{{ systemInfo?.git?.remote || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  RefreshCw, Loader2, Sparkles, Cpu, HardDrive, Zap, Wifi,
  Hexagon, Monitor, GitBranch
} from 'lucide-vue-next'
import { useApi } from '../composables/useApi'

/**
 * 仪表盘页面
 * 显示系统信息和项目统计
 */

// API
const api = useApi()

// 响应式数据
const loading = ref(true)
const systemInfo = ref<any>(null)

// 格式化字节数
const formatBytes = (bytes: number | undefined): string => {
  if (!bytes) return 'N/A'
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(2)} GB`
}

// 格式化运行时间
const formatUptime = (seconds: number | undefined): string => {
  if (!seconds) return 'N/A'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 加载系统信息
    const infoResponse = await api.get('/api/info')
    if (infoResponse.success) {
      systemInfo.value = infoResponse.data
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  loadData()
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.dashboard {
  padding: var(--ls-padding-lg);
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-margin-xl);

  .header-left {
    h1 {
      margin: 0 0 4px 0;
      font-size: var(--ls-font-size-h2);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }

    .header-subtitle {
      margin: 0;
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
    }
  }

  .header-actions {
    display: flex;
    gap: var(--ls-spacing-sm);
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--ldesign-border-color);
    background: var(--ldesign-bg-color-container);
    border-radius: var(--ls-border-radius-base);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--ldesign-text-color-secondary);

    &:hover {
      background: var(--ldesign-bg-color-container-hover);
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-brand-color);
      transform: translateY(-2px);
      box-shadow: var(--ldesign-shadow-2);
    }
  }
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--ldesign-text-color-secondary);

  .loading-spinner {
    animation: spin 1s linear infinite;
    color: var(--ldesign-brand-color);
    margin-bottom: var(--ls-spacing-base);
  }

  p {
    margin: 0;
    font-size: var(--ls-font-size-base);
  }
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg);
}

.welcome-card {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-lg);
  padding: var(--ls-padding-xl);
  background: linear-gradient(135deg, var(--ldesign-brand-color-focus), var(--ldesign-brand-color-hover));
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-2);

  .welcome-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--ls-border-radius-lg);
    color: var(--ldesign-brand-color);
  }

  .welcome-text {
    flex: 1;

    h2 {
      margin: 0 0 8px 0;
      font-size: var(--ls-font-size-h3);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-secondary);
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ls-spacing-lg);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-lg);
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--ldesign-shadow-2);
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: var(--ls-border-radius-lg);
    flex-shrink: 0;

    &.projects {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    &.node {
      background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
      color: white;
    }

    &.memory {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }

    &.cpu {
      background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
      color: white;
    }
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: var(--ls-font-size-h3);
      font-weight: 700;
      color: var(--ldesign-text-color-primary);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
    }
  }
}

.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--ls-spacing-lg);
}

.info-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  overflow: hidden;
  box-shadow: var(--ldesign-shadow-1);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--ldesign-shadow-2);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-base) var(--ls-padding-lg);
    background: var(--ldesign-bg-color-component);
    border-bottom: 1px solid var(--ldesign-border-color);

    svg {
      color: var(--ldesign-brand-color);
    }

    h3 {
      margin: 0;
      font-size: var(--ls-font-size-base);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }
  }

  .card-content {
    padding: var(--ls-padding-lg);
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-base);
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-base);

    .info-label {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
      font-weight: 500;
    }

    .info-value {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-primary);
      font-weight: 500;
      font-family: 'Consolas', 'Monaco', monospace;
      text-align: right;
      max-width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .info-cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: var(--ls-padding-base);
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ls-spacing-base);
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .info-cards-grid {
    grid-template-columns: 1fr;
  }

  .welcome-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
