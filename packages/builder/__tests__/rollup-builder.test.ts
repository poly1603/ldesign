import { PluginConfigurator } from '../src/core/plugin-configurator'
import { ProjectScanner } from '../src/core/project-scanner'
import { RollupBuilder } from '../src/core/rollup-builder'
import { ProjectScanResult, FileType, ProjectType } from '../src/types'

describe('RollupBuilder', () => {
  let builder: RollupBuilder

  beforeEach(() => {
    builder = new RollupBuilder()
  })

  const createMockScanResult = (projectType: ProjectType, fileTypes: FileType[] = []): ProjectScanResult => ({
    projectType,
    root: process.cwd(),
    files: fileTypes.map((type, index) => ({
      path: `/mock/file${index}.${type}`,
      relativePath: `file${index}.${type}`,
      type,
      size: 100,
      name: `file${index}`,
      extension: `.${type}`,
      isEntry: index === 0,
      dependencies: [],
      exports: [],
    })),
    entryPoints: ['src/index.ts'],
    dependencyGraph: { nodes: new Map(), edges: [] },
    scanTime: 0,
    packageInfo: {
      name: '@ldesign/test-package',
      version: '1.0.0',
    },
  })

  describe('build', () => {
    it('should generate build options and not throw with minimal project', async () => {
      const scanner = new ProjectScanner()
      const scan = await scanner.scan(process.cwd(), {
        includePatterns: ['src/**/*.{ts,tsx,js,jsx,vue}'],
        ignorePatterns: ['node_modules/**'],
      })

      const configurator = new PluginConfigurator()
      const plugins = await configurator.configure(scan, { mode: 'development', formats: ['esm'] })

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

    it('should support multiple output formats', async () => {
      const scanResult = createMockScanResult('typescript', ['typescript'])
      const configurator = new PluginConfigurator()
      const plugins = await configurator.configure(scanResult, { mode: 'production' })

      const resultPromise = builder.build(scanResult, { plugins }, {
        input: 'src/index.ts',
        outDir: 'dist-test',
        formats: ['esm', 'cjs', 'umd'],
        mode: 'production',
        sourcemap: true,
        name: 'TestLibrary',
      })

      await expect(resultPromise).resolves.toBeTruthy()
    })

    it('should handle Vue projects correctly', async () => {
      const scanResult = createMockScanResult('vue', ['vue', 'typescript'])
      const configurator = new PluginConfigurator()
      const plugins = await configurator.configure(scanResult, { mode: 'production' })

      const resultPromise = builder.build(scanResult, { plugins }, {
        input: 'src/index.ts',
        outDir: 'dist-test',
        formats: ['esm', 'cjs'],
        mode: 'production',
        external: ['vue'],
        globals: { vue: 'Vue' },
      })

      await expect(resultPromise).resolves.toBeTruthy()
    })
  })
})
