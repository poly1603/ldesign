<template>
  <div>
    <LDesignForm
      :options="options"
      v-model="form"
      @change="onChange"
      @submit="onSubmit"
    />
  </div>
</template>
<script lang="tsx" setup>
import { SearchParameters } from '@ldesign/base';
import { Select } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { request } from '@ldesign/request';
import { ref, reactive } from 'vue';


const form = reactive({
})

const visible = ref(false)

const options = ref<any[]>([{
  label: '自定义请求加载代码表',
  component: Select,
  name: 'customLoadSelect',
  load: async () => {
    const par = new SearchParameters()
    par.setName('organcategory')
    const res = await request.post({
      name: 'ORG_commonSearchs',
      data: {
        par
      }
    })
    return res?.result
  },
  props: {
    defaultValue: 'S9246',
    keys: {
      'label': 'categoryname',
      'value': 'categorycode'
    }
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