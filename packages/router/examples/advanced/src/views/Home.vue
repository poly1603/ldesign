<script setup lang="ts">
import { RouterLink } from '@ldesign/router'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

async function loginAsAdmin() {
  await userStore.login({
    username: 'admin',
    password: 'password',
  })
}

async function loginAsUser() {
  await userStore.login({
    username: 'user',
    password: 'password',
  })
}
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>@ldesign/router 高级示例</h1>
      <p class="hero-subtitle">
        展示复杂路由配置、状态管理集成、权限控制等高级功能
      </p>

      <div class="hero-actions">
        <RouterLink to="/dashboard" class="btn btn-primary">
          查看仪表板
        </RouterLink>
        <RouterLink to="/admin" class="btn btn-secondary">
          管理后台
        </RouterLink>
      </div>
    </div>

    <div class="features">
      <h2>功能特性</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">
            🔐
          </div>
          <h3>权限控制</h3>
          <p>基于角色的访问控制，支持细粒度权限管理</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            🏗️
          </div>
          <h3>嵌套路由</h3>
          <p>复杂的嵌套路由结构，支持多层级布局</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            ⚡
          </div>
          <h3>懒加载</h3>
          <p>路由级别的代码分割，提升应用性能</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            🎨
          </div>
          <h3>过渡动画</h3>
          <p>流畅的页面切换动画，提升用户体验</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            📊
          </div>
          <h3>状态管理</h3>
          <p>与Pinia深度集成，统一管理应用状态</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            🛡️
          </div>
          <h3>路由守卫</h3>
          <p>完整的路由守卫系统，保护敏感页面</p>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>快速体验</h2>
      <div class="demo-cards">
        <div class="demo-card">
          <h3>用户权限演示</h3>
          <p>体验不同角色的权限控制效果</p>
          <div class="demo-actions">
            <button class="btn btn-primary" @click="loginAsAdmin">
              管理员登录
            </button>
            <button class="btn btn-secondary" @click="loginAsUser">
              普通用户登录
            </button>
          </div>
        </div>

        <div class="demo-card">
          <h3>路由导航演示</h3>
          <p>查看复杂的嵌套路由结构</p>
          <div class="demo-actions">
            <RouterLink to="/user/profile" class="btn btn-primary">
              用户中心
            </RouterLink>
            <RouterLink to="/admin" class="btn btn-secondary">
              管理后台
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 3rem;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.features {
  margin-bottom: 4rem;
}

.features h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
  color: #1f2937;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
}

.demo-section h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
  color: #1f2937;
}

.demo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.demo-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-card h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.demo-card p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.demo-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .demo-cards {
    grid-template-columns: 1fr;
  }

  .demo-actions {
    flex-direction: column;
  }
}
</style>
