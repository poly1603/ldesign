#!/usr/bin/env node

/**
 * 改进版：替换所有console语句为统一的日志系统
 * 特点：
 * 1. 更精确的模式匹配
 * 2. 处理多种console调用格式
 * 3. 智能导入管理
 * 4. 更好的上下文识别
 */

const fs = require('fs');
const path = require('path');

// 要排除的目录（更精确的排除列表）
const excludeDirs = [
  'node_modules',
  '.git',
  'dist',
  'lib',
  'es',
  'coverage',
  '.vscode',
  '.idea',
  'build'
];

// 要处理的文件扩展名
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue'];

// 改进的替换规则 - 处理更多的console变体
const consolePatterns = [
  // 标准console调用
  { regex: /\bconsole\s*\.\s*log\s*\(/g, replacement: 'logger.debug(', type: 'log' },
  { regex: /\bconsole\s*\.\s*warn\s*\(/g, replacement: 'logger.warn(', type: 'warn' },
  { regex: /\bconsole\s*\.\s*error\s*\(/g, replacement: 'logger.error(', type: 'error' },
  { regex: /\bconsole\s*\.\s*info\s*\(/g, replacement: 'logger.info(', type: 'info' },
  { regex: /\bconsole\s*\.\s*debug\s*\(/g, replacement: 'logger.debug(', type: 'debug' },
  { regex: /\bconsole\s*\.\s*trace\s*\(/g, replacement: 'logger.trace(', type: 'trace' },
  
  // console.time/timeEnd等
  { regex: /\bconsole\s*\.\s*time\s*\(/g, replacement: 'logger.time(', type: 'time' },
  { regex: /\bconsole\s*\.\s*timeEnd\s*\(/g, replacement: 'logger.timeEnd(', type: 'timeEnd' },
  { regex: /\bconsole\s*\.\s*group\s*\(/g, replacement: 'logger.group(', type: 'group' },
  { regex: /\bconsole\s*\.\s*groupEnd\s*\(/g, replacement: 'logger.groupEnd(', type: 'groupEnd' },
  { regex: /\bconsole\s*\.\s*table\s*\(/g, replacement: 'logger.table(', type: 'table' },
  { regex: /\bconsole\s*\.\s*dir\s*\(/g, replacement: 'logger.dir(', type: 'dir' },
  { regex: /\bconsole\s*\.\s*assert\s*\(/g, replacement: 'logger.assert(', type: 'assert' },
  { regex: /\bconsole\s*\.\s*count\s*\(/g, replacement: 'logger.count(', type: 'count' },
];

// 统计信息
const stats = {
  totalFiles: 0,
  modifiedFiles: 0,
  totalReplacements: 0,
  skippedFiles: [],
  errorFiles: [],
  replacementDetails: new Map()
};

/**
 * 检查是否应该排除路径
 */
function shouldExclude(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // 排除目录
  for (const dir of excludeDirs) {
    if (normalizedPath.includes(`/${dir}/`) || normalizedPath.includes(`\\${dir}\\`)) {
      return true;
    }
  }
  
  // 排除测试文件
  if (normalizedPath.match(/\.(spec|test|e2e)\.(ts|tsx|js|jsx)$/)) {
    return true;
  }
  
  // 排除类型定义文件
  if (normalizedPath.endsWith('.d.ts')) {
    return true;
  }
  
  // 排除logger相关文件本身
  if (normalizedPath.includes('logger') || normalizedPath.includes('logging')) {
    return true;
  }
  
  return false;
}

/**
 * 分析文件内容，决定如何处理logger
 */
function analyzeFileContext(content) {
  const analysis = {
    hasClass: false,
    hasExport: false,
    hasDefaultExport: false,
    isVueComponent: false,
    isReactComponent: false,
    hasExistingLogger: false,
    needsLoggerImport: false,
    isModuleFile: false,
    className: null
  };
  
  // 检查是否已有logger
  analysis.hasExistingLogger = /\blogger\b|\bLogger\b/.test(content);
  
  // 检查类定义
  const classMatch = content.match(/(?:export\s+)?(?:default\s+)?class\s+(\w+)/);
  if (classMatch) {
    analysis.hasClass = true;
    analysis.className = classMatch[1];
  }
  
  // 检查Vue组件
  analysis.isVueComponent = content.includes('<template>') || 
                           content.includes('defineComponent') ||
                           content.includes('Vue.extend');
  
  // 检查React组件
  analysis.isReactComponent = content.includes('React.Component') ||
                              content.includes('React.FC') ||
                              content.includes('useState') ||
                              content.includes('useEffect');
  
  // 检查模块类型
  analysis.isModuleFile = content.includes('export ') || content.includes('import ');
  
  // 检查export类型
  analysis.hasExport = /export\s+(?:const|let|var|function|class)/.test(content);
  analysis.hasDefaultExport = /export\s+default/.test(content);
  
  return analysis;
}

/**
 * 获取logger实例代码
 */
function getLoggerInstanceCode(analysis, filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  
  if (analysis.hasClass && analysis.className) {
    // 类文件：添加私有属性
    return {
      property: `  private logger = getLogger('${analysis.className}');`,
      usage: 'this.logger'
    };
  } else if (analysis.isVueComponent) {
    // Vue组件：在setup或data中添加
    return {
      setup: `const logger = getLogger('${fileName}');`,
      usage: 'logger'
    };
  } else {
    // 普通模块文件：创建模块级logger
    return {
      instance: `const logger = getLogger('${fileName}');`,
      usage: 'logger'
    };
  }
}

/**
 * 添加logger导入语句
 */
function addLoggerImport(content, filePath) {
  // 如果已有logger导入，跳过
  if (content.includes('getLogger') || content.includes('from "../logger"')) {
    return content;
  }
  
  // 计算相对路径
  const fileDir = path.dirname(filePath);
  const srcDir = path.join(process.cwd(), 'src');
  const relativePath = path.relative(fileDir, path.join(srcDir, 'utils', 'unified-logger.ts'))
    .replace(/\\/g, '/')
    .replace(/\.ts$/, '');
  
  const importStatement = `import { getLogger } from '${relativePath}';\n`;
  
  // 查找合适的插入位置
  const importMatches = content.match(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm);
  
  if (importMatches && importMatches.length > 0) {
    // 在最后一个import后添加
    const lastImport = importMatches[importMatches.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    
    return content.slice(0, insertPosition) + '\n' + importStatement + content.slice(insertPosition);
  } else {
    // 在文件开头添加（跳过可能的注释）
    const firstNonCommentLine = content.match(/^(?!\/\/|\/\*|\s*$).*/m);
    if (firstNonCommentLine) {
      const insertIndex = content.indexOf(firstNonCommentLine[0]);
      return content.slice(0, insertIndex) + importStatement + '\n' + content.slice(insertIndex);
    }
    
    return importStatement + '\n' + content;
  }
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 分析文件上下文
    const analysis = analyzeFileContext(content);
    
    // 统计替换
    let replacementCount = 0;
    const replacementTypes = new Map();
    
    // 检查是否有需要替换的console语句
    let hasConsole = false;
    for (const pattern of consolePatterns) {
      if (pattern.regex.test(content)) {
        hasConsole = true;
        break;
      }
    }
    
    if (!hasConsole) {
      return; // 没有console语句，跳过
    }
    
    // 执行替换
    for (const pattern of consolePatterns) {
      const matches = content.match(pattern.regex);
      if (matches) {
        const count = matches.length;
        replacementCount += count;
        replacementTypes.set(pattern.type, (replacementTypes.get(pattern.type) || 0) + count);
        
        // 根据上下文决定替换方式
        if (analysis.hasClass) {
          // 类中使用this.logger
          content = content.replace(pattern.regex, 'this.' + pattern.replacement);
        } else {
          // 其他情况直接使用logger
          content = content.replace(pattern.regex, pattern.replacement);
        }
      }
    }
    
    // 如果有替换且没有logger，添加logger
    if (replacementCount > 0 && !analysis.hasExistingLogger) {
      // 添加导入
      content = addLoggerImport(content, filePath);
      
      // 添加logger实例
      const loggerCode = getLoggerInstanceCode(analysis, filePath);
      
      if (analysis.hasClass && loggerCode.property) {
        // 在类中添加logger属性
        const classRegex = new RegExp(`(class\\s+${analysis.className}[^{]*{)`);
        content = content.replace(classRegex, `$1\n${loggerCode.property}\n`);
      } else if (!analysis.hasClass && loggerCode.instance) {
        // 在导入语句后添加logger实例
        const importEndRegex = /((?:import\s+.*?from\s+['"].*?['"];?\s*\n)+)/;
        if (importEndRegex.test(content)) {
          content = content.replace(importEndRegex, `$1\n${loggerCode.instance}\n`);
        } else {
          // 如果没有导入，在文件开头添加
          const lines = content.split('\n');
          let insertIndex = 0;
          
          // 跳过文件头部的注释
          while (insertIndex < lines.length && 
                 (lines[insertIndex].trim().startsWith('//') || 
                  lines[insertIndex].trim().startsWith('/*') ||
                  lines[insertIndex].trim().startsWith('*') ||
                  lines[insertIndex].trim() === '')) {
            insertIndex++;
          }
          
          lines.splice(insertIndex, 0, '', loggerCode.instance, '');
          content = lines.join('\n');
        }
      }
    }
    
    // 如果内容有变化，写回文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.modifiedFiles++;
      stats.totalReplacements += replacementCount;
      
      // 记录详细信息
      const relPath = path.relative(process.cwd(), filePath);
      stats.replacementDetails.set(relPath, {
        count: replacementCount,
        types: Array.from(replacementTypes.entries())
      });
    }
    
  } catch (error) {
    const relPath = path.relative(process.cwd(), filePath);
    stats.errorFiles.push({ file: relPath, error: error.message });
    console.error(`❌ 处理文件失败: ${relPath}`, error.message);
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (shouldExclude(fullPath)) {
        continue;
      }
      
      if (item.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        if (extensions.includes(ext)) {
          stats.totalFiles++;
          processFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ 扫描目录失败: ${dirPath}`, error.message);
  }
}

/**
 * 生成详细报告
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    statistics: {
      scannedFiles: stats.totalFiles,
      modifiedFiles: stats.modifiedFiles,
      totalReplacements: stats.totalReplacements,
      skippedFiles: stats.skippedFiles.length,
      errorFiles: stats.errorFiles.length
    },
    modifiedFiles: [],
    skippedFiles: stats.skippedFiles,
    errorFiles: stats.errorFiles
  };
  
  // 添加修改文件详情
  for (const [file, details] of stats.replacementDetails.entries()) {
    report.modifiedFiles.push({
      file,
      replacements: details.count,
      types: details.types.map(([type, count]) => `${type}: ${count}`)
    });
  }
  
  // 排序修改文件列表（按替换数量降序）
  report.modifiedFiles.sort((a, b) => b.replacements - a.replacements);
  
  return report;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 改进版Console替换工具');
  console.log('=' .repeat(60));
  
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ 错误：src目录不存在！');
    console.log('当前目录:', process.cwd());
    process.exit(1);
  }
  
  console.log('📁 扫描目录:', srcDir);
  console.log('🔍 开始扫描和替换...\n');
  
  // 开始处理
  const startTime = Date.now();
  scanDirectory(srcDir);
  const endTime = Date.now();
  
  // 生成报告
  const report = generateReport();
  
  // 输出统计
  console.log('\n' + '=' .repeat(60));
  console.log('📊 替换统计：');
  console.log(`  ⏱️  处理时间: ${((endTime - startTime) / 1000).toFixed(2)}秒`);
  console.log(`  📄 扫描文件数: ${stats.totalFiles}`);
  console.log(`  ✏️  修改文件数: ${stats.modifiedFiles}`);
  console.log(`  🔄 总替换次数: ${stats.totalReplacements}`);
  console.log(`  ⚠️  错误文件数: ${stats.errorFiles.length}`);
  
  // 显示前10个修改最多的文件
  if (report.modifiedFiles.length > 0) {
    console.log('\n📝 修改最多的文件（前10个）：');
    report.modifiedFiles.slice(0, 10).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.file}`);
      console.log(`     替换: ${item.replacements}次 (${item.types.join(', ')})`);
    });
    
    if (report.modifiedFiles.length > 10) {
      console.log(`\n  ... 还有 ${report.modifiedFiles.length - 10} 个文件被修改`);
    }
  }
  
  // 显示错误文件
  if (stats.errorFiles.length > 0) {
    console.log('\n❌ 处理失败的文件：');
    stats.errorFiles.slice(0, 5).forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
    
    if (stats.errorFiles.length > 5) {
      console.log(`  ... 还有 ${stats.errorFiles.length - 5} 个错误`);
    }
  }
  
  // 保存详细报告
  const reportPath = path.join(process.cwd(), 'console-replacement-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ 替换完成！');
  console.log(`📄 详细报告已保存至: ${reportPath}`);
  
  if (stats.modifiedFiles > 0) {
    console.log('\n⚠️  后续步骤：');
    console.log('  1. 检查修改的文件，确保logger正确导入和初始化');
    console.log('  2. 运行 npm run lint 检查代码规范');
    console.log('  3. 运行 npm test 确保功能正常');
    console.log('  4. 提交前仔细review所有更改');
  }
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('💥 未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 执行主函数
main().catch(error => {
  console.error('💥 执行失败:', error);
  process.exit(1);
});