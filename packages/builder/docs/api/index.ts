/**
 * API 文档入口文件
 *
 * 这个文件导出所有 API 文档的元数据和内容
 */

// 导出文档元数据（暂时不加载实际内容）
export const apiDocs = {
  'advanced-features': 'advanced-features.md',
  'analyze': 'analyze.md',
  'build-options': 'build-options.md',
  'build-result': 'build-result.md',
'build': 'build.md',
  'clean': 'clean.md',
  'examples': 'examples.md',
  'init': 'init.md',
  'define-config': 'define-config.md',
  'project-scan-result': 'project-scan-result.md',
  'watch': 'watch.md',
}

// 导出文档列表
export const docsList = [
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: '高级功能 API 文档'
  },
  {
    id: 'analyze',
    title: 'Analyze API',
    description: '分析 API 文档'
  },
  {
    id: 'build-options',
    title: 'Build Options',
    description: '构建选项 API 文档'
  },
  {
    id: 'build-result',
    title: 'Build Result',
    description: '构建结果 API 文档'
  },
  {
    id: 'build',
    title: 'Build CLI',
    description: '构建命令文档'
  },
  {
    id: 'clean',
    title: 'Clean CLI',
    description: '清理命令文档'
  },
  {
    id: 'examples',
    title: 'Examples CLI',
    description: '批量示例构建命令文档'
  },
  {
    id: 'init',
    title: 'Init CLI',
    description: '初始化命令文档'
  },
  {
    id: 'define-config',
    title: 'Define Config',
    description: '配置定义 API 文档'
  },
  {
    id: 'project-scan-result',
    title: 'Project Scan Result',
    description: '项目扫描结果 API 文档'
  },
  {
    id: 'watch',
    title: 'Watch CLI',
    description: '监听命令文档'
  }
]

// 获取文档路径的辅助函数
export function getDocPath(docId: string): string {
  const docPath = apiDocs[docId as keyof typeof apiDocs]
  if (!docPath) {
    throw new Error(`Document not found: ${docId}`)
  }
  return docPath
}

// 获取所有文档路径
export function getAllDocPaths(): Record<string, string> {
  return { ...apiDocs }
}
