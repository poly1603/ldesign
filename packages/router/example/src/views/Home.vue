<script setup lang="ts">
import { RouterLink } from '@ldesign/router'

const features = [
  {
    icon: '🚀',
    title: '高性能',
    description: '优化的路由匹配算法，快速的导航体验',
  },
  {
    icon: '🔒',
    title: '类型安全',
    description: '完整的 TypeScript 支持，编译时类型检查',
  },
  {
    icon: '🎨',
    title: '丰富插件',
    description: '内置动画、缓存、预加载、性能监控等插件',
  },
  {
    icon: '🛡️',
    title: '路由守卫',
    description: '灵活的路由守卫系统，支持权限控制',
  },
  {
    icon: '📱',
    title: '响应式',
    description: '完美支持移动端，自适应各种屏幕尺寸',
  },
  {
    icon: '⚡',
    title: '懒加载',
    description: '智能的组件懒加载，优化首屏加载速度',
  },
]

const demos = [
  {
    path: '/basic',
    icon: '📝',
    title: '基础路由',
    description: '演示基本的路由导航功能',
  },
  {
    path: '/nested',
    icon: '🏗️',
    title: '嵌套路由',
    description: '展示复杂的嵌套路由结构',
  },
  {
    path: '/dynamic/123',
    icon: '🔄',
    title: '动态路由',
    description: '动态路由参数的使用示例',
  },
  {
    path: '/guards',
    icon: '🛡️',
    title: '路由守卫',
    description: '权限控制和路由拦截演示',
  },
  {
    path: '/lazy',
    icon: '⚡',
    title: '懒加载',
    description: '组件懒加载和代码分割',
  },
  {
    path: '/plugins',
    icon: '🔌',
    title: '插件系统',
    description: '动画、缓存等插件功能展示',
  },
]

const stats = {
  bundleSize: '< 20KB',
  loadTime: '< 50ms',
  features: '20+',
  coverage: '100%',
}
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">@ldesign/router</h1>
      <p class="hero-subtitle">现代化、高性能、类型安全的 Vue 路由库</p>
      <div class="hero-actions">
        <RouterLink to="/basic" class="btn btn-primary btn-lg">
          开始体验
        </RouterLink>
        <a
          href="https://github.com/ldesign/ldesign"
          class="btn btn-secondary btn-lg"
          target="_blank"
        >
          查看源码
        </a>
      </div>
    </div>

    <div class="features">
      <h2 class="section-title">核心特性</h2>
      <div class="feature-grid">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="feature-card"
        >
          <div class="feature-icon">
            {{ feature.icon }}
          </div>
          <h3 class="feature-title">
            {{ feature.title }}
          </h3>
          <p class="feature-description">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>

    <div class="demo-links">
      <h2 class="section-title">功能演示</h2>
      <div class="demo-grid">
        <RouterLink
          v-for="demo in demos"
          :key="demo.path"
          :to="demo.path"
          class="demo-card"
        >
          <div class="demo-icon">
            {{ demo.icon }}
          </div>
          <h3 class="demo-title">
            {{ demo.title }}
          </h3>
          <p class="demo-description">
            {{ demo.description }}
          </p>
        </RouterLink>
      </div>
    </div>

    <div class="stats">
      <h2 class="section-title">性能统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">
            {{ stats.bundleSize }}
          </div>
          <div class="stat-label">打包大小</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">
            {{ stats.loadTime }}
          </div>
          <div class="stat-label">加载时间</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">
            {{ stats.features }}
          </div>
          <div class="stat-label">功能特性</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">
            {{ stats.coverage }}
          </div>
          <div class="stat-label">测试覆盖率</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.home {
  padding: 0;
}

.hero {
  background: linear-gradient(135deg, @primary-color 0%, @secondary-color 100%);
  color: white;
  text-align: center;
  padding: @spacing-2xl @spacing-md;

  &-title {
    font-size: @font-size-3xl;
    font-weight: 700;
    margin-bottom: @spacing-md;
  }

  &-subtitle {
    font-size: @font-size-xl;
    margin-bottom: @spacing-xl;
    opacity: 0.9;
  }

  &-actions {
    display: flex;
    gap: @spacing-md;
    justify-content: center;
    flex-wrap: wrap;
  }
}

.section-title {
  text-align: center;
  font-size: @font-size-2xl;
  font-weight: 600;
  margin-bottom: @spacing-xl;
  color: @gray-800;
}

.features {
  padding: @spacing-2xl @spacing-md;
  background: white;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: @spacing-lg;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: @spacing-lg;
  border-radius: @border-radius-lg;
  background: @gray-50;
  transition: transform @transition-base;

  &:hover {
    transform: translateY(-4px);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: @spacing-md;
  }

  .feature-title {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @spacing-sm;
    color: @gray-800;
  }

  .feature-description {
    color: @gray-600;
    line-height: 1.6;
  }
}

.demo-links {
  padding: @spacing-2xl @spacing-md;
  background: @gray-50;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: @spacing-lg;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: white;
  padding: @spacing-lg;
  border-radius: @border-radius-lg;
  box-shadow: @shadow-md;
  transition: all @transition-base;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: @shadow-xl;
    text-decoration: none;
    color: inherit;
  }

  .demo-icon {
    font-size: 2.5rem;
    margin-bottom: @spacing-md;
  }

  .demo-title {
    font-size: @font-size-lg;
    font-weight: 600;
    margin-bottom: @spacing-sm;
    color: @gray-800;
  }

  .demo-description {
    color: @gray-600;
    line-height: 1.6;
  }
}

.stats {
  padding: @spacing-2xl @spacing-md;
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: @spacing-lg;
  max-width: 800px;
  margin: 0 auto;
}

.stat-card {
  text-align: center;
  padding: @spacing-lg;
  border-radius: @border-radius-lg;
  background: linear-gradient(135deg, @primary-color 0%, @secondary-color 100%);
  color: white;

  .stat-number {
    font-size: @font-size-2xl;
    font-weight: 700;
    margin-bottom: @spacing-xs;
  }

  .stat-label {
    font-size: @font-size-base;
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: @spacing-xl @spacing-md;

    &-title {
      font-size: @font-size-2xl;
    }

    &-subtitle {
      font-size: @font-size-lg;
    }

    &-actions {
      flex-direction: column;
      align-items: center;
    }
  }

  .feature-grid,
  .demo-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
