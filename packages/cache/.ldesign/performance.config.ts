/**
 * 性能优化配置
 * 用于配置打包体积优化、代码分割和性能监控
 */

export interface PerformanceConfig {
  // 打包体积限制
  bundleSize: {
    // 主入口文件限制 (gzip)
    main: string
    // 单个模块限制 (gzip)
    module: string
    // 总体积限制 (gzip)
    total: string
  }
  
  // 代码分割配置
  codeSplitting: {
    // 是否启用代码分割
    enabled: boolean
    // 分割策略
    strategy: 'module' | 'feature' | 'size'
    // 最小分割大小
    minSize: number
    // 最大分割大小
    maxSize: number
  }
  
  // Tree Shaking 配置
  treeShaking: {
    // 是否启用
    enabled: boolean
    // 副作用标记
    sideEffects: boolean | string[]
    // 未使用导出检测
    unusedExports: boolean
  }
  
  // 压缩配置
  compression: {
    // 是否启用压缩
    enabled: boolean
    // 压缩级别
    level: number
    // 压缩算法
    algorithm: 'gzip' | 'brotli' | 'both'
  }
  
  // 性能监控
  monitoring: {
    // 是否启用性能监控
    enabled: boolean
    // 监控指标
    metrics: string[]
    // 报告格式
    reportFormat: 'json' | 'html' | 'text'
  }
}

export const performanceConfig: PerformanceConfig = {
  bundleSize: {
    main: '30 KB',      // 主入口文件限制
    module: '15 KB',    // 单个模块限制
    total: '150 KB'     // 总体积限制
  },
  
  codeSplitting: {
    enabled: true,
    strategy: 'feature',
    minSize: 10000,     // 10KB
    maxSize: 50000      // 50KB
  },
  
  treeShaking: {
    enabled: true,
    sideEffects: false,
    unusedExports: true
  },
  
  compression: {
    enabled: true,
    level: 9,
    algorithm: 'both'
  },
  
  monitoring: {
    enabled: true,
    metrics: [
      'bundleSize',
      'loadTime',
      'parseTime',
      'executeTime',
      'memoryUsage'
    ],
    reportFormat: 'json'
  }
}

export default performanceConfig
