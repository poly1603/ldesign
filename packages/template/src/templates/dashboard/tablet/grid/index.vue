<template>
  <div class="dashboard-grid-container">
    <header class="grid-header">
      <h1 class="header-title">Dashboard</h1>
      <div class="header-actions">
        <span class="user-name">{{ userName }}</span>
        <button class="logout-btn" @click="handleLogout">🚪</button>
      </div>
    </header>

    <main class="grid-content" :class="`columns-${columns}`">
      <div class="grid-layout" :class="`gap-${gap}`">
        <div v-for="(stat, index) in stats" :key="index" class="grid-item">
          <div class="item-icon">{{ stat.icon || '📊' }}</div>
          <div class="item-label">{{ stat.label }}</div>
          <div class="item-value">{{ stat.value }}</div>
          <div v-if="stat.trend" class="item-trend" :class="`trend-${stat.trend}`">
            <span v-if="stat.trend === 'up'">↗</span>
            <span v-else-if="stat.trend === 'down'">↘</span>
            <span v-else>→</span>
            <span v-if="stat.change">{{ stat.change }}</span>
          </div>
        </div>

        <div v-for="(item, index) in menuItems" :key="`menu-${index}`" class="grid-item menu-item">
          <div class="item-icon">{{ item.icon || '•' }}</div>
          <div class="item-label">{{ item.label }}</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { DashboardTabletGridProps } from '../../types'

const props = withDefaults(defineProps<DashboardTabletGridProps>(), {
  userName: 'Admin',
  columns: 3,
  gap: 'medium',
  layout: 'portrait',
  compact: false,
  stats: () => [
    { label: '访问量', value: '12K', icon: '👁', trend: 'up', change: '+12%' },
    { label: '用户', value: '856', icon: '👥', trend: 'up', change: '+5%' },
    { label: '收入', value: '¥9.8K', icon: '💰', trend: 'down', change: '-3%' },
    { label: '任务', value: '42', icon: '✓', trend: 'neutral' },
  ],
  menuItems: () => [
    { label: '数据分析', icon: '📊' },
    { label: '用户管理', icon: '👥' },
    { label: '系统设置', icon: '⚙️' },
    { label: '消息中心', icon: '💬' },
  ],
})

const handleLogout = () => {
  props.onLogout?.()
}
</script>

<style scoped>
.dashboard-grid-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.grid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-title {
  font-size: 24px;
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
  color: #666;
}

.logout-btn {
  padding: 8px 12px;
  background: #fee;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.grid-content {
  flex: 1;
  padding: 20px 28px;
  overflow-y: auto;
}

.grid-layout {
  display: grid;
}

.grid-layout.gap-small {
  gap: 12px;
}

.grid-layout.gap-medium {
  gap: 16px;
}

.grid-layout.gap-large {
  gap: 24px;
}

.columns-2 .grid-layout {
  grid-template-columns: repeat(2, 1fr);
}

.columns-3 .grid-layout {
  grid-template-columns: repeat(3, 1fr);
}

.columns-4 .grid-layout {
  grid-template-columns: repeat(4, 1fr);
}

.grid-item {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.item-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.item-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.item-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.item-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
}

.item-trend.trend-up {
  color: #27ae60;
}

.item-trend.trend-down {
  color: #e74c3c;
}

.item-trend.trend-neutral {
  color: #95a5a6;
}

.menu-item {
  cursor: pointer;
}

.menu-item:active {
  transform: scale(0.98);
}

@media (max-width: 900px) {
  .columns-4 .grid-layout {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .columns-3 .grid-layout,
  .columns-4 .grid-layout {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
