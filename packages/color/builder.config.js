export default {
  // 入口配置
  entry: 'src/index.ts',

  // 库类型：Vue 3
  libraryType: 'vue3',

  // 输出配置
  output: {
    esm: {
      enabled: true,
      dir: 'es',
      format: 'esm',
      // 启用代码分割和优化
      preserveModules: true,
      preserveModulesRoot: 'src',
      // CSS 输出配置
      extractCSS: true,
      cssCodeSplit: true
    },
    cjs: {
      enabled: true,
      dir: 'lib',
      format: 'cjs',
      extension: '.cjs',
      // 启用代码分割
      preserveModules: true,
      preserveModulesRoot: 'src',
      // CSS 输出配置
      extractCSS: true,
      cssCodeSplit: true
    },
    umd: {
      enabled: true,
      dir: 'dist',
      format: 'umd',
      name: 'LDesignColor',
      entry: 'src/index.ts',
      // CSS 输出配置 - UMD 格式需要单独的 CSS 文件
      extractCSS: true,
      cssFileName: 'index.css'
    }
  },

  // Vue 配置
  vue: {
    enabled: true,
    version: 3,
    // 自定义块处理
    customBlocks: ['i18n'],
    // 样式处理
    stylePreprocessors: {
      scss: false,
      less: false
    },
    // 确保 CSS 提取
    extractCSS: true
  },

  // CSS 配置
  css: {
    extract: true, // 提取 CSS 到独立文件
    modules: false, // 不使用 CSS Modules
    preprocessor: 'none',
    // 确保 Vue 组件的 scoped 样式正确处理
    scopedStyles: true,
    // Source maps
    sourceMap: true
  },

  // TypeScript配置
  typescript: {
    tsconfig: './tsconfig.build.json',
    // 优化类型声明输出
    compilerOptions: {
      removeComments: false, // 保留注释用于文档
      declaration: true,
      declarationMap: true
    }
  },

  // 外部依赖 - 添加更多可选依赖
  external: [
    'react',
    'react-dom',
    'vue',
    'lucide-react',
    'lucide-vue-next'
  ],

  // 清理输出目录
  clean: true,

  // 压缩选项 - 增强压缩配置
  minify: {
    terser: {
      compress: {
        drop_console: false, // 保留console用于调试
        drop_debugger: true,
        pure_funcs: ['console.debug'], // 移除debug日志
        passes: 2 // 多次压缩以获得更好效果
      },
      mangle: {
        safari10: true, // Safari 10兼容
        properties: false // 不混淆属性名，保持API稳定
      },
      format: {
        comments: false, // 移除注释
        ecma: 2020
      }
    }
  },

  // Source maps
  sourcemap: true,

  // Tree shaking优化
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false
  }
}