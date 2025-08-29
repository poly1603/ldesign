import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 项目基本配置
  projectName: 'React Example',
  framework: 'react',
  
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
      '@hooks': './src/hooks',
      '@types': './src/types',
    },
    // CORS 配置
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    },
  },

  // 安全配置
  security: {
    // HTTPS 配置
    https: {
      enabled: false, // 开发环境可选择启用
      ssl: {
        autoGenerate: true, // 自动生成开发证书
      },
    },
    // 安全头配置
    headers: {
      frameOptions: 'SAMEORIGIN',
      contentTypeOptions: true,
      xssProtection: true,
    },
    // CSP 配置
    csp: {
      enabled: false, // 开发环境通常禁用
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
      },
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
        framework: 'react',
        typescript: true,
      },
    },
    // 图片优化
    images: {
      enabled: true,
      formats: ['webp', 'avif', 'jpeg', 'png'],
      quality: {
        webp: 80,
        avif: 70,
        jpeg: 85,
      },
    },
  },

  // 插件生态配置
  plugins: {
    // 内置插件配置
    builtin: {
      // 压缩插件（仅构建时启用）
      compression: {
        enabled: true,
        apply: 'build',
        options: {
          algorithm: 'gzip',
          level: 6,
          threshold: 1024,
        },
      },
      // 代码分割插件
      codeSplitting: {
        enabled: true,
        apply: 'build',
        options: {
          strategy: 'vendor',
          chunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['antd', '@ant-design/icons'],
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
      // 构建分析插件
      bundleAnalyzer: {
        enabled: false, // 需要时手动启用
        apply: 'build',
        options: {
          mode: 'static',
          openAnalyzer: false,
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
      updateDelay: 100,
    },
    // 错误提示优化
    errorDisplay: {
      overlay: true,
      showSourceLocation: true,
      showStackTrace: true,
      suggestions: true,
    },
    // 性能监控
    performance: {
      enabled: true,
      metrics: {
        buildTime: true,
        memoryUsage: true,
        fileSystemOps: true,
      },
      budget: {
        maxBuildTime: 30,
        maxMemoryUsage: 512,
        maxBundleSize: 1024,
      },
    },
    // 缓存优化
    cache: {
      filesystem: true,
      memory: true,
      strategy: 'aggressive',
      maxSize: 100,
    },
    // 开发服务器优化
    devServer: {
      prebuild: {
        enabled: true,
        include: ['react', 'react-dom'],
        exclude: ['@testing-library/react'],
      },
      middleware: {
        compression: true,
        cache: true,
      },
    },
    // 构建优化
    build: {
      codeSplitting: {
        strategy: 'vendor',
        minChunkSize: 20000,
        maxChunkSize: 244000,
      },
      minification: {
        js: 'esbuild',
        css: 'cssnano',
        html: true,
      },
      treeShaking: {
        enabled: true,
        sideEffects: false,
      },
    },
  },
  
  // Vite 原生配置
  vite: {
    // 可以直接传递 Vite 配置
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  },
})
