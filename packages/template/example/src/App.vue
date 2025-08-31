<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>🎨 LDesign Template</h1>
          <span class="nav-subtitle">示例项目</span>
        </div>

        <div class="nav-links">
          <router-link to="/component" class="nav-link">
            <span class="nav-icon">🎨</span>
            组件方式
          </router-link>
          <router-link to="/hook" class="nav-link">
            <span class="nav-icon">⚡</span>
            Hook 方式
          </router-link>
        </div>

        <!-- 设备类型显示 -->
        <div class="device-indicator">
          <span class="device-label">当前设备:</span>
          <span class="device-type" :class="`device-${currentDevice}`">
            {{ deviceDisplayName }}
          </span>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-container">
        <p>&copy; 2024 LDesign Template. 高性能动态模板管理系统</p>
        <div class="footer-links">
          <a href="https://github.com/ldesign/template" target="_blank">GitHub</a>
          <a href="/docs" target="_blank">文档</a>
          <a href="/docs/api" target="_blank">API</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTemplate } from '@ldesign/template'

// 使用模板管理器 - 提供必需的 options 参数
const { deviceType: currentDevice } = useTemplate({
  category: 'login', // 必需的 category 参数
  autoDetectDevice: true,
  enableCache: true
})

// 设备类型显示名称
const deviceDisplayName = computed(() => {
  const names = {
    desktop: '🖥️ 桌面端',
    tablet: '📱 平板端',
    mobile: '📱 移动端',
  }
  return names[currentDevice.value] || '未知设备'
})
</script>

<style scoped>
/* 全局样式 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 导航栏样式 */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-subtitle {
  font-size: 0.875rem;
  color: #666;
  margin-left: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: #764ba2;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.nav-icon {
  font-size: 1.1rem;
}

.device-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  font-size: 0.875rem;
}

.device-label {
  color: #666;
}

.device-type {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.device-desktop {
  background: #e3f2fd;
  color: #1976d2;
}

.device-tablet {
  background: #f3e5f5;
  color: #7b1fa2;
}

.device-mobile {
  background: #e8f5e8;
  color: #388e3c;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 2rem 0;
}

/* 页脚样式 */
.footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    text-align: center;
  }
  
  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .device-indicator {
    order: 2;
  }
  
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
  
  .main-content {
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
