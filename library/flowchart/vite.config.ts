import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        vue: resolve(__dirname, 'src/vue.ts'),
        react: resolve(__dirname, 'src/react.tsx'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : 'cjs';
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: ['vue', 'react', 'react-dom', 'react/jsx-runtime', '@logicflow/core', '@logicflow/extension'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@logicflow/core': 'LogicFlow',
          '@logicflow/extension': 'LogicFlowExtension',
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
  css: {
    modules: false,
  },
});
