#!/usr/bin/env node
/**
 * 修复 TypeScript 编译后的 ESM 导入路径
 * 为所有相对导入添加 .js 扩展名
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function fixImportsInFile(filePath) {
  if (!filePath.endsWith('.js')) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 修复相对导入路径，添加 .js 扩展名
  const fixedContent = content.replace(
    /from\s+['"](\.[^'"]*?)['"];?/g,
    (match, importPath) => {
      // 如果已经有扩展名，跳过
      if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
        return match;
      }
      // 添加 .js 扩展名
      return match.replace(importPath, importPath + '.js');
    }
  );
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf-8');
    console.log(`Fixed imports in: ${path.relative(ROOT_DIR, filePath)}`);
  }
}

function fixImportsInDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 跳过 __tests__ 目录
      if (item !== '__tests__') {
        fixImportsInDirectory(fullPath);
      }
    } else if (stat.isFile() && item.endsWith('.js')) {
      fixImportsInFile(fullPath);
    }
  }
}

async function main() {
  console.log('🔧 Fixing ESM import paths...');
  
  // 复制文件
  console.log('📁 Copying CLI files...');
  fs.copySync(path.join(DIST_DIR, 'src', 'cli.js'), path.join(DIST_DIR, 'cli.js'));
  fs.copySync(path.join(DIST_DIR, 'src'), DIST_DIR, {
    overwrite: false,
    filter: (src) => !src.includes('__tests__')
  });
  
  // 修复导入路径
  console.log('🔧 Fixing import paths...');
  fixImportsInDirectory(DIST_DIR);
  
  console.log('✅ Import paths fixed successfully!');
}

main().catch(console.error);
