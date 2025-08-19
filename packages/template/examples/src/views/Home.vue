<script setup lang="ts">
import { ref } from 'vue'

const features = [
  {
    title: '🎨 模板画廊',
    description: '浏览所有可用的精美模板，支持实时预览和切换',
    route: '/template-gallery',
    color: '#667eea',
  },
  {
    title: '🪝 Hook 演示',
    description: '使用 useTemplate Hook 进行模板管理',
    route: '/hook-demo',
    color: '#f093fb',
  },
  {
    title: '🧩 组件演示',
    description: '展示 TemplateRenderer 组件的使用方法',
    route: '/component-demo',
    color: '#4facfe',
  },
  {
    title: '📱 响应式切换',
    description: '演示不同设备类型的自动切换功能',
    route: '/device-demo',
    color: '#43e97b',
  },
  {
    title: '🎯 模板选择器',
    description: '智能模板选择器，支持分类筛选、搜索和实时预览',
    route: '/template-selector-demo',
    color: '#fa709a',
  },
]

const stats = ref({
  templates: 9,
  devices: 3,
  categories: 1,
})
</script>

<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">🎨 LDesign Template System</h1>
        <p class="hero-subtitle">强大的模板管理系统，支持多设备、多主题的动态模板切换</p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">{{ stats.templates }}</span>
            <span class="stat-label">个模板</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ stats.devices }}</span>
            <span class="stat-label">种设备</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ stats.categories }}</span>
            <span class="stat-label">个分类</span>
          </div>
        </div>
      </div>
    </div>

    <div class="features">
      <div class="container">
        <h2 class="features-title">功能演示</h2>
        <div class="features-grid">
          <router-link
            v-for="feature in features"
            :key="feature.route"
            :to="feature.route"
            class="feature-card"
            :style="{ '--feature-color': feature.color }"
          >
            <h3 class="feature-title">
              {{ feature.title }}
            </h3>
            <p class="feature-description">
              {{ feature.description }}
            </p>
            <div class="feature-arrow">→</div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero {
  padding: 100px 20px;
  text-align: center;
  color: white;

  &-content {
    max-width: 800px;
    margin: 0 auto;
  }

  &-title {
    font-size: 48px;
    font-weight: 700;
    margin: 0 0 20px 0;
    line-height: 1.2;
  }

  &-subtitle {
    font-size: 20px;
    opacity: 0.9;
    margin: 0 0 40px 0;
    line-height: 1.6;
  }

  &-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 40px;
  }
}

.stat {
  text-align: center;

  &-number {
    display: block;
    font-size: 32px;
    font-weight: 700;
    color: #fff;
  }

  &-label {
    font-size: 14px;
    opacity: 0.8;
  }
}

.features {
  padding: 80px 20px;
  background: #f8f9fa;

  &-title {
    text-align: center;
    font-size: 36px;
    font-weight: 600;
    margin: 0 0 60px 0;
    color: #333;
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--feature-color);
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .feature-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: #333;
  }

  .feature-description {
    font-size: 16px;
    color: #666;
    margin: 0 0 20px 0;
    line-height: 1.6;
  }

  .feature-arrow {
    font-size: 20px;
    color: var(--feature-color);
    font-weight: bold;
    transition: transform 0.3s ease;
  }

  &:hover .feature-arrow {
    transform: translateX(4px);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 60px 20px;

    &-title {
      font-size: 36px;
    }

    &-subtitle {
      font-size: 18px;
    }

    &-stats {
      gap: 20px;
    }
  }

  .stat {
    &-number {
      font-size: 24px;
    }
  }

  .features {
    padding: 60px 20px;

    &-title {
      font-size: 28px;
    }

    &-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }

  .feature-card {
    padding: 24px;
  }
}
</style>
