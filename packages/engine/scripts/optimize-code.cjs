/**
 * 代码优化和清理脚本
 * 识别并处理冗余代码、合并重复功能、优化文件结构
 */

const fs = require('fs');
const path = require('path');

// 要优化的问题列表
const optimizationTasks = {
  duplicatedCacheManagers: {
    files: [
      'src/utils/cache-manager.ts',
      'src/cache/cache-manager.ts',
      'src/cache/advanced-cache.ts'
    ],
    issue: '存在多个缓存管理器实现，功能有重叠',
    solution: '合并为单一的高级缓存管理器，提供分层缓存能力'
  },
  
  duplicatedPerformanceTools: {
    files: [
      'src/utils/performance-monitor.ts',
      'src/utils/performance-analyzer.ts',
      'src/utils/performance-optimizer.ts',
      'src/utils/realtime-performance-monitor.ts',
      'src/performance/performance-manager.ts'
    ],
    issue: '性能监控工具分散在多个文件中',
    solution: '整合到 performance 目录下的统一管理器'
  },

  duplicatedMemoryManagement: {
    files: [
      'src/utils/memory-manager.ts',
      'src/cache/cache-manager.ts' // 内存管理部分
    ],
    issue: '内存管理功能分散',
    solution: '将内存管理功能整合到专门的内存管理器'
  },

  duplicatedLogging: {
    files: [
      'src/logger/logger.ts',
      'src/utils/logging-system.ts'
    ],
    issue: '存在两个日志系统实现',
    solution: '合并为一个统一的日志系统'
  },

  debugLogStatements: {
    pattern: /console\.(log|warn|error|debug)/g,
    issue: '存在未移除的调试日志语句',
    solution: '使用统一的日志系统替换 console 语句'
  },

  todoComments: {
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX|deprecated)/gi,
    issue: '存在待处理的 TODO/FIXME 注释',
    solution: '处理或记录这些待办事项'
  },

  demoAndExampleFiles: {
    files: [
      'src/dialog/plugins/delete-confirm.demo.html',
      'src/dialog/plugins/delete-confirm.example.ts'
    ],
    issue: '源代码目录中包含示例文件',
    solution: '将示例文件移至 examples 目录'
  },

  largeFiles: {
    maxSize: 25 * 1024, // 25KB
    files: [
      'src/notifications/notification-manager.ts', // 36.84KB
      'src/performance/performance-dashboard.ts',   // 32.73KB
      'src/utils/performance-analyzer.ts',          // 29.2KB
      'src/utils/memory-manager.ts'                 // 28.09KB
    ],
    issue: '文件过大，需要拆分',
    solution: '将大文件拆分为更小的模块'
  },

  unusedExports: {
    issue: '存在未使用的导出',
    solution: '移除未使用的导出以减小包体积'
  }
};

// 检查重复代码
function findDuplicatedCode() {
  console.log('\n🔍 检查重复代码...\n');
  
  const results = [];
  
  // 检查缓存管理器重复
  const cacheManagers = [
    'src/cache/cache-manager.ts',
    'src/cache/advanced-cache.ts',
    'src/utils/cache-manager.ts'
  ];
  
  console.log('📦 缓存管理器分析:');
  cacheManagers.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`  - ${file}: ${(stats.size / 1024).toFixed(2)}KB`);
    }
  });
  console.log('  建议: 合并这些缓存管理器为一个统一的实现\n');
  
  return results;
}

// 查找调试日志
function findDebugLogs() {
  console.log('🐛 查找调试日志语句...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const results = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(/console\.(log|warn|error|debug)/g);
        
        if (matches && matches.length > 0) {
          results.push({
            file: path.relative(srcDir, filePath),
            count: matches.length,
            types: [...new Set(matches.map(m => m.split('.')[1]))]
          });
        }
      }
    });
  }
  
  walkDir(srcDir);
  
  console.log(`找到 ${results.length} 个文件包含 console 语句:`);
  results.slice(0, 10).forEach(r => {
    console.log(`  - ${r.file}: ${r.count} 个 (${r.types.join(', ')})`);
  });
  
  if (results.length > 10) {
    console.log(`  ... 还有 ${results.length - 10} 个文件`);
  }
  
  return results;
}

// 查找 TODO/FIXME
function findTodoComments() {
  console.log('\n📝 查找 TODO/FIXME 注释...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const results = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (/\/\/\s*(TODO|FIXME|HACK|XXX|deprecated)/gi.test(line)) {
            results.push({
              file: path.relative(srcDir, filePath),
              line: index + 1,
              content: line.trim()
            });
          }
        });
      }
    });
  }
  
  walkDir(srcDir);
  
  console.log(`找到 ${results.length} 个待处理注释:`);
  results.slice(0, 10).forEach(r => {
    console.log(`  - ${r.file}:${r.line}: ${r.content.substring(0, 60)}...`);
  });
  
  if (results.length > 10) {
    console.log(`  ... 还有 ${results.length - 10} 个注释`);
  }
  
  return results;
}

// 分析大文件
function analyzeLargeFiles() {
  console.log('\n📊 分析大文件...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const largeFiles = [];
  const threshold = 25 * 1024; // 25KB
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        if (stat.size > threshold) {
          largeFiles.push({
            file: path.relative(srcDir, filePath),
            size: (stat.size / 1024).toFixed(2) + 'KB',
            lines: fs.readFileSync(filePath, 'utf8').split('\n').length
          });
        }
      }
    });
  }
  
  walkDir(srcDir);
  
  largeFiles.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  
  console.log(`找到 ${largeFiles.length} 个超过 25KB 的文件:`);
  largeFiles.forEach(f => {
    console.log(`  - ${f.file}: ${f.size} (${f.lines} 行)`);
  });
  
  return largeFiles;
}

// 生成优化建议
function generateOptimizationSuggestions() {
  console.log('\n💡 优化建议:\n');
  
  const suggestions = [
    {
      priority: 'HIGH',
      title: '合并缓存管理器',
      description: '将 utils/cache-manager.ts、cache/cache-manager.ts 和 cache/advanced-cache.ts 合并为一个统一的高级缓存管理器',
      files: ['src/cache/index.ts'],
      estimatedReduction: '~30KB'
    },
    {
      priority: 'HIGH',
      title: '整合性能监控工具',
      description: '将分散的性能监控工具整合到 performance 目录下',
      files: [
        'src/utils/performance-monitor.ts',
        'src/utils/performance-analyzer.ts',
        'src/utils/realtime-performance-monitor.ts'
      ],
      estimatedReduction: '~40KB'
    },
    {
      priority: 'MEDIUM',
      title: '统一日志系统',
      description: '合并 logger/logger.ts 和 utils/logging-system.ts',
      files: ['src/logger/index.ts'],
      estimatedReduction: '~15KB'
    },
    {
      priority: 'MEDIUM',
      title: '移除调试代码',
      description: '将所有 console.log 替换为统一的日志系统调用',
      estimatedReduction: '~5KB'
    },
    {
      priority: 'LOW',
      title: '移动示例文件',
      description: '将 demo 和 example 文件移至 examples 目录',
      files: [
        'src/dialog/plugins/delete-confirm.demo.html',
        'src/dialog/plugins/delete-confirm.example.ts'
      ],
      estimatedReduction: '~25KB'
    },
    {
      priority: 'MEDIUM',
      title: '拆分大文件',
      description: '将超过 25KB 的文件拆分为更小的模块',
      files: [
        'src/notifications/notification-manager.ts',
        'src/performance/performance-dashboard.ts'
      ],
      estimatedReduction: '改善代码可维护性'
    }
  ];
  
  let totalReduction = 0;
  
  suggestions.forEach(s => {
    console.log(`[${s.priority}] ${s.title}`);
    console.log(`  ${s.description}`);
    if (s.estimatedReduction) {
      console.log(`  预计减少: ${s.estimatedReduction}`);
      if (s.estimatedReduction.includes('KB')) {
        totalReduction += parseInt(s.estimatedReduction.match(/\d+/)[0]);
      }
    }
    console.log('');
  });
  
  console.log(`\n📉 预计总共可减少约 ${totalReduction}KB 的代码量\n`);
  
  return suggestions;
}

// 生成优化报告
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    duplicatedCode: findDuplicatedCode(),
    debugLogs: findDebugLogs(),
    todoComments: findTodoComments(),
    largeFiles: analyzeLargeFiles(),
    suggestions: generateOptimizationSuggestions()
  };
  
  // 保存报告
  const reportPath = path.join(__dirname, '..', 'optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n✅ 优化报告已生成: optimization-report.json\n');
  
  return report;
}

// 执行优化分析
console.log('🚀 开始代码优化分析...\n');
console.log('=' .repeat(60));

const report = generateReport();

console.log('=' .repeat(60));
console.log('\n🎯 下一步行动:');
console.log('1. 查看 optimization-report.json 获取详细报告');
console.log('2. 按照优先级处理优化建议');
console.log('3. 运行测试确保功能正常');
console.log('4. 重新构建并检查包大小\n');