<template>
  <div class="home">
    <div class="hero">
      <h1>@ldesign/router 企业级示例</h1>
      <p>展示微前端架构、多租户支持、国际化路由等企业级功能</p>
    </div>

    <div class="features">
      <div class="feature-card">
        <h3>🏢 微前端架构</h3>
        <p>支持模块化开发和独立部署</p>
      </div>
      <div class="feature-card">
        <h3>🌐 多租户支持</h3>
        <p>路由级别的租户隔离</p>
      </div>
      <div class="feature-card">
        <h3>🔐 RBAC权限控制</h3>
        <p>基于角色的访问控制系统</p>
      </div>
      <div class="feature-card">
        <h3>🌍 国际化路由</h3>
        <p>多语言路由和SEO优化</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #1f2937;
}

.feature-card p {
  color: #6b7280;
}
</style>
