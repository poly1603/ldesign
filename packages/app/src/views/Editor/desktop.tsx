import { useDeviceRoute, useRouter } from '@ldesign/router'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'EditorDesktop',
  setup() {
    const router = useRouter()
    const { currentDeviceName } = useDeviceRoute()
    const content = ref(
      '# 欢迎使用桌面端编辑器\n\n这是一个功能完整的编辑器，专为桌面设备优化。\n\n## 特性\n- 完整的键盘快捷键支持\n- 多窗口编辑\n- 高级语法高亮\n- 实时预览'
    )

    const handleGoBack = () => {
      router.push('/')
    }

    const handleSave = () => {
      console.log('保存内容:', content.value)
      alert('内容已保存！')
    }

    const handleExport = () => {
      const blob = new Blob([content.value], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.md'
      a.click()
      URL.revokeObjectURL(url)
    }

    return () => (
      <div
        style={{
          minHeight: '100vh',
          background: '#1a202c',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 工具栏 */}
        <div
          style={{
            background: '#2d3748',
            padding: '12px 24px',
            borderBottom: '1px solid #4a5568',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1
              style={{
                fontSize: '20px',
                margin: '0',
                fontWeight: '600',
              }}
            >
              ✏️ 桌面端编辑器
            </h1>
            <span
              style={{
                fontSize: '14px',
                opacity: 0.7,
              }}
            >
              设备: {currentDeviceName}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              💾 保存
            </button>
            <button
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              📤 导出
            </button>
            <button
              onClick={handleGoBack}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#718096',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ← 返回
            </button>
          </div>
        </div>

        {/* 编辑区域 */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            background: '#4a5568',
          }}
        >
          {/* 编辑器 */}
          <div
            style={{
              background: '#2d3748',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                color: '#e2e8f0',
              }}
            >
              Markdown 编辑器
            </h3>
            <textarea
              value={content.value}
              onInput={e =>
                (content.value = (e.target as HTMLTextAreaElement).value)
              }
              style={{
                flex: 1,
                background: '#1a202c',
                color: '#e2e8f0',
                border: '1px solid #4a5568',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                resize: 'none',
                outline: 'none',
              }}
              placeholder='在此输入 Markdown 内容...'
            />
          </div>

          {/* 预览 */}
          <div
            style={{
              background: '#2d3748',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                color: '#e2e8f0',
              }}
            >
              实时预览
            </h3>
            <div
              style={{
                flex: 1,
                background: '#1a202c',
                border: '1px solid #4a5568',
                borderRadius: '8px',
                padding: '16px',
                overflow: 'auto',
              }}
            >
              <div
                style={{
                  color: '#e2e8f0',
                  lineHeight: '1.6',
                  fontSize: '14px',
                }}
                dangerouslySetInnerHTML={{
                  __html: content.value
                    .replace(
                      /^# (.*$)/gm,
                      '<h1 style="color: #63b3ed; margin: 16px 0 8px 0;">$1</h1>'
                    )
                    .replace(
                      /^## (.*$)/gm,
                      '<h2 style="color: #68d391; margin: 12px 0 6px 0;">$1</h2>'
                    )
                    .replace(/^- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>')
                    .replace(/\n/g, '<br>'),
                }}
              />
            </div>
          </div>
        </div>

        {/* 状态栏 */}
        <div
          style={{
            background: '#2d3748',
            padding: '8px 24px',
            borderTop: '1px solid #4a5568',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#a0aec0',
          }}
        >
          <div>
            字符数: {content.value.length} | 行数:{' '}
            {content.value.split('\n').length}
          </div>
          <div>桌面端编辑器 - 支持完整功能</div>
        </div>
      </div>
    )
  },
})
