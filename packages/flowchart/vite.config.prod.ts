import { defineConfig, mergeConfig } from 'vite'
import { createPackageViteConfig } from '@ldesign/builder'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// 基础配置
const baseConfig = createPackageViteConfig({
  enableCSS: true,
  lessOptions: {
    javascriptEnabled: true
  },
  external: ['@ldesign/shared'],
  globals: {
    '@ldesign/shared': 'LDesignShared'
  }
})

// 生产环境特定配置
const prodConfig = defineConfig({
  mode: 'production',
  
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 清空输出目录
    emptyOutDir: true,
    
    // 生成 source map
    sourcemap: true,
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除 console 和 debugger
        drop_console: true,
        drop_debugger: true,
        // 移除未使用的代码
        unused: true,
        // 移除死代码
        dead_code: true
      },
      mangle: {
        // 混淆变量名（保留关键API）
        reserved: ['FlowchartEditor', 'SVGRenderer', 'DataManager'],
        properties: {
          regex: /^_/
        }
      },
      format: {
        // 移除注释
        comments: false
      }
    },
    
    // 构建目标
    target: ['es2015', 'chrome63', 'firefox67', 'safari12'],
    
    // chunk 大小警告限制 (KB)
    chunkSizeWarningLimit: 800,
    
    // 资源内联阈值 (bytes)
    assetsInlineLimit: 4096,
    
    // 是否生成 manifest.json
    manifest: true,
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    rollupOptions: {
      // 额外的外部依赖
      external: [
        '@ldesign/shared',
        'lodash',
        'lodash-es',
        'date-fns',
        'rxjs'
      ],
      
      output: {
        // 更精确的代码分割
        manualChunks: {
          // 核心功能
          'core': [
            './src/core/FlowchartEditor.ts',
            './src/core/DataManager.ts',
            './src/core/InteractionManager.ts'
          ],
          
          // 渲染引擎
          'renderer': [
            './src/renderer/SVGRenderer.ts',
            './src/renderer/CanvasRenderer.ts'
          ],
          
          // 事件系统
          'events': [
            './src/events/EventBus.ts'
          ],
          
          // 性能优化
          'performance': [
            './src/performance/PerformanceMonitor.ts',
            './src/performance/InteractionOptimizer.ts',
            './src/performance/MemoryOptimizer.ts'
          ],
          
          // 协作功能
          'collaboration': [
            './src/collaboration/CollaborationManager.ts'
          ],
          
          // 无障碍访问
          'accessibility': [
            './src/accessibility/AccessibilityManager.ts'
          ],
          
          // 移动端适配
          'mobile': [
            './src/mobile/EnhancedMobileAdapter.ts'
          ],
          
          // 工具函数
          'utils': [
            './src/utils/index.ts'
          ]
        },
        
        // 文件命名模式
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // 根据模块路径生成更有意义的文件名
            const fileName = facadeModuleId.split('/').pop()?.replace('.ts', '') || 'chunk'
            return `chunks/${fileName}-[hash].js`
          }
          return `chunks/[name]-[hash].js`
        },
        
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name
          if (!name) return 'assets/[name]-[hash].[ext]'
          
          // CSS 文件
          if (name.endsWith('.css')) {
            return 'assets/css/[name]-[hash].css'
          }
          
          // 图片资源
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(name)) {
            return 'assets/images/[name]-[hash].[ext]'
          }
          
          // 字体文件
          if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
            return 'assets/fonts/[name]-[hash].[ext]'
          }
          
          return 'assets/[name]-[hash].[ext]'
        },
        
        // 全局变量配置
        globals: {
          '@ldesign/shared': 'LDesignShared',
          'lodash': '_',
          'lodash-es': '_',
          'date-fns': 'dateFns',
          'rxjs': 'rxjs'
        }
      },
      
      plugins: [
        // Bundle 分析器
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap' // sunburst, treemap, network
        })
      ]
    }
  },
  
  // CSS 优化
  css: {
    postcss: {
      plugins: [
        // 自动添加浏览器前缀
        require('autoprefixer')({
          overrideBrowserslist: [
            '> 1%',
            'last 2 versions',
            'not dead',
            'not ie <= 11'
          ]
        }),
        
        // CSS 压缩和优化
        require('cssnano')({
          preset: ['advanced', {
            discardComments: {
              removeAll: true
            },
            // 合并相似规则
            mergeLonghand: true,
            // 压缩颜色值
            colormin: true,
            // 压缩字体
            minifyFontValues: true,
            // 压缩选择器
            minifySelectors: true
          }]
        })
      ]
    }
  },
  
  // 定义生产环境常量
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: JSON.stringify(false),
    __PROD__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  
  // esbuild 优化
  esbuild: {
    // 移除所有日志
    drop: ['console', 'debugger'],
    // 法律注释处理
    legalComments: 'none',
    // 目标语法
    target: 'es2015'
  }
})

// 合并配置
export default mergeConfig(baseConfig, prodConfig)
