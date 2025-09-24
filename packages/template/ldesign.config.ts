/**
 * LDesign 构建配置
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 基础配置
  name: '@ldesign/template',
  entry: {
    index: 'src/index.ts',
    plugin: 'src/plugin.ts'
  },
  
  // 输出配置
  output: {
    formats: ['esm', 'cjs'],
    dir: {
      esm: 'es',
      cjs: 'lib'
    }
  },
  
  // TypeScript 配置
  typescript: {
    enabled: true,
    declaration: true,
    declarationMap: true,
    configFile: 'tsconfig.build.json'
  },
  
  // 外部依赖
  external: [
    'vue',
    '@vueuse/core',
    'lucide-vue-next',
    '@ldesign/cache',
    '@ldesign/device',
    '@ldesign/engine',
    '@ldesign/shared'
  ],
  
  // 构建优化
  optimization: {
    // 启用 Tree Shaking
    treeshake: true,
    
    // 代码分割
    splitting: true,
    
    // 压缩配置
    minify: {
      enabled: true,
      options: {
        // 保留类名和函数名，便于调试
        keep_classnames: true,
        keep_fnames: true,
        // 移除 console.log（生产环境）
        drop_console: process.env.NODE_ENV === 'production',
        // 移除 debugger
        drop_debugger: true
      }
    },
    
    // Bundle 分析
    analyze: {
      enabled: process.env.ANALYZE === 'true',
      options: {
        filename: 'bundle-analysis.html',
        openAnalyzer: false
      }
    }
  },
  
  // 样式处理
  styles: {
    // 支持 Less
    less: {
      enabled: true,
      options: {
        javascriptEnabled: true,
        modifyVars: {
          // 可以在这里定义 Less 变量
        }
      }
    },
    
    // PostCSS 配置
    postcss: {
      enabled: true,
      plugins: [
        'autoprefixer',
        'cssnano'
      ]
    },
    
    // CSS 模块
    modules: {
      enabled: false // 根据需要启用
    }
  },
  
  // 开发配置
  dev: {
    // 开发服务器配置
    server: {
      port: 3000,
      open: false
    },
    
    // 热更新
    hmr: {
      enabled: true,
      port: 24678
    },
    
    // 源码映射
    sourcemap: true
  },
  
  // 生产配置
  build: {
    // 源码映射
    sourcemap: false,
    
    // 清理输出目录
    clean: true,
    
    // 复制文件
    copy: [
      {
        from: 'src/styles',
        to: 'styles'
      },
      {
        from: 'README.md',
        to: 'README.md'
      },
      {
        from: 'LICENSE',
        to: 'LICENSE'
      }
    ]
  },
  
  // 插件配置
  plugins: [
    // Vue 支持
    {
      name: 'vue',
      options: {
        isProduction: process.env.NODE_ENV === 'production'
      }
    },
    
    // 文件大小分析
    {
      name: 'size-limit',
      options: {
        limit: '100kb',
        gzip: true
      }
    }
  ],
  
  // 环境变量
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '0.1.0'),
    __DEV__: process.env.NODE_ENV !== 'production',
    __PROD__: process.env.NODE_ENV === 'production'
  },
  
  // 构建钩子
  hooks: {
    'build:before': () => {
      console.log('🚀 开始构建 @ldesign/template...')
    },
    
    'build:after': () => {
      console.log('✅ 构建完成！')
    },
    
    'build:error': (error: Error) => {
      console.error('❌ 构建失败:', error.message)
    }
  }
})
