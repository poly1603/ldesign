import { createTemplateEnginePlugin } from "@ldesign/template";
// 导入template包的样式文件
// 在开发环境中，这些路径会通过别名解析到源码目录
// 在生产环境中，会使用构建后的包中的样式文件
import "@ldesign/template/es/index.css";


export const templatePlugin = createTemplateEnginePlugin({
  // 基础配置 - 指向packages中的模板目录
  autoScan: true,
  enableHMR: true,
  defaultDevice: 'desktop',
  enablePerformanceMonitor: false, // 禁用性能监控以减少控制台输出
  debug: false, // 禁用调试模式以减少控制台输出

  // 使用向后兼容的简化配置
  cache: true, // 启用缓存
  cacheLimit: 50, // 缓存限制
  preloadTemplates: ['login', 'home'], // 预加载模板

  // 设备断点配置（向后兼容）
  mobileBreakpoint: 768,
  tabletBreakpoint: 992,
  desktopBreakpoint: 1200,
})