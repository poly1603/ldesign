# 核心功能包

LDesign 的核心功能包提供了构建现代 Web 应用所需的基础设施。每个包都经过精心设计，可以独立使用，也可以相互配合。

## 包分类

### 🗄️ 数据管理

<div class="package-grid">
  <div class="package-card">
    <h3><a href="/packages/cache/">@ldesign/cache</a></h3>
    <p class="version">v0.2.0</p>
    <p>智能缓存管理器，支持多存储引擎、跨标签页同步、性能优化</p>
    <div class="features">
      <span class="badge">localStorage</span>
      <span class="badge">IndexedDB</span>
      <span class="badge">Vue 3</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/store/">@ldesign/store</a></h3>
    <p class="version">v1.0.0</p>
    <p>基于 Pinia 的状态管理库，支持多种编程范式和装饰器</p>
    <div class="features">
      <span class="badge">Pinia</span>
      <span class="badge">装饰器</span>
      <span class="badge">TypeScript</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/storage/">@ldesign/storage</a></h3>
    <p class="version">v0.1.0</p>
    <p>统一的存储抽象层，支持本地和云端存储</p>
    <div class="features">
      <span class="badge">抽象层</span>
      <span class="badge">云存储</span>
    </div>
  </div>
</div>

### 🌐 网络通信

<div class="package-grid">
  <div class="package-card">
    <h3><a href="/packages/http/">@ldesign/http</a></h3>
    <p class="version">v0.3.0</p>
    <p>现代化 HTTP 客户端，支持多适配器、智能缓存、自动重试</p>
    <div class="features">
      <span class="badge">Fetch</span>
      <span class="badge">Axios</span>
      <span class="badge">性能优化</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/websocket/">@ldesign/websocket</a></h3>
    <p class="version">v0.1.0</p>
    <p>WebSocket 封装，支持自动重连、心跳检测、消息队列</p>
    <div class="features">
      <span class="badge">自动重连</span>
      <span class="badge">心跳检测</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/api/">@ldesign/api</a></h3>
    <p class="version">v0.1.0</p>
    <p>API 管理和集成，支持插件化架构、拦截器系统</p>
    <div class="features">
      <span class="badge">插件化</span>
      <span class="badge">拦截器</span>
    </div>
  </div>
</div>

### 🧭 路由导航

<div class="package-grid">
  <div class="package-card">
    <h3><a href="/packages/router/">@ldesign/router</a></h3>
    <p class="version">v1.0.0</p>
    <p>独立的高性能路由库，支持 A/B 测试、数据预取、微前端</p>
    <div class="features">
      <span class="badge">A/B 测试</span>
      <span class="badge">微前端</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/menu/">@ldesign/menu</a></h3>
    <p class="version">v0.1.0</p>
    <p>菜单系统，支持多级菜单、动态权限、自定义渲染</p>
    <div class="features">
      <span class="badge">多级菜单</span>
      <span class="badge">权限控制</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/tabs/">@ldesign/tabs</a></h3>
    <p class="version">v0.1.0</p>
    <p>标签页管理，支持拖拽排序、关闭策略、状态保存</p>
    <div class="features">
      <span class="badge">拖拽</span>
      <span class="badge">状态保存</span>
    </div>
  </div>
</div>

### 🎨 用户体验

<div class="package-grid">
  <div class="package-card">
    <h3><a href="/packages/animation/">@ldesign/animation</a></h3>
    <p class="version">v0.1.1</p>
    <p>动画系统，支持 CSS/JS 动画、手势、物理动画</p>
    <div class="features">
      <span class="badge">Vue</span>
      <span class="badge">React</span>
      <span class="badge">手势</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/i18n/">@ldesign/i18n</a></h3>
    <p class="version">v0.1.0</p>
    <p>国际化支持，动态加载、命名空间、Vue 集成</p>
    <div class="features">
      <span class="badge">动态加载</span>
      <span class="badge">Vue 集成</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/notification/">@ldesign/notification</a></h3>
    <p class="version">v0.1.0</p>
    <p>通知系统，支持多种样式、位置控制、自动消失</p>
    <div class="features">
      <span class="badge">Toast</span>
      <span class="badge">通知</span>
    </div>
  </div>
</div>

### 🔐 安全认证

<div class="package-grid">
  <div class="package-card">
    <h3><a href="/packages/auth/">@ldesign/auth</a></h3>
    <p class="version">v0.1.0</p>
    <p>完整的身份认证解决方案，JWT、双 Token、Session 管理</p>
    <div class="features">
      <span class="badge">JWT</span>
      <span class="badge">Session</span>
      <span class="badge">自动刷新</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/crypto/">@ldesign/crypto</a></h3>
    <p class="version">v0.1.0</p>
    <p>加密工具库，支持多种加密算法和哈希函数</p>
    <div class="features">
      <span class="badge">AES</span>
      <span class="badge">RSA</span>
      <span class="badge">哈希</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/permission/">@ldesign/permission</a></h3>
    <p class="version">v0.1.0</p>
    <p>权限管理系统，RBAC 模型、动态权限、路由守卫</p>
    <div class="features">
      <span class="badge">RBAC</span>
      <span class="badge">动态权限</span>
    </div>
  </div>
</div>

### 🛠️ 开发工具

<div class="package-grid">
  <div class="package-card">
    <h3><a href="/packages/logger/">@ldesign/logger</a></h3>
    <p class="version">v0.1.0</p>
    <p>日志系统，分级日志、远程上报、性能监控</p>
    <div class="features">
      <span class="badge">分级</span>
      <span class="badge">上报</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/validator/">@ldesign/validator</a></h3>
    <p class="version">v0.1.0</p>
    <p>数据验证库，链式 API、自定义规则、异步验证</p>
    <div class="features">
      <span class="badge">链式 API</span>
      <span class="badge">异步验证</span>
    </div>
  </div>
  
  <div class="package-card">
    <h3><a href="/packages/config/">@ldesign/config</a></h3>
    <p class="version">v0.1.0</p>
    <p>统一配置管理，提供 TypeScript、ESLint、构建配置</p>
    <div class="features">
      <span class="badge">TypeScript</span>
      <span class="badge">ESLint</span>
      <span class="badge">Vite</span>
    </div>
  </div>
</div>

## 安装和使用

### 安装单个包

```bash
# 使用 pnpm
pnpm add @ldesign/cache

# 使用 npm
npm install @ldesign/cache

# 使用 yarn
yarn add @ldesign/cache
```

### 安装多个包

```bash
# 安装常用包组合
pnpm add @ldesign/cache @ldesign/http @ldesign/store @ldesign/auth
```

### 在项目中使用

```ts
// 导入需要的功能
import { createCache } from '@ldesign/cache'
import { createHttpClient } from '@ldesign/http'
import { createStore } from '@ldesign/store'

// 创建实例
const cache = createCache()
const http = createHttpClient()
const store = createStore()
```

## 版本策略

- **主版本**（x.0.0）: 包含破坏性变更
- **次版本**（0.x.0）: 新增功能，向后兼容
- **修订版本**（0.0.x）: Bug 修复，向后兼容

所有包都遵循[语义化版本](https://semver.org/lang/zh-CN/)规范。

## 浏览器支持

所有核心包都支持以下浏览器：

- Chrome >= 87
- Firefox >= 78
- Safari >= 13.1
- Edge >= 88

部分功能可能需要 polyfill 支持。

<style>
.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.package-card {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.3s;
}

.package-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.package-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.package-card h3 a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.package-card .version {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.package-card p {
  color: var(--vp-c-text-2);
  margin: 0.75rem 0;
  line-height: 1.6;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 4px;
}
</style>
