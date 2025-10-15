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
          <component :is="feature.icon" class="feature-icon" />
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
import { Zap, Package, FileText } from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()

// Features list with i18n support
const features = computed(() => [
  {
    key: 'performance',
    icon: Zap,
    title: t('home.features.list.performance'),
    description: t('home.features.list.performanceDesc')
  },
  {
    key: 'modular',
    icon: Package,
    title: t('home.features.list.modular'),
    description: t('home.features.list.modularDesc')
  },
  {
    key: 'typescript',
    icon: FileText,
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
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

/* Hero section */
.hero {
  text-align: center;
  padding: 60px 20px;
  background: var(--color-background);
  border-radius: 16px;
  box-shadow: 0 10px 30px var(--color-border-light);
  margin-bottom: 40px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 20px 0;
  color: var(--color-primary-default);
}

.hero-subtitle {
  font-size: 20px;
  color: var(--color-text-secondary);
  margin: 0 0 10px 0;
}

.hero-description {
  font-size: 16px;
  color: var(--color-text-tertiary);
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
  background: linear-gradient(135deg, var(--color-primary-default) 0%, var(--color-primary-active) 100%);
  color: var(--color-gray-50);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px var(--color-primary-300);
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-primary-default);
  border: 2px solid var(--color-primary-default);
}

.btn-secondary:hover {
  background: var(--color-primary-default);
  color: var(--color-gray-50);
}

/* Features display */
.features {
  margin-bottom: 40px;
}

.features-title {
  text-align: center;
  font-size: 36px;
  color: var(--color-text-primary);
  margin: 0 0 40px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.feature-card {
  background: var(--color-background);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 20px var(--color-border-light);
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px var(--color-gray-300);
}

.feature-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  color: var(--color-primary-default);
}

.feature-card h3 {
  font-size: 20px;
  color: var(--color-text-primary);
  margin: 0 0 10px 0;
}

.feature-card p {
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* 统计数据 */
.stats {
  background: var(--color-background);
  border-radius: 12px;
  padding: 40px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 5px 20px var(--color-border-light);
  flex-wrap: wrap;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-primary-default);
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
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