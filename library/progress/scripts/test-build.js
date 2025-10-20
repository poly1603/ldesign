/**
 * 测试所有包的构建
 */
import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');

// 需要检查的包
const packages = [
  {
    name: '@ldesign/progress-core',
    path: 'packages/core',
    files: [
      'dist/index.js',
      'dist/index.esm.js',
      'dist/index.umd.js',
      'dist/index.d.ts',
      'dist/index.css',
    ],
  },
  {
    name: '@ldesign/progress-vue',
    path: 'packages/vue',
    files: [
      'dist/index.js',
      'dist/index.esm.js',
      'dist/index.d.ts',
    ],
  },
  {
    name: '@ldesign/progress-react',
    path: 'packages/react',
    files: [
      'dist/index.js',
      'dist/index.esm.js',
      'dist/index.d.ts',
    ],
  },
  {
    name: '@ldesign/progress-lit',
    path: 'packages/lit',
    files: [
      'dist/index.js',
      'dist/index.esm.js',
      'dist/index.d.ts',
    ],
  },
];

console.log('🚀 开始测试所有包的构建...\n');

let hasError = false;
const results = [];

// 测试每个包
for (const pkg of packages) {
  console.log(`📦 测试 ${pkg.name}...`);
  
  const pkgPath = resolve(rootDir, pkg.path);
  const result = {
    name: pkg.name,
    success: true,
    missingFiles: [],
    errors: [],
  };

  // 检查构建文件是否存在
  for (const file of pkg.files) {
    const filePath = resolve(pkgPath, file);
    if (!existsSync(filePath)) {
      result.success = false;
      result.missingFiles.push(file);
      hasError = true;
    } else {
      // 检查文件大小
      const stats = statSync(filePath);
      if (stats.size === 0) {
        result.success = false;
        result.errors.push(`${file} 文件大小为 0`);
        hasError = true;
      }
    }
  }

  results.push(result);

  if (result.success) {
    console.log(`  ✅ ${pkg.name} 构建成功`);
  } else {
    console.log(`  ❌ ${pkg.name} 构建失败`);
    if (result.missingFiles.length > 0) {
      console.log(`     缺少文件: ${result.missingFiles.join(', ')}`);
    }
    if (result.errors.length > 0) {
      result.errors.forEach(err => console.log(`     错误: ${err}`));
    }
  }
  console.log('');
}

// 输出总结
console.log('='.repeat(60));
console.log('📊 构建测试总结');
console.log('='.repeat(60));

const successCount = results.filter(r => r.success).length;
const failCount = results.filter(r => !r.success).length;

console.log(`✅ 成功: ${successCount} 个包`);
console.log(`❌ 失败: ${failCount} 个包`);

results.forEach(result => {
  const icon = result.success ? '✅' : '❌';
  console.log(`${icon} ${result.name}`);
});

console.log('='.repeat(60));

if (hasError) {
  console.error('\n❌ 构建测试失败！请检查上面的错误信息。\n');
  process.exit(1);
} else {
  console.log('\n✅ 所有包构建测试通过！\n');
  
  // 输出文件大小统计
  console.log('📦 构建产物大小统计:');
  for (const pkg of packages) {
    const pkgPath = resolve(rootDir, pkg.path);
    console.log(`\n  ${pkg.name}:`);
    
    for (const file of pkg.files) {
      const filePath = resolve(pkgPath, file);
      if (existsSync(filePath)) {
        const stats = statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`    ${file}: ${sizeKB} KB`);
      }
    }
  }
  
  console.log('\n✅ 所有检查完成！');
  process.exit(0);
}


