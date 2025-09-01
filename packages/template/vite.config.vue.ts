import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    lib: {
      entry: {
        'vue/index': resolve(__dirname, 'src/vue/index.ts'),
        'vue/components/TemplateRenderer': resolve(__dirname, 'src/vue/components/TemplateRenderer.vue'),
        'vue/components/TemplateSelector': resolve(__dirname, 'src/vue/components/TemplateSelector.vue'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/reactivity',
        '@vue/shared',
        '@ldesign/cache',
        '@ldesign/device',
        '@ldesign/engine',
        '@ldesign/shared',
        '@vueuse/core',
      ],
      output: [
        {
          format: 'es',
          dir: 'esm',
          entryFileNames: '[name].js',
          preserveModules: false,
        },
        {
          format: 'cjs',
          dir: 'cjs',
          entryFileNames: '[name].js',
          preserveModules: false,
        },
      ],
    },
    outDir: 'dist-vue',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
