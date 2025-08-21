import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Custom plugin for advanced features
function advancedFeaturesPlugin(): Plugin {
  return {
    name: 'advanced-features',
    configureServer(server) {
      // Add custom middleware for development
      server.middlewares.use('/api', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        if (req.method === 'OPTIONS') {
          res.statusCode = 200
          res.end()
          return
        }

        next()
      })
    },
    generateBundle(options, bundle) {
      // Add performance monitoring in production
      if (options.format === 'es') {
        console.log('Bundle analysis:', {
          chunks: Object.keys(bundle).length,
          totalSize: Object.values(bundle).reduce((acc, chunk) => {
            return acc + (chunk.type === 'chunk' ? chunk.code.length : 0)
          }, 0),
        })
      }
    },
  }
}

export default defineConfig({
  // Server configuration
  server: {
    port: 5174,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
    hmr: {
      overlay: true,
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-pdf': ['pdfjs-dist'],
          'vendor-chart': ['chart.js', 'chartjs-adapter-date-fns'],
          'vendor-utils': ['lodash-es', 'date-fns', 'uuid'],
          'vendor-search': ['fuse.js'],
          'vendor-storage': ['idb'],

          // Core chunks
          'core-pdf': ['@ldesign/pdf'],
          'core-performance': [resolve(__dirname, 'src/core/PerformanceMonitor.ts')],
          'core-annotations': [resolve(__dirname, 'src/core/AnnotationManager.ts')],
          'core-search': [resolve(__dirname, 'src/core/SearchEngine.ts')],
          'core-plugins': [resolve(__dirname, 'src/core/PluginSystem.ts')],

          // Workers
          'workers': [
            resolve(__dirname, 'src/workers/pdf-worker.ts'),
            resolve(__dirname, 'src/workers/search-worker.ts'),
            resolve(__dirname, 'src/workers/analysis-worker.ts'),
          ],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return 'assets/css/[name]-[hash].[ext]'
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash].[ext]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/plugins': resolve(__dirname, 'src/plugins'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/workers': resolve(__dirname, 'src/workers'),
      '@/styles': resolve(__dirname, 'styles'),
      '@/assets': resolve(__dirname, 'assets'),
      '@ldesign/pdf': resolve(__dirname, '../../src/index.ts'),
    },
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'pdfjs-dist',
      'chart.js',
      'chartjs-adapter-date-fns',
      'date-fns',
      'fuse.js',
      'idb',
      'lodash-es',
      'mitt',
      'uuid',
    ],
    exclude: [
      '@ldesign/pdf',
    ],
  },

  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
    modules: {
      localsConvention: 'camelCase',
    },
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === 'charset') {
                atRule.remove()
              }
            },
          },
        },
      ],
    },
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },

  // ESBuild configuration
  esbuild: {
    target: 'es2020',
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    legalComments: 'none',
  },

  // Preview configuration
  preview: {
    port: 4174,
    host: true,
    cors: true,
  },

  // Worker configuration
  worker: {
    format: 'es',
    plugins: [],
  },

  // Plugins
  plugins: [
    advancedFeaturesPlugin(),
  ],

  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
      ],
    },
  },
})
