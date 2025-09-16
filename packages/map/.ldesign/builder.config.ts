/**
 * @ldesign/builder 构建配置
 * 配置地图插件的构建选项
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 包名
  name: '@ldesign/map',

  // 多入口配置
  entry: {
    index: 'src/index.ts',
    vue: 'src/adapters/vue/index.ts',
    react: 'src/adapters/react/index.ts',
    vanilla: 'src/adapters/vanilla/index.ts'
  },

  // 外部依赖
  external: [
    'vue',
    'react',
    'react-dom',
    'mapbox-gl',
    '@turf/turf',
    '@turf/distance',
    '@turf/boolean-point-in-polygon',
    '@turf/area',
    '@turf/length'
  ],

  // 全局变量映射
  globals: {
    'vue': 'Vue',
    'react': 'React',
    'react-dom': 'ReactDOM',
    'mapbox-gl': 'mapboxgl',
    '@turf/turf': 'turf'
  },

  // 输出格式
  formats: ['es', 'cjs', 'umd'],

  // TypeScript 声明文件
  dts: true,

  // 源码映射
  sourcemap: true,

  // 代码压缩
  minify: true,

  // 构建目标
  target: 'es2020',

  // 样式处理
  css: {
    extract: true,
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#722ED1'
        }
      }
    }
  },

  // 环境变量
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },

  // 别名配置
  alias: {
    '@': 'src',
    '@core': 'src/core',
    '@features': 'src/features',
    '@adapters': 'src/adapters',
    '@types': 'src/types',
    '@styles': 'src/styles'
  }
})
