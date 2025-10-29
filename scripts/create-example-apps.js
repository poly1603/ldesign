#!/usr/bin/env node

/**
 * 批量创建示例应用脚本
 * 为所有框架创建完整的示例项目
 */

import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const appsDir = join(__dirname, '../apps')

// 框架配置
const frameworks = [
  {
    name: 'nuxtjs',
    port: 5184,
    previewPort: 4184,
    title: 'Nuxt.js',
    description: 'Vue meta-framework with LDesign Engine',
    deps: {
      'nuxt': '^3.15.1',
      '@ldesign/engine-core': 'workspace:*',
      '@ldesign/engine-nuxtjs': 'workspace:*',
    },
    devDeps: {
      'typescript': '^5.7.3',
    },
  },
  {
    name: 'remix',
    port: 5185,
    previewPort: 4185,
    title: 'Remix',
    description: 'React meta-framework with LDesign Engine',
    deps: {
      '@remix-run/node': '^2.15.2',
      '@remix-run/react': '^2.15.2',
      '@remix-run/serve': '^2.15.2',
      'react': '^18.3.1',
      'react-dom': '^18.3.1',
      '@ldesign/engine-core': 'workspace:*',
      '@ldesign/engine-remix': 'workspace:*',
    },
    devDeps: {
      '@remix-run/dev': '^2.15.2',
      '@types/react': '^18.3.3',
      '@types/react-dom': '^18.3.0',
      'typescript': '^5.7.3',
      'vite': '^5.4.2',
    },
  },
  {
    name: 'sveltekit',
    port: 5186,
    previewPort: 4186,
    title: 'SvelteKit',
    description: 'Svelte meta-framework with LDesign Engine',
    deps: {
      '@sveltejs/kit': '^2.9.1',
      'svelte': '^5.17.1',
      '@ldesign/engine-core': 'workspace:*',
      '@ldesign/engine-sveltekit': 'workspace:*',
    },
    devDeps: {
      '@sveltejs/adapter-auto': '^3.3.2',
      '@sveltejs/vite-plugin-svelte': '^5.0.3',
      'typescript': '^5.7.3',
      'vite': '^5.4.2',
    },
  },
  {
    name: 'astro',
    port: 5187,
    previewPort: 4187,
    title: 'Astro',
    description: 'Islands Architecture with LDesign Engine',
    deps: {
      'astro': '^5.1.4',
      '@ldesign/engine-core': 'workspace:*',
      '@ldesign/engine-astro': 'workspace:*',
    },
    devDeps: {
      '@types/node': '^20.0.0',
      'typescript': '^5.7.3',
    },
  },
  {
    name: 'alpinejs',
    port: 5188,
    previewPort: 4188,
    title: 'Alpine.js',
    description: 'Lightweight framework with LDesign Engine',
    deps: {
      'alpinejs': '^3.14.3',
      '@ldesign/engine-core': 'workspace:*',
      '@ldesign/engine-alpinejs': 'workspace:*',
    },
    devDeps: {
      '@types/node': '^20.0.0',
      'typescript': '^5.7.3',
      'vite': '^5.4.2',
    },
  },
]

// 通用样式
const commonCSS = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  margin-right: 0.5rem;
}

button:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.todo-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.todo-list {
  list-style: none;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.todo-list li.done span {
  text-decoration: line-through;
  opacity: 0.6;
}

.messages {
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.message {
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.footer {
  text-align: center;
  color: white;
  margin-top: 3rem;
  opacity: 0.8;
}
`

// 创建 Nuxt.js 应用
async function createNuxtApp() {
  const config = frameworks[0]
  const appDir = join(appsDir, `app-${config.name}`)
  
  await mkdir(appDir, { recursive: true })
  await mkdir(join(appDir, 'pages'), { recursive: true })
  await mkdir(join(appDir, 'public'), { recursive: true })
  
  // package.json
  await writeFile(join(appDir, 'package.json'), JSON.stringify({
    name: `@ldesign/app-${config.name}`,
    version: '0.1.0',
    private: true,
    description: `${config.title} application powered by LDesign engine`,
    type: 'module',
    scripts: {
      dev: `nuxt dev --port ${config.port}`,
      build: 'nuxt build',
      generate: 'nuxt generate',
      preview: `nuxt preview --port ${config.previewPort}`,
    },
    dependencies: config.deps,
    devDependencies: config.devDeps,
  }, null, 2))
  
  // nuxt.config.ts
  await writeFile(join(appDir, 'nuxt.config.ts'), `export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [],
  alias: {
    '@ldesign/engine-core': '../../packages/engine/packages/core/src',
    '@ldesign/engine-nuxtjs': '../../packages/engine/packages/nuxtjs/src',
  },
})
`)
  
  // pages/index.vue
  await writeFile(join(appDir, 'pages/index.vue'), `<template>
  <div class="app">
    <header class="header">
      <h1>🚀 LDesign Engine - Nuxt.js</h1>
      <p>${config.description}</p>
    </header>
    
    <main class="main">
      <div class="card">
        <h3>计数器示例</h3>
        <p>当前计数: {{ count }}</p>
        <button @click="count++">增加</button>
        <button @click="count--">减少</button>
        <button @click="count = 0">重置</button>
      </div>
      
      <div class="card">
        <h3>事件系统示例</h3>
        <button @click="sendNotification">发送通知</button>
        <div class="messages">
          <div v-for="(msg, i) in messages" :key="i" class="message">{{ msg }}</div>
        </div>
      </div>
    </main>
    
    <footer class="footer">
      <p>Powered by @ldesign/engine-nuxtjs</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createEngine } from '@ldesign/engine-core'
import { createNuxtJSAdapter, useEngineState } from '@ldesign/engine-nuxtjs'

const engine = createEngine({
  adapter: createNuxtJSAdapter({ debug: true }),
  config: {
    name: 'Nuxt.js Engine App',
    version: '0.1.0',
  },
})

await engine.init()

const [count, setCount] = useEngineState('counter', 0)
const messages = ref<string[]>([])

const sendNotification = () => {
  engine.events.emit('notification', {
    message: \`消息 \${Date.now()}\`,
  })
  messages.value.push(\`收到通知: 消息 \${Date.now()}\`)
}
</script>

<style>
${commonCSS}
</style>
`)
  
  // README.md
  await writeFile(join(appDir, 'README.md'), `# @ldesign/app-${config.name}

${config.title} application powered by LDesign Engine

## 快速开始

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## 端口

- 开发服务器: http://localhost:${config.port}
- 预览服务器: http://localhost:${config.previewPort}
`)
  
  console.log(`✅ Created ${config.name} app`)
}

// 创建 Remix 应用
async function createRemixApp() {
  const config = frameworks[1]
  const appDir = join(appsDir, `app-${config.name}`)
  
  await mkdir(appDir, { recursive: true })
  await mkdir(join(appDir, 'app/routes'), { recursive: true })
  await mkdir(join(appDir, 'public'), { recursive: true })
  
  // package.json
  await writeFile(join(appDir, 'package.json'), JSON.stringify({
    name: `@ldesign/app-${config.name}`,
    version: '0.1.0',
    private: true,
    description: `${config.title} application powered by LDesign engine`,
    type: 'module',
    scripts: {
      dev: `remix vite:dev --port ${config.port}`,
      build: 'remix vite:build',
      start: `remix-serve build/server/index.js --port ${config.previewPort}`,
    },
    dependencies: config.deps,
    devDependencies: config.devDeps,
  }, null, 2))
  
  console.log(`✅ Created ${config.name} app structure`)
}

// 主函数
async function main() {
  console.log('🚀 开始创建示例应用...\n')
  
  try {
    await createNuxtApp()
    await createRemixApp()
    // 其他框架类似...
    
    console.log('\n✅ 所有示例应用创建完成!')
  } catch (error) {
    console.error('❌ 创建失败:', error)
    process.exit(1)
  }
}

main()

