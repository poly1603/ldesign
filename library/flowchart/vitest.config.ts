import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'example/',
        '**/*.config.*',
        '**/types/',
        '**/*.d.ts'
      ]
    },
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'example']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

