import { describe, it, expect } from 'vitest'
import { RollupAdapter } from '../../../adapters/rollup/RollupAdapter'

describe('RollupAdapter.transformConfig', () => {
  it('should map formats to correct output directories and filenames', async () => {
    const adapter = new RollupAdapter({})
    const cfg: any = {
      input: 'src/index.ts',
      output: {
        format: ['esm', 'cjs', 'umd'],
        sourcemap: true,
      },
      external: [],
      plugins: [],
    }

    const rollupCfg: any = await adapter.transformConfig(cfg)
    expect(Array.isArray(rollupCfg.output)).toBe(true)

    const byDir: Record<string, any> = {}
    for (const o of rollupCfg.output) {
      // UMD格式使用file而不是dir
      const key = o.dir || (o.file ? 'dist' : 'unknown')
      byDir[key] = o
    }

    expect(byDir['es']).toBeTruthy()
    expect(byDir['lib']).toBeTruthy()
    expect(byDir['dist']).toBeTruthy()

    expect(byDir['es'].format).toBe('es')
    expect(byDir['lib'].format).toBe('cjs')
    expect(byDir['dist'].format).toBe('umd')

    expect(byDir['es'].entryFileNames).toBe('[name].js')
    expect(byDir['lib'].entryFileNames).toBe('[name].cjs')
    // UMD格式使用file而不是entryFileNames
    expect(byDir['dist'].file).toBe('dist/index.js')

    expect(byDir['es'].preserveModules).toBe(true)
    expect(byDir['lib'].preserveModules).toBe(true)
    expect(byDir['dist'].preserveModules).toBeFalsy()
  })
})

