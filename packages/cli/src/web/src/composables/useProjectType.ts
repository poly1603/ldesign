/**
 * 项目类型检测组合式函数
 * 根据 package.json 中的依赖判断项目类型
 */

import { computed, type Ref } from 'vue'

/**
 * 项目类型
 */
export interface ProjectType {
  isProject: boolean  // 是否是项目（有 @ldesign/launcher）
  isLibrary: boolean  // 是否是库（有 @ldesign/builder）
  isBoth: boolean     // 是否两者都是
}

/**
 * 项目操作
 */
export interface ProjectAction {
  id: string
  name: string
  icon: string
  description: string
  available: boolean
  path: string
}

/**
 * 检测项目类型
 */
export function detectProjectType(packageJson: any): ProjectType {
  if (!packageJson) {
    return {
      isProject: false,
      isLibrary: false,
      isBoth: false
    }
  }

  const dependencies = packageJson.dependencies || {}
  const devDependencies = packageJson.devDependencies || {}
  const allDeps = { ...dependencies, ...devDependencies }

  const hasLauncher = '@ldesign/launcher' in allDeps
  const hasBuilder = '@ldesign/builder' in allDeps

  return {
    isProject: hasLauncher,
    isLibrary: hasBuilder,
    isBoth: hasLauncher && hasBuilder
  }
}

/**
 * 获取可用的项目操作
 */
export function getAvailableActions(projectType: ProjectType): ProjectAction[] {
  const actions: ProjectAction[] = [
    {
      id: 'dev',
      name: '开发',
      icon: 'Code',
      description: '启动开发服务器',
      available: projectType.isProject,
      path: '/dev'
    },
    {
      id: 'build',
      name: '打包',
      icon: 'Package',
      description: '构建生产版本',
      available: true, // 项目和库都可以打包
      path: '/build'
    },
    {
      id: 'preview',
      name: '预览',
      icon: 'Eye',
      description: '预览构建结果',
      available: projectType.isProject,
      path: '/preview'
    },
    {
      id: 'publish',
      name: '发布',
      icon: 'Upload',
      description: '发布到 npm',
      available: projectType.isLibrary,
      path: '/publish'
    },
    {
      id: 'deploy',
      name: '部署',
      icon: 'Rocket',
      description: '部署到服务器',
      available: projectType.isProject,
      path: '/deploy'
    },
    {
      id: 'test',
      name: '测试',
      icon: 'TestTube',
      description: '运行测试用例',
      available: true,
      path: '/test'
    }
  ]

  return actions.filter(action => action.available)
}

/**
 * 获取项目类型标签（独立工具函数）
 */
export function getProjectTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'app': '项目',
    'library': '库',
    'both': '项目 & 库'
  }
  return typeMap[type] || '未知'
}

/**
 * 项目类型 Hook
 */
export function useProjectType(packageJson?: Ref<any>) {
  if (!packageJson) {
    // 如果没有传入 packageJson，只返回工具函数
    return {
      getProjectTypeLabel
    }
  }

  // 计算项目类型
  const projectType = computed(() => detectProjectType(packageJson.value))

  // 计算可用操作
  const availableActions = computed(() => getAvailableActions(projectType.value))

  // 项目类型描述
  const projectTypeLabel = computed(() => {
    if (projectType.value.isBoth) {
      return '项目 & 库'
    } else if (projectType.value.isProject) {
      return '项目'
    } else if (projectType.value.isLibrary) {
      return '库'
    }
    return '未知'
  })

  return {
    projectType,
    availableActions,
    projectTypeLabel,
    getProjectTypeLabel
  }
}

