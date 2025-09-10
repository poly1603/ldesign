import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        vue: resolve(__dirname, 'src/vue/index.ts'),
      },
      name: 'LDesignQRCode',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'qrcode'],
      output: {
        globals: {
          vue: 'Vue',
          qrcode: 'QRCode',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['__tests__/**/*.ts'],
    exclude: [
      'examples/**/tests/e2e/**',
      'node_modules/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        'examples/**/tests/e2e/**',
      ],
    },
  },
})
