import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';

const external = ['vue', '@ldesign/shared'];

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    external,
    output: {
      format: 'es',
      dir: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    plugins: [
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue']
      }),
      vue(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'es',
        declaration: true,
        declarationDir: 'es'
      }),
      commonjs()
    ]
  },
  // CJS build
  {
    input: 'src/index.ts',
    external,
    output: {
      format: 'cjs',
      dir: 'lib',
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named'
    },
    plugins: [
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue']
      }),
      vue(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'lib',
        declaration: false
      }),
      commonjs()
    ]
  }
]);