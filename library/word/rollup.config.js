/**
 * Rollup 打包配置
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import vue from 'rollup-plugin-vue';

const production = !process.env.ROLLUP_WATCH;

// 通用插件配置
const commonPlugins = [
  resolve({
    browser: true,
    extensions: ['.js', '.ts', '.tsx', '.vue'],
  }),
  commonjs(),
  postcss({
    extract: false,
    modules: false,
    use: ['sass'],
    inject: true,
  }),
];

// 核心包配置（不包含框架组件）
const coreConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'WordViewer',
      sourcemap: true,
      globals: {},
    },
  ],
  external: ['docx-preview', 'mammoth', 'docx', 'jszip'],
  plugins: [
    ...commonPlugins,
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
      exclude: ['**/*.vue', 'src/components/**/*'],
    }),
    production && terser(),
  ].filter(Boolean),
};

// Vue 组件配置
const vueConfig = {
  input: 'src/vue.ts',
  output: [
    {
      file: 'dist/vue.esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/vue.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/vue.umd.js',
      format: 'umd',
      name: 'WordViewerVue',
      sourcemap: true,
      globals: {
        vue: 'Vue',
      },
    },
  ],
  external: ['vue', 'docx-preview', 'mammoth', 'docx', 'jszip'],
  plugins: [
    ...commonPlugins,
    vue({
      target: 'browser',
      preprocessStyles: true,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
    production && terser(),
  ].filter(Boolean),
};

// React 组件配置
const reactConfig = {
  input: 'src/react.ts',
  output: [
    {
      file: 'dist/react.esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/react.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/react.umd.js',
      format: 'umd',
      name: 'WordViewerReact',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
  ],
  external: ['react', 'react-dom', 'docx-preview', 'mammoth', 'docx', 'jszip'],
  plugins: [
    ...commonPlugins,
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: [
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      exclude: 'node_modules/**',
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
    production && terser(),
  ].filter(Boolean),
};

// Lit Web Component 配置
const litConfig = {
  input: 'src/lit.ts',
  output: [
    {
      file: 'dist/lit.esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/lit.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/lit.umd.js',
      format: 'umd',
      name: 'WordViewerLit',
      sourcemap: true,
      globals: {
        lit: 'Lit',
        'lit/decorators.js': 'LitDecorators',
      },
    },
  ],
  external: ['lit', 'lit/decorators.js', 'docx-preview', 'mammoth', 'docx', 'jszip'],
  plugins: [
    ...commonPlugins,
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
    production && terser(),
  ].filter(Boolean),
};

export default [coreConfig, vueConfig, reactConfig, litConfig];



