# LDesign Vue Engine

<div align="center">

![LDesign Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=LDesign)

**Modern frontend development engine based on Vue3 with monorepo architecture**

[![CI](https://github.com/ldesign/ldesign/workflows/CI/badge.svg)](https://github.com/ldesign/ldesign/actions)
[![codecov](https://codecov.io/gh/ldesign/ldesign/branch/main/graph/badge.svg)](https://codecov.io/gh/ldesign/ldesign)
[![npm version](https://badge.fury.io/js/%40ldesign%2Fengine.svg)](https://badge.fury.io/js/%40ldesign%2Fengine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)

English | [简体中文](./README.md)

</div>

## ✨ Features

- 🚀 **High Performance Engine**: Modern architecture based on Vue3
- 🎨 **Smart Theming**: Dynamic color management and theme switching system
- 🛣️ **Enhanced Router**: Enhanced version of Vue Router with caching and guards
- 🌐 **HTTP Client**: Built-in request library with interceptors and caching
- 🌍 **Internationalization**: Complete multi-language support with dynamic loading
- 📱 **Device Detection**: Smart device information detection and sensor support
- 🔐 **Crypto Tools**: Built-in encryption algorithms and security tools
- 📄 **Template Engine**: Efficient template compilation and SSR support
- 🛠️ **Development Tools**: Complete development toolchain and scaffolding
- 📦 **Monorepo**: Unified package management and version control

## 📦 Package Structure

| Package                                  | Version                                                | Description                                                            | Documentation                         |
| ---------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------- |
| [@ldesign/engine](./packages/engine)     | ![npm](https://img.shields.io/npm/v/@ldesign/engine)   | 🚀 Engine Core - Plugin system, middleware, global management          | [Docs](./packages/engine/README.md)   |
| [@ldesign/color](./packages/color)       | ![npm](https://img.shields.io/npm/v/@ldesign/color)    | 🎨 Color Management - Theme switching, color generation, CSS variables | [Docs](./packages/color/README.md)    |
| [@ldesign/router](./packages/router)     | ![npm](https://img.shields.io/npm/v/@ldesign/router)   | 🛣️ Router System - Vue router enhancement, guards, caching             | [Docs](./packages/router/README.md)   |
| [@ldesign/http](./packages/http)         | ![npm](https://img.shields.io/npm/v/@ldesign/http)     | 🌐 HTTP Client - Request library, interceptors, caching                | [Docs](./packages/http/README.md)     |
| [@ldesign/i18n](./packages/i18n)         | ![npm](https://img.shields.io/npm/v/@ldesign/i18n)     | 🌍 Internationalization - Multi-language support, dynamic loading      | [Docs](./packages/i18n/README.md)     |
| [@ldesign/device](./packages/device)     | ![npm](https://img.shields.io/npm/v/@ldesign/device)   | 📱 Device Detection - Device info, sensors, network status             | [Docs](./packages/device/README.md)   |
| [@ldesign/crypto](./packages/crypto)     | ![npm](https://img.shields.io/npm/v/@ldesign/crypto)   | 🔐 Crypto Tools - Encryption algorithms, hashing, signing              | [Docs](./packages/crypto/README.md)   |
| [@ldesign/template](./packages/template) | ![npm](https://img.shields.io/npm/v/@ldesign/template) | 📄 Template Engine - Template compilation, SSR support                 | [Docs](./packages/template/README.md) |

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install @ldesign/engine

# Using yarn
yarn add @ldesign/engine

# Using pnpm
pnpm add @ldesign/engine
```

### Basic Usage

```typescript
import { createColorManager } from '@ldesign/color'
import { createLDesign } from '@ldesign/engine'
import { createHttpClient } from '@ldesign/http'
import { createI18n } from '@ldesign/i18n'
import { createRouter } from '@ldesign/router'
import { createApp } from 'vue'

const app = createApp(App)

// Create LDesign instance
const ldesign = createLDesign({
  // Configuration options
})

// Add plugins
ldesign.use(
  createColorManager({
    theme: 'light',
    primaryColor: '#4F46E5',
  })
)

ldesign.use(
  createRouter({
    routes: [
      { path: '/', component: Home },
      { path: '/about', component: About },
    ],
  })
)

ldesign.use(
  createHttpClient({
    baseURL: '/api',
    timeout: 5000,
  })
)

ldesign.use(
  createI18n({
    locale: 'en-US',
    messages: {
      'zh-CN': { hello: '你好' },
      'en-US': { hello: 'Hello' },
    },
  })
)

// Install to Vue app
app.use(ldesign)
app.mount('#app')
```

### Usage in Vue Components

```vue
<script setup lang="ts">
import { useColorManager, useHttp, useI18n, useLDesign, useRouter } from '@ldesign/engine'

// Get LDesign instance
const ldesign = useLDesign()

// Use color management
const { theme, setTheme, primaryColor, setPrimaryColor } = useColorManager()

// Use router
const { push, replace, go } = useRouter()

// Use HTTP client
const { get, post, put, delete: del } = useHttp()

// Use internationalization
const { t, locale, setLocale } = useI18n()

// Toggle theme
function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}

// Send request
async function fetchData() {
  const data = await get('/users')
  console.log(data)
}

// Toggle locale
function toggleLocale() {
  setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>

<template>
  <div>
    <h1>{{ t('hello') }}</h1>
    <button @click="toggleTheme">Toggle Theme</button>
    <button @click="fetchData">Fetch Data</button>
    <button @click="toggleLocale">Toggle Language</button>
  </div>
</template>
```

## 📚 Documentation

- [Development Guide](./DEVELOPMENT.md) - Detailed development workflow and best practices
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project
- [API Documentation](./docs/api/) - Complete API reference
- [Example Projects](./examples/) - Real-world usage examples

## 🛠️ Development

### Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Local Development

```bash
# Clone the project
git clone https://github.com/ldesign/ldesign.git
cd ldesign

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development mode
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm type-check
```

### Creating New Packages

```bash
# Create a regular package
pnpm create-package my-package "My package description"

# Create a Vue package
pnpm create-package my-vue-package "My Vue package description" --vue
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Test coverage
pnpm test:coverage

# Test UI
pnpm test:ui
```

## 📈 Performance

- **Bundle Size**: All packages are optimized and support Tree-shaking
- **Runtime Performance**: Based on Vue 3's reactive system, excellent performance
- **Build Performance**: Using Rollup and Vite for fast builds
- **Developer Experience**: Hot reload, type checking, code hints

## 🔧 Configuration

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@ldesign/*": ["./packages/*/src"]
    }
  }
}
```

### Vite Configuration

```typescript
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/engine': resolve(__dirname, 'packages/engine/src'),
      '@ldesign/color': resolve(__dirname, 'packages/color/src'),
      // ... other packages
    },
  },
})
```

## 🤝 Contributing

We welcome all forms of contributions! Please read the [Contributing Guide](./CONTRIBUTING.md) for
details.

### Contributors

<a href="https://github.com/ldesign/ldesign/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ldesign/ldesign" />
</a>

## 📄 License

[MIT License](./LICENSE) © 2024 LDesign Team

## 🙏 Acknowledgments

Thanks to the following open source projects for inspiration and support:

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Vite](https://vitejs.dev/) - Next generation frontend build tool
- [TypeScript](https://www.typescriptlang.org/) - Superset of JavaScript
- [Rollup](https://rollupjs.org/) - Module bundler
- [Vitest](https://vitest.dev/) - Fast unit testing framework
- [Playwright](https://playwright.dev/) - Modern E2E testing framework

## 📞 Contact Us

- 📧 Email: team@ldesign.dev
- 💬 Discussions: [GitHub Discussions](https://github.com/ldesign/ldesign/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/ldesign/ldesign/issues)
- 📱 WeChat Group: Scan QR code to join

---

<div align="center">
  <sub>Built with ❤️ by the LDesign Team</sub>
</div>
