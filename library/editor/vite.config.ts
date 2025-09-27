import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/plugins': resolve(__dirname, 'src/plugins'),
      '@/ui': resolve(__dirname, 'src/ui'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
    },
  },
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EnhancedRichEditor',
      formats: ['es', 'umd'],
      fileName: (format) => {
        return format === 'es' ? 'index.js' : `index.${format}.js`;
      },
    },
    
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'vue',
        '@angular/core',
        '@angular/common',
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'vue': 'Vue',
          '@angular/core': 'ng.core',
          '@angular/common': 'ng.common',
        },
      },
    },
    
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'examples/',
        'docs/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  
  server: {
    port: 3000,
    open: true,
  },
  
  preview: {
    port: 4173,
  },
});
