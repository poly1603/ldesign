<template>
  <div id="app" :class="{ 'dark-theme': isDark }">
    <main class="container">
      <!-- 头部区域 -->
      <header class="header">
        <div class="logo-section">
          <div class="logo">🚀</div>
          <div>
            <h1 class="title">Vue 2 + @ldesign/launcher</h1>
            <p class="subtitle">现代化的 Vue 2 开发体验</p>
          </div>
        </div>
        <ThemeToggle @toggle-theme="handleThemeToggle" :is-dark="isDark" />
      </header>

      <!-- 主要内容区域 -->
      <section class="hero">
        <h2 class="hero-title">欢迎使用 Vue 2 示例</h2>
        <p class="hero-desc">
          这是一个使用 Vue 2.x 和 @ldesign/launcher 构建的示例项目。<br>
          体验现代开发工具与经典 Vue 框架的完美结合。
        </p>
        
        <div class="demo-area">
          <CounterButton />
        </div>
      </section>

      <!-- 特性展示区域 -->
      <section class="features">
        <h3 class="section-title">项目特性</h3>
        <div class="features-grid">
          <FeatureCard
            v-for="feature in features"
            :key="feature.id"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
          />
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="footer">
        <p>&copy; 2024 @ldesign/launcher Vue 2 示例 - 感谢使用</p>
      </footer>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import CounterButton from './components/CounterButton.vue';
import ThemeToggle from './components/ThemeToggle.vue';
import FeatureCard from './components/FeatureCard.vue';

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export default defineComponent({
  name: 'App',
  components: {
    CounterButton,
    ThemeToggle,
    FeatureCard,
  },
  setup() {
    // 主题状态
    const isDark = ref(false);

    // 主题切换处理
    const handleThemeToggle = (dark: boolean) => {
      isDark.value = dark;
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    };

    // 特性数据
    const features: Feature[] = [
      {
        id: 1,
        icon: '⚡',
        title: 'Vue 2.7+',
        description: '使用最新版本的 Vue 2.x，支持 Composition API 和现代特性。',
      },
      {
        id: 2,
        icon: '🛠️',
        title: 'TypeScript',
        description: '完整的 TypeScript 支持，提供类型安全和出色的开发体验。',
      },
      {
        id: 3,
        icon: '🚀',
        title: 'Vite 驱动',
        description: '基于 Vite 的快速构建工具，享受极速的热重载和构建体验。',
      },
      {
        id: 4,
        icon: '🎨',
        title: 'SCSS 样式',
        description: '内置 SCSS 预处理器支持，编写更强大的样式代码。',
      },
      {
        id: 5,
        icon: '📦',
        title: '零配置',
        description: '开箱即用的配置，专注于业务逻辑而不是工具配置。',
      },
      {
        id: 6,
        icon: '🌙',
        title: '主题系统',
        description: '内置浅色/深色主题切换，提升用户体验。',
      },
    ];

    return {
      isDark,
      features,
      handleThemeToggle,
    };
  },
});
</script>

<style lang="scss" scoped>
#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);

  .logo-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo {
    font-size: 2rem;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.25rem 0;
  }

  .subtitle {
    color: var(--text-secondary);
    margin: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;

    .title {
      font-size: 1.5rem;
    }
  }
}

.hero {
  text-align: center;
  margin-bottom: 4rem;

  .hero-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  .hero-desc {
    font-size: 1.1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .demo-area {
    margin-top: 2rem;
  }
}

.features {
  margin-bottom: 3rem;

  .section-title {
    text-align: center;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 2rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
}

.footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
}
</style>
