import { createRouterEnginePlugin } from "@ldesign/router";
import { routes } from "./routes";

export const routerPlugin = createRouterEnginePlugin({
  name: 'ldesign-demo-router',
  version: '1.0.0',
  routes,
  mode: 'hash', // 使用hash模式，避免服务器配置问题
  base: '/',
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'router-link-exact-active',

  // 使用SPA预设配置
  preset: 'spa',

  // 启用预加载
  preload: {
    strategy: 'hover',
    delay: 200,
    enabled: true
  },

  // 启用缓存
  cache: {
    maxSize: 10,
    strategy: 'memory',
    enabled: true
  },

  // 启用动画
  animation: {
    type: 'fade',
    duration: 300,
    enabled: true
  },

  // 性能配置
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enablePrefetch: true,
    cacheSize: 20
  },

  // 开发配置
  development: {
    enableDevtools: true,
    enableHotReload: true,
    enableDebugMode: true
  }
})