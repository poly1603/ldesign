<template>
  <div>
    <LDesignForm :options="options" variant="entry" v-model="form" @change="onChange" />
    <Button @click="refresh">更新options</Button>
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Button, Select } from '@ldesign/desktop-next';
import { LDesignForm } from '@ldesign/form'
import { AddIcon } from '@ldesign/icons-vue-next';
import { LDesignPopFrame } from '@ldesign/layout';
import { ref, reactive, onMounted, computed } from 'vue';

const form = reactive({
  name: '',
  sex: '1',
  name1: ''
})

const visible = ref(false)

// const form = ref({
//   name: '',
//   sex: ''
// })

const list = ref([{
  label: '男',
  value: '0'
}, {
  label: '女',
  value: '1'
}])

const options = computed(() =>[{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    suffixIcon: () => <AddIcon onClick={() => {
      form.name = 'test'
    }} />
  }
}, {
  label: '性别',
  component: Select,
  name: 'sex',
  props: {
    options: list.value,
  }
}])

function onChange(v, ctx) {
}

function onClick() {
  visible.value = true
}

function refresh () {
  list.value = [{
  label: `男${Math.round(Math.random() * 100)}`,
  value: '0'
}, {
  label: '女',
  value: '1'
}]
}

onMounted(() => {
  setTimeout(() => {
    list.value = [{
      label: '男1',
      value: '0'
    }, {
      label: '女1',
      value: '1'
    }]
  }, 1000)
})

</script>