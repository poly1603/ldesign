import { PluginConfigurator } from '../src/core/plugin-configurator'
import { ProjectScanner } from '../src/core/project-scanner'
import { RollupBuilder } from '../src/core/rollup-builder'

describe('rollupBuilder', () => {
  it('should generate build options and not throw with minimal project', async () => {
    const scanner = new ProjectScanner()
    const scan = await scanner.scan(process.cwd(), {
      includePatterns: ['src/**/*.{ts,tsx,js,jsx,vue}'],
      ignorePatterns: ['node_modules/**'],
    })

    const configurator = new PluginConfigurator()
    const plugins = await configurator.configure(scan, { mode: 'development', formats: ['esm'] })

    const builder = new RollupBuilder()
    // 不真正执行构建，调用内部生成配置的逻辑通过公共API间接验证
    const resultPromise = builder.build(scan, { plugins }, {
      input: scan.entryPoints[0] || 'src/index.ts',
      outDir: 'dist-test',
      formats: ['esm'],
      mode: 'development',
      sourcemap: false,
    })

    await expect(resultPromise).resolves.toBeTruthy()
  })
})
