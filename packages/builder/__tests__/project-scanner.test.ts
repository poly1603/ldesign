import { ProjectScanner } from '../src/core/project-scanner'
import { FileType, ProjectType } from '../src/types'

describe('ProjectScanner', () => {
  let scanner: ProjectScanner

  beforeEach(() => {
    scanner = new ProjectScanner()
  })

  describe('scan', () => {
    it('should scan current project and return valid result', async () => {
      const result = await scanner.scan(process.cwd(), {
        includePatterns: ['src/**/*.{ts,tsx,js,jsx,vue}'],
        ignorePatterns: ['node_modules/**'],
      })

      expect(result).toBeTruthy()
      expect(result.root).toBe(process.cwd())
      expect(Array.isArray(result.files)).toBe(true)
      expect(result.scanTime).toBeGreaterThanOrEqual(0)
      expect(result.projectType).toBeDefined()
      expect(result.entryPoints).toBeDefined()
      expect(result.dependencyGraph).toBeDefined()
    })

    it('should detect TypeScript files correctly', async () => {
      const result = await scanner.scan(process.cwd(), {
        includePatterns: ['src/**/*.ts'],
        ignorePatterns: ['node_modules/**'],
      })

      const tsFiles = result.files.filter(f => f.type === 'typescript')
      expect(tsFiles.length).toBeGreaterThan(0)
    })

    it('should detect project type correctly', async () => {
      const result = await scanner.scan(process.cwd(), {
        includePatterns: ['src/**/*.{ts,tsx,js,jsx,vue}'],
        ignorePatterns: ['node_modules/**'],
      })

      expect(['typescript', 'vue', 'react', 'javascript']).toContain(result.projectType)
    })

    it('should read package.json information', async () => {
      const result = await scanner.scan(process.cwd(), {
        includePatterns: ['src/**/*.{ts,tsx,js,jsx,vue}'],
        ignorePatterns: ['node_modules/**'],
      })

      expect(result.packageInfo).toBeTruthy()
      expect(result.packageInfo?.name).toBe('@ldesign/builder')
    })
  })
})
