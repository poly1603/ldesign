import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Settings, Copy, RefreshCw, ChevronDown, ChevronRight, Plus, Minus, FileText } from 'lucide-react'
import axios from 'axios'

// 配置字段类型定义
interface ConfigField {
  name: string
  key: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'array' | 'object'
  description?: string
  defaultValue?: any
  options?: { label: string; value: any }[]
  placeholder?: string
  required?: boolean
}

// 配置节定义
interface ConfigSection {
  name: string
  key: string
  description?: string
  fields: ConfigField[]
  collapsed?: boolean
}

// 表单数据类型
interface FormData {
  [key: string]: any
}

// 环境配置信息
interface LauncherConfigInfo {
  environment: string
  path: string
  exists: boolean
}

// 配置文件内容
interface ConfigFileContent {
  content: string
  path: string
  exists: boolean
}

const LauncherConfig: React.FC = () => {
  const [saving] = useState(false)
  const [viewMode, setViewMode] = useState<'code' | 'form'>('code')
  const [formData, setFormData] = useState<FormData>({})
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  // 配置节定义 - 支持 @ldesign/launcher 的所有字段
  const configSections: ConfigSection[] = [
    {
      name: 'Launcher 基础配置',
      key: 'launcher',
      description: 'Launcher 核心功能配置，控制启动器的基本行为和特性',
      fields: [
        {
          name: '项目预设',
          key: 'preset',
          type: 'select',
          description: '选择项目类型预设，自动配置相关工具链和优化策略',
          options: [
            { label: 'LDesign - LDesign 组件库预设', value: 'ldesign' },
            { label: 'Vue 3 + TypeScript', value: 'vue3-ts' },
            { label: 'Vue 3', value: 'vue3' },
            { label: 'Vue 2', value: 'vue2' },
            { label: 'React + TypeScript', value: 'react-ts' },
            { label: 'React', value: 'react' },
            { label: 'Lit + TypeScript', value: 'lit-ts' },
            { label: 'Lit', value: 'lit' },
            { label: 'Vanilla + TypeScript', value: 'vanilla-ts' },
            { label: 'Vanilla JavaScript', value: 'vanilla' },
            { label: 'Svelte + TypeScript', value: 'svelte-ts' },
            { label: 'Svelte', value: 'svelte' },
            { label: 'Nuxt.js', value: 'nuxt' },
            { label: 'Next.js', value: 'next' },
            { label: 'SvelteKit', value: 'sveltekit' },
            { label: 'Astro', value: 'astro' },
            { label: 'Solid.js', value: 'solid' },
            { label: 'Qwik', value: 'qwik' },
            { label: 'Angular', value: 'angular' },
            { label: 'Electron', value: 'electron' },
            { label: 'Tauri', value: 'tauri' },
            { label: 'Mobile Vue', value: 'mobile-vue' },
            { label: 'Mobile React', value: 'mobile-react' },
            { label: 'Desktop Vue', value: 'desktop-vue' },
            { label: 'Desktop React', value: 'desktop-react' },
            { label: 'Micro Frontend', value: 'micro-frontend' },
            { label: 'Monorepo', value: 'monorepo' },
            { label: 'Library - 库开发模式', value: 'library' },
            { label: 'Component Library - 组件库', value: 'component-library' },
            { label: 'Chrome Extension', value: 'chrome-extension' },
            { label: 'VSCode Extension', value: 'vscode-extension' },
            { label: 'Node CLI', value: 'node-cli' },
            { label: 'Express API', value: 'express-api' },
            { label: 'Fastify API', value: 'fastify-api' },
            { label: 'Custom - 自定义配置', value: 'custom' }
          ],
          defaultValue: 'ldesign'
        },
        {
          name: '运行模式',
          key: 'mode',
          type: 'select',
          description: '设置应用运行模式，影响环境变量和构建优化策略',
          options: [
            { label: 'development - 开发模式', value: 'development' },
            { label: 'test - 测试模式', value: 'test' },
            { label: 'staging - 预发布模式', value: 'staging' },
            { label: 'production - 生产模式', value: 'production' }
          ],
          defaultValue: 'development'
        },
        {
          name: '日志级别',
          key: 'logLevel',
          type: 'select',
          description: '控制控制台输出的详细程度，影响调试信息的显示',
          options: [
            { label: 'silent - 静默模式，不输出任何信息', value: 'silent' },
            { label: 'error - 仅显示错误信息', value: 'error' },
            { label: 'warn - 显示警告及以上级别', value: 'warn' },
            { label: 'info - 显示信息及以上级别', value: 'info' },
            { label: 'debug - 显示所有调试信息', value: 'debug' }
          ],
          defaultValue: 'info'
        },
        {
          name: '自动重启',
          key: 'autoRestart',
          type: 'boolean',
          description: '配置文件变更时自动重启开发服务器，提高开发效率',
          defaultValue: false
        },
        {
          name: '调试模式',
          key: 'debug',
          type: 'boolean',
          description: '启用详细的调试信息输出，用于问题排查和性能分析',
          defaultValue: false
        },
        {
          name: '工作目录',
          key: 'cwd',
          type: 'string',
          description: '指定项目工作目录路径，相对于配置文件位置',
          placeholder: './src'
        },
        {
          name: '配置文件路径',
          key: 'configFile',
          type: 'string',
          description: '自定义配置文件路径，支持相对路径和绝对路径',
          placeholder: './launcher.config.ts'
        },
        {
          name: '别名生效阶段',
          key: 'aliasStages',
          type: 'array',
          description: '控制路径别名在哪些阶段生效，可选：dev, build, preview',
          placeholder: 'dev, build, preview'
        }
      ]
    },
    {
      name: '服务器配置',
      key: 'server',
      description: '开发服务器配置，控制本地开发环境的服务器行为',
      fields: [
        {
          name: '端口号',
          key: 'port',
          type: 'number',
          description: '开发服务器监听的端口号，默认为 3000',
          defaultValue: 3000,
          placeholder: '3000'
        },
        {
          name: '主机地址',
          key: 'host',
          type: 'string',
          description: '服务器绑定的主机地址，localhost 仅本地访问，0.0.0.0 允许外部访问',
          defaultValue: 'localhost',
          placeholder: 'localhost'
        },
        {
          name: '自动打开浏览器',
          key: 'open',
          type: 'boolean',
          description: '启动开发服务器时自动在浏览器中打开应用',
          defaultValue: true
        },
        {
          name: '启用 HTTPS',
          key: 'https',
          type: 'boolean',
          description: '启用 HTTPS 协议，用于需要安全连接的开发场景',
          defaultValue: false
        },
        {
          name: '启用 CORS',
          key: 'cors',
          type: 'boolean',
          description: '启用跨域资源共享，允许来自不同域的请求',
          defaultValue: true
        }
      ]
    },
    {
      name: '构建配置',
      key: 'build',
      description: '生产构建配置，控制项目打包和优化策略',
      fields: [
        {
          name: '输出目录',
          key: 'outDir',
          type: 'string',
          description: '构建输出文件的目录路径，相对于项目根目录',
          defaultValue: 'dist',
          placeholder: 'dist'
        },
        {
          name: '生成 Source Map',
          key: 'sourcemap',
          type: 'boolean',
          description: '生成源码映射文件，便于生产环境调试',
          defaultValue: false
        },
        {
          name: '代码压缩',
          key: 'minify',
          type: 'select',
          description: '选择代码压缩工具，减小构建产物体积',
          options: [
            { label: '不压缩', value: false },
            { label: 'Terser - 传统压缩工具', value: 'terser' },
            { label: 'ESBuild - 快速压缩', value: 'esbuild' },
            { label: 'SWC - 高性能压缩', value: 'swc' }
          ],
          defaultValue: 'esbuild'
        },
        {
          name: '构建目标',
          key: 'target',
          type: 'select',
          description: '指定构建目标环境，影响代码转换和兼容性',
          options: [
            { label: 'ES2015 (ES6)', value: 'es2015' },
            { label: 'ES2017', value: 'es2017' },
            { label: 'ES2018', value: 'es2018' },
            { label: 'ES2019', value: 'es2019' },
            { label: 'ES2020', value: 'es2020' },
            { label: 'ES2021', value: 'es2021' },
            { label: 'ES2022', value: 'es2022' },
            { label: 'ESNext', value: 'esnext' }
          ],
          defaultValue: 'es2020'
        },
        {
          name: '清空输出目录',
          key: 'emptyOutDir',
          type: 'boolean',
          description: '构建前清空输出目录，确保构建产物干净',
          defaultValue: true
        },
        {
          name: '监听模式',
          key: 'watch',
          type: 'boolean',
          description: '启用文件监听，文件变更时自动重新构建',
          defaultValue: false
        },
        {
          name: '显示压缩报告',
          key: 'reportCompressedSize',
          type: 'boolean',
          description: '构建完成后显示文件压缩大小报告',
          defaultValue: true
        }
      ]
    },
    {
      name: '预览配置',
      key: 'preview',
      description: '生产构建预览服务器配置，用于预览构建产物',
      fields: [
        {
          name: '预览端口',
          key: 'port',
          type: 'number',
          description: '预览服务器监听的端口号，默认为 4173',
          defaultValue: 4173,
          placeholder: '4173'
        },
        {
          name: '预览主机',
          key: 'host',
          type: 'string',
          description: '预览服务器绑定的主机地址',
          defaultValue: 'localhost',
          placeholder: 'localhost'
        },
        {
          name: '自动打开浏览器',
          key: 'open',
          type: 'boolean',
          description: '启动预览服务器时自动在浏览器中打开',
          defaultValue: false
        },
        {
          name: '启用 HTTPS',
          key: 'https',
          type: 'boolean',
          description: '预览服务器启用 HTTPS 协议',
          defaultValue: false
        },
        {
          name: '启用 CORS',
          key: 'cors',
          type: 'boolean',
          description: '预览服务器启用跨域资源共享',
          defaultValue: true
        }
      ]
    },
    {
      name: '依赖优化配置',
      key: 'optimizeDeps',
      description: '依赖预构建优化配置，提高开发服务器启动速度',
      fields: [
        {
          name: '包含依赖',
          key: 'include',
          type: 'array',
          description: '强制预构建的依赖包列表，通常用于动态导入的包',
          placeholder: 'lodash, axios, vue'
        },
        {
          name: '排除依赖',
          key: 'exclude',
          type: 'array',
          description: '排除预构建的依赖包列表，这些包将保持原始格式',
          placeholder: '@vueuse/core, pinia'
        },
        {
          name: '入口文件',
          key: 'entries',
          type: 'array',
          description: '额外的入口文件，用于依赖发现和预构建',
          placeholder: 'src/main.ts, src/worker.ts'
        },
        {
          name: '强制重新构建',
          key: 'force',
          type: 'boolean',
          description: '强制重新进行依赖预构建，忽略缓存',
          defaultValue: false
        }
      ]
    },
    {
      name: '路径解析配置',
      key: 'resolve',
      description: '模块路径解析配置，包括别名和文件扩展名',
      fields: [
        {
          name: '路径别名',
          key: 'alias',
          type: 'object',
          description: '配置路径别名映射，简化模块导入路径。注意：@ 和 ~ 别名默认已配置',
          placeholder: '{"@components": "./src/components", "@utils": "./src/utils"}'
        },
        {
          name: '文件扩展名',
          key: 'extensions',
          type: 'array',
          description: '自动解析的文件扩展名列表，导入时可省略扩展名',
          placeholder: '.js, .ts, .jsx, .tsx, .vue'
        }
      ]
    }
  ]

  // 表单数据处理函数
  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  // 切换配置节折叠状态
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey)
      } else {
        newSet.add(sectionKey)
      }
      return newSet
    })
  }

  // 生成配置代码
  const generateConfigCode = (): string => {
    const sections: string[] = []

    Object.entries(formData).forEach(([sectionKey, sectionData]) => {
      if (sectionData && Object.keys(sectionData).length > 0) {
        const fields: string[] = []
        Object.entries(sectionData).forEach(([fieldKey, fieldValue]) => {
          if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            if (typeof fieldValue === 'string') {
              fields.push(`    ${fieldKey}: '${fieldValue}'`)
            } else if (Array.isArray(fieldValue)) {
              const arrayStr = fieldValue.map(v => `'${v}'`).join(', ')
              fields.push(`    ${fieldKey}: [${arrayStr}]`)
            } else if (typeof fieldValue === 'object') {
              const objStr = JSON.stringify(fieldValue, null, 4).replace(/"/g, "'")
              fields.push(`    ${fieldKey}: ${objStr}`)
            } else {
              fields.push(`    ${fieldKey}: ${fieldValue}`)
            }
          }
        })

        if (fields.length > 0) {
          if (sectionKey === 'launcher') {
            sections.push(`  launcher: {\n${fields.join(',\n')}\n  }`)
          } else {
            sections.push(`  ${sectionKey}: {\n${fields.join(',\n')}\n  }`)
          }
        }
      }
    })

    return `import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
${sections.join(',\n\n')}
})`
  }

  // 表单字段组件
  const FormField: React.FC<{
    section: string
    field: ConfigField
    value: any
    onChange: (value: any) => void
  }> = ({ field, value, onChange }) => {
    const fieldValue = value ?? field.defaultValue ?? ''

    const renderInput = () => {
      switch (field.type) {
        case 'string':
          return (
            <input
              type="text"
              value={fieldValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )

        case 'number':
          return (
            <input
              type="number"
              value={fieldValue}
              onChange={(e) => onChange(Number(e.target.value))}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )

        case 'boolean':
          return (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fieldValue}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors ${fieldValue ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${fieldValue ? 'translate-x-5' : 'translate-x-0'
                  }`} />
              </div>
              <span className="ml-3 text-sm text-gray-700">
                {fieldValue ? '启用' : '禁用'}
              </span>
            </label>
          )

        case 'select':
          return (
            <select
              value={fieldValue}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )

        case 'array':
          const arrayValue = Array.isArray(fieldValue) ? fieldValue : []
          return (
            <div className="space-y-2">
              {arrayValue.map((item: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newArray = [...arrayValue]
                      newArray[index] = e.target.value
                      onChange(newArray)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const newArray = arrayValue.filter((_: any, i: number) => i !== index)
                      onChange(newArray)
                    }}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => onChange([...arrayValue, ''])}
                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加项目
              </button>
            </div>
          )

        default:
          return (
            <input
              type="text"
              value={fieldValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )
      }
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.name}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {renderInput()}
        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Launcher 配置
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('code')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'code'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    代码视图
                  </button>
                  <button
                    onClick={() => setViewMode('form')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'form'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    表单视图
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { }}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </button>
                <button
                  onClick={() => { }}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  重置
                </button>
                <button
                  onClick={() => { }}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  保存
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-4 border-b border-gray-200">
                <div className="text-sm text-gray-600">
                  配置 Launcher 的各种选项和功能
                </div>
              </div>
              {viewMode === 'code' ? (
                <div className="p-4">
                  <div className="text-center text-gray-500 py-8">
                    <div className="mb-4">
                      <Settings className="w-12 h-12 mx-auto text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      代码视图
                    </h3>
                    <p className="text-gray-500 mb-4">
                      显示生成的配置代码
                    </p>
                    <div className="text-left bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {generateConfigCode()}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 max-h-[calc(100vh-200px)] overflow-auto">
                  <div className="space-y-6">
                    {configSections.map((section) => {
                      const isCollapsed = collapsedSections.has(section.key)
                      return (
                        <div key={section.key} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleSection(section.key)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              {isCollapsed ? (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              )}
                              <div className="text-left">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {section.name}
                                </h3>
                                {section.description && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {section.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>

                          {!isCollapsed && (
                            <div className="p-4 space-y-4 border-t border-gray-200">
                              {section.fields.map((field) => (
                                <FormField
                                  key={field.key}
                                  section={section.key}
                                  field={field}
                                  value={formData[section.key]?.[field.key]}
                                  onChange={(value) => updateFormData(section.key, field.key, value)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LauncherConfig
