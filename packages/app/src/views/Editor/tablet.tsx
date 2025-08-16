import { useDeviceRoute, useRouter } from '@ldesign/router'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'EditorTablet',
  setup() {
    const router = useRouter()
    const { currentDeviceName } = useDeviceRoute()
    const content = ref(
      '# 平板端编辑器\n\n专为平板设备优化的编辑体验。\n\n## 特性\n- 触摸友好的界面\n- 简化的工具栏\n- 快速预览切换',
    )
    const showPreview = ref(false)

    const handleGoBack = () => {
      router.push('/')
    }

    const handleSave = () => {
      console.log('保存内容:', content.value)
      alert('内容已保存！')
    }

    const togglePreview = () => {
      showPreview.value = !showPreview.value
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
            padding: '16px 24px',
            borderBottom: '1px solid #4a5568',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                margin: '0',
                fontWeight: '600',
              }}
            >
              ✏️ 平板端编辑器
            </h1>
            <span
              style={{
                fontSize: '14px',
                opacity: 0.7,
              }}
            >
              {currentDeviceName}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleSave}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                backgroundColor: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '100px',
              }}
            >
              💾 保存
            </button>
            <button
              onClick={togglePreview}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                backgroundColor: showPreview.value ? '#e53e3e' : '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '100px',
              }}
            >
              {showPreview.value ? '📝 编辑' : '👁️ 预览'}
            </button>
            <button
              onClick={handleGoBack}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                backgroundColor: '#718096',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '100px',
              }}
            >
              ← 返回
            </button>
          </div>
        </div>

        {/* 编辑/预览区域 */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!showPreview.value ? (
            // 编辑模式
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  color: '#e2e8f0',
                }}
              >
                📝 Markdown 编辑
              </h3>
              <textarea
                value={content.value}
                onInput={e =>
                  (content.value = (e.target as HTMLTextAreaElement).value)}
                style={{
                  flex: 1,
                  background: '#2d3748',
                  color: '#e2e8f0',
                  border: '2px solid #4a5568',
                  borderRadius: '12px',
                  padding: '20px',
                  fontSize: '16px',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: '1.6',
                }}
                placeholder="在此输入 Markdown 内容..."
              />
            </div>
          ) : (
            // 预览模式
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  color: '#e2e8f0',
                }}
              >
                👁️ 预览效果
              </h3>
              <div
                style={{
                  flex: 1,
                  background: '#2d3748',
                  border: '2px solid #4a5568',
                  borderRadius: '12px',
                  padding: '20px',
                  overflow: 'auto',
                }}
              >
                <div
                  style={{
                    color: '#e2e8f0',
                    lineHeight: '1.8',
                    fontSize: '16px',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: content.value
                      .replace(
                        /^# (.*$)/gm,
                        '<h1 style="color: #63b3ed; margin: 20px 0 12px 0; font-size: 28px;">$1</h1>',
                      )
                      .replace(
                        /^## (.*$)/gm,
                        '<h2 style="color: #68d391; margin: 16px 0 8px 0; font-size: 22px;">$1</h2>',
                      )
                      .replace(
                        /^- (.*$)/gm,
                        '<li style="margin: 8px 0; font-size: 16px;">$1</li>',
                      )
                      .replace(/\n/g, '<br>'),
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 状态栏 */}
        <div
          style={{
            background: '#2d3748',
            padding: '12px 24px',
            borderTop: '1px solid #4a5568',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: '#a0aec0',
          }}
        >
          <div>
            字符:
            {' '}
            {content.value.length}
            {' '}
            | 行:
            {' '}
            {content.value.split('\n').length}
          </div>
          <div>
            {showPreview.value ? '预览模式' : '编辑模式'}
            {' '}
            - 平板优化
          </div>
        </div>

        {/* 平板端提示 */}
        <div
          style={{
            background: 'rgba(72, 187, 120, 0.1)',
            border: '1px solid rgba(72, 187, 120, 0.3)',
            padding: '12px 24px',
            color: '#68d391',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          💡 平板端编辑器：支持触摸操作，编辑和预览模式快速切换
        </div>
      </div>
    )
  },
})
