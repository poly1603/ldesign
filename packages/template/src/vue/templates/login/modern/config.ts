import type { TemplateConfig } from '../../../types'

export const config: TemplateConfig = {
  id: 'modern',
  name: '现代登录',
  title: '现代登录模板',
  description: '时尚现代的登录界面，采用渐变背景和卡片设计',
  category: 'login',
  deviceType: 'desktop',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['login', 'modern', 'gradient', 'card'],
  
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
      allowThirdPartyLogin: true
    },
    
    // 样式配置
    styles: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardBackground: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }
  },
  
  // 预览信息
  preview: {
    thumbnail: '/templates/login/modern/preview.png',
    description: '现代化的登录界面设计，采用渐变背景、圆角卡片和流畅的动画效果'
  },
  
  // 依赖信息
  dependencies: {
    vue: '^3.0.0'
  }
}

export default config
