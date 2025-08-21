<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { computed, onMounted, ref } from 'vue'

// 使用 I18n
const { locale, availableLanguages, changeLanguage, i18n } = useI18n()

// 响应式数据
const userName = ref('LDesign User')
const itemCount = ref(5)
const batchResult = ref<any>(null)
const performanceMetrics = ref<any>(null)
const optimizationSuggestions = ref<string[]>([])

// 计算属性
const currentLanguage = computed(() => locale.value)
const currentDate = computed(() => new Date().toLocaleDateString())

// 方法
async function switchLanguage(langCode: string) {
  try {
    await changeLanguage(langCode)
    console.log('Language switched to:', langCode)
  }
  catch (error) {
    console.error('Failed to switch language:', error)
  }
}

function performBatchTranslation() {
  const keys = [
    'common.ok',
    'common.cancel',
    'common.save',
    'common.delete',
    'common.edit',
  ]

  batchResult.value = i18n.batchTranslate(keys)
  console.log('Batch translation result:', batchResult.value)
}

function refreshMetrics() {
  performanceMetrics.value = i18n?.getPerformanceMetrics?.() || null
  optimizationSuggestions.value = i18n?.getOptimizationSuggestions?.() || []
  console.log('Performance metrics:', performanceMetrics.value)
  console.log('Optimization suggestions:', optimizationSuggestions.value)
}

// 生命周期
onMounted(() => {
  // 初始化时获取性能指标
  refreshMetrics()

  // 执行一次批量翻译演示
  performBatchTranslation()
})
</script>

<template>
  <div class="i18n-demo">
    <div class="demo-header">
      <h1>{{ $t('i18n.title') }}</h1>
      <p class="subtitle">
        {{ $t('i18n.subtitle') }}
      </p>
    </div>

    <!-- 语言切换器 -->
    <div class="language-switcher">
      <h3>{{ $t('i18n.currentLanguage') }}: {{ currentLanguage }}</h3>
      <div class="language-buttons">
        <button
          v-for="lang in availableLanguages"
          :key="lang.code"
          :class="{ active: lang.code === currentLanguage }"
          @click="switchLanguage(lang.code)"
        >
          {{ lang.flag || '🌐' }} {{ lang.nativeName }}
        </button>
      </div>
    </div>

    <!-- 功能演示 -->
    <div class="demo-sections">
      <!-- 基础翻译 -->
      <section class="demo-section">
        <h3>{{ $t('i18n.examples.basic.title') }}</h3>
        <p>{{ $t('i18n.examples.basic.description') }}</p>
        <div class="example-box">
          <div class="example-item">
            <strong>{{ $t('common.ok') }}</strong>
          </div>
          <div class="example-item">
            <strong>{{ $t('common.cancel') }}</strong>
          </div>
          <div class="example-item">
            <strong>{{ $t('common.save') }}</strong>
          </div>
        </div>
      </section>

      <!-- 插值翻译 -->
      <section class="demo-section">
        <h3>{{ $t('i18n.examples.interpolation.title') }}</h3>
        <div class="example-box">
          <div class="example-item">
            {{ $t('i18n.examples.interpolation.welcome', { name: userName }) }}
          </div>
          <div class="example-item">
            {{
              $t('i18n.examples.interpolation.greeting', {
                name: userName,
                date: currentDate,
              })
            }}
          </div>
          <div class="input-group">
            <label>{{ $t('common.edit') }} Name:</label>
            <input v-model="userName" type="text">
          </div>
        </div>
      </section>

      <!-- 复数处理 -->
      <section class="demo-section">
        <h3>{{ $t('i18n.examples.pluralization.title') }}</h3>
        <div class="example-box">
          <div class="example-item">
            {{
              $t('i18n.examples.pluralization.itemCount', { count: itemCount })
            }}
          </div>
          <div class="input-group">
            <label>{{ $t('common.edit') }} Count:</label>
            <input v-model.number="itemCount" type="number" min="0">
          </div>
        </div>
      </section>

      <!-- 批量翻译 -->
      <section class="demo-section">
        <h3>{{ $t('i18n.examples.batch.title') }}</h3>
        <p>{{ $t('i18n.examples.batch.description') }}</p>
        <div class="example-box">
          <button class="batch-btn" @click="performBatchTranslation">
            {{ $t('common.refresh') }} {{ $t('i18n.examples.batch.title') }}
          </button>
          <div v-if="batchResult" class="batch-result">
            <h4>{{ $t('common.success') }}:</h4>
            <ul>
              <li v-for="(value, key) in batchResult.translations" :key="key">
                <strong>{{ key }}:</strong> {{ value }}
              </li>
            </ul>
            <p>
              {{ $t('performance.metrics.translationCalls') }}:
              {{ batchResult.successCount }}
            </p>
          </div>
        </div>
      </section>

      <!-- 性能监控 -->
      <section class="demo-section">
        <h3>{{ $t('performance.title') }}</h3>
        <div class="example-box">
          <button class="metrics-btn" @click="refreshMetrics">
            {{ $t('performance.refresh') }}
          </button>
          <div v-if="performanceMetrics" class="metrics-display">
            <div class="metric-item">
              <span>{{ $t('performance.metrics.translationCalls') }}:</span>
              <strong>{{ performanceMetrics.translationCalls }}</strong>
            </div>
            <div class="metric-item">
              <span>{{ $t('performance.metrics.averageTime') }}:</span>
              <strong>{{
                performanceMetrics.averageTranslationTime.toFixed(3)
              }}ms</strong>
            </div>
            <div class="metric-item">
              <span>{{ $t('performance.metrics.cacheHitRate') }}:</span>
              <strong>{{
                (performanceMetrics.cacheHitRate * 100).toFixed(1)
              }}%</strong>
            </div>
          </div>

          <div v-if="optimizationSuggestions.length > 0" class="suggestions">
            <h4>{{ $t('performance.optimization.title') }}:</h4>
            <ul>
              <li
                v-for="suggestion in optimizationSuggestions"
                :key="suggestion"
              >
                💡 {{ suggestion }}
              </li>
            </ul>
          </div>
          <div v-else class="no-suggestions">
            ✅ {{ $t('performance.optimization.noSuggestions') }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="less">
.i18n-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .demo-header {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #7f8c8d;
      font-size: 18px;
    }
  }

  .language-switcher {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;

    h3 {
      margin-bottom: 15px;
      color: #2c3e50;
    }

    .language-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      button {
        padding: 8px 16px;
        border: 2px solid #e9ecef;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: #007bff;
          background: #f8f9ff;
        }

        &.active {
          border-color: #007bff;
          background: #007bff;
          color: white;
        }
      }
    }
  }

  .demo-sections {
    display: grid;
    gap: 30px;

    .demo-section {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      h3 {
        color: #2c3e50;
        margin-bottom: 15px;
        border-bottom: 2px solid #007bff;
        padding-bottom: 8px;
      }

      .example-box {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 6px;
        margin-top: 15px;

        .example-item {
          padding: 10px;
          margin-bottom: 10px;
          background: white;
          border-radius: 4px;
          border-left: 4px solid #007bff;
        }

        .input-group {
          margin-top: 15px;

          label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
          }

          input {
            width: 100%;
            max-width: 300px;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }
        }

        .batch-btn,
        .metrics-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s ease;

          &:hover {
            background: #0056b3;
          }
        }

        .batch-result {
          margin-top: 20px;

          h4 {
            color: #28a745;
            margin-bottom: 10px;
          }

          ul {
            list-style: none;
            padding: 0;

            li {
              padding: 5px 0;
              border-bottom: 1px solid #eee;

              &:last-child {
                border-bottom: none;
              }
            }
          }
        }

        .metrics-display {
          margin-top: 20px;

          .metric-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;

            &:last-child {
              border-bottom: none;
            }
          }
        }

        .suggestions {
          margin-top: 20px;

          h4 {
            color: #ffc107;
            margin-bottom: 10px;
          }

          ul {
            list-style: none;
            padding: 0;

            li {
              padding: 5px 0;
              color: #856404;
            }
          }
        }

        .no-suggestions {
          margin-top: 20px;
          color: #28a745;
          font-weight: 500;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .i18n-demo {
    padding: 15px;

    .language-switcher .language-buttons {
      justify-content: center;
    }

    .demo-sections .demo-section {
      padding: 20px;
    }
  }
}
</style>
