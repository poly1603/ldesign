<template>
  <div class="home-container">
    <div class="hero">
      <h1 class="hero-title">欢迎使用 LDesign Router</h1>
      <p class="hero-subtitle">
        一个现代化、高性能、功能丰富的 Vue 3 路由解决方案
      </p>
      
      <div class="hero-actions">
        <router-link to="/about" class="btn btn-primary">
          了解更多
        </router-link>
        <router-link to="/dashboard" class="btn btn-secondary">
          进入仪表盘
        </router-link>
      </div>
    </div>
    
    <div class="features">
      <h2 class="features-title">核心特性</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>高性能</h3>
          <p>智能预取、缓存优化、懒加载等多种性能优化策略</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>安全可靠</h3>
          <p>内置认证守卫、权限控制、XSS 防护等安全功能</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>响应式</h3>
          <p>支持多设备适配，移动端、桌面端、平板端完美适应</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>动画系统</h3>
          <p>丰富的过渡动画效果，让路由切换更加流畅自然</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>Engine 集成</h3>
          <p>与 @ldesign/engine 深度集成，提供完整的应用开发体验</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🛠️</div>
          <h3>开发友好</h3>
          <p>完善的 TypeScript 支持、开发工具、调试面板</p>
        </div>
      </div>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">{{ routeCount }}</div>
        <div class="stat-label">路由数量</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ visitCount }}</div>
        <div class="stat-label">访问次数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ cacheSize }}KB</div>
        <div class="stat-label">缓存大小</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 统计数据
const routeCount = ref(0)
const visitCount = ref(0)
const cacheSize = ref(0)

onMounted(() => {
  // 获取路由数量
  routeCount.value = router.getRoutes().length
  
  // 获取访问次数（从 localStorage 获取）
  const visits = parseInt(localStorage.getItem('visitCount') || '0') + 1
  localStorage.setItem('visitCount', visits.toString())
  visitCount.value = visits
  
  // 计算缓存大小（示例）
  const cacheStr = JSON.stringify(localStorage)
  cacheSize.value = Math.round(new Blob([cacheStr]).size / 1024)
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Hero 区域 */
.hero {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 20px;
  color: #666;
  margin: 0 0 40px 0;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

/* 特性展示 */
.features {
  margin-bottom: 40px;
}

.features-title {
  text-align: center;
  font-size: 36px;
  color: #2c3e50;
  margin: 0 0 40px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.feature-card p {
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* 统计数据 */
.stats {
  background: white;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>