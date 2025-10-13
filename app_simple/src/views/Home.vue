<template>
  <div class="home-container">
    <div class="hero">
      <h1 class="hero-title">{{ homeTitle }}</h1>
      <p class="hero-subtitle">
        {{ homeDescription }}
      </p>
      
      <div class="hero-actions">
        <router-link to="/about" class="btn btn-primary">
          {{ commonAbout }}
        </router-link>
        <router-link to="/dashboard" class="btn btn-secondary">
          {{ commonDashboard }}
        </router-link>
      </div>
    </div>
    
    <div class="features">
      <h2 class="features-title">{{ featuresTitle }}</h2>
      
      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.key">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">{{ routeCount }}</div>
        <div class="stat-label">{{ statsRoutes }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ visitCount }}</div>
        <div class="stat-label">{{ statsVisits }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ cacheSize }}KB</div>
        <div class="stat-label">{{ statsCache }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()

// Static text values
const homeTitle = '欢迎使用 LDesign 极简应用'
const homeDescription = '基于 Vue 3 + LDesign Engine 构建的现代化应用'
const commonAbout = '关于'
const commonDashboard = '仪表盘'
const featuresTitle = '核心特性'
const statsRoutes = '路由数量'
const statsVisits = '访问次数'
const statsCache = '缓存大小'

// Features list
const features = [
  {
    key: 'performance',
    icon: '⚡',
    title: '极致性能',
    description: '基于 Vue 3 的响应式系统，提供出色的运行时性能'
  },
  {
    key: 'security',
    icon: '🔒',
    title: '安全可靠',
    description: '内置安全最佳实践，保护您的应用和数据'
  },
  {
    key: 'responsive',
    icon: '📱',
    title: '响应式设计',
    description: '完美适配各种设备，提供一致的用户体验'
  },
  {
    key: 'animation',
    icon: '🎨',
    title: '流畅动画',
    description: '精心设计的动画效果，提升用户交互体验'
  },
  {
    key: 'engine',
    icon: '🚀',
    title: 'LDesign 引擎',
    description: '强大的引擎系统，提供完整的应用架构支持'
  },
  {
    key: 'developer',
    icon: '🛠️',
    title: '开发友好',
    description: '完善的开发工具和文档，让开发更加高效'
  }
]

// Statistics data
const routeCount = ref(0)
const visitCount = ref(0)
const cacheSize = ref(0)

onMounted(() => {
  // Get route count
  routeCount.value = router.getRoutes().length
  
  // Get visit count (from localStorage)
  const visits = parseInt(localStorage.getItem('visitCount') || '0') + 1
  localStorage.setItem('visitCount', visits.toString())
  visitCount.value = visits
  
  // Calculate cache size (example)
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

/* Hero section */
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

/* Features display */
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