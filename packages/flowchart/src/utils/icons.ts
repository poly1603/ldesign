/**
 * Lucide图标工具函数
 * 用于生成SVG图标字符串
 */

export interface IconOptions {
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

/**
 * Lucide图标的SVG路径数据
 */
const LUCIDE_ICON_PATHS: Record<string, string> = {
  'mouse-pointer': '<path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/>',
  'rectangle-select': '<path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="m7 21 4-4-4-4"/><path d="m17 21-4-4 4-4"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M3 19a2 2 0 0 0 2 2"/>',
  'store': '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>',
  'history': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  'zoom-in': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/>',
  'zoom-out': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/>',
  'undo': '<path d="M3 7v6h6"/><path d="m21 17a9 9 0 1 1-9-9c2.31 0 4.42.88 6 2.31L21 13"/>',
  'redo': '<path d="M21 7v6h-6"/><path d="m3 17a9 9 0 0 1 9-9c2.31 0 4.42.88 6 2.31L21 13"/>',
  'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  'broom': '<path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="m7.07 14.94-1.13 1.13a3.5 3.5 0 1 1-4.95-4.95l1.13-1.13"/><path d="m12 15 3.38 3.38a2.85 2.85 0 1 1-4.03 4.03L8 18.12"/>',
  'save': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>',
  'play': '<polygon points="5,3 19,12 5,21"/>',
  'check-square': '<polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><point cx="12" cy="17"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'square': '<rect width="18" height="18" x="3" y="3" rx="2"/>',
  'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'cog': '<path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m1.05 12 1.954-.5"/><path d="m21.046 12-1.954.5"/><path d="M7 12 5.5 10.5"/><path d="M18.5 13.5 17 12"/><path d="M7 12l1.5 1.5"/><path d="M16.5 10.5 18 12"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'hand': '<path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'circle': '<circle cx="12" cy="12" r="10"/>',
  'triangle': '<path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>',
  'mail': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  'zap': '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>',
  'palette': '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  'copy': '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'clipboard': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>'
}

/**
 * 生成Lucide图标的SVG字符串
 * 使用预定义的SVG路径数据
 */
export function createLucideIcon(
  iconName: string,
  options: IconOptions = {}
): string {
  const {
    size = 16,
    color = 'currentColor',
    strokeWidth = 2,
    className = ''
  } = options

  const pathData = LUCIDE_ICON_PATHS[iconName]
  if (!pathData) {
    console.warn(`Icon "${iconName}" not found`)
    return `<span style="color: red;">[${iconName}]</span>`
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${className}">${pathData}</svg>`
}

/**
 * 工具栏图标映射
 */
export const TOOLBAR_ICONS = {
  'select': () => createLucideIcon('mouse-pointer', { size: 16 }),
  'multi-select': () => createLucideIcon('rectangle-select', { size: 16 }),
  'material-repository': () => createLucideIcon('store', { size: 16 }),
  'history': () => createLucideIcon('history', { size: 16 }),
  'zoom-fit': () => createLucideIcon('search', { size: 16 }),
  'zoom-in': () => createLucideIcon('zoom-in', { size: 16 }),
  'zoom-out': () => createLucideIcon('zoom-out', { size: 16 }),
  'undo': () => createLucideIcon('undo', { size: 16 }),
  'redo': () => createLucideIcon('redo', { size: 16 }),
  'delete': () => createLucideIcon('trash-2', { size: 16 }),
  'clear': () => createLucideIcon('broom', { size: 16 }),
  'export': () => createLucideIcon('save', { size: 16 }),
  'import': () => createLucideIcon('upload', { size: 16 }),
  'add': () => createLucideIcon('plus', { size: 16 }),
  'close': () => createLucideIcon('x', { size: 16 }),
  'validate': () => createLucideIcon('check-square', { size: 16 }),
  'download': () => createLucideIcon('download', { size: 16 }),
  'copy': () => createLucideIcon('copy', { size: 16 }),
  'paste': () => createLucideIcon('clipboard', { size: 16 })
}

/**
 * 节点图标映射
 */
export const NODE_ICONS = {
  'start': () => createLucideIcon('play', { size: 16, color: '#52c41a' }),
  'approval': () => createLucideIcon('check-square', { size: 16, color: '#1890ff' }),
  'condition': () => createLucideIcon('help-circle', { size: 16, color: '#faad14' }),
  'process': () => createLucideIcon('settings', { size: 16, color: '#722ed1' }),
  'end': () => createLucideIcon('square', { size: 16, color: '#f5222d' }),
  'user-task': () => createLucideIcon('user', { size: 16, color: '#13c2c2' }),
  'service-task': () => createLucideIcon('cog', { size: 16, color: '#eb2f96' }),
  'script-task': () => createLucideIcon('file-text', { size: 16, color: '#52c41a' }),
  'manual-task': () => createLucideIcon('hand', { size: 16, color: '#fa8c16' }),
  'parallel-gateway': () => createLucideIcon('plus', { size: 16, color: '#1890ff' }),
  'exclusive-gateway': () => createLucideIcon('x', { size: 16, color: '#f5222d' }),
  'inclusive-gateway': () => createLucideIcon('circle', { size: 16, color: '#52c41a' }),
  'event-gateway': () => createLucideIcon('triangle', { size: 16, color: '#722ed1' }),
  'timer-event': () => createLucideIcon('clock', { size: 16, color: '#faad14' }),
  'message-event': () => createLucideIcon('mail', { size: 16, color: '#13c2c2' }),
  'signal-event': () => createLucideIcon('zap', { size: 16, color: '#eb2f96' })
}

/**
 * 获取工具栏图标
 */
export function getToolbarIcon(name: string): string {
  const iconFn = TOOLBAR_ICONS[name as keyof typeof TOOLBAR_ICONS]
  return iconFn ? iconFn() : ''
}

/**
 * 获取节点图标
 */
export function getNodeIcon(type: string): string {
  const iconFn = NODE_ICONS[type as keyof typeof NODE_ICONS]
  return iconFn ? iconFn() : ''
}

/**
 * 自定义物料图标
 */
export function getCustomMaterialIcon(): string {
  return createLucideIcon('palette', { size: 16, color: '#722ed1' })
}

/**
 * 为LogicFlow节点创建SVG图标元素
 * @param iconName 图标名称
 * @param options 图标选项
 * @returns SVG路径数据和属性
 */
export function createNodeIcon(iconName: string, options: {
  size?: number
  color?: string
  strokeWidth?: number
} = {}) {
  const { size = 16, color = '#666', strokeWidth = 2 } = options

  const pathData = LUCIDE_ICON_PATHS[iconName]
  if (!pathData) {
    console.warn(`图标 "${iconName}" 未找到`)
    return null
  }

  // 解析SVG路径数据，提取path元素
  const pathRegex = /<path[^>]*d="([^"]*)"[^>]*>/g
  const paths: string[] = []
  let match

  while ((match = pathRegex.exec(pathData)) !== null) {
    paths.push(match[1])
  }

  // 如果没有找到path元素，尝试其他SVG元素
  if (paths.length === 0) {
    // 处理其他SVG元素如polygon, circle等
    const polygonRegex = /<polygon[^>]*points="([^"]*)"[^>]*>/g
    const circleRegex = /<circle[^>]*cx="([^"]*)"[^>]*cy="([^"]*)"[^>]*r="([^"]*)"[^>]*>/g
    const lineRegex = /<line[^>]*x1="([^"]*)"[^>]*y1="([^"]*)"[^>]*x2="([^"]*)"[^>]*y2="([^"]*)"[^>]*>/g
    const polylineRegex = /<polyline[^>]*points="([^"]*)"[^>]*>/g
    const rectRegex = /<rect[^>]*width="([^"]*)"[^>]*height="([^"]*)"[^>]*x="([^"]*)"[^>]*y="([^"]*)"[^>]*>/g

    // 转换polygon为path
    while ((match = polygonRegex.exec(pathData)) !== null) {
      const points = match[1].split(' ').map(p => p.split(','))
      if (points.length > 0) {
        const pathStr = `M${points[0].join(',')} ${points.slice(1).map(p => `L${p.join(',')}`).join(' ')} Z`
        paths.push(pathStr)
      }
    }

    // 转换circle为path
    while ((match = circleRegex.exec(pathData)) !== null) {
      const cx = parseFloat(match[1])
      const cy = parseFloat(match[2])
      const r = parseFloat(match[3])
      const pathStr = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`
      paths.push(pathStr)
    }

    // 转换line为path
    while ((match = lineRegex.exec(pathData)) !== null) {
      const pathStr = `M${match[1]},${match[2]} L${match[3]},${match[4]}`
      paths.push(pathStr)
    }

    // 转换polyline为path
    while ((match = polylineRegex.exec(pathData)) !== null) {
      const points = match[1].split(' ').map(p => p.split(','))
      if (points.length > 0) {
        const pathStr = `M${points[0].join(',')} ${points.slice(1).map(p => `L${p.join(',')}`).join(' ')}`
        paths.push(pathStr)
      }
    }

    // 转换rect为path
    while ((match = rectRegex.exec(pathData)) !== null) {
      const w = parseFloat(match[1])
      const h = parseFloat(match[2])
      const x = parseFloat(match[3])
      const y = parseFloat(match[4])
      const pathStr = `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`
      paths.push(pathStr)
    }
  }

  return {
    viewBox: '0 0 24 24',
    paths,
    size,
    color,
    strokeWidth
  }
}
