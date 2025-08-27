import { PluginConfigurator } from '../src/core/plugin-configurator'
import { ProjectScanner } from '../src/core/project-scanner'
import { ProjectScanResult, FileType, ProjectType } from '../src/types'

describe('PluginConfigurator', () => {
  let configurator: PluginConfigurator

  beforeEach(() => {
    configurator = new PluginConfigurator()
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
    entryPoints: ['/mock/file0.ts'],
    dependencyGraph: { nodes: new Map(), edges: [] },
    scanTime: 0,
  })

  describe('configure', () => {
    it('should configure plugins without throwing', async () => {
      const scanner = new ProjectScanner()
      const scan = await scanner.scan(process.cwd(), {
        includePatterns: ['src/**/*.{ts,tsx,js,jsx,vue}'],
        ignorePatterns: ['node_modules/**'],
      })

      const plugins = await configurator.configure(scan, { mode: 'development' })

      expect(Array.isArray(plugins)).toBe(true)
    })

    it('should configure basic plugins for TypeScript project', async () => {
      const scanResult = createMockScanResult('typescript', ['typescript'])
      const plugins = await configurator.configure(scanResult, {
        mode: 'production',
      })

      expect(Array.isArray(plugins)).toBe(true)
      expect(plugins.length).toBeGreaterThan(0)
    })

    it('should configure Vue plugins for Vue project', async () => {
      const scanResult = createMockScanResult('vue', ['vue', 'typescript'])
      const plugins = await configurator.configure(scanResult, {
        mode: 'production',
      })

      expect(Array.isArray(plugins)).toBe(true)
      expect(plugins.length).toBeGreaterThan(0)
    })

    it('should configure Vue JSX plugin when JSX files are detected', async () => {
      const scanResult = createMockScanResult('vue', ['vue', 'tsx', 'typescript'])
      const plugins = await configurator.configure(scanResult, {
        mode: 'production',
      })

      expect(Array.isArray(plugins)).toBe(true)
      expect(plugins.length).toBeGreaterThan(0)
    })

    it('should configure style plugins when style files are detected', async () => {
      const scanResult = createMockScanResult('typescript', ['typescript', 'css', 'less', 'scss'])
      const plugins = await configurator.configure(scanResult, {
        mode: 'production',
      })

      expect(Array.isArray(plugins)).toBe(true)
      expect(plugins.length).toBeGreaterThan(0)
    })
  })
})
