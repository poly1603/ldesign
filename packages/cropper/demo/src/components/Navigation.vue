<template>
  <nav class="navigation">
    <div class="nav-container">
      <div class="nav-brand">
        <h1>@ldesign/cropper</h1>
        <span class="nav-subtitle">图片裁剪插件演示</span>
      </div>
      
      <div class="nav-links">
        <router-link 
          v-for="route in routes" 
          :key="route.name"
          :to="route.path"
          class="nav-link"
          :class="{ active: $route.name === route.name }"
        >
          {{ route.meta.title }}
        </router-link>
      </div>
      
      <div class="nav-mobile-toggle" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    
    <div class="nav-mobile-menu" :class="{ open: mobileMenuOpen }">
      <router-link 
        v-for="route in routes" 
        :key="route.name"
        :to="route.path"
        class="nav-mobile-link"
        @click="closeMobileMenu"
      >
        {{ route.meta.title }}
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mobileMenuOpen = ref(false)

const routes = [
  { name: 'Home', path: '/', meta: { title: '首页' } },
  { name: 'NativeJS', path: '/native-js', meta: { title: '原生 JS' } },
  { name: 'VueComponent', path: '/vue-component', meta: { title: 'Vue 组件' } },
  { name: 'VueHook', path: '/vue-hook', meta: { title: 'Vue Hook' } },
  { name: 'VueDirective', path: '/vue-directive', meta: { title: 'Vue 指令' } }
]

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<style scoped>
.navigation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-brand h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.nav-subtitle {
  font-size: 12px;
  opacity: 0.8;
  margin-left: 8px;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-mobile-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 5px;
}

.nav-mobile-toggle span {
  width: 25px;
  height: 3px;
  background: white;
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 2px;
}

.nav-mobile-menu {
  display: none;
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px;
}

.nav-mobile-link {
  display: block;
  color: white;
  text-decoration: none;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
}

.nav-mobile-link:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .nav-mobile-toggle {
    display: flex;
  }
  
  .nav-mobile-menu {
    display: block;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
  
  .nav-mobile-menu.open {
    max-height: 300px;
  }
  
  .nav-brand h1 {
    font-size: 20px;
  }
  
  .nav-subtitle {
    display: none;
  }
}
</style>
