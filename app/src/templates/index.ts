import { createTemplateEnginePlugin } from "@ldesign/template";

export const templatePlugin = createTemplateEnginePlugin({
  // 基础配置
  templatesDir: 'src/templates',
  autoScan: true,
  enableHMR: true,
  defaultDevice: 'desktop',
  enablePerformanceMonitor: true,
  debug: true,

  // 使用向后兼容的简化配置
  cache: true, // 启用缓存
  cacheLimit: 50, // 缓存限制
  preloadTemplates: ['login', 'home'], // 预加载模板

  // 设备断点配置（向后兼容）
  mobileBreakpoint: 768,
  tabletBreakpoint: 992,
  desktopBreakpoint: 1200,
})