<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- 左侧信息 -->
      <div class="footer-left">
        <div class="footer-brand">
          <span class="brand-name">@ldesign/router</span>
          <span class="brand-version">v{{ version }}</span>
        </div>
        <p class="footer-description">
          现代化、高性能、类型安全的 Vue 路由库
        </p>
      </div>

      <!-- 中间链接 -->
      <div class="footer-center">
        <div class="footer-links">
          <div class="link-group">
            <h4 class="link-title">文档</h4>
            <ul class="link-list">
              <li><a href="#" class="footer-link">快速开始</a></li>
              <li><a href="#" class="footer-link">API 参考</a></li>
              <li><a href="#" class="footer-link">最佳实践</a></li>
              <li><a href="#" class="footer-link">迁移指南</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">社区</h4>
            <ul class="link-list">
              <li><a href="#" class="footer-link">GitHub</a></li>
              <li><a href="#" class="footer-link">问题反馈</a></li>
              <li><a href="#" class="footer-link">讨论区</a></li>
              <li><a href="#" class="footer-link">更新日志</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">相关项目</h4>
            <ul class="link-list">
              <li><a href="#" class="footer-link">LDesign Engine</a></li>
              <li><a href="#" class="footer-link">LDesign Device</a></li>
              <li><a href="#" class="footer-link">LDesign Template</a></li>
              <li><a href="#" class="footer-link">LDesign Builder</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 右侧统计 -->
      <div class="footer-right">
        <div class="footer-stats">
          <div class="stat-item">
            <span class="stat-label">当前路由:</span>
            <span class="stat-value">{{ currentRoute }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">页面加载时间:</span>
            <span class="stat-value">{{ loadTime }}ms</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">设备类型:</span>
            <span class="stat-value">{{ deviceType }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">浏览器:</span>
            <span class="stat-value">{{ browserInfo }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="footer-bottom">
      <div class="footer-container">
        <div class="footer-copyright">
          <p class="copyright-text">
            © {{ currentYear }} LDesign Team. All rights reserved.
          </p>
          <p class="build-info">
            构建时间: {{ buildTime }} | 
            环境: {{ environment }} | 
            版本: {{ version }}
          </p>
        </div>
        
        <div class="footer-social">
          <a href="#" class="social-link" title="GitHub">
            <span class="social-icon">📦</span>
          </a>
          <a href="#" class="social-link" title="Twitter">
            <span class="social-icon">🐦</span>
          </a>
          <a href="#" class="social-link" title="Discord">
            <span class="social-icon">💬</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from '@ldesign/router'

/**
 * 应用底部组件
 * 
 * 功能特性：
 * 1. 项目信息展示
 * 2. 链接导航
 * 3. 实时统计信息
 * 4. 响应式布局
 */

// 路由相关
const route = useRoute()

// 响应式状态
const loadTime = ref(0)
const deviceType = ref('desktop')

// 版本信息
const version = '1.0.0'
const environment = import.meta.env.MODE

// 计算属性
const currentYear = computed(() => new Date().getFullYear())

const currentRoute = computed(() => route.path)

const buildTime = computed(() => {
  return new Date().toLocaleString('zh-CN')
})

const browserInfo = computed(() => {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Unknown'
})

// 方法
const detectDevice = () => {
  const width = window.innerWidth
  if (width < 768) {
    deviceType.value = 'Mobile'
  } else if (width < 1024) {
    deviceType.value = 'Tablet'
  } else {
    deviceType.value = 'Desktop'
  }
}

const calculateLoadTime = () => {
  if (performance && performance.timing) {
    const timing = performance.timing
    loadTime.value = timing.loadEventEnd - timing.navigationStart
  }
}

// 生命周期
onMounted(() => {
  detectDevice()
  calculateLoadTime()
  
  // 监听窗口大小变化
  window.addEventListener('resize', detectDevice)
})
</script>

<style lang="less" scoped>
.app-footer {
  background-color: var(--ldesign-gray-color-10);
  color: var(--ldesign-font-white-2);
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-padding-base);
}

// 主要内容区域
.app-footer > .footer-container {
  .flex-between();
  padding-top: var(--ls-padding-xxl);
  padding-bottom: var(--ls-padding-lg);
  gap: var(--ls-spacing-xxl);
}

// 左侧品牌信息
.footer-left {
  flex: 1;
  
  .footer-brand {
    .flex-center();
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-margin-base);
    
    .brand-name {
      font-size: var(--ls-font-size-lg);
      font-weight: 600;
      color: var(--ldesign-font-white-1);
    }
    
    .brand-version {
      font-size: var(--ls-font-size-sm);
      padding: 2px 8px;
      background-color: var(--ldesign-brand-color);
      color: white;
      .border-radius(12px);
    }
  }
  
  .footer-description {
    font-size: var(--ls-font-size-sm);
    line-height: 1.6;
    margin: 0;
    max-width: 300px;
  }
}

// 中间链接区域
.footer-center {
  flex: 2;
  
  .footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--ls-spacing-xl);
  }
  
  .link-group {
    .link-title {
      font-size: var(--ls-font-size-base);
      font-weight: 600;
      color: var(--ldesign-font-white-1);
      margin: 0 0 var(--ls-margin-base) 0;
    }
    
    .link-list {
      list-style: none;
      margin: 0;
      padding: 0;
      
      li {
        margin-bottom: var(--ls-margin-sm);
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .footer-link {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-font-white-3);
      .transition();
      
      &:hover {
        color: var(--ldesign-font-white-1);
      }
    }
  }
}

// 右侧统计信息
.footer-right {
  flex: 1;
  
  .footer-stats {
    .stat-item {
      .flex-between();
      margin-bottom: var(--ls-margin-sm);
      font-size: var(--ls-font-size-xs);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .stat-label {
        color: var(--ldesign-font-white-3);
      }
      
      .stat-value {
        color: var(--ldesign-font-white-1);
        font-weight: 500;
      }
    }
  }
}

// 底部版权区域
.footer-bottom {
  border-top: 1px solid var(--ldesign-gray-color-8);
  padding: var(--ls-padding-base) 0;
  
  .footer-container {
    .flex-between();
    gap: var(--ls-spacing-base);
  }
  
  .footer-copyright {
    .copyright-text {
      font-size: var(--ls-font-size-sm);
      margin: 0 0 var(--ls-margin-xs) 0;
      color: var(--ldesign-font-white-2);
    }
    
    .build-info {
      font-size: var(--ls-font-size-xs);
      margin: 0;
      color: var(--ldesign-font-white-4);
    }
  }
  
  .footer-social {
    .flex-center();
    gap: var(--ls-spacing-sm);
    
    .social-link {
      .flex-center();
      width: 36px;
      height: 36px;
      .border-radius(50%);
      background-color: var(--ldesign-gray-color-8);
      .transition();
      
      &:hover {
        background-color: var(--ldesign-brand-color);
        transform: translateY(-2px);
      }
      
      .social-icon {
        font-size: var(--ls-font-size-base);
      }
    }
  }
}

// 响应式设计
.mobile({
  .app-footer > .footer-container {
    .flex-column();
    gap: var(--ls-spacing-lg);
    text-align: center;
  }
  
  .footer-center {
    .footer-links {
      grid-template-columns: 1fr;
      gap: var(--ls-spacing-lg);
    }
  }
  
  .footer-right {
    .footer-stats {
      .stat-item {
        justify-content: center;
        gap: var(--ls-spacing-sm);
      }
    }
  }
  
  .footer-bottom {
    .footer-container {
      .flex-column();
      text-align: center;
      gap: var(--ls-spacing-base);
    }
  }
});

.tablet({
  .footer-center {
    .footer-links {
      grid-template-columns: repeat(2, 1fr);
    }
  }
});
</style>
