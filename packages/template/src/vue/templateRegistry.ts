import type { DeviceType } from './composables/useTemplateSystem'
import { defineAsyncComponent } from 'vue'
import { registerTemplate, templateConfigs } from './composables/useTemplateSystem'

// 使用 import.meta.glob 自动导入所有模板
const templateModules = import.meta.glob('../templates/**/index.{ts,tsx,vue}', { eager: false })

// 模板配置映射
interface TemplateConfig {
  id: string
  name: string
  description: string
  category: string
  deviceType: DeviceType
}

// 根据路径解析模板信息
function parseTemplatePath(path: string): TemplateConfig | null {
  // 路径格式: ../templates/{category}/{deviceType}/{templateId}/index.{ext}
  const match = path.match(/\.\.\/templates\/([^/]+)\/([^/]+)\/([^/]+)\/index\.(ts|tsx|vue)$/)
  if (!match)
    return null

  const [, category, deviceType, templateId] = match

  // 验证设备类型
  if (!['desktop', 'mobile', 'tablet'].includes(deviceType))
    return null

  // 生成模板名称和描述
  const templateNames: Record<string, Record<string, { name: string, description: string }>> = {
    login: {
      classic: { name: '经典模板', description: '经典的双栏布局登录模板' },
      modern: { name: '现代模板', description: '现代化的登录模板，带有动画效果' },
      default: { name: '默认模板', description: '简洁的默认登录模板' },
      simple: { name: '简洁模板', description: '移动端简洁登录模板' },
      card: { name: '卡片模板', description: '移动端卡片式登录模板' },
      adaptive: { name: '自适应模板', description: '平板端自适应登录模板' },
      split: { name: '分屏模板', description: '平板端分屏登录模板' },
    },
  }

  const templateInfo = templateNames[category]?.[templateId]
  if (!templateInfo)
    return null

  return {
    id: templateId,
    name: templateInfo.name,
    description: templateInfo.description,
    category,
    deviceType: deviceType as DeviceType,
  }
}

/**
 * 获取模板配置
 */
function getTemplateConfig(category: string, deviceType: DeviceType, templateId: string) {
  if (category === 'login') {
    if (deviceType === 'desktop') {
      return templateConfigs.login[templateId as keyof typeof templateConfigs.login] || templateConfigs.login.default
    }
    else if (deviceType === 'tablet') {
      return templateConfigs.login.tablet
    }
    else {
      return templateConfigs.login.mobile
    }
  }
  return {}
}

/**
 * 自动注册所有模板
 */
export async function registerAllTemplates() {
  // 开始注册模板

  // 遍历所有模板模块
  for (const [path, moduleLoader] of Object.entries(templateModules)) {
    const templateConfig = parseTemplatePath(path)
    if (!templateConfig) {
      continue
    }

    // 创建异步组件
    const component = defineAsyncComponent(moduleLoader as () => Promise<any>)

    // 注册模板
    registerTemplate({
      id: templateConfig.id,
      name: templateConfig.name,
      description: templateConfig.description,
      category: templateConfig.category,
      deviceType: templateConfig.deviceType,
      component,
      config: getTemplateConfig(templateConfig.category, templateConfig.deviceType, templateConfig.id),
    })
  }
}

// 同步注册所有模板（在模块加载时立即执行）
// 遍历所有模板模块
for (const [path, moduleLoader] of Object.entries(templateModules)) {
  const templateConfig = parseTemplatePath(path)
  if (!templateConfig) {
    continue
  }

  // 创建异步组件
  const component = defineAsyncComponent(moduleLoader as () => Promise<any>)

  // 注册模板
  registerTemplate({
    id: templateConfig.id,
    name: templateConfig.name,
    description: templateConfig.description,
    category: templateConfig.category,
    deviceType: templateConfig.deviceType,
    component,
    config: getTemplateConfig(templateConfig.category, templateConfig.deviceType, templateConfig.id),
  })
}
