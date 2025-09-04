<template>
  <div>
    <h4>插槽方式</h4>
    <LDesignForm :options="options" :preview-rows="1" @expand="onExpand">
      <template #expand="{expand, visible}">
        <Button variant="text" @click="expand()">{{ visible ? '收起' : '展开' }}</Button>
      </template>
    </LDesignForm>
    <h4>属性方式</h4>
    <LDesignForm :options="options" :preview-rows="1" :expand="['show', 'hide']" @expand="onExpand">
    </LDesignForm>
    <br />
    <LDesignForm :options="options" :preview-rows="1" :expand="expand" @expand="onExpand">
    </LDesignForm>
    <h4>函数方式</h4>
    <LDesignForm :options="options" :preview-rows="1" :expand="renderCustomExpand" @expand="onExpand">
    </LDesignForm>
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Button } from '@ldesign/desktop-next';
import { LDesignForm } from '@ldesign/form'
import { ChevronDownIcon, ChevronUpIcon } from '@ldesign/icons-vue-next';
import { ref } from 'vue';

const expand = ref([
  {
    default: '展开',
    icon: () => <ChevronDownIcon />
  },
  {
    default: '收起',
    icon: () => <ChevronUpIcon />
  }
])

const options = ref([{
  label: '姓名',
  component: Input,
  name: 'name'
}, {
  label: '姓名1',
  component: Input,
  name: 'name1'
}, {
  label: '姓名2',
  component: Input,
  name: 'name2'
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
    }]
  }
}])

function renderCustomExpand(_, ctx) {
  return (
    <Button variant="text" onClick={ctx.expand}>{ctx.visible ? '收起' : '展开'}</Button>
  )
}

function onExpand(value) {
  console.log(value)
}

</script>