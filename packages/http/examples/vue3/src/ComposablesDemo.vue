<template>
  <div class="composables-demo">
    <h1>🎨 Vue组合式函数演示</h1>
    
    <!-- 简化HTTP请求演示 -->
    <section class="demo-section">
      <h2>📡 简化HTTP请求</h2>
      
      <div class="demo-card">
        <h3>useGet - 获取用户列表</h3>
        <button @click="fetchUsers" :disabled="usersLoading">
          {{ usersLoading ? '加载中...' : '获取用户' }}
        </button>
        
        <div v-if="usersError" class="error">
          错误: {{ usersError.message }}
        </div>
        
        <div v-if="users" class="result">
          <p>获取到 {{ users.length }} 个用户</p>
          <ul>
            <li v-for="user in users.slice(0, 3)" :key="user.id">
              {{ user.name }} - {{ user.email }}
            </li>
          </ul>
        </div>
      </div>

      <div class="demo-card">
        <h3>usePost - 创建用户</h3>
        <form @submit.prevent="createUser">
          <input v-model="newUser.name" placeholder="姓名" required />
          <input v-model="newUser.email" placeholder="邮箱" type="email" required />
          <button type="submit" :disabled="createLoading">
            {{ createLoading ? '创建中...' : '创建用户' }}
          </button>
        </form>
        
        <div v-if="createError" class="error">
          错误: {{ createError.message }}
        </div>
        
        <div v-if="createdUser" class="result">
          <p>✅ 用户创建成功!</p>
          <pre>{{ JSON.stringify(createdUser, null, 2) }}</pre>
        </div>
      </div>
    </section>

    <!-- 资源管理演示 -->
    <section class="demo-section">
      <h2>🗂️ 资源管理 (useResource)</h2>
      
      <div class="demo-card">
        <div class="controls">
          <button @click="listPosts" :disabled="postsLoading">
            {{ postsLoading ? '加载中...' : '获取文章列表' }}
          </button>
          <button @click="getPost(1)" :disabled="postsLoading">
            获取文章#1
          </button>
          <button @click="createPost" :disabled="postsLoading">
            创建文章
          </button>
        </div>
        
        <div v-if="posts.length > 0" class="result">
          <h4>文章列表 ({{ posts.length }}篇)</h4>
          <div v-for="post in posts.slice(0, 3)" :key="post.id" class="post-item">
            <h5>{{ post.title }}</h5>
            <p>{{ post.body.substring(0, 100) }}...</p>
            <div class="post-actions">
              <button @click="updatePost(post.id, { title: post.title + ' (已更新)' })">
                更新
              </button>
              <button @click="removePost(post.id)" class="danger">
                删除
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="currentPost" class="result">
          <h4>当前文章</h4>
          <pre>{{ JSON.stringify(currentPost, null, 2) }}</pre>
        </div>
      </div>
    </section>

    <!-- 表单管理演示 -->
    <section class="demo-section">
      <h2>📝 表单管理 (useForm)</h2>
      
      <div class="demo-card">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>姓名</label>
            <input 
              v-model="formData.name" 
              :class="{ error: formErrors.name }"
              placeholder="请输入姓名"
            />
            <span v-if="formErrors.name" class="error-text">{{ formErrors.name }}</span>
          </div>
          
          <div class="form-group">
            <label>邮箱</label>
            <input 
              v-model="formData.email" 
              :class="{ error: formErrors.email }"
              placeholder="请输入邮箱"
              type="email"
            />
            <span v-if="formErrors.email" class="error-text">{{ formErrors.email }}</span>
          </div>
          
          <div class="form-group">
            <label>年龄</label>
            <input 
              v-model.number="formData.age" 
              :class="{ error: formErrors.age }"
              placeholder="请输入年龄"
              type="number"
            />
            <span v-if="formErrors.age" class="error-text">{{ formErrors.age }}</span>
          </div>
          
          <div class="form-actions">
            <button type="submit" :disabled="formSubmitting">
              {{ formSubmitting ? '提交中...' : '提交表单' }}
            </button>
            <button type="button" @click="validateForm">
              验证表单
            </button>
          </div>
        </form>
        
        <div v-if="formSubmitResult" class="result">
          <h4>提交结果</h4>
          <pre>{{ JSON.stringify(formSubmitResult, null, 2) }}</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  useGet, 
  usePost, 
  useResource, 
  useForm 
} from '@ldesign/http/vue'

// 类型定义
interface User {
  id: number
  name: string
  email: string
}

interface Post {
  id: number
  title: string
  body: string
  userId: number
}

// 简化HTTP请求演示
const { 
  data: users, 
  loading: usersLoading, 
  error: usersError, 
  execute: fetchUsers 
} = useGet<User[]>('https://jsonplaceholder.typicode.com/users')

const newUser = ref({ name: '', email: '' })
const { 
  data: createdUser, 
  loading: createLoading, 
  error: createError, 
  execute: executeCreate 
} = usePost<User>('https://jsonplaceholder.typicode.com/users')

const createUser = async () => {
  await executeCreate(newUser.value)
  if (!createError.value) {
    newUser.value = { name: '', email: '' }
  }
}

// 资源管理演示
const { 
  items: posts, 
  current: currentPost, 
  loading: postsLoading, 
  list: listPosts, 
  get: getPost, 
  create: createPost, 
  update: updatePost, 
  remove: removePost 
} = useResource<Post>('https://jsonplaceholder.typicode.com/posts')

// 表单管理演示
const { 
  data: formData, 
  submitting: formSubmitting, 
  errors: formErrors, 
  submit: submitForm, 
  validate: validateForm, 
  setValidationRules 
} = useForm<{ name: string; email: string; age: number }>({
  initialData: { name: '', email: '', age: 0 }
})

const formSubmitResult = ref(null)

// 设置表单验证规则
setValidationRules({
  name: [
    { required: true, message: '姓名不能为空' },
    { minLength: 2, message: '姓名至少2个字符' }
  ],
  email: [
    { required: true, message: '邮箱不能为空' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
  ],
  age: [
    { required: true, message: '年龄不能为空' },
    { min: 1, message: '年龄必须大于0' },
    { max: 120, message: '年龄不能超过120' }
  ]
})

// 重写提交函数以处理结果
const originalSubmit = submitForm
submitForm = async () => {
  const result = await originalSubmit('https://jsonplaceholder.typicode.com/users')
  if (result) {
    formSubmitResult.value = result
  }
}
</script>

<style scoped>
.composables-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-section {
  margin-bottom: 40px;
}

.demo-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

button.danger {
  background: #dc3545;
}

button.danger:hover:not(:disabled) {
  background: #c82333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
}

.result {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 15px;
  margin: 15px 0;
}

.post-item {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  background: white;
}

.post-item h5 {
  margin: 0 0 10px 0;
  color: #495057;
}

.post-item p {
  margin: 0 0 10px 0;
  color: #6c757d;
  line-height: 1.4;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.post-actions button {
  font-size: 12px;
  padding: 4px 8px;
}

pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 10px;
  overflow-x: auto;
  font-size: 12px;
  margin: 10px 0;
}

ul {
  margin: 10px 0;
  padding-left: 20px;
}

li {
  margin-bottom: 5px;
}

h1, h2, h3, h4 {
  color: #495057;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
</style>
