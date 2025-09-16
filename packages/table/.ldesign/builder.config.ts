import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 基础配置
  root: process.cwd(),
  outDir: 'dist',

  // 多入口配置
  entries: {
    // 主入口
    index: 'src/index.ts',
    // 框架适配器
    'adapters/vue': 'src/adapters/vue.ts',
    'adapters/react': 'src/adapters/react.ts',
    'adapters/angular': 'src/adapters/angular.ts'
  },

  // 输出格式：ESM、CJS、UMD
  formats: ['esm', 'cjs', 'umd'],

  // 库类型
  libraryType: LibraryType.TYPESCRIPT,

  // 生成类型声明文件
  dts: true,

  // 生产环境压缩代码
  minify: true,

  // 生成 source map
  sourcemap: true,

  // 外部依赖（不打包进最终产物）
  external: [
    'vue',
    'react',
    'react-dom',
    '@angular/core',
    '@angular/common',
    '@ldesign/shared',
    'lodash-es'
  ],

  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@ldesign/shared': 'LDesignShared',
    'lodash-es': '_'
  },

  // UMD 格式的库名称
  name: 'LDesignTable',

  // 启用样式处理
  css: true,

  // 样式配置
  style: {
    extract: true,        // 提取CSS到单独文件
    minimize: true,       // 压缩CSS
    autoprefixer: true,   // 自动添加浏览器前缀
    modules: false,       // 不使用CSS模块
    preprocessor: {
      less: {
        enabled: true,
        options: {
          javascriptEnabled: true,
          modifyVars: {
            // 可以在这里覆盖LESS变量
          }
        }
      }
    },
    browserslist: [
      '> 1%',
      'last 2 versions',
      'not dead',
      'not ie 11'
    ]
  },

  // TypeScript配置
  typescript: {
    declaration: true,
    declarationMap: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true
  },

  // 构建优化
  optimization: {
    treeshake: true,
    sideEffects: false
  },

  // Banner配置
  banner: {
    copyright: {
      owner: 'LDesign Team',
      license: 'MIT'
    },
    buildInfo: {
      version: true,
      buildTime: true
    }
  }
})
