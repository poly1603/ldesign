/**
 * 项目类型检测工具
 */

export type ProjectType = 'project' | 'library' | 'both'

/**
 * 根据 package.json 判断项目类型
 * 优先使用依赖判断，其次使用 package.json 字段判断
 */
export function detectProjectType(packageJson: any): ProjectType {
  if (!packageJson) return 'project'

  // 获取所有依赖
  const dependencies = packageJson.dependencies || {}
  const devDependencies = packageJson.devDependencies || {}
  const allDeps = { ...dependencies, ...devDependencies }

  // 优先判断：检查是否有 @ldesign/builder 或 @ldesign/launcher
  const hasBuilder = '@ldesign/builder' in allDeps
  const hasLauncher = '@ldesign/launcher' in allDeps

  // 如果有明确的 ldesign 工具依赖，优先使用这个判断
  if (hasBuilder || hasLauncher) {
    if (hasBuilder && hasLauncher) {
      return 'both'
    } else if (hasBuilder) {
      return 'library'
    } else {
      return 'project'
    }
  }

  // 次要判断：基于 package.json 字段
  const hasMain = !!packageJson.main
  const hasModule = !!packageJson.module
  const hasExports = !!packageJson.exports
  const hasTypes = !!packageJson.types || !!packageJson.typings

  // 如果有 main/module/exports/types 字段，说明是库
  const isLibrary = hasMain || hasModule || hasExports || hasTypes

  // 如果有 scripts.dev 或 scripts.start，说明是项目
  const hasDevScript = !!packageJson.scripts?.dev || !!packageJson.scripts?.start
  const isProject = hasDevScript

  if (isLibrary && isProject) {
    return 'both'
  } else if (isLibrary) {
    return 'library'
  } else {
    return 'project'
  }
}
