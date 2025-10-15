import { defineConfig } from 'vitepress'

export default defineConfig({
 title: '@ldesign/crypto',
 description: '功能强大的现代加密库，支持多种加密算法、哈希函数和Vue 3集成',
 lang: 'zh-CN',

 themeConfig: {
  logo: '/logo.svg',

  nav: [
   { text: '指南', link: '/guide/installation' },
   { text: 'API', link: '/api/' },
   { text: '示例', link: '/examples/' },
   {
    text: '相关链接',
    items: [
     { text: 'GitHub', link: 'https://github.com/ldesign/crypto' },
     { text: '更新日志', link: '/changelog' }
    ]
   }
  ],

  sidebar: {
   '/guide/': [
    {
     text: '开始',
     items: [
      { text: '安装', link: '/guide/installation' },
      { text: '快速开始', link: '/guide/quick-start' }
     ]
    },
    {
     text: '核心功能',
     items: [
      { text: '加密', link: '/guide/encryption' },
      { text: '哈希', link: '/guide/hashing' },
      { text: '编码', link: '/guide/encoding' },
      { text: '数字签名', link: '/guide/digital-signature' }
     ]
    },
    {
     text: 'Vue 集成',
     items: [
      { text: 'Vue 插件', link: '/guide/vue-plugin' },
      { text: '组合式函数', link: '/guide/vue-composables' },
      { text: '最佳实践', link: '/guide/vue-best-practices' }
     ]
    },
    {
     text: '高级功能',
     items: [
      { text: '配置', link: '/guide/configuration' },
      { text: '性能优化', link: '/guide/performance' },
      { text: '安全性', link: '/guide/security' },
      { text: '部署', link: '/guide/deployment' }
     ]
    },
    {
     text: '其他',
     items: [
      { text: '常见问题', link: '/guide/faq' },
      { text: '故障排查', link: '/guide/troubleshooting' }
     ]
    }
   ],
   '/api/': [
    {
     text: 'API 参考',
     items: [
      { text: '概览', link: '/api/' },
      { text: '加密', link: '/api/encryption' },
      { text: '解密', link: '/api/decryption' },
      { text: '哈希', link: '/api/hashing' },
      { text: '密钥生成', link: '/api/key-generation' },
      { text: '管理器', link: '/api/manager' },
      { text: '工具函数', link: '/api/utilities' },
      { text: '类型定义', link: '/api/types' }
     ]
    }
   ],
   '/examples/': [
    {
     text: '示例',
     items: [
      { text: '概览', link: '/examples/' },
      { text: 'AES 加密', link: '/examples/aes' },
      { text: 'RSA 加密', link: '/examples/rsa' },
      { text: 'DES 加密', link: '/examples/des' },
      { text: 'TripleDES 加密', link: '/examples/tripledes' },
      { text: 'Blowfish 加密', link: '/examples/blowfish' },
      { text: '哈希', link: '/examples/hash' },
      { text: '编码', link: '/examples/encoding' },
      { text: '数字签名', link: '/examples/signature' }
     ]
    }
   ]
  },

  socialLinks: [
   { icon: 'github', link: 'https://github.com/ldesign/crypto' }
  ],

  footer: {
   message: '基于 MIT 许可证发布',
   copyright: 'Copyright © 2024-present LDesign'
  },

  search: {
   provider: 'local'
  },

  outline: {
   level: [2, 3],
   label: '目录'
  }
 },

 markdown: {
  lineNumbers: true,
  theme: {
   light: 'github-light',
   dark: 'github-dark'
  }
 }
})
