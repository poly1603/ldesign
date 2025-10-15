<script setup lang="ts">
import type { DashboardMobileProps } from '../../types'

const props = withDefaults(defineProps<DashboardMobileProps>(), {
  userName: '用户',
  showBottomNav: true,
  stats: () => [
    { label: '访问量', value: '12,345', icon: '👁', trend: 'up', change: '+12%' },
    { label: '用户', value: '856', icon: '👥', trend: 'up', change: '+5%' },
    { label: '收入', value: '¥9,876', icon: '💰', trend: 'down', change: '-3%' },
    { label: '任务', value: '42', icon: '✓', trend: 'neutral' },
  ],
  menuItems: () => [
    { label: '首页', icon: '🏠', active: true },
    { label: '数据', icon: '📊' },
    { label: '消息', icon: '💬' },
    { label: '我的', icon: '👤' },
  ],
})

function handleNavClick(item: any, event: Event) {
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
  <div class="dashboard-mobile-container">
    <!-- 顶部栏 -->
    <header class="mobile-header">
      <h1 class="header-title">
        Dashboard
      </h1>
      <div class="header-actions">
        <span class="user-name">{{ userName }}</span>
        <button class="logout-btn" @click="handleLogout">
          🚪
        </button>
      </div>
    </header>

    <!-- 内容区 -->
    <main class="mobile-content">
      <!-- 统计卡片 -->
      <div class="stats-container">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="stat-card"
        >
          <div class="stat-icon">
            {{ stat.icon || '📊' }}
          </div>
          <div class="stat-info">
            <div class="stat-label">
              {{ stat.label }}
            </div>
            <div class="stat-value">
              {{ stat.value }}
            </div>
            <div v-if="stat.trend" class="stat-trend" :class="`trend-${stat.trend}`">
              <span v-if="stat.trend === 'up'">↗</span>
              <span v-else-if="stat.trend === 'down'">↘</span>
              <span v-else>→</span>
              <span v-if="stat.change">{{ stat.change }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表占位 -->
      <div class="chart-section">
        <h2 class="section-title">
          数据概览
        </h2>
        <div class="chart-card">
          <div class="chart-placeholder">
            图表区域
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航 -->
    <nav v-if="showBottomNav" class="bottom-nav">
      <a
        v-for="(item, index) in (bottomNavItems || menuItems)"
        :key="index"
        :href="item.href || '#'"
        class="nav-item"
        :class="{ active: item.active }"
        @click="handleNavClick(item, $event)"
      >
        <span class="nav-icon">{{ item.icon || '•' }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    </nav>
  </div>
</template>

<style scoped>
.dashboard-mobile-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f7fa;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  color: #666;
}

.logout-btn {
  padding: 6px 10px;
  background: #fee;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.mobile-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 80px;
  overflow-y: auto;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 12px;
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
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

.chart-section {
  margin-top: 8px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.chart-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-placeholder {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 8px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  text-decoration: none;
  color: #999;
  transition: color 0.3s;
}

.nav-item.active {
  color: #667eea;
}

.nav-icon {
  font-size: 22px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}

@media (min-width: 640px) {
  .dashboard-mobile-container {
    max-width: 480px;
    margin: 0 auto;
  }
}
</style>
