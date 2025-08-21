import { ProjectScanner } from '../src/core/project-scanner'
import { PluginConfigurator } from '../src/core/plugin-configurator'

describe('PluginConfigurator', () => {
  it('should configure plugins without throwing', async () => {
    const scanner = new ProjectScanner()
    const scan = await scanner.scan(process.cwd(), {
      includePatterns: ['src/**/*.{ts,tsx,js,jsx,vue}'],
      ignorePatterns: ['node_modules/**']
    })

    const configurator = new PluginConfigurator()
    const plugins = await configurator.configure(scan, { mode: 'development' })

    expect(Array.isArray(plugins)).toBe(true)
  })
})


