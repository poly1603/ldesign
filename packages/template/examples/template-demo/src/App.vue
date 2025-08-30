<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <h1 class="app-title">
          🎨 @ldesign/template 演示项目
        </h1>
        <nav class="app-nav">
          <router-link 
            v-for="route in routes" 
            :key="route.name"
            :to="route.path"
            class="nav-link"
            active-class="nav-link--active"
          >
            {{ route.meta?.title }}
          </router-link>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <footer class="app-footer">
      <div class="container">
        <p>&copy; 2024 ldesign. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const routes = computed(() => 
  router.getRoutes().filter(route => route.meta?.title)
)
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

// Header 样式
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .app-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-align: center;
  }

  .app-nav {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .nav-link {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    &--active {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
  }
}

// Main 样式
.app-main {
  flex: 1;
  padding: 2rem 0;
}

// Footer 样式
.app-footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem 0;
  margin-top: auto;

  p {
    opacity: 0.8;
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式设计
@media (max-width: 768px) {
  .app-header {
    .app-title {
      font-size: 1.4rem;
    }

    .app-nav {
      gap: 1rem;
    }

    .nav-link {
      padding: 0.4rem 0.8rem;
      font-size: 0.9rem;
    }
  }

  .app-main {
    padding: 1rem 0;
  }
}
</style>
