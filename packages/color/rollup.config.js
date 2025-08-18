/**
 * Rollup 构建配置
 *
 * 优化的构建配置，支持：
 * - 多种输出格式 (ESM, CommonJS, UMD)
 * - TypeScript 类型定义生成
 * - 代码分割和优化
 * - 原生JS兼容性
 *
 * @version 0.1.0
 * @author ldesign
 */

import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import { dts } from 'rollup-plugin-dts'
import { terser } from '@rollup/plugin-terser'

// ==================== 基础配置 ====================

const baseConfig = {
  input: 'src/index.ts',
  external: ['vue', 'react', 'react-dom'],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts', '.tsx'],
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './types',
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**'],
    }),
  ],
}

// ==================== 主包配置 ====================

const mainConfig = defineConfig([
  // ESM 格式
  {
    ...baseConfig,
    output: {
      file: 'es/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  },

  // CommonJS 格式
  {
    ...baseConfig,
    output: {
      file: 'lib/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },

  // UMD 格式 (开发版)
  {
    ...baseConfig,
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'LDesignColor',
      sourcemap: true,
      exports: 'named',
      globals: {
        vue: 'Vue',
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
  },

  // UMD 格式 (生产版)
  {
    ...baseConfig,
    plugins: [
      ...baseConfig.plugins,
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      }),
    ],
    output: {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'LDesignColor',
      sourcemap: true,
      exports: 'named',
      globals: {
        vue: 'Vue',
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
  },
])

// ==================== Vue 适配器配置 ====================

const vueConfig = defineConfig([
  // ESM 格式
  {
    ...baseConfig,
    input: 'src/adapt/vue/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'es/adapt/vue/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  },

  // CommonJS 格式
  {
    ...baseConfig,
    input: 'src/adapt/vue/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'lib/adapt/vue/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },
])

// ==================== React 适配器配置 ====================

const reactConfig = defineConfig([
  // ESM 格式
  {
    ...baseConfig,
    input: 'src/adapt/react/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'es/adapt/react/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  },

  // CommonJS 格式
  {
    ...baseConfig,
    input: 'src/adapt/react/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'lib/adapt/react/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },
])

// ==================== 核心模块配置 ====================

const coreConfig = defineConfig([
  // ESM 格式
  {
    ...baseConfig,
    input: 'src/core/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'es/core/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  },

  // CommonJS 格式
  {
    ...baseConfig,
    input: 'src/core/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'lib/core/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },
])

// ==================== 工具模块配置 ====================

const utilsConfig = defineConfig([
  // ESM 格式
  {
    ...baseConfig,
    input: 'src/utils/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'es/utils/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  },

  // CommonJS 格式
  {
    ...baseConfig,
    input: 'src/utils/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'lib/utils/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },
])

// ==================== 主题模块配置 ====================

const themesConfig = defineConfig([
  // ESM 格式
  {
    ...baseConfig,
    input: 'src/themes/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'es/themes/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  },

  // CommonJS 格式
  {
    ...baseConfig,
    input: 'src/themes/index.ts',
    external: ['vue', 'react', 'react-dom'],
    output: {
      file: 'lib/themes/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },
])

// ==================== 类型定义配置 ====================

const typesConfig = defineConfig([
  // 主包类型定义
  {
    input: 'src/index.ts',
    plugins: [dts()],
    output: {
      file: 'types/index.d.ts',
      format: 'esm',
    },
  },

  // Vue 适配器类型定义
  {
    input: 'src/adapt/vue/index.ts',
    plugins: [dts()],
    output: {
      file: 'types/adapt/vue/index.d.ts',
      format: 'esm',
    },
  },

  // React 适配器类型定义
  {
    input: 'src/adapt/react/index.ts',
    plugins: [dts()],
    output: {
      file: 'types/adapt/react/index.d.ts',
      format: 'esm',
    },
  },

  // 核心模块类型定义
  {
    input: 'src/core/index.ts',
    plugins: [dts()],
    output: {
      file: 'types/core/index.d.ts',
      format: 'esm',
    },
  },

  // 工具模块类型定义
  {
    input: 'src/utils/index.ts',
    plugins: [dts()],
    output: {
      file: 'types/utils/index.d.ts',
      format: 'esm',
    },
  },

  // 主题模块类型定义
  {
    input: 'src/themes/index.ts',
    plugins: [dts()],
    output: {
      file: 'types/themes/index.d.ts',
      format: 'esm',
    },
  },
])

// ==================== 导出配置 ====================

export default [
  ...mainConfig,
  ...vueConfig,
  ...reactConfig,
  ...coreConfig,
  ...utilsConfig,
  ...themesConfig,
  ...typesConfig,
]
