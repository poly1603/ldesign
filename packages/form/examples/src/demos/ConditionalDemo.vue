<!--
条件渲染演示 - 展示字段联动和条件显示
-->

<template>
  <div class="conditional-demo">
    <div class="demo-header">
      <h2>🔄 条件渲染演示</h2>
      <p>LemonForm 支持强大的条件渲染功能，可以根据其他字段的值动态显示或隐藏字段。</p>
    </div>

    <div class="demo-content">
      <div class="form-section">
        <h3>🎯 基础条件渲染</h3>
        <p>根据用户类型显示不同的字段</p>
        
        <div class="conditional-form">
          <FormField
            :field="{
              type: 'radio',
              name: 'userType',
              label: '用户类型',
              props: {
                options: [
                  { label: '个人用户', value: 'personal' },
                  { label: '企业用户', value: 'business' },
                  { label: '学生用户', value: 'student' }
                ]
              }
            }"
            :value="formData.userType"
            @update:value="formData.userType = $event"
          />

          <!-- 个人用户字段 -->
          <template v-if="formData.userType === 'personal'">
            <FormField
              :field="{
                type: 'input',
                name: 'realName',
                label: '真实姓名',
                placeholder: '请输入真实姓名',
                required: true
              }"
              :value="formData.realName"
              @update:value="formData.realName = $event"
            />
            
            <FormField
              :field="{
                type: 'input',
                name: 'idCard',
                label: '身份证号',
                placeholder: '请输入身份证号',
                required: true
              }"
              :value="formData.idCard"
              @update:value="formData.idCard = $event"
            />
          </template>

          <!-- 企业用户字段 -->
          <template v-if="formData.userType === 'business'">
            <FormField
              :field="{
                type: 'input',
                name: 'companyName',
                label: '公司名称',
                placeholder: '请输入公司名称',
                required: true
              }"
              :value="formData.companyName"
              @update:value="formData.companyName = $event"
            />
            
            <FormField
              :field="{
                type: 'input',
                name: 'businessLicense',
                label: '营业执照号',
                placeholder: '请输入营业执照号',
                required: true
              }"
              :value="formData.businessLicense"
              @update:value="formData.businessLicense = $event"
            />
            
            <FormField
              :field="{
                type: 'input',
                name: 'contactPerson',
                label: '联系人',
                placeholder: '请输入联系人姓名',
                required: true
              }"
              :value="formData.contactPerson"
              @update:value="formData.contactPerson = $event"
            />
          </template>

          <!-- 学生用户字段 -->
          <template v-if="formData.userType === 'student'">
            <FormField
              :field="{
                type: 'input',
                name: 'studentName',
                label: '学生姓名',
                placeholder: '请输入学生姓名',
                required: true
              }"
              :value="formData.studentName"
              @update:value="formData.studentName = $event"
            />
            
            <FormField
              :field="{
                type: 'input',
                name: 'school',
                label: '学校名称',
                placeholder: '请输入学校名称',
                required: true
              }"
              :value="formData.school"
              @update:value="formData.school = $event"
            />
            
            <FormField
              :field="{
                type: 'input',
                name: 'studentId',
                label: '学号',
                placeholder: '请输入学号',
                required: true
              }"
              :value="formData.studentId"
              @update:value="formData.studentId = $event"
            />
          </template>
        </div>
      </div>

      <!-- 复杂条件演示 -->
      <div class="form-section">
        <h3>🎛️ 复杂条件演示</h3>
        <p>多级联动和复杂条件判断</p>
        
        <div class="conditional-form">
          <FormField
            :field="{
              type: 'switch',
              name: 'hasAddress',
              label: '需要邮寄地址'
            }"
            :value="formData.hasAddress"
            @update:value="formData.hasAddress = $event"
          />

          <template v-if="formData.hasAddress">
            <FormField
              :field="{
                type: 'select',
                name: 'country',
                label: '国家/地区',
                placeholder: '请选择国家',
                props: {
                  options: [
                    { label: '中国', value: 'china' },
                    { label: '美国', value: 'usa' },
                    { label: '其他', value: 'other' }
                  ]
                }
              }"
              :value="formData.country"
              @update:value="formData.country = $event"
            />

            <!-- 中国地址 -->
            <template v-if="formData.country === 'china'">
              <FormField
                :field="{
                  type: 'select',
                  name: 'province',
                  label: '省份',
                  placeholder: '请选择省份',
                  props: {
                    options: [
                      { label: '北京市', value: 'beijing' },
                      { label: '上海市', value: 'shanghai' },
                      { label: '广东省', value: 'guangdong' },
                      { label: '浙江省', value: 'zhejiang' }
                    ]
                  }
                }"
                :value="formData.province"
                @update:value="formData.province = $event"
              />

              <FormField
                :field="{
                  type: 'select',
                  name: 'city',
                  label: '城市',
                  placeholder: '请选择城市',
                  props: {
                    options: getCityOptions(formData.province)
                  }
                }"
                :value="formData.city"
                @update:value="formData.city = $event"
              />
            </template>

            <!-- 美国地址 -->
            <template v-if="formData.country === 'usa'">
              <FormField
                :field="{
                  type: 'input',
                  name: 'state',
                  label: '州',
                  placeholder: '请输入州名'
                }"
                :value="formData.state"
                @update:value="formData.state = $event"
              />

              <FormField
                :field="{
                  type: 'input',
                  name: 'zipCode',
                  label: '邮编',
                  placeholder: '请输入邮编'
                }"
                :value="formData.zipCode"
                @update:value="formData.zipCode = $event"
              />
            </template>

            <!-- 其他国家地址 -->
            <template v-if="formData.country === 'other'">
              <FormField
                :field="{
                  type: 'input',
                  name: 'countryName',
                  label: '国家名称',
                  placeholder: '请输入国家名称'
                }"
                :value="formData.countryName"
                @update:value="formData.countryName = $event"
              />
            </template>

            <!-- 通用地址字段 -->
            <FormField
              :field="{
                type: 'textarea',
                name: 'detailAddress',
                label: '详细地址',
                placeholder: '请输入详细地址',
                props: { rows: 3 }
              }"
              :value="formData.detailAddress"
              @update:value="formData.detailAddress = $event"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- 表单数据展示 -->
    <div class="data-display">
      <h3>📊 当前表单数据</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import FormField from '../components/FormField.vue'

// 表单数据
const formData = reactive({
  userType: '',
  realName: '',
  idCard: '',
  companyName: '',
  businessLicense: '',
  contactPerson: '',
  studentName: '',
  school: '',
  studentId: '',
  hasAddress: false,
  country: '',
  province: '',
  city: '',
  state: '',
  zipCode: '',
  countryName: '',
  detailAddress: ''
})

// 城市选项映射
const cityOptions = {
  beijing: [
    { label: '东城区', value: 'dongcheng' },
    { label: '西城区', value: 'xicheng' },
    { label: '朝阳区', value: 'chaoyang' },
    { label: '海淀区', value: 'haidian' }
  ],
  shanghai: [
    { label: '黄浦区', value: 'huangpu' },
    { label: '徐汇区', value: 'xuhui' },
    { label: '长宁区', value: 'changning' },
    { label: '静安区', value: 'jingan' }
  ],
  guangdong: [
    { label: '广州市', value: 'guangzhou' },
    { label: '深圳市', value: 'shenzhen' },
    { label: '珠海市', value: 'zhuhai' },
    { label: '佛山市', value: 'foshan' }
  ],
  zhejiang: [
    { label: '杭州市', value: 'hangzhou' },
    { label: '宁波市', value: 'ningbo' },
    { label: '温州市', value: 'wenzhou' },
    { label: '嘉兴市', value: 'jiaxing' }
  ]
}

// 获取城市选项
const getCityOptions = (province: string) => {
  return cityOptions[province as keyof typeof cityOptions] || []
}

// 监听省份变化，清空城市选择
watch(() => formData.province, () => {
  formData.city = ''
})

// 监听国家变化，清空相关字段
watch(() => formData.country, () => {
  formData.province = ''
  formData.city = ''
  formData.state = ''
  formData.zipCode = ''
  formData.countryName = ''
})

// 监听用户类型变化，清空相关字段
watch(() => formData.userType, () => {
  formData.realName = ''
  formData.idCard = ''
  formData.companyName = ''
  formData.businessLicense = ''
  formData.contactPerson = ''
  formData.studentName = ''
  formData.school = ''
  formData.studentId = ''
})
</script>

<style scoped>
.conditional-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
}

.demo-header p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 30px;
}

.form-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.3rem;
}

.form-section p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 0.95rem;
}

.conditional-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
}

.data-display {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-display h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.3rem;
}

.data-display pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  font-size: 12px;
  overflow: auto;
  max-height: 400px;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

@media (max-width: 768px) {
  .demo-header h2 {
    font-size: 1.5rem;
  }
  
  .demo-header p {
    font-size: 1rem;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .conditional-form {
    max-width: 100%;
  }
}
</style>
