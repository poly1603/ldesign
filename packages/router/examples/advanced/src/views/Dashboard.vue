<template>
  <div class="dashboard">
    <h1>📊 仪表板</h1>
    <p>欢迎来到管理仪表板，这里展示了系统的核心数据和统计信息。</p>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>用户总数</h3>
          <div class="stat-value">12,456</div>
          <div class="stat-change positive">+15.3%</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>页面访问</h3>
          <div class="stat-value">89,234</div>
          <div class="stat-change positive">+23.7%</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>总收入</h3>
          <div class="stat-value">¥234,567</div>
          <div class="stat-change positive">+18.9%</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <h3>活跃用户</h3>
          <div class="stat-value">3,456</div>
          <div class="stat-change negative">-2.1%</div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="content-section">
        <h2>📋 最近活动</h2>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">👤</div>
            <div class="activity-details">
              <div class="activity-title">新用户注册</div>
              <div class="activity-time">2分钟前</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">📝</div>
            <div class="activity-details">
              <div class="activity-title">系统配置更新</div>
              <div class="activity-time">15分钟前</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">💳</div>
            <div class="activity-details">
              <div class="activity-title">支付订单完成</div>
              <div class="activity-time">1小时前</div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <h2>🎯 快速操作</h2>
        <div class="quick-actions">
          <button class="action-btn primary">
            <span class="btn-icon">➕</span>
            <span class="btn-text">添加用户</span>
          </button>
          <button class="action-btn secondary">
            <span class="btn-icon">📊</span>
            <span class="btn-text">查看报表</span>
          </button>
          <button class="action-btn secondary">
            <span class="btn-icon">⚙️</span>
            <span class="btn-text">系统设置</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dashboard组件逻辑
console.log('Dashboard组件已加载')
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard h1 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.dashboard > p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  background: #f3f4f6;
  width: 4rem;
  height: 4rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content h3 {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.content-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
}

.content-section h2 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.activity-item:hover {
  background: #f3f4f6;
}

.activity-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

.btn-icon {
  font-size: 1.125rem;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
