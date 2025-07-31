<template>
  <div class="home">
    <div class="home__hero">
      <div class="home__hero-content">
        <h1 class="home__title">🎨 LDesign 模板系统</h1>
        <p class="home__subtitle">
          新一代模板系统 - 简洁、强大、易用
        </p>
        <p class="home__description">
          支持多设备响应式设计，提供丰富的模板选择，让您的应用界面更加美观和专业。
        </p>
        
        <div class="home__features">
          <div class="home__feature">
            <div class="home__feature-icon">📱</div>
            <h3>响应式设计</h3>
            <p>自动适配桌面、平板、手机等不同设备</p>
          </div>
          <div class="home__feature">
            <div class="home__feature-icon">🎯</div>
            <h3>易于使用</h3>
            <p>简洁的API设计，快速上手</p>
          </div>
          <div class="home__feature">
            <div class="home__feature-icon">🔧</div>
            <h3>高度可定制</h3>
            <p>丰富的配置选项，满足各种需求</p>
          </div>
        </div>

        <div class="home__actions">
          <router-link to="/hook-demo" class="home__btn home__btn--primary">
            开始体验
          </router-link>
          <router-link to="/template-gallery" class="home__btn home__btn--secondary">
            浏览模板
          </router-link>
        </div>
      </div>
    </div>

    <div class="home__demos">
      <div class="home__container">
        <h2 class="home__section-title">演示功能</h2>
        <div class="home__demo-grid">
          <router-link to="/hook-demo" class="home__demo-card">
            <div class="home__demo-icon">🪝</div>
            <h3>useTemplate Hook</h3>
            <p>使用 Composition API 风格的 Hook 进行模板管理</p>
            <div class="home__demo-arrow">→</div>
          </router-link>

          <router-link to="/component-demo" class="home__demo-card">
            <div class="home__demo-icon">🧩</div>
            <h3>TemplateRenderer 组件</h3>
            <p>使用声明式组件快速渲染模板</p>
            <div class="home__demo-arrow">→</div>
          </router-link>

          <router-link to="/device-demo" class="home__demo-card">
            <div class="home__demo-icon">📱</div>
            <h3>响应式设备切换</h3>
            <p>体验自动设备检测和模板切换功能</p>
            <div class="home__demo-arrow">→</div>
          </router-link>

          <router-link to="/template-gallery" class="home__demo-card">
            <div class="home__demo-icon">🎨</div>
            <h3>模板画廊</h3>
            <p>浏览所有可用的精美模板</p>
            <div class="home__demo-arrow">→</div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="home__footer">
      <div class="home__container">
        <p>&copy; 2024 LDesign Template System. 让界面设计更简单。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑
console.log('🏠 LDesign Template System - 首页加载')
</script>

<style scoped lang="less">
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &__hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    padding: 40px 20px;
  }

  &__hero-content {
    max-width: 800px;
  }

  &__title {
    font-size: 64px;
    font-weight: 700;
    margin: 0 0 20px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    animation: fadeInUp 1s ease-out;
  }

  &__subtitle {
    font-size: 24px;
    margin: 0 0 16px 0;
    opacity: 0.9;
    animation: fadeInUp 1s ease-out 0.2s both;
  }

  &__description {
    font-size: 18px;
    margin: 0 0 40px 0;
    opacity: 0.8;
    line-height: 1.6;
    animation: fadeInUp 1s ease-out 0.4s both;
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin: 60px 0;
    animation: fadeInUp 1s ease-out 0.6s both;
  }

  &__feature {
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    h3 {
      font-size: 20px;
      margin: 16px 0 8px 0;
      font-weight: 600;
    }

    p {
      font-size: 14px;
      opacity: 0.8;
      margin: 0;
      line-height: 1.5;
    }
  }

  &__feature-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  &__actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
    animation: fadeInUp 1s ease-out 0.8s both;
  }

  &__btn {
    padding: 16px 32px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    display: inline-block;

    &--primary {
      background: white;
      color: #667eea;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
      }
    }

    &--secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }
    }
  }

  &__demos {
    background: white;
    padding: 80px 0;
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  &__section-title {
    text-align: center;
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 60px 0;
    color: #333;
  }

  &__demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }

  &__demo-card {
    background: white;
    border-radius: 16px;
    padding: 30px;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      border-color: #667eea;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 16px 0 12px 0;
      color: #333;
    }

    p {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
  }

  &__demo-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  &__demo-arrow {
    font-size: 20px;
    color: #667eea;
    font-weight: bold;
    position: absolute;
    bottom: 20px;
    right: 30px;
    transition: transform 0.3s ease;
  }

  &__demo-card:hover &__demo-arrow {
    transform: translateX(4px);
  }

  &__footer {
    background: #333;
    color: white;
    padding: 40px 0;
    text-align: center;

    p {
      margin: 0;
      opacity: 0.8;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home {
    &__title {
      font-size: 48px;
    }

    &__subtitle {
      font-size: 20px;
    }

    &__description {
      font-size: 16px;
    }

    &__features {
      grid-template-columns: 1fr;
      gap: 20px;
      margin: 40px 0;
    }

    &__actions {
      flex-direction: column;
      align-items: center;
    }

    &__btn {
      width: 100%;
      max-width: 300px;
      text-align: center;
    }

    &__demo-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    &__section-title {
      font-size: 28px;
    }
  }
}
</style>
