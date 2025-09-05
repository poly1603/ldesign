import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
// import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

export const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export const basePlugins = (tsConfig = {}) => [
  resolve({
    extensions,
    preferBuiltins: false,
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    ...tsConfig
  }),
  babel({
    extensions,
    babelHelpers: 'runtime',
    exclude: 'node_modules/**',
    presets: [
      ['@babel/preset-env', { modules: false }],
      '@babel/preset-typescript'
    ]
  }),
  postcss({
    extract: false,
    modules: false,
    minimize: true,
  }),
];

export const createConfig = ({
  input,
  external = [],
  plugins = [],
  packageJson,
  outputDir = 'dist'
}) => {
  const configs = [];

  // ESM build
  configs.push({
    input,
    external: [
      ...external,
      id => /^@?babel\/runtime/.test(id),
    ],
    plugins: [
      ...basePlugins(),
      ...plugins
    ],
    output: {
      dir: `${outputDir}/es`,
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
      exports: 'named',
    },
  });

  // CommonJS build
  configs.push({
    input,
    external: [
      ...external,
      id => /^@?babel\/runtime/.test(id),
    ],
    plugins: [
      ...basePlugins(),
      ...plugins
    ],
    output: {
      dir: `${outputDir}/lib`,
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
      exports: 'named',
    },
  });

  // UMD build
  if (packageJson.umd) {
    configs.push({
      input,
      external,
      plugins: [
        ...basePlugins(),
        ...plugins
        // terser()
      ],
      output: {
        file: `${outputDir}/dist/${packageJson.umd.name}.min.js`,
        format: 'umd',
        name: packageJson.umd.global,
        sourcemap: true,
        globals: packageJson.umd.globals || {},
        exports: 'named',
      },
    });
  }

  // Type definitions
  configs.push({
    input,
    external,
    plugins: [dts()],
    output: {
      file: `${outputDir}/index.d.ts`,
      format: 'es',
    },
  });

  return configs;
};

export default { createConfig, basePlugins, extensions };
