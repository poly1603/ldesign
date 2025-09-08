#!/usr/bin/env node
/*
 * Orchestrates multi-framework icon generation and packaging.
 * - Generates components for Vue2/Vue3/React/Lit using the compiled CLI (dist/cli.js)
 * - Then builds each workspace package
 *
 * Usage:
 *   pnpm run build:all -- [--config path] [--input dir] [--output baseDir] [--frameworks vue2,vue3,react,lit]
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';

const ROOT = process.cwd(); // packages/icons
const DIST_CLI = path.resolve(ROOT, 'dist', 'cli.js');

function log(msg) {
  console.log(msg);
}
function info(msg) {
  console.log(`\x1b[36m${msg}\x1b[0m`); // cyan
}
function warn(msg) {
  console.warn(`\x1b[33m${msg}\x1b[0m`); // yellow
}
function error(msg) {
  console.error(`\x1b[31m${msg}\x1b[0m`); // red
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  return r.status ?? 1;
}

function parseArgs(argv) {
  const args = { frameworks: undefined, config: undefined, input: undefined, output: undefined };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--config' && argv[i + 1]) { args.config = argv[++i]; continue; }
    if (a === '--input' && argv[i + 1]) { args.input = argv[++i]; continue; }
    if (a === '--output' && argv[i + 1]) { args.output = argv[++i]; continue; }
    if (a === '--frameworks' && argv[i + 1]) { args.frameworks = argv[++i]; continue; }
  }
  return args;
}

function resolveFrameworks(frStr, cfg) {
  if (frStr) return frStr.split(',').map(s => s.trim()).filter(Boolean);
  if (Array.isArray(cfg?.frameworks) && cfg.frameworks.length) return cfg.frameworks;
  return ['vue2', 'vue3', 'react', 'lit'];
}

function mapOutputDir(baseOut, fw) {
  if (baseOut) return path.resolve(ROOT, baseOut, fw);
  const map = {
    vue3: path.join(ROOT, 'packages', 'icons-vue', 'src'),
    vue2: path.join(ROOT, 'packages', 'icons-vue2', 'src'),
    react: path.join(ROOT, 'packages', 'icons-react', 'src'),
    lit: path.join(ROOT, 'packages', 'icons-lit', 'src'),
  };
  return map[fw] || path.join(ROOT, 'output', fw);
}

async function main() {
  info('🛠️  LDesign Icons — Multi-framework build orchestrator');

  const argv = parseArgs(process.argv);
  let userConfig = {};
  if (argv.config) {
    const cfgPath = path.resolve(ROOT, argv.config);
    if (!fs.existsSync(cfgPath)) {
      error(`配置文件不存在: ${cfgPath}`);
      process.exit(1);
    }
    info(`📄 使用配置文件: ${cfgPath}`);
    userConfig = await fs.readJson(cfgPath).catch(() => ({}));
  }

  const inputDir = path.resolve(ROOT, argv.input || userConfig.inputDir || 'examples/svg');
  const frameworks = resolveFrameworks(argv.frameworks, userConfig);
  info(`📁 输入目录: ${inputDir}`);
  info(`🎯 目标框架: ${frameworks.join(', ')}`);

  // 1) Ensure CLI is built
  let cliReady = fs.existsSync(DIST_CLI);
  if (!cliReady) {
    info('🔧 未找到 dist/cli.js，正在编译库 (build:lib)...');
    const s = run('pnpm', ['run', 'build:lib']);
    // 即使构建脚本整体失败，只要 dist/cli.js 生成了也视为可用
    cliReady = fs.existsSync(DIST_CLI);
    if (!cliReady) {
      warn('无法编译 CLI，回退到旧的生成脚本 scripts/generate-components.js');
      // 先生成 SVG manifest
      const svgStatus = run('pnpm', ['run', 'build:svg']);
      if (svgStatus !== 0) {
        error('生成 SVG manifest 失败');
        process.exit(svgStatus);
      }
      const legacyStatus = run('node', ['scripts/generate-components.js']);
      if (legacyStatus !== 0) {
        error('回退生成失败。请修复构建或检查依赖。');
        process.exit(legacyStatus);
      }
      // 直接进入打包流程（仅构建所选框架）
      info('\n📦 打包所选框架组件库');
      const workspaceMap = {
        vue3: '@ldesign/icons-vue',
        vue2: '@ldesign/icons-vue2',
        react: '@ldesign/icons-react',
        lit: '@ldesign/icons-lit',
      };
      for (const fw of frameworks) {
        const ws = workspaceMap[fw];
        if (!ws) continue;
        info(`🧱 构建 ${fw}（${ws}）`);
        const status = run('npm', ['run', 'build', '--workspace=' + ws]);
        if (status !== 0) {
          error(`构建 ${fw} 失败`);
          process.exit(status);
        }
      }
      process.exit(0);
    }
  }

  // 2) Generate per framework
  for (const fw of frameworks) {
    const outDir = mapOutputDir(argv.output || userConfig.outputDir, fw);
    info(`\n🚀 生成 ${fw} 组件 -> ${outDir}`);

    await fs.ensureDir(outDir);
    await fs.emptyDir(outDir);

    const args = ['"' + DIST_CLI + '"', 'convert', '-i', '"' + inputDir + '"', '-o', '"' + outDir + '"', '-t', fw, '--verbose'];
    if (argv.config) {
      args.push('-c', '"' + path.resolve(ROOT, argv.config) + '"');
    }

    const status = run('node', args);
    if (status !== 0) {
      error(`生成 ${fw} 组件失败`);
      process.exit(status);
    }
  }

  // 3) Build packages (only for selected frameworks)
  info('\n📦 打包所选框架组件库');
  const workspaceMap = {
    vue3: '@ldesign/icons-vue',
    vue2: '@ldesign/icons-vue2',
    react: '@ldesign/icons-react',
    lit: '@ldesign/icons-lit',
  };
  for (const fw of frameworks) {
    const ws = workspaceMap[fw];
    if (!ws) continue;
    info(`🧱 构建 ${fw}（${ws}）`);
    const status = run('npm', ['run', 'build', '--workspace=' + ws]);
    if (status !== 0) {
      error(`构建 ${fw} 失败`);
      process.exit(status);
    }
  }

  info('\n🎉 全部完成！生成与打包成功。');
}

main().catch((e) => {
  error(e?.stack || String(e));
  process.exit(1);
});

