import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

export default {
 input: 'src/index.ts',
 output: [
  {
   file: 'dist/index.js',
   format: 'cjs',
   sourcemap: true,
   exports: 'named',
   inlineDynamicImports: true
  },
  {
   file: 'dist/index.esm.js',
   format: 'esm',
   sourcemap: true,
   inlineDynamicImports: true
  }
 ],
external: ['docx-preview', 'xlsx', 'x-data-spreadsheet', 'pptxjs', 'jszip', 'vue', 'react'],
 plugins: [
  resolve({
   browser: true
  }),
  commonjs(),
  typescript({
   tsconfig: './tsconfig.json',
   declaration: true,
   declarationDir: './dist'
  }),
  postcss({
   extract: true,
   minimize: true,
   sourceMap: true
  })
 ]
};
