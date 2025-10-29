<template>
  <div class="git-manager">
    <n-tabs type="line" animated>
      <n-tab-pane name="status" tab="状态">
        <n-card title="仓库状态">
          <n-space vertical>
            <n-descriptions bordered :column="2">
              <n-descriptions-item label="当前分支">
                {{ status.branch }}
              </n-descriptions-item>
              <n-descriptions-item label="领先/落后">
                ↑ {{ status.ahead }} / ↓ {{ status.behind }}
              </n-descriptions-item>
            </n-descriptions>

            <n-divider />

            <n-h3>已暂存</n-h3>
            <n-list v-if="status.staged.length > 0" bordered>
              <n-list-item v-for="file in status.staged" :key="file">
                {{ file }}
                <template #suffix>
                  <n-button size="small" @click="handleUnstage([file])">取消暂存</n-button>
                </template>
              </n-list-item>
            </n-list>
            <n-empty v-else description="没有已暂存的文件" />

            <n-h3>已修改</n-h3>
            <n-list v-if="status.modified.length > 0" bordered>
              <n-list-item v-for="file in status.modified" :key="file">
                {{ file }}
                <template #suffix>
                  <n-button size="small" type="primary" @click="handleStage([file])">暂存</n-button>
                </template>
              </n-list-item>
            </n-list>
            <n-empty v-else description="没有已修改的文件" />

            <n-divider />

            <n-space>
              <n-input v-model:value="commitMessage" placeholder="提交信息" style="width: 400px" />
              <n-button type="primary" @click="handleCommit" :disabled="status.staged.length === 0">
                <template #icon>
                  <n-icon :component="CheckmarkOutline" />
                </template>
                提交
              </n-button>
              <n-button @click="handlePush">
                <template #icon>
                  <n-icon :component="CloudUploadOutline" />
                </template>
                推送
              </n-button>
              <n-button @click="handlePull">
                <template #icon>
                  <n-icon :component="CloudDownloadOutline" />
                </template>
                拉取
              </n-button>
            </n-space>
          </n-space>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="branches" tab="分支">
        <n-card title="分支管理">
          <template #header-extra>
            <n-button type="primary" @click="showCreateBranch = true">
              <template #icon>
                <n-icon :component="AddOutline" />
              </template>
              新建分支
            </n-button>
          </template>

          <n-list bordered>
            <n-list-item v-for="branch in branches" :key="branch.name">
              <n-space align="center">
                <n-tag v-if="branch.current" type="success">当前</n-tag>
                <span>{{ branch.name }}</span>
                <n-text depth="3">{{ branch.commit }}</n-text>
              </n-space>

              <template #suffix>
                <n-space>
                  <n-button
                    v-if="!branch.current"
                    size="small"
                    @click="handleCheckout(branch.name)"
                  >
                    切换
                  </n-button>
                  <n-button
                    v-if="!branch.current"
                    size="small"
                    type="error"
                    @click="handleDeleteBranch(branch.name)"
                  >
                    删除
                  </n-button>
                </n-space>
              </template>
            </n-list-item>
          </n-list>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="commits" tab="提交历史">
        <n-card title="提交历史">
          <n-timeline>
            <n-timeline-item
              v-for="commit in commits"
              :key="commit.hash"
              :title="commit.message"
              :time="new Date(commit.date).toLocaleString()"
            >
              <n-space vertical size="small">
                <n-text depth="3">{{ commit.author }} ({{ commit.email }})</n-text>
                <n-text depth="3">{{ commit.hash }}</n-text>
                <n-space>
                  <n-tag v-for="file in commit.files" :key="file" size="small">
                    {{ file }}
                  </n-tag>
                </n-space>
              </n-space>
            </n-timeline-item>
          </n-timeline>
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <!-- 新建分支弹窗 -->
    <n-modal v-model:show="showCreateBranch" preset="dialog" title="新建分支">
      <n-space vertical>
        <n-input v-model:value="newBranchName" placeholder="分支名称" />
        <n-input v-model:value="newBranchFrom" placeholder="从哪个分支创建（可选）" />
      </n-space>

      <template #action>
        <n-space>
          <n-button @click="showCreateBranch = false">取消</n-button>
          <n-button type="primary" @click="handleCreateBranch">创建</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import {
  CheckmarkOutline,
  CloudUploadOutline,
  CloudDownloadOutline,
  AddOutline,
} from '@vicons/ionicons5'

const message = useMessage()

const status = ref({
  branch: '',
  ahead: 0,
  behind: 0,
  staged: [] as string[],
  modified: [] as string[],
  untracked: [] as string[],
  conflicts: [] as string[],
})

const branches = ref<any[]>([])
const commits = ref<any[]>([])
const commitMessage = ref('')
const showCreateBranch = ref(false)
const newBranchName = ref('')
const newBranchFrom = ref('')

async function fetchStatus() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/status')
    const result = await response.json()
    if (result.success) {
      status.value = result.data
    }
  } catch (error) {
    message.error('获取状态失败')
  }
}

async function fetchBranches() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/branches')
    const result = await response.json()
    if (result.success) {
      branches.value = result.data
    }
  } catch (error) {
    message.error('获取分支列表失败')
  }
}

async function fetchCommits() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/commits')
    const result = await response.json()
    if (result.success) {
      commits.value = result.data.commits
    }
  } catch (error) {
    message.error('获取提交历史失败')
  }
}

async function handleStage(files: string[]) {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/stage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files }),
    })
    const result = await response.json()
    if (result.success) {
      message.success('暂存成功')
      await fetchStatus()
    }
  } catch (error) {
    message.error('暂存失败')
  }
}

async function handleUnstage(files: string[]) {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/unstage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files }),
    })
    const result = await response.json()
    if (result.success) {
      message.success('取消暂存成功')
      await fetchStatus()
    }
  } catch (error) {
    message.error('取消暂存失败')
  }
}

async function handleCommit() {
  if (!commitMessage.value) {
    message.warning('请输入提交信息')
    return
  }

  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: commitMessage.value }),
    })
    const result = await response.json()
    if (result.success) {
      message.success('提交成功')
      commitMessage.value = ''
      await Promise.all([fetchStatus(), fetchCommits()])
    }
  } catch (error) {
    message.error('提交失败')
  }
}

async function handlePush() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const result = await response.json()
    if (result.success) {
      message.success('推送成功')
    }
  } catch (error) {
    message.error('推送失败')
  }
}

async function handlePull() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const result = await response.json()
    if (result.success) {
      message.success('拉取成功')
      await fetchStatus()
    }
  } catch (error) {
    message.error('拉取失败')
  }
}

async function handleCheckout(branch: string) {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch }),
    })
    const result = await response.json()
    if (result.success) {
      message.success(`已切换到分支 ${branch}`)
      await Promise.all([fetchStatus(), fetchBranches()])
    }
  } catch (error) {
    message.error('切换分支失败')
  }
}

async function handleDeleteBranch(name: string) {
  try {
    const response = await fetch(`http://127.0.0.1:3000/api/git/branches/${name}`, {
      method: 'DELETE',
    })
    const result = await response.json()
    if (result.success) {
      message.success('分支删除成功')
      await fetchBranches()
    }
  } catch (error) {
    message.error('删除分支失败')
  }
}

async function handleCreateBranch() {
  if (!newBranchName.value) {
    message.warning('请输入分支名称')
    return
  }

  try {
    const response = await fetch('http://127.0.0.1:3000/api/git/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newBranchName.value,
        from: newBranchFrom.value,
      }),
    })
    const result = await response.json()
    if (result.success) {
      message.success('分支创建成功')
      showCreateBranch.value = false
      newBranchName.value = ''
      newBranchFrom.value = ''
      await fetchBranches()
    }
  } catch (error) {
    message.error('创建分支失败')
  }
}

onMounted(() => {
  Promise.all([fetchStatus(), fetchBranches(), fetchCommits()])
})
</script>

<style scoped>
.git-manager {
  padding: 20px;
}
</style>
