import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    external: ['mammoth', 'xlsx', 'pptxgenjs'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src'
      }),
      isProduction && terser()
    ].filter(Boolean)
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    external: ['mammoth', 'xlsx', 'pptxgenjs'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      isProduction && terser()
    ].filter(Boolean)
  },
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'OfficeDocument',
      sourcemap: true,
      globals: {
        mammoth: 'mammoth',
        xlsx: 'XLSX',
        pptxgenjs: 'PptxGenJS'
      }
    },
    external: ['mammoth', 'xlsx', 'pptxgenjs'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      isProduction && terser()
    ].filter(Boolean)
  }
]);