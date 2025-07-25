# 工具总览

LDesign 提供了一系列实用的工具函数，帮助你更高效地开发应用。

## 核心工具包

### @ldesign/color - 颜色工具
提供颜色处理、转换和生成相关的工具函数。

```typescript
import { generateColorPalette, hexToRgb, rgbToHex } from '@ldesign/color'

// 颜色格式转换
const rgb = hexToRgb('#ff0000') // { r: 255, g: 0, b: 0 }
const hex = rgbToHex(255, 0, 0) // '#ff0000'

// 生成色彩调色板
const palette = generateColorPalette('#1890ff')
```

### @ldesign/crypto - 加密工具
提供常用的加密、解密和哈希功能。

```typescript
import { decrypt, encrypt, md5, sha256 } from '@ldesign/crypto'

// 哈希函数
const hash = md5('hello world')
const sha = sha256('hello world')

// 加密解密
const encrypted = encrypt('secret data', 'password')
const decrypted = decrypt(encrypted, 'password')
```

### @ldesign/device - 设备检测
检测用户设备信息和环境特性。

```typescript
import { getBrowser, getOS, isMobile, isTablet } from '@ldesign/device'

// 设备类型检测
if (isMobile()) {
  console.log('移动设备')
}

// 获取系统信息
const os = getOS() // 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android'
const browser = getBrowser() // 'Chrome' | 'Firefox' | 'Safari' | 'Edge'
```

### @ldesign/engine - 渲染引擎
提供高性能的渲染和动画引擎。

```typescript
import { animate, createRenderer } from '@ldesign/engine'

// 创建渲染器
const renderer = createRenderer({
  canvas: document.getElementById('canvas'),
  width: 800,
  height: 600
})

// 动画
animate({
  from: 0,
  to: 100,
  duration: 1000,
  onUpdate: (value) => {
    // 更新动画
  }
})
```

### @ldesign/http - HTTP 客户端
基于 fetch 的现代 HTTP 客户端。

```typescript
import { http } from '@ldesign/http'

// 配置实例
const api = http.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    Authorization: 'Bearer token'
  }
})

// 发送请求
const response = await api.get('/users')
const user = await api.post('/users', { name: 'John' })
```

### @ldesign/i18n - 国际化
轻量级的国际化解决方案。

```typescript
import { createI18n } from '@ldesign/i18n'

// 创建 i18n 实例
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎使用 {name}'
    },
    'en-US': {
      hello: 'Hello',
      welcome: 'Welcome to {name}'
    }
  }
})

// 使用翻译
const message = i18n.t('welcome', { name: 'LDesign' })
```

### @ldesign/size - 尺寸工具
处理尺寸计算和响应式布局。

```typescript
import { getViewportSize, isInViewport, px2rem, rem2px } from '@ldesign/size'

// 单位转换
const remValue = px2rem(16) // 1rem (假设根字体大小为16px)
const pxValue = rem2px(1) // 16px

// 视口信息
const { width, height } = getViewportSize()

// 元素是否在视口内
const element = document.getElementById('target')
if (isInViewport(element)) {
  console.log('元素在视口内')
}
```

### @ldesign/store - 状态管理
轻量级的状态管理解决方案。

```typescript
import { createStore } from '@ldesign/store'

// 创建 store
const store = createStore({
  state: {
    count: 0,
    user: null
  },
  mutations: {
    increment(state) {
      state.count++
    },
    setUser(state, user) {
      state.user = user
    }
  },
  actions: {
    async fetchUser({ commit }, id) {
      const user = await api.get(`/users/${id}`)
      commit('setUser', user)
    }
  }
})

// 使用 store
store.commit('increment')
store.dispatch('fetchUser', 123)
```

### @ldesign/template - 模板引擎
简单而强大的模板引擎。

```typescript
import { compile, render } from '@ldesign/template'

// 编译模板
const template = compile('Hello {{name}}, you have {{count}} messages')

// 渲染模板
const result = render(template, {
  name: 'John',
  count: 5
}) // 'Hello John, you have 5 messages'
```

## 工具特性

### 🚀 高性能
- 优化的算法实现
- 最小的运行时开销
- 支持 Tree Shaking

### 📦 模块化
- 每个工具都是独立的包
- 可以单独安装和使用
- 零依赖或最小依赖

### 🔧 TypeScript 支持
- 完整的类型定义
- 智能代码提示
- 类型安全

### 🧪 测试覆盖
- 100% 的测试覆盖率
- 详细的测试用例
- 持续集成验证

## 安装使用

### 安装单个工具包

```bash
# 安装特定工具包
pnpm add @ldesign/color
pnpm add @ldesign/http
pnpm add @ldesign/i18n
```

### 安装完整工具集

```bash
# 安装所有工具包
pnpm add @ldesign/utils
```

### 按需引入

```typescript
// 只引入需要的函数
import { hexToRgb } from '@ldesign/color'
import { isMobile } from '@ldesign/device'
```

## 贡献工具

如果你想为 LDesign 贡献新的工具函数，请查看我们的 [工具开发指南](https://github.com/poly1603/ldesign/blob/main/UTILS_GUIDE.md)。

## 工具状态

| 工具包 | 状态 | 版本 | 大小 |
|--------|------|------|------|
| @ldesign/color | ✅ 稳定 | v1.0.0 | 2.1KB |
| @ldesign/crypto | ✅ 稳定 | v1.0.0 | 3.5KB |
| @ldesign/device | ✅ 稳定 | v1.0.0 | 1.8KB |
| @ldesign/engine | 🚧 开发中 | v0.9.0 | 15.2KB |
| @ldesign/http | ✅ 稳定 | v1.0.0 | 4.3KB |
| @ldesign/i18n | ✅ 稳定 | v1.0.0 | 2.7KB |
| @ldesign/size | ✅ 稳定 | v1.0.0 | 1.5KB |
| @ldesign/store | 🚧 开发中 | v0.8.0 | 3.9KB |
| @ldesign/template | 📋 计划中 | v0.1.0 | 2.2KB |
