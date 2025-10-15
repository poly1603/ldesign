<template>
  <div class="dashboard-tablet-container" :class="`layout-${layout}`">
    <header class="tablet-header">
      <h1 class="header-title">Dashboard</h1>
      <div class="header-actions">
        <span class="user-name">{{ userName }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </header>

    <main class="tablet-content" :class="{ 'compact': compact }">
      <div class="stats-grid">
        <div v-for="(stat, index) in stats" :key="index" class="stat-card">
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

      <div class="menu-grid">
        <a
          v-for="(item, index) in menuItems"
          :key="index"
          :href="item.href || '#'"
          class="menu-card"
          :class="{ 'active': item.active }"
        >
          <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
        </a>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { DashboardTabletProps } from '../../types'

const props = withDefaults(defineProps<DashboardTabletProps>(), {
  userName: 'Admin',
  layout: 'portrait',
  compact: false,
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
    { label: '报告', icon: '📋' },
    { label: '消息', icon: '💬' },
  ],
})

const handleLogout = () => {
  props.onLogout?.()
}
</script>

<style scoped>
.dashboard-tablet-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.tablet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-title {
  font-size: 26px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-size: 15px;
  font-weight: 500;
  color: #666;
}

.logout-btn {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.tablet-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.tablet-content.compact {
  padding: 16px 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
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

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.menu-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: #333;
  transition: transform 0.2s, box-shadow 0.2s;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.menu-card.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.menu-icon {
  font-size: 32px;
}

.menu-label {
  font-size: 15px;
  font-weight: 500;
}

.layout-landscape .stats-grid {
  grid-template-columns: repeat(4, 1fr);
}

.layout-landscape .menu-grid {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}
</style>
