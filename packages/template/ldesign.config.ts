import { defineConfig } from '@ldesign/builder'
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
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  external,
  output: {
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', 'src/**/*.vue', '!src/index-lib.ts']
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', 'src/**/*.vue', '!src/index-lib.ts']
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

