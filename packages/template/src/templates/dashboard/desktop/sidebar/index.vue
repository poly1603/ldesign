<template>
  <div class="dashboard-sidebar-container" :class="{ 'dark': darkMode, 'collapsed': isCollapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="`width-${sidebarWidth}`">
      <div class="sidebar-header">
        <h1 class="sidebar-logo">Dashboard</h1>
        <button v-if="collapsible" class="collapse-btn" @click="toggleSidebar">
          {{ isCollapsed ? '→' : '←' }}
        </button>
      </div>

      <nav class="sidebar-menu">
        <a
          v-for="(item, index) in menuItems"
          :key="index"
          :href="item.href || '#'"
          class="menu-item"
          :class="{ 'active': item.active }"
          @click="handleMenuClick(item, $event)"
        >
          <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
          <span v-if="!isCollapsed" class="menu-label">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <span class="menu-icon">🚪</span>
          <span v-if="!isCollapsed">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="top-bar">
        <h2 class="page-title">数据概览</h2>
        <div class="user-section">
          <span class="user-name">{{ userName || '用户' }}</span>
          <button class="theme-toggle" @click="toggleTheme">
            {{ darkMode ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>

      <div class="content-area">
        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="stat-card"
          >
            <div class="stat-header">
              <span v-if="stat.icon" class="stat-icon">{{ stat.icon }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div v-if="stat.trend" class="stat-trend" :class="`trend-${stat.trend}`">
              <span v-if="stat.trend === 'up'">↗</span>
              <span v-else-if="stat.trend === 'down'">↘</span>
              <span v-else>→</span>
              <span v-if="stat.change">{{ stat.change }}</span>
            </div>
          </div>
        </div>

        <!-- 图表区域占位 -->
        <div class="charts-section">
          <div class="chart-card">
            <h3>趋势图表</h3>
            <div class="chart-placeholder">图表内容区域</div>
          </div>
          <div class="chart-card">
            <h3>数据分析</h3>
            <div class="chart-placeholder">图表内容区域</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DashboardDesktopSidebarProps } from '../../types'

const props = withDefaults(defineProps<DashboardDesktopSidebarProps>(), {
  userName: 'Admin',
  showSidebar: true,
  darkMode: false,
  sidebarWidth: 'normal',
  collapsible: true,
  defaultCollapsed: false,
  stats: () => [
    { label: '总访问量', value: '12,345', icon: '👁', trend: 'up', change: '+12%' },
    { label: '活跃用户', value: '856', icon: '👥', trend: 'up', change: '+5%' },
    { label: '收入', value: '¥9,876', icon: '💰', trend: 'down', change: '-3%' },
    { label: '任务完成', value: '42', icon: '✓', trend: 'neutral' },
  ],
  menuItems: () => [
    { label: '概览', icon: '📊', active: true },
    { label: '数据', icon: '📈' },
    { label: '用户', icon: '👥' },
    { label: '设置', icon: '⚙️' },
  ],
})

const emit = defineEmits<{
  'update:darkMode': [value: boolean]
}>()

const isCollapsed = ref(props.defaultCollapsed)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleTheme = () => {
  emit('update:darkMode', !props.darkMode)
}

const handleMenuClick = (item: any, event: Event) => {
  if (item.onClick) {
    event.preventDefault()
    item.onClick()
  }
}

const handleLogout = () => {
  props.onLogout?.()
}
</script>

<style scoped>
.dashboard-sidebar-container {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  transition: background-color 0.3s;
}

.dashboard-sidebar-container.dark {
  background: #1a1a1a;
  color: #e0e0e0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e0e0e0;
  transition: width 0.3s, background-color 0.3s;
}

.dark .sidebar {
  background: #2a2a2a;
  border-right-color: #404040;
}

.sidebar.width-narrow {
  width: 200px;
}

.sidebar.width-normal {
  width: 260px;
}

.sidebar.width-wide {
  width: 300px;
}

.collapsed .sidebar {
  width: 72px !important;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dark .sidebar-header {
  border-bottom-color: #404040;
}

.sidebar-logo {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #667eea;
  white-space: nowrap;
  overflow: hidden;
}

.collapse-btn {
  padding: 6px 10px;
  background: #f5f7fa;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.dark .collapse-btn {
  background: #404040;
}

.collapse-btn:hover {
  background: #e0e0e0;
}

.dark .collapse-btn:hover {
  background: #555;
}

.sidebar-menu {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  text-decoration: none;
  color: #666;
  transition: background-color 0.3s, color 0.3s;
  white-space: nowrap;
}

.dark .menu-item {
  color: #b0b0b0;
}

.menu-item:hover {
  background: #f5f7fa;
  color: #333;
}

.dark .menu-item:hover {
  background: #404040;
  color: #e0e0e0;
}

.menu-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.menu-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
}

.menu-label {
  font-size: 15px;
  font-weight: 500;
}

.collapsed .menu-label {
  display: none;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid #e0e0e0;
}

.dark .sidebar-footer {
  border-top-color: #404040;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 10px;
  color: #e74c3c;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #fee;
}

.dark .logout-btn:hover {
  background: #4a2a2a;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.dark .top-bar {
  background: #2a2a2a;
  border-bottom-color: #404040;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-size: 15px;
  font-weight: 500;
}

.theme-toggle {
  padding: 8px 12px;
  background: #f5f7fa;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dark .theme-toggle {
  background: #404040;
}

.theme-toggle:hover {
  background: #e0e0e0;
}

.dark .theme-toggle:hover {
  background: #555;
}

.content-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.dark .stat-card {
  background: #2a2a2a;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-icon {
  font-size: 24px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.dark .stat-label {
  color: #b0b0b0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.stat-trend.trend-up {
  color: #27ae60;
}

.stat-trend.trend-down {
  color: #e74c3c;
}

.stat-trend.trend-neutral {
  color: #95a5a6;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.dark .chart-card {
  background: #2a2a2a;
}

.chart-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
}

.dark .chart-placeholder {
  background: #1a1a1a;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
