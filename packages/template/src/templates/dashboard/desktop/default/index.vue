<script setup lang="ts">

interface Props {
  title?: string
  username?: string
  stats?: {
    visits: string
    users: string
    orders: string
    revenue: string
  }
}

// eslint-disable-next-line unused-imports/no-unused-vars, ts/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  title: '仪表板',
  username: '用户',
  stats: () => ({
    visits: '12,345',
    users: '1,234',
    orders: '567',
    revenue: '89,012',
  }),
})
</script>

<template>
  <div class="dashboard-desktop-default">
    <header class="dashboard-header">
      <h1>{{ title }}</h1>
      <div class="user-info">
        <span>{{ username }}</span>
      </div>
    </header>

    <div class="dashboard-content">
      <aside class="sidebar">
        <nav class="nav-menu">
          <a href="#" class="nav-item active">概览</a>
          <a href="#" class="nav-item">数据分析</a>
          <a href="#" class="nav-item">报表</a>
          <a href="#" class="nav-item">设置</a>
        </nav>
      </aside>

      <main class="main-content">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>总访问量</h3>
            <p class="stat-value">
              {{ stats.visits }}
            </p>
          </div>
          <div class="stat-card">
            <h3>活跃用户</h3>
            <p class="stat-value">
              {{ stats.users }}
            </p>
          </div>
          <div class="stat-card">
            <h3>订单数</h3>
            <p class="stat-value">
              {{ stats.orders }}
            </p>
          </div>
          <div class="stat-card">
            <h3>收入</h3>
            <p class="stat-value">
              ¥{{ stats.revenue }}
            </p>
          </div>
        </div>

        <div class="content-area">
          <slot>
            <p>这里是仪表板的主要内容区域</p>
          </slot>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-desktop-default {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.user-info {
  font-size: 14px;
  color: #666;
}

.dashboard-content {
  display: flex;
  min-height: calc(100vh - 60px);
}

.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e0e0e0;
}

.nav-menu {
  padding: 16px 0;
}

.nav-item {
  display: block;
  padding: 12px 24px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.active {
  color: #667eea;
  background: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.stat-value {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.content-area {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
