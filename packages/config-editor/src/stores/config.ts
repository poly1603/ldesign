/**
 * 配置状态管理
 * 
 * 使用 Pinia 管理配置文件的状态
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LauncherConfig, AppConfig, PackageJsonConfig } from '../types/config'
import type { ConfigFileType } from '../types/common'
import { DEFAULT_LAUNCHER_CONFIG, DEFAULT_APP_CONFIG, DEFAULT_PACKAGE_CONFIG } from '../constants/defaults'
import { configApi } from '../services/api'

/**
 * 配置状态管理 Store
 */
export const useConfigStore = defineStore('config', () => {
  // 配置数据
  const launcherConfig = ref<LauncherConfig | null>({ ...DEFAULT_LAUNCHER_CONFIG })
  const appConfig = ref<AppConfig | null>({ ...DEFAULT_APP_CONFIG })
  const packageConfig = ref<PackageJsonConfig | null>({ ...DEFAULT_PACKAGE_CONFIG })

  // 原始配置数据（用于比较是否有修改）
  const originalLauncherConfig = ref<LauncherConfig | null>({ ...DEFAULT_LAUNCHER_CONFIG })
  const originalAppConfig = ref<AppConfig | null>({ ...DEFAULT_APP_CONFIG })
  const originalPackageConfig = ref<PackageJsonConfig | null>({ ...DEFAULT_PACKAGE_CONFIG })

  // 错误状态
  const launcherError = ref<string | null>(null)
  const appError = ref<string | null>(null)
  const packageError = ref<string | null>(null)

  // 加载状态
  const loading = ref(false)
  const workingDirectory = ref('/workspace')
  const serverConnected = ref(false)

  // 计算属性：是否有修改
  const isLauncherModified = computed(() => {
    if (!launcherConfig.value || !originalLauncherConfig.value) return false
    return JSON.stringify(launcherConfig.value) !== JSON.stringify(originalLauncherConfig.value)
  })

  const isAppModified = computed(() => {
    if (!appConfig.value || !originalAppConfig.value) return false
    return JSON.stringify(appConfig.value) !== JSON.stringify(originalAppConfig.value)
  })

  const isPackageModified = computed(() => {
    if (!packageConfig.value || !originalPackageConfig.value) return false
    return JSON.stringify(packageConfig.value) !== JSON.stringify(originalPackageConfig.value)
  })

  const hasAnyModifications = computed(() => {
    return isLauncherModified.value || isAppModified.value || isPackageModified.value
  })

  /**
   * 初始化配置编辑器
   */
  const initialize = async (cwd?: string) => {
    loading.value = true

    try {
      // 检查服务器连接
      serverConnected.value = await configApi.healthCheck()

      if (serverConnected.value) {
        // 获取工作目录信息
        const workspaceResult = await configApi.getWorkspace()
        if (workspaceResult.success && workspaceResult.data) {
          workingDirectory.value = workspaceResult.data.cwd
        }

        // 从服务器加载配置
        await loadAllConfigs()
      } else {
        console.warn('无法连接到后端服务器，使用默认配置')

        if (cwd) {
          workingDirectory.value = cwd
        }

        // 使用默认配置
        launcherConfig.value = { ...DEFAULT_LAUNCHER_CONFIG }
        appConfig.value = { ...DEFAULT_APP_CONFIG }
        packageConfig.value = { ...DEFAULT_PACKAGE_CONFIG }

        originalLauncherConfig.value = { ...DEFAULT_LAUNCHER_CONFIG }
        originalAppConfig.value = { ...DEFAULT_APP_CONFIG }
        originalPackageConfig.value = { ...DEFAULT_PACKAGE_CONFIG }
      }

    } catch (error) {
      console.error('初始化配置编辑器失败:', error)

      // 回退到默认配置
      launcherConfig.value = { ...DEFAULT_LAUNCHER_CONFIG }
      appConfig.value = { ...DEFAULT_APP_CONFIG }
      packageConfig.value = { ...DEFAULT_PACKAGE_CONFIG }

      originalLauncherConfig.value = { ...DEFAULT_LAUNCHER_CONFIG }
      originalAppConfig.value = { ...DEFAULT_APP_CONFIG }
      originalPackageConfig.value = { ...DEFAULT_PACKAGE_CONFIG }
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载所有配置
   */
  const loadAllConfigs = async () => {
    if (!serverConnected.value) {
      // 使用默认配置
      launcherConfig.value = { ...DEFAULT_LAUNCHER_CONFIG }
      appConfig.value = { ...DEFAULT_APP_CONFIG }
      packageConfig.value = { ...DEFAULT_PACKAGE_CONFIG }

      originalLauncherConfig.value = { ...DEFAULT_LAUNCHER_CONFIG }
      originalAppConfig.value = { ...DEFAULT_APP_CONFIG }
      originalPackageConfig.value = { ...DEFAULT_PACKAGE_CONFIG }
      return
    }

    try {
      const result = await configApi.getAllConfigs()

      if (result.success && result.data) {
        // 更新配置
        launcherConfig.value = result.data.launcher || { ...DEFAULT_LAUNCHER_CONFIG }
        appConfig.value = result.data.app || { ...DEFAULT_APP_CONFIG }
        packageConfig.value = result.data.package || { ...DEFAULT_PACKAGE_CONFIG }

        // 更新原始配置
        originalLauncherConfig.value = result.data.launcher || { ...DEFAULT_LAUNCHER_CONFIG }
        originalAppConfig.value = result.data.app || { ...DEFAULT_APP_CONFIG }
        originalPackageConfig.value = result.data.package || { ...DEFAULT_PACKAGE_CONFIG }
      } else {
        throw new Error(result.error || '加载配置失败')
      }

      // 清除错误
      launcherError.value = null
      appError.value = null
      packageError.value = null

    } catch (error) {
      console.error('加载配置失败:', error)

      // 回退到默认配置
      launcherConfig.value = { ...DEFAULT_LAUNCHER_CONFIG }
      appConfig.value = { ...DEFAULT_APP_CONFIG }
      packageConfig.value = { ...DEFAULT_PACKAGE_CONFIG }

      originalLauncherConfig.value = { ...DEFAULT_LAUNCHER_CONFIG }
      originalAppConfig.value = { ...DEFAULT_APP_CONFIG }
      originalPackageConfig.value = { ...DEFAULT_PACKAGE_CONFIG }
    }
  }

  /**
   * 更新配置
   */
  const updateConfig = <T>(type: ConfigFileType, updates: Partial<T>) => {
    try {
      switch (type) {
        case 'launcher':
          if (launcherConfig.value) {
            launcherConfig.value = { ...launcherConfig.value, ...updates } as LauncherConfig
            launcherError.value = null
          }
          break
        case 'app':
          if (appConfig.value) {
            appConfig.value = { ...appConfig.value, ...updates } as AppConfig
            appError.value = null
          }
          break
        case 'package':
          if (packageConfig.value) {
            packageConfig.value = { ...packageConfig.value, ...updates } as PackageJsonConfig
            packageError.value = null
          }
          break
      }

    } catch (error) {
      console.error('更新配置失败:', error)
      setError(type, error instanceof Error ? error.message : '更新失败')
    }
  }

  /**
   * 保存配置
   */
  const saveConfig = async (type: ConfigFileType) => {
    try {
      const config = getConfigByType(type)
      if (!config) {
        throw new Error('配置不存在')
      }

      if (serverConnected.value) {
        // 调用后端 API 保存配置
        const result = await configApi.saveConfig(type)

        if (!result.success) {
          throw new Error(result.error || '保存失败')
        }
      } else {
        // 模拟保存过程
        await new Promise(resolve => setTimeout(resolve, 500))
        console.warn('服务器未连接，配置未实际保存到文件')
      }

      // 更新原始配置
      updateOriginalConfig(type, config)
      clearError(type)

      console.log(`配置 ${type} 保存成功`)

    } catch (error) {
      console.error('保存配置失败:', error)
      setError(type, error instanceof Error ? error.message : '保存失败')
      throw error
    }
  }

  /**
   * 保存所有配置
   */
  const saveAllConfigs = async () => {
    const promises: Promise<void>[] = []

    if (isLauncherModified.value) {
      promises.push(saveConfig('launcher'))
    }

    if (isAppModified.value) {
      promises.push(saveConfig('app'))
    }

    if (isPackageModified.value) {
      promises.push(saveConfig('package'))
    }

    await Promise.all(promises)
  }

  /**
   * 重置配置
   */
  const resetConfig = (type: ConfigFileType) => {
    switch (type) {
      case 'launcher':
        if (originalLauncherConfig.value) {
          launcherConfig.value = { ...originalLauncherConfig.value }
        }
        launcherError.value = null
        break
      case 'app':
        if (originalAppConfig.value) {
          appConfig.value = { ...originalAppConfig.value }
        }
        appError.value = null
        break
      case 'package':
        if (originalPackageConfig.value) {
          packageConfig.value = { ...originalPackageConfig.value }
        }
        packageError.value = null
        break
    }
  }

  /**
   * 获取指定类型的配置
   */
  const getConfigByType = (type: ConfigFileType) => {
    switch (type) {
      case 'launcher':
        return launcherConfig.value
      case 'app':
        return appConfig.value
      case 'package':
        return packageConfig.value
      default:
        return null
    }
  }

  /**
   * 更新原始配置
   */
  const updateOriginalConfig = (type: ConfigFileType, config: any) => {
    switch (type) {
      case 'launcher':
        originalLauncherConfig.value = { ...config }
        break
      case 'app':
        originalAppConfig.value = { ...config }
        break
      case 'package':
        originalPackageConfig.value = { ...config }
        break
    }
  }

  /**
   * 设置错误
   */
  const setError = (type: ConfigFileType, error: string) => {
    switch (type) {
      case 'launcher':
        launcherError.value = error
        break
      case 'app':
        appError.value = error
        break
      case 'package':
        packageError.value = error
        break
    }
  }

  /**
   * 清除错误
   */
  const clearError = (type: ConfigFileType) => {
    switch (type) {
      case 'launcher':
        launcherError.value = null
        break
      case 'app':
        appError.value = null
        break
      case 'package':
        packageError.value = null
        break
    }
  }



  return {
    // 状态
    launcherConfig,
    appConfig,
    packageConfig,
    launcherError,
    appError,
    packageError,
    loading,
    workingDirectory,
    serverConnected,

    // 计算属性
    isLauncherModified,
    isAppModified,
    isPackageModified,
    hasAnyModifications,

    // 方法
    initialize,
    loadAllConfigs,
    updateConfig,
    saveConfig,
    saveAllConfigs,
    resetConfig,
    getConfigByType,
    setError,
    clearError
  }
})
