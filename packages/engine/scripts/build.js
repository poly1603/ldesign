/**
 * engine 构建脚本
 * 使用 @ldesign/builder 提供的通用 build API 进行构建
 */

import { promises as fs } from 'node:fs'
import { join, sep } from 'node:path'
import { build } from '@ldesign/builder'

async function fileExists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function moveIfExists(from, to) {
  if (await fileExists(from)) {
    await ensureDir(join(to, '..'))
    await fs.rename(from, to)
  }
}

async function copyIfExists(from, to) {
  if (await fileExists(from)) {
    await ensureDir(join(to, '..'))
    await fs.copyFile(from, to)
  }
}

async function rimrafDir(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true })
  } catch {}
}

async function main() {
  const args = process.argv.slice(2)
  const isDev = args.includes('--dev')
  const typesOnly = args.includes('--types')
  const forceClean = args.includes('--clean')

  const external = [
    'vue',
    'react',
    'react-dom',
    '@ldesign/shared',
    '@ldesign/utils',
  ]

  const globals = {
    vue: 'Vue',
    react: 'React',
    'react-dom': 'ReactDOM',
  }

  try {
    /** @type {import('@ldesign/builder').BuildOptions} */
    const options = typesOnly
      ? {
          input: 'src/index.ts',
          outDir: 'dist',
          formats: [], // 不生成 js，仅生成 d.ts
          dts: {
            outDir: 'dist',
            fileName: 'index.d.ts',
            respectExternal: true,
          },
          sourcemap: false,
          minify: false,
          clean: forceClean || !isDev,
          external,
          globals,
        }
      : {
          input: 'src/index.ts',
          outDir: 'dist',
          formats: ['esm', 'cjs'],
          dts: {
            outDir: 'dist',
            fileName: 'index.d.ts',
            respectExternal: true,
          },
          sourcemap: true,
          minify: !isDev,
          clean: forceClean || !isDev,
          external,
          globals,
        }

    // 抑制控制台输出中的特定警告
    const originalConsoleWarn = console.warn
    console.warn = (...args) => {
      const message = args.join(' ')
      // 过滤掉空 chunk 警告
      if (message.includes('Generated an empty chunk')) {
        return
      }
      originalConsoleWarn.apply(console, args)
    }

    const result = await build(options)

    // 恢复原始的 console.warn
    console.warn = originalConsoleWarn

    if (!result.success) {
      console.error(`❌ 构建失败: ${result.errors?.map(e => e.message).join(', ')}`)
      process.exit(1)
    }

    // 整理输出到 package.json 期望的路径
    if (!typesOnly) {
      // 将 ESM 输出从 dist/esm/index.js 移动到 dist/index.js
      await moveIfExists(join('dist', 'esm', 'index.js'), join('dist', 'index.js'))
      await moveIfExists(join('dist', 'esm', 'index.js.map'), join('dist', 'index.js.map'))

      // 将 CJS 输出从 dist/cjs/index.js 移动到 dist/index.cjs
      // sourcemap 文件名也需要同步改为 index.cjs.map
      if (await fileExists(join('dist', 'cjs', 'index.js'))) {
        await ensureDir('dist')
        await fs.rename(join('dist', 'cjs', 'index.js'), join('dist', 'index.cjs'))
        if (await fileExists(join('dist', 'cjs', 'index.js.map'))) {
          await fs.rename(join('dist', 'cjs', 'index.js.map'), join('dist', 'index.cjs.map'))
        }
      }

      // 可选：清理多余的子目录（若为空）
      await rimrafDir(join('dist', 'esm'))
      await rimrafDir(join('dist', 'cjs'))
    }

    console.log(`✅ ${process.cwd().split(sep).pop()} 构建成功！`)
  } catch (error) {
    console.error('❌ 构建过程中发生错误:', error)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
