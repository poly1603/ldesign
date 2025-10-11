/**
 * 替换所有console语句为统一的日志系统
 */

const fs = require('fs');
const path = require('path');

// 要排除的目录
const excludeDirs = ['node_modules', '.git', 'dist', 'lib', 'es', 'coverage', 'examples'];

// 要处理的文件扩展名
const extensions = ['.ts', '.js', '.tsx', '.jsx'];

// 替换规则
const replacements = [
  {
    pattern: /console\.log\(/g,
    replacement: 'this.logger?.debug(',
    description: 'console.log -> logger.debug'
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'this.logger?.warn(',
    description: 'console.warn -> logger.warn'
  },
  {
    pattern: /console\.error\(/g,
    replacement: 'this.logger?.error(',
    description: 'console.error -> logger.error'
  },
  {
    pattern: /console\.debug\(/g,
    replacement: 'this.logger?.debug(',
    description: 'console.debug -> logger.debug'
  },
  {
    pattern: /console\.info\(/g,
    replacement: 'this.logger?.info(',
    description: 'console.info -> logger.info'
  }
];

// 统计信息
let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;
const fileReplacements = [];

/**
 * 检查是否应该排除目录
 */
function shouldExcludeDir(dir) {
  return excludeDirs.some(exclude => dir.includes(exclude));
}

/**
 * 检查文件是否应该处理
 */
function shouldProcessFile(file) {
  return extensions.some(ext => file.endsWith(ext));
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  if (!shouldProcessFile(filePath)) {
    return;
  }

  totalFiles++;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileReplacementCount = 0;
  const replacementDetails = [];

  // 应用所有替换规则
  replacements.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      content = content.replace(pattern, replacement);
      fileReplacementCount += matches.length;
      replacementDetails.push(`  - ${description}: ${matches.length} 次`);
    }
  });

  // 如果内容有变化，写回文件
  if (content !== originalContent) {
    // 检查文件是否已经有logger
    const hasLogger = content.includes('logger') || content.includes('Logger');
    
    // 如果没有logger且有替换，添加logger导入（如果是类文件）
    if (!hasLogger && fileReplacementCount > 0) {
      // 检查是否是类文件
      if (content.includes('class ') && !content.includes('private logger')) {
        // 在类定义后添加logger属性
        content = content.replace(
          /(class\s+\w+.*{)/,
          '$1\n  private logger?: Logger;'
        );
        
        // 添加Logger类型导入
        if (!content.includes("import type { Logger }")) {
          // 查找第一个import语句
          const importMatch = content.match(/^import /m);
          if (importMatch) {
            const importIndex = content.indexOf(importMatch[0]);
            content = content.slice(0, importIndex) + 
                     "import type { Logger } from '../types/logger'\n" +
                     content.slice(importIndex);
          } else {
            // 如果没有import，添加在文件开头
            content = "import type { Logger } from '../types/logger'\n\n" + content;
          }
        }
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
    totalReplacements += fileReplacementCount;
    
    fileReplacements.push({
      file: path.relative(process.cwd(), filePath),
      count: fileReplacementCount,
      details: replacementDetails
    });
  }
}

/**
 * 递归处理目录
 */
function processDirectory(dir) {
  if (shouldExcludeDir(dir)) {
    return;
  }

  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  });
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 开始替换console语句为统一日志系统...\n');
  console.log('=' .repeat(60));
  
  const srcDir = path.join(__dirname, '..', 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('错误：src目录不存在！');
    process.exit(1);
  }
  
  // 处理src目录
  processDirectory(srcDir);
  
  // 输出统计信息
  console.log('\n📊 替换统计：');
  console.log(`  总文件数：${totalFiles}`);
  console.log(`  修改文件数：${modifiedFiles}`);
  console.log(`  总替换次数：${totalReplacements}`);
  
  if (fileReplacements.length > 0) {
    console.log('\n📝 修改详情：');
    fileReplacements.slice(0, 20).forEach(({ file, count, details }) => {
      console.log(`\n  ${file} (${count} 次替换)`);
      details.forEach(detail => console.log(detail));
    });
    
    if (fileReplacements.length > 20) {
      console.log(`\n  ... 还有 ${fileReplacements.length - 20} 个文件`);
    }
  }
  
  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    statistics: {
      totalFiles,
      modifiedFiles,
      totalReplacements
    },
    files: fileReplacements
  };
  
  const reportPath = path.join(__dirname, '..', 'console-replacement-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n=' .repeat(60));
  console.log('\n✅ 替换完成！');
  console.log(`📄 详细报告已保存至：console-replacement-report.json`);
  console.log('\n⚠️  注意事项：');
  console.log('1. 请检查修改的文件，确保logger正确初始化');
  console.log('2. 某些文件可能需要手动调整logger的引入路径');
  console.log('3. 运行测试以确保功能正常');
}

// 执行主函数
main();