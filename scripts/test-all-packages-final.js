#!/usr/bin/env node

/**
 * 全面测试所有包的构建情况
 * 验证自动配置增强功能的效果
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 所有需要测试的包
const packages = [
  'api', 'cache', 'color', 'crypto', 'device', 'engine', 
  'http', 'i18n', 'router', 'shared', 'size', 'store', 
  'template', 'theme'
];

// 构建结果统计
const results = {
  success: [],
  failed: [],
  warnings: []
};

console.log('🚀 开始全面测试所有包的构建情况...\n');

for (const pkg of packages) {
  const packagePath = path.join(__dirname, '..', 'packages', pkg);
  
  if (!fs.existsSync(packagePath)) {
    console.log(`❌ 包 ${pkg} 不存在，跳过测试`);
    results.failed.push({ name: pkg, error: '包不存在' });
    continue;
  }

  console.log(`📦 测试包: ${pkg}`);
  
  try {
    // 检查是否有 builder.config.ts
    const configPath = path.join(packagePath, '.ldesign', 'builder.config.ts');
    if (!fs.existsSync(configPath)) {
      console.log(`⚠️  ${pkg}: 没有 builder.config.ts 文件`);
      results.warnings.push({ name: pkg, warning: '没有 builder.config.ts 文件' });
      continue;
    }

    // 执行构建
    console.log(`   🔨 构建中...`);
    const output = execSync('pnpm run build', {
      cwd: packagePath,
      encoding: 'utf8',
      stdio: 'pipe'
    });

    // 检查构建产物
    const distPath = path.join(packagePath, 'dist');
    const esPath = path.join(packagePath, 'es');
    const libPath = path.join(packagePath, 'lib');

    const artifacts = {
      dist: fs.existsSync(distPath),
      es: fs.existsSync(esPath),
      lib: fs.existsSync(libPath)
    };

    // 检查具体文件
    const files = {
      esm: false,
      cjs: false,
      umd: false,
      dts: false,
      css: false,
      vue: false
    };

    if (artifacts.es) {
      const esFiles = fs.readdirSync(esPath);
      files.esm = esFiles.some(f => f.endsWith('.js'));
      files.dts = esFiles.some(f => f.endsWith('.d.ts'));
      files.css = esFiles.some(f => f.endsWith('.css'));
      files.vue = esFiles.some(f => f.includes('.vue.js') || f.includes('.vue2.js'));
    }

    if (artifacts.lib) {
      const libFiles = fs.readdirSync(libPath);
      files.cjs = libFiles.some(f => f.endsWith('.cjs'));
    }

    if (artifacts.dist) {
      const distFiles = fs.readdirSync(distPath);
      files.umd = distFiles.some(f => f.endsWith('.umd.js') || f.includes('index.js'));
    }

    // 检查自动配置增强
    const hasVueFiles = checkVueFiles(packagePath);
    const autoConfig = analyzeAutoConfig(output);

    console.log(`   ✅ ${pkg}: 构建成功`);
    console.log(`      📁 产物: ${Object.entries(artifacts).filter(([k, v]) => v).map(([k]) => k).join(', ')}`);
    console.log(`      📄 文件: ${Object.entries(files).filter(([k, v]) => v).map(([k]) => k).join(', ')}`);
    
    if (autoConfig.detected) {
      console.log(`      🤖 自动配置: ${autoConfig.features.join(', ')}`);
    }

    results.success.push({
      name: pkg,
      artifacts,
      files,
      autoConfig,
      hasVueFiles
    });

  } catch (error) {
    console.log(`   ❌ ${pkg}: 构建失败`);
    console.log(`      错误: ${error.message.split('\n')[0]}`);
    
    results.failed.push({
      name: pkg,
      error: error.message.split('\n')[0]
    });
  }

  console.log('');
}

// 输出最终统计
console.log('📊 构建测试结果汇总:');
console.log('='.repeat(50));

console.log(`\n✅ 构建成功的包 (${results.success.length}/${packages.length}):`);
results.success.forEach(pkg => {
  console.log(`   • ${pkg.name}`);
  if (pkg.autoConfig.detected) {
    console.log(`     🤖 自动配置: ${pkg.autoConfig.features.join(', ')}`);
  }
});

if (results.failed.length > 0) {
  console.log(`\n❌ 构建失败的包 (${results.failed.length}):`);
  results.failed.forEach(pkg => {
    console.log(`   • ${pkg.name}: ${pkg.error}`);
  });
}

if (results.warnings.length > 0) {
  console.log(`\n⚠️  警告 (${results.warnings.length}):`);
  results.warnings.forEach(pkg => {
    console.log(`   • ${pkg.name}: ${pkg.warning}`);
  });
}

// 自动配置增强功能统计
const autoConfigStats = {
  vueDetection: 0,
  externalGeneration: 0,
  globalsGeneration: 0,
  pluginAddition: 0
};

results.success.forEach(pkg => {
  if (pkg.autoConfig.features.includes('Vue检测')) autoConfigStats.vueDetection++;
  if (pkg.autoConfig.features.includes('External生成')) autoConfigStats.externalGeneration++;
  if (pkg.autoConfig.features.includes('Globals生成')) autoConfigStats.globalsGeneration++;
  if (pkg.autoConfig.features.includes('插件添加')) autoConfigStats.pluginAddition++;
});

console.log(`\n🤖 自动配置增强功能统计:`);
console.log(`   • Vue项目检测: ${autoConfigStats.vueDetection} 个包`);
console.log(`   • External自动生成: ${autoConfigStats.externalGeneration} 个包`);
console.log(`   • Globals自动生成: ${autoConfigStats.globalsGeneration} 个包`);
console.log(`   • 插件自动添加: ${autoConfigStats.pluginAddition} 个包`);

console.log(`\n📈 总体成功率: ${((results.success.length / packages.length) * 100).toFixed(1)}%`);

if (results.success.length === packages.length) {
  console.log('\n🎉 所有包构建成功！自动配置增强功能工作正常！');
  process.exit(0);
} else {
  console.log('\n⚠️  部分包构建失败，请检查错误信息');
  process.exit(1);
}

// 辅助函数
function checkVueFiles(packagePath) {
  const srcPath = path.join(packagePath, 'src');
  if (!fs.existsSync(srcPath)) return false;
  
  try {
    const output = execSync(`find "${srcPath}" -name "*.vue" 2>/dev/null || echo ""`, {
      encoding: 'utf8',
      shell: true
    });
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

function analyzeAutoConfig(output) {
  const features = [];
  let detected = false;

  if (output.includes('自动检测库类型')) {
    features.push('Vue检测');
    detected = true;
  }
  if (output.includes('自动生成 external')) {
    features.push('External生成');
    detected = true;
  }
  if (output.includes('自动生成 globals')) {
    features.push('Globals生成');
    detected = true;
  }
  if (output.includes('自动添加 Vue 插件')) {
    features.push('插件添加');
    detected = true;
  }

  return { detected, features };
}
