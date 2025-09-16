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
const external: string[] = Object.keys(pkg.peerDependencies || {})
const knownGlobals: Record<string, string> = { vue: 'Vue', react: 'React', 'react-dom': 'ReactDOM' }
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
      input: ['src/**/*.ts', '!src/index-lib.ts']
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', '!src/index-lib.ts']
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      name: pascalCase(pkg.name || 'LDesignRouter'),
      globals: umdGlobals,
      input: 'src/index.ts'
    },
  },
})
