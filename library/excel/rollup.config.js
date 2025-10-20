/**
 * Rollup 构建配置
 * 支持多包构建：core, vue, react, lit
 */

import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import vue from 'rollup-plugin-vue';

// 获取构建目标
const BUILD = process.env.BUILD;
const isProd = process.env.NODE_ENV === 'production';

// 基础插件配置
const getBasePlugins = (tsconfig = {}) => [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: './dist',
    ...tsconfig,
  }),
  postcss({
    extract: false,
    minimize: isProd,
    inject: true,
  }),
  isProd && terser(),
].filter(Boolean);

// 外部依赖配置
const getExternal = (additional = []) => [
  'xlsx',
  'luckysheet',
  'html2canvas',
  'vue',
  'react',
  'react-dom',
  'lit',
  '@ldesign/excel-viewer-core',
  ...additional,
];

// 输出配置生成器
const createOutput = (dir, name) => [
  {
    file: `${dir}/index.esm.js`,
    format: 'esm',
    sourcemap: true,
    exports: 'named',
  },
  {
    file: `${dir}/index.cjs.js`,
    format: 'cjs',
    sourcemap: true,
    exports: 'named',
  },
  {
    file: `${dir}/index.umd.js`,
    format: 'umd',
    sourcemap: true,
    name,
    exports: 'named',
    globals: {
      xlsx: 'XLSX',
      luckysheet: 'luckysheet',
      'html2canvas': 'html2canvas',
      vue: 'Vue',
      react: 'React',
      'react-dom': 'ReactDOM',
      lit: 'Lit',
      '@ldesign/excel-viewer-core': 'ExcelViewerCore',
    },
  },
];

// Core 包配置
const coreConfig = defineConfig({
  input: 'packages/core/src/index.ts',
  output: createOutput('packages/core/dist', 'ExcelViewerCore'),
  external: getExternal(),
  plugins: getBasePlugins({
    tsconfig: './packages/core/tsconfig.json',
  }),
});

// Vue 包配置
const vueConfig = defineConfig({
  input: 'packages/vue/src/index.ts',
  output: createOutput('packages/vue/dist', 'ExcelViewerVue'),
  external: getExternal(['vue']),
  plugins: [
    vue({
      target: 'browser',
      preprocessStyles: true,
    }),
    ...getBasePlugins({
      tsconfig: './packages/vue/tsconfig.json',
    }),
  ],
});

// React 包配置
const reactConfig = defineConfig({
  input: 'packages/react/src/index.ts',
  output: createOutput('packages/react/dist', 'ExcelViewerReact'),
  external: getExternal(['react', 'react-dom']),
  plugins: getBasePlugins({
    tsconfig: './packages/react/tsconfig.json',
  }),
});

// Lit 包配置
const litConfig = defineConfig({
  input: 'packages/lit/src/index.ts',
  output: createOutput('packages/lit/dist', 'ExcelViewerLit'),
  external: getExternal(['lit']),
  plugins: getBasePlugins({
    tsconfig: './packages/lit/tsconfig.json',
  }),
});

// 根据 BUILD 环境变量选择配置
const configs = {
  core: coreConfig,
  vue: vueConfig,
  react: reactConfig,
  lit: litConfig,
};

// 如果指定了 BUILD，只构建对应的包，否则构建所有包
export default BUILD && configs[BUILD] ? configs[BUILD] : Object.values(configs);

