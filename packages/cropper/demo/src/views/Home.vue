<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">@ldesign/cropper</h1>
      <p class="hero-subtitle">功能完整的图片裁剪插件演示</p>
      <p class="hero-description">
        支持多种使用方式，提供丰富的裁剪功能和图像处理能力
      </p>
    </div>

    <div class="features">
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>核心功能</h3>
          <ul>
            <li>多种裁剪形状</li>
            <li>灵活比例控制</li>
            <li>实时预览</li>
            <li>丰富的变换操作</li>
          </ul>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>图像处理</h3>
          <ul>
            <li>色彩调节</li>
            <li>滤镜效果</li>
            <li>几何变换</li>
            <li>特效装饰</li>
          </ul>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🖱️</div>
          <h3>交互体验</h3>
          <ul>
            <li>多平台支持</li>
            <li>手势识别</li>
            <li>键盘快捷键</li>
            <li>响应式设计</li>
          </ul>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>性能优化</h3>
          <ul>
            <li>内存管理</li>
            <li>性能监控</li>
            <li>硬件加速</li>
            <li>大图优化</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="usage-examples">
      <h2>使用方式</h2>
      <div class="example-grid">
        <router-link to="/native-js" class="example-card">
          <div class="example-icon">📝</div>
          <h3>原生 JavaScript</h3>
          <p>直接使用 Cropper 类，适合任何前端项目</p>
          <div class="example-arrow">→</div>
        </router-link>

        <router-link to="/vue-component" class="example-card">
          <div class="example-icon">🔧</div>
          <h3>Vue 组件</h3>
          <p>开箱即用的 Vue 组件，完整的功能集成</p>
          <div class="example-arrow">→</div>
        </router-link>

        <router-link to="/vue-hook" class="example-card">
          <div class="example-icon">🎣</div>
          <h3>Vue Hook</h3>
          <p>Composition API Hook，灵活的状态管理</p>
          <div class="example-arrow">→</div>
        </router-link>

        <router-link to="/vue-directive" class="example-card">
          <div class="example-icon">📌</div>
          <h3>Vue 指令</h3>
          <p>简单的指令式使用，最少的代码量</p>
          <div class="example-arrow">→</div>
        </router-link>
      </div>
    </div>

    <div class="quick-start">
      <h2>快速开始</h2>
      <div class="code-block">
        <pre><code># 安装
npm install @ldesign/cropper

# 使用
import { Cropper } from '@ldesign/cropper'

const cropper = new Cropper(container, {
  aspectRatio: 16/9,
  showGrid: true
})</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
// 首页不需要额外的逻辑
console.log('Home page loaded')
</script>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 24px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.hero-description {
  font-size: 16px;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.features {
  margin-bottom: 60px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.feature-card {
  background: white;
  padding: 32px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #333;
}

.feature-card ul {
  list-style: none;
  padding: 0;
}

.feature-card li {
  padding: 4px 0;
  color: #666;
}

.usage-examples {
  margin-bottom: 60px;
}

.usage-examples h2 {
  text-align: center;
  font-size: 32px;
  margin-bottom: 32px;
  color: #333;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.example-card {
  background: white;
  padding: 32px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.example-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.example-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.example-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.example-card h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #333;
}

.example-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.example-arrow {
  font-size: 24px;
  color: #667eea;
  font-weight: bold;
  text-align: right;
}

.quick-start {
  margin-bottom: 40px;
}

.quick-start h2 {
  text-align: center;
  font-size: 32px;
  margin-bottom: 32px;
  color: #333;
}

.code-block {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 24px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  color: #d4d4d4;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero {
    padding: 40px 20px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 20px;
  }
  
  .feature-grid,
  .example-grid {
    grid-template-columns: 1fr;
  }
}
</style>
