#!/usr/bin/env node

/**
 * 测试所有子包的打包和基本功能
 * 这个脚本会检查每个包的基本结构和导出
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始测试所有子包...\n');

const packagesDir = path.join(__dirname, 'packages');
const testResults = [];

// 获取所有包目录
const packages = fs.readdirSync(packagesDir).filter(dir => {
  const packagePath = path.join(packagesDir, dir);
  return fs.statSync(packagePath).isDirectory() &&
         (fs.existsSync(path.join(packagePath, 'package.json')) ||
          fs.existsSync(path.join(packagePath, 'pubspec.yaml')));
});

console.log(`📦 发现 ${packages.length} 个包: ${packages.join(', ')}\n`);

// 测试每个包
packages.forEach(packageName => {
  console.log(`\n🔍 测试包: ${packageName}`);
  console.log('='.repeat(50));
  
  const packagePath = path.join(packagesDir, packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  const srcPath = path.join(packagePath, 'src');
  
  const result = {
    name: packageName,
    path: packagePath,
    hasPackageJson: false,
    hasSrc: false,
    hasComponents: false,
    componentCount: 0,
    hasIndex: false,
    hasManifest: false,
    buildConfig: null,
    errors: []
  };

  try {
    // 检查 package.json 或 pubspec.yaml
    const pubspecPath = path.join(packagePath, 'pubspec.yaml');

    if (fs.existsSync(packageJsonPath)) {
      result.hasPackageJson = true;
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      console.log(`  ✅ package.json: ${packageJson.name} v${packageJson.version}`);

      // 检查构建配置
      if (packageJson.scripts && packageJson.scripts.build) {
        result.buildConfig = 'npm scripts';
        console.log(`  ✅ 构建脚本: ${packageJson.scripts.build}`);
      }

      if (fs.existsSync(path.join(packagePath, 'rollup.config.js'))) {
        result.buildConfig = 'rollup';
        console.log(`  ✅ 构建配置: rollup.config.js`);
      }

      if (fs.existsSync(path.join(packagePath, 'angular.json'))) {
        result.buildConfig = 'angular';
        console.log(`  ✅ 构建配置: angular.json`);
      }
    } else if (fs.existsSync(pubspecPath)) {
      result.hasPackageJson = true; // 对于 Flutter，pubspec.yaml 相当于 package.json
      const pubspecContent = fs.readFileSync(pubspecPath, 'utf-8');
      const nameMatch = pubspecContent.match(/name:\s*(.+)/);
      const versionMatch = pubspecContent.match(/version:\s*(.+)/);
      const name = nameMatch ? nameMatch[1].trim() : 'unknown';
      const version = versionMatch ? versionMatch[1].trim() : 'unknown';
      console.log(`  ✅ pubspec.yaml: ${name} v${version}`);
      result.buildConfig = 'flutter';
      console.log(`  ✅ 构建配置: pubspec.yaml`);
    } else {
      result.errors.push('缺少 package.json 或 pubspec.yaml');
      console.log(`  ❌ 缺少 package.json 或 pubspec.yaml`);
    }

    // 检查 src 目录
    if (fs.existsSync(srcPath)) {
      result.hasSrc = true;
      console.log(`  ✅ src 目录存在`);
      
      // 检查 components 目录
      const componentsPath = path.join(srcPath, 'components');
      if (fs.existsSync(componentsPath)) {
        result.hasComponents = true;
        const components = fs.readdirSync(componentsPath).filter(file => 
          file.endsWith('.tsx') || file.endsWith('.vue') || file.endsWith('.js') || file.endsWith('.ts')
        );
        result.componentCount = components.length;
        console.log(`  ✅ components 目录: ${components.length} 个组件`);
        
        if (components.length > 0) {
          console.log(`  📄 示例组件: ${components.slice(0, 3).join(', ')}${components.length > 3 ? '...' : ''}`);
        }
      } else {
        console.log(`  ⚠️  没有 components 目录`);
      }
      
      // 检查 index 文件
      const indexFiles = ['index.ts', 'index.js', 'icons.ts'].map(f => path.join(srcPath, f));
      const existingIndex = indexFiles.find(f => fs.existsSync(f));
      if (existingIndex) {
        result.hasIndex = true;
        console.log(`  ✅ 入口文件: ${path.basename(existingIndex)}`);
      } else {
        console.log(`  ⚠️  没有找到入口文件`);
      }
      
      // 检查 manifest 文件
      const manifestPath = path.join(srcPath, 'manifest.ts');
      if (fs.existsSync(manifestPath)) {
        result.hasManifest = true;
        console.log(`  ✅ manifest 文件存在`);
      }
    } else {
      // 特殊处理 Flutter 包
      if (packageName === 'flutter') {
        const libPath = path.join(packagePath, 'lib');
        if (fs.existsSync(libPath)) {
          result.hasSrc = true;
          console.log(`  ✅ lib 目录存在 (Flutter)`);
          
          const dartFiles = fs.readdirSync(libPath).filter(f => f.endsWith('.dart'));
          if (dartFiles.length > 0) {
            result.hasComponents = true;
            result.componentCount = dartFiles.length;
            console.log(`  ✅ Dart 文件: ${dartFiles.length} 个`);
          }
        }
      } else {
        result.errors.push('缺少 src 目录');
        console.log(`  ❌ 缺少 src 目录`);
      }
    }

    // 测试基本导入（如果有入口文件）
    if (result.hasIndex && packageName !== 'flutter') {
      try {
        const indexPath = path.join(srcPath, 'index.ts');
        if (fs.existsSync(indexPath)) {
          const indexContent = fs.readFileSync(indexPath, 'utf-8');
          const exportCount = (indexContent.match(/export/g) || []).length;
          console.log(`  ✅ 导出数量: ~${exportCount} 个`);
        }
      } catch (error) {
        console.log(`  ⚠️  无法分析导出: ${error.message}`);
      }
    }

  } catch (error) {
    result.errors.push(error.message);
    console.log(`  ❌ 错误: ${error.message}`);
  }

  testResults.push(result);
});

// 生成测试报告
console.log('\n\n📊 测试报告');
console.log('='.repeat(80));

const summary = {
  total: testResults.length,
  withPackageJson: testResults.filter(r => r.hasPackageJson).length,
  withSrc: testResults.filter(r => r.hasSrc).length,
  withComponents: testResults.filter(r => r.hasComponents).length,
  totalComponents: testResults.reduce((sum, r) => sum + r.componentCount, 0),
  withBuildConfig: testResults.filter(r => r.buildConfig).length,
  withErrors: testResults.filter(r => r.errors.length > 0).length
};

console.log(`\n📈 总体统计:`);
console.log(`  总包数: ${summary.total}`);
console.log(`  有 package.json: ${summary.withPackageJson}/${summary.total}`);
console.log(`  有源代码目录: ${summary.withSrc}/${summary.total}`);
console.log(`  有组件目录: ${summary.withComponents}/${summary.total}`);
console.log(`  总组件数: ${summary.totalComponents}`);
console.log(`  有构建配置: ${summary.withBuildConfig}/${summary.total}`);
console.log(`  有错误: ${summary.withErrors}/${summary.total}`);

console.log(`\n📋 详细信息:`);
testResults.forEach(result => {
  const status = result.errors.length === 0 ? '✅' : '❌';
  const components = result.componentCount > 0 ? ` (${result.componentCount} 组件)` : '';
  const buildConfig = result.buildConfig ? ` [${result.buildConfig}]` : '';
  
  console.log(`  ${status} ${result.name}${components}${buildConfig}`);
  
  if (result.errors.length > 0) {
    result.errors.forEach(error => {
      console.log(`    ⚠️  ${error}`);
    });
  }
});

// 构建配置统计
console.log(`\n🔧 构建配置统计:`);
const buildConfigs = {};
testResults.forEach(result => {
  if (result.buildConfig) {
    buildConfigs[result.buildConfig] = (buildConfigs[result.buildConfig] || 0) + 1;
  }
});

Object.entries(buildConfigs).forEach(([config, count]) => {
  console.log(`  ${config}: ${count} 个包`);
});

// 组件数量统计
console.log(`\n📊 组件数量统计:`);
testResults
  .filter(r => r.componentCount > 0)
  .sort((a, b) => b.componentCount - a.componentCount)
  .forEach(result => {
    console.log(`  ${result.name}: ${result.componentCount} 个组件`);
  });

console.log(`\n${summary.withErrors === 0 ? '🎉' : '⚠️'} 测试完成! ${summary.withErrors === 0 ? '所有包都正常' : `${summary.withErrors} 个包有问题`}`);

// 返回退出码
process.exit(summary.withErrors === 0 ? 0 : 1);
