<template>
  <div class="multi-step-form">
    <div class="form-header">
      <h2>{{ currentStepInfo.title }}</h2>
      <div class="progress-bar">
        <div 
          v-for="(step, index) in steps" 
          :key="step.name"
          class="step-indicator"
          :class="{
            'active': currentStepIndex === index,
            'completed': completedSteps.has(step.name),
            'error': stepErrors.has(step.name)
          }"
          @click="navigateToStep(index)"
        >
          <span class="step-number">{{ index + 1 }}</span>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Step 1: Personal Info -->
      <div v-if="currentStep === 'personal'" class="form-step">
        <div class="form-group">
          <label for="firstName">First Name *</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            required
            @blur="validateField('firstName')"
          />
          <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
        </div>

        <div class="form-group">
          <label for="lastName">Last Name *</label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            required
            @blur="validateField('lastName')"
          />
          <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            @blur="validateField('email')"
          />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="phone">Phone</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            @blur="validateField('phone')"
          />
          <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
        </div>
      </div>

      <!-- Step 2: Address -->
      <div v-if="currentStep === 'address'" class="form-step">
        <div class="form-group">
          <label for="street">Street Address *</label>
          <input
            id="street"
            v-model="formData.street"
            type="text"
            required
            @blur="validateField('street')"
          />
          <span v-if="errors.street" class="error">{{ errors.street }}</span>
        </div>

        <div class="form-group">
          <label for="city">City *</label>
          <input
            id="city"
            v-model="formData.city"
            type="text"
            required
            @blur="validateField('city')"
          />
          <span v-if="errors.city" class="error">{{ errors.city }}</span>
        </div>

        <div class="form-group">
          <label for="state">State/Province *</label>
          <input
            id="state"
            v-model="formData.state"
            type="text"
            required
            @blur="validateField('state')"
          />
          <span v-if="errors.state" class="error">{{ errors.state }}</span>
        </div>

        <div class="form-group">
          <label for="zipCode">Zip/Postal Code *</label>
          <input
            id="zipCode"
            v-model="formData.zipCode"
            type="text"
            required
            @blur="validateField('zipCode')"
          />
          <span v-if="errors.zipCode" class="error">{{ errors.zipCode }}</span>
        </div>

        <div class="form-group">
          <label for="country">Country *</label>
          <select
            id="country"
            v-model="formData.country"
            required
            @blur="validateField('country')"
          >
            <option value="">Select a country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="CN">China</option>
            <option value="JP">Japan</option>
            <option value="KR">South Korea</option>
            <option value="SG">Singapore</option>
          </select>
          <span v-if="errors.country" class="error">{{ errors.country }}</span>
        </div>
      </div>

      <!-- Step 3: Preferences -->
      <div v-if="currentStep === 'preferences'" class="form-step">
        <div class="form-group">
          <label>Communication Preferences *</label>
          <div class="checkbox-group">
            <label>
              <input
                v-model="formData.preferences.email"
                type="checkbox"
              />
              Email notifications
            </label>
            <label>
              <input
                v-model="formData.preferences.sms"
                type="checkbox"
              />
              SMS notifications
            </label>
            <label>
              <input
                v-model="formData.preferences.push"
                type="checkbox"
              />
              Push notifications
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="newsletter">Newsletter Frequency</label>
          <select id="newsletter" v-model="formData.newsletterFrequency">
            <option value="never">Never</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div class="form-group">
          <label for="language">Preferred Language</label>
          <select id="language" v-model="formData.language">
            <option value="en">English</option>
            <option value="zh">Chinese</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
          </select>
        </div>

        <div class="form-group">
          <label for="timezone">Timezone</label>
          <select id="timezone" v-model="formData.timezone">
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="CST">Central Time</option>
            <option value="PST">Pacific Time</option>
            <option value="GMT">GMT</option>
            <option value="JST">Japan Time</option>
            <option value="CST_CN">China Time</option>
          </select>
        </div>
      </div>

      <!-- Step 4: Review -->
      <div v-if="currentStep === 'review'" class="form-step">
        <div class="review-section">
          <h3>Personal Information</h3>
          <dl>
            <dt>Name:</dt>
            <dd>{{ formData.firstName }} {{ formData.lastName }}</dd>
            <dt>Email:</dt>
            <dd>{{ formData.email }}</dd>
            <dt>Phone:</dt>
            <dd>{{ formData.phone || 'Not provided' }}</dd>
          </dl>
        </div>

        <div class="review-section">
          <h3>Address</h3>
          <dl>
            <dt>Street:</dt>
            <dd>{{ formData.street }}</dd>
            <dt>City:</dt>
            <dd>{{ formData.city }}</dd>
            <dt>State/Province:</dt>
            <dd>{{ formData.state }}</dd>
            <dt>Zip/Postal Code:</dt>
            <dd>{{ formData.zipCode }}</dd>
            <dt>Country:</dt>
            <dd>{{ formData.country }}</dd>
          </dl>
        </div>

        <div class="review-section">
          <h3>Preferences</h3>
          <dl>
            <dt>Notifications:</dt>
            <dd>
              <span v-if="formData.preferences.email">Email </span>
              <span v-if="formData.preferences.sms">SMS </span>
              <span v-if="formData.preferences.push">Push </span>
              <span v-if="!formData.preferences.email && !formData.preferences.sms && !formData.preferences.push">None</span>
            </dd>
            <dt>Newsletter:</dt>
            <dd>{{ formData.newsletterFrequency }}</dd>
            <dt>Language:</dt>
            <dd>{{ formData.language }}</dd>
            <dt>Timezone:</dt>
            <dd>{{ formData.timezone }}</dd>
          </dl>
        </div>

        <div class="form-group">
          <label>
            <input
              v-model="formData.agreeToTerms"
              type="checkbox"
              required
            />
            I agree to the terms and conditions
          </label>
          <span v-if="errors.agreeToTerms" class="error">{{ errors.agreeToTerms }}</span>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="form-navigation">
        <button
          v-if="currentStepIndex > 0"
          type="button"
          class="btn btn-secondary"
          @click="previousStep"
          :disabled="isNavigating"
        >
          Previous
        </button>

        <button
          v-if="currentStepIndex < steps.length - 1"
          type="button"
          class="btn btn-primary"
          @click="nextStep"
          :disabled="!canProceed || isNavigating"
        >
          Next
        </button>

        <button
          v-if="currentStepIndex === steps.length - 1"
          type="submit"
          class="btn btn-success"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>

        <button
          type="button"
          class="btn btn-link"
          @click="saveAndExit"
        >
          Save & Exit
        </button>
      </div>
    </form>

    <!-- Auto-save indicator -->
    <div v-if="autoSaveStatus" class="auto-save-status">
      {{ autoSaveStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMultiStepForm } from '../features/form-route/composables'

interface FormData {
  // Personal Info
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Address
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  
  // Preferences
  preferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
  newsletterFrequency: string
  language: string
  timezone: string
  
  // Review
  agreeToTerms: boolean
}

const router = useRouter()
const route = useRoute()

// Initialize form data
const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  preferences: {
    email: true,
    sms: false,
    push: false
  },
  newsletterFrequency: 'monthly',
  language: 'en',
  timezone: 'UTC',
  agreeToTerms: false
}

// Form steps configuration
const steps = [
  { name: 'personal', label: 'Personal Info', title: 'Personal Information' },
  { name: 'address', label: 'Address', title: 'Address Information' },
  { name: 'preferences', label: 'Preferences', title: 'Communication Preferences' },
  { name: 'review', label: 'Review', title: 'Review & Submit' }
]

// Form state
const formData = ref<FormData>({ ...initialFormData })
const errors = ref<Record<string, string>>({})
const currentStep = ref(steps[0].name)
const currentStepIndex = computed(() => steps.findIndex(s => s.name === currentStep.value))
const currentStepInfo = computed(() => steps[currentStepIndex.value])
const completedSteps = ref(new Set<string>())
const stepErrors = ref(new Set<string>())
const isNavigating = ref(false)
const isSubmitting = ref(false)
const autoSaveStatus = ref('')

// Use form route management
const { 
  hasUnsavedChanges, 
  saveForm, 
  loadForm,
  clearForm,
  validateStep,
  isStepValid,
  canNavigateAway
} = useFormRoute('multi-step-form', {
  formData: formData.value,
  currentStep: currentStep.value
})

// Validation rules
const validationRules: Record<string, (value: any) => string | null> = {
  firstName: (value) => !value ? 'First name is required' : null,
  lastName: (value) => !value ? 'Last name is required' : null,
  email: (value) => {
    if (!value) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !emailRegex.test(value) ? 'Invalid email format' : null
  },
  phone: (value) => {
    if (!value) return null // Optional field
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return !phoneRegex.test(value) ? 'Invalid phone format' : null
  },
  street: (value) => !value ? 'Street address is required' : null,
  city: (value) => !value ? 'City is required' : null,
  state: (value) => !value ? 'State/Province is required' : null,
  zipCode: (value) => !value ? 'Zip/Postal code is required' : null,
  country: (value) => !value ? 'Country is required' : null,
  agreeToTerms: (value) => !value ? 'You must agree to the terms' : null
}

// Validate single field
const validateField = (fieldName: string) => {
  const value = fieldName.includes('.')
    ? fieldName.split('.').reduce((obj, key) => obj?.[key], formData.value as any)
    : (formData.value as any)[fieldName]
    
  const validator = validationRules[fieldName]
  if (validator) {
    const error = validator(value)
    if (error) {
      errors.value[fieldName] = error
    } else {
      delete errors.value[fieldName]
    }
  }
}

// Validate current step
const validateCurrentStep = (): boolean => {
  const stepFields = getStepFields(currentStep.value)
  let isValid = true
  
  stepFields.forEach(field => {
    validateField(field)
    if (errors.value[field]) {
      isValid = false
    }
  })
  
  if (isValid) {
    stepErrors.value.delete(currentStep.value)
  } else {
    stepErrors.value.add(currentStep.value)
  }
  
  return isValid
}

// Get fields for a step
const getStepFields = (stepName: string): string[] => {
  switch (stepName) {
    case 'personal':
      return ['firstName', 'lastName', 'email', 'phone']
    case 'address':
      return ['street', 'city', 'state', 'zipCode', 'country']
    case 'preferences':
      return []
    case 'review':
      return ['agreeToTerms']
    default:
      return []
  }
}

// Navigation
const canProceed = computed(() => {
  if (currentStep.value === 'review') {
    return formData.value.agreeToTerms
  }
  return !stepErrors.value.has(currentStep.value)
})

const isFormValid = computed(() => {
  return completedSteps.value.size === steps.length - 1 && 
         formData.value.agreeToTerms &&
         stepErrors.value.size === 0
})

const navigateToStep = async (stepIndex: number) => {
  if (isNavigating.value) return
  
  const targetStep = steps[stepIndex]
  if (!targetStep) return
  
  // Validate current step before leaving
  if (stepIndex > currentStepIndex.value) {
    if (!validateCurrentStep()) {
      return
    }
  }
  
  isNavigating.value = true
  
  try {
    // Mark current step as completed if valid
    if (validateCurrentStep()) {
      completedSteps.value.add(currentStep.value)
    }
    
    // Navigate to new step
    currentStep.value = targetStep.name
    
    // Update route
    await router.push({
      ...route.value,
      query: { ...route.value.query, step: targetStep.name }
    })
  } finally {
    isNavigating.value = false
  }
}

const nextStep = () => {
  if (currentStepIndex.value < steps.length - 1) {
    navigateToStep(currentStepIndex.value + 1)
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    navigateToStep(currentStepIndex.value - 1)
  }
}

// Auto-save functionality
const autoSave = async () => {
  try {
    autoSaveStatus.value = 'Saving...'
    await saveForm({
      formData: formData.value,
      currentStep: currentStep.value,
      completedSteps: Array.from(completedSteps.value)
    })
    autoSaveStatus.value = 'Saved'
    setTimeout(() => {
      autoSaveStatus.value = ''
    }, 2000)
  } catch (error) {
    autoSaveStatus.value = 'Save failed'
    console.error('Auto-save failed:', error)
  }
}

// Save and exit
const saveAndExit = async () => {
  await autoSave()
  router.push('/')
}

// Submit form
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Clear form data
    await clearForm()
    
    // Navigate to success page
    await router.push('/success')
  } catch (error) {
    console.error('Form submission failed:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Watch for form changes and auto-save
let autoSaveTimer: NodeJS.Timeout | null = null
watch(formData, () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = setTimeout(autoSave, 3000)
}, { deep: true })

// Load saved form data on mount
onMounted(async () => {
  const savedData = await loadForm()
  if (savedData) {
    formData.value = savedData.formData || formData.value
    currentStep.value = savedData.currentStep || currentStep.value
    if (savedData.completedSteps) {
      completedSteps.value = new Set(savedData.completedSteps)
    }
  }
  
  // Check for step in route query
  const stepQuery = route.value.query.step as string
  if (stepQuery && steps.some(s => s.name === stepQuery)) {
    currentStep.value = stepQuery
  }
})

// Clean up on unmount
onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>

<style scoped>
.multi-step-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 0;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition: all 0.3s;
}

.step-indicator:hover .step-number {
  transform: scale(1.1);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.step-indicator.active .step-number {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.step-indicator.completed .step-number {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.step-indicator.error .step-number {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.step-label {
  font-size: 0.875rem;
  color: #666;
}

.step-indicator.active .step-label {
  color: #007bff;
  font-weight: 600;
}

.form-step {
  min-height: 300px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.review-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.review-section h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

.review-section dl {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 0.5rem;
  margin: 0;
}

.review-section dt {
  font-weight: 600;
  color: #666;
}

.review-section dd {
  margin: 0;
  color: #333;
}

.form-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-link {
  background: none;
  color: #007bff;
  text-decoration: underline;
}

.btn-link:hover {
  color: #0056b3;
}

.auto-save-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>