import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ldesign/grid/react': path.resolve(__dirname, '../../src/adapters/react'),
      '@ldesign/grid': path.resolve(__dirname, '../../src')
    }
  }
})




