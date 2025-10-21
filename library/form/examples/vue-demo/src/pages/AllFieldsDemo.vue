<template>
  <div class="all-fields-demo">
    <div class="demo-grid">
      <!-- InputField -->
      <div class="field-card">
        <h3>📝 InputField - 输入框</h3>
        <p class="field-desc">支持文本、数字、密码等多种输入类型</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>文本输入</label>
            <InputField
              v-model="inputValue"
              placeholder="请输入文本"
              clearable
            />
          </div>

          <div class="example-item">
            <label>带字符计数</label>
            <InputField
              v-model="inputWithCount"
              placeholder="最多20个字符"
              showCount
              :maxLength="20"
            />
          </div>

          <div class="example-item">
            <label>密码输入</label>
            <InputField
              v-model="password"
              type="password"
              placeholder="请输入密码"
              showPasswordToggle
            />
          </div>
        </div>

        <div class="value-display">
          当前值: <strong>{{ inputValue || '-' }}</strong>
        </div>
      </div>

      <!-- TextareaField -->
      <div class="field-card">
        <h3>📄 TextareaField - 多行文本</h3>
        <p class="field-desc">支持自动高度调整和字符计数</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>多行文本</label>
            <TextareaField
              v-model="textarea"
              placeholder="请输入多行文本"
              :autosize="{ minRows: 3, maxRows: 6 }"
              showCount
              :maxLength="200"
            />
          </div>
        </div>

        <div class="value-display">
          字符数: <strong>{{ textarea?.length || 0 }}</strong>
        </div>
      </div>

      <!-- SelectField -->
      <div class="field-card">
        <h3>🔽 SelectField - 下拉选择</h3>
        <p class="field-desc">支持单选、多选和搜索</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>单选</label>
            <SelectField
              v-model="selectValue"
              :options="selectOptions"
              placeholder="请选择"
              filterable
            />
          </div>

          <div class="example-item">
            <label>多选</label>
            <SelectField
              v-model="multiSelect"
              :options="selectOptions"
              multiple
              placeholder="可选择多项"
            />
          </div>
        </div>

        <div class="value-display">
          选中: <strong>{{ selectValue || '-' }}</strong>
        </div>
      </div>

      <!-- RadioField -->
      <div class="field-card">
        <h3>⭕ RadioField - 单选按钮</h3>
        <p class="field-desc">单选按钮组</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>水平布局</label>
            <RadioField
              v-model="radio"
              :options="radioOptions"
            />
          </div>

          <div class="example-item">
            <label>按钮样式</label>
            <RadioField
              v-model="radioButton"
              :options="sizeOptions"
              buttonStyle
            />
          </div>
        </div>

        <div class="value-display">
          选中: <strong>{{ radio || '-' }}</strong>
        </div>
      </div>

      <!-- CheckboxField -->
      <div class="field-card">
        <h3>☑️ CheckboxField - 复选框</h3>
        <p class="field-desc">复选框组，支持全选</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>兴趣爱好</label>
            <CheckboxField
              v-model="checkboxes"
              :options="hobbyOptions"
              showCheckAll
            />
          </div>
        </div>

        <div class="value-display">
          选中: <strong>{{ checkboxes.join(', ') || '-' }}</strong>
        </div>
      </div>

      <!-- DatePickerField -->
      <div class="field-card">
        <h3>📅 DatePickerField - 日期选择</h3>
        <p class="field-desc">日期选择器</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>选择日期</label>
            <DatePickerField
              v-model="date"
              placeholder="请选择日期"
              clearable
            />
          </div>
        </div>

        <div class="value-display">
          选中: <strong>{{ date || '-' }}</strong>
        </div>
      </div>

      <!-- TimePickerField -->
      <div class="field-card">
        <h3>🕐 TimePickerField - 时间选择</h3>
        <p class="field-desc">时间选择器</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>选择时间</label>
            <TimePickerField
              v-model="time"
              placeholder="请选择时间"
              :showSecond="false"
            />
          </div>
        </div>

        <div class="value-display">
          选中: <strong>{{ time || '-' }}</strong>
        </div>
      </div>

      <!-- CascaderField -->
      <div class="field-card">
        <h3>🔗 CascaderField - 级联选择</h3>
        <p class="field-desc">多级联动选择</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>省市区选择</label>
            <CascaderField
              v-model="cascader"
              :options="cascaderOptions"
              placeholder="请选择省/市/区"
            />
          </div>
        </div>

        <div class="value-display">
          选中: <strong>{{ cascader.join(' / ') || '-' }}</strong>
        </div>
      </div>

      <!-- SwitchField -->
      <div class="field-card">
        <h3>🔘 SwitchField - 开关</h3>
        <p class="field-desc">开关组件</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>启用状态</label>
            <SwitchField
              v-model="switchValue"
              checkedChildren="开启"
              uncheckedChildren="关闭"
            />
          </div>
        </div>

        <div class="value-display">
          状态: <strong>{{ switchValue ? '开启' : '关闭' }}</strong>
        </div>
      </div>

      <!-- SliderField -->
      <div class="field-card">
        <h3>🎚️ SliderField - 滑块</h3>
        <p class="field-desc">滑块组件</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>音量 ({{ sliderValue}})</label>
            <SliderField
              v-model="sliderValue"
              :min="0"
              :max="100"
              showTooltip
            />
          </div>
        </div>

        <div class="value-display">
          当前值: <strong>{{ sliderValue }}</strong>
        </div>
      </div>

      <!-- RateField -->
      <div class="field-card">
        <h3>⭐ RateField - 评分</h3>
        <p class="field-desc">星星评分组件</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>满意度</label>
            <RateField
              v-model="rating"
              :count="5"
              showText
              :texts="['极差', '失望', '一般', '满意', '惊喜']"
            />
          </div>
        </div>

        <div class="value-display">
          评分: <strong>{{ rating }} 星</strong>
        </div>
      </div>

      <!-- ColorPickerField -->
      <div class="field-card">
        <h3>🎨 ColorPickerField - 颜色选择</h3>
        <p class="field-desc">颜色选择器</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>主题颜色</label>
            <ColorPickerField
              v-model="color"
              :presetColors="presetColors"
            />
          </div>
        </div>

        <div class="value-display">
          选中: <strong :style="{ color }">{{ color }}</strong>
        </div>
      </div>

      <!-- UploadField -->
      <div class="field-card">
        <h3>📤 UploadField - 文件上传</h3>
        <p class="field-desc">文件上传组件</p>
        
        <div class="field-examples">
          <div class="example-item">
            <label>图片上传</label>
            <UploadField
              v-model="files"
              accept="image/*"
              listType="picture"
              :maxCount="3"
              :maxSize="5 * 1024 * 1024"
              tip="支持 JPG、PNG，最多3张，单张不超过5MB"
            />
          </div>
        </div>

        <div class="value-display">
          已上传: <strong>{{ files.length }} 个文件</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  InputField,
  TextareaField,
  SelectField,
  RadioField,
  CheckboxField,
  DatePickerField,
  TimePickerField,
  CascaderField,
  SwitchField,
  SliderField,
  RateField,
  ColorPickerField,
  UploadField
} from '../../../src/adapters/vue/components/fields'

// 字段值
const inputValue = ref('')
const inputWithCount = ref('')
const password = ref('')
const textarea = ref('')
const selectValue = ref('')
const multiSelect = ref([])
const radio = ref('')
const radioButton = ref('medium')
const checkboxes = ref([])
const date = ref('')
const time = ref('')
const cascader = ref([])
const switchValue = ref(false)
const sliderValue = ref(50)
const rating = ref(0)
const color = ref('#722ED1')
const files = ref([])

// 选项数据
const selectOptions = [
  { label: '选项 1', value: 'option1' },
  { label: '选项 2', value: 'option2' },
  { label: '选项 3', value: 'option3' }
]

const radioOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' }
]

const sizeOptions = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' }
]

const hobbyOptions = [
  { label: '阅读', value: 'reading' },
  { label: '运动', value: 'sports' },
  { label: '音乐', value: 'music' },
  { label: '旅行', value: 'travel' }
]

const cascaderOptions = [
  {
    label: '北京市',
    value: 'beijing',
    children: [
      { label: '东城区', value: 'dongcheng' },
      { label: '西城区', value: 'xicheng' }
    ]
  },
  {
    label: '上海市',
    value: 'shanghai',
    children: [
      { label: '黄浦区', value: 'huangpu' },
      { label: '徐汇区', value: 'xuhui' }
    ]
  }
]

const presetColors = ['#722ED1', '#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#13c2c2']
</script>

<style scoped>
.all-fields-demo {
  max-width: 1400px;
  margin: 0 auto;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.field-card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.field-card h3 {
  font-size: 16px;
  margin-bottom: 4px;
  color: rgba(0, 0, 0, 0.85);
}

.field-desc {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 20px;
}

.field-examples {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.example-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.value-display {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.value-display strong {
  color: #722ED1;
}
</style>



