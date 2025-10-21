export default {
  // 明确指定入口文件
  entry: 'src/index.ts',

  // 输出配置
  output: {
    esm: {
      enabled: true,
      dir: 'es',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    cjs: {
      enabled: true,
      dir: 'lib',
      format: 'cjs',
      extension: '.cjs',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    umd: {
      enabled: true,
      dir: 'dist',
      format: 'umd',
      name: 'LDesignSimpleApp',
      entry: 'src/index.ts'
    }
  },

  // TypeScript 配置
  typescript: {
    tsconfig: './tsconfig.json',
    compilerOptions: {
      removeComments: false,
      declaration: true,
      declarationMap: true
    }
  },

  // 清理输出目录
  clean: true,

  // 压缩选项
  minify: {
    terser: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true,
        properties: false
      },
      format: {
        comments: false,
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
  },

  // 外部依赖配置
  external: [
    'vue',
    'pinia',
    'lucide-vue-next',
    '@ldesign/api',
    '@ldesign/cache',
    '@ldesign/color',
    '@ldesign/crypto',
    '@ldesign/engine',
    '@ldesign/http',
    '@ldesign/i18n',
    '@ldesign/router',
    '@ldesign/size',
    '@ldesign/store',
    '@ldesign/template',
    'node:fs',
    'node:path',
    'node:os',
    'node:util',
    'node:events',
    'node:stream',
    'node:crypto',
    'node:http',
    'node:https',
    'node:url',
    'node:buffer',
    'node:child_process',
    'node:worker_threads'
  ],

  // 全局变量配置
  globals: {
    'vue': 'Vue',
    'pinia': 'Pinia',
    'lucide-vue-next': 'LucideVueNext'
  },

  // 日志级别设置
  logLevel: 'info'
}

