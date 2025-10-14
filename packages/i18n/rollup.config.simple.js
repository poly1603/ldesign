import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const external = ['vue', '@ldesign/shared', '@ldesign/engine'];

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
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      }),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'es',
        declaration: true,
        declarationDir: 'es',
        // 跳过类型检查
        noEmitOnError: false,
        // 忽略诊断
        filterDiagnostics: () => false
      }),
      commonjs()
    ]
  }
]);