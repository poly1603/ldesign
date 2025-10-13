import { 
  createEnhancedCodeEditor,
  ThemeManager,
  EditorFeatureManager,
  getLanguageByExtension,
  supportsFormatting
} from '@ldesign/code-editor'
import type { ICodeEditor, ExtendedCodeEditorConfig } from '@ldesign/code-editor'

/**
 * 高级功能演示
 * 展示所有新增的功能
 */

// Python 示例代码
const pythonCode = `def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 生成前10个斐波那契数
for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")

class Calculator:
    def add(self, a, b):
        return a + b
    
    def multiply(self, a, b):
        return a * b
`

// Go 示例代码  
const goCode = `package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    for i := 0; i < 10; i++ {
        fmt.Printf("fibonacci(%d) = %d\\n", i, fibonacci(i))
    }
}
`

// Rust 示例代码
const rustCode = `fn fibonacci(n: u32) -> u32 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    for i in 0..10 {
        println!("fibonacci({}) = {}", i, fibonacci(i));
    }
}
`

// SQL 示例代码
const sqlCode = `-- 创建用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例数据
INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com'),
    ('Charlie', 'charlie@example.com');

-- 查询用户
SELECT * FROM users 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
`

// GraphQL 示例代码
const graphqlCode = `type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: DateTime!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts(limit: Int = 10): [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}
`

// YAML 示例代码
const yamlCode = `# Docker Compose 配置
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
`

export function initAdvancedDemo() {
  // 1. 创建一个带所有新主题的编辑器
  const themeDemo = document.createElement('section')
  themeDemo.className = 'demo-section'
  themeDemo.innerHTML = `
    <h2>🎨 主题展示（17+ 主题）</h2>
    <div class="controls">
      <select id="advancedThemeSelect">
        <optgroup label="内置主题">
          <option value="vs">Visual Studio</option>
          <option value="vs-dark" selected>Visual Studio Dark</option>
          <option value="hc-black">High Contrast Black</option>
          <option value="hc-light">High Contrast Light</option>
        </optgroup>
        <optgroup label="GitHub">
          <option value="github-light">GitHub Light</option>
          <option value="github-dark">GitHub Dark</option>
        </optgroup>
        <optgroup label="流行主题">
          <option value="monokai">Monokai</option>
          <option value="dracula">Dracula</option>
          <option value="one-dark">One Dark</option>
          <option value="one-light">One Light</option>
          <option value="nord">Nord</option>
        </optgroup>
        <optgroup label="Material">
          <option value="material">Material</option>
          <option value="material-darker">Material Darker</option>
          <option value="material-palenight">Material Palenight</option>
        </optgroup>
        <optgroup label="其他">
          <option value="synthwave">Synthwave '84</option>
          <option value="tokyo-night">Tokyo Night</option>
          <option value="solarized-light">Solarized Light</option>
          <option value="solarized-dark">Solarized Dark</option>
          <option value="ayu-light">Ayu Light</option>
          <option value="ayu-dark">Ayu Dark</option>
        </optgroup>
      </select>
      <button id="followSystemTheme">跟随系统主题</button>
    </div>
    <div id="themeEditor" class="editor-container"></div>
  `
  document.querySelector('main')?.appendChild(themeDemo)

  const themeEditor = createEnhancedCodeEditor('#themeEditor', {
    value: '// 选择不同的主题查看效果\nconst themes = [\n  "github-dark",\n  "monokai", \n  "dracula",\n  "one-dark",\n  "synthwave"\n];\n\n// 美丽的代码配色',
    language: 'javascript',
    theme: 'vs-dark',
    themes: {
      default: 'vs-dark',
      onThemeChange: (theme) => {
        console.log('主题切换为:', theme)
      }
    }
  })

  document.getElementById('advancedThemeSelect')?.addEventListener('change', (e) => {
    const theme = (e.target as HTMLSelectElement).value
    themeEditor.setTheme(theme)
  })

  document.getElementById('followSystemTheme')?.addEventListener('click', () => {
    const themeManager = themeEditor.getThemeManager()
    themeManager.applySystemTheme()
  })

  // 2. 多语言支持演示
  const languageDemo = document.createElement('section')
  languageDemo.className = 'demo-section'
  languageDemo.innerHTML = `
    <h2>🌍 多语言支持（40+ 语言）</h2>
    <div class="controls">
      <select id="advancedLangSelect">
        <optgroup label="前端">
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="jsx">JSX</option>
          <option value="tsx">TSX</option>
          <option value="vue">Vue</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="scss">SCSS</option>
          <option value="less">Less</option>
        </optgroup>
        <optgroup label="后端">
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
          <option value="csharp">C#</option>
          <option value="swift">Swift</option>
          <option value="kotlin">Kotlin</option>
        </optgroup>
        <optgroup label="数据">
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="xml">XML</option>
          <option value="sql">SQL</option>
          <option value="graphql">GraphQL</option>
        </optgroup>
        <optgroup label="其他">
          <option value="markdown">Markdown</option>
          <option value="dockerfile">Dockerfile</option>
          <option value="shell">Shell</option>
          <option value="powershell">PowerShell</option>
        </optgroup>
      </select>
      <span id="langInfo"></span>
    </div>
    <div id="languageEditor" class="editor-container"></div>
  `
  document.querySelector('main')?.appendChild(languageDemo)

  const langEditor = createEnhancedCodeEditor('#languageEditor', {
    value: pythonCode,
    language: 'python',
    theme: 'monokai',
    plugins: {
      python: true
    }
  })

  const langSelect = document.getElementById('advancedLangSelect') as HTMLSelectElement
  const langInfo = document.getElementById('langInfo')
  
  langSelect?.addEventListener('change', (e) => {
    const language = (e.target as HTMLSelectElement).value
    langEditor.setLanguage(language as any)
    
    // 设置对应的示例代码
    const codeMap: Record<string, string> = {
      python: pythonCode,
      go: goCode,
      rust: rustCode,
      sql: sqlCode,
      graphql: graphqlCode,
      yaml: yamlCode
    }
    
    if (codeMap[language]) {
      langEditor.setValue(codeMap[language])
    }
    
    // 显示语言信息
    if (langInfo) {
      const canFormat = supportsFormatting(language)
      langInfo.textContent = `支持格式化: ${canFormat ? '✅' : '❌'}`
    }
  })

  // 3. 高级编辑功能演示
  const featuresDemo = document.createElement('section')
  featuresDemo.className = 'demo-section'
  featuresDemo.innerHTML = `
    <h2>⚡ 高级编辑功能</h2>
    <div class="controls">
      <button id="enableMultiCursor">启用多光标</button>
      <button id="enableBrackets">智能括号</button>
      <button id="enableFolding">代码折叠增强</button>
      <button id="enableMinimap">迷你地图</button>
      <button id="showStats">显示统计</button>
    </div>
    <div id="featuresEditor" class="editor-container"></div>
    <div id="statsDisplay"></div>
  `
  document.querySelector('main')?.appendChild(featuresDemo)

  const featuresEditor = createEnhancedCodeEditor('#featuresEditor', {
    value: `// 高级编辑功能演示
// 1. 多光标：按住 Alt 点击不同位置
// 2. 括号匹配：查看彩虹括号
// 3. 代码折叠：点击行号旁的折叠图标
// 4. 智能选择：Shift+Alt+右箭头 扩展选择

function complexFunction() {
    const array = [1, 2, 3, 4, 5];
    
    const result = array
        .filter(n => n > 2)
        .map(n => n * 2)
        .reduce((acc, val) => acc + val, 0);
    
    const nested = {
        level1: {
            level2: {
                level3: {
                    value: "深层嵌套"
                }
            }
        }
    };
    
    return { result, nested };
}`,
    language: 'javascript',
    theme: 'one-dark',
    features: {
      multiCursor: true,
      bracketMatching: true,
      folding: true,
      minimap: true,
      find: true,
      smartSelect: true,
      columnSelection: true
    }
  })

  const featureManager = featuresEditor.getFeatureManager()
  
  document.getElementById('enableMultiCursor')?.addEventListener('click', () => {
    featureManager.enableMultiCursor()
    alert('多光标已启用！按住 Alt 键点击不同位置添加光标')
  })

  document.getElementById('enableBrackets')?.addEventListener('click', () => {
    featureManager.enableSmartBrackets()
    alert('智能括号已启用！')
  })

  document.getElementById('enableFolding')?.addEventListener('click', () => {
    featureManager.enhanceFolding()
    alert('代码折叠增强已启用！')
  })

  document.getElementById('enableMinimap')?.addEventListener('click', () => {
    featureManager.enhanceMinimap()
    alert('迷你地图已增强！')
  })

  document.getElementById('showStats')?.addEventListener('click', () => {
    const stats = featuresEditor.getStats()
    const statsDisplay = document.getElementById('statsDisplay')
    if (statsDisplay) {
      statsDisplay.innerHTML = `
        <div style="padding: 10px; background: #f0f0f0; border-radius: 4px; margin-top: 10px;">
          <strong>编辑器统计：</strong><br>
          行数: ${stats.lineCount}<br>
          单词数: ${stats.wordCount}<br>
          字符数: ${stats.characterCount}<br>
          选择数: ${stats.selectionCount}
        </div>
      `
    }
  })

  // 4. Diff 编辑器演示
  const diffDemo = document.createElement('section')
  diffDemo.className = 'demo-section'
  diffDemo.innerHTML = `
    <h2>🔍 代码对比（Diff 编辑器）</h2>
    <div class="controls">
      <button id="toggleDiffView">切换视图模式</button>
    </div>
    <div id="diffEditor" class="editor-container" style="height: 400px;"></div>
  `
  document.querySelector('main')?.appendChild(diffDemo)

  const originalCode = `function oldVersion() {
    var x = 1;
    var y = 2;
    return x + y;
}`

  const modifiedCode = `function newVersion() {
    const x = 1;
    const y = 2;
    const z = 3;
    return x + y + z;
}`

  // 创建一个临时编辑器来获取 Diff 功能
  const tempEditor = createEnhancedCodeEditor('#diffEditor', {
    value: '',
    language: 'javascript',
    theme: 'vs-dark'
  })
  
  // 使用 createDiffEditor 方法
  const diffContainer = document.getElementById('diffEditor')
  if (diffContainer) {
    const diffEditor = tempEditor.createDiffEditor(
      diffContainer,
      originalCode,
      modifiedCode,
      'javascript'
    )
  }

  // 5. 性能优化演示
  const perfDemo = document.createElement('section')
  perfDemo.className = 'demo-section'
  perfDemo.innerHTML = `
    <h2>🚀 性能优化</h2>
    <p>大文件优化、虚拟滚动、语法高亮缓存</p>
    <div class="controls">
      <button id="loadLargeFile">加载大文件（1000行）</button>
      <label>
        <input type="checkbox" id="perfOptimization" checked>
        启用性能优化
      </label>
    </div>
    <div id="perfEditor" class="editor-container"></div>
  `
  document.querySelector('main')?.appendChild(perfDemo)

  const perfEditor = createEnhancedCodeEditor('#perfEditor', {
    value: '// 点击"加载大文件"按钮测试性能优化',
    language: 'javascript',
    theme: 'vs-dark',
    performance: {
      largeFileOptimizations: true,
      largeFileThreshold: 10000,
      virtualScrolling: true,
      syntaxHighlightCache: true
    }
  })

  document.getElementById('loadLargeFile')?.addEventListener('click', () => {
    const lines = []
    for (let i = 1; i <= 1000; i++) {
      lines.push(`// Line ${i}`)
      lines.push(`function function_${i}() {`)
      lines.push(`    console.log("This is function ${i}");`)
      lines.push(`    return ${i} * ${i};`)
      lines.push(`}`)
      lines.push('')
    }
    perfEditor.setValue(lines.join('\n'))
    alert('已加载 1000 行代码，性能优化已自动应用')
  })

  // 6. 自动检测文件类型
  const autoDetectDemo = document.createElement('section')
  autoDetectDemo.className = 'demo-section'
  autoDetectDemo.innerHTML = `
    <h2>🔮 智能语言检测</h2>
    <div class="controls">
      <input type="text" id="filenameInput" placeholder="输入文件名，如: app.vue, main.tsx" style="width: 200px;">
      <button id="detectLanguage">检测语言</button>
      <span id="detectedLang"></span>
    </div>
    <div id="autoDetectEditor" class="editor-container"></div>
  `
  document.querySelector('main')?.appendChild(autoDetectDemo)

  const autoDetectEditor = createEnhancedCodeEditor('#autoDetectEditor', {
    value: '// 输入文件名，自动检测并设置对应的语言高亮',
    language: 'javascript',
    theme: 'github-dark'
  })

  document.getElementById('detectLanguage')?.addEventListener('click', () => {
    const filename = (document.getElementById('filenameInput') as HTMLInputElement).value
    if (filename) {
      autoDetectEditor.setLanguageByFilename(filename)
      const detectedLang = getLanguageByExtension(filename)
      const detectedLangSpan = document.getElementById('detectedLang')
      if (detectedLangSpan) {
        detectedLangSpan.textContent = `检测到: ${detectedLang}`
      }
    }
  })

  console.log('✅ 高级功能演示已加载')
}

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdvancedDemo)
} else {
  initAdvancedDemo()
}