<template>
  <div class="admin-dashboard">
    <h1>管理仪表板</h1>
    <p>欢迎来到管理后台，这里只有管理员可以访问。</p>

    <div class="admin-stats">
      <div class="stat-card">
        <h3>总用户数</h3>
        <div class="stat-value">
          2,345
        </div>
        <div class="stat-change positive">
          +12%
        </div>
      </div>
      <div class="stat-card">
        <h3>活跃用户</h3>
        <div class="stat-value">
          1,234
        </div>
        <div class="stat-change positive">
          +8%
        </div>
      </div>
      <div class="stat-card">
        <h3>系统负载</h3>
        <div class="stat-value">
          45%
        </div>
        <div class="stat-change negative">
          +3%
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 1rem;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
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
</style>
