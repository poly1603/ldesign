/**
 * ProjectAnalyzer - 项目类型分析器
 * 
 * 自动分析项目的技术栈与特征：Vue2/Vue3、React、TypeScript、Less 等
 * 读取 package.json、依赖与文件特征进行判断
 */

import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import fg from 'fast-glob'
import type { ProjectInfo } from '../types'

export class ProjectAnalyzer {
  // 项目根目录
  private readonly root: string

  /**
   * 构造函数
   * @param root - 项目根目录
   */
  constructor(root: string) {
    this.root = root
  }

  /**
   * 分析项目
   * @returns 项目信息
   */
  async analyze(): Promise<ProjectInfo> {
    const pkgPath = join(this.root, 'package.json')
    const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf-8')) : {}

    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    }

    // 识别框架
    const isVue3 = !!(deps?.vue && this.isVersionGte(deps.vue, 3))
    const isVue2 = !!(deps?.vue && !isVue3)
    const isReact = !!(deps?.react || deps?.['@vitejs/plugin-react'])

    // 识别 TS
    const hasTypeScript = !!deps?.typescript || await this.hasAny(['src/**/*.ts', 'src/**/*.tsx'])

    // 样式与资源
    const hasLess = await this.hasAny(['src/**/*.less'])
    const hasSass = await this.hasAny(['src/**/*.{scss,sass}'])

    // 入口文件
    const hasVueSFC = await this.hasAny(['src/**/*.vue'])
    const hasJsx = await this.hasAny(['src/**/*.{jsx,tsx}'])

    // 项目类型
    let type: ProjectInfo['type'] = 'library'
    if (isVue3 || isVue2) type = 'vue'
    if (isReact) type = 'react'

    return {
      type,
      isVue2,
      isVue3,
      isReact,
      hasTypeScript,
      hasLess,
      hasSass,
      hasVueSFC,
      hasJsx,
      deps: Object.keys(deps || {})
    }
  }

  /**
   * 判断任一匹配是否存在
   */
  private async hasAny(patterns: string[]): Promise<boolean> {
    const files = await fg(patterns, { cwd: this.root, dot: true })
    return files.length > 0
  }

  /**
   * 简单比较主版本 >= n
   */
  private isVersionGte(range: string, major: number): boolean {
    // 仅简单比较首个数字，适用于 ^3.x、~3.x、3.x 等
    const m = range.match(/\d+/)
    return m ? parseInt(m[0], 10) >= major : false
  }
}

