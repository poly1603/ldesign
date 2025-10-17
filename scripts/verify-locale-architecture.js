#!/usr/bin/env node

/**
 * 验证优化后的多语言架构
 * 
 * 运行方式：
 * node scripts/verify-locale-architecture.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证多语言架构...\n');

// 定义检查项
const checks = [
  {
    name: 'i18n 包导出 localeRef',
    file: 'packages/i18n/src/engine.ts',
    pattern: /localeRef.*ref\(/,
    description: 'i18n 插件应该创建并导出 localeRef'
  },
  {
    name: 'i18n 返回 localeRef',
    file: 'packages/i18n/src/engine.ts',
    pattern: /return\s*{[\s\S]*localeRef[\s\S]*}/,
    description: 'i18n 插件应该在返回对象中包含 localeRef'
  },
  {
    name: 'Color 插件接收 locale 参数',
    file: 'packages/color/src/plugin/index.ts',
    pattern: /locale\?:\s*Ref<string>/,
    description: 'Color 插件选项应该支持可选的 locale 参数'
  },
  {
    name: 'Color 插件使用传入的 locale',
    file: 'packages/color/src/plugin/index.ts',
    pattern: /options\.locale\s*\|\|/,
    description: 'Color 插件应该优先使用传入的 locale'
  },
  {
    name: 'Size 插件接收 locale 参数',
    file: 'packages/size/src/plugin/index.ts',
    pattern: /locale\?:\s*Ref<string>/,
    description: 'Size 插件选项应该支持可选的 locale 参数'
  },
  {
    name: 'Size 插件使用传入的 locale',
    file: 'packages/size/src/plugin/index.ts',
    pattern: /options\.locale\s*\|\|/,
    description: 'Size 插件应该优先使用传入的 locale'
  },
  {
    name: 'app_simple 使用 localeRef',
    file: 'app_simple/src/main.ts',
    pattern: /localeRef\s*=\s*i18nPlugin\.localeRef/,
    description: 'app_simple 应该从 i18n 插件获取 localeRef'
  },
  {
    name: 'app_simple Color 插件传入 locale',
    file: 'app_simple/src/main.ts',
    pattern: /createColorPlugin\([\s\S]*locale:\s*localeRef/,
    description: 'app_simple 应该将 localeRef 传递给 Color 插件'
  },
  {
    name: 'app_simple Size 插件传入 locale',
    file: 'app_simple/src/main.ts',
    pattern: /createSizePlugin\([\s\S]*locale:\s*localeRef/,
    description: 'app_simple 应该将 localeRef 传递给 Size 插件'
  }
];

let passedCount = 0;
let failedCount = 0;
const results = [];

// 执行检查
checks.forEach(check => {
  const filePath = path.join(__dirname, '..', check.file);
  
  try {
    if (!fs.existsSync(filePath)) {
      results.push({
        name: check.name,
        status: 'SKIP',
        message: `文件不存在: ${check.file}`
      });
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const matched = check.pattern.test(content);
    
    if (matched) {
      passedCount++;
      results.push({
        name: check.name,
        status: 'PASS',
        message: check.description
      });
    } else {
      failedCount++;
      results.push({
        name: check.name,
        status: 'FAIL',
        message: check.description,
        file: check.file
      });
    }
  } catch (error) {
    failedCount++;
    results.push({
      name: check.name,
      status: 'ERROR',
      message: error.message,
      file: check.file
    });
  }
});

// 输出结果
results.forEach(result => {
  const icon = result.status === 'PASS' ? '✅' : 
                result.status === 'FAIL' ? '❌' : 
                result.status === 'SKIP' ? '⏭️' : '⚠️';
  
  console.log(`${icon} ${result.name}`);
  console.log(`   ${result.message}`);
  if (result.file && result.status !== 'PASS') {
    console.log(`   📄 ${result.file}`);
  }
  console.log();
});

// 总结
console.log('━'.repeat(60));
console.log(`\n📊 检查结果：`);
console.log(`   ✅ 通过: ${passedCount}`);
console.log(`   ❌ 失败: ${failedCount}`);
console.log(`   ⏭️ 跳过: ${results.filter(r => r.status === 'SKIP').length}`);

if (failedCount === 0) {
  console.log('\n🎉 所有检查都通过了！架构优化完成！\n');
  console.log('📚 下一步：');
  console.log('   1. 运行应用：cd app_simple && npm run dev');
  console.log('   2. 测试语言切换功能');
  console.log('   3. 查看文档：docs/architecture/locale-management.md\n');
  process.exit(0);
} else {
  console.log('\n⚠️ 有检查项失败，请根据上面的提示进行修复。\n');
  console.log('📖 参考文档：');
  console.log('   - docs/architecture/locale-management.md');
  console.log('   - docs/examples/locale-usage-example.md\n');
  process.exit(1);
}
