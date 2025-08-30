<template>
  <div class="dashboard-template-admin" :style="cssVars" :class="{ 'dark-mode': darkMode, 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 侧边栏 -->
    <div v-if="showSidebar" class="admin-sidebar">
      <slot name="sidebar">
        <div class="sidebar-header">
          <div class="logo-section">
            <div class="logo-icon">⚡</div>
            <transition name="fade">
              <span v-if="!sidebarCollapsed" class="logo-text">{{ title }}</span>
            </transition>
          </div>
          <button class="collapse-btn" @click="toggleSidebar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
            </svg>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-group">
            <div class="nav-item active">
              <div class="nav-icon">📊</div>
              <transition name="fade">
                <span v-if="!sidebarCollapsed" class="nav-text">仪表板</span>
              </transition>
            </div>
            <div class="nav-item">
              <div class="nav-icon">👥</div>
              <transition name="fade">
                <span v-if="!sidebarCollapsed" class="nav-text">用户管理</span>
              </transition>
            </div>
            <div class="nav-item">
              <div class="nav-icon">📦</div>
              <transition name="fade">
                <span v-if="!sidebarCollapsed" class="nav-text">产品管理</span>
              </transition>
            </div>
            <div class="nav-item">
              <div class="nav-icon">📈</div>
              <transition name="fade">
                <span v-if="!sidebarCollapsed" class="nav-text">数据分析</span>
              </transition>
            </div>
            <div class="nav-item">
              <div class="nav-icon">⚙️</div>
              <transition name="fade">
                <span v-if="!sidebarCollapsed" class="nav-text">系统设置</span>
              </transition>
            </div>
          </div>
        </nav>
      </slot>
    </div>

    <!-- 主要内容区域 -->
    <div class="admin-main">
      <!-- 顶部导航栏 -->
      <div v-if="showHeader" class="admin-header">
        <slot name="header">
          <div class="header-left">
            <!-- 面包屑导航 -->
            <div v-if="showBreadcrumb" class="breadcrumb">
              <slot name="breadcrumb">
                <span class="breadcrumb-item">首页</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">仪表板</span>
              </slot>
            </div>
          </div>
          
          <div class="header-right">
            <!-- 搜索框 -->
            <div class="search-box">
              <input type="text" placeholder="搜索..." class="search-input" />
              <div class="search-icon">🔍</div>
            </div>
            
            <!-- 通知 -->
            <div v-if="showNotifications" class="notification-btn">
              <slot name="notifications">
                <div class="notification-icon">🔔</div>
                <div class="notification-badge">3</div>
              </slot>
            </div>
            
            <!-- 用户菜单 -->
            <div class="user-menu">
              <slot name="user-menu">
                <div class="user-avatar">
                  <img v-if="userAvatar" :src="userAvatar" :alt="userName" />
                  <div v-else class="avatar-placeholder">{{ userName.charAt(0) }}</div>
                </div>
                <span class="user-name">{{ userName }}</span>
                <div class="user-dropdown">▼</div>
              </slot>
            </div>
            
            <!-- 深色模式切换 -->
            <button class="theme-toggle" @click="toggleDarkMode">
              <div class="theme-icon">{{ darkMode ? '☀️' : '🌙' }}</div>
            </button>
          </div>
        </slot>
      </div>

      <!-- 内容区域 -->
      <div class="admin-content">
        <slot name="content">
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-number">{{ formatNumber(12580) }}</div>
                <div class="stat-label">总用户数</div>
                <div class="stat-trend positive">+12.5%</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-number">¥{{ formatNumber(856420) }}</div>
                <div class="stat-label">总收入</div>
                <div class="stat-trend positive">+8.2%</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📦</div>
              <div class="stat-content">
                <div class="stat-number">{{ formatNumber(3247) }}</div>
                <div class="stat-label">订单数量</div>
                <div class="stat-trend negative">-2.1%</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-number">{{ formatNumber(98.5) }}%</div>
                <div class="stat-label">系统可用性</div>
                <div class="stat-trend positive">+0.3%</div>
              </div>
            </div>
          </div>

          <!-- 图表区域 -->
          <div class="charts-grid">
            <div class="chart-card">
              <div class="card-header">
                <h3 class="card-title">访问趋势</h3>
                <div class="card-actions">
                  <button class="action-btn">📊</button>
                  <button class="action-btn">⚙️</button>
                </div>
              </div>
              <div class="chart-content">
                <div class="chart-placeholder">
                  <div class="chart-bars">
                    <div class="bar" style="height: 60%"></div>
                    <div class="bar" style="height: 80%"></div>
                    <div class="bar" style="height: 45%"></div>
                    <div class="bar" style="height: 90%"></div>
                    <div class="bar" style="height: 70%"></div>
                    <div class="bar" style="height: 85%"></div>
                    <div class="bar" style="height: 65%"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="chart-card">
              <div class="card-header">
                <h3 class="card-title">用户分布</h3>
                <div class="card-actions">
                  <button class="action-btn">📊</button>
                  <button class="action-btn">⚙️</button>
                </div>
              </div>
              <div class="chart-content">
                <div class="pie-chart">
                  <div class="pie-segment" style="--percentage: 40; --color: var(--primary-color)"></div>
                  <div class="pie-center">
                    <div class="pie-label">用户</div>
                    <div class="pie-value">12.5K</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 数据表格 -->
          <div class="table-card">
            <div class="card-header">
              <h3 class="card-title">最近订单</h3>
              <div class="card-actions">
                <button class="action-btn">📥</button>
                <button class="action-btn">🔄</button>
              </div>
            </div>
            <div class="table-content">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>用户</th>
                    <th>金额</th>
                    <th>状态</th>
                    <th>时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in mockOrders" :key="order.id">
                    <td class="order-id">#{{ order.id }}</td>
                    <td class="user-info">
                      <div class="user-avatar-small">{{ order.user.charAt(0) }}</div>
                      <span>{{ order.user }}</span>
                    </td>
                    <td class="amount">¥{{ formatNumber(order.amount) }}</td>
                    <td>
                      <span class="status-badge" :class="order.status">
                        {{ getStatusText(order.status) }}
                      </span>
                    </td>
                    <td class="time">{{ order.time }}</td>
                    <td class="actions">
                      <button class="action-btn small">👁️</button>
                      <button class="action-btn small">✏️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Props定义
interface Props {
  title?: string
  subtitle?: string
  showSidebar?: boolean
  showHeader?: boolean
  showBreadcrumb?: boolean
  sidebarCollapsed?: boolean
  primaryColor?: string
  darkMode?: boolean
  showNotifications?: boolean
  userName?: string
  userAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '管理后台',
  subtitle: '数据驱动决策',
  showSidebar: true,
  showHeader: true,
  showBreadcrumb: true,
  sidebarCollapsed: false,
  primaryColor: '#1890ff',
  darkMode: false,
  showNotifications: true,
  userName: '管理员',
  userAvatar: ''
})

// 状态管理
const sidebarCollapsed = ref(props.sidebarCollapsed)
const darkMode = ref(props.darkMode)

// 模拟数据
const mockOrders = reactive([
  { id: '20241201001', user: '张三', amount: 1299, status: 'completed', time: '2024-12-01 14:30' },
  { id: '20241201002', user: '李四', amount: 899, status: 'pending', time: '2024-12-01 13:45' },
  { id: '20241201003', user: '王五', amount: 2199, status: 'processing', time: '2024-12-01 12:20' },
  { id: '20241201004', user: '赵六', amount: 599, status: 'cancelled', time: '2024-12-01 11:15' },
  { id: '20241201005', user: '钱七', amount: 1599, status: 'completed', time: '2024-12-01 10:30' }
])

// 计算属性
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor
}))

// 工具函数
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: '已完成',
    pending: '待处理',
    processing: '处理中',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 事件处理
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
}
</script>

<style lang="less" scoped>
.dashboard-template-admin {
  min-height: 100vh;
  display: flex;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s ease;

  &.dark-mode {
    background: #141414;
    color: #fff;

    .admin-sidebar {
      background: #001529;
      border-color: #303030;
    }

    .admin-header {
      background: #1f1f1f;
      border-color: #303030;
    }

    .stat-card,
    .chart-card,
    .table-card {
      background: #1f1f1f;
      border-color: #303030;
    }

    .data-table {
      th {
        background: #262626;
        color: #fff;
      }

      td {
        border-color: #303030;
      }

      tbody tr:hover {
        background: #262626;
      }
    }
  }
}

// 侧边栏
.admin-sidebar {
  width: 250px;
  background: #001529;
  border-right: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #303030;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .logo-icon {
        font-size: 1.5rem;
        color: var(--primary-color);
      }

      .logo-text {
        font-size: 1.2rem;
        font-weight: 600;
        color: #fff;
      }
    }

    .collapse-btn {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }

  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;

    .nav-group {
      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        &.active {
          background: var(--primary-color);
          color: #fff;
        }

        .nav-icon {
          font-size: 1.2rem;
          min-width: 20px;
        }

        .nav-text {
          font-size: 0.9rem;
        }
      }
    }
  }
}

// 侧边栏收起状态
.sidebar-collapsed .admin-sidebar {
  width: 80px;

  .nav-item {
    justify-content: center;
  }
}

// 主要内容区域
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 顶部导航栏
.admin-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .header-left {
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;

      .breadcrumb-item {
        color: #666;

        &.active {
          color: var(--primary-color);
          font-weight: 500;
        }
      }

      .breadcrumb-separator {
        color: #ccc;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;

    .search-box {
      position: relative;

      .search-input {
        width: 200px;
        padding: 0.5rem 2.5rem 0.5rem 1rem;
        border: 1px solid #d9d9d9;
        border-radius: 6px;
        font-size: 0.9rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      }

      .search-icon {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
      }
    }

    .notification-btn {
      position: relative;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background 0.3s ease;

      &:hover {
        background: #f5f5f5;
      }

      .notification-icon {
        font-size: 1.2rem;
      }

      .notification-badge {
        position: absolute;
        top: 0;
        right: 0;
        background: #ff4d4f;
        color: #fff;
        font-size: 0.7rem;
        padding: 0.1rem 0.3rem;
        border-radius: 10px;
        min-width: 16px;
        text-align: center;
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background 0.3s ease;

      &:hover {
        background: #f5f5f5;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--primary-color);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
      }

      .user-name {
        font-size: 0.9rem;
        font-weight: 500;
      }

      .user-dropdown {
        font-size: 0.7rem;
        color: #999;
      }
    }

    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background 0.3s ease;

      &:hover {
        background: #f5f5f5;
      }

      .theme-icon {
        font-size: 1.2rem;
      }
    }
  }
}

// 内容区域
.admin-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    gap: 1rem;

    .stat-icon {
      width: 48px;
      height: 48px;
      background: rgba(24, 144, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-content {
      flex: 1;

      .stat-number {
        font-size: 1.8rem;
        font-weight: 600;
        color: #262626;
        margin-bottom: 0.25rem;
      }

      .stat-label {
        font-size: 0.9rem;
        color: #8c8c8c;
        margin-bottom: 0.25rem;
      }

      .stat-trend {
        font-size: 0.8rem;
        font-weight: 500;

        &.positive {
          color: #52c41a;
        }

        &.negative {
          color: #ff4d4f;
        }
      }
    }
  }
}

// 图表区域
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  .chart-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8e8e8;

    .card-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        font-size: 1rem;
        font-weight: 600;
        color: #262626;
      }

      .card-actions {
        display: flex;
        gap: 0.5rem;

        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.3s ease;

          &:hover {
            background: #f5f5f5;
          }

          &.small {
            font-size: 0.8rem;
          }
        }
      }
    }

    .chart-content {
      padding: 1.5rem;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;

      .chart-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: end;
        justify-content: center;
        gap: 0.5rem;

        .chart-bars {
          display: flex;
          align-items: end;
          gap: 0.5rem;
          height: 100%;

          .bar {
            width: 20px;
            background: linear-gradient(to top, var(--primary-color), rgba(24, 144, 255, 0.6));
            border-radius: 2px 2px 0 0;
            transition: all 0.3s ease;

            &:hover {
              opacity: 0.8;
            }
          }
        }
      }

      .pie-chart {
        position: relative;
        width: 120px;
        height: 120px;

        .pie-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;

          .pie-label {
            font-size: 0.8rem;
            color: #8c8c8c;
          }

          .pie-value {
            font-size: 1.2rem;
            font-weight: 600;
            color: #262626;
          }
        }
      }
    }
  }
}

// 数据表格
.table-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;

  .card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #262626;
    }
  }

  .table-content {
    overflow-x: auto;

    .data-table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: #fafafa;
        padding: 0.75rem 1rem;
        text-align: left;
        font-weight: 600;
        color: #262626;
        font-size: 0.9rem;
        border-bottom: 1px solid #e8e8e8;
      }

      td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #f0f0f0;
        font-size: 0.9rem;

        &.order-id {
          font-family: monospace;
          color: var(--primary-color);
          font-weight: 500;
        }

        &.amount {
          font-weight: 600;
          color: #262626;
        }

        &.time {
          color: #8c8c8c;
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .user-avatar-small {
          width: 24px;
          height: 24px;
          background: var(--primary-color);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
        }
      }

      .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;

        &.completed {
          background: #f6ffed;
          color: #52c41a;
          border: 1px solid #b7eb8f;
        }

        &.pending {
          background: #fff7e6;
          color: #fa8c16;
          border: 1px solid #ffd591;
        }

        &.processing {
          background: #e6f7ff;
          color: #1890ff;
          border: 1px solid #91d5ff;
        }

        &.cancelled {
          background: #fff2f0;
          color: #ff4d4f;
          border: 1px solid #ffb3b3;
        }
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      tbody tr:hover {
        background: #fafafa;
      }
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式设计
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-template-admin {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    height: auto;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .admin-header .header-right {
    .search-box {
      display: none;
    }
  }
}
</style>
