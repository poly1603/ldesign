<template>
  <div>
    <LDesignForm
      :options="options"
      v-model="form"
      buttonPosition="block"
      @change="onChange"
      @submit="onSubmit"
    />
  </div>
</template>
<script lang="tsx" setup>
import {  RadioGroup } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref, reactive } from 'vue';


const form = reactive({
})

const visible = ref(false)

const options = ref<any[]>([{
  label: '启用情况',
  component: RadioGroup,
  name: 'loginstate',
  code: 'ORG_orgnature',
  span: 2,
  props: {
    defaultValue: '01',
  }
}])

function onChange (v, ctx) {
  // console.log(v, ctx)
}

function onSubmit (v, ctx) {
  console.log(v, ctx)
}

function onClick () {
  visible.value = true
}

</script>