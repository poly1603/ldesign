import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toolsApi, type Tool } from '../api/tools'

export const useToolsStore = defineStore('tools', () => {
  const tools = ref<Tool[]>([])
  const loading = ref(false)

  async function fetchTools() {
    loading.value = true
    try {
      tools.value = await toolsApi.getAll()
    } finally {
      loading.value = false
    }
  }

  async function executeTool(name: string, action: string, params?: any) {
    return await toolsApi.execute(name, action, params)
  }

  function getToolByName(name: string) {
    return tools.value.find((t) => t.name === name)
  }

  return {
    tools,
    loading,
    fetchTools,
    executeTool,
    getToolByName,
  }
})


