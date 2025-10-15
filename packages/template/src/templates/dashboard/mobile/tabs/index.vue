<template>
  <div class="dashboard-tabs-container">
    <header class="mobile-header">
      <h1 class="header-title">Dashboard</h1>
      <button class="logout-btn" @click="handleLogout">🚪</button>
    </header>

    <!-- 标签切换 -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ 'active': activeTab === tab.value }"
        @click="handleTabChange(tab.value)"
      >
        <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <main class="tab-content">
      <div class="stats-grid">
        <div v-for="(stat, index) in stats" :key="index" class="stat-card">
          <div class="stat-icon">{{ stat.icon || '📊' }}</div>
          <div class="stat-info">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>
      </div>
    </main>

    <nav v-if="showBottomNav" class="bottom-nav">
      <a
        v-for="(item, index) in (bottomNavItems || menuItems)"
        :key="index"
        class="nav-item"
        :class="{ 'active': item.active }"
      >
        <span class="nav-icon">{{ item.icon || '•' }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DashboardMobileTabsProps } from '../../types'

const props = withDefaults(defineProps<DashboardMobileTabsProps>(), {
  userName: '用户',
  showBottomNav: true,
  tabs: () => [
    { label: '概览', value: 'overview', icon: '📊' },
    { label: '分析', value: 'analytics', icon: '📈' },
    { label: '报告', value: 'reports', icon: '📋' },
  ],
  activeTab: 'overview',
  stats: () => [
    { label: '访问', value: '12K', icon: '👁' },
    { label: '用户', value: '856', icon: '👥' },
    { label: '收入', value: '¥9.8K', icon: '💰' },
    { label: '任务', value: '42', icon: '✓' },
  ],
  menuItems: () => [
    { label: '首页', icon: '🏠', active: true },
    { label: '数据', icon: '📊' },
    { label: '消息', icon: '💬' },
    { label: '我的', icon: '👤' },
  ],
})

const handleTabChange = (value: string) => {
  props.onTabChange?.(value)
}

const handleLogout = () => {
  props.onLogout?.()
}
</script>

<style scoped>
.dashboard-tabs-container {
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
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.logout-btn {
  padding: 6px 10px;
  background: #fee;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.tabs-bar {
  display: flex;
  background: white;
  padding: 8px 16px;
  gap: 8px;
  overflow-x: auto;
  border-bottom: 1px solid #e0e0e0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f5f7fa;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tab-icon {
  font-size: 16px;
}

.tab-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 80px;
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  background: white;
  padding: 20px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.stat-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
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
</style>
