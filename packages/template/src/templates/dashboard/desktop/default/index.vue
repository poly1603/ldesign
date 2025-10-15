<script setup lang="ts">
import type { DashboardTemplateProps } from '../../types'

const props = withDefaults(defineProps<DashboardTemplateProps>(), {
  userName: 'Admin',
  showSidebar: true,
  darkMode: false,
  stats: () => [
    { label: '总用户数', value: '1,234', icon: '👥', trend: 'up' },
    { label: '今日访问', value: '567', icon: '📊', trend: 'up' },
    { label: '活跃用户', value: '890', icon: '✨', trend: 'neutral' },
    { label: '收入', value: '¥12,345', icon: '💰', trend: 'up' },
  ],
  menuItems: () => [
    { label: '首页', icon: '🏠', href: '#' },
    { label: '用户', icon: '👥', href: '#' },
    { label: '设置', icon: '⚙️', href: '#' },
  ],
})

function handleMenuClick(item: any, event: Event) {
  if (item.onClick) {
    event.preventDefault()
    item.onClick()
  }
}

function handleLogout() {
  props.onLogout?.()
}
</script>

<template>
  <div class="dashboard">
    <aside v-if="showSidebar" class="dashboard-sidebar">
      <div class="sidebar-header">
        <h2>LDesign</h2>
      </div>
      <nav class="sidebar-nav">
        <a
          v-for="(item, index) in menuItems"
          :key="index"
          :href="item.href || '#'"
          class="nav-item"
          @click="handleMenuClick(item, $event)"
        >
          <span v-if="item.icon" class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a>
      </nav>
    </aside>

    <main class="dashboard-main">
      <header class="dashboard-header">
        <h1>仪表板</h1>
        <div class="header-right">
          <span class="user-name">{{ userName }}</span>
          <button class="logout-btn" @click="handleLogout">
            退出
          </button>
        </div>
      </header>

      <div class="dashboard-content">
        <div class="stats-grid">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="stat-card"
          >
            <div class="stat-header">
              <span class="stat-label">{{ stat.label }}</span>
              <span v-if="stat.icon" class="stat-icon">{{ stat.icon }}</span>
            </div>
            <div class="stat-value">
              {{ stat.value }}
            </div>
            <div v-if="stat.trend" class="stat-trend" :class="`trend-${stat.trend}`">
              {{ stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→' }}
            </div>
          </div>
        </div>

        <div class="dashboard-placeholder">
          <p>在这里添加您的内容</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.dashboard-sidebar {
  width: 240px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-icon {
  font-size: 20px;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: white;
  padding: 20px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}

.logout-btn {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #c0392b;
}

.dashboard-content {
  flex: 1;
  padding: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.stat-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 14px;
  font-weight: 600;
}

.trend-up {
  color: #27ae60;
}

.trend-down {
  color: #e74c3c;
}

.trend-neutral {
  color: #95a5a6;
}

.dashboard-placeholder {
  background: white;
  padding: 60px;
  border-radius: 12px;
  text-align: center;
  color: #95a5a6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
