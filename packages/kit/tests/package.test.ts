/**
 * Package 模块测试
 */


import { vi } from 'vitest'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FileSystem } from '../src/filesystem'
import { PackageManager, PackageUtils } from '../src/package'

// Mock exec 函数
vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}))

describe('packageManager', () => {
  let testDir: string
  let packageManager: PackageManager

  beforeEach(async () => {
    testDir = join(tmpdir(), `ldesign-package-test-${Date.now()}`)
    await FileSystem.createDir(testDir)
    packageManager = new PackageManager(testDir)
  })

  afterEach(async () => {
    try {
      await FileSystem.removeDir(testDir)
    }
    catch {
      // 忽略清理错误
    }
  })

  describe('package.json 操作', () => {
    it('应该能够读取 package.json', async () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
        },
      }

      await FileSystem.writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(mockPackageJson, null, 2),
      )

      const pkg = await packageManager.readPackageJson()
      expect(pkg.name).toBe('test-package')
      expect(pkg.version).toBe('1.0.0')
      expect(pkg.dependencies?.lodash).toBe('^4.17.21')
    })

    it('应该能够写入 package.json', async () => {
      const packageData = {
        name: 'new-package',
        version: '2.0.0',
        description: 'A test package',
      }

      await packageManager.writePackageJson(packageData)

      const content = await FileSystem.readFile(join(testDir, 'package.json'))
      const parsed = JSON.parse(content)
      expect(parsed.name).toBe('new-package')
      expect(parsed.version).toBe('2.0.0')
      expect(parsed.description).toBe('A test package')
    })

    it('应该能够更新 package.json', async () => {
      const initialPackage = {
        name: 'test-package',
        version: '1.0.0',
      }

      await FileSystem.writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(initialPackage, null, 2),
      )

      await packageManager.updatePackageJson({
        version: '1.1.0',
        description: 'Updated package',
      })

      const pkg = await packageManager.readPackageJson()
      expect(pkg.version).toBe('1.1.0')
      expect(pkg.description).toBe('Updated package')
      expect(pkg.name).toBe('test-package') // 保持原有字段
    })
  })

  describe('依赖管理', () => {
    beforeEach(async () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      }

      await FileSystem.writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(mockPackageJson, null, 2),
      )
    })

    it('应该能够添加依赖', async () => {
      await packageManager.addDependency('lodash', '^4.17.21')

      const pkg = await packageManager.readPackageJson()
      expect(pkg.dependencies?.lodash).toBe('^4.17.21')
    })

    it('应该能够添加开发依�?, async () => {
      await packageManager.addDependency('typescript', '^5.0.0', { dev: true })

      const pkg = await packageManager.readPackageJson()
      expect(pkg.devDependencies?.typescript).toBe('^5.0.0')
    })

    it('应该能够移除依赖', async () => {
      // 先添加依�?      await packageManager.addDependency('lodash', '^4.17.21')

      // 再移除依�?      await packageManager.removeDependency('lodash')

      const pkg = await packageManager.readPackageJson()
      expect(pkg.dependencies?.lodash).toBeUndefined()
    })

    it('应该能够获取依赖列表', async () => {
      await packageManager.addDependency('lodash', '^4.17.21')
      await packageManager.addDependency('axios', '^1.0.0')
      await packageManager.addDependency('typescript', '^5.0.0', { dev: true })

      const deps = await packageManager.getDependencies()
      expect(deps.dependencies).toEqual({
        lodash: '^4.17.21',
        axios: '^1.0.0',
      })
      expect(deps.devDependencies).toEqual({
        typescript: '^5.0.0',
      })
    })
  })

  describe('脚本管理', () => {
    beforeEach(async () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'vitest',
          build: 'rollup -c',
        },
      }

      await FileSystem.writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(mockPackageJson, null, 2),
      )
    })

    it('应该能够获取脚本列表', async () => {
      const scripts = await packageManager.getScripts()
      expect(scripts).toEqual({
        test: 'vitest',
        build: 'rollup -c',
      })
    })

    it('应该能够添加脚本', async () => {
      await packageManager.addScript('dev', 'vite')

      const pkg = await packageManager.readPackageJson()
      expect(pkg.scripts?.dev).toBe('vite')
    })

    it('应该能够移除脚本', async () => {
      await packageManager.removeScript('test')

      const pkg = await packageManager.readPackageJson()
      expect(pkg.scripts?.test).toBeUndefined()
      expect(pkg.scripts?.build).toBe('rollup -c') // 其他脚本保持不变
    })

    it('应该能够运行脚本', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'Script executed successfully', stderr: '' } as any)
        }
        return {} as any
      })

      const result = await packageManager.runScript('test')
      expect(result.stdout).toBe('Script executed successfully')
    })
  })

  describe('包安�?, () => {
    it('应该能够安装�?, async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'Package installed successfully', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(packageManager.install()).resolves.not.toThrow()
    })

    it('应该能够安装特定�?, async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'lodash installed', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(packageManager.installPackage('lodash')).resolves.not.toThrow()
    })

    it('应该能够卸载�?, async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'lodash uninstalled', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(packageManager.uninstallPackage('lodash')).resolves.not.toThrow()
    })
  })

  describe('版本管理', () => {
    beforeEach(async () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
      }

      await FileSystem.writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(mockPackageJson, null, 2),
      )
    })

    it('应该能够更新版本', async () => {
      await packageManager.updateVersion('1.1.0')

      const pkg = await packageManager.readPackageJson()
      expect(pkg.version).toBe('1.1.0')
    })

    it('应该能够递增版本', async () => {
      await packageManager.bumpVersion('patch')

      const pkg = await packageManager.readPackageJson()
      expect(pkg.version).toBe('1.0.1')
    })

    it('应该能够递增次版本号', async () => {
      await packageManager.bumpVersion('minor')

      const pkg = await packageManager.readPackageJson()
      expect(pkg.version).toBe('1.1.0')
    })

    it('应该能够递增主版本号', async () => {
      await packageManager.bumpVersion('major')

      const pkg = await packageManager.readPackageJson()
      expect(pkg.version).toBe('2.0.0')
    })
  })
})

describe('packageUtils', () => {
  describe('工具函数', () => {
    it('应该能够解析包名', () => {
      expect(PackageUtils.parsePackageName('lodash')).toEqual({
        name: 'lodash',
        scope: undefined,
        version: undefined,
      })

      expect(PackageUtils.parsePackageName('@types/node')).toEqual({
        name: '@types/node',
        scope: '@types',
        version: undefined,
      })

      expect(PackageUtils.parsePackageName('lodash@4.17.21')).toEqual({
        name: 'lodash',
        scope: undefined,
        version: '4.17.21',
      })
    })

    it('应该能够验证版本�?, () => {
      expect(PackageUtils.isValidVersion('1.0.0')).toBe(true)
      expect(PackageUtils.isValidVersion('1.0.0-alpha.1')).toBe(true)
      expect(PackageUtils.isValidVersion('invalid')).toBe(false)
    })

    it('应该能够比较版本�?, () => {
      expect(PackageUtils.compareVersions('1.0.0', '1.0.1')).toBe(-1)
      expect(PackageUtils.compareVersions('1.1.0', '1.0.0')).toBe(1)
      expect(PackageUtils.compareVersions('1.0.0', '1.0.0')).toBe(0)
    })

    it('应该能够检查版本是否满足范�?, () => {
      expect(PackageUtils.satisfiesRange('1.2.3', '^1.0.0')).toBe(true)
      expect(PackageUtils.satisfiesRange('2.0.0', '^1.0.0')).toBe(false)
      expect(PackageUtils.satisfiesRange('1.0.5', '~1.0.0')).toBe(true)
    })

    it('应该能够查找包管理器', async () => {
      // Mock FileSystem.exists
      vi.spyOn(FileSystem, 'exists').mockImplementation(async (path) => {
        return path.includes('package-lock.json')
      })

      const manager = await PackageUtils.detectPackageManager('/test/project')
      expect(manager).toBe('npm')
    })

    it('应该能够获取包信�?, async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          const mockInfo = JSON.stringify({
            name: 'lodash',
            version: '4.17.21',
            description: 'A modern JavaScript utility library',
          })
          callback(null, { stdout: mockInfo, stderr: '' } as any)
        }
        return {} as any
      })

      const info = await PackageUtils.getPackageInfo('lodash')
      expect(info.name).toBe('lodash')
      expect(info.version).toBe('4.17.21')
    })
  })
})



