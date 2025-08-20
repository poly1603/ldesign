import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        cli: resolve(__dirname, 'src/cli.ts')
      },
      name: 'ViteLauncher',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'vite',
        'fs',
        'fs/promises',
        'path',
        'child_process',
        'commander',
        'chalk',
        'ora',
        'inquirer',
        'semver',
        'glob',
        'fast-glob',
        'picocolors',
        'esbuild',
        'rollup'
      ],
      output: {
        globals: {
          vite: 'Vite'
        }
      }
    },
    target: 'node14',
    minify: false,
    sourcemap: true
  },
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      rollupTypes: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
});