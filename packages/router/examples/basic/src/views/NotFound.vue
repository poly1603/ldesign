<template>
  <div class="not-found">
    <div class="error-container">
      <div class="error-code">
        <span class="four">4</span>
        <span class="zero">0</span>
        <span class="four">4</span>
      </div>
      
      <div class="error-message">
        <h1>Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <p class="error-details">
          The requested URL <code>{{ $route.fullPath }}</code> was not found on this server.
        </p>
      </div>
      
      <div class="error-actions">
        <button @click="goHome" class="btn btn-primary">
          🏠 Go Home
        </button>
        
        <button @click="goBack" class="btn btn-secondary">
          ← Go Back
        </button>
        
        <button @click="refresh" class="btn btn-outline">
          🔄 Refresh
        </button>
      </div>
      
      <div class="suggestions">
        <h3>You might be looking for:</h3>
        <div class="suggestion-links">
          <RouterLink to="/" class="suggestion-link">
            🏠 Home Page
          </RouterLink>
          
          <RouterLink to="/about" class="suggestion-link">
            ℹ️ About Us
          </RouterLink>
          
          <RouterLink to="/users" class="suggestion-link">
            👥 Users
          </RouterLink>
          
          <RouterLink to="/products" class="suggestion-link">
            📦 Products
          </RouterLink>
          
          <RouterLink to="/contact" class="suggestion-link">
            📞 Contact
          </RouterLink>
        </div>
      </div>
      
      <div class="debug-info" v-if="showDebugInfo">
        <h3>Debug Information:</h3>
        <div class="debug-details">
          <div class="debug-item">
            <strong>Current Route:</strong>
            <pre>{{ JSON.stringify($route, null, 2) }}</pre>
          </div>
          
          <div class="debug-item">
            <strong>Available Routes:</strong>
            <ul>
              <li v-for="route in availableRoutes" :key="route.path">
                <code>{{ route.path }}</code> - {{ route.name || 'Unnamed' }}
              </li>
            </ul>
          </div>
          
          <div class="debug-item">
            <strong>Navigation History:</strong>
            <p>{{ navigationHistory.length }} entries in history</p>
            <button @click="showHistory = !showHistory" class="btn btn-small">
              {{ showHistory ? 'Hide' : 'Show' }} History
            </button>
            <ul v-if="showHistory">
              <li v-for="(entry, index) in navigationHistory.slice(-5)" :key="index">
                {{ entry }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="toggle-debug">
        <button @click="showDebugInfo = !showDebugInfo" class="btn btn-small">
          {{ showDebugInfo ? 'Hide' : 'Show' }} Debug Info
        </button>
      </div>
    </div>
    
    <div class="floating-elements">
      <div class="floating-element" v-for="n in 6" :key="n" :style="getFloatingStyle(n)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from '@ldesign/router'

const router = useRouter()
const route = useRoute()

// 响应式数据
const showDebugInfo = ref(false)
const showHistory = ref(false)
const navigationHistory = ref<string[]>([])

// 计算属性
const availableRoutes = computed(() => {
  // 模拟可用路由列表
  return [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/users', name: 'Users' },
    { path: '/users/:id', name: 'User' },
    { path: '/products', name: 'Products' },
    { path: '/contact', name: 'Contact' }
  ]
})

// 方法
const goHome = () => {
  addToHistory('Navigated to Home')
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    addToHistory('Went back in history')
    router.back()
  } else {
    // 如果没有历史记录，回到首页
    goHome()
  }
}

const refresh = () => {
  addToHistory('Page refreshed')
  window.location.reload()
}

const addToHistory = (action: string) => {
  const timestamp = new Date().toLocaleTimeString()
  navigationHistory.value.push(`${timestamp}: ${action}`)
  
  // 保持历史记录在合理范围内
  if (navigationHistory.value.length > 20) {
    navigationHistory.value = navigationHistory.value.slice(-20)
  }
}

const getFloatingStyle = (index: number) => {
  const delay = index * 0.5
  const duration = 3 + (index % 3)
  const size = 20 + (index % 4) * 10
  
  return {
    '--delay': `${delay}s`,
    '--duration': `${duration}s`,
    '--size': `${size}px`,
    left: `${10 + (index % 5) * 15}%`,
    top: `${20 + (index % 4) * 20}%`
  }
}

// 生命周期
onMounted(() => {
  addToHistory(`404 error on ${route.value.fullPath}`)
  
  // 记录一些有用的调试信息
  console.group('🚫 404 Error Debug Information')
  console.log('Requested Path:', route.value.fullPath)
  console.log('Route Object:', route.value)
  console.log('Available Routes:', availableRoutes.value)
  console.groupEnd()
})
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.error-container {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: relative;
}

.error-code {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  font-family: 'Courier New', monospace;
}

.error-code span {
  font-size: 8rem;
  font-weight: bold;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin: 0 0.5rem;
  animation: bounce 2s infinite;
}

.four {
  color: #ff6b6b;
}

.zero {
  color: #4ecdc4;
  animation-delay: 0.2s;
}

.error-message h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.error-message p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.error-details {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-family: 'Courier New', monospace;
}

.error-details code {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 2rem 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #4ecdc4;
  color: white;
}

.btn-primary:hover {
  background: #45b7aa;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #ff6b6b;
  color: white;
}

.btn-secondary:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-outline:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-small:hover {
  background: rgba(255, 255, 255, 0.3);
}

.suggestions {
  margin: 2rem 0;
}

.suggestions h3 {
  margin-bottom: 1rem;
  opacity: 0.9;
}

.suggestion-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.suggestion-link {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.suggestion-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.debug-info {
  margin-top: 2rem;
  text-align: left;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.debug-info h3 {
  text-align: center;
  margin-bottom: 1rem;
}

.debug-details {
  max-height: 300px;
  overflow-y: auto;
}

.debug-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-item:last-child {
  border-bottom: none;
}

.debug-item strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #4ecdc4;
}

.debug-item pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
  white-space: pre-wrap;
}

.debug-item ul {
  margin: 0.5rem 0;
  padding-left: 1rem;
}

.debug-item li {
  margin: 0.25rem 0;
}

.debug-item code {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.toggle-debug {
  margin-top: 1rem;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-element {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float var(--duration) ease-in-out infinite var(--delay);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .error-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .error-code span {
    font-size: 4rem;
    margin: 0 0.25rem;
  }
  
  .error-message h1 {
    font-size: 1.8rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .suggestion-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>