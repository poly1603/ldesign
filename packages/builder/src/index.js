#!/usr/bin/env node

/**
 * LDesign Builder
 * 通用的组件库构建脚本
 */

import { build } from 'vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取项目根目录
const projectRoot = process.cwd();
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf-8'));

console.log(`🔨 Building ${packageJson.name}@${packageJson.version}...`);

// 构建配置
const builds = [
  // 核心库 ES Module
  {
    entry: resolve(projectRoot, 'src/index.ts'),
    formats: ['es'],
    fileName: 'index',
    outDir: 'dist'
  },
  // 核心库 CommonJS
  {
    entry: resolve(projectRoot, 'src/index.ts'),
    formats: ['cjs'],
    fileName: 'index',
    outDir: 'dist'
  },
  // 核心库 UMD
  {
    entry: resolve(projectRoot, 'src/index.ts'),
    formats: ['umd'],
    fileName: 'index',
    name: 'LDesignPicker',
    outDir: 'dist'
  },
  // Vue 组件
  {
    entry: resolve(projectRoot, 'src/vue/index.ts'),
    formats: ['es', 'cjs'],
    fileName: 'vue/index',
    outDir: 'dist',
    external: ['vue']
  },
  // React 组件
  {
    entry: resolve(projectRoot, 'src/react/index.tsx'),
    formats: ['es', 'cjs'],
    fileName: 'react/index',
    outDir: 'dist',
    external: ['react', 'react-dom']
  }
];

// Vite 构建配置生成器
function createBuildConfig(buildItem) {
  return {
    configFile: false,
    build: {
      lib: {
        entry: buildItem.entry,
        formats: buildItem.formats,
        fileName: (format) => {
          const ext = format === 'es' ? 'mjs' : 'js';
          return `${buildItem.fileName}.${ext}`;
        },
        name: buildItem.name
      },
      rollupOptions: {
        external: buildItem.external || [],
        output: {
          dir: resolve(projectRoot, buildItem.outDir),
          preserveModules: buildItem.preserveModules,
          globals: {
            vue: 'Vue',
            react: 'React',
            'react-dom': 'ReactDOM'
          }
        }
      },
      outDir: resolve(projectRoot, buildItem.outDir),
      emptyOutDir: false,
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    }
  };
}

// 构建 TypeScript 声明文件
async function buildTypes() {
  const { execSync } = await import('child_process');
  
  console.log('📝 Generating TypeScript declarations...');
  
  try {
    execSync('tsc --emitDeclarationOnly --declaration --outDir dist/types', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    // 复制声明文件到正确位置
    const typeFiles = [
      { from: 'dist/types/index.d.ts', to: 'dist/index.d.ts' },
      { from: 'dist/types/vue/index.d.ts', to: 'dist/vue/index.d.ts' },
      { from: 'dist/types/react/index.d.ts', to: 'dist/react/index.d.ts' }
    ];
    
    for (const file of typeFiles) {
      try {
        copyFileSync(
          resolve(projectRoot, file.from),
          resolve(projectRoot, file.to)
        );
      } catch (err) {
        // 文件可能不存在，忽略
      }
    }
    
    console.log('✅ TypeScript declarations generated');
  } catch (error) {
    console.warn('⚠️ Failed to generate TypeScript declarations:', error.message);
  }
}

// 构建样式文件
async function buildStyles() {
  console.log('🎨 Processing styles...');
  
  // 确保输出目录存在
  mkdirSync(resolve(projectRoot, 'dist'), { recursive: true });
  
  // 复制样式文件
  try {
    copyFileSync(
      resolve(projectRoot, 'src/styles/picker.css'),
      resolve(projectRoot, 'dist/style.css')
    );
    console.log('✅ Styles copied');
  } catch (error) {
    console.error('❌ Failed to copy styles:', error);
  }
}

// 主构建函数
async function runBuild() {
  const startTime = Date.now();
  
  try {
    // 清理输出目录
    const { rmSync } = await import('fs');
    rmSync(resolve(projectRoot, 'dist'), { recursive: true, force: true });
    console.log('🧹 Cleaned output directory');
    
    // 并行构建所有目标
    console.log('🚀 Building library...');
    const buildPromises = builds.map(buildItem => {
      const config = createBuildConfig(buildItem);
      return build(config);
    });
    
    await Promise.all(buildPromises);
    console.log('✅ All builds completed');
    
    // 构建类型声明
    await buildTypes();
    
    // 构建样式
    await buildStyles();
    
    // 生成包信息文件
    const pkgInfo = {
      name: packageJson.name,
      version: packageJson.version,
      main: packageJson.main,
      module: packageJson.module,
      types: packageJson.types,
      exports: packageJson.exports
    };
    
    writeFileSync(
      resolve(projectRoot, 'dist/package.json'),
      JSON.stringify(pkgInfo, null, 2)
    );
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✨ Build completed in ${duration}s`);
    console.log(`📦 Output: ${resolve(projectRoot, 'dist')}`);
    
    // 显示构建产物大小
    const { statSync, readdirSync } = await import('fs');
    const distFiles = readdirSync(resolve(projectRoot, 'dist'), { recursive: true });
    let totalSize = 0;
    
    console.log('\n📊 Build artifacts:');
    for (const file of distFiles) {
      if (typeof file === 'string' && !file.includes('node_modules')) {
        try {
          const stats = statSync(resolve(projectRoot, 'dist', file));
          if (stats.isFile()) {
            const size = (stats.size / 1024).toFixed(2);
            totalSize += stats.size;
            console.log(`   ${file}: ${size} KB`);
          }
        } catch (err) {
          // 忽略错误
        }
      }
    }
    
    console.log(`\n📏 Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// 执行构建
runBuild();