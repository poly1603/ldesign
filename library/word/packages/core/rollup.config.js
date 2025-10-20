import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
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
    resolve({
      browser: true,
      extensions: ['.js', '.ts'],
    }),
    commonjs(),
    postcss({
      extract: false,
      modules: false,
      inject: true,
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



