<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { onMounted, ref } from 'vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const openFaq = ref<number | null>(null)

const faqs = ref([
  {
    question: 'How do I get started with LDesign Router?',
    answer: 'Simply install the package via npm and follow our getting started guide in the documentation.',
  },
  {
    question: 'Is LDesign Router compatible with Vue 3?',
    answer: 'Yes! LDesign Router is built specifically for Vue 3 and takes full advantage of the Composition API.',
  },
  {
    question: 'Can I use TypeScript with LDesign Router?',
    answer: 'Absolutely! LDesign Router is written in TypeScript and provides excellent type safety out of the box.',
  },
  {
    question: 'How do I handle authentication with the router?',
    answer: 'You can use navigation guards to implement authentication checks before allowing access to protected routes.',
  },
  {
    question: 'Does it support lazy loading?',
    answer: 'Yes, you can use dynamic imports to lazy load your route components for better performance.',
  },
])

// 方法
function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })

    // 更新 URL hash
    router.replace({ hash: `#${sectionId}` })
  }
}

function submitForm() {
  // 模拟表单提交
  alert(`Thank you, ${form.value.name}! Your message has been sent.`)

  // 重置表单
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }
}

function openMaps() {
  const address = encodeURIComponent('123 Tech Street, San Francisco, CA 94105')
  window.open(`https://maps.google.com/maps?q=${address}`, '_blank')
}

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index
}

// 生命周期
onMounted(() => {
  // 如果 URL 中有 hash，滚动到对应位置
  if (route.value.hash) {
    const sectionId = route.value.hash.substring(1)
    setTimeout(() => {
      scrollToSection(sectionId)
    }, 100)
  }
})
</script>

<template>
  <div class="contact">
    <h2>📞 Contact Us</h2>
    <p>This page demonstrates hash fragment navigation and scroll behavior.</p>

    <div class="contact-nav">
      <h3>Quick Navigation:</h3>
      <div class="nav-links">
        <a href="#form" @click.prevent="scrollToSection('form')">Contact Form</a>
        <a href="#info" @click.prevent="scrollToSection('info')">Contact Info</a>
        <a href="#map" @click.prevent="scrollToSection('map')">Location</a>
        <a href="#faq" @click.prevent="scrollToSection('faq')">FAQ</a>
      </div>
    </div>

    <section id="form" class="section">
      <h3>📝 Contact Form</h3>
      <div class="form-container">
        <form class="contact-form" @submit.prevent="submitForm">
          <div class="form-group">
            <label for="name">Name:</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              placeholder="Your full name"
            >
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="your.email@example.com"
            >
          </div>

          <div class="form-group">
            <label for="subject">Subject:</label>
            <select id="subject" v-model="form.subject" required>
              <option value="">
                Select a subject
              </option>
              <option value="general">
                General Inquiry
              </option>
              <option value="support">
                Technical Support
              </option>
              <option value="billing">
                Billing Question
              </option>
              <option value="feature">
                Feature Request
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="message">Message:</label>
            <textarea
              id="message"
              v-model="form.message"
              required
              rows="5"
              placeholder="Please describe your inquiry..."
            />
          </div>

          <button type="submit" class="submit-button">
            Send Message
          </button>
        </form>
      </div>
    </section>

    <section id="info" class="section">
      <h3>📍 Contact Information</h3>
      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">
            📧
          </div>
          <h4>Email</h4>
          <p>support@ldesign.com</p>
          <p>sales@ldesign.com</p>
        </div>

        <div class="info-card">
          <div class="info-icon">
            📞
          </div>
          <h4>Phone</h4>
          <p>+1 (555) 123-4567</p>
          <p>+1 (555) 987-6543</p>
        </div>

        <div class="info-card">
          <div class="info-icon">
            🏢
          </div>
          <h4>Office</h4>
          <p>123 Tech Street</p>
          <p>San Francisco, CA 94105</p>
        </div>

        <div class="info-card">
          <div class="info-icon">
            🕒
          </div>
          <h4>Hours</h4>
          <p>Mon-Fri: 9:00 AM - 6:00 PM</p>
          <p>Sat-Sun: 10:00 AM - 4:00 PM</p>
        </div>
      </div>
    </section>

    <section id="map" class="section">
      <h3>🗺️ Our Location</h3>
      <div class="map-container">
        <div class="map-placeholder">
          <div class="map-icon">
            🗺️
          </div>
          <p>Interactive Map</p>
          <p>123 Tech Street, San Francisco, CA</p>
          <button class="map-button" @click="openMaps">
            Open in Maps
          </button>
        </div>
      </div>
    </section>

    <section id="faq" class="section">
      <h3>❓ Frequently Asked Questions</h3>
      <div class="faq-list">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="faq-item"
          :class="{ open: openFaq === index }"
          @click="toggleFaq(index)"
        >
          <div class="faq-question">
            <span>{{ faq.question }}</span>
            <span class="faq-toggle">{{ openFaq === index ? '−' : '+' }}</span>
          </div>
          <div v-show="openFaq === index" class="faq-answer">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="hash-info">
      <h3>Current Hash:</h3>
      <p>{{ $route.hash || 'No hash' }}</p>
      <p><small>Try clicking the navigation links above to see hash changes</small></p>
    </div>
  </div>
</template>

<style scoped>
.contact {
  max-width: 800px;
  margin: 0 auto;
}

.contact-nav {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-links a {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav-links a:hover {
  background: #0056b3;
}

.section {
  margin-bottom: 4rem;
  padding: 2rem 0;
  border-bottom: 1px solid #e9ecef;
}

.section:last-of-type {
  border-bottom: none;
}

.form-container {
  max-width: 600px;
}

.contact-form {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.submit-button {
  padding: 1rem 2rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  justify-self: start;
}

.submit-button:hover {
  background: #218838;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.info-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.info-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.info-card h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.info-card p {
  margin: 0.25rem 0;
  color: #666;
}

.map-container {
  margin-top: 1rem;
}

.map-placeholder {
  height: 300px;
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.map-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.map-button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
}

.map-button:hover {
  background: #0056b3;
}

.faq-list {
  margin-top: 1rem;
}

.faq-item {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.faq-question {
  padding: 1rem;
  background: #f8f9fa;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.faq-question:hover {
  background: #e9ecef;
}

.faq-toggle {
  font-size: 1.2rem;
  font-weight: bold;
  color: #007bff;
}

.faq-answer {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e9ecef;
}

.faq-answer p {
  margin: 0;
  color: #666;
}

.hash-info {
  margin-top: 3rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  text-align: center;
}

.hash-info p {
  margin: 0.5rem 0;
}

.hash-info small {
  color: #666;
}
</style>
