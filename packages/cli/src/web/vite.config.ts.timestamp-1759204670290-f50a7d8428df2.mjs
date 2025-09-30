// vite.config.ts
import { defineConfig } from "file:///D:/WorkBench/ldesign/node_modules/.pnpm/vite@4.5.14_@types+node@20.19.16_less@4.4.1_sass@1.93.0_stylus@0.64.0_terser@5.44.0/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/WorkBench/ldesign/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@4.5.14_@types+node@20.19.16_less@4.4.1_sass@1.93.0_stylus@0.64._iw3f42stuthob5sysufw4cfh6u/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "D:\\WorkBench\\ldesign\\packages\\cli\\src\\web";
var vite_config_default = defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ],
  // 开发服务器配置
  server: {
    port: 3001,
    host: "0.0.0.0",
    cors: true,
    proxy: {
      // 代理 API 请求到后端服务器
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      },
      // 代理 WebSocket 连接
      "/ws": {
        target: "ws://localhost:3000",
        ws: true,
        changeOrigin: true
      }
    }
  },
  // 构建配置
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    target: "es2020",
    rollupOptions: {
      input: {
        main: resolve(__vite_injected_original_dirname, "index.html")
      },
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"],
          utils: ["./src/composables/useApi", "./src/composables/useWebSocket"]
        }
      }
    }
  },
  // 路径解析
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src"),
      "~": resolve(__vite_injected_original_dirname, "./src")
    }
  },
  // CSS 配置
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `
          // \u81EA\u52A8\u5BFC\u5165\u8BBE\u8BA1\u7CFB\u7EDF\u53D8\u91CF
          @import "@/styles/variables.less";
        `
      }
    }
  },
  // 环境变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },
  // 优化配置
  optimizeDeps: {
    include: ["vue", "vue-router"]
  },
  // 预览服务器配置
  preview: {
    port: 3002,
    host: "0.0.0.0",
    cors: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxXb3JrQmVuY2hcXFxcbGRlc2lnblxcXFxwYWNrYWdlc1xcXFxjbGlcXFxcc3JjXFxcXHdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcV29ya0JlbmNoXFxcXGxkZXNpZ25cXFxccGFja2FnZXNcXFxcY2xpXFxcXHNyY1xcXFx3ZWJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1dvcmtCZW5jaC9sZGVzaWduL3BhY2thZ2VzL2NsaS9zcmMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7LyoqXG4gKiBWaXRlIFx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlxuICogXHU3NTI4XHU0RThFXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU3Njg0XHU1MjREXHU3QUVGXHU2Nzg0XHU1RUZBXG4gKi9cblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoe1xuICAgICAgc2NyaXB0OiB7XG4gICAgICAgIGRlZmluZU1vZGVsOiB0cnVlLFxuICAgICAgICBwcm9wc0Rlc3RydWN0dXJlOiB0cnVlXG4gICAgICB9XG4gICAgfSlcbiAgXSxcblxuICAvLyBcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMSxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgY29yczogdHJ1ZSxcbiAgICBwcm94eToge1xuICAgICAgLy8gXHU0RUUzXHU3NDA2IEFQSSBcdThCRjdcdTZDNDJcdTUyMzBcdTU0MEVcdTdBRUZcdTY3MERcdTUyQTFcdTU2NjhcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICAvLyBcdTRFRTNcdTc0MDYgV2ViU29ja2V0IFx1OEZERVx1NjNBNVxuICAgICAgJy93cyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnd3M6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAgIHdzOiB0cnVlLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBtYWluOiByZXNvbHZlKF9fZGlybmFtZSwgJ2luZGV4Lmh0bWwnKVxuICAgICAgfSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICB2ZW5kb3I6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInXSxcbiAgICAgICAgICB1dGlsczogWycuL3NyYy9jb21wb3NhYmxlcy91c2VBcGknLCAnLi9zcmMvY29tcG9zYWJsZXMvdXNlV2ViU29ja2V0J11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBcdThERUZcdTVGODRcdTg5RTNcdTY3OTBcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICd+JzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpXG4gICAgfVxuICB9LFxuXG4gIC8vIENTUyBcdTkxNERcdTdGNkVcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgbGVzczoge1xuICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgYWRkaXRpb25hbERhdGE6IGBcbiAgICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdThCQkVcdThCQTFcdTdDRkJcdTdFREZcdTUzRDhcdTkxQ0ZcbiAgICAgICAgICBAaW1wb3J0IFwiQC9zdHlsZXMvdmFyaWFibGVzLmxlc3NcIjtcbiAgICAgICAgYFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcbiAgZGVmaW5lOiB7XG4gICAgX19WVUVfT1BUSU9OU19BUElfXzogdHJ1ZSxcbiAgICBfX1ZVRV9QUk9EX0RFVlRPT0xTX186IGZhbHNlXG4gIH0sXG5cbiAgLy8gXHU0RjE4XHU1MzE2XHU5MTREXHU3RjZFXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInXVxuICB9LFxuXG4gIC8vIFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogMzAwMixcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgY29yczogdHJ1ZVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUtBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixTQUFTLGVBQWU7QUFQeEIsSUFBTSxtQ0FBbUM7QUFTekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0YsUUFBUTtBQUFBLFFBQ04sYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsTUFDcEI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUE7QUFBQSxFQUdBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLE1BRUwsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQTtBQUFBLE1BRUEsT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFFBQ1IsSUFBSTtBQUFBLFFBQ0osY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsTUFBTSxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUN2QztBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLE9BQU8sWUFBWTtBQUFBLFVBQzVCLE9BQU8sQ0FBQyw0QkFBNEIsZ0NBQWdDO0FBQUEsUUFDdEU7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUMvQixLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixtQkFBbUI7QUFBQSxRQUNuQixnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLFFBQVE7QUFBQSxJQUNOLHFCQUFxQjtBQUFBLElBQ3JCLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQUE7QUFBQSxFQUdBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxPQUFPLFlBQVk7QUFBQSxFQUMvQjtBQUFBO0FBQUEsRUFHQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
