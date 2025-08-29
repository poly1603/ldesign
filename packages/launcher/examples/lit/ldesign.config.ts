import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 项目基本配置
  projectName: 'Lit Example',
  framework: 'lit',
  
  // 开发服务器配置
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // 网络配置
  network: {
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    // 路径别名
    alias: {
      '@': './src',
      '@components': './src/components',
      '@utils': './src/utils',
      '@styles': './src/styles',
    },
    // CORS 配置
    cors: {
      origin: true,
      credentials: true,
    },
  },

  // 安全配置
  security: {
    // HTTPS 配置
    https: {
      enabled: false,
      ssl: {
        autoGenerate: true,
      },
    },
    // 安全头配置
    headers: {
      frameOptions: 'SAMEORIGIN',
      contentTypeOptions: true,
      xssProtection: true,
    },
  },

  // 资源处理配置
  assets: {
    // 字体优化
    fonts: {
      subset: true,
      preload: true,
      formats: ['woff2', 'woff'],
    },
    // SVG 处理
    svg: {
      componentGeneration: true,
      optimization: true,
      componentOptions: {
        framework: 'lit',
        typescript: true,
      },
    },
    // 图片优化
    images: {
      enabled: true,
      formats: ['webp', 'jpeg', 'png'],
      quality: {
        webp: 80,
        jpeg: 85,
      },
    },
  },

  // 插件生态配置
  plugins: {
    // 内置插件配置
    builtin: {
      // 代码分割插件
      codeSplitting: {
        enabled: true,
        apply: 'build',
        options: {
          strategy: 'vendor',
          chunks: {
            'lit-vendor': ['lit', '@lit/reactive-element'],
            'utils-vendor': ['lodash-es'],
          },
        },
      },
      // 热重载增强插件
      hmrEnhanced: {
        enabled: true,
        apply: 'serve',
        options: {
          fastRefresh: true,
          preserveState: true,
          errorOverlay: true,
        },
      },
      // 压缩插件
      compression: {
        enabled: true,
        apply: 'build',
        options: {
          algorithm: 'gzip',
          level: 6,
        },
      },
    },
  },

  // 环境优化配置
  optimization: {
    // 热重载优化
    hotReload: {
      fastRefresh: true,
      preserveState: true,
      smartReload: true,
    },
    // 错误提示优化
    errorDisplay: {
      overlay: true,
      showSourceLocation: true,
      suggestions: true,
    },
    // 性能监控
    performance: {
      enabled: true,
      metrics: {
        buildTime: true,
        memoryUsage: true,
      },
      budget: {
        maxBuildTime: 20,
        maxBundleSize: 600,
      },
    },
    // 缓存优化
    cache: {
      filesystem: true,
      strategy: 'aggressive',
    },
  },
  
  // Vite 原生配置
  vite: {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // Lit 特定配置
    esbuild: {
      target: 'es2020',
    },
  },
})
