export default {
  // 入口配置
  entry: 'src/index.ts',
  
  // 输出配置
  output: {
    esm: {
      enabled: true,
      dir: 'es',
      format: 'esm',
      // 启用代码分割和优化
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    cjs: {
      enabled: true,
      dir: 'lib',
      format: 'cjs',
      extension: '.cjs',
      // 启用代码分割
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    umd: {
      enabled: true,
      dir: 'dist',
      format: 'umd',
      name: 'LDesignColor',
      entry: 'src/index.ts' // Use same entry for UMD
    }
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