---
title: 使用示例
description: 常用场景与技术栈示例索引，助你快速上手 @ldesign/launcher
---

# 使用示例

本章节提供了 @ldesign/launcher 的各种实用示例，帮助你快速上手并掌握各种使用场景。

## 📋 示例概览

### 🚀 快速开始
- [基础项目设置](./basic-setup) - 创建第一个项目
- [Vue 3 项目](./vue-project) - Vue 3 完整项目示例
- [React 项目](./react-project) - React 完整项目示例
- [TypeScript 项目](./typescript-project) - TypeScript 项目配置

### 🔧 配置示例
- [多环境配置](./multi-environment) - 开发、测试、生产环境配置
- [代理配置](./proxy-config) - API 代理和跨域解决方案
- [构建优化](./build-optimization) - 构建性能和产物优化
- [PWA 配置](./pwa-config) - 渐进式 Web 应用配置

### 🔌 插件使用
- [自定义插件](./custom-plugins) - 开发自定义插件
- [插件组合](./plugin-composition) - 多插件配合使用
- [第三方插件集成](./third-party-plugins) - 集成社区插件

### 🌐 部署示例
- [静态部署](./static-deployment) - Nginx、Apache 部署
- [云服务部署](./cloud-deployment) - Vercel、Netlify 部署
- [Docker 部署](./docker-deployment) - 容器化部署
- [CI/CD 集成](./cicd-integration) - 自动化部署流程

### 🏗️ 项目结构
- [Monorepo 项目](./monorepo) - 大型项目管理
- [微前端架构](./microfrontend) - 微前端解决方案
- [组件库开发](./component-library) - 开发和发布组件库

## 🎯 按技术栈分类

### Vue.js 生态

#### Vue 3 + TypeScript + Vite
```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  server: {
    port: 3000,
    open: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  
  launcher: {
    logLevel: 'info',
    hooks: {
      afterStart: async () => {
        console.log('🚀 Vue 3 应用已启动!')
      }
    }
  }
})
```

#### Vue 3 + Pinia + Router
```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@views': resolve(__dirname, 'src/views')
    }
  },
  
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia']
  }
})
```

### React 生态

#### React + TypeScript
```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  esbuild: {
    jsxInject: `import React from 'react'`
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
```

### 现代工具链

#### 使用 ESLint + Prettier
```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [
    eslint({
      include: ['src/**/*.{js,jsx,ts,tsx,vue}'],
      exclude: ['node_modules']
    })
  ],
  
  launcher: {
    hooks: {
      beforeBuild: async () => {
        console.log('🔍 Running ESLint...')
        // 可以在这里执行 linting
      }
    }
  }
})
```

## 🛠️ 实用配置模板

### 开发环境配置

```typescript path=null start=null
// configs/development.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    cors: true,
    
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  
  launcher: {
    logLevel: 'debug',
    autoRestart: true,
    
    hooks: {
      beforeStart: async () => {
        console.log('🔧 开发模式启动中...')
      }
    }
  }
})
```

### 生产环境配置

```typescript path=null start=null
// configs/production.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['element-plus'],
          utils: ['lodash', 'dayjs']
        }
      }
    }
  },
  
  launcher: {
    logLevel: 'warn',
    
    hooks: {
      afterBuild: async (result) => {
        console.log(`📦 构建完成: ${result.outDir}`)
        // 可以在这里上传到 CDN 等
      }
    }
  }
})
```

## 📱 移动端开发

### 移动端适配配置

```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-px-to-viewport')({
          unitToConvert: 'px',
          viewportWidth: 375,
          viewportHeight: 667,
          unitPrecision: 3,
          propList: ['*'],
          viewportUnit: 'vw',
          fontViewportUnit: 'vw',
          selectorBlackList: ['.ignore'],
          minPixelValue: 1,
          mediaQuery: false,
          replace: true,
          exclude: [/node_modules/]
        })
      ]
    }
  },
  
  build: {
    target: ['chrome58', 'safari11'],
    cssTarget: 'chrome58'
  }
})
```

## 🎨 UI 框架集成

### Element Plus 集成

```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`
      }
    }
  },
  
  optimizeDeps: {
    include: [
      'element-plus/lib/theme-chalk/index.css',
      'element-plus/es/components/*/style/index'
    ]
  }
})
```

### Ant Design 集成

```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#1DA57A'
        }
      }
    }
  }
})
```

## 🧪 测试集成

### Jest 测试配置

```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts']
  },
  
  launcher: {
    hooks: {
      beforeBuild: async () => {
        // 构建前运行测试
        const { execSync } = require('child_process')
        try {
          execSync('npm run test', { stdio: 'inherit' })
          console.log('✅ 所有测试通过')
        } catch (error) {
          console.error('❌ 测试失败')
          process.exit(1)
        }
      }
    }
  }
})
```

## 🚀 性能优化示例

### 构建性能优化

```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('router')) {
              return 'vue-vendor'
            }
            if (id.includes('element-plus')) {
              return 'ui-vendor'
            }
            if (id.includes('lodash') || id.includes('dayjs')) {
              return 'utils-vendor'
            }
            return 'vendor'
          }
        }
      }
    }
  },
  
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus/es/components/button/style/index',
      'element-plus/es/components/input/style/index'
    ]
  }
})
```

## 🌍 国际化支持

### Vue I18n 集成

```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'
import VueI18n from '@intlify/vite-plugin-vue-i18n'

export default defineConfig({
  plugins: [
    vue(),
    VueI18n({
      include: resolve(__dirname, './src/locales/**'),
    })
  ],
  
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  }
})
```

## 📊 监控与分析

### 构建分析配置

```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        process.env.ANALYZE && visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true
        })
      ].filter(Boolean)
    }
  },
  
  launcher: {
    monitoring: {
      bundleSize: true,
      buildTime: true,
      
      reporters: [
        'console',
        {
          type: 'file',
          output: './reports/build-stats.json'
        }
      ]
    }
  }
})
```

## 💡 最佳实践示例

### 环境变量管理

```typescript path=null start=null
// launcher.config.ts
import { defineConfig, loadEnv } from '@ldesign/launcher'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      __VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      proxy: {
        '/api': env.VITE_API_URL || 'http://localhost:8080'
      }
    },
    
    launcher: {
      envValidation: {
        VITE_API_URL: {
          required: mode === 'production',
          type: 'url'
        },
        VITE_APP_TITLE: {
          required: true,
          type: 'string'
        }
      }
    }
  }
})
```

### 多页面应用配置

```typescript path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        mobile: resolve(__dirname, 'mobile/index.html')
      }
    }
  },
  
  server: {
    proxy: {
      '^/admin': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '^/mobile': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  }
})
```

## 🔗 相关资源

### 官方示例仓库

- [Vue 3 模板](https://github.com/ldesign/launcher-template-vue)
- [React 模板](https://github.com/ldesign/launcher-template-react)
- [TypeScript 模板](https://github.com/ldesign/launcher-template-typescript)

### 社区示例

- [Electron 桌面应用](./electron-app)
- [Chrome 扩展开发](./chrome-extension)
- [小程序开发](./mini-program)

### 工具链集成

- [Storybook 集成](./storybook-integration)
- [Cypress 测试](./cypress-testing)
- [Docker 开发环境](./docker-development)

---

**快速导航**:
- [基础示例](./basic-setup) - 从零开始
- [Vue 项目示例](./vue-project) - Vue 3 完整项目
- [React 项目示例](./react-project) - React 完整项目
- [高级配置](./advanced-config) - 复杂场景配置
