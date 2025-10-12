<template>
  <div class="about-container">
    <div class="about-content">
      <h1 class="about-title">关于 LDesign Router</h1>
      
      <div class="about-section">
        <h2>📖 项目简介</h2>
        <p>
          LDesign Router 是一个现代化、高性能、功能丰富的 Vue 3 路由解决方案。
          它完全独立于 vue-router，提供了更好的开发体验和性能优化。
        </p>
      </div>
      
      <div class="about-section">
        <h2>🎯 设计目标</h2>
        <ul>
          <li>提供简洁而强大的 API</li>
          <li>优化性能，减少内存占用</li>
          <li>完善的 TypeScript 支持</li>
          <li>与 @ldesign/engine 深度集成</li>
          <li>丰富的功能扩展</li>
        </ul>
      </div>
      
      <div class="about-section">
        <h2>✨ 核心功能</h2>
        <div class="feature-list">
          <div class="feature-item">
            <h3>智能预取</h3>
            <p>基于用户行为和网络条件智能预取路由资源，提升导航速度</p>
          </div>
          <div class="feature-item">
            <h3>缓存管理</h3>
            <p>多级缓存策略，支持内存、会话、本地存储等多种缓存方式</p>
          </div>
          <div class="feature-item">
            <h3>性能监控</h3>
            <p>实时监控路由性能，提供详细的性能报告和优化建议</p>
          </div>
          <div class="feature-item">
            <h3>安全保护</h3>
            <p>内置 XSS、CSRF 防护，支持认证守卫和权限控制</p>
          </div>
        </div>
      </div>
      
      <div class="about-section">
        <h2>🔧 技术栈</h2>
        <div class="tech-stack">
          <span class="tech-badge">Vue 3</span>
          <span class="tech-badge">TypeScript</span>
          <span class="tech-badge">Vite</span>
          <span class="tech-badge">Rollup</span>
          <span class="tech-badge">ESBuild</span>
        </div>
      </div>
      
      <div class="about-section">
        <h2>📊 版本信息</h2>
        <table class="version-table">
          <tbody>
            <tr>
              <td>当前版本</td>
              <td>v1.0.0</td>
            </tr>
            <tr>
              <td>Vue 版本</td>
              <td>v3.4+</td>
            </tr>
            <tr>
              <td>Node 版本</td>
              <td>v16+</td>
            </tr>
            <tr>
              <td>许可证</td>
              <td>MIT</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="about-section">
        <h2>🤝 贡献</h2>
        <p>
          欢迎贡献代码、提交问题或建议。您可以通过以下方式参与项目：
        </p>
        <div class="contribute-links">
          <a href="#" class="contribute-link">GitHub</a>
          <a href="#" class="contribute-link">文档</a>
          <a href="#" class="contribute-link">讨论区</a>
        </div>
      </div>
      
      <div class="about-footer">
        <p>Made with ❤️ by LDesign Team</p>
        <p class="copyright">© 2024 LDesign. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('About page mounted')
})
</script>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.about-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  padding: 40px;
}

.about-title {
  font-size: 36px;
  color: #2c3e50;
  margin: 0 0 40px 0;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.about-section {
  margin-bottom: 40px;
}

.about-section h2 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.about-section p {
  color: #666;
  line-height: 1.8;
  margin: 0 0 15px 0;
}

.about-section ul {
  color: #666;
  line-height: 1.8;
  padding-left: 20px;
}

.about-section li {
  margin-bottom: 10px;
}

/* 功能列表 */
.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-item h3 {
  color: #667eea;
  font-size: 18px;
  margin: 0 0 10px 0;
}

.feature-item p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 技术栈 */
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-badge {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

/* 版本表格 */
.version-table {
  width: 100%;
  border-collapse: collapse;
}

.version-table tr {
  border-bottom: 1px solid #f0f0f0;
}

.version-table td {
  padding: 12px;
  color: #666;
}

.version-table td:first-child {
  font-weight: 600;
  width: 40%;
}

/* 贡献链接 */
.contribute-links {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.contribute-link {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.contribute-link:hover {
  background: #667eea;
  color: white;
}

/* 页脚 */
.about-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.about-footer p {
  color: #999;
  margin: 5px 0;
}

.copyright {
  font-size: 12px;
}

@media (max-width: 768px) {
  .about-content {
    padding: 20px;
  }
  
  .about-title {
    font-size: 28px;
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
  
  .contribute-links {
    flex-direction: column;
  }
}
</style>