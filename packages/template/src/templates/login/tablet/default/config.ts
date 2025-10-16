/**
 * 平板端默认登录模板配置
 */

import type { TemplateConfig } from '../../../../types'

const config: TemplateConfig = {
  name: 'default',
  displayName: '平板端登录',
  description: '适配平板端的默认登录页面',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['login', 'tablet', 'default'],
  isDefault: true,
  preview: '/previews/login-tablet-default.png',
  lastModified: Date.now(),
  slots: [
    {
      name: 'logo',
      description: '品牌logo区域',
      props: ['showLogo']
    },
    {
      name: 'header',
      description: '头部信息区域',
      props: ['title', 'subtitle']
    },
    {
      name: 'loginPanel',
      description: '登录面板主体内容',
      props: ['onSubmit', 'loading', 'error']
    },
    {
      name: 'socialLogin',
      description: '社交登录区域',
      props: ['providers']
    },
    {
      name: 'footer',
      description: '底部信息区域',
      props: ['copyrightYear', 'companyName']
    },
    {
      name: 'extra',
      description: '额外自定义区域'
    }
  ]
}

export default config
