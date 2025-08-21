import type { BuildOptions, OutputFormat, FileInfo } from '../src/types'

describe('Types', () => {
  it('BuildOptions should accept basic fields', () => {
    const options: BuildOptions = {
      input: 'src/index.ts',
      outDir: 'dist',
      formats: ['esm', 'cjs'] as OutputFormat[],
      mode: 'development',
      sourcemap: true,
      dts: false,
    }
    expect(options.outDir).toBe('dist')
  })

  it('FileInfo should allow optional fields', () => {
    const f: FileInfo = {
      path: 'src/index.ts',
      relativePath: 'src/index.ts',
      type: 'typescript',
      size: 10,
      dependencies: [],
      isEntry: true,
    }
    expect(f.isEntry).toBe(true)
  })
})


