import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/flowchart.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/flowchart.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/flowchart.umd.js',
        format: 'umd',
        name: 'FlowChart',
        sourcemap: true,
        exports: 'named'
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/types'
      })
    ]
  },
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/flowchart.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];

export default config;





