import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

// 优化后的外部依赖配置
const external = [
  'vue',
  'react',
  'react-dom',
  'lit',
  'echarts',
  'echarts/core',
  'echarts/charts',
  'echarts/components',
  'echarts/renderers'
];

// 优化的 Terser 配置
const terserOptions = {
  compress: {
    drop_console: true, // 生产环境移除 console
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.debug'], // 移除特定函数调用
    passes: 2, // 多次压缩以获得更好效果
  },
  mangle: {
    properties: {
      regex: /^_/, // 压缩以 _ 开头的私有属性
    },
  },
  format: {
    comments: false, // 移除注释
  },
};

const createConfig = (input, outputName, globals = {}) => ({
  input,
  external,
  plugins: [
    resolve({
      // 优化依赖解析
      preferBuiltins: true,
      extensions: ['.js', '.ts', '.tsx', '.vue'],
    }),
    commonjs({
      // 优化 CommonJS 转换
      include: /node_modules/,
      sourceMap: false, // 生产环境关闭 sourcemap
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      sourceMap: false, // 生产环境关闭 sourcemap
      // 优化编译选项
      compilerOptions: {
        removeComments: true,
        importHelpers: true, // 使用 tslib 减少重复代码
      },
    }),
  ],
  // 启用 Tree-shaking
  treeshake: {
    moduleSideEffects: false, // 假设模块没有副作用
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
  output: [
    // ESM 输出（支持 Tree-shaking）
    {
      file: `dist/${outputName}.esm.js`,
      format: 'esm',
      sourcemap: false,
      // 代码分割配置
      inlineDynamicImports: false,
      preserveModules: false,
    },
    // CJS 输出
    {
      file: `dist/${outputName}.cjs.js`,
      format: 'cjs',
      sourcemap: false,
      exports: 'named',
      interop: 'auto',
    },
    // UMD 输出（未压缩）
    {
      file: `dist/${outputName}.umd.js`,
      format: 'umd',
      name: outputName.replace(/-/g, '').replace(/\//g, ''),
      sourcemap: false,
      globals,
      exports: 'named',
    },
    // UMD 输出（压缩）
    {
      file: `dist/${outputName}.umd.min.js`,
      format: 'umd',
      name: outputName.replace(/-/g, '').replace(/\//g, ''),
      sourcemap: false,
      globals,
      exports: 'named',
      plugins: [terser(terserOptions)],
    },
  ],
});

const createDtsConfig = (input, output) => ({
  input,
  external,
  plugins: [dts()],
  output: {
    file: output,
    format: 'esm',
  },
});

export default [
  // Core package
  createConfig('src/index.ts', 'index'),
  createDtsConfig('src/index.ts', 'dist/index.d.ts'),

  // Vue adapter
  createConfig('src/adapters/vue/index.ts', 'vue', { vue: 'Vue', echarts: 'echarts' }),
  createDtsConfig('src/adapters/vue/index.ts', 'dist/vue.d.ts'),

  // React adapter
  createConfig('src/adapters/react/index.tsx', 'react', {
    react: 'React',
    'react-dom': 'ReactDOM',
    echarts: 'echarts'
  }),
  createDtsConfig('src/adapters/react/index.tsx', 'dist/react.d.ts'),

  // Lit adapter
  createConfig('src/adapters/lit/index.ts', 'lit', { lit: 'Lit', echarts: 'echarts' }),
  createDtsConfig('src/adapters/lit/index.ts', 'dist/lit.d.ts'),
];

