import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 打包与调试
  minify: true,
  sourcemap: true,
  clean: true,

  // 外部依赖（不打包进最终产物）
  external: [
    'vue',
    'react',
    '@angular/core',
    '@ldesign/shared'
  ],

  // 输出配置：使用布尔开关；true 使用默认配置，false/缺省跳过
  output: {
    esm: true,
    cjs: true,
    umd: {
      name: 'LDesignWebSocket',
      globals: {
        'vue': 'Vue',
        'react': 'React',
        '@angular/core': 'ng.core',
        '@ldesign/shared': 'LDesignShared'
      }
    }
  },

  // 入口文件
  entry: 'src/index.ts',

  // 性能优化
  performance: {
    treeshaking: true,
    bundleAnalyzer: false
  },

  // 构建钩子
  hooks: {
    'build:before': async () => {
      console.log('🚀 开始构建 WebSocket 插件库...')
    },
    'build:after': async () => {
      console.log('✅ WebSocket 插件库构建完成！')
    }
  }
})
