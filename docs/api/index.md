# API 参考

完整的 LDesign API 文档，包含所有核心包的详细接口说明。

## 📚 核心包 API

### Engine 引擎系统

<div class="api-section">
  <div class="api-header">
    <h3>🚀 @ldesign/engine</h3>
    <span class="api-version">v1.0.0</span>
  </div>
  <div class="api-description">
    <p>LDesign 核心引擎，提供插件系统、中间件、事件管理等基础功能。</p>
  </div>
  <div class="api-links">
    <a href="/api/engine/" class="api-link">完整文档</a>
    <a href="/api/engine/quick-start" class="api-link">快速开始</a>
    <a href="/examples/engine" class="api-link">示例代码</a>
  </div>
  <div class="api-preview">
    <h4>主要接口</h4>
    <ul>
      <li><code>Engine</code> - 核心引擎类</li>
      <li><code>Plugin</code> - 插件基类</li>
      <li><code>Middleware</code> - 中间件接口</li>
      <li><code>EventBus</code> - 事件总线</li>
      <li><code>PerformanceMonitor</code> - 性能监控</li>
    </ul>
  </div>
</div>

### Router 路由系统

<div class="api-section">
  <div class="api-header">
    <h3>🛣️ @ldesign/router</h3>
    <span class="api-version">v1.0.0</span>
  </div>
  <div class="api-description">
    <p>强大的路由系统，支持动态路由、守卫、懒加载等高级功能。</p>
  </div>
  <div class="api-links">
    <a href="/api/router/" class="api-link">完整文档</a>
    <a href="/api/router/quick-start" class="api-link">快速开始</a>
    <a href="/examples/router" class="api-link">示例代码</a>
  </div>
  <div class="api-preview">
    <h4>主要接口</h4>
    <ul>
      <li><code>Router</code> - 路由器类</li>
      <li><code>Route</code> - 路由配置</li>
      <li><code>NavigationGuard</code> - 导航守卫</li>
      <li><code>RouteCache</code> - 路由缓存</li>
      <li><code>DynamicRouter</code> - 动态路由</li>
    </ul>
  </div>
</div>

### HTTP 客户端

<div class="api-section">
  <div class="api-header">
    <h3>🌐 @ldesign/http</h3>
    <span class="api-version">v1.0.0</span>
  </div>
  <div class="api-description">
    <p>功能丰富的HTTP客户端，支持拦截器、缓存、重试等企业级特性。</p>
  </div>
  <div class="api-links">
    <a href="/api/http/" class="api-link">完整文档</a>
    <a href="/api/http/quick-start" class="api-link">快速开始</a>
    <a href="/examples/http" class="api-link">示例代码</a>
  </div>
  <div class="api-preview">
    <h4>主要接口</h4>
    <ul>
      <li><code>HttpClient</code> - HTTP客户端</li>
      <li><code>Interceptor</code> - 拦截器</li>
      <li><code>CacheManager</code> - 缓存管理</li>
      <li><code>RetryPolicy</code> - 重试策略</li>
      <li><code>RequestQueue</code> - 请求队列</li>
    </ul>
  </div>
</div>

### Crypto 加密工具

<div class="api-section">
  <div class="api-header">
    <h3>🔐 @ldesign/crypto</h3>
    <span class="api-version">v1.0.0</span>
  </div>
  <div class="api-description">
    <p>全面的加密解决方案，支持对称加密、非对称加密、哈希算法等。</p>
  </div>
  <div class="api-links">
    <a href="/api/crypto/" class="api-link">完整文档</a>
    <a href="/api/crypto/quick-start" class="api-link">快速开始</a>
    <a href="/examples/crypto" class="api-link">示例代码</a>
  </div>
  <div class="api-preview">
    <h4>主要接口</h4>
    <ul>
      <li><code>AESCrypto</code> - AES加密</li>
      <li><code>RSACrypto</code> - RSA加密</li>
      <li><code>HashManager</code> - 哈希算法</li>
      <li><code>DigitalSignature</code> - 数字签名</li>
      <li><code>RandomGenerator</code> - 随机数生成</li>
    </ul>
  </div>
</div>

### Device 设备检测

<div class="api-section">
  <div class="api-header">
    <h3>📱 @ldesign/device</h3>
    <span class="api-version">v1.0.0</span>
  </div>
  <div class="api-description">
    <p>设备信息检测和传感器访问，支持多种设备类型和传感器。</p>
  </div>
  <div class="api-links">
    <a href="/api/device/" class="api-link">完整文档</a>
    <a href="/api/device/quick-start" class="api-link">快速开始</a>
    <a href="/examples/device" class="api-link">示例代码</a>
  </div>
  <div class="api-preview">
    <h4>主要接口</h4>
    <ul>
      <li><code>DeviceDetector</code> - 设备检测</li>
      <li><code>SensorManager</code> - 传感器管理</li>
      <li><code>NetworkMonitor</code> - 网络监控</li>
      <li><code>BatteryManager</code> - 电池管理</li>
      <li><code>ScreenManager</code> - 屏幕管理</li>
    </ul>
  </div>
</div>

### Template 模板系统

<div class="api-section">
  <div class="api-header">
    <h3>🎨 @ldesign/template</h3>
    <span class="api-version">v1.0.0</span>
  </div>
  <div class="api-description">
    <p>灵活的模板系统，支持动态模板、设备适配、主题切换等功能。</p>
  </div>
  <div class="api-links">
    <a href="/api/template/" class="api-link">完整文档</a>
    <a href="/api/template/quick-start" class="api-link">快速开始</a>
    <a href="/examples/template" class="api-link">示例代码</a>
  </div>
  <div class="api-preview">
    <h4>主要接口</h4>
    <ul>
      <li><code>TemplateManager</code> - 模板管理器</li>
      <li><code>TemplateCompiler</code> - 模板编译器</li>
      <li><code>TemplateCache</code> - 模板缓存</li>
      <li><code>DeviceAdapter</code> - 设备适配器</li>
      <li><code>ThemeManager</code> - 主题管理</li>
    </ul>
  </div>
</div>

### Color 颜色系统

<div class="api-section">
  <div class="api-header">
    <h3>🌈 @ldesign/color</h3>
    <span class="api-version">v1.0.0</span>
  </div>
  <div class="api-description">
    <p>专业的颜色管理系统，支持颜色转换、主题生成、暗色模式等。</p>
  </div>
  <div class="api-links">
    <a href="/api/color/" class="api-link">完整文档</a>
    <a href="/api/color/quick-start" class="api-link">快速开始</a>
    <a href="/examples/color" class="api-link">示例代码</a>
  </div>
  <div class="api-preview">
    <h4>主要接口</h4>
    <ul>
      <li><code>ColorManager</code> - 颜色管理器</li>
      <li><code>ColorConverter</code> - 颜色转换</li>
      <li><code>ThemeGenerator</code> - 主题生成器</li>
      <li><code>ContrastChecker</code> - 对比度检查</li>
      <li><code>ColorMixer</code> - 颜色混合</li>
    </ul>
  </div>
</div>

### I18n 国际化

<div class="api-section">
  <div class="api-header">
    <h3>🌍 @ldesign/i18n</h3>
    <span class="api-version">v1.0.0</span>
  </div>
  <div class="api-description">
    <p>完整的国际化解决方案，支持多语言、动态切换、本地化等功能。</p>
  </div>
  <div class="api-links">
    <a href="/api/i18n/" class="api-link">完整文档</a>
    <a href="/api/i18n/quick-start" class="api-link">快速开始</a>
    <a href="/examples/i18n" class="api-link">示例代码</a>
  </div>
  <div class="api-preview">
    <h4>主要接口</h4>
    <ul>
      <li><code>I18nManager</code> - 国际化管理器</li>
      <li><code>Translator</code> - 翻译器</li>
      <li><code>LocaleDetector</code> - 语言检测</li>
      <li><code>MessageFormatter</code> - 消息格式化</li>
      <li><code>DateTimeFormatter</code> - 日期时间格式化</li>
    </ul>
  </div>
</div>

## 🔍 API 搜索

<div class="api-search">
  <div class="search-container">
    <input type="text" id="api-search" placeholder="搜索 API..." />
    <button onclick="searchAPI()">搜索</button>
  </div>
  <div id="search-results" class="search-results">
    <!-- 搜索结果将在这里显示 -->
  </div>
</div>

## 📖 使用指南

### 快速查找

<div class="quick-find">
  <div class="find-section">
    <h4>按功能查找</h4>
    <div class="find-tags">
      <span class="find-tag" onclick="filterByTag('authentication')">用户认证</span>
      <span class="find-tag" onclick="filterByTag('routing')">路由导航</span>
      <span class="find-tag" onclick="filterByTag('http')">网络请求</span>
      <span class="find-tag" onclick="filterByTag('encryption')">数据加密</span>
      <span class="find-tag" onclick="filterByTag('device')">设备检测</span>
      <span class="find-tag" onclick="filterByTag('template')">模板渲染</span>
      <span class="find-tag" onclick="filterByTag('color')">颜色管理</span>
      <span class="find-tag" onclick="filterByTag('i18n')">国际化</span>
    </div>
  </div>
  
  <div class="find-section">
    <h4>按使用场景查找</h4>
    <div class="find-tags">
      <span class="find-tag" onclick="filterByScenario('spa')">单页应用</span>
      <span class="find-tag" onclick="filterByScenario('mobile')">移动端</span>
      <span class="find-tag" onclick="filterByScenario('enterprise')">企业应用</span>
      <span class="find-tag" onclick="filterByScenario('ecommerce')">电商平台</span>
      <span class="find-tag" onclick="filterByScenario('dashboard')">管理后台</span>
      <span class="find-tag" onclick="filterByScenario('pwa')">PWA应用</span>
    </div>
  </div>
</div>

### 常用代码片段

<div class="code-snippets">
  <div class="snippet">
    <h4>初始化引擎</h4>
    <pre><code class="language-typescript">import { Engine } from '@ldesign/engine'

const engine = new Engine({
  debug: true,
  performance: {
    monitoring: true,
    threshold: 100
  }
})

engine.start()</code></pre>
  </div>
  
  <div class="snippet">
    <h4>配置路由</h4>
    <pre><code class="language-typescript">import { Router } from '@ldesign/router'

const router = new Router({
  routes: [
    {
      path: '/',
      component: () => import('./Home.vue')
    },
    {
      path: '/about',
      component: () => import('./About.vue')
    }
  ]
})</code></pre>
  </div>
  
  <div class="snippet">
    <h4>HTTP请求</h4>
    <pre><code class="language-typescript">import { HttpClient } from '@ldesign/http'

const http = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 5000
})

const data = await http.get('/users')</code></pre>
  </div>
  
  <div class="snippet">
    <h4>数据加密</h4>
    <pre><code class="language-typescript">import { AESCrypto } from '@ldesign/crypto'

const crypto = new AESCrypto('your-secret-key')
const encrypted = crypto.encrypt('sensitive data')
const decrypted = crypto.decrypt(encrypted)</code></pre>
  </div>
</div>

## 📚 类型定义

### 通用类型

<div class="type-definitions">
  <div class="type-section">
    <h4>配置类型</h4>
    <pre><code class="language-typescript">interface EngineConfig {
  debug?: boolean
  performance?: PerformanceConfig
  plugins?: Plugin[]
  middleware?: Middleware[]
}

interface PerformanceConfig {
  monitoring?: boolean
  threshold?: number
  sampling?: number
}</code></pre>
  </div>
  
  <div class="type-section">
    <h4>事件类型</h4>
    <pre><code class="language-typescript">interface EventData {
  type: string
  payload?: any
  timestamp?: number
}

type EventHandler<T = any> = (data: T) => void | Promise<void>

interface EventBusOptions {
  maxListeners?: number
  async?: boolean
}</code></pre>
  </div>
  
  <div class="type-section">
    <h4>路由类型</h4>
    <pre><code class="language-typescript">interface RouteConfig {
  path: string
  component?: Component | (() => Promise<Component>)
  children?: RouteConfig[]
  meta?: RouteMeta
  beforeEnter?: NavigationGuard
}

interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
}</code></pre>
  </div>
</div>

## 🔗 相关链接

<div class="related-links">
  <div class="link-section">
    <h4>开发资源</h4>
    <ul>
      <li><a href="/guide/getting-started">快速开始</a></li>
      <li><a href="/examples/">示例项目</a></li>
      <li><a href="/best-practices/">最佳实践</a></li>
      <li><a href="/troubleshooting/">问题排查</a></li>
    </ul>
  </div>
  
  <div class="link-section">
    <h4>社区支持</h4>
    <ul>
      <li><a href="https://github.com/ldesign-org/ldesign/discussions">GitHub 讨论</a></li>
      <li><a href="https://discord.gg/ldesign">Discord 社区</a></li>
      <li><a href="https://stackoverflow.com/questions/tagged/ldesign">Stack Overflow</a></li>
      <li><a href="/contributing/">贡献指南</a></li>
    </ul>
  </div>
  
  <div class="link-section">
    <h4>工具和扩展</h4>
    <ul>
      <li><a href="https://marketplace.visualstudio.com/items?itemName=ldesign.vscode">VS Code 扩展</a></li>
      <li><a href="https://chrome.google.com/webstore/detail/ldesign-devtools">开发者工具</a></li>
      <li><a href="/cli/">命令行工具</a></li>
      <li><a href="/templates/">项目模板</a></li>
    </ul>
  </div>
</div>

<style>
.api-section {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  background: white;
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.api-header h3 {
  margin: 0;
  color: #1890ff;
  font-size: 1.3rem;
}

.api-version {
  background: #f0f0f0;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.api-description {
  margin: 16px 0;
}

.api-description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.api-links {
  display: flex;
  gap: 12px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.api-link {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.api-link:hover {
  background: #40a9ff;
}

.api-preview {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.api-preview h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1rem;
}

.api-preview ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.api-preview li {
  padding: 4px 0;
  color: #666;
}

.api-preview code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Consolas', monospace;
  color: #1890ff;
}

.api-search {
  margin: 32px 0;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
}

.search-container {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

#api-search {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 16px;
}

.search-container button {
  padding: 12px 24px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.search-container button:hover {
  background: #40a9ff;
}

.search-results {
  display: none;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.quick-find {
  margin: 32px 0;
}

.find-section {
  margin: 24px 0;
}

.find-section h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.find-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.find-tag {
  padding: 6px 12px;
  background: #f0f0f0;
  color: #666;
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.find-tag:hover {
  background: #1890ff;
  color: white;
}

.code-snippets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 32px 0;
}

.snippet {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.snippet h4 {
  margin: 0;
  padding: 12px 16px;
  background: #f8f9fa;
  color: #333;
  font-size: 1rem;
  border-bottom: 1px solid #e8e8e8;
}

.snippet pre {
  margin: 0;
  padding: 16px;
  background: #fafafa;
  overflow-x: auto;
}

.snippet code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.type-definitions {
  margin: 32px 0;
}

.type-section {
  margin: 24px 0;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.type-section h4 {
  margin: 0;
  padding: 12px 16px;
  background: #f8f9fa;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
}

.type-section pre {
  margin: 0;
  padding: 16px;
  background: #fafafa;
  overflow-x: auto;
}

.related-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin: 32px 0;
}

.link-section {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.link-section h4 {
  margin: 0 0 16px 0;
  color: #1890ff;
}

.link-section ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.link-section li {
  margin: 8px 0;
}

.link-section a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.link-section a:hover {
  color: #1890ff;
}

@media (max-width: 768px) {
  .api-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .api-links {
    flex-direction: column;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .find-tags {
    flex-direction: column;
  }
  
  .code-snippets {
    grid-template-columns: 1fr;
  }
  
  .related-links {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
function searchAPI() {
  const query = document.getElementById('api-search').value
  const results = document.getElementById('search-results')
  
  if (!query.trim()) {
    results.style.display = 'none'
    return
  }
  
  results.style.display = 'block'
  results.innerHTML = '<p>正在搜索...</p>'
  
  // 模拟搜索
  setTimeout(() => {
    results.innerHTML = `
      <h4>搜索结果: "${query}"</h4>
      <div class="search-result">
        <h5>Engine.start()</h5>
        <p>启动 LDesign 引擎实例</p>
        <a href="/api/engine/start">查看详情</a>
      </div>
      <div class="search-result">
        <h5>Router.navigate()</h5>
        <p>程序化导航到指定路由</p>
        <a href="/api/router/navigate">查看详情</a>
      </div>
    `
  }, 500)
}

function filterByTag(tag) {
  console.log('Filter by tag:', tag)
  // 实现标签过滤逻辑
}

function filterByScenario(scenario) {
  console.log('Filter by scenario:', scenario)
  // 实现场景过滤逻辑
}

// 搜索框回车事件
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('api-search')
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchAPI()
      }
    })
  }
})
</script>