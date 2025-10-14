<template>
  <div class="home-container">
    <div class="hero">
      <h1 class="hero-title">{{ t('home.title') }}</h1>
      <p class="hero-subtitle">
        {{ t('home.subtitle') }}
      </p>
      <p class="hero-description">
        {{ t('home.description') }}
      </p>
      
      <div class="hero-actions">
        <RouterLink to="/about" class="btn btn-primary">
          {{ t('home.learnMore') }}
        </RouterLink>
        <RouterLink to="/dashboard" class="btn btn-secondary">
          {{ t('home.getStarted') }}
        </RouterLink>
      </div>
    </div>
    
    <div class="features">
      <h2 class="features-title">{{ t('home.features.title') }}</h2>
      
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
        <div class="stat-label">{{ t('home.stats.routes') }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ visitCount }}</div>
        <div class="stat-label">{{ t('home.stats.visits') }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ cacheSize }}KB</div>
        <div class="stat-label">{{ t('home.stats.cacheSize') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from '@ldesign/router'
import { useI18n } from '@/i18n'

const router = useRouter()
const { t } = useI18n()

// Features list with i18n support
const features = computed(() => [
  {
    key: 'performance',
    icon: '⚡',
    title: t('home.features.list.performance'),
    description: t('home.features.list.performanceDesc')
  },
  {
    key: 'modular',
    icon: '📦',
    title: t('home.features.list.modular'),
    description: t('home.features.list.modularDesc')
  },
  {
    key: 'typescript',
    icon: '📝',
    title: t('home.features.list.typescript'),
    description: t('home.features.list.typescriptDesc')
  }
])

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
  margin: 0 0 10px 0;
}

.hero-description {
  font-size: 16px;
  color: #888;
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