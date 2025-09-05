import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
// 注意：rollup-plugin-terser 可能需要特殊处理
// import { terser } from 'rollup-plugin-terser';
import { readdirSync, statSync } from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * 创建通用的 Rollup 配置
 * @param {Object} options - 配置选项
 * @param {string} options.packagePath - 包的路径
 * @param {string[]} options.external - 外部依赖
 * @param {string} options.umdName - UMD 全局变量名
 * @param {Object} options.umdGlobals - UMD 全局变量映射
 */
export function createRollupConfig(options) {
  const { packagePath, external = [], umdName, umdGlobals = {} } = options;
  
  const pkg = require(path.resolve(packagePath, 'package.json'));
  const inputDir = path.resolve(packagePath, 'src');
  const inputFiles = {};

  // 扫描 src 目录下所有的 .ts/.tsx 文件
  function scanDirectory(dir, baseDir = inputDir) {
    const files = readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, baseDir);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const relativePath = path.relative(baseDir, fullPath);
        const key = relativePath.replace(/\.tsx?$/, '').replace(/\\/g, '/');
        inputFiles[key] = fullPath;
      }
    });
  }

  scanDirectory(inputDir);

  const buildConfigs = [
    // ESM BUILD (按需导入)
    {
      input: inputFiles,
      plugins: [
        resolve(),
        commonjs(),
        typescript({
          tsconfig: path.resolve(packagePath, 'tsconfig.json'),
          declaration: false,
          declarationMap: false,
          outDir: null // 让 Rollup 控制输出目录
        })
      ],
      external,
      output: {
        dir: path.resolve(packagePath, 'es'),
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: true,
        entryFileNames: '[name].js'
      }
    },
    // CJS BUILD (按需导入)
    {
      input: inputFiles,
      plugins: [
        resolve(),
        commonjs(),
        typescript({
          tsconfig: path.resolve(packagePath, 'tsconfig.json'),
          declaration: false,
          declarationMap: false,
          outDir: null // 让 Rollup 控制输出目录
        })
      ],
      external,
      output: {
        dir: path.resolve(packagePath, 'lib'),
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: true,
        entryFileNames: '[name].js'
      }
    },
    // 类型声明文件（放 es/ 下）
    {
      input: inputFiles,
      plugins: [dts()],
      external,
      output: {
        dir: path.resolve(packagePath, 'es'),
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].d.ts',
        format: 'es'
      }
    },
    // 类型声明文件（放 lib/ 下）
    {
      input: inputFiles,
      plugins: [dts()],
      external,
      output: {
        dir: path.resolve(packagePath, 'lib'),
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].d.ts',
        format: 'es'
      }
    }
  ];

  // 只有当存在 index.ts 时才添加 UMD 构建
  if (inputFiles.index) {
    buildConfigs.push({
      input: path.resolve(packagePath, 'src/index.ts'),
      plugins: [
        resolve(),
        commonjs(),
        typescript({
          tsconfig: path.resolve(packagePath, 'tsconfig.json'),
          declaration: false,
          declarationMap: false,
          outDir: null // 让 Rollup 控制输出目录
        }),
        // terser() // 暂时注释，避免导入问题
      ],
      external,
      output: {
        file: path.resolve(packagePath, 'dist/umd/index.min.js'),
        format: 'umd',
        name: umdName || pkg.umd?.global || 'LDesignIcons',
        globals: umdGlobals || pkg.umd?.globals || {},
        sourcemap: true
      }
    });
  }

  return buildConfigs;
}

export default createRollupConfig;
