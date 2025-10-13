import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8089,
    host: true,
    open: true,
    force: true, // Force optimizer to re-bundle
  },
  optimizeDeps: {
    force: true, // Force re-optimization of dependencies
  },
});
