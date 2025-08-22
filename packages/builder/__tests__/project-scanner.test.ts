import { ProjectScanner } from '../src/core/project-scanner'

describe('projectScanner', () => {
  it('should scan current project and return valid result', async () => {
    const scanner = new ProjectScanner()
    const result = await scanner.scan(process.cwd(), {
      includePatterns: ['src/**/*.{ts,tsx,js,jsx,vue}'],
      ignorePatterns: ['node_modules/**'],
    })

    expect(result).toBeTruthy()
    expect(result.root).toBe(process.cwd())
    expect(Array.isArray(result.files)).toBe(true)
    expect(result.scanTime).toBeGreaterThanOrEqual(0)
  })
})
