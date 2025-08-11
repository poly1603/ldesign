import type { TemplateConfig } from '../../../../types'

export const config: TemplateConfig = {
  id: 'classic',
  name: '经典登录',
  title: '经典登录模板',
  description: '简洁优雅的经典登录界面，适合企业级应用',
  category: 'login',
  deviceType: 'desktop',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['login', 'classic', 'enterprise'],

  // 模板配置
  config: {
    // 支持的设备类型
    supportedDevices: ['desktop', 'tablet', 'mobile'],

    // 默认配置
    defaultProps: {
      title: 'LDesign 登录',
      subtitle: '欢迎回来',
      logo: '/logo.png',
      showRememberMe: true,
      showForgotPassword: true,
      showRegisterLink: true,
      allowThirdPartyLogin: false,
    },

    // 样式配置
    styles: {
      primaryColor: '#007bff',
      backgroundColor: '#f8f9fa',
      cardBackground: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  },

  // 预览信息
  preview: {
    thumbnail: '/templates/login/classic/preview.png',
    description:
      '经典的登录界面设计，包含用户名密码输入、记住我选项和忘记密码链接',
  },

  // 依赖信息
  dependencies: {
    vue: '^3.0.0',
  },
}

export default config
