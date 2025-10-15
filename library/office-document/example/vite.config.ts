import { defineConfig } from 'vite';

export default defineConfig({
 server: {
  port: 3000,
  open: true
 },
 build: {
  outDir: 'dist',
  commonjsOptions: {
   include: [/node_modules/],
   transformMixedEsModules: true
  }
 },
 optimizeDeps: {
  include: ['docx-preview', 'xlsx', 'x-data-spreadsheet', 'jszip']
 }
});
