export interface PublishConfig {
  registries: {
    [key: string]: {
      url: string
      token?: string
      scope?: string
      description: string
    }
  }
  packages: {
    [key: string]: {
      name: string
      path: string
      private?: boolean
      registries: string[]
    }
  }
  prePublishChecks: {
    build: boolean
    test: boolean
    lint: boolean
    typeCheck: boolean
    sizeCheck: boolean
  }
  postPublishActions: {
    gitTag: boolean
    gitPush: boolean
    notification: boolean
  }
}

export const publishConfig: PublishConfig = {
  registries: {
    npm: {
      url: 'https://registry.npmjs.org/',
      description: 'NPM 官方仓库',
    },
    private: {
      url: 'http://npm.longrise.cn:6286/',
      description: '私有 NPM 仓库',
    },
    local: {
      url: 'http://localhost:4873/',
      description: '本地测试仓库 (Verdaccio)',
    },
  },
  packages: {
    '@ldesign/engine': {
      name: '@ldesign/engine',
      path: 'packages/engine',
      registries: ['npm', 'private'],
    },
    '@ldesign/color': {
      name: '@ldesign/color',
      path: 'packages/color',
      registries: ['npm', 'private'],
    },
    '@ldesign/crypto': {
      name: '@ldesign/crypto',
      path: 'packages/crypto',
      registries: ['npm', 'private'],
    },
    '@ldesign/device': {
      name: '@ldesign/device',
      path: 'packages/device',
      registries: ['npm', 'private'],
    },
    '@ldesign/http': {
      name: '@ldesign/http',
      path: 'packages/http',
      registries: ['npm', 'private'],
    },
    '@ldesign/i18n': {
      name: '@ldesign/i18n',
      path: 'packages/i18n',
      registries: ['npm', 'private'],
    },
    '@ldesign/router': {
      name: '@ldesign/router',
      path: 'packages/router',
      registries: ['npm', 'private'],
    },
    '@ldesign/store': {
      name: '@ldesign/store',
      path: 'packages/store',
      registries: ['npm', 'private'],
    },
    '@ldesign/template': {
      name: '@ldesign/template',
      path: 'packages/template',
      registries: ['npm', 'private'],
    },
  },
  prePublishChecks: {
    build: true,
    test: true,
    lint: true,
    typeCheck: true,
    sizeCheck: true,
  },
  postPublishActions: {
    gitTag: true,
    gitPush: true,
    notification: false,
  },
}
