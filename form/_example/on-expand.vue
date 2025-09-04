<template>
  <div>
    <LDesignForm v-model="value1" :options="options1" :preview-rows="1" @visible-change="onVisibleChange"/>
  </div>
</template>
<script lang="tsx" setup>
import { Divider, Input, RadioGroup, Button} from '@ldesign/desktop-next';
import { LDesignForm } from '@ldesign/form'
import { AddIcon } from '@ldesign/icons-vue-next';
import { ref, reactive } from 'vue';

const options1 = ref<any[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    suffixIcon: () => <AddIcon onClick={() => {
    }} />,
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name1',
  props: {
    value: '1',
    suffixIcon: () => <AddIcon onClick={() => {
    }} />,
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name2',
  props: {
    value: '1',
    suffixIcon: () => <AddIcon onClick={() => {
    }} />,
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name3',
  props: {
    value: '1',
    suffixIcon: () => <AddIcon onClick={() => {
    }} />,
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name4',
  props: {
    value: '1',
    suffixIcon: () => <AddIcon onClick={() => {
    }} />,
  }
}])

let value1 = reactive({
  name: '312312',
  name1: '23'
})

function onVisibleChange(v) {
  console.log(v)
}

</script>