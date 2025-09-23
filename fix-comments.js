import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 递归查找所有 Vue 文件
function findVueFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findVueFiles(fullPath));
    } else if (item.endsWith('.vue')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 修复单个文件中的 LESS 注释
function fixLessComments(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let inStyleBlock = false;
  let isLessStyle = false;
  let modified = false;

  console.log(`检查文件: ${filePath}`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测样式块开始
    if (line.includes('<style') && line.includes('lang="less"')) {
      inStyleBlock = true;
      isLessStyle = true;
      console.log(`  找到 LESS 样式块开始: 行 ${i + 1}`);
    } else if (line.includes('<style') && !line.includes('lang="less"')) {
      inStyleBlock = true;
      isLessStyle = false;
    } else if (line.includes('</style>')) {
      if (inStyleBlock && isLessStyle) {
        console.log(`  LESS 样式块结束: 行 ${i + 1}`);
      }
      inStyleBlock = false;
      isLessStyle = false;
    }

    // 如果在 LESS 样式块中，替换 // 注释
    if (inStyleBlock && isLessStyle) {
      // 匹配行首的 // 注释（可能有前导空格）
      const match = line.match(/^(\s*)\/\/\s*(.*)$/);
      if (match) {
        const indent = match[1];
        const comment = match[2];
        lines[i] = `${indent}/* ${comment} */`;
        console.log(`    修复行首注释: 行 ${i + 1}: "${line.trim()}" -> "${lines[i].trim()}"`);
        modified = true;
      }

      // 匹配行内的 // 注释
      const inlineMatch = line.match(/^(.+?)(\s+)\/\/\s*(.*)$/);
      if (inlineMatch && !line.includes('/*') && !line.includes('*/')) {
        const code = inlineMatch[1];
        const space = inlineMatch[2];
        const comment = inlineMatch[3];
        lines[i] = `${code}${space}/* ${comment} */`;
        console.log(`    修复行内注释: 行 ${i + 1}: "${line.trim()}" -> "${lines[i].trim()}"`);
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`✓ 修复了 ${filePath}`);
    return true;
  } else {
    console.log(`  无需修复 ${filePath}`);
  }

  return false;
}

// 主函数
function main() {
  const templateDir = path.join(__dirname, 'packages', 'template', 'src', 'templates');
  
  if (!fs.existsSync(templateDir)) {
    console.error(`目录不存在: ${templateDir}`);
    return;
  }
  
  const vueFiles = findVueFiles(templateDir);
  console.log(`找到 ${vueFiles.length} 个 Vue 文件`);
  
  let fixedCount = 0;
  for (const file of vueFiles) {
    if (fixLessComments(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n修复完成！共修复了 ${fixedCount} 个文件`);
}

main();
