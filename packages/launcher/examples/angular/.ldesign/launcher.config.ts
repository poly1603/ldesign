import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3007,
    open: false,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020'
  },
  launcher: {
    logLevel: 'info',
    mode: 'development'
  },
  esbuild: {
    tsconfig: 'tsconfig.json',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false
      }
    }
  }
})
