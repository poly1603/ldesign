<template>
  <div>
    <LDesignForm :options="options" variant="entry" v-model="form" @change="onChange" />
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Button } from '@ldesign/desktop-next';
import { LDesignForm, type LDesignFormOptions } from '@ldesign/form'
import { AddIcon } from '@ldesign/icons-vue-next';
import { LDesignPopFrame } from '@ldesign/layout';
import { ref, reactive, onMounted } from 'vue';

let form = reactive({
  name: '',
  sex: '',
  name1: ''
})

const visible = ref(false)

// const form = ref({
//   name: '',
//   sex: ''
// })

const options = ref<LDesignFormOptions[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    suffixIcon: () => <AddIcon onClick={() => {
      form.name = 'test'
    }} />
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name1',
  props: {
  }
}, {
  label: '性别',
  component: RadioGroup,
  name: 'sex',
  props: {
    options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }],
  }
}])

function onChange(v, ctx) {
}

function onClick() {
  visible.value = true
}

onMounted(() => {
  // 模拟请求
  setTimeout(() => {
    Object.assign(form, {
      name: 'ceshi',
      name1: '你好',
      sex: '0'
    })
  }, 2000)
})

</script>