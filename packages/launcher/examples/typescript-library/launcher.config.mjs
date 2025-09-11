import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 库模式配置
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLibrary',
      fileName: (format) => `my-library.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    emptyOutDir: true,
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: [],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {}
      }
    }
  },
  
  // 别名配置
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  
  // 测试配置
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test.ts',
        'dist/'
      ]
    }
  },
  
  // 开发服务器配置（用于开发时测试）
  server: {
    port: 3002,
    open: true
  }
})

