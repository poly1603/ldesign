import type { Engine } from '@ldesign/engine'
import type { App } from 'vue'
import { TemplatePlugin } from '@ldesign/template'

/**
 * 设置模板系统
 */
export async function setupTemplate(engine: Engine, app: App) {
  try {
    // 配置模板选项
    const templateOptions = {
      templateRoot: 'src/templates',
      enableCache: true,
      enablePreload: true,
      autoDetectDevice: true,
      defaultDevice: 'desktop'
    }

    // 安装模板插件到Vue应用
    app.use(TemplatePlugin, templateOptions)

    // 注册到引擎状态
    engine.state.set('template', templateOptions)

    engine.logger.info('Template setup completed')
  } catch (error) {
    engine.logger.error('Failed to setup template:', error)
    throw error
  }
}

// 导出模板相关的组件和工具
export * from './login'
