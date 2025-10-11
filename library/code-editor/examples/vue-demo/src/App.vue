<template>
  <div class="app">
    <header>
      <h1>@ldesign/code-editor</h1>
      <p>基于 Monaco Editor 的高性能代码编辑器 - Vue3 示例</p>
    </header>

    <main>
      <!-- 基础示例 -->
      <section class="demo-section">
        <h2>基础示例</h2>
        <div class="controls">
          <button @click="handleGetValue">获取值</button>
          <button @click="handleSetValue">设置值</button>
          <button @click="handleFormat">格式化代码</button>
          <button @click="handleUndo">撤销</button>
          <button @click="handleRedo">重做</button>
        </div>
        <CodeEditor
          ref="editor1Ref"
          v-model="code1"
          language="javascript"
          theme="vs-dark"
          height="400px"
          @change="handleChange1"
          @ready="handleReady1"
        />
      </section>

      <!-- 主题和语言切换 -->
      <section class="demo-section">
        <h2>主题和语言切换</h2>
        <div class="controls">
          <select v-model="selectedTheme">
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
            <option value="hc-black">High Contrast</option>
          </select>
          <select v-model="selectedLanguage">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
          </select>
        </div>
        <CodeEditor
          v-model="code2"
          :language="selectedLanguage"
          :theme="selectedTheme"
          height="400px"
        />
      </section>

      <!-- 只读模式 -->
      <section class="demo-section">
        <h2>只读模式</h2>
        <div class="controls">
          <label>
            <input v-model="isReadOnly" type="checkbox">
            只读模式
          </label>
        </div>
        <CodeEditor
          v-model="code3"
          language="javascript"
          theme="vs-dark"
          :read-only="isReadOnly"
          height="300px"
        />
      </section>

      <!-- 自定义配置 -->
      <section class="demo-section">
        <h2>自定义配置</h2>
        <div class="controls">
          <label>
            <input v-model="showMinimap" type="checkbox">
            显示 Minimap
          </label>
          <label>
            <input v-model="showLineNumbers" type="checkbox">
            显示行号
          </label>
          <label>
            <input v-model="enableFolding" type="checkbox">
            代码折叠
          </label>
          <label>
            字体大小: <input v-model.number="customFontSize" type="number" min="10" max="30">
          </label>
        </div>
        <CodeEditor
          v-model="code4"
          language="javascript"
          theme="vs-dark"
          :minimap="showMinimap"
          :line-numbers="showLineNumbers ? 'on' : 'off'"
          :folding="enableFolding"
          :font-size="customFontSize"
          height="400px"
        />
      </section>

      <!-- Composable API 示例 -->
      <section class="demo-section">
        <h2>Composable API 示例</h2>
        <div class="info-panel">
          <div>编辑器就绪: {{ composableState.isReady ? '是' : '否' }}</div>
          <div>当前值长度: {{ composableState.valueLength }}</div>
        </div>
        <div ref="composableEditorRef" style="height: 300px; border: 1px solid #e0e0e0;"></div>
      </section>

      <!-- 事件监听 -->
      <section class="demo-section">
        <h2>事件监听</h2>
        <CodeEditor
          v-model="code5"
          language="javascript"
          theme="vs-dark"
          height="300px"
          @change="handleEventChange"
          @cursor-change="handleCursorChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <div class="event-log">
          <h3>事件日志:</h3>
          <div id="eventLog">
            <div v-for="(log, index) in eventLogs" :key="index" class="log-entry">
              [{{ log.id }}] {{ log.message }}
            </div>
          </div>
        </div>
      </section>

      <!-- 多编辑器联动 -->
      <section class="demo-section">
        <h2>多编辑器联动</h2>
        <p>在任一编辑器中编辑，其他编辑器会同步更新</p>
        <div class="split-container">
          <div class="split-item">
            <h3>编辑器 A</h3>
            <CodeEditor
              v-model="sharedCode"
              language="javascript"
              theme="vs-dark"
              height="300px"
            />
          </div>
          <div class="split-item">
            <h3>编辑器 B</h3>
            <CodeEditor
              v-model="sharedCode"
              language="javascript"
              theme="vs"
              height="300px"
            />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { CodeEditor, useCodeEditor } from '@ldesign/code-editor/vue'
import type * as Monaco from 'monaco-editor'

// 示例代码
const jsCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 打印前 10 个斐波那契数
for (let i = 0; i < 10; i++) {
  console.log(\`fibonacci(\${i}) = \${fibonacci(i)}\`);
}
`

const tsCode = `interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}

const service = new UserService();
service.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
`

// 基础示例
const editor1Ref = ref()
const code1 = ref(jsCode)

const handleGetValue = () => {
  const value = editor1Ref.value?.getValue()
  alert(value)
}

const handleSetValue = () => {
  editor1Ref.value?.setValue('console.log("Hello from setValue!")')
}

const handleFormat = async () => {
  await editor1Ref.value?.format()
}

const handleUndo = () => {
  editor1Ref.value?.undo()
}

const handleRedo = () => {
  editor1Ref.value?.redo()
}

const handleChange1 = (value: string) => {
  console.log('Value changed:', value.length, 'characters')
}

const handleReady1 = (editor: Monaco.editor.IStandaloneCodeEditor) => {
  console.log('Editor ready:', editor)
}

// 主题和语言切换
const selectedTheme = ref<'vs' | 'vs-dark' | 'hc-black'>('vs-dark')
const selectedLanguage = ref('typescript')
const code2 = ref(tsCode)

// 监听语言变化并更新代码
watch(selectedLanguage, (newLang) => {
  switch (newLang) {
    case 'javascript':
      code2.value = jsCode
      break
    case 'typescript':
      code2.value = tsCode
      break
    case 'html':
      code2.value = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>示例页面</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`
      break
    case 'json':
      code2.value = `{
  "name": "example",
  "version": "1.0.0",
  "description": "A sample JSON file"
}`
      break
    default:
      code2.value = `// ${newLang} code here`
  }
})

// 只读模式
const isReadOnly = ref(false)
const code3 = ref('// 这是只读模式的编辑器\n// 切换复选框可以改变只读状态')

// 自定义配置
const showMinimap = ref(true)
const showLineNumbers = ref(true)
const enableFolding = ref(true)
const customFontSize = ref(14)
const code4 = ref(jsCode)

// Composable API 示例
const composableEditorRef = ref<HTMLElement>()
const composableState = reactive({
  isReady: false,
  valueLength: 0
})

onMounted(() => {
  const { isReady, value } = useCodeEditor(composableEditorRef, {
    value: '// 使用 Composable API 创建的编辑器\nconsole.log("Hello from Composable API!")',
    language: 'javascript',
    theme: 'vs-dark',
    on: {
      ready: () => {
        composableState.isReady = true
      }
    }
  })

  watch(isReady, (ready) => {
    composableState.isReady = ready
  })

  watch(value, (newValue) => {
    composableState.valueLength = newValue.length
  })
})

// 事件监听
const code5 = ref('// 在编辑器中输入内容，查看下方的事件日志')
const eventLogs = ref<Array<{ id: number; message: string }>>([])
let eventCounter = 0

const addEventLog = (message: string) => {
  eventCounter++
  eventLogs.value.unshift({ id: eventCounter, message })
  if (eventLogs.value.length > 10) {
    eventLogs.value = eventLogs.value.slice(0, 10)
  }
}

const handleEventChange = (value: string) => {
  addEventLog(`change: ${value.length} characters`)
}

const handleCursorChange = (position: Monaco.Position) => {
  addEventLog(`cursorChange: line ${position.lineNumber}, column ${position.column}`)
}

const handleFocus = () => {
  addEventLog('focus')
}

const handleBlur = () => {
  addEventLog('blur')
}

// 多编辑器联动
const sharedCode = ref(`// 这是共享的代码
// 在任一编辑器中编���都会同步到另一个编辑器

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
`)
</script>

<style scoped>
.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.demo-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin-bottom: 20px;
  color: #667eea;
  font-size: 1.5rem;
}

.demo-section h3 {
  margin-bottom: 15px;
  color: #764ba2;
  font-size: 1.2rem;
}

.demo-section p {
  margin-bottom: 15px;
  color: #666;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

button {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

button:hover {
  background: #5568d3;
}

button:active {
  transform: translateY(1px);
}

select {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #667eea;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

input[type="number"] {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 80px;
  font-size: 14px;
}

input[type="number"]:focus {
  outline: none;
  border-color: #667eea;
}

.info-panel {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 15px;
}

.info-panel div {
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

.event-log {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 5px;
}

.event-log h3 {
  margin-bottom: 15px;
  color: #667eea;
}

#eventLog {
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  padding: 8px 12px;
  margin-bottom: 5px;
  background: white;
  border-left: 3px solid #667eea;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #555;
}

.split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.split-item h3 {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .app {
    padding: 10px;
  }

  header h1 {
    font-size: 2rem;
  }

  .demo-section {
    padding: 20px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  button, select {
    width: 100%;
  }

  .split-container {
    grid-template-columns: 1fr;
  }
}
</style>
