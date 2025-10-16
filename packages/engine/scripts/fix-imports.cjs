#!/usr/bin/env node

/**
 * 修复错误放置的import语句
 */

const fs = require('node:fs');
const path = require('node:path');

// 要扫描的目录
const srcDir = path.join(process.cwd(), 'src');

// 统计
let fixedFiles = 0;
const fixedFilesList = [];

/**
 * 修复单个文件中的import语句位置
 */
function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 检查是否有错误放置的import语句（在注释块内）
    const wrongImportPattern = /^\/\*\*\nimport\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\n/m;
    
    if (wrongImportPattern.test(content)) {
      // 提取import语句
      const importMatch = content.match(/^(import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?)\n/m);
      
      if (importMatch) {
        const importStatement = `${importMatch[1]  }\n`;
        
        // 移除错误位置的import
        content = content.replace(/^\/\*\*\nimport\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\n/m, '/**\n');
        
        // 查找正确的插入位置（文件开头或第一个非注释行之前）
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // 跳过文件开头的纯注释行
        while (insertIndex < lines.length) {
          const line = lines[insertIndex].trim();
          if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
            break;
          }
          insertIndex++;
        }
        
        // 在找到的位置插入import语句
        lines.splice(insertIndex, 0, importStatement);
        content = lines.join('\n');
      }
    }
    
    // 检查是否有其他模式的错误import位置
    // 例如：import语句在注释块结尾之后
    const commentBlockPattern = /^\/\*\*[\s\S]*?\*\/$/gm;
    const importPattern = /^import\s+(?:\S.*?)??from\s+['"].*?['"];?$/gm;
    
    // 重新组织文件：imports应该在文件顶部（跳过初始注释后）
    const imports = [];
    const otherContent = [];
    const lines = content.split('\n');
    let inCommentBlock = false;
    let firstNonComment = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // 检查注释块
      if (trimmedLine.startsWith('/**') || trimmedLine.startsWith('/*')) {
        inCommentBlock = true;
      }
      if (inCommentBlock && (trimmedLine.endsWith('*/') || trimmedLine === '*/')) {
        inCommentBlock = false;
        otherContent.push(line);
        continue;
      }
      
      // 如果在注释块中
      if (inCommentBlock) {
        otherContent.push(line);
        continue;
      }
      
      // 检查是否是import语句
      if (line.match(/^import\s+/)) {
        imports.push(line);
        firstNonComment = true;
      } else {
        otherContent.push(line);
        if (trimmedLine && !trimmedLine.startsWith('//')) {
          firstNonComment = true;
        }
      }
    }
    
    // 如果有import语句被重新排序，重组文件
    if (imports.length > 0 && content !== originalContent) {
      // 查找第一个非注释、非空行的位置
      let insertPosition = 0;
      for (let i = 0; i < otherContent.length; i++) {
        const line = otherContent[i].trim();
        if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
          insertPosition = i;
          break;
        }
      }
      
      // 重组内容
      const finalContent = [
        ...otherContent.slice(0, insertPosition),
        ...imports,
        '',
        ...otherContent.slice(insertPosition)
      ].join('\n');
      
      content = finalContent;
    }
    
    // 如果内容有变化，写回文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFiles++;
      fixedFilesList.push(path.relative(process.cwd(), filePath));
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
    
    if (item.isDirectory() && !item.name.includes('node_modules')) {
      scanDirectory(fullPath);
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx') || item.name.endsWith('.js') || item.name.endsWith('.jsx'))) {
      fixImports(fullPath);
    }
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 修复import语句位置...');
  console.log('=' .repeat(60));
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ src目录不存在！');
    process.exit(1);
  }
  
  scanDirectory(srcDir);
  
  console.log(`\n${  '=' .repeat(60)}`);
  console.log(`✅ 修复完成！共修复 ${fixedFiles} 个文件`);
  
  if (fixedFilesList.length > 0) {
    console.log('\n📝 修复的文件：');
    fixedFilesList.slice(0, 10).forEach(file => {
      console.log(`  - ${file}`);
    });
    
    if (fixedFilesList.length > 10) {
      console.log(`  ... 还有 ${fixedFilesList.length - 10} 个文件`);
    }
  }
}

// 执行
main();