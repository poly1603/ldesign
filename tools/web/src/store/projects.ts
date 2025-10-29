import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projectsApi, type Project } from '../api/projects'

// 示例项目数据
const DEMO_PROJECTS: Project[] = [
  {
    id: 'demo-1',
    name: 'LDesign UI',
    path: 'D:\\WorkBench\\ldesign\\packages\\ui',
    type: 'library',
    framework: 'vue',
    packageManager: 'pnpm',
    description: 'LDesign UI 组件库',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'demo-2',
    name: 'My React App',
    path: 'D:\\Projects\\my-react-app',
    type: 'web',
    framework: 'react',
    packageManager: 'npm',
    description: 'React 应用示例',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'demo-3',
    name: 'Vue Admin',
    path: 'D:\\Projects\\vue-admin',
    type: 'web',
    framework: 'vue',
    packageManager: 'pnpm',
    description: 'Vue 后台管理系统',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
]

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const useDemoData = ref(true)

  async function fetchProjects() {
    loading.value = true
    try {
      if (useDemoData.value) {
        await new Promise(resolve => setTimeout(resolve, 500))
        projects.value = DEMO_PROJECTS
      } else {
        projects.value = await projectsApi.getAll()
      }
    } catch (error) {
      console.warn('无法连接到后端，使用示例数据')
      projects.value = DEMO_PROJECTS
      useDemoData.value = true
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id: string) {
    loading.value = true
    try {
      if (useDemoData.value) {
        await new Promise(resolve => setTimeout(resolve, 300))
        currentProject.value = DEMO_PROJECTS.find(p => p.id === id) || null
      } else {
        currentProject.value = await projectsApi.getById(id)
      }
    } catch (error) {
      currentProject.value = DEMO_PROJECTS.find(p => p.id === id) || null
      useDemoData.value = true
    } finally {
      loading.value = false
    }
  }

  async function importProject(path: string) {
    const project = await projectsApi.import(path)
    projects.value.unshift(project)
    return project
  }

  async function deleteProject(id: string) {
    await projectsApi.delete(id)
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  return {
    projects,
    currentProject,
    loading,
    useDemoData,
    fetchProjects,
    fetchProject,
    importProject,
    deleteProject,
  }
})
