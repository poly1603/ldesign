#!/usr/bin/env node

/**
 * 批量修复常见的 TypeScript 错误
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // 修复未使用的参数（添加下划线前缀）
  {
    pattern: /\(([\w]+): any, ([\w]+): any, next: any\) =>/g,
    replacement: '(_$1: any, _$2: any, next: any) =>',
  },
  // 修复未使用的单个参数
  {
    pattern: /beforeEach\(\(to, from, next\) =>/g,
    replacement: 'beforeEach((to, _from, next) =>',
  },
  {
    pattern: /afterEach\(\(to, from/g,
    replacement: 'afterEach((_to, _from',
  },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  fixes.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fixFile(filePath);
    }
  });
}

const srcDir = path.join(__dirname, '../src');
walkDir(srcDir);

console.log('Done!');


