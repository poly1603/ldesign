<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>@ldesign/store 高级示例</h1>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">
          首页
        </router-link>
        <router-link to="/performance" class="nav-link">
          性能优化
        </router-link>
        <router-link to="/store-pool" class="nav-link">
          Store池管理
        </router-link>
        <router-link to="/enterprise" class="nav-link">
          企业级功能
        </router-link>
        <router-link to="/realtime" class="nav-link">
          实时同步
        </router-link>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>&copy; 2024 LDesign Team. 基于 MIT 许可发布。</p>
    </footer>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.main-content {
  min-height: calc(100vh - 140px);
  padding: 2rem;
  background: #f8fafc;
}

.footer {
  text-align: center;
  padding: 1rem;
  background: #2d3748;
  color: #a0aec0;
}

/* 全局样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #2d3748;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2c5aa0;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.metric {
  text-align: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #3182ce;
}

.metric-label {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
}

.code-block {
  background: #1a202c;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.alert-info {
  background: #ebf8ff;
  border: 1px solid #bee3f8;
  color: #2b6cb0;
}

.alert-warning {
  background: #fffbeb;
  border: 1px solid #fed7aa;
  color: #c05621;
}

.alert-success {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #276749;
}
</style>
