#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 解析命令行参数
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const isWatch = args.includes('--watch');
const isAnalyze = args.includes('--analyze');
const formats = args.find(arg => arg.startsWith('--formats='))?.split('=')[1]?.split(',') || ['esm', 'cjs', 'umd'];

console.log('🚀 开始构建 @ldesign/cropper...');
console.log(`📦 构建格式: ${formats.join(', ')}`);
console.log(`🔧 开发模式: ${isDev ? '是' : '否'}`);
console.log(`👀 监听模式: ${isWatch ? '是' : '否'}`);

// 清理输出目录
function cleanDist() {
  console.log('🧹 清理输出目录...');
  try {
    execSync('rimraf dist', { cwd: rootDir, stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️ 清理目录失败，继续构建...');
  }
}

// 构建样式文件
function buildStyles() {
  console.log('🎨 构建样式文件...');
  
  const stylesDir = resolve(rootDir, 'src/styles');
  const distDir = resolve(rootDir, 'dist');
  
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }
  
  try {
    // 使用 PostCSS 处理样式
    execSync('postcss src/styles/index.css -o dist/index.css --config postcss.config.js', {
      cwd: rootDir,
      stdio: 'inherit'
    });
    
    console.log('✅ 样式文件构建完成');
  } catch (error) {
    console.error('❌ 样式文件构建失败:', error.message);
    process.exit(1);
  }
}

// 构建 TypeScript
function buildTypeScript() {
  console.log('📝 构建 TypeScript...');
  
  try {
    // 类型检查
    execSync('tsc --noEmit', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ TypeScript 类型检查通过');
    
    // 生成类型定义文件
    execSync('tsc --declaration --emitDeclarationOnly --outDir dist/types', {
      cwd: rootDir,
      stdio: 'inherit'
    });
    console.log('✅ 类型定义文件生成完成');
  } catch (error) {
    console.error('❌ TypeScript 构建失败:', error.message);
    process.exit(1);
  }
}

// 使用 Rollup 构建
function buildWithRollup() {
  console.log('📦 使用 Rollup 构建...');
  
  const rollupCmd = [
    'rollup',
    '-c',
    isDev ? '--environment NODE_ENV:development' : '--environment NODE_ENV:production',
    isWatch ? '--watch' : ''
  ].filter(Boolean).join(' ');
  
  try {
    execSync(rollupCmd, { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ Rollup 构建完成');
  } catch (error) {
    console.error('❌ Rollup 构建失败:', error.message);
    process.exit(1);
  }
}

// 使用 Vite 构建
function buildWithVite() {
  console.log('⚡ 使用 Vite 构建...');
  
  const viteCmd = isWatch ? 'vite build --watch' : 'vite build';
  
  try {
    execSync(viteCmd, { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ Vite 构建完成');
  } catch (error) {
    console.error('❌ Vite 构建失败:', error.message);
    process.exit(1);
  }
}

// 生成包信息
function generatePackageInfo() {
  console.log('📋 生成包信息...');
  
  const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));
  
  const packageInfo = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    license: pkg.license,
    homepage: pkg.homepage,
    repository: pkg.repository,
    bugs: pkg.bugs,
    keywords: pkg.keywords,
    buildTime: new Date().toISOString(),
    buildMode: isDev ? 'development' : 'production',
    formats: formats
  };
  
  writeFileSync(
    resolve(rootDir, 'dist/package-info.json'),
    JSON.stringify(packageInfo, null, 2)
  );
  
  console.log('✅ 包信息生成完成');
}

// 复制必要文件
function copyFiles() {
  console.log('📄 复制必要文件...');
  
  const filesToCopy = [
    'README.md',
    'LICENSE',
    'CHANGELOG.md'
  ];
  
  filesToCopy.forEach(file => {
    const srcPath = resolve(rootDir, file);
    const destPath = resolve(rootDir, 'dist', file);
    
    if (existsSync(srcPath)) {
      try {
        execSync(`cp "${srcPath}" "${destPath}"`, { cwd: rootDir });
        console.log(`✅ 复制 ${file}`);
      } catch (error) {
        console.warn(`⚠️ 复制 ${file} 失败:`, error.message);
      }
    }
  });
}

// 分析包大小
function analyzeBundle() {
  if (!isAnalyze) return;
  
  console.log('📊 分析包大小...');
  
  try {
    execSync('size-limit', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ 包大小分析完成');
  } catch (error) {
    console.warn('⚠️ 包大小分析失败:', error.message);
  }
}

// 运行测试
function runTests() {
  if (isDev || isWatch) return;
  
  console.log('🧪 运行测试...');
  
  try {
    execSync('npm run test:run', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ 测试通过');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 主构建流程
async function build() {
  const startTime = Date.now();
  
  try {
    if (!isWatch) {
      cleanDist();
    }
    
    // 并行构建
    await Promise.all([
      buildStyles(),
      buildTypeScript()
    ]);
    
    // 选择构建工具
    if (process.env.BUILD_TOOL === 'vite') {
      buildWithVite();
    } else {
      buildWithRollup();
    }
    
    if (!isWatch) {
      generatePackageInfo();
      copyFiles();
      analyzeBundle();
      runTests();
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`🎉 构建完成！耗时 ${duration}s`);
    
    if (isWatch) {
      console.log('👀 监听文件变化中...');
    }
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

// 启动构建
build();