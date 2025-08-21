<script setup lang="ts">
import { SizeIndicator, SizeSwitcher } from '../../../../src/vue'
import CustomButton from './CustomButton.vue'
import CustomCard from './CustomCard.vue'
</script>

<template>
  <div class="real-world-demo">
    <!-- 模拟的管理后台界面 -->
    <div class="admin-layout">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>管理后台</h2>
          <SizeIndicator class="sidebar-size-indicator" />
        </div>

        <nav class="sidebar-nav">
          <a href="#" class="nav-item active">
            <span class="nav-icon">📊</span>
            <span class="nav-text">仪表盘</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">👥</span>
            <span class="nav-text">用户管理</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">📦</span>
            <span class="nav-text">产品管理</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">📈</span>
            <span class="nav-text">数据分析</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">系统设置</span>
          </a>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <!-- 顶部工具栏 -->
        <header class="toolbar">
          <div class="toolbar-left">
            <h1>仪表盘</h1>
            <span class="breadcrumb">首页 / 仪表盘</span>
          </div>

          <div class="toolbar-right">
            <SizeSwitcher
              switcher-style="select"
              class="toolbar-size-switcher"
            />
            <CustomButton size="medium" variant="primary">
              新建项目
            </CustomButton>
          </div>
        </header>

        <!-- 统计卡片 -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                👥
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  1,234
                </div>
                <div class="stat-label">
                  总用户数
                </div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                📦
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  567
                </div>
                <div class="stat-label">
                  产品数量
                </div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                💰
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  ¥89,012
                </div>
                <div class="stat-label">
                  总收入
                </div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                📈
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  +12.5%
                </div>
                <div class="stat-label">
                  增长率
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 图表和表格区域 -->
        <section class="content-section">
          <div class="content-grid">
            <!-- 图表卡片 -->
            <CustomCard title="销售趋势" class="chart-card">
              <div class="chart-placeholder">
                <div class="chart-bar" style="height: 60%" />
                <div class="chart-bar" style="height: 80%" />
                <div class="chart-bar" style="height: 45%" />
                <div class="chart-bar" style="height: 90%" />
                <div class="chart-bar" style="height: 70%" />
                <div class="chart-bar" style="height: 85%" />
              </div>

              <template #footer>
                <CustomButton size="small" variant="outline">
                  查看详情
                </CustomButton>
              </template>
            </CustomCard>

            <!-- 数据表格 -->
            <CustomCard title="最新订单" class="table-card">
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>订单号</th>
                      <th>客户</th>
                      <th>金额</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#001</td>
                      <td>张三</td>
                      <td>¥299</td>
                      <td>
                        <span class="status-badge status-success">已完成</span>
                      </td>
                    </tr>
                    <tr>
                      <td>#002</td>
                      <td>李四</td>
                      <td>¥599</td>
                      <td>
                        <span class="status-badge status-pending">处理中</span>
                      </td>
                    </tr>
                    <tr>
                      <td>#003</td>
                      <td>王五</td>
                      <td>¥199</td>
                      <td>
                        <span class="status-badge status-success">已完成</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <template #footer>
                <CustomButton size="small" variant="outline">
                  查看全部
                </CustomButton>
              </template>
            </CustomCard>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.real-world-demo {
  /* 移除默认的卡片样式 */
  background: none;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  margin: 0;
}

.admin-layout {
  display: flex;
  min-height: 80vh;
  background: var(--ls-bg-secondary, #f5f5f5);
  border-radius: var(--ls-border-radius-lg, 8px);
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 250px;
  background: var(--ls-bg-primary, #fff);
  border-right: 1px solid var(--ls-border-light, #f0f0f0);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: var(--ls-spacing-lg, 24px);
  border-bottom: 1px solid var(--ls-border-light, #f0f0f0);
}

.sidebar-header h2 {
  font-size: var(--ls-font-size-lg, 18px);
  margin: 0 0 var(--ls-spacing-sm, 8px);
  color: var(--ls-text-primary, #333);
}

.sidebar-size-indicator {
  font-size: var(--ls-font-size-xs, 12px);
}

.sidebar-nav {
  flex: 1;
  padding: var(--ls-spacing-base, 16px) 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--ls-spacing-sm, 8px) var(--ls-spacing-lg, 24px);
  color: var(--ls-text-secondary, #666);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: var(--ls-font-size-sm, 14px);
}

.nav-item:hover {
  background: var(--ls-bg-hover, #f5f5f5);
  color: var(--ls-text-primary, #333);
}

.nav-item.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-right: 3px solid #667eea;
}

.nav-icon {
  margin-right: var(--ls-spacing-sm, 8px);
  font-size: var(--ls-font-size-base, 16px);
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-spacing-lg, 24px);
  background: var(--ls-bg-primary, #fff);
  border-bottom: 1px solid var(--ls-border-light, #f0f0f0);
}

.toolbar-left h1 {
  font-size: var(--ls-font-size-h2, 28px);
  margin: 0 0 var(--ls-spacing-xs, 4px);
  color: var(--ls-text-primary, #333);
}

.breadcrumb {
  font-size: var(--ls-font-size-sm, 14px);
  color: var(--ls-text-secondary, #666);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-base, 16px);
}

.toolbar-size-switcher {
  background: var(--ls-bg-secondary, #f5f5f5);
  border-radius: var(--ls-border-radius-base, 4px);
  padding: var(--ls-spacing-xs, 4px);
}

/* 统计区域 */
.stats-section {
  padding: var(--ls-spacing-lg, 24px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--ls-spacing-base, 16px);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: var(--ls-spacing-lg, 24px);
  background: var(--ls-bg-primary, #fff);
  border-radius: var(--ls-border-radius-lg, 8px);
  box-shadow: var(--ls-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.05));
}

.stat-icon {
  font-size: var(--ls-font-size-xxl, 24px);
  margin-right: var(--ls-spacing-base, 16px);
}

.stat-number {
  font-size: var(--ls-font-size-xl, 20px);
  font-weight: 600;
  color: var(--ls-text-primary, #333);
  margin-bottom: var(--ls-spacing-xs, 4px);
}

.stat-label {
  font-size: var(--ls-font-size-sm, 14px);
  color: var(--ls-text-secondary, #666);
}

/* 内容区域 */
.content-section {
  flex: 1;
  padding: 0 var(--ls-spacing-lg, 24px) var(--ls-spacing-lg, 24px);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ls-spacing-lg, 24px);
  height: 100%;
}

.chart-card,
.table-card {
  height: fit-content;
}

/* 图表占位符 */
.chart-placeholder {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 200px;
  padding: var(--ls-spacing-base, 16px);
  background: var(--ls-bg-secondary, #f5f5f5);
  border-radius: var(--ls-border-radius-base, 4px);
  margin-bottom: var(--ls-spacing-base, 16px);
}

.chart-bar {
  width: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--ls-border-radius-sm, 2px);
  transition: all 0.3s ease;
}

.chart-bar:hover {
  transform: scaleY(1.1);
}

/* 数据表格 */
.table-container {
  overflow-x: auto;
  margin-bottom: var(--ls-spacing-base, 16px);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--ls-font-size-sm, 14px);
}

.data-table th,
.data-table td {
  padding: var(--ls-spacing-sm, 8px);
  text-align: left;
  border-bottom: 1px solid var(--ls-border-light, #f0f0f0);
}

.data-table th {
  font-weight: 600;
  color: var(--ls-text-primary, #333);
  background: var(--ls-bg-secondary, #f5f5f5);
}

.data-table td {
  color: var(--ls-text-secondary, #666);
}

.status-badge {
  padding: 2px 8px;
  border-radius: var(--ls-border-radius-full, 50%);
  font-size: var(--ls-font-size-xs, 12px);
  font-weight: 500;
}

.status-success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

/* 响应式 */
@media (max-width: 1024px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: var(--ls-spacing-sm, 8px);
  }

  .nav-item {
    white-space: nowrap;
    border-right: none;
    border-bottom: 3px solid transparent;
  }

  .nav-item.active {
    border-right: none;
    border-bottom: 3px solid #667eea;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: var(--ls-spacing-base, 16px);
    align-items: stretch;
  }

  .toolbar-right {
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
