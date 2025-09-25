import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

interface ProjectInfo {
  name: string
  version: string
  description?: string
  path: string
  packageJson?: any
  hasConfig: boolean
  configPath?: string
}

interface ProjectContextType {
  project: ProjectInfo | null
  config: any
  loading: boolean
  error: string | null
  refreshProject: () => Promise<void>
  updateConfig: (newConfig: any) => Promise<void>
}

const ProjectContext = createContext<ProjectContextType>({
  project: null,
  config: null,
  loading: false,
  error: null,
  refreshProject: async () => {},
  updateConfig: async () => {}
})

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

interface ProjectProviderProps {
  children: React.ReactNode
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProject = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [projectData, configData] = await Promise.all([
        api.getProject(),
        api.getConfig()
      ])
      
      setProject(projectData)
      setConfig(configData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载项目信息失败')
      console.error('Failed to load project:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (newConfig: any) => {
    try {
      await api.updateConfig(newConfig)
      setConfig(newConfig)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新配置失败')
    }
  }

  useEffect(() => {
    refreshProject()
  }, [])

  return (
    <ProjectContext.Provider 
      value={{ 
        project, 
        config, 
        loading, 
        error, 
        refreshProject, 
        updateConfig 
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
