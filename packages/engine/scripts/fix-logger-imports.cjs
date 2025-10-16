#!/usr/bin/env node

/**
 * 修复所有unified-logger的导入路径
 * 将错误的 '../utils/unified-logger' 修正为 '../logger/unified-logger'
 */

const fs = require('node:fs');
const path = require('node:path');

// 统计
let fixedFiles = 0;
const fixedFilesList = [];

/**
 * 计算正确的相对路径到logger/unified-logger
 */
function calculateCorrectPath(filePath) {
  const fileDir = path.dirname(filePath);
  const loggerPath = path.join(process.cwd(), 'src', 'logger', 'unified-logger.ts');
  let relativePath = path.relative(fileDir, loggerPath)
    .replace(/\\/g, '/')
    .replace(/\.ts$/, '');
  
  // 确保路径以 ./ 或 ../ 开头
  if (!relativePath.startsWith('.')) {
    relativePath = `./${  relativePath}`;
  }
  
  return relativePath;
}

/**
 * 修复单个文件中的import语句
 */
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 匹配各种形式的unified-logger导入
    const patterns = [
      // from '../utils/unified-logger'
      /from\s+['"]\.\.\/utils\/unified-logger['"]/g,
      // from '../../utils/unified-logger'
      /from\s+['"]\.\.\/\.\.\/utils\/unified-logger['"]/g,
      // from '../../../utils/unified-logger'
      /from\s+['"]\.\.\/\.\.\/\.\.\/utils\/unified-logger['"]/g,
      // from 'unified-logger' (没有路径的)
      /from\s+['"]unified-logger['"]/g,
    ];
    
    // 计算正确的路径
    const correctPath = calculateCorrectPath(filePath);
    
    // 替换所有匹配的模式
    let modified = false;
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, `from '${correctPath}'`);
        modified = true;
      }
    });
    
    // 如果内容有变化，写回文件
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFiles++;
      const relPath = path.relative(process.cwd(), filePath);
      fixedFilesList.push({
        file: relPath,
        newPath: correctPath
      });
      console.log(`  ✓ ${relPath} -> '${correctPath}'`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    // 跳过node_modules和其他不需要的目录
    if (item.isDirectory()) {
      if (!item.name.includes('node_modules') && 
          !item.name.startsWith('.') && 
          item.name !== 'dist' && 
          item.name !== 'lib') {
        scanDirectory(fullPath);
      }
    } else if (item.isFile() && 
               (item.name.endsWith('.ts') || 
                item.name.endsWith('.tsx') || 
                item.name.endsWith('.js') || 
                item.name.endsWith('.jsx'))) {
      // 检查文件是否包含unified-logger导入
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('unified-logger')) {
        fixFile(fullPath);
      }
    }
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 修复unified-logger导入路径...');
  console.log('=' .repeat(60));
  
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ src目录不存在！');
    process.exit(1);
  }
  
  // 首先检查logger文件是否存在
  const loggerFile = path.join(srcDir, 'logger', 'unified-logger.ts');
  if (!fs.existsSync(loggerFile)) {
    console.error('❌ logger/unified-logger.ts文件不存在！');
    process.exit(1);
  }
  
  console.log('📁 扫描目录:', srcDir);
  console.log('🎯 目标文件:', 'src/logger/unified-logger.ts');
  console.log('');
  
  scanDirectory(srcDir);
  
  console.log(`\n${  '=' .repeat(60)}`);
  console.log(`✅ 修复完成！共修复 ${fixedFiles} 个文件`);
  
  if (fixedFilesList.length > 0) {
    console.log('\n📝 修复详情：');
    
    // 生成报告
    const report = {
      timestamp: new Date().toISOString(),
      totalFixed: fixedFiles,
      files: fixedFilesList
    };
    
    const reportPath = path.join(process.cwd(), 'logger-import-fix-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存至: ${reportPath}`);
  }
}

// 执行
main();