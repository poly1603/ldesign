<template>
  <div class="survey-demo">
    <div class="survey-header">
      <h2>📋 满意度调查问卷</h2>
      <p>感谢您参与本次调查！</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-text">完成进度: {{ progress }}%</div>
    </div>

    <div class="survey-form">
      <div class="question">
        <div class="question-title"><span class="num">1</span>您的年龄段？*</div>
        <RadioField v-model="survey.ageRange" :options="ageOptions" direction="vertical" @change="updateProgress" />
      </div>

      <div class="question">
        <div class="question-title"><span class="num">2</span>使用频率？*</div>
        <RadioField v-model="survey.frequency" :options="frequencyOptions" direction="vertical" @change="updateProgress" />
      </div>

      <div class="question">
        <div class="question-title"><span class="num">3</span>整体满意度？*</div>
        <RateField v-model="survey.rating" :count="5" showText :texts="ratingTexts" @change="updateProgress" />
      </div>

      <div class="question">
        <div class="question-title"><span class="num">4</span>您的建议？</div>
        <TextareaField v-model="survey.suggestion" placeholder="请详细描述您的建议..." :autosize="{ minRows: 4 }" />
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-primary" @click="handleSubmit">提交问卷</button>
        <button type="button" class="btn" @click="saveDraft">保存草稿</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { RadioField, RateField, TextareaField } from '../../../src/adapters/vue/components/fields'

const survey = reactive({
  ageRange: '',
  frequency: '',
  rating: 0,
  suggestion: ''
})

const ageOptions = [
  { label: '18-25岁', value: '18-25' },
  { label: '26-35岁', value: '26-35' },
  { label: '36-45岁', value: '36-45' },
  { label: '46岁以上', value: '46+' }
]

const frequencyOptions = [
  { label: '每天使用', value: 'daily' },
  { label: '每周几次', value: 'weekly' },
  { label: '每月几次', value: 'monthly' }
]

const ratingTexts = ['极差', '失望', '一般', '满意', '惊喜']

const progress = computed(() => {
  let answered = 0
  if (survey.ageRange) answered++
  if (survey.frequency) answered++
  if (survey.rating > 0) answered++
  if (survey.suggestion) answered++
  return Math.round((answered / 4) * 100)
})

const updateProgress = () => {
  // 进度自动更新
}

const handleSubmit = () => {
  if (!survey.ageRange || !survey.frequency || survey.rating === 0) {
    alert('请完成所有必填题')
    return
  }
  console.log('问卷数据:', survey)
  alert('提交成功！感谢您的参与')
}

const saveDraft = () => {
  localStorage.setItem('surveyDraft', JSON.stringify(survey))
  alert('草稿已保存')
}
</script>

<style scoped>
.survey-demo {
  max-width: 800px;
  margin: 0 auto;
}

.survey-header {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
}

.survey-header h2 {
  font-size: 24px;
  color: #722ED1;
  margin-bottom: 12px;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0 8px;
}

.progress-fill {
  height: 100%;
  background: #722ED1;
  transition: width 0.3s;
}

.progress-text {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.survey-form {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
}

.question {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.question:last-of-type {
  border-bottom: none;
}

.question-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
}

.num {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #722ED1;
  color: #fff;
  border-radius: 50%;
  font-size: 13px;
  margin-right: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 10px 24px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.btn-primary {
  background: #722ED1;
  border-color: #722ED1;
  color: #fff;
}
</style>



