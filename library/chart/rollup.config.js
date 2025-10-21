import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const external = ['vue', 'react', 'react-dom', 'lit', 'echarts', 'echarts/core', 'echarts/charts', 'echarts/components', 'echarts/renderers'];

const createConfig = (input, outputName, globals = {}) => ({
  input,
  external,
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
    }),
  ],
  output: [
    {
      file: `dist/${outputName}.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
    {
      file: `dist/${outputName}.cjs.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: `dist/${outputName}.umd.js`,
      format: 'umd',
      name: outputName.replace(/-/g, '').replace(/\//g, ''),
      sourcemap: true,
      globals,
      exports: 'named',
    },
    {
      file: `dist/${outputName}.umd.min.js`,
      format: 'umd',
      name: outputName.replace(/-/g, '').replace(/\//g, ''),
      sourcemap: true,
      globals,
      exports: 'named',
      plugins: [terser()],
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

