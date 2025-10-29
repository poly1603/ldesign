<template>
  <div class="file-manager">
    <n-layout has-sider>
      <n-layout-sider
        bordered
        :width="280"
        :native-scrollbar="false"
        show-trigger="arrow-circle"
      >
        <n-space vertical style="padding: 16px">
          <n-button type="primary" block @click="handleNewFile">
            <template #icon>
              <n-icon :component="AddOutline" />
            </template>
            新建文件
          </n-button>
          
          <n-tree
            :data="fileTree"
            :selectable="true"
            block-line
            @update:selected-keys="handleFileSelect"
          />
        </n-space>
      </n-layout-sider>

      <n-layout-content :native-scrollbar="false" style="padding: 16px">
        <n-card v-if="currentFile" :title="currentFile.name">
          <template #header-extra>
            <n-space>
              <n-button size="small" @click="handleSave">
                <template #icon>
                  <n-icon :component="SaveOutline" />
                </template>
                保存
              </n-button>
              <n-button size="small" @click="handleDelete">
                <template #icon>
                  <n-icon :component="TrashOutline" />
                </template>
                删除
              </n-button>
            </n-space>
          </template>

          <n-input
            v-model:value="fileContent"
            type="textarea"
            placeholder="文件内容"
            :rows="20"
            :autosize="{ minRows: 20, maxRows: 40 }"
          />
        </n-card>

        <n-empty v-else description="请选择一个文件" style="margin-top: 100px" />
      </n-layout-content>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { AddOutline, SaveOutline, TrashOutline } from '@vicons/ionicons5'

const message = useMessage()

interface FileNode {
  key: string
  label: string
  isLeaf?: boolean
  children?: FileNode[]
}

const fileTree = ref<FileNode[]>([])
const currentFile = ref<{ path: string; name: string } | null>(null)
const fileContent = ref('')

async function fetchFileTree() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/files/tree?path=.')
    const result = await response.json()
    if (result.success) {
      fileTree.value = transformTree(result.data)
    }
  } catch (error) {
    message.error('获取文件树失败')
  }
}

function transformTree(nodes: any[]): FileNode[] {
  return nodes.map(node => ({
    key: node.path,
    label: node.name,
    isLeaf: node.type === 'file',
    children: node.children ? transformTree(node.children) : undefined,
  }))
}

async function handleFileSelect(keys: Array<string | number>) {
  if (keys.length === 0) return
  
  const path = keys[0] as string
  
  try {
    const response = await fetch(`http://127.0.0.1:3000/api/files/read?path=${encodeURIComponent(path)}`)
    const result = await response.json()
    if (result.success) {
      currentFile.value = { path, name: path.split('/').pop() || '' }
      fileContent.value = result.data.content
    }
  } catch (error) {
    message.error('读取文件失败')
  }
}

async function handleSave() {
  if (!currentFile.value) return

  try {
    const response = await fetch('http://127.0.0.1:3000/api/files/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: currentFile.value.path,
        content: fileContent.value,
      }),
    })
    const result = await response.json()
    if (result.success) {
      message.success('保存成功')
    }
  } catch (error) {
    message.error('保存失败')
  }
}

async function handleDelete() {
  if (!currentFile.value) return

  try {
    const response = await fetch(`http://127.0.0.1:3000/api/files?path=${encodeURIComponent(currentFile.value.path)}`, {
      method: 'DELETE',
    })
    const result = await response.json()
    if (result.success) {
      message.success('删除成功')
      currentFile.value = null
      fileContent.value = ''
      await fetchFileTree()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

function handleNewFile() {
  const filename = prompt('请输入文件名：')
  if (!filename) return

  currentFile.value = { path: filename, name: filename }
  fileContent.value = ''
}

onMounted(() => {
  fetchFileTree()
})
</script>

<style scoped>
.file-manager {
  height: calc(100vh - 100px);
}
</style>
