<template>
  <div>
    <LDesignForm :options="options" v-model="form" @change="onChange" />
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Button } from '@ldesign/desktop-next';
import { LDesignForm } from '@ldesign/form'
import { AddIcon } from '@ldesign/icons-vue-next';
import { LDesignPopFrame } from '@ldesign/layout';
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';

let instance
const form = reactive({
  name: '',
  test1: '',
  test2: ''
})

const visible = ref(false)

const opt1 = ref([])

const opt2 = ref([])

const options = computed(() => [{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    suffixIcon: () => <AddIcon onClick={() => {
      form.name = 'test'
    }} />
  }
}, {
  label: '测试1',
  component: RadioGroup,
  name: 'test1',
  props: {
    options: opt1.value,
    onChange (v) {
      opt2.value = v === '0' ? [{
        label: '前端开发',
        value: '0'
      }, {
        label: '后端开发',
        value: '1'
      }] : [{
        label: '前端开发1',
        value: '0'
      }, {
        label: '后端开发1',
        value: '1'
      }]
    }
  }
}, {
  label: '测试2',
  component: RadioGroup,
  name: 'test2',
  props: {
    options: opt2.value,
  }
}])

function onChange(v, ctx) {
  console.log(v, ctx)
}

function onClick() {
  visible.value = true
}

onMounted(() => {
  instance = setTimeout(() => {
    opt1.value = [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }]
    opt2.value = [{
      label: '前端开发',
      value: '0'
    }, {
      label: '后端开发',
      value: '1'
    }]
  }, 2000)
})

onUnmounted(() => {
  clearTimeout(instance)
})

</script>