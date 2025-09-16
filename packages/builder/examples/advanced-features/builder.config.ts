/**
 * 高级功能配置示例
 * 
 * 展示如何配置和使用新增的高级功能
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 基础构建配置
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  
  // 高级功能配置
  advanced: {
    // 依赖分析配置
    dependencyAnalysis: {
      enabled: true,
      checkSecurity: true,
      analyzeBundleSize: true,
      checkOutdated: true,
      ignorePatterns: [
        '@types/*',
        'eslint-*',
        'prettier',
        'typescript'
      ],
      maxDepth: 5,
      // 自定义分析规则
      rules: {
        // 检测大依赖包
        largeDependencies: {
          threshold: 1024 * 1024, // 1MB
          severity: 'warning'
        },
        // 检测未使用依赖
        unusedDependencies: {
          enabled: true,
          severity: 'error'
        },
        // 检测循环依赖
        circularDependencies: {
          enabled: true,
          severity: 'error'
        }
      }
    },

    // 代码质量分析配置
    codeQuality: {
      enabled: true,
      patterns: [
        'src/**/*.{ts,tsx,js,jsx}',
        '!src/**/*.test.{ts,tsx,js,jsx}',
        '!src/**/*.spec.{ts,tsx,js,jsx}'
      ],
      rules: {
        // 性能规则
        performance: {
          noSyncFs: 'error',
          largeLoop: 'warning',
          memoryLeak: 'error'
        },
        // 安全规则
        security: {
          noEval: 'error',
          noInnerHTML: 'warning',
          noDocumentWrite: 'warning'
        },
        // 可维护性规则
        maintainability: {
          maxFunctionLength: 50,
          maxComplexity: 15,
          duplicateCode: 'warning'
        }
      },
      // 自定义检查器
      customCheckers: [
        {
          name: 'no-console-log',
          pattern: /console\.log/g,
          message: '生产代码中不应使用 console.log',
          severity: 'warning'
        }
      ]
    },

    // 代码分割优化配置
    codeSplitting: {
      enabled: true,
      strategy: 'hybrid', // 'frequency-based' | 'feature-based' | 'hybrid'
      minChunkSize: 20000,
      maxChunkSize: 500000,
      maxParallelRequests: 6,
      maxInitialRequests: 4,
      
      // 缓存组配置
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          minSize: 30000,
          maxSize: 500000,
          minChunks: 1,
          name: 'vendor',
          chunks: 'all'
        },
        common: {
          priority: 5,
          minSize: 10000,
          minChunks: 2,
          name: 'common',
          chunks: 'all'
        },
        utils: {
          test: /[\\/]src[\\/]utils[\\/]/,
          priority: 8,
          minSize: 5000,
          name: 'utils',
          chunks: 'all'
        }
      },

      // 预加载配置
      preload: {
        enabled: true,
        patterns: [
          'critical-*.js',
          'main-*.js'
        ]
      },

      // 预取配置
      prefetch: {
        enabled: true,
        patterns: [
          'feature-*.js',
          'lazy-*.js'
        ]
      }
    },

    // 构建性能分析配置
    performanceAnalysis: {
      enabled: true,
      detailed: true,
      compareWithHistory: true,
      historyLimit: 10,
      
      // 性能阈值
      thresholds: {
        slowPhase: 5000, // 5秒
        highMemory: 500 * 1024 * 1024, // 500MB
        lowCacheHit: 50 // 50%
      },

      // 监控的构建阶段
      phases: [
        'initialization',
        'dependency-resolution',
        'file-scanning',
        'compilation',
        'bundling',
        'optimization',
        'output-generation',
        'validation'
      ],

      // 报告配置
      reporting: {
        console: true,
        file: 'performance-report.json',
        format: 'json' // 'json' | 'html' | 'markdown'
      }
    },

    // 构建缓存配置
    buildCache: {
      enabled: true,
      cacheDir: '.cache/builder',
      maxSize: 200 * 1024 * 1024, // 200MB
      maxEntries: 2000,
      defaultTtl: 3600, // 1小时
      strategy: 'lru', // 'lru' | 'lfu' | 'ttl' | 'size-based'
      compression: true,
      encryption: false,
      cleanupInterval: 300, // 5分钟

      // 缓存策略配置
      strategies: {
        // 依赖解析缓存
        dependencies: {
          ttl: 7200, // 2小时
          tags: ['dependencies'],
          invalidateOn: ['package.json', 'package-lock.json', 'yarn.lock']
        },
        
        // 编译结果缓存
        compilation: {
          ttl: 1800, // 30分钟
          tags: ['compilation'],
          invalidateOn: ['tsconfig.json', 'src/**/*.ts']
        },

        // 分析结果缓存
        analysis: {
          ttl: 3600, // 1小时
          tags: ['analysis'],
          invalidateOn: ['src/**/*']
        }
      },

      // 缓存预热
      prewarming: {
        enabled: true,
        patterns: [
          'src/**/*.ts',
          'package.json',
          'tsconfig.json'
        ]
      }
    }
  },

  // 集成现有配置
  bundler: 'rollup',
  
  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationMap: true,
    sourceMap: true
  },

  // 优化配置
  optimization: {
    minify: true,
    treeshake: true,
    
    // 与代码分割集成
    splitChunks: {
      strategy: 'advanced', // 使用高级分割策略
      automaticNameDelimiter: '-',
      cacheGroups: {
        // 这里会被 advanced.codeSplitting.cacheGroups 覆盖
      }
    }
  },

  // 插件配置
  plugins: [
    // 依赖分析插件
    {
      name: 'dependency-analyzer',
      setup(build) {
        // 在构建开始时运行依赖分析
        build.onStart(async () => {
          if (build.initialOptions.advanced?.dependencyAnalysis?.enabled) {
            console.log('🔍 运行依赖分析...')
            // 这里会集成依赖分析器
          }
        })
      }
    },

    // 性能监控插件
    {
      name: 'performance-monitor',
      setup(build) {
        let performanceAnalyzer: any

        build.onStart(() => {
          if (build.initialOptions.advanced?.performanceAnalysis?.enabled) {
            // 初始化性能分析器
            performanceAnalyzer?.startAnalysis()
          }
        })

        build.onEnd(() => {
          if (performanceAnalyzer) {
            const result = performanceAnalyzer.finishAnalysis()
            console.log(`⚡ 构建完成，耗时: ${result.totalDuration}ms`)
          }
        })
      }
    }
  ],

  // 开发服务器配置
  dev: {
    // 启用高级功能的开发模式
    advanced: {
      hotReload: true,
      incrementalAnalysis: true,
      cacheOptimization: true
    }
  },

  // 构建钩子
  hooks: {
    'build:start': async (context) => {
      console.log('🚀 开始构建，启用高级功能...')
      
      // 初始化高级功能
      if (context.config.advanced?.buildCache?.enabled) {
        // 初始化缓存管理器
      }
      
      if (context.config.advanced?.performanceAnalysis?.enabled) {
        // 启动性能监控
      }
    },

    'build:end': async (context, result) => {
      console.log('✅ 构建完成')
      
      // 生成分析报告
      if (context.config.advanced?.codeQuality?.enabled) {
        console.log('📊 生成代码质量报告...')
      }
      
      if (context.config.advanced?.performanceAnalysis?.enabled) {
        console.log('⚡ 生成性能分析报告...')
      }
    },

    'analyze:complete': async (context, analysisResult) => {
      // 分析完成后的处理
      console.log('🔍 分析完成，发现以下问题:')
      
      if (analysisResult.dependencies?.unusedDependencies?.length > 0) {
        console.log(`  - ${analysisResult.dependencies.unusedDependencies.length} 个未使用的依赖`)
      }
      
      if (analysisResult.quality?.issues?.length > 0) {
        console.log(`  - ${analysisResult.quality.issues.length} 个代码质量问题`)
      }
      
      if (analysisResult.performance?.bottlenecks?.length > 0) {
        console.log(`  - ${analysisResult.performance.bottlenecks.length} 个性能瓶颈`)
      }
    }
  }
})

// 导出类型定义以供其他配置文件使用
export type AdvancedBuilderConfig = typeof import('./builder.config').default
