import { beforeEach, describe, expect, it } from 'vitest'
import { createLauncher, ViteLauncher } from '../src/index'

describe('viteLauncher 基础功能测试', () => {
  let launcher: ViteLauncher

  beforeEach(() => {
    launcher = new ViteLauncher({
      logLevel: 'silent',
      mode: 'development',
    })
  })

  describe('构造函数', () => {
    it('应该创建ViteLauncher实例', () => {
      expect(launcher).toBeInstanceOf(ViteLauncher)
    })

    it('应该使用默认配置创建实例', () => {
      const defaultLauncher = new ViteLauncher()
      expect(defaultLauncher).toBeInstanceOf(ViteLauncher)
    })

    it('应该使用自定义配置创建实例', () => {
      const customLauncher = new ViteLauncher({
        logLevel: 'error',
        mode: 'production',
      })
      expect(customLauncher).toBeInstanceOf(ViteLauncher)
    })
  })

  describe('基础方法', () => {
    it('应该获取默认配置', () => {
      const config = launcher.getConfig()
      expect(config).toBeDefined()
      expect(typeof config).toBe('object')
    })

    it('应该获取项目类型', () => {
      const projectType = launcher.getProjectType()
      expect(projectType).toBeDefined()
      expect(typeof projectType).toBe('string')
    })

    it('应该更新配置', () => {
      const newConfig = {
        server: {
          port: 3000,
        },
      }
      launcher.configure(newConfig)
      const config = launcher.getConfig()
      expect(config.server?.port).toBe(3000)
    })

    it('应该停止服务器（无服务器时）', async () => {
      await expect(launcher.stop()).resolves.toBeUndefined()
    })

    it('应该销毁实例', async () => {
      await expect(launcher.destroy()).resolves.toBeUndefined()
    })

    it('应该多次销毁实例不抛出错误', async () => {
      await launcher.destroy()
      await expect(launcher.destroy()).resolves.toBeUndefined()
    })
  })

  describe('便捷函数', () => {
    it('应该创建自定义启动器', () => {
      const customLauncher = createLauncher({
        logLevel: 'silent',
        mode: 'development',
      })
      expect(customLauncher).toBeInstanceOf(ViteLauncher)
    })
  })

  describe('实例生命周期', () => {
    it('应该正确处理实例销毁后的操作', async () => {
      await launcher.destroy()

      // 尝试执行操作应该抛出错误
      await expect(launcher.dev()).rejects.toThrow('ViteLauncher 实例已销毁')
      await expect(launcher.build()).rejects.toThrow('ViteLauncher 实例已销毁')
      await expect(launcher.create('test', 'vanilla')).rejects.toThrow('ViteLauncher 实例已销毁')
    })
  })
})
