<template>
  <a-form layout="vertical" :model="form" :style="{ width: '100%' }">
    <a-form-item field="name" tooltip="登录商户系统的账号" label="登录账号">
      <a-input v-model="form.name" placeholder="请输入登录账号" />
    </a-form-item>
    <a-form-item field="post" label="手机号码">
      <a-input v-model="form.post" placeholder="请输入手机号码" />
    </a-form-item>
    <a-form-item field="post" label="性别">
      <a-radio-group v-model="form.radio"> <a-radio value="1">男</a-radio>
        <a-radio value="2">女</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item field="post" label="真实姓名">
      <a-input v-model="form.post" placeholder="请输入真实姓名" />
    </a-form-item>
    <a-form-item field="post" label="密码">
      <a-input v-model="form.post" placeholder="请输入登录密码" />
    </a-form-item>
    <a-form-item field="post" label="确认密码">
      <a-input v-model="form.post" placeholder="请确认登录密码" />
    </a-form-item>


  </a-form>
</template>

<script setup lang="ts">
import { defineExpose, reactive } from "vue";
const props = defineProps(['userId'])

const form = reactive({
  name: '',
  post: '',
  isRead: false,
  radio: "1"
});


const onSubmit = () => {
  console.log(props.userId);
  return true;
};
defineExpose({ onSubmit });
</script>
<!-- 

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  components: {
  },
  props: {
    userId: { type: Number },

  }
})
export default class UserForm extends Vue {
  form = {
    name: '',
    post: '',
    isRead: false,
    radio: "1"
  };

  onSubmit() {
    return true;

  }

}
</script> -->

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.ctitle {
  padding-left: 15px;
  padding-top: 0px;
  text-align: left;
  font-size: large;
  font-weight: bold;
}

.cfield {
  font-size: large;
  font-weight: bold;
}

.van-field {
  padding: 0 0px;
}
</style>
