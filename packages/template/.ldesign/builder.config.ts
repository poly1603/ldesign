import { defineConfig, LibraryType } from '@ldesign/builder'
import fs from 'fs'
import path from 'path'

function readPackage() {
  try {
    const p = path.resolve(process.cwd(), 'package.json')
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return {}
  }
}

function pascalCase(name: string): string {
  const base = name.replace(/^@[^/]+\//, '')
  return base.split(/[\/-]/).filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
}

const pkg: any = readPackage()
const external: string[] = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  // Node.js built-in modules
  'fs', 'path', 'util', 'stream', 'os', 'events',
  'node:fs', 'node:path', 'node:fs/promises',
  // Common third-party dependencies that might be bundled
  'chokidar', 'is-glob', 'readdirp', 'normalize-path', 'braces',
  'glob-parent', 'anymatch', 'is-binary-path', 'picomatch',
  'is-extglob', 'fill-range', 'binary-extensions', 'to-regex-range', 'is-number'
]
const knownGlobals: Record<string, string> = {
  vue: 'Vue',
  react: 'React',
  'react-dom': 'ReactDOM',
  '@vueuse/core': 'VueUse'
}
const umdGlobals = external.reduce((acc, dep) => {
  acc[dep] = knownGlobals[dep] || pascalCase(dep)
  return acc
}, {} as Record<string, string>)

export default defineConfig({
  libraryType: LibraryType.VUE3, // 明确指定为 Vue3 项目
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  external,

  // 禁用 tree-shaking 以确保模板文件被包含
  performance: {
    treeshaking: false
  },

  // Vue 和 JSX 支持由 Vue3Strategy 自动处理

  // TypeScript 和 CSS 处理由 Vue3Strategy 自动处理

  output: {
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue', '!src/index-lib.ts', '!src/**/__tests__/**', '!src/**/*.test.*', '!src/**/*.spec.*']
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue', '!src/index-lib.ts', '!src/**/__tests__/**', '!src/**/*.test.*', '!src/**/*.spec.*']
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      name: pascalCase(pkg.name || 'LDesignTemplate'),
      globals: umdGlobals,
      input: 'src/index.ts'
    },
  },
})

