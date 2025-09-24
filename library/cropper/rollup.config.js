import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import vue from 'rollup-plugin-vue';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * 
 * @author ${pkg.author}
 * @license ${pkg.license}
 * @homepage ${pkg.homepage || `https://github.com/ldesign/cropper`}
 */`;

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  'vue',
  'react',
  'react-dom',
  '@angular/core'
];

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    declarationMap: false
  })
];

const minifyPlugin = terser({
  format: {
    comments: /^!/
  },
  compress: {
    drop_console: true,
    drop_debugger: true
  }
});

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    external,
    plugins
  },

  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.cjs',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named'
    },
    external,
    plugins
  },

  // UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LDesignCropper',
      banner,
      sourcemap: true,
      globals: {
        'vue': 'Vue',
        'react': 'React',
        'react-dom': 'ReactDOM',
        '@angular/core': 'ng.core'
      }
    },
    external: ['vue', 'react', 'react-dom', '@angular/core'],
    plugins: [...plugins, minifyPlugin]
  },

  // Vue integration build
  {
    input: 'src/integrations/vue/index.ts',
    output: [
      {
        file: 'dist/esm/vue/index.js',
        format: 'es',
        banner,
        sourcemap: true
      },
      {
        file: 'dist/cjs/vue/index.cjs',
        format: 'cjs',
        banner,
        sourcemap: true,
        exports: 'named'
      }
    ],
    external: [...external, '../..'],
    plugins: [
      ...plugins,
      vue({
        target: 'browser'
      })
    ]
  },

  // React integration build
  {
    input: 'src/integrations/react/index.ts',
    output: [
      {
        file: 'dist/esm/react/index.js',
        format: 'es',
        banner,
        sourcemap: true
      },
      {
        file: 'dist/cjs/react/index.cjs',
        format: 'cjs',
        banner,
        sourcemap: true,
        exports: 'named'
      }
    ],
    external: [...external, '../..'],
    plugins
  },

  // Angular integration build
  {
    input: 'src/integrations/angular/index.ts',
    output: [
      {
        file: 'dist/esm/angular/index.js',
        format: 'es',
        banner,
        sourcemap: true
      },
      {
        file: 'dist/cjs/angular/index.cjs',
        format: 'cjs',
        banner,
        sourcemap: true,
        exports: 'named'
      }
    ],
    external: [...external, '../..'],
    plugins
  },

  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [
      dts({
        respectExternal: true
      })
    ]
  },

  // Vue types
  {
    input: 'src/integrations/vue/index.ts',
    output: {
      file: 'dist/vue/index.d.ts',
      format: 'es'
    },
    plugins: [
      dts({
        respectExternal: true
      })
    ]
  },

  // React types
  {
    input: 'src/integrations/react/index.ts',
    output: {
      file: 'dist/react/index.d.ts',
      format: 'es'
    },
    plugins: [
      dts({
        respectExternal: true
      })
    ]
  },

  // Angular types
  {
    input: 'src/integrations/angular/index.ts',
    output: {
      file: 'dist/angular/index.d.ts',
      format: 'es'
    },
    plugins: [
      dts({
        respectExternal: true
      })
    ]
  }
]);